# Development friction log

Observed during the Household COO build on October 10–22, 2026. These are actual integration and app/development-workflow observations, not claims of Amazon service outages or SDK defects. No secrets or personal account data are included.

| Task | Steps and expected result | Actual result | Severity | Workaround | Suggested improvement |
| --- | --- | --- | --- | --- | --- |
| Install dependencies in the development workspace | Run npm install; expect downloaded packages | Default npm cache location was not writable | Medium | Set npm cache to a writable workspace path | Document writable-cache configuration for restricted development environments |
| Move the demo to a Chromebook / Cloud Shell | Download the chat ZIP and upload it | Entrant reported downloads did not work after multiple attempts | High | Push code to GitHub; clone directly in Cloud Shell | Offer a reliable repository-based handoff alongside artifact downloads |
| Find the Cloud Shell upload/preview controls | Open terminal and find upload and preview | Multiple three-dot menus and an existing Google project confused a first-time user | Medium | Provide step-by-step instructions; use port 8080 web preview | Provide screenshots or clearly distinguish browser and terminal toolbar controls |
| Read the initial UI | Open desktop preview; expect readable dashboard and chat | Entrant found text too small and green text/background difficult to read | High | Increase main text to 16px; darken labels; use charcoal chat text on white | Adopt readable contrast and type sizes before demo handoff |
| Hydrate React with writing extensions active | Open dev preview; expect clean startup | Grammarly and another extension inserted HTML/body attributes and triggered hydration warnings | Medium | Restrict suppressHydrationWarning to outer HTML/body; retain checks in app content; simulate extension mutations in a browser check | Distinguish extension attribute mutations from application hydration defects in diagnostics |
| Keep the preview updated | Push improvements; expect entrant to see latest version | Separate Cloud Shell checkout required repeated pull/restart commands | Medium | Connect GitHub repository to Vercel for deployment | Prefer automatic deployment for browser-only prototype collaboration |
| Verify the public Vercel deployment from the development workspace | Request homepage and functional endpoints | Workspace network proxy rejected the Vercel domain with a tunnel-level 403 | Medium | Entrant tested live chat and follow-up; local production browser tests verified app flows | Show required destination allowlist settings when a hosted preview cannot be reached |

## Live AWS integration observations — October 18–22

| Task | Steps and expected result | Actual result | Severity | Workaround | Suggested improvement |
| --- | --- | --- | --- | --- | --- |
| Authenticate the deployed Bedrock client | Configure a restricted Bedrock API key and invoke Converse from the server | Our initial authentication-scheme identifier was incorrect, resulting in credential-provider failures | High | Corrected the SDK bearer authentication configuration and verified production calls | Include an end-to-end bearer-key SDK example alongside playground instructions |
| Extract usable appointment intervals | Scan the ten synthetic notices and detect the parent overlap | Some model output omitted appointment intervals, hiding an otherwise valid scheduling conflict | High | Tightened extraction instructions and validation; regression cases protect the source-grounded intervals | Keep a schema example with required interval fields and validate before applying extracted items |
| Preserve current assignments in follow-up answers | Assign Alex to the dentist and ask about conflicts again | Earlier model prose could repeat the old conflict | High | Deterministic conflict answers now use the current computed assignments | Pass explicit current state and calculate scheduling facts outside free-form model prose |
| Repeat source scanning while recording | Click Scan demo sources; expect a successful extraction | October 22 production logs showed `Invalid model field: reason`; the app rejected the incomplete response and retained the current plan | High | Added one bounded validation-repair attempt, regression coverage, and a clear retry message; subsequent live scans succeeded | Explain validation failures separately from credential/configuration failures and retain the prior plan |

Potential bonus eligibility is determined by organizers; inclusion of this log does not guarantee a judging bonus. This log does not report product experience with Amazon services before they have been used.
