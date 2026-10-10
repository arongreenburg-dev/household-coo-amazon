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
2. Ask “What does our family need to deal with this week?”
3. Follow up with “What is most urgent?” then “Why is that important?” The agent explains the prior recommendations and shows source notices.
4. Ask “What conflicts do we have?” and “What do I need to do tonight?”
5. Ask “What can wait?” Click any radar card for its source, rationale, and next action.
6. Explore This week and Household sources, filter by family member, or reset the conversation.

The Morgan household includes parents Alex and Jamie, Ella (10), and Noah (7). Eight synthetic records cover school emails, a permission form, calendar events, a dental notice, a utility bill, soccer, a birthday invitation, and home/library reminders. Recommended actions are suggestions: the app does not send messages, pay bills, or alter bookings.

## Architecture

- `src/lib/household.ts`: typed synthetic source notices and demo date.
- `src/lib/reasoning.ts`: UI-independent deadline grouping and interval overlap detection for shared parent assignments.
- `src/lib/agent.ts`: `AgentService` interface and deterministic `MockAgentService`. The mock recognizes supported conversational intents and uses preceding assistant recommendations for follow-up explanations.
- `src/app/api/chat/route.ts`: validated, server-side chat endpoint. Replace the `agent` implementation with an `AgentService` provider to add a real LLM later; keep credentials and calls server-side. Pass local source records and conversation history to your provider and validate its output.
- `src/components/dashboard.tsx`: responsive dashboard, family filters, notice details, navigation, chat, loading/error states, and source citations.
- `tests/agent.test.ts`: meaningful checks for classification, conflict resolution, main conversational flow, and unsupported actions.

All data is local and synthetic; conversations live in browser memory and reset on reload. The mock is a constrained simulation, not a general-purpose model or Alexa integration. Avoid entering real sensitive household data. No data connector or actual Alexa skill is included.

## Deploy

For Vercel, import this repository, select Next.js, and use the defaults (`npm run build`, framework-managed output). No environment variables are needed. Or deploy on any Node host: run `npm ci && npm run build`, then `npm start`. Set `PORT` if your host requires a custom port. The chat endpoint requires a Node/serverless runtime; static-only export is not supported.

## Hackathon presentation

Show the fixed-week dashboard, ask the core question, explain the dentist/soccer conflict, and finish with tonight’s plan. The visible simulation label keeps the prototype’s scope clear. This project is a standalone demo and is not an Amazon-endorsed product or a live Alexa+ integration.
