# Verity Lex — master build prompt (OpenAI Build Week, Codex + GPT-5.6)

> Attach: `verity-lex.zip` (the UI base — DO NOT rebuild it), `AGENTS.md`, `types.ts`, `registry.v1.json`, `extraction.schema.json`, `rule-engine.fixtures.json`, `verity-lex-openai-plan.md`.
> Read `AGENTS.md` every turn. Where a file and this prompt disagree, the file wins. Work test-first; green before moving on.

---

You are my pair engineer building **Verity Lex** (engine: Themis Atlas) for OpenAI Build Week, **Work & Productivity** track. Model: **GPT-5.6** via the OpenAI SDK for all reasoning. Deterministic rule engine in plain TypeScript. Retrieval via **Tavily**. Stateless, no database. Next.js 14 + TypeScript. Submit by **July 21, 5pm PT**.

**What it is:** a model-directed agent reads a public institution's public record and returns an auditable AI-readiness surface — what the evidence supports, what can't be seen, every claim cited — scored by a deterministic rule engine anchored to California law.

## The UI is already built. Do NOT rebuild or restyle it.
The attached zip is a working Next.js app with the finished four-act UI (ScanAct, MarqueeTicker, ObservationAct/AgentLog, SurfaceAct, VerificationAct) in its navy-and-copper editorial skin. **Reuse these components and `styles/readiness-register.module.css` exactly.** Your only UI job is to feed them real data instead of the mock:
- Keep the components and their props (they already consume `ScanResult` from `types.ts`).
- Add a thin client state layer on the page: on OBSERVE, call `/api/scan`, then render Observation/Surface/Verification from the returned `ScanResult`.
- **Default to a pre-cached Santa Barbara result** so the demo never depends on a live fetch. Live scan is a path you show working, not a dependency.
- Ignore/remove the `db/`, `worker/`, `drizzle/`, `examples/` scaffold cruft. Stay stateless.

## Golden rules (from AGENTS.md — non-negotiable)
Rule engine is pure code; the model never scores. Never assert absence (not-located is provisional). No `found` without a source. Real agent: model-directed ReAct discovery loop, not a fixed URL list. Guardrails: public data only, bounded iterations, untrusted document text delimiter-wrapped, keys server-side, textContent not innerHTML, one file one responsibility, no god files.

## Build order (core first; each block green before next)
**Block 1 — Rule engine (pure).** `lib/ruleEngine/` loads `registry.v1.json`; computes coverage, seen/unseen, weighted score by dimension. Must pass every case in `rule-engine.fixtures.json` exactly (including partial-elements and no-source-downgrade). Write the tests first.

**Block 2 — Tools (mock-first).** `lib/model/openai.ts` (GPT-5.6 client, key server-side). `lib/agent/tools/extract.ts` (GPT-5.6 → JSON validated against `extraction.schema.json`). `lib/agent/tools/discover.ts` (Tavily search; provenance cites the real source URL, never Tavily). `lib/agent/tools/fetch.ts` (clean text, try/catch, timeout). Build against mock returns first.

**Block 3 — Agent + wire the UI.** `lib/agent/controller.ts` (model-directed ReAct loop) + `lib/agent/selfCheck.ts`. `app/api/scan/route.ts` returns a `ScanResult`. Wire the existing UI: OBSERVE → `/api/scan` → render; default to the cached SB `ScanResult`. **This is the shippable wedge.** Pre-cache the SB run.

**Block 4 — Harden.** Input validation client+server, injection wrapping, `lib/failureLog.ts`, in-memory rate limit, Dockerfile, `npm run selfcheck` (god-file guardrail + dependency preflight). Green = the submission is done.

## Add-ons — scaffold ALL as pluggable stubs now, fill as time allows
Create each as an isolated module with its interface returning canned/stub output, plus its UI hook behind a simple flag. Stubs must ship safely; filling them is additive and never blocks the core.

- **Audit export** — `lib/audit/export.ts`: `buildAuditBundle(scan, registryVersion)` → JSON (findings + sources + weights + rule version); `toDownload()`. UI: "Download audit bundle · recompute this yourself" on the Surface. Stub: assemble from existing `ScanResult`.
- **Methods page** — `app/methods/page.tsx`: renders `registry.v1.json` (artifact, authority + citation, tier, weight). Stub: static render.
- **Training preview** — `lib/training/suggestPath.ts`: `suggestTrainingPath(finding, institution): Promise<TrainingOutline>` via GPT-5.6, output labelled "suggested · human review required". UI hook on a gap card. Stub: canned outline.
- **Draft-inquiry** — `lib/verify/draftInquiry.ts`: `draftInquiry(artifactId, institution): Promise<string>` via GPT-5.6 fills the public-inquiry template. UI: existing Verification "Reveal draft" calls it. Stub: the static template already present. Draft-not-send: tool drafts, a human sends.

**Flex (only if ahead):** `mcp/server.ts` exposing `readiness_scan`, `readiness_gaps`, `artifact_check` over the same core functions.

## Evidence & deliverables (OpenAI)
Build the core in ONE Codex session; commit often, dated. Capture the `/feedback` Codex Session ID. README documents Codex + GPT-5.6 usage and a short "wedge today, pyramid tomorrow" section. Demo video < 3 min with audio on how Codex and GPT-5.6 were used. Repo public (licensed) or shared with testing@devpost.com + build-week-event@openai.com.

## Start now
Begin with Block 1: the pure rule engine and its test file against `rule-engine.fixtures.json`. Show me the two files and run the tests, pass/fail, before continuing. Do not touch the UI components or styles in this block.
