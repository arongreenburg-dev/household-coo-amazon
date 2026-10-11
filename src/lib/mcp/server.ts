import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { items } from '../household';
import { analyzeHousehold } from '../reasoning';
import { applyDecisions, decisionsFrom, validateDecisions } from '../decisions';
import { validateHouseholdItems } from '../bedrock';
import { getAgent, providerMode } from '../services';
import { takeBedrockRequest } from '../request-budget';

// Request-carried state keeps the public demo isolated across browsers and serverless instances.
const context = { items: z.array(z.record(z.string(), z.unknown())).max(8).optional(), decisions: z.array(z.record(z.string(), z.unknown())).max(8).optional() };
const id = z.enum(['permission', 'dentist', 'soccer', 'bill', 'museum', 'birthday', 'filter', 'library']);
function plan(args: { items?: unknown; decisions?: unknown }) {
  return applyDecisions(args.items ? validateHouseholdItems(args.items) : items, validateDecisions(args.decisions ?? []));
}
function result(value: Record<string, unknown>) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value) }], structuredContent: value };
}
const readOnly = { readOnlyHint: true, destructiveHint: false, openWorldHint: false };
const localWrite = { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false };
export function createHouseholdMcpServer() {
  const server = new McpServer({ name: 'household-coo', version: '0.1.0' });
  server.registerTool('get_household_week', { description: 'Analyze the current synthetic household plan. Returns all five Family Radar sections.', inputSchema: context, annotations: readOnly }, async args => {
    const data = plan(args);
    return result({ items: data, radar: analyzeHousehold(data), decisions: decisionsFrom(data) });
  });
  for (const [name, section, description] of [
    ['get_urgent_items', 'attention', 'Get outstanding deadlines that need attention this demo week.'],
    ['get_conflicts', 'conflicts', 'Find overlapping events assigned to the same parent.'],
    ['get_preparation_items', 'prepare', 'Get outstanding items that require preparation.'],
    ['get_deferrable_items', 'wait', 'Get obligations that can wait until after this demo week.'],
  ] as const) {
    server.registerTool(name, { description, inputSchema: context, annotations: readOnly }, async args => result({ [section]: analyzeHousehold(plan(args))[section] }));
  }
  server.registerTool('explain_item', { description: 'Explain an item with its source, consequence, and recommended action.', inputSchema: { ...context, id }, annotations: readOnly }, async args => {
    const item = plan(args).find(item => item.id === args.id);
    if (!item) throw new Error('Item is not in the current plan.');
    return result({ item });
  });
  server.registerTool('assign_parent', { description: 'Assign Alex or Jamie to a demo event. Returns the updated plan; the client must persist it. Does not edit external calendars.', inputSchema: { ...context, id, parent: z.enum(['Alex', 'Jamie']) }, annotations: localWrite }, async args => {
    const data = plan(args);
    if (!data.find(item => item.id === args.id)?.resource) throw new Error('This item does not support parent assignment.');
    const changes = validateDecisions([{ id: args.id, resource: args.parent }]);
    const updated = applyDecisions(data, changes);
    return result({ items: updated, decisions: decisionsFrom(updated), radar: analyzeHousehold(updated) });
  });
  server.registerTool('complete_item', { description: 'Mark a demo task complete or incomplete (undo). Returns the updated plan; the client must persist it. Does not make payments or bookings.', inputSchema: { ...context, id, completed: z.boolean() }, annotations: localWrite }, async args => {
    const data = plan(args);
    if (!data.some(item => item.id === args.id)) throw new Error('Item is not in the current plan.');
    const updated = applyDecisions(data, validateDecisions([{ id: args.id, completed: args.completed }]));
    return result({ items: updated, decisions: decisionsFrom(updated), radar: analyzeHousehold(updated) });
  });
  server.registerTool('chat_household', { description: 'Multi-turn household conversation using the existing mock or Bedrock agent and current plan. Explicit parent assignments return local decisions.', inputSchema: { ...context, messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(10000) })).min(1).max(30) }, annotations: { ...localWrite, idempotentHint: false } }, async args => {
    const data = plan(args);
    if (args.messages.reduce((sum, message) => sum + message.content.length, 0) > 20000) throw new Error('Conversation is too long.');
    if (providerMode() === 'bedrock' && !takeBedrockRequest()) throw new Error('The demo AI request limit was reached. Wait a minute and try again.');
    try { return result({ ...await getAgent().reply(args.messages, data) }); }
    catch { throw new Error('The household agent could not complete the request. Check provider configuration and try again.'); }
  });
  return server;
}
