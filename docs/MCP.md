# Household COO MCP

## Implementation

Household COO self-hosts a real Model Context Protocol server inside the existing Next.js application. The endpoint is **`/api/mcp`** (locally `http://localhost:3000/api/mcp`; after deploying this change, `https://household-coo-amazon.vercel.app/api/mcp`). The official `@modelcontextprotocol/sdk` server and client negotiate **`2025-11-25`**, the SDK's latest supported protocol version. Older versions supported by the SDK can also negotiate; unsupported version headers are rejected.

The transport is **Streamable HTTP**, using `WebStandardStreamableHTTPServerTransport` on the Node runtime. It accepts JSON-RPC POST requests and responds with JSON (`enableJsonResponse: true`). This is the JSON response option of Streamable HTTP, not the legacy HTTP+SSE transport. GET returns 405: this server does not offer a standalone server-notification SSE stream. Initialization notifications receive 202. There are no persistent transport sessions or MCP-Session-Id headers, event storage, or resumable streams.

Each HTTP request creates and closes its own SDK server and transport. Each browser operation uses the official `Client` and `StreamableHTTPClientTransport`, initializes, calls a tool, and closes. This trades a few small requests for simple serverless operation. No separate process, external API, Echo, or private Alexa+ toolkit is required.

## Tools

| Tool | Result |
| --- | --- |
| `get_household_week` | Current items, decisions, and all five radar groups |
| `get_urgent_items` | Outstanding urgent obligations |
| `get_conflicts` | Parent assignment interval overlaps |
| `get_preparation_items` | Preparation reminders |
| `get_deferrable_items` | Items outside the fixed demo week |
| `explain_item` | Item including source, consequence, and next action |
| `assign_parent` | Updated plan for a specified item and Alex/Jamie |
| `complete_item` | Updated plan with `completed: true` or `false` (undo) |
| `chat_household` | Existing multi-turn agent reply, citations, and optional local decisions |

Every tool accepts optional `items` (up to eight synthetic records) and `decisions` (validated local overrides). Omit both to use the original demo. The three item-specific tools require `id`; assignment also requires `parent`, completion requires `completed`. Chat requires `messages` with `role` and `content`. Tool discovery exposes JSON input schemas and read/write annotations. Invalid inputs return MCP tool errors.

Tools use the existing `analyzeHousehold`, `applyDecisions`, `validateDecisions`, and agent/provider interfaces. They do not duplicate priority or conflict algorithms. The chat tool preserves supported intent handling and conversation history, including follow-up explanations and explicit conversational reassignment.

## Browser flow and persistence

The simulated Alexa+ browser experience is an MCP **host/client**; it is not an actual Amazon Alexa+ runtime integration. On restoration and after a source scan, it calls `get_household_week`. All submitted chat messages call `chat_household`; parent dropdown changes call `assign_parent`; completion and undo call `complete_item`. Returned plan updates drive the existing dashboard. Rendering still uses the shared local reasoning function, allowing the initial dashboard to display immediately. Source inspection and ingestion retain their existing fixtures and `/api/scan` service. `/api/chat` remains available for compatibility but the browser chat uses MCP.

State travels in each tool request. Mutation tools return a new plan; they do not change a server-global household. The browser stores completion and assignment overrides in its existing localStorage key. Reload and rescan retain them; reset restores the baseline. Other clients must retain and send returned decisions themselves. No external calendars, payments, emails, or accounts are modified.

Mock mode remains the default: `HOUSEHOLD_AI_PROVIDER=mock` (or unset). MCP is real even when the reasoning provider is mock. Optional `bedrock` mode uses the same MCP transport but the existing server-side Bedrock agent and scan extractor. See [Bedrock setup](BEDROCK_SETUP.md). MCP adds no required secrets or environment variables. Agent failures are reported; they do not silently fall back or overwrite the plan.

## Run and test

```sh
npm ci
npm run dev
```

Visit the app and run the README demo flow. In browser Developer Tools → Network, filter `mcp`. Expect `initialize`, `notifications/initialized`, and `tools/call` POST requests, protocol header `MCP-Protocol-Version: 2025-11-25` after initialization, and no chat POST to `/api/chat`. A GET 405 from the SDK's optional notification-stream probe is expected.

The following CLI commands use the real protocol. Set the endpoint to a deployed URL when testing Vercel. Accept must include both JSON and event-stream even though this server chooses JSON responses.

```sh
MCP_URL=http://localhost:3000/api/mcp
curl -sS "$MCP_URL" -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"manual-test","version":"1"}}}'
curl -sS "$MCP_URL" -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -H 'MCP-Protocol-Version: 2025-11-25' --data '{"jsonrpc":"2.0","method":"notifications/initialized"}'
curl -sS "$MCP_URL" -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -H 'MCP-Protocol-Version: 2025-11-25' --data '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
curl -sS "$MCP_URL" -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -H 'MCP-Protocol-Version: 2025-11-25' --data '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_urgent_items","arguments":{}}}'
curl -sS "$MCP_URL" -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -H 'MCP-Protocol-Version: 2025-11-25' --data '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"assign_parent","arguments":{"id":"dentist","parent":"Alex"}}}'
curl -sS "$MCP_URL" -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -H 'MCP-Protocol-Version: 2025-11-25' --data '{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"get_conflicts","arguments":{"decisions":[{"id":"dentist","resource":"Alex"}]}}}'
```

Expect two urgent items, then an updated assignment result with zero conflicts, and a zero-conflict read when that decision is sent back. A default read without decisions still shows the original conflict. Browser decisions are not changed by CLI calls.

```sh
npm test
npm run typecheck
npm run build
```

`tests/mcp.test.ts` covers initialization, notification, discovery, every read tool, real SDK client interoperability, browser client/chat follow-up, reassignment, completion/undo, caller isolation, input validation, Origin checking, oversized requests, and version rejection. Existing tests remain in place.

## Deployment and scope

The endpoint fits Vercel's existing Next.js Node/serverless deployment. No database, additional server, session affinity, or filesystem writes are required. This is not a static export. Verify the deployed endpoint and browser flows after the new commit is deployed; a local build does not prove production deployment.

The endpoint intentionally has no authentication and serves only synthetic demo records. Browser calls must be same-origin (cross-origin Origin headers are rejected); command-line MCP clients without Origin are accepted. There is no wildcard CORS. This is not production-ready access control for real family data. The existing per-process Bedrock burst limiter also applies to MCP chat; it is not a global spending cap.

The implementation provides a working self-hosted MCP/Streamable HTTP demonstration. It does not establish acceptance by the hackathon or compatibility with a private Alexa+ client, which has not been tested. Live AWS usage/documentation verification, repository license or private judging access, submission fields, eligibility declarations, and the public video remain separate submission requirements.
