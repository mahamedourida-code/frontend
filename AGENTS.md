# AxLiner — AI Agent Instructions

**AxLiner** (capital A, capital L) — formerly "OlmOCR" — is a full-stack product that turns
handwritten / photographed / scanned invoices, receipts, bank statements, tables, and notes into
reviewable Excel/CSV, then publishes reviewed drafts to **QuickBooks Online and Xero**. Live at
**https://www.axliner.com**.

> The differentiator is **batch processing + the Batch Review Board** (correct exceptions before
> export / publish) — NOT single-image OCR. Keep every suggestion pointed at batch / review /
> accounting flows.

This file is the **index**. Detailed knowledge lives in `docs/` — read the relevant doc before
working in that area instead of guessing. The instructions here override default behavior; follow
them exactly.

---

## 📚 Documentation map

| When you're working on… | Read |
| --- | --- |
| Full system design — the two deployable units, stack, data flow, realtime, module maps | **[docs/architecture.md](docs/architecture.md)** |
| The document pipeline — modes, intake, classification, review board, export, QuickBooks & Xero, AP queue | **[docs/workflow.md](docs/workflow.md)** |
| Database — Supabase schema, RLS, storage buckets, auth model, generated types | **[docs/database.md](docs/database.md)** |
| Billing — Lemon Squeezy plans, credit model, rate limits, QuickBooks & Xero scope | **[docs/billing.md](docs/billing.md)** |
| Coding conventions, component patterns, and the brand / design system | **[docs/style-guide.md](docs/style-guide.md)** |
| Shipping — frontend → Vercel, backend → Fly, env vars, secrets, smoke tests | **[docs/deployment.md](docs/deployment.md)** |
| Which MCP server / tool to reach for, and when | **[docs/tooling.md](docs/tooling.md)** |

Matching **skills** in `.claude/skills/` (`axliner` router + `axliner-ui`, `axliner-backend`,
`axliner-research`, `axliner-db`, `axliner-ship`) encode these workflows and fire automatically — you
shouldn't have to be asked to use them.

---

## 🧭 Orientation (the 30-second map)

- **One tree, two deploy units.** Frontend (Next.js 16, React 19, Turbopack) lives directly under
  `Frontend/` → **Vercel**. Backend (FastAPI + Celery + Redis) lives under `Frontend/backend/` →
  **Fly.io**. Each has its own git remote. Full detail in [docs/architecture.md](docs/architecture.md).
- **All backend calls go through `src/lib/api-client.ts`** (≈36 KB, the single API surface). Don't
  write parallel `fetch`es.
- **All DB reads/writes go through `backend/app/services/supabase_service.py`** (service-role client).
  Don't new-up Supabase clients ad-hoc.
- **The core endpoint file is `backend/app/api/v1/jobs.py`** (≈101 KB). Document modes & review
  statuses are Pydantic literals in `backend/app/models/requests.py`.
- **Working dir path has a space** (`olmocr frontend\Frontend`) — quote it in shell commands.

---

## 🔒 Hard rules (always apply — not buried in a doc you might skip)

1. **Commit messages are ONE word.** No paragraphs. (e.g. `buttons`, `green`, `billing`.)
2. **Never run** `npm run build` or `vercel deploy` — Vercel owns the frontend build. **Never** hardcode
   a provider URL that bypasses `NEXT_PUBLIC_API_URL`.
3. **Never commit secrets** — `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`,
   `QUICKBOOKS_TOKEN_ENCRYPTION_KEY`, the OlmOCR key, or any `LEMONSQUEEZY_*` secret. They live ONLY in
   Fly secrets / Vercel env vars. `NEXT_PUBLIC_*` is the only public-safe prefix (the anon key is fine).
4. **Use your tools — don't punt.** When a capability is needed (DB migration, library docs, competitor
   research, visual QA), use the MCP/CLI directly; never tell the user to "run it yourself." Confirm
   before destructive ops (db drops, force pushes, deletes); otherwise just execute. See
   [docs/tooling.md](docs/tooling.md).
5. **Don't deploy unless asked.** The user controls when things ship.
6. **`framer-motion` only — NEVER `motion/react`.**
7. **No QA by default.** When the user asks to push / ship / deploy, just commit and push. Do not run
   local QA, Playwright checks, smoke tests, or post-deploy verification unless the user explicitly asks.
8. **Don't add tests, defensive error-handling, or README / doc files unless asked.**

---

## ⚡ Tools you MUST use (summary — full table in [docs/tooling.md](docs/tooling.md))

| Need | Tool |
| --- | --- |
| Frontend UI / design work | `frontend-design:frontend-design` skill (+ `axliner-ui`) |
| Library / framework docs (Next, Tailwind, FastAPI, Pydantic…) | **context7 MCP** |
| Supabase schema / queries / advisors | **supabase MCP** — `apply_migration` for DDL, `get_advisors` after |
| Competitor / pattern research (Dext, Veryfi, Xero, Hubdoc, Tella) | **brave-search MCP** — ≤1 query/task (1 req/sec) |
| Visual inspection & live QA | **playwright MCP** — only when explicitly requested |
| Backend deploy | **Fly CLI** via Bash (`fly deploy -a backend-lively-hill-7043`) |
| Frontend deploy | **git push** to `mahamedourida-code/frontend` (Vercel auto-builds) |

