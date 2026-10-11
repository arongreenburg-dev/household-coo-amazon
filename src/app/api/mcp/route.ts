import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createHouseholdMcpServer } from '@/lib/mcp/server';
export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  // Reject cross-origin browser calls. No-Origin requests support CLI/judge clients.
  const url = new URL(request.url);
  const host = request.headers.get('host') ?? url.host;
  const protocol = request.headers.get('x-forwarded-proto') ?? url.protocol.slice(0, -1);
  const expectedOrigin = `${protocol}://${host}`;
  if (origin && origin !== expectedOrigin) return Response.json({ error: 'Origin is not allowed.' }, { status: 403 });
  const server = createHouseholdMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true, maxRequestBodySize: 100000 });
  try {
    await server.connect(transport);
    return await transport.handleRequest(request);
  } finally { await server.close(); }
}
// Streamable HTTP allows a server without a standalone notification/SSE stream.
export async function GET() { return new Response(null, { status: 405, headers: { Allow: 'POST' } }); }
export async function DELETE() { return new Response(null, { status: 405, headers: { Allow: 'POST' } }); }
