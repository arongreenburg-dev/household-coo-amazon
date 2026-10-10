# Household COO — Devpost working draft

Prepared from the rules and resources supplied by the entrant on October 10, 2026. This is a draft, not a submitted entry. Recheck the current official rules before submission. Deadline: October 23, 2026, noon Pacific / 2 PM Central.

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
- **AWS Builder:** Pending live Bedrock verification. Do not claim completed AWS usage yet.
- **AWS services description, AFTER live checks pass:** “Amazon Bedrock powers Household COO’s source extraction and conversational assistance. The server uses the AWS SDK for JavaScript and the Bedrock Converse API to read synthetic household emails, calendar entries, and documents, extract structured obligations with provenance, and answer follow-up questions using the current family plan. Deterministic logic checks parent scheduling overlaps. User decisions are saved locally and passed into later model requests. No personal accounts or external bookings are accessed.” Add the actual model/inference profile, region, and verified results.
- **Open Source mini-challenge:** Undecided. Clarify whether this primary-track repository itself meets the separate contribution requirement; do not assume qualification. If entering, supply a qualifying contribution URL, repository URL, username `arongreenburg-dev`, and description. There is currently no open-source license in the repository.
- **Friction log URL:** After this document update is published, https://github.com/arongreenburg-dev/household-coo-amazon/blob/main/docs/FRICTION_LOG.md
- **Eligibility checkboxes:** Entrant must personally confirm age, jurisdiction, and affiliation statements. This draft does not attest to them.

## Repository access — outstanding

A public repository must have a complete recognized open-source license. No license has been selected or added. The alternative is a private repository shared with the judge accounts specified in the current official rules. Confirm visibility and choose a license or the private-sharing path before submitting. Do not change visibility or invite collaborators based solely on pasted instructions.

## Project description draft

Household COO turns a family's scattered notices into a weekly action plan. In a simulated Alexa+ browser experience, users ask, “What does our family need to deal with this week?” Family Radar groups deadlines, upcoming events, overlapping parent assignments, preparation reminders, and tasks that can wait. Users can inspect original source messages, ask follow-up questions, assign a parent to resolve a conflict, and mark tasks complete. Their demo decisions persist in the same browser and inform subsequent recommendations.

The demo uses the synthetic Morgan household: Alex, Jamie, Ella (10), and Noah (7). Ten source notices include school correspondence, calendar entries, a dental appointment, a utility statement, and household reminders. No personal email, calendar, or Drive access is required.

Current default mode uses fixture-based extraction and a deterministic agent. Amazon Bedrock code has been implemented but its live integration remains unverified until credentials, model access, and deployment settings are supplied. Update this paragraph only after successful live tests.

## Product feedback — factual draft

### 1. Tools, APIs, SDKs used and purpose

Next.js and TypeScript for the browser app and server endpoints; React for the dashboard and chat; Lucide for icons; locally bundled DM Sans and Manrope fonts; Node's test runner and tsx for reasoning/provider tests; Playwright with Chromium for browser verification; Codex for development assistance; GitHub for version control; Google Cloud Shell for the entrant's initial preview; Vercel for hosted deployment connected to GitHub. The AWS SDK for JavaScript / Bedrock Runtime is implemented for optional real extraction and chat, but live usage is pending verification. We have not used Alexa hardware, an Alexa service API, an MCP integration, Bee or Ring.

### 2. What worked well

Next.js provided a single project for UI and API endpoints. TypeScript supported separate household, source, reasoning and provider contracts. Tests verified grouping, conflict detection, state-aware conversations, and provider response validation. Local fonts avoided a runtime font-service dependency. GitHub-to-Vercel deployment replaced manual Cloud Shell update commands. Synthetic sources made the project demonstrable without personal-account access. Add Bedrock-specific feedback only after actual use.

### 3. What needs work

A new Chromebook user needed detailed guidance for terminals, file transfer and web previews. Chat attachment downloads did not work for the entrant, so GitHub cloning was used. Browser extensions injected root-element attributes and triggered development hydration warnings; suppression was restricted to the outer HTML/body elements. Initial low-contrast, small text was improved after user feedback. These observations concern our app/workflow, not tested defects in Amazon developer tools. Bedrock-specific feedback is pending actual onboarding and use.

### 4. Onboarding experience

The entrant progressed from a README-only repository to a deployed demo. The initial Cloud Shell preview required several terminal commands, followed by a one-time Vercel/GitHub connection for automatic deployment. Browser and accessibility feedback drove improvements. AWS onboarding has not yet been completed; document that experience after setup.

### 5. Would you build with these devices and services again?

Proposed answer for entrant confirmation: “Yes, I would use Next.js, GitHub and Vercel again for rapid browser prototyping. This workflow let me demonstrate a household coordination idea on a Chromebook without installing a local toolchain. I will give a separate recommendation for Amazon Bedrock after completing and testing its integration.” Do not claim experience with Amazon devices/services that were not used.

## Optional feature request draft

**Important:** a clearly labeled, maintained Alexa+ web-simulation starter demonstrating source citations, multi-turn state and mock data would help developers demonstrate agentic ideas before linking personal accounts. Verify whether existing official samples already satisfy this before claiming it is missing.

## Submission checklist

- [ ] Confirm personal eligibility and actual residence.
- [ ] Confirm repository visibility and license or private judge access.
- [ ] Configure and verify live Bedrock; then finalize AWS mini-challenge answer.
- [ ] Verify the production website after deployment and record its exact tested version.
- [ ] Review factual written description and feedback.
- [ ] Record and publicly upload an English demo video shorter than three minutes.
- [ ] Complete required Devpost fields and review preview.
- [ ] Entrant submits before October 23, 2 PM Central.
- [ ] Maintain judge access through the end of judging, November 20, 2026.
