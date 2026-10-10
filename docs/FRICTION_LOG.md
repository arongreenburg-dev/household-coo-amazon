# Development friction log

Observed during the Household COO build on October 10, 2026. These are actual app/development-workflow observations, not invented Amazon SDK defects. AWS-specific entries will be added only after actual Bedrock onboarding. No secrets or personal account data are included.

| Task | Steps and expected result | Actual result | Severity | Workaround | Suggested improvement |
| --- | --- | --- | --- | --- | --- |
| Install dependencies in the development workspace | Run npm install; expect downloaded packages | Default npm cache location was not writable | Medium | Set npm cache to a writable workspace path | Document writable-cache configuration for restricted development environments |
| Move the demo to a Chromebook / Cloud Shell | Download the chat ZIP and upload it | Entrant reported downloads did not work after multiple attempts | High | Push code to GitHub; clone directly in Cloud Shell | Offer a reliable repository-based handoff alongside artifact downloads |
| Find the Cloud Shell upload/preview controls | Open terminal and find upload and preview | Multiple three-dot menus and an existing Google project confused a first-time user | Medium | Provide step-by-step instructions; use port 8080 web preview | Provide screenshots or clearly distinguish browser and terminal toolbar controls |
| Read the initial UI | Open desktop preview; expect readable dashboard and chat | Entrant found text too small and green text/background difficult to read | High | Increase main text to 16px; darken labels; use charcoal chat text on white | Adopt readable contrast and type sizes before demo handoff |
| Hydrate React with writing extensions active | Open dev preview; expect clean startup | Grammarly and another extension inserted HTML/body attributes and triggered hydration warnings | Medium | Restrict suppressHydrationWarning to outer HTML/body; retain checks in app content; simulate extension mutations in a browser check | Distinguish extension attribute mutations from application hydration defects in diagnostics |
| Keep the preview updated | Push improvements; expect entrant to see latest version | Separate Cloud Shell checkout required repeated pull/restart commands | Medium | Connect GitHub repository to Vercel for deployment | Prefer automatic deployment for browser-only prototype collaboration |
| Verify the public Vercel deployment from the development workspace | Request homepage and functional endpoints | Workspace network proxy rejected the Vercel domain with a tunnel-level 403 | Medium | Entrant tested live chat and follow-up; local production browser tests verified app flows | Show required destination allowlist settings when a hosted preview cannot be reached |

Potential bonus eligibility is determined by organizers; inclusion of this log does not guarantee a judging bonus. This log does not report product experience with Amazon services before they have been used.
