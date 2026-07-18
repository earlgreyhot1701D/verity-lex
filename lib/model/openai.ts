/** Server-only model adapter contract for GPT-5.6 reasoning calls; Block 2 defaults to a stub so no live model can score or fetch. */

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

  return {
    async complete(request) {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-5.6",
          instructions: request.system,
          input: request.input,
          text: request.responseFormat === "json" ? { format: { type: "json_object" } } : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI response failed: ${response.status}`);
      }

      const payload = (await response.json()) as { output_text?: string };
      return payload.output_text ?? "";
    },
  };
}
