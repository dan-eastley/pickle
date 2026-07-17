# Security Review — `features/codebase-harden`

Branch from `develop`. As with the earlier refactor, the repo's
`validate-branch.yml` only accepts `features/<feature-id>`, so the branch is
`features/codebase-harden` (the instructions' bare `codebase-harden` would be
rejected by CI).

Reviewer: full top-to-bottom walk of the application (`src/`) and repo-level
scripts. Every fix below is committed; verification (`build`, `tsc`, `eslint`,
`prettier`, `vitest`) is green — **138 tests** (was 116), including 13 new
security tests.

## Coverage of the walk

| Area | Files reviewed | Verdict |
|---|---|---|
| Serverless API (trust boundary) | `api/github.ts`, `api/content.ts`, `api/auth/[...all].ts` | **Fixed** (2 endpoints hardened) |
| Auth core | `lib/auth.ts`, `lib/authClient.ts`, `lib/permissions.ts` | 1 fix (`trustedOrigins`); permissions model sound |
| DB access | `db/index.ts`, `db/schema.ts`, all Drizzle queries in `api/github.ts` | Clean — parameterized throughout (see Injection) |
| Path handling | `assertSafeIds`, `api/content.ts` validation, `lib/gitTree.ts`, `vite.config.js` shim | 1 fix (dev shim); prod guards already correct |
| XSS surface | `components/ui/Markdown.jsx`, `Illustration.jsx`, `index.html`, all `{...p}` spreads | Clean; CSP added as defence-in-depth |
| Secrets | full tree + `git log` history scan | Clean — no committed secrets |
| Error handling | `api/*` catch blocks, `email.ts`, client fetch paths | 1 fix (generic 500s) |
| Logging | every `console.*` in the app | 1 improvement (denial logging); no secret/PII leakage found |
| Security headers | `vercel.json`, cookie flags (Better Auth defaults) | **Fixed** (headers added) |
| React app (pages/components/hooks/context) | all of `pages/`, `components/`, `hooks/`, `context/` | 1 fix (`ArchitectureContext` auth-aware) |

## Issues found & fixed

### [Critical] `/api/github` granted admin to anonymous callers when auth env was missing
- **Focus area:** RBAC · **Commit:** `3e6dcf47`
- `resolvePermissions` returned `{ authenticated: true, isAdmin: true }` whenever `missingAuthEnv()` was non-empty — with **no Vercel check**. A production deploy that lost `BETTER_AUTH_SECRET`/`DATABASE_URL` (a plausible config slip) would silently turn every write — architecture edits, access grants, decision commits — into an open, unauthenticated admin endpoint.
- **Fix:** fail-closed on Vercel (missing auth env → `ANONYMOUS`, denied); the permissive local-admin path is now reachable only off-Vercel (local dev). Locked in by `fails closed on Vercel when auth env is missing` + `stays permissive off-Vercel` tests.

### [High] `/api/github` read actions were unauthenticated
- **Focus area:** RBAC / Input · **Commit:** `3e6dcf47`
- `config` (owner/repo/env/branch URL) and `next-id` were served to anyone. That leaks tenant/repo identity and decision numbering.
- **Fix:** all GET actions now require a session; `members` was already gated. Denials logged. Test: `401s the read-only GET actions when unauthenticated`.

### [High] `/api/content` served the entire architecture tree with no auth
- **Focus area:** RBAC / IDOR · **Commit:** `859a513a`
- The endpoint backing `/api/arch/**` read any file under `architectures/` for any caller, while the UI (`RequireAuth`, `usePermissions`) implied access was gated — a pure client-side control. Anyone could enumerate every client's architecture data directly.
- **Fix:** `prefix=architectures` now requires a Better Auth session (fail-closed 503 on deployments without auth; local dev stays open). Docs/schemas remain public. Confirmed with the maintainer that production auth is configured and enforced, so gating reads matches the intended posture.
- **Cache safety:** gated responses switched from `s-maxage=30` (shared/CDN) to `private, max-age=0, must-revalidate`, so an authenticated response can never be CDN-cached and replayed to an anonymous caller.
- **Client:** `fetchJson` errors now carry `.status`; `ArchitectureContext` treats 401/403 as the expected anonymous empty-state (no error screen) and reloads on session change. 8 new tests in `api/content.test.js`.

### [Medium] No security response headers
- **Focus area:** Security Headers · **Commit:** `9c912ab9`
- No CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, or `Permissions-Policy`.
- **Fix:** added all of the above via `vercel.json`. CSP allow-lists only the origins the app uses (gtag/GA, Google Fonts), with `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`. **Tradeoff:** `script-src` retains `'unsafe-inline'` for the gtag bootstrap in `index.html`, and `style-src` for React inline styles + the fonts stylesheet. See Remaining risks.

