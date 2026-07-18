#!/usr/bin/env node
/** Dependency + version preflight (tool-longevity check, automated). No deps.
 * Warns on unpinned/missing critical deps; reminds to run `npm audit` before deploy. */

import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

// Critical deps that must exist and be pinned once the build wires them in.
const REQUIRED = ["next", "react", "react-dom"];
// Add these when the agent is wired: "openai", plus your Tavily client.
const EXPECTED_SOON = ["openai"];

let hardFail = false;
const warn = (m) => console.warn("   ! " + m);

for (const dep of REQUIRED) {
  if (!deps[dep]) {
    console.error(`   ✗ missing required dependency: ${dep}`);
    hardFail = true;
  }
}

for (const [name, range] of Object.entries(deps)) {
  if (/^[\^~]|\*|latest|x/.test(String(range))) {
    warn(`${name} is unpinned ("${range}") — pin an exact, confirmed-current version`);
  }
}

for (const dep of EXPECTED_SOON) {
  if (!deps[dep]) warn(`${dep} not yet installed (needed once the agent is wired)`);
}

console.log("• preflight: reminder — run `npm audit` and confirm GPT-5.6 + Tavily SDK are current before deploy.");

if (hardFail) {
  console.error("\n✗ preflight failed: missing required dependency.\n");
  process.exit(1);
}
console.log("✓ preflight: no blocking issues");
