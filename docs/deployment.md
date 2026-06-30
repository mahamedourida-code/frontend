# Deployment - shipping & QA

> Parent: [CLAUDE.md](../CLAUDE.md) | Related: [architecture](architecture.md) | [tooling](tooling.md)

Two separate targets. Ship only the unit(s) the change touched. **Commit messages are ONE word.**
**Push/deploy by default after code changes** unless the user explicitly says not to push. Frontend
changes push to GitHub so Vercel auto-builds; backend changes push to the backend remote and deploy
with Fly CLI. Run local QA, smoke tests, Playwright checks, or post-deploy verification only when the
user explicitly asks.

## Frontend -> Vercel (auto-deploy on push)

```bash
git add -A
git commit -m "<one word>"
git push                       # -> mahamedourida-code/frontend ; Vercel builds automatically
```
- **NEVER** `vercel deploy`, **NEVER** `npm run build` - Vercel owns the build.
- A `credential-manager-core is not a git command` warning is harmless; the push still succeeds -
  verify with `git log` / the remote, don't retry blindly.
- Live: `https://www.axliner.com` (also `frontend-six-rho-53.vercel.app`).

## Backend -> Fly.io

```bash
cd backend
git push olmocr-backend                    # backend's own remote
fly deploy -a backend-lively-hill-7043     # slow, wait for completion
```
App `backend-lively-hill-7043`, region `arn`, process groups `app` + `worker`. Auto-stops idle.

## Secrets

- **Backend (Fly):** `fly secrets set KEY=VALUE -a backend-lively-hill-7043`. Required:
  `OLMOCR_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
  `SUPABASE_JWT_SECRET`, `REDIS_URL`, `ALLOWED_ORIGINS`, `LEMONSQUEEZY_*`, `QUICKBOOKS_CLIENT_ID`,
  `QUICKBOOKS_CLIENT_SECRET`, `QUICKBOOKS_TOKEN_ENCRYPTION_KEY`.
- **Frontend (Vercel -> Settings -> Environment Variables):** `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL` (`https://backend-lively-hill-7043.fly.dev`),
  `NEXT_PUBLIC_WS_URL` (`wss://backend-lively-hill-7043.fly.dev`), `NEXT_PUBLIC_GOOGLE_CLIENT_ID`,
  `NEXT_PUBLIC_FACEBOOK_APP_ID`.
- **NEVER commit** `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `QUICKBOOKS_TOKEN_ENCRYPTION_KEY`,
  the OlmOCR key, or any `LEMONSQUEEZY_*` secret. `NEXT_PUBLIC_*` is the only public-safe prefix
  (anon key is fine; service-role/JWT secret is backend-only).
- **CORS** in production allows `https://axliner.com`, `https://www.axliner.com`, and any
  `https://*.vercel.app` (regex) - see `backend/fly.toml`.

## QA when explicitly requested

```bash
curl https://backend-lively-hill-7043.fly.dev/api/v1/health
curl https://backend-lively-hill-7043.fly.dev/api/v1/billing/plans
```
When requested, use **playwright MCP**: navigate to `https://www.axliner.com` (give Vercel a moment;
re-check if the old build is still served), take a screenshot, inspect console messages, and spot-check
the change actually landed (`browser_evaluate` for visual fixes). Clean up artifacts. For DB-linked
changes, confirm advisors are clean (`get_advisors`). **Report honestly** if the smoke test fails or the
build is still propagating - don't claim "shipped and verified" until you've seen green.

## Guardrails

- Confirm before force-pushes or anything destructive to a remote.
- Don't bypass `NEXT_PUBLIC_API_URL` with a hardcoded provider URL.