### [Medium] Unexpected errors leaked internal messages to clients
- **Focus area:** Error Handling · **Commit:** `3e6dcf47`
- The `/api/github` catch block returned `err.message` for *any* error, so an unexpected failure (e.g. a `pg` driver error) could echo internal detail to the client.
- **Fix:** only deliberate `HttpError`s return their message; anything else returns a generic `Internal server error` with details logged server-side. Test: `returns a generic message for unexpected errors`.

### [Low] Better Auth trusted `http://localhost:3000` in production
- **Focus area:** RBAC / CSRF · **Commit:** `84239bca`
- `trustedOrigins` unconditionally included localhost, weakening Better Auth's origin/CSRF checks on the deployed site.
- **Fix:** localhost is trusted only off-Vercel.

### [Low] Dev-only `/api/arch` shim lacked the path-traversal guard
- **Focus area:** Injection / Path Traversal · **Commit:** `84239bca`
- The Vite dev middleware forwarded the path straight to GitHub without the `..` guard the deployed `/api/content` has. Dev-only surface; fixed for parity.

## Verified clean (no change needed)

- **SQL injection:** every DB call uses Drizzle's parameterized builder (`eq`/`and`, `.values()`, `.onConflictDoUpdate()`); no string-built SQL anywhere.
- **Path traversal (prod):** `assertSafeIds` (regex allow-list, explicit `..` reject) on `/api/github`; `/api/content` rejects leading `/` and any `..` segment and allow-lists three prefixes.
- **Prototype pollution:** `updateFinding` already guards `sectionKey` against `__proto__`/`prototype`/`constructor`.
- **XSS:** the only `dangerouslySetInnerHTML` ([`Illustration.jsx`](src/components/ui/Illustration.jsx)) renders build-time-bundled static SVGs (`import.meta.glob`), never user input. `Markdown.jsx` uses `react-markdown` (no `rehype-raw`), so raw HTML in authored/AI content is not rendered. External links carry `rel="noopener noreferrer"`.
- **Secrets:** no hardcoded credentials in the tree; `git log` history scan clean. `.env` is git-ignored (`!.env.example` kept). All secrets read from `process.env`.
- **Command injection:** no `exec`/`spawn`/`eval`/`new Function` on any request-derived input.
- **Cookies:** sessions are Better Auth-managed (HttpOnly + SameSite + Secure in prod) — not hand-rolled.

## Items requiring human action

1. **Post-deploy smoke suite must authenticate.** `tests/e2e/smoke.spec.js` navigates architecture routes anonymously against the live deployment; with reads now gated it needs a seeded test user + a Playwright `storageState` injected via a workflow secret (`post-deploy.yml` currently carries no credentials). I did **not** fabricate a test auth-bypass — that is an infra/CI decision. Until this lands, the architecture-route smoke checks against a gated deployment will fail (the homepage/clients-nav checks still pass). **Owner action.**
2. ~~**Assess previously exposed data.**~~ **N/A — confirmed by the maintainer:** this is not yet a production app with live data, so the prior world-readability of `/api/content` exposed no real tenant content. No exposure assessment or rotation needed. (No credentials were ever exposed regardless — the data is architecture models.)
3. **Confirm prod env is complete.** The fail-closed change means a deployment missing `BETTER_AUTH_SECRET`/`DATABASE_URL` will now 503 architecture data (previously it silently served everything as admin). Verify prod has the full auth env set. **Owner action.**
4. **Tighten CSP later (optional).** Move the gtag bootstrap out of `index.html` into a module so `script-src 'unsafe-inline'` can be dropped; consider a nonce/hash for the remaining inline needs.

## Remaining risks (not fixed, with rationale)

- **CSP `'unsafe-inline'`** on script/style — required by the inline gtag bootstrap and React's runtime inline styles/Tailwind. Removing it needs an app change (external gtag module + nonce strategy) beyond the "minimal, targeted" scope of this pass; documented as human-action #4.
- **View authorization is coarse.** `ACTIONS.VIEW` is any-authenticated (per the existing `[RAS-3]` design note in `permissions.ts`): any signed-in user can read any architecture's content, regardless of membership. This is the app's intended model today, not a regression — flagged so it's a conscious choice. Per-architecture read gating would be a product decision.
- **Analytics to Google** (gtag) is third-party data egress; unchanged, and now explicitly bounded by CSP `connect-src`/`img-src`.

## Commits

```
3e6dcf47 fix(security): fail closed on deployments; gate read-only GETs; generic 500s
859a513a fix(security): session-gate architecture content; keep it out of shared caches
9c912ab9 fix(security): add CSP, HSTS, and hardening response headers
84239bca fix(security): drop localhost trusted origin on deployments; guard dev-shim paths
132a8f6f test(security): lock in the /api/content session gate and validation
```
