# Verity Lex

![Verity Lex — AI readiness, observed](./public/images/hero.png)

**Everyone is selling AI to government. Who has checked whether government is ready to buy?**

Verity Lex starts at the foundation: what standards is a public institution held to, and what does its own public record show? It returns an AI-readiness score anyone can recompute. The AI reads the record. It never assigns the score.

Built for OpenAI Build Week 2026 (Work and Productivity track) with Codex and GPT-5.6.
AI assisted. Human approved.

---

## The problem

The way technology gets sold to government is backwards. Vendors arrive with solutions and go looking for problems, without understanding the institution they are selling into: what standards it is held to, whether it is meeting them, whether its structure and its people are ready for what is being sold. The result is familiar to anyone who has worked in the public sector: shelfware, failed rollouts, and eroded trust.

AI is about to repeat this at scale. Courts and other public institutions are adopting AI right now, under real mandates. In California, Rule of Court 10.430 requires courts that permit generative AI to adopt a use policy. But nobody can currently answer the foundational question: **what does an institution's own public record say about its readiness?**

The tools that exist are either consulting engagements (slow, expensive, opaque) or an LLM chat answer (fast, unverifiable, and different every time you ask). A government buyer cannot procure "an LLM felt good about our compliance." They need a number they can recompute, findings they can check, and sources they can click.

Verity Lex starts where selling to government should start: at the foundation, with the standards, before anyone pitches a solution.

## What Verity Lex does

Give it a court and its official domain. An **agentic scan**, not a script: a model-directed ReAct loop (reason, act, observe, repeat) decides where to look next, searches the court's public record, fetches documents, and extracts evidence signals, all under bounded autonomy with every step written to a visible run log. Then a **deterministic rule engine, pure code, no model anywhere in it**, scores that evidence against a published registry of nine artifacts with published weights and legal authorities.

Every finding cites a real source URL and a quoted span. Anything not found is reported as **not located**, never as absent, because absence of evidence in a public record is not evidence of absence. A human confirmation is the only thing that can mark a finding verified.

The output is a readiness surface you can audit:

- a score out of 100 across three dimensions (A: AI Governance, B: Data Foundations, C: Capacity)
- every weight published on the [/methods](./app/methods/page.tsx) page
- a downloadable **audit bundle** (findings, sources, weights, registry version) so you can recompute the score yourself
- a run log showing every step the agent took and every guardrail that fired

## Why this architecture: neurosymbolic on purpose

Would you trust an AI to grade its own homework? Neither would a court. Most AI demos put the model in charge of the answer. We split the job:

| Concern | Who does it | Why |
|---|---|---|
| Finding documents | GPT-5.6 directs, Tavily retrieves | Judgment about where to look next benefits from reasoning |
| Reading documents | GPT-5.6 extracts signals to a strict JSON schema | Perception is what models are for |
| Scoring readiness | Pure TypeScript rule engine | Judgment about the score must be reproducible, auditable, and identical on every run |

Ask an LLM to score a court twice and you get two numbers. Verity Lex structurally cannot do that. The model has no path to the score. That constraint is the product.

## The wedge today, the pyramid tomorrow

The thesis: you earn the right to sell a solution by understanding the institution first. That understanding has an order, and each tier depends on the one beneath it.

1. **Standards.** What is this institution held to? Does the standard exist, and is the institution fulfilling it? **This is Verity Lex**: the public-record readiness surface, scored against published authorities, auditable by anyone.
2. **Structure.** Is the organization itself AI-ready? Governance in place, roles assigned, policy operational rather than aspirational. This is the second wedge product, built on the same registry-and-evidence engine.
3. **People.** Are staff AI-ready? Does training exist, do they know how to use AI safely, and what are the culture blockers? Readiness is not a policy PDF; it is whether the people covered by it can act on it.
4. **Solutions.** Only now: work with the agency on tools that improve operations, prescribed against a diagnosed, verified picture instead of a pitch deck's guess.

This submission is deliberately a thin end-to-end wedge into tier one: one real court (Santa Barbara Superior Court), scanned live or served from a pre-cached result, scored by registry v1.0. Along the way it grows sideways (all 58 California superior courts, then other institution types, registry versions per type) and compounds: courts confirming or correcting findings turns provisional scans into the first human-verified dataset of institutional AI readiness.

The v2 stubs below are the pyramid's next tiers, already shaped in the codebase: the training pathway module is tier three's first appearance, and the draft-inquiry gate is how tier-one findings become verified ones.

## Architecture

![Verity Lex system architecture](./public/images/architecture.png)

