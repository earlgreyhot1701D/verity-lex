/** Exposes cached and bounded live public-record scans with actionable provider failures. */

import { cachedSantaBarbaraScan } from "../../../data/mockScan.ts";
import { californiaSuperiorCourts } from "../../../data/courts.ca.ts";
import registryData from "../../../data/registry.v1.json" with { type: "json" };
import { runAgentLoop } from "../../../lib/agent/controller.ts";
import { logFailure } from "../../../lib/failureLog.ts";
import { createOpenAIModelClient } from "../../../lib/model/openai.ts";
import { scanError } from "../../../lib/scanError.ts";
import { createRateLimiter } from "../../../lib/rateLimit.ts";
import { evaluate, type Registry } from "../../../lib/ruleEngine/evaluate.ts";
import { validateScanInput } from "../../../lib/validate.ts";

export const maxDuration = 60;

const registry = registryData as Registry;
const scanLimiter = createRateLimiter({ limit: 5, windowMs: 60_000 });

interface ApiError {
  error: { code: string; message: string };
}

export async function GET(): Promise<Response> {
  return Response.json(cachedSantaBarbaraScan);
}

export async function POST(request: Request): Promise<Response> {
  const rateLimit = scanLimiter.check(clientIp(request));
  if (!rateLimit.allowed) {
    return Response.json(apiError("RATE_LIMITED", "Too many scan requests. Please try again shortly."), {
      status: 429,
      headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  if (!isRecord(body)) {
    return errorResponse(400, "INVALID_INPUT", "Request body must contain scan inputs.");
  }
  const validated = validateScanInput(body.institution, body.targetDomain);
  if (!validated.ok) {
    return errorResponse(400, "INVALID_INPUT", validated.error);
  }
  if (!californiaSuperiorCourts.some((court) => court.live && court.name === validated.value.institution && court.domain === validated.value.targetDomain)) {
    return errorResponse(400, "UNSUPPORTED_COURT", "Live scanning is currently available for Santa Barbara Superior Court only. Other courts are coming soon.");
  }

  try {
    if (!process.env.OPENAI_API_KEY?.trim() || !process.env.TAVILY_API_KEY?.trim()) {
      return errorResponse(503, "SCAN_NOT_CONFIGURED", "Live scanning is not configured. Please load the cached sample.");
    }
    const signal = AbortSignal.timeout(50_000);
    const model = createOpenAIModelClient(signal);
    const result = await runAgentLoop({
      ...validated.value,
      registry,
      model,
      limits: { maxIterations: 8, maxFetches: 5, timeoutMs: 10_000 },
      tools: {
        discover: async (query, domain) => {
          const { discoverOfficialSources } = await import("../../../lib/agent/tools/discover.ts");
          return discoverOfficialSources(query, domain, 5, signal);
        },
        fetch: async (url, timeoutMs) => {
          const { fetchPublicSource } = await import("../../../lib/agent/tools/fetch.ts");
          return fetchPublicSource(url, timeoutMs, signal);
        },
        extract: async (url, text) => {
          const { extractSignals } = await import("../../../lib/agent/tools/extract.ts");
          return extractSignals(url, text, model);
        },
        evaluate,
      },
    });
    return Response.json(result);
  } catch (error) {
    logFailure("api/scan", error, { path: "POST /api/scan" });
    const failure = scanError(error);
    return errorResponse(failure.status, failure.code, failure.message);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || "unknown";
}

function apiError(code: string, message: string): ApiError {
  return { error: { code, message } };
}

function errorResponse(status: number, code: string, message: string): Response {
  return Response.json(apiError(code, message), { status });
}
