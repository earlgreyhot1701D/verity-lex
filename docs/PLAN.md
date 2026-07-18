# Verity Lex — OpenAI Build Week plan (current source of truth)

> Supersedes the Hack-Nation framing in `themis-atlas-prd.md`. The PRD's architecture (real agent, rule engine, guardrails, self-check, provenance) still applies unchanged. This doc re-centers scope on the OpenAI submission and specs the add-ons as pluggable stubs.
> Product: **Verity Lex** · Engine: Themis Atlas · Track: **Work & Productivity**.
> Shara judges the time. Every add-on is independently cuttable; the core never depends on one.

## Deadline & deliverables (OpenAI Build Week)
- **Submit by Tue July 21, 5:00 PM PT.** ~3 days from now.
- Build the core with **Codex + GPT-5.6**. Capture the **/feedback Codex Session ID** (thread where most core functionality is built).
- Demo video < 3 min, audio explains how Codex AND GPT-5.6 were used.
- README documents the Codex collaboration + a "wedge today, pyramid tomorrow" section.
- Repo public (licensed) or shared with testing@devpost.com + build-week-event@openai.com.
- The recolored `verity-lex` zip is UI/prior work; the **judged work is what you build in-window with Codex/GPT-5.6** (rule engine, agent, wiring). Document prior vs new.

## THE CORE WEDGE (MUST — this is the submission)
End-to-end, working, on one real court (Santa Barbara), pre-cached for the demo:
1. **Model-directed agent loop** (ReAct): plan → discover (Tavily) → fetch → extract (GPT-5.6 → schema JSON) → evaluate (rule engine) → explain. The model decides where to look next; not a fixed URL list.
2. **Deterministic rule engine** (pure code): registry.v1.json → coverage, seen/unseen, weighted score by dimension. Passes the fixtures exactly. The model never scores.
3. **Provenance**: every finding cites a real source URL + quoted span. No found without a source. Never assert absence.
4. **Self-check loop** + guardrails (public data only, bounded iterations, injection-wrapped untrusted text, key server-side).
5. **UI**: the four-act editorial page (already built + recolored), wired to real scan output instead of mock.
Protect this above all add-ons. Pre-cache the SB run for the video.

## ADD-ONS (all greenlit; built as pluggable stubs; do as many as time allows)
Each = one isolated module + interface + stub + a UI hook. If unbuilt, its stub returns canned/empty and the app still ships.

### 1. Audit / reproducibility export  (value: high · risk: low)
- **Module:** `lib/audit/export.ts` → `buildAuditBundle(scan, registryVersion): AuditBundle` (findings + sources + weights + rule version + the math). `toDownload(bundle): Blob`.
- **UI hook:** "Download audit bundle · recompute this yourself" button on the Surface.
- **Stub:** assemble from data already in `ScanResult` (no new data). Ship-safe immediately.
- **Why:** your anti-black-box thesis made tangible. Scores Design + Impact.

### 2. Methods / transparency page  (value: med-high · risk: low)
- **Module/route:** `app/methods/page.tsx` renders `registry.v1.json`: each artifact, its authority + citation, tier, weight.
- **Stub:** static render of the registry. No logic.
- **Why:** open methodology; "we publish how we judge." Trivial, on-brand.

### 3. Training-pathway preview  (value: high for the pyramid · risk: low-med)
- **Module:** `lib/training/suggestPath.ts` → `suggestTrainingPath(finding, institution): Promise<TrainingOutline>` via GPT-5.6, output flagged **suggested · human review required**.
- **UI hook:** "Preview staff training" action on a gap card → shows a role-specific outline.
- **Stub:** returns a canned outline until wired to GPT-5.6. Fully isolated.
- **Why:** the pyramid's next tier shown live. Your differentiator (staff readiness) made visible. Scores Impact + Idea.

### 4. Draft-inquiry generation  (value: med · risk: low)
- **Module:** `lib/verify/draftInquiry.ts` → `draftInquiry(artifactId, institution): Promise<string>` GPT-5.6 fills the public-inquiry template for the specific gap.
- **UI hook:** the existing "Reveal draft" in Verification calls this instead of static text.
- **Stub:** the static template already in the UI.
- **Why:** the human-gate made real. Draft-not-send: tool drafts, human reviews and sends.

### FLEX (only if the core lands with room to spare)
- **MCP server:** `mcp/server.ts` exposing `readiness_scan`, `readiness_gaps`, `artifact_check` (call the same core functions). Says the wedge is a platform others build on. More effort; a reach goal, not a plan.

## Wedge → pyramid, communicated in 3 places
- **Product copy:** one quiet line under the surface: "This free scan is the wedge. Organizational readiness, staff training, and solutions sit above it."
- **README:** a short "Wedge today, pyramid tomorrow" section: free public-data mirror → org readiness analysis → staff AI-readiness + training → solutions.
- **Video (last 15s):** name the venture arc. OpenAI scores Potential Impact + Quality of Idea; the pyramid is points, not fluff.

## Build order (Shara paces it)
1. Core wedge end-to-end, green on fixtures, one real SB run, pre-cached. **Stop-and-ship point.**
2. Add-on 1 (audit export) + 2 (methods page) — both nearly free.
3. Add-on 3 (training preview) + 4 (draft-inquiry) — the pyramid + human-gate made live.
4. Flex: MCP, only if ahead.
Every step above line 1 is a bonus. Cut from the bottom if the clock says so. Shara's call.

*AI assisted. Human approved. Powered by NLP.*
