// A best-effort per-process burst limit for public demo endpoints, not a global spending cap.
let windowStart = 0;
let requests = 0;
export function takeBedrockRequest(now = Date.now()): boolean {
 const configured = Number(process.env.BEDROCK_REQUEST_LIMIT_PER_MINUTE ?? 10);
 const limit = Number.isInteger(configured) && configured > 0 ? configured : 10;
 if (now - windowStart >= 60_000) { windowStart = now; requests = 0; }
 if (requests >= limit) return false;
 requests++;
 return true;
}
