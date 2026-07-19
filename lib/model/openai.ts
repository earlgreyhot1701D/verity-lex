/** Server-only GPT-5.6 Responses API adapter; callers retain a keyless stub fallback. */

import OpenAI from "openai";

export interface ModelRequest {
  system: string;
  input: string;
  responseFormat?: "json" | "text";
}

export interface ModelClient {
  complete(request: ModelRequest): Promise<string>;
}

export function createStubModelClient(responses: Record<string, string> = {}): ModelClient {
  return {
    async complete(request) {
      return responses[request.input] ?? "{}";
    },
  };
}

export function createOpenAIModelClient(): ModelClient {
  if (typeof window !== "undefined") {
    throw new Error("OpenAI model client is server-only");
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for live model calls");
  }

  const client = new OpenAI({ apiKey });

  return {
    async complete(request) {
      const response = await client.responses.create({
        model: "gpt-5.6-terra",
        instructions: request.system,
        input: request.input,
        text: request.responseFormat === "json" ? { format: { type: "json_object" } } : undefined,
      });
      return response.output_text;
    },
  };
}
