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
  [`SOURCE_URL: ${sourceUrl}\n<UNTRUSTED_DOCUMENT_TEXT>policy</UNTRUSTED_DOCUMENT_TEXT>`]: JSON.stringify(extraction),
});

assert.deepEqual(
  await extractSignals(sourceUrl, "<UNTRUSTED_DOCUMENT_TEXT>policy</UNTRUSTED_DOCUMENT_TEXT>", model),
  extraction,
);
assert.throws(() => validateExtraction({ sourceUrl, signals: [{ artifactId: "x", present: true }] }), /quotedSpan/);

console.log("agent tool mocks passed");