---

## 🎨 Brand one-liner (full system in [docs/style-guide.md](docs/style-guide.md))

Green buttons = the soft mint **`#d1fae5`** (emerald-100, the "Throw us the whole folder." band) with a
dark emerald **`#064e3b`** label and a Tella-style "definition" shadow (inset highlight + emerald-500
ring + soft drop shadow). Every button is a **`rounded-full`** pill. The **Upgrade** button uses
`/public/buto.png`. Tokens live only in `:root` so buttons never theme-flip. `framer-motion` only.

---

## 🚀 Common tasks → where to start

| Task | Entry point | Doc |
| --- | --- | --- |
| Add / change a document mode | `DocumentMode` literal in `backend/app/models/requests.py` + extraction prompt in `services/olmocr.py` + the frontend route | [workflow](docs/workflow.md) |
| Add a backend endpoint | new file under `backend/app/api/v1/`, register in `api/v1/__init__.py`; frontend calls it via `src/lib/api-client.ts` | [architecture](docs/architecture.md) |
| Add a dashboard page | `src/app/dashboard/<slug>/page.tsx` under `DashboardShell` | [style-guide](docs/style-guide.md) |
| Change a plan price / credits | `backend/fly.toml` env + `backend/app/core/config.py` (display names, not keys) | [billing](docs/billing.md) |
| Restyle a button / brand element | `src/components/ui/button.tsx` + tokens in `src/app/globals.css` | [style-guide](docs/style-guide.md) |
| New DB table or column | supabase MCP `apply_migration`, then `get_advisors`; add RLS; regen `database.generated.ts` | [database](docs/database.md) |
| Ship it | [deployment](docs/deployment.md) | [deployment](docs/deployment.md) |

---

## 🗂️ Repo at a glance

```
Frontend/                         ← working dir (Next.js frontend → Vercel)
├── CLAUDE.md                     ← you are here (index)
├── docs/                         ← detailed knowledge (the map above)
├── .claude/skills/               ← axliner* skills (auto-fire on AxLiner work)
├── src/
│   ├── app/                      ← App Router: page.tsx (landing), dashboard/<slug>/, auth/, SEO pages
│   ├── components/               ← ui/ (shadcn), dashboard/, landing/, DashboardShell, MarketingNavBar
│   ├── hooks/                    ← useAuth, useOCR, useBillingStatus, useWorkspaces
│   ├── lib/api-client.ts         ← ⭐ ALL backend calls
│   └── types/database.generated.ts ← ⭐ current Supabase types (not database.ts)
├── backend/                      ← FastAPI + Celery → Fly.io (own git remote: olmocr-backend)
│   ├── app/api/v1/jobs.py        ← ⭐ core endpoints
│   ├── app/services/             ← olmocr, supabase_service, quickbooks_service, xero_service, excel
│   ├── app/models/requests.py    ← ⭐ DocumentMode + ReviewStatus literals
│   └── fly.toml                  ← runtime + env + plan/limit numbers (source of truth)
├── plan.md, plan_prompt.md       ← accounting workflow spec
├── feature_enhancement.md        ← competitor research + planned features
└── manual_setup_requirements.md  ← manual provider steps (QuickBooks, Xero, Fly secrets)
```

## 🔑 Key files cheat sheet

| File | Why it matters |
| --- | --- |
| `src/lib/api-client.ts` | Single API surface — every backend call + JWT/anon-session injection |
| `backend/app/services/supabase_service.py` | All DB CRUD (service-role) — never new-up clients elsewhere |
| `backend/app/api/v1/jobs.py` | Core batch/status/review endpoints |
| `backend/app/models/requests.py` | `DocumentMode` & `ReviewStatus` literals — extend here for new modes |
| `src/components/ui/button.tsx` + `src/app/globals.css` | Brand button variants + green tokens |
| `backend/fly.toml` | Live plan prices, credits, rate limits, retention, CORS |

## 📖 Naming & scope notes

- The repo's old name was "OlmOCR"; the **product is AxLiner**. Internal plan keys `max` / `mega`
  display as "Pro Plan" / "Max Plan" **on purpose** — don't "fix" the mismatch ([billing](docs/billing.md)).
- **QuickBooks Online AND Xero are both shipped, production destinations** — present them equally
  everywhere a publishing/accounting destination is mentioned (it's "QuickBooks or Xero", never
  QuickBooks alone). The backend ships `quickbooks_service.py` and `xero_service.py`; the UI already
  exposes both. AP = reviewed **draft bills only**; AxLiner never pays, reconciles, auto-approves, or
  deletes.
- Avoid **"accuracy %"** marketing — use field / row-level confidence flags instead.
- Anonymous trials can't save vendor memory or connect accounting systems.
