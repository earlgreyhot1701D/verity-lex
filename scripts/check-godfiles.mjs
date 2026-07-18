#!/usr/bin/env node
/** No-god-file guardrail. Fails the build if any source file exceeds the threshold.
 * One file, one responsibility, enforced. No dependencies. */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["app", "components", "lib", "data", "scripts"];
const MAX_LINES = 200;
const MAX_EXPORTS = 6;
const EXT = new Set([".ts", ".tsx", ".mjs", ".js"]);

function walk(dir) {
  let files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) files = files.concat(walk(full));
    else if (EXT.has(extname(entry))) files.push(full);
  }
  return files;
}

const alerts = [];
for (const root of ROOTS) {
  let files = [];
  try {
    files = walk(root);
  } catch {
    continue;
  }
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const lines = text.split("\n").length;
    // Count value exports only; a types file may export many type/interface decls.
    const exports = (text.match(/^export\s+(?!type\b|interface\b)/gm) || []).length;
    if (lines > MAX_LINES)
      alerts.push(`${file}: ${lines} lines (max ${MAX_LINES})`);
    if (exports > MAX_EXPORTS)
      alerts.push(`${file}: ${exports} exports (max ${MAX_EXPORTS})`);
  }
}

if (alerts.length) {
  console.error("\n⚠  GOD-FILE GUARDRAIL — split these before continuing:");
  for (const a of alerts) console.error("   " + a);
  console.error("");
  process.exit(1);
}
console.log("✓ god-file guardrail: clean");
