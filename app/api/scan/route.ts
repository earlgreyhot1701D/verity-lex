/** Exposes cached and stub-model public-record scans behind a validated JSON API. */

import { cachedSantaBarbaraScan } from "../../../data/mockScan.ts";
import registryData from "../../../data/registry.v1.json" with { type: "json" };
import { runAgentLoop } from "../../../lib/agent/controller.ts";
import { createStubModelClient } from "../../../lib/model/openai.ts";
import { evaluate, type Registry } from "../../../lib/ruleEngine/evaluate.ts";

const DOMAIN_PATTERN = /^(?=.{1,253}$)(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z](?:[a-z\d-]{0,61}[a-z\d])?$/i;
const registry = registryData as Registry;

interface ScanInput {
  institution: string;
  targetDomain: string;
}

interface ApiError {
  error: { code: string; message: string };
}

export async function GET(): Promise<Response> {
  return Response.json(cachedSantaBarbaraScan);
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const validated = validateInput(body);
  if ("error" in validated) {
    return Response.json(validated, { status: 400 });
  }

  try {
    const model = createStubModelClient();
    const result = await runAgentLoop({
      ...validated,
      registry,
      model,
      limits: { maxIterations: 8, maxFetches: 5, timeoutMs: 10_000 },
      tools: {
        discover: async (query, domain) => {
          const { discoverOfficialSources } = await import("../../../lib/agent/tools/discover.ts");
          return discoverOfficialSources(query, domain);
        },
        fetch: async (url, timeoutMs) => {
          const { fetchPublicSource } = await import("../../../lib/agent/tools/fetch.ts");
          return fetchPublicSource(url, timeoutMs);
        },
        extract: async (url, text) => {
          const { extractSignals } = await import("../../../lib/agent/tools/extract.ts");
          return extractSignals(url, text, model);
        },
        evaluate,
      },
    });
    return Response.json(result);
  } catch {
    return errorResponse(500, "SCAN_FAILED", "The public-record scan could not be completed.");
  }
}

function validateInput(value: unknown): ScanInput | ApiError {
  if (!isRecord(value) || typeof value.institution !== "string" || value.institution.trim().length === 0) {
    return apiError("INVALID_INPUT", "Institution must be a non-empty string.");
  }
  if (typeof value.targetDomain !== "string" || !DOMAIN_PATTERN.test(value.targetDomain.trim())) {
    return apiError("INVALID_INPUT", "Target domain must be a valid hostname without a protocol or path.");
  }
  return {
    institution: value.institution.trim(),
    targetDomain: value.targetDomain.trim().toLowerCase(),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function apiError(code: string, message: string): ApiError {
  return { error: { code, message } };
}

function errorResponse(status: number, code: string, message: string): Response {
  return Response.json(apiError(code, message), { status });
}
