# Amazon Bedrock setup — live production verification

The application now includes server-side Amazon Bedrock SDK integration for **both chat and obligation extraction**, via `BedrockRuntimeClient` and `ConverseCommand`. The extractor batches ten synthetic documents into one request. The mock remains the default and does not call AWS.

**Status (October 18, 2026):** Live production scan and chat verified at https://household-coo-amazon.vercel.app/ using Amazon Nova Micro (`amazon.nova-micro-v1:0`) in `us-east-1`. Ten synthetic sources produced eight obligations and skipped two informational notices. Requiring complete appointment intervals restored detection of the 15-minute overlap; an explicit Alex dentist assignment resolved the dashboard conflict. Chat supplied source citations. Authentication fix: `539d8bc`; extraction validation: `303c901`; regression case: `2bf661f`.

Live model wording and prioritization vary. Preparation details may remain in descriptions instead of dedicated preparation cards. A deterministic guard added in `513ebc4` prevents stale model prose from reviving a resolved parent conflict. Live follow-up correctly reported Alex on dentist duty and Jamie on soccer duty. Marking the permission form complete then asking for urgency correctly recommended the electricity bill, excluding the completed form. Refresh restored the saved assignment. The October 18 verification passed the tests and production build available then. Updated October 22 checks passed all 21 automated tests and TypeScript checks; production deployment of application commit `1a5e48ddffd1cd330c916529700f7fba7e023360` was Ready. Two live production scans returned ten sources, eight obligations and two informational notices. The completed 1:47 demo is publicly available at https://youtu.be/XYiC3sc6x5w .

## Configure when ready

1. Use your own AWS account and select a region with access to a text model supporting the Bedrock **Converse API** and system messages. Confirm the model's access requirements, availability, and pricing in the Bedrock console. Use the exact model or inference profile ID provided there; model access and cross-region inference requirements vary.
2. Use either a Bedrock API key supported by your account or dedicated least-privilege AWS credentials. Do not use root credentials. Restrict model invocation permissions to the required model/inference profile and applicable underlying models. This app performs inference only; it does not create AWS resources.
3. In Vercel, open the Household COO project → Settings → Environment Variables. Add these for Production:

| Name | Value |
| --- | --- |
| `HOUSEHOLD_AI_PROVIDER` | `bedrock` |
| `AWS_REGION` | Your selected region |
| `BEDROCK_MODEL_ID` | Your enabled Converse-compatible model or inference profile ID |
| `AWS_BEARER_TOKEN_BEDROCK` | Your Bedrock API key, entered securely, if using API-key authentication |

Alternatively, omit the bearer-token variable and securely configure `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` (plus `AWS_SESSION_TOKEN` for temporary credentials). The SDK uses its normal credential provider chain. Temporary credentials and API keys can expire; rotate them in Vercel as needed. Never put secret values in Git, a README, client code, screenshots, or chat. Do not prefix them with `NEXT_PUBLIC_`.

4. Redeploy the production deployment so the environment variables take effect. The UI should say **Amazon Bedrock mode**. That label only identifies the configured mode; it does not prove a live call succeeded.
5. Run the live checks below. If they fail, inspect Vercel function logs, AWS model access, IAM permissions, region, credential expiry, and provider response compatibility.

## Live verification

- Click **Scan demo sources**. Expect a successful scan of ten documents, with extracted obligations visible on the dashboard. Real model extraction may produce different wording or grouping from the mock; compare every result against its source message. The model must not invent deadlines or amounts.
- Ask “What does our family need to deal with this week?” then “What is most urgent?” and “Why is that important?” Verify responses and citations.
- Say “Alex can take Noah to the dentist.” The explicit local assignment should resolve the original parent conflict. Ask about conflicts again and confirm the current plan is used.
- Open a task and mark it complete. Ask for urgent tasks; the completed task should no longer be recommended as pending.
- Check the AWS console for successful inference usage and record model, region, test date and observed results for the submission. Never document credential values.

The extraction schema is currently scoped to this fixed May 2026 synthetic household, stable source IDs, and up to eight primary obligations. It is not an arbitrary real-inbox importer. Personal accounts are not connected. Neither agent can send messages, make payments, or change external calendars.

## Request bounds and costs

Chat history is limited to 20,000 characters, with fixed output-token bounds (1,500 chat, 4,000 extraction). The SDK uses `maxAttempts: 2`. In addition, invalid or incomplete extraction output receives at most one validation-repair attempt when the first attempt finishes within twelve seconds. Persistent validation failures leave the current plan unchanged; authentication/service failures do not trigger this extraction-repair attempt. Public Bedrock endpoints have a best-effort limit of ten requests per minute **per running process**; `BEDROCK_REQUEST_LIMIT_PER_MINUTE` changes it. Vercel can run multiple processes, so this is not a global quota or a hard spending cap. Configure appropriate AWS usage controls and billing alerts before enabling the public demo. AWS budget alerts notify you; they do not automatically stop all spending.

To return to the mock, set `HOUSEHOLD_AI_PROVIDER=mock` and redeploy. When Bedrock is selected, failures are shown explicitly; the app does not silently substitute mock responses.
