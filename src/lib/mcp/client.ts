import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { HouseholdItem } from '../household';
import { decisionsFrom } from '../decisions';
import type { AgentReply, Message } from '../agent';

/** Real MCP host/client, independent of the mock vs Bedrock reasoning provider. */
export async function callHouseholdTool<T>(name: string, args: Record<string, unknown>, endpoint: URL = new URL('/api/mcp', window.location.origin)): Promise<T> {
  const client = new Client({ name: 'household-coo-simulated-alexa', version: '0.1.0' });
  const transport = new StreamableHTTPClientTransport(endpoint);
  try {
    await client.connect(transport);
    const reply = await client.callTool({ name, arguments: args }, undefined, { timeout: 60000 });
    if (reply.isError) {
      const content = reply.content as { type: string; text?: string }[];
      throw new Error(content.find(block => block.type === 'text')?.text ?? 'The MCP tool failed.');
    }
    if (!reply.structuredContent) throw new Error('The MCP tool returned no structured result.');
    return reply.structuredContent as T;
  } finally { await client.close(); }
}
export const planArguments = (data: HouseholdItem[]) => ({ items: data, decisions: decisionsFrom(data) });
export const chatViaMcp = (messages: Message[], data: HouseholdItem[]) => callHouseholdTool<AgentReply>('chat_household', { ...planArguments(data), messages });
export type PlanResult = { items: HouseholdItem[]; decisions: ReturnType<typeof decisionsFrom> };