```
app/page.tsx (four-act editorial UI)
        |
        v
POST /api/scan  ── validate (client AND server, shared validator)
        |            rate limit (per IP, in-memory)
        v
lib/agent/controller.ts        model-directed ReAct loop
   reason  ->  act  ->  observe  ->  repeat   (bounded: 8 iterations)
   |         |          |
   |         |          +-- runLog: every step, shown in the UI
   |         +-- tools:
   |              discover  -> Tavily /search  (official domain only)
   |              fetch     -> Tavily /extract (10s timeout, max 5 fetches,
   |                            text wrapped as UNTRUSTED before anything reads it)
   |              extract   -> GPT-5.6-terra -> strict JSON schema
   +-- lib/agent/selfCheck.ts: domain guard + iteration/fetch bounds
        |
        v
lib/ruleEngine/evaluate.ts     pure code, no model import, fixture-tested
        |
        v
ScanResult -> UI + audit bundle (lib/audit/export.ts)
```

Key properties, each enforced in code and covered by a test:

- **The model never assigns the score.** `evaluate.ts` imports no model. The agent-loop test asserts the score comes only from the injected pure evaluator.
- **No found without a source.** A finding without a source is downgraded to not located.
- **Never assert absence.** Statuses are `found`, `not_located` (provisional), or `verified` (human-confirmed only).
- **Prompt-injection defense at the boundary.** Fetched document text is wrapped in `<UNTRUSTED_DOCUMENT_TEXT>` tags at fetch time; the extractor's system prompt instructs the model to treat everything inside as data, never instructions. The action-planning call never sees document text at all, only URLs, so a poisoned document cannot steer the loop.
- **Bounded autonomy.** Max 8 iterations, max 5 fetches, 10 second timeouts, all asserted by tests that prove the bounds actually trip.
- **Fails safe.** No API key means the app runs on a stubbed model and a pre-cached scan. Errors surface as structured JSON and visible UI states, never blank screens.
- **Stateless.** No database. Nothing about a scanned institution is stored.

## Quickstart

```bash
git clone https://github.com/earlgreyhot1701D/verity-lex.git
cd verity-lex
npm ci
npm run dev
```

Open http://localhost:3000. With no keys set, you get the full experience against a pre-cached Santa Barbara scan and a stubbed model. That is deliberate: the demo cannot break on stage.

To run live scans, copy `.env.example` to `.env.local` and set:

```
OPENAI_API_KEY=...   # GPT-5.6-terra, extraction and loop direction
TAVILY_API_KEY=...   # discover (/search) and fetch (/extract)
```

Keys are read server-side only, never logged, never shipped to the client.

### Sample data

- `data/mockScan.ts` is the pre-cached Santa Barbara `ScanResult` the app serves by default
- `data/registry.v1.json` is the scoring registry: 9 artifacts, weights, tiers, legal authorities
- `data/rule-engine.fixtures.json` holds the fixture cases the rule engine must pass exactly
- `data/extraction.schema.json` is the JSON contract the extractor must satisfy

## Tests and checks

```bash
npm run test:rule-engine   # fixture-exact scoring, pure code
npm run test:agent-tools   # discover/fetch/extract contracts
npm run test:agent-loop    # bounds trip, off-domain blocked, score is pure
npm run test:scan-route    # API contract, validation, structured 429/400/500
npm run test:hardening     # shared validator + rate limiter
npm run test:audit         # audit bundle recomputes the score from its own fields
npm run selfcheck          # god-file guardrail + dependency preflight
npx tsc --noEmit
npm run build
```

CI runs all of the above on every pull request and push to main, plus a lockfile drift guard and a non-blocking `npm audit`. Every feature in this repo entered through a reviewed, CI-green pull request.

The audit test is the thesis in miniature: it takes a generated audit bundle and recomputes the score by hand from only the bundle's own findings and weights, then asserts it matches the engine. If the bundle ever stops carrying enough information to check our math, the build fails.

## Add-ons shipped, and v2 stubs

Shipped in this window:

- **Audit export** (`lib/audit/export.ts`): download the bundle, recompute it yourself
- **Methods page** (`app/methods/page.tsx`): every artifact, weight, tier, and legal authority, published

Deliberately stubbed for v2, interfaces designed, not half-built:

