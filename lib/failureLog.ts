/** One job: never let a failure vanish. Structured log to stderr (Vercel captures it),
 * best-effort to a local file in dev. Import and call from every catch and self-check degrade. */

export interface FailureRecord {
  stage: string; // e.g. "fetch", "extract", "self_check", "api/scan"
  message: string;
  context?: Record<string, unknown>;
  ts: string; // ISO
}

export function logFailure(
  stage: string,
  error: unknown,
  context?: Record<string, unknown>,
): FailureRecord {
  const record: FailureRecord = {
    stage,
    message: error instanceof Error ? error.message : String(error),
    context,
    ts: new Date().toISOString(),
  };

  // Always: stderr as structured JSON (captured by Vercel logs).
  console.error("[verity-lex:failure]", JSON.stringify(record));

  // Best-effort local file (dev only; serverless FS is read-only outside /tmp).
  if (process.env.NODE_ENV !== "production") {
    void appendLocal(record);
  }

  return record;
}

async function appendLocal(record: FailureRecord): Promise<void> {
  try {
    const { appendFile, mkdir } = await import("node:fs/promises");
    await mkdir("logs", { recursive: true });
    await appendFile("logs/failures.log", JSON.stringify(record) + "\n");
  } catch {
    // Swallow: logging must never throw.
  }
}
