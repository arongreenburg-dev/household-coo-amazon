# Household COO — Devpost working draft

Prepared from the rules and resources supplied by the entrant on October 10, 2026. This is a draft, not a submitted entry. Current Devpost form and saved submission were reviewed October 22, 2026. Deadline: October 23, 2026, noon Pacific / 2 PM Central.

## Additional info fields

- **Submitter type:** Individual, if submitting personally rather than on behalf of a team/organization. Entrant must confirm.
- **Organization:** N/A, if not representing an organization.
- **Country / Canadian province:** Entrant must supply their actual residence. Do not infer from timezone or devices.
- **Primary track:** Alexa+ — simulated browser experience.
- **Repository:** https://github.com/arongreenburg-dev/household-coo-amazon
- **Testing link:** https://household-coo-amazon.vercel.app/
- **New or existing:** New. Repository and implementation were created October 10, 2026, within the submission window. Entrant should confirm whether any earlier work needs disclosure.
- **Existing-project updates:** N/A if confirmed new.
- **File upload:** The copied form does not mark this field required. Source repository and testing link are supplied separately; upload an artifact only if requested by the current instructions. A video link is still required in the appropriate project details field.
- **AWS Builder:** Live Bedrock scan and source-cited chat verified October 18, 2026 using Amazon Nova Micro (`amazon.nova-micro-v1:0`) in `us-east-1`. See `docs/BEDROCK_SETUP.md` for evidence and remaining checks.
- **AWS services description, AFTER live checks pass:** “Amazon Bedrock powers Household COO’s source extraction and conversational assistance. The server uses the AWS SDK for JavaScript and the Bedrock Converse API to read synthetic household emails, calendar entries, and documents, extract structured obligations with provenance, and answer follow-up questions using the current family plan. Deterministic logic checks parent scheduling overlaps. User decisions are saved locally and passed into later model requests. No personal accounts or external bookings are accessed.” Add the actual model/inference profile, region, and verified results.
- **Open Source mini-challenge:** No, as saved in Devpost. There is currently no open-source license in the repository; the required repository license/judge-access decision remains separate from this optional mini-challenge.
- **Friction log URL:** After this document update is published, https://github.com/arongreenburg-dev/household-coo-amazon/blob/main/docs/FRICTION_LOG.md
- **Eligibility checkboxes:** Entrant must personally confirm age, jurisdiction, and affiliation statements. This draft does not attest to them.

## Repository access — outstanding

A public repository must have a complete recognized open-source license. No license has been selected or added. The alternative is a private repository shared with the judge accounts specified in the current official rules. Confirm visibility and choose a license or the private-sharing path before submitting. Do not change visibility or invite collaborators based solely on pasted instructions.

## Project description draft

Household COO turns a family's scattered notices into a weekly action plan. In a simulated Alexa+ browser experience, users ask, “What does our family need to deal with this week?” Family Radar groups deadlines, upcoming events, overlapping parent assignments, preparation reminders, and tasks that can wait. Users can inspect original source messages, ask follow-up questions, assign a parent to resolve a conflict, and mark tasks complete. Their demo decisions persist in the same browser and inform subsequent recommendations.

The demo uses the synthetic Morgan household: Alex, Jamie, Ella (10), and Noah (7). Ten source notices include school correspondence, calendar entries, a dental appointment, a utility statement, and household reminders. No personal email, calendar, or Drive access is required.

The production deployment uses Amazon Bedrock Nova Micro for real extraction and source-cited conversation. A local checkout still defaults to mock mode without credentials. Live scanning of ten synthetic documents produced eight obligations and skipped two informational notices. Deterministic interval logic detects parent conflicts and local assignments resolve them. Model wording and prioritization can vary; dedicated preparation cards are not guaranteed on every extraction.

## Product feedback — factual draft

### 1. Tools, APIs, SDKs used and purpose

Next.js and TypeScript for the browser app and server endpoints; React for the dashboard and chat; Lucide for icons; locally bundled DM Sans and Manrope fonts; Node's test runner and tsx for reasoning/provider tests; Playwright with Chromium for browser verification; Codex for development assistance; GitHub for version control; Google Cloud Shell for the entrant's initial preview; Vercel for hosted deployment connected to GitHub. The AWS SDK for JavaScript / Bedrock Runtime and Converse API power verified production extraction and chat through Amazon Nova Micro in us-east-1. The official MCP TypeScript SDK provides a real self-hosted Streamable HTTP server at `/api/mcp` and a browser MCP client, using protocol `2025-11-25`; tools reuse household reasoning and local decisions. We have not used Alexa hardware, an Alexa service API, Bee or Ring. See `docs/MCP.md` for implementation and protocol testing.

### 2. What worked well

Next.js provided a single project for UI and API endpoints. TypeScript supported separate household, source, reasoning and provider contracts. Tests verified grouping, conflict detection, state-aware conversations, and provider response validation. Local fonts avoided a runtime font-service dependency. GitHub-to-Vercel deployment replaced manual Cloud Shell update commands. Synthetic sources made the project demonstrable without personal-account access. Live Bedrock feedback and integration observations are now documented in `docs/FRICTION_LOG.md` and saved in Devpost.

### 3. What needs work

A new Chromebook user needed detailed guidance for terminals, file transfer and web previews. Chat attachment downloads did not work for the entrant, so GitHub cloning was used. Browser extensions injected root-element attributes and triggered development hydration warnings; suppression was restricted to the outer HTML/body elements. Initial low-contrast, small text was improved after user feedback. These observations concern our app/workflow, not tested defects in Amazon developer tools. Live onboarding, authentication, output-validation and current-state observations are documented in `docs/FRICTION_LOG.md`.

### 4. Onboarding experience

The entrant progressed from a README-only repository to a deployed demo. The initial Cloud Shell preview required several terminal commands, followed by a one-time Vercel/GitHub connection for automatic deployment. Browser and accessibility feedback drove improvements. AWS account activation and Bedrock setup were completed; production extraction and conversation were verified October 18 and October 22. Actual onboarding feedback is saved in Devpost.

### 5. Would you build with these devices and services again?

Proposed answer for entrant confirmation: “Yes, I would use Amazon Bedrock again for this focused text-based household workflow, with output validation and deterministic scheduling checks alongside the model. I would also reuse Next.js, TypeScript, MCP, GitHub and Vercel for browser-based development and deployment.” Do not claim experience with Amazon devices/services that were not used.

## Optional feature request draft

**Important:** a clearly labeled, maintained Alexa+ web-simulation starter demonstrating source citations, multi-turn state and mock data would help developers demonstrate agentic ideas before linking personal accounts. Verify whether existing official samples already satisfy this before claiming it is missing.

## Submission checklist

- [x] Devpost residence and eligibility fields are completed by the entrant; saved form reviewed October 22.
- [ ] Confirm repository visibility and license or private judge access.
- [x] Configure live Bedrock and verify production scan, chat, citations, assignment and multi-turn checks.
- [x] Verify production website: application commit `1a5e48ddffd1cd330c916529700f7fba7e023360`; deployment Ready; live scans and recorded walkthrough successful October 22.
- [x] Review factual written description and feedback; current 21-test count and testing instructions saved in Devpost.
- [x] Public English demo video (1:47): https://youtu.be/XYiC3sc6x5w .
- [x] Required Devpost content fields saved, including video, gallery captions, app/repository links and testing instructions. Devpost shows 4/5 steps done; final agreement is unchecked.
- [ ] Entrant submits before October 23, 2 PM Central.
- [ ] Maintain judge access through the end of judging, November 20, 2026.
