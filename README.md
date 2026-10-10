# Household COO

A browser-based **Simulated Alexa+ Experience** for Amazon’s Build, Ship, Shape 2026 Alexa+ track. Household COO answers: “What does our family need to deal with this week?”

## Run locally

Requires Node.js 20.9+ and npm (tested with Node 24).

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No authentication, AWS, MCP, API key, or external AI service is required. The demo uses a fixed week, May 18–24, 2026, so deadlines remain consistent whenever it is presented. Fonts have system fallbacks.

```sh
npm test
npm run typecheck
npm run build
npm start
```

## Demo flow

1. Open Family Radar: two urgent obligations, one scheduling conflict, four upcoming events, preparation reminders, and two tasks that can wait.
2. Click **Scan demo sources**. The simulated scan reads ten source fixtures (six emails, two calendar entries, two documents), produces eight household items, and skips two informational notices. Browse Household sources and click a notice to see its original message and extracted recommendation.
3. Ask “What does our family need to deal with this week?”
4. Follow up with “What is most urgent?” then “Why is that important?” The agent explains the prior recommendations and shows source notices.
5. Ask “What conflicts do we have?” and “What do I need to do tonight?”
6. Ask “What can wait?” Click any radar card for its source, rationale, and next action.
7. Explore This week and Household sources, filter by family member, or reset the conversation.

The Morgan household includes parents Alex and Jamie, Ella (10), and Noah (7). Eight synthetic household items cover school emails, a permission form, calendar events, a dental notice, a utility bill, soccer, a birthday invitation, and home/library reminders. Recommended actions are suggestions: the app does not send messages, pay bills, or alter bookings.

## Architecture

- `src/lib/household.ts`: typed synthetic source notices and demo date.
- `src/lib/sources.ts`: synthetic inbox/calendar/document fixtures, `SourceConnector` and `ObligationExtractor` interfaces, and a simulated ingestion pipeline with source-to-item provenance. The mock extractor returns prepared fixture results; it does not perform natural-language extraction. Replace the connector to fetch authorized real sources and the extractor to process their contents.
- `src/app/api/scan/route.ts`: runs the demo ingestion pipeline and returns household items plus scan counts.
- `src/lib/reasoning.ts`: UI-independent deadline grouping and interval overlap detection for shared parent assignments.
- `src/lib/agent.ts`: `AgentService` interface and deterministic `MockAgentService`. The mock recognizes supported conversational intents and uses preceding assistant recommendations for follow-up explanations.
- `src/app/api/chat/route.ts`: validated, server-side chat endpoint. Replace the `agent` implementation with an `AgentService` provider to add a real LLM later; keep credentials and calls server-side. Pass local source records and conversation history to your provider and validate its output.
- `src/components/dashboard.tsx`: responsive dashboard, family filters, notice details, navigation, chat, loading/error states, and source citations.
- `tests/agent.test.ts`: meaningful checks for classification, conflict resolution, main conversational flow, and unsupported actions.

All data is local and synthetic; conversations live in browser memory and reset on reload. The mock is a constrained simulation, not a general-purpose model or Alexa integration. Avoid entering real sensitive household data. No real account connector or actual Alexa skill is included. The demo connector reads local fixtures only. Gmail, Google Calendar, Drive, drafts, and attachments are not accessed. Real connections should be optional: keep the demo available without signing in, and add an authorized read-only connection flow as a separate integration.

## Deploy

### Automatic deployment from GitHub (recommended)

1. Open https://vercel.com/new and sign in with the GitHub account that owns this repository.
2. If Vercel asks for GitHub repository access, grant access to `arongreenburg-dev/household-coo-amazon`. You can select just this repository.
3. Find `household-coo-amazon` in the import list and click **Import**.
4. Name the project `household-coo` (or another available name). Confirm **Framework Preset: Next.js** and **Root Directory: `./`**. Leave the build and output settings at their defaults. No environment variables are required.
5. Click **Deploy**. When it finishes, open **Visit** and copy the generated website address.
6. Verify Family Radar appears, **Scan demo sources** reports ten notices and eight items, and chat answers “What is most urgent?” followed by “Why is that important?”

Vercel's Git integration should use `main` as the production branch. Pushes to `main` then trigger builds and update the same production address; other branches can produce preview deployments. Confirm this under the project's Git settings if updates do not appear. A failed build does not replace the last successful production deployment; inspect the deployment build logs.

The site contains synthetic data only and requires no authentication. Its mock chat and scan endpoints run on the server; no account connection or secret values are included. Cloud Shell does not have to keep running once this deployment is verified. Conversations are temporary and reset on page reload.

### Other Node hosts

Run `npm ci && npm run build`, then `npm start`. Set `PORT` if your host requires a custom port. The chat and scan endpoints require a Node/serverless runtime; static-only export is not supported.

## Hackathon presentation

Show the fixed-week dashboard, ask the core question, explain the dentist/soccer conflict, and finish with tonight’s plan. The visible simulation label keeps the prototype’s scope clear. This project is a standalone demo and is not an Amazon-endorsed product or a live Alexa+ integration.
