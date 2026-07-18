# Verity Lex — Deploy, Observability & Risk (ops addendum)

## Deploy: Vercel (base converted to standard Next.js)
The zip base was scaffolded for **Cloudflare Workers + Vite + Wrangler + D1**, not Vercel (its `dev` ran `vite`). Converted to a standard Next.js app: `package.json` now uses `next dev / build / start`, and the Cloudflare/Vite/Drizzle deps + `worker/ vite.config.ts build/ scripts/ db/ drizzle/ examples/ .openai/` are removed.
- **Flow:** push to GitHub → import the repo in Vercel → it auto-detects Next.js → deploy. Every push = a preview URL; `main` = production. Rollback = redeploy a previous deployment (one click).
- **Verify locally first:** `npm install && npm run dev`. If Next 16 throws anything, tell me.
- **Env on Vercel:** Project → Settings → Environment Variables → add `OPENAI_API_KEY` and `TAVILY_API_KEY` (all environments, server-side).
- Codex will add the `openai` SDK and a Tavily client during the build; pin current versions via the preflight.

## Env / secrets (.env)
- `.env.example` is committed (template). Copy it to `.env.local` for local dev (gitignored). Real keys live ONLY in `.env.local` and Vercel env vars — never in the client bundle, never committed. `.gitignore` updated to keep the template but ignore real env files.
- Keys are read in server code (API routes) only. If a key leaks, rotate it in the provider dashboard.

## Observability: open our own black box
On-thesis — we make the agent inspectable, the same thing we do to courts.
- **Run trace (in-app):** the `RunStep[]` log already records every step (plan, discover, fetch, extract, self-check, evaluate, explain) with timestamp + ok. Enrich each with tool + input summary + output summary + (for model calls) token counts. The field log is the human view; add a "view full trace" and fold it into the audit export.
- **Server logs:** structured console log for every model call and tool call → Vercel captures these (Dashboard → Logs). `lib/failureLog.ts` records every failure and self-check degrade.
- **Platform tracing (free):** OpenAI dashboard (API calls, tokens, spend), Tavily dashboard (searches), Vercel (function logs). Three trace layers with zero build.
- **Redaction:** the client-facing trace must NOT include full prompts, keys, or raw untrusted document text. Full detail stays server-side.

## The 13-layer production stack, on Vercel
| Layer | Handled by |
|---|---|
| Frontend | Built (your UI). |
| APIs & Backend | Next API routes (`/api/scan`). |
| Database & Storage | STUB — stateless by design. |
| Auth & Permissions | STUB — no login (that's the wedge). |
| Hosting & Deployment | Vercel. |
| Cloud & Compute | Vercel serverless functions. |
| CI/CD & Version Control | Git + GitHub; Vercel auto-deploy + preview per push. |
| Security & RLS | Keys server-side, validation, injection-wrapping; RLS n/a (no DB). |
| Rate Limiting | In-memory token bucket + bounded agent iterations/fetches. |
| Caching & CDN | Vercel edge CDN (automatic). |
| Load Balancing & Scaling | Vercel auto-scales functions. |
| Error Tracking & Logs | Vercel Logs + failure log + agent trace. Sentry optional. |
| Availability & Recovery | Vercel one-click rollback to a prior deployment. |

Vercel hands you CDN, scaling, rollback, and logs for free. The rest is stub-with-reason or already built.

## Risk management — protect the WORK
- **Commit + push often.** GitHub is your backup and your OpenAI dated-commit evidence. Never lose more than minutes.
- **Tag the first working wedge and submit it early.** The moment the core scans end-to-end, commit + tag `wedge-v1` and submit to Devpost. Devpost lets you keep updating until the deadline. Never let the only version be a broken one at 4:59 PM.
- **Commit before every Codex block.** So you can `git revert` if Codex over-refactors. The commit is your safety net; the AGENTS "do not refactor" rule is the seatbelt.
- **Branch risky add-ons.** Build each add-on on a branch, merge only when green. `main` stays shippable.

## Risk management — protect the APP
- **Secrets:** server-side only, `.env.local` + Vercel env, never committed, rotate if leaked.
- **Spend/abuse:** bounded iterations + max fetches + timeouts + in-memory rate limit cap runaway OpenAI/Tavily cost. Set a usage limit / budget alert in the OpenAI dashboard.
- **Prompt injection:** fetched document text is untrusted — delimiter-wrapped, treated as data, never instructions. An agent reading the open web is an injection surface; this is the guard.
- **Input validation:** client and server.
- **Fail safe:** try/catch every fetch, meaningful error states, failure log; self-check degrades to "unseen" rather than crashing.
- **Liability:** stateless (store nothing), never assert absence, human-verify before any claim — the design already lowers legal/reputational risk.
- **Demo safety:** pre-cache the Santa Barbara run so the live demo never depends on a network call that could fail.

Maps to your 11-point pre-deploy checklist. Vercel + these controls covers it.

*AI assisted. Human approved. Powered by NLP.*
