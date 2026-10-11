import assert from "node:assert/strict";
import { createStubModelClient } from "../../model/openai.ts";
import { extractSignals, validateExtraction } from "./extract.ts";

const sourceUrl = "https://example.gov/policy";
const extraction = {
  sourceUrl,
  signals: [
    {
      artifactId: "genai_policy",
      present: true,
      quotedSpan: "Court users shall verify accuracy.",
      elementsPresent: ["verify_accuracy"],
    },
  ],
};

const model = createStubModelClient({
  [`SOURCE_URL: ${sourceUrl}\n<UNTRUSTED_DOCUMENT_TEXT>Court users shall verify accuracy.</UNTRUSTED_DOCUMENT_TEXT>`]: JSON.stringify(extraction),
});

assert.deepEqual(
  await extractSignals(sourceUrl, "<UNTRUSTED_DOCUMENT_TEXT>Court users shall verify accuracy.</UNTRUSTED_DOCUMENT_TEXT>", model),
  extraction,
);
assert.throws(() => validateExtraction({ sourceUrl, signals: [{ artifactId: "x", present: true }] }), /quotedSpan/);
assert.throws(() => validateExtraction({ ...extraction, score: 100 }), /property/);
assert.throws(() => validateExtraction({ sourceUrl, signals: [{ ...extraction.signals[0], artifactId: "unknown" }] }), /artifact/);
await assert.rejects(extractSignals(sourceUrl, "not the quoted document", { complete: async () => JSON.stringify(extraction) }), /quote/);
await assert.rejects(extractSignals(sourceUrl, "Court users shall verify accuracy.", { complete: async () => JSON.stringify({ ...extraction, sourceUrl: "https://elsewhere.gov" }) }), /source URL/);

console.log("agent tool mocks passed");
