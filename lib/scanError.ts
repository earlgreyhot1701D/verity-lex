/** Maps provider failures to safe, actionable scan API errors without exposing raw messages. */
export function scanError(error: unknown): { status: number; code: string; message: string } {
  const message = error instanceof Error ? error.message : "";
  if (/no credits|insufficient_quota|quota exceeded/i.test(message)) {
    return { status: 503, code: "PROVIDER_QUOTA", message: "Live scanning is unavailable because the AI provider has no credits remaining. Please load the cached sample; the site operator must restore provider credits." };
  }
  if (/429/.test(message)) return { status: 503, code: "PROVIDER_BUSY", message: "The scan provider is rate limited. Please try again later or load the cached sample." };
  if (/401|403/.test(message)) return { status: 503, code: "PROVIDER_AUTH", message: "Live scanning is unavailable because provider authentication failed. Please load the cached sample." };
  if (/timeout|timed out|aborted|deadline/i.test(message)) return { status: 504, code: "SCAN_TIMEOUT", message: "The scan exceeded its time limit. Please try again or load the cached sample." };
  return { status: 500, code: "SCAN_FAILED", message: "The public-record scan could not be completed. Please try again or load the cached sample." };
}