- **Draft inquiry email** (`lib/verify/draftInquiry.ts`, planned): when evidence is not located, the product already ships a draft public-records inquiry letter to the court's Records Access Officer, behind a human gate in the Verification act: the tool drafts, a human reviews and sends. Today that draft is a static template; v2 has GPT-5.6 tailor it to the specific gap, institution, and governing authority.
- **Client-facing report export** (planned, per the PRD's `@react-pdf/renderer` stack line): a human-readable readiness report a court administrator could circulate, generated from the same `ScanResult`. Today the audit bundle (JSON) serves the technical and audit audience; the PDF report is the executive-facing counterpart.
- **Training pathway** (`lib/training/suggestPath.ts`, planned): per-gap staff training outlines, always labeled suggested and human reviewed. This is the readiness-delivery tier of the pyramid.
- **Clamped config overrides** (planned): env-tunable agent bounds (`AGENT_MAX_ITERATIONS`, `AGENT_MAX_FETCHES`, `OPENAI_MODEL`) with hard ceilings enforced in code. In v1 these bounds are deliberately hardcoded: they are guardrails, and a guardrail you can change from a dashboard without review or CI is not a guardrail. v2 wires them as overrides that can only turn within a pre-approved, code-enforced range.

The rule for all of these: stub, do not half-build. Each lands as an isolated module behind its existing hook without touching the core.

## Design decisions

- **Model: `gpt-5.6-terra`, pinned 2026-07-19.** Chosen over Sol because structured extraction showed no visible quality gain at roughly twice the input cost, and over Luna because legal-document extraction benefits from quality headroom. The model only reads and extracts; it never assigns the score, so tier choice affects extraction quality and cost, not scoring.
- **Retrieval via Tavily** rather than raw fetch: court sites are frequently JavaScript apps that return an empty shell to a plain HTTP fetch. Tavily /extract reads them. Provenance still cites the court's real URL, never Tavily.
- **Mock-first, then live.** The UI, agent, and API were all built and tested against fixtures and a stubbed model before a real key was ever wired. A live model was never attached to a broken layout.
- **One file, one responsibility**, enforced by a guardrail script that fails the build past roughly 200 lines or five exports.
- **Deterministic logic, AI reasoning.** Structure is code. Judgment about where to look is the model's. Judgment about the score is never the model's.

## How this was built with Codex

This project was built with Codex in the VS Code IDE using a creative-director workflow: a human sets the product vision, architecture, design, guardrails, and acceptance criteria; Codex implements the scoped engineering work; and nothing merges unverified.

- **Codex built the code.** Every block (rule engine, tools, agent loop, API wiring, hardening, CI, add-ons) was implemented by Codex from gated, block-scoped prompts with explicit guardrails ("propose a file plan first", "do not refactor unrelated code", "stop after the PR").
- **GPT-5.6 runs in the product.** It directs the discovery loop and performs schema-constrained extraction. It is barred, architecturally, from scoring.
- **Every substantive Codex change entered through a pull request**, was independently re-run and verified (tests, types, build) before merge, and CI now enforces that automatically. The commit history is the collaboration log: nine scoped PRs covering the core blocks, add-ons, and release preparation.
- Codex also caught and fixed real issues along the way (a `next/server` import trap avoided by using web-standard `Response.json`, a CI lockfile regeneration for the Linux runner), and its proposals were sometimes overruled by human review, which is the point of the gate.

**Codex Session ID:** `019f77cd-ca05-71d0-a99a-4f53da2524fd`

**Contribution estimate:** Codex produced approximately 85–90% of the implemented code and engineering work, or approximately 65–75% of the overall project when the human-authored product concept, specifications, architecture, design direction, written content, visual assets, review decisions, and approvals are included.

The Codex implementation work included the deterministic rule engine and fixtures; Tavily-backed discovery, fetch, and extraction tools; the bounded model-directed agent loop and self-checks; stub and OpenAI SDK model clients; cached Santa Barbara scan; scan API and client wiring; shared validation; structured error handling; rate limiting; Docker production build; automated tests and GitHub Actions CI; recomputable audit export; published methods page; model-tier pinning; environment cleanup; documentation and MIT license integration; and favicon, hero, architecture, and social-card wiring. The initial product direction, UI foundation, editorial design, requirements, registry policy, branding, and final review remained human-led.

### Built in-window

Everything in this repository was built during the Build Week window: the four-act editorial UI, the rule engine, the agent tools, the ReAct controller and self-check, the API route and wiring, validation, rate limiting, the Dockerfile, CI, the audit export, and the methods page. The commit history is dated and granular if you want to check that claim, which is the kind of checking this product exists to encourage.

## Known limitations

Honest list, current as of submission:

- The rate limiter is in-memory and per-instance. On serverless it resets across instances; the real backstop is provider spend caps. v2: durable store.
- The client-IP read trusts `x-forwarded-for`, correct behind Vercel's proxy, weak on a bare deployment.
- An empty model reply surfaces as a caught scan failure rather than a friendlier partial state.
- One court, one registry version. The registry is versioned (`registry.v1.json`) precisely so coverage can grow without breaking old audits.
- A not-located finding means we could not locate public evidence. It does not mean the artifact does not exist. This is a feature, but it bears repeating.

## License

MIT. See [LICENSE](./LICENSE).

---

*Verity Lex, engine name Themis Atlas. Built by La Shara Cordero with Codex and GPT-5.6, verified by hand.*
