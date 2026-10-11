import test from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { POST, GET, DELETE } from '../src/app/api/mcp/route';
import { callHouseholdTool } from '../src/lib/mcp/client';

const endpoint = new URL('http://localhost:3000/api/mcp');
const headers = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', 'MCP-Protocol-Version': '2025-11-25' };
async function rpc(body: unknown, extra: Record<string, string> = {}) {
  return POST(new Request(endpoint, { method: 'POST', headers: { ...headers, ...extra }, body: JSON.stringify(body) }));
}
const call = (name: string, args = {}) => rpc({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } });
async function value(name: string, args = {}) {
  const response = await call(name, args);
  assert.equal(response.status, 200);
  const message = await response.json();
  assert.equal(message.error, undefined);
  assert.equal(message.result.isError, undefined);
  return message.result.structuredContent;
}

test('MCP initializes with 2025-11-25, accepts initialized notification, and lists meaningful tools', async () => {
  const response = await rpc({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'judge', version: '1' } } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('mcp-session-id'), null);
  const { result } = await response.json();
  assert.equal(result.protocolVersion, '2025-11-25');
  assert.equal(result.serverInfo.name, 'household-coo');
  assert.ok(result.capabilities.tools);
  const initialized = await rpc({ jsonrpc: '2.0', method: 'notifications/initialized' });
  assert.equal(initialized.status, 202);
  const listed = await rpc({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
  const { result: { tools } } = await listed.json();
  assert.deepEqual(tools.map((tool: { name: string }) => tool.name).sort(), ['get_household_week', 'get_urgent_items', 'get_conflicts', 'get_preparation_items', 'get_deferrable_items', 'explain_item', 'assign_parent', 'complete_item', 'chat_household'].sort());
  assert.equal(tools.find((tool: { name: string }) => tool.name === 'assign_parent').annotations.readOnlyHint, false);
});

test('MCP read tools use the existing prioritization, conflicts, and source explanations', async () => {
  const week = await value('get_household_week');
  assert.equal(week.items.length, 8);
  assert.deepEqual((await value('get_urgent_items')).attention.map((item: { id: string }) => item.id), ['permission', 'bill']);
  assert.equal((await value('get_conflicts')).conflicts.length, 1);
  assert.equal((await value('get_preparation_items')).prepare.length, 4);
  assert.equal((await value('get_deferrable_items')).wait.length, 2);
  const explained = await value('explain_item', { id: 'permission' });
  assert.match(explained.item.reason, /signed form/);
  assert.match(explained.item.source, /Oakwood/);
});

test('MCP assignments, completion and undo preserve decisions and isolate callers', async () => {
  const assigned = await value('assign_parent', { id: 'dentist', parent: 'Alex' });
  assert.equal(assigned.radar.conflicts.length, 0);
  const completed = await value('complete_item', { decisions: assigned.decisions, id: 'permission', completed: true });
  assert.deepEqual(completed.radar.attention.map((item: { id: string }) => item.id), ['bill']);
  assert.equal(completed.radar.conflicts.length, 0);
  const restored = await value('get_household_week', { decisions: completed.decisions });
  assert.equal(restored.radar.attention.length, 1);
  const undone = await value('complete_item', { decisions: completed.decisions, id: 'permission', completed: false });
  assert.equal(undone.radar.attention.length, 2);
  assert.equal(undone.radar.conflicts.length, 0);
  const untouched = await value('get_household_week');
  assert.equal(untouched.radar.conflicts.length, 1);
  assert.equal(untouched.radar.attention.length, 2);
});

test('official Streamable HTTP client negotiates and calls tools across independent requests', async () => {
  const observed: { method: string; version: string | null }[] = [];
  const client = new Client({ name: 'simulated-alexa-test', version: '1' });
  const transport = new StreamableHTTPClientTransport(endpoint, { fetch: async (input, init) => {
    const request = new Request(input, init);
    observed.push({ method: request.method, version: request.headers.get('MCP-Protocol-Version') });
    return request.method === 'POST' ? POST(request) : GET();
  } });
  try {
    await client.connect(transport);
    assert.equal((await client.listTools()).tools.length, 9);
    const reply = await client.callTool({ name: 'get_conflicts', arguments: {} });
    assert.equal((reply.structuredContent as { conflicts: unknown[] }).conflicts.length, 1);
    assert.ok(observed.some(request => request.method === 'POST' && request.version === '2025-11-25'));
  } finally { await client.close(); }
});

test('browser MCP client calls chat with current saved state and preserves multi-turn explanations', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const request = new Request(input, init);
    return request.method === 'POST' ? POST(request) : GET();
  };
  try {
    const urgent = await callHouseholdTool<{ content: string; sources: string[] }>('chat_household', { messages: [{ role: 'user', content: 'What is most urgent?' }] }, endpoint);
    assert.match(urgent.content, /permission form/);
    const explanation = await callHouseholdTool<{ content: string }>('chat_household', { messages: [{ role: 'user', content: 'What is most urgent?' }, { role: 'assistant', content: urgent.content }, { role: 'user', content: 'Why is that important?' }] }, endpoint);
    assert.match(explanation.content, /cannot join/);
    assert.match(explanation.content, /late fee/);
    const assigned = await callHouseholdTool<{ decisions: unknown[] }>('chat_household', { messages: [{ role: 'user', content: 'Alex can take Noah to the dentist' }] }, endpoint);
    assert.equal((await value('get_conflicts', { decisions: assigned.decisions })).conflicts.length, 0);
  } finally { globalThis.fetch = originalFetch; }
});

test('MCP rejects unsafe origins, invalid plans, unsupported versions and oversized requests', async () => {
  assert.equal((await rpc({}, { Origin: 'https://untrusted.example' })).status, 403);
  const proxied = await POST(new Request('http://0.0.0.0:3000/api/mcp', { method: 'POST', headers: { ...headers, Host: 'household.example', 'x-forwarded-proto': 'https', Origin: 'https://household.example' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }) }));
  assert.equal(proxied.status, 200);
  assert.equal((await rpc({ jsonrpc: '2.0', id: 1, method: 'tools/list' }, { 'MCP-Protocol-Version': '2099-01-01' })).status, 400);
  const invalid = await (await call('assign_parent', { id: 'bill', parent: 'Alex' })).json();
  assert.equal(invalid.result.isError, true);
  const invalidDecision = await (await call('get_household_week', { decisions: [{ id: 'unknown', completed: true }] })).json();
  assert.equal(invalidDecision.result.isError, true);
  assert.equal((await POST(new Request(endpoint, { method: 'POST', headers, body: ' '.repeat(100001) }))).status, 413);
  assert.equal((await GET()).status, 405);
  assert.equal((await DELETE()).status, 405);
});
