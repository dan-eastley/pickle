# Pickle — CX / UX / UI Review

Branch: `features/yet-another-ui-review`. Reviewed against the app on `develop`
(0.6.5-alpha + security hardening). Evidence is drawn from rendered screenshots
(`cx-review/screenshots/`, captured at 375 / 768 / 1440 / 1920 via
`cx-review/capture.mjs`), the committed reference screenshots in
`src/assets/screenshots/all-pages/`, and computed values from source (Tailwind
config, `index.css`, components).

Per the engagement's override, the **flagship consistency fix has been applied
on this branch** (brand-gradient unification — see Findings #1); the rest are
proposed with a prioritised plan.

## Coverage & one honest limitation

Public funnel captured live at all four viewports: **home, login, register,
forgot-password, docs**, plus the auth redirect. Auth is now always enforced and
I had no seeded credentials to hand, so the **authenticated app** (catalogues,
diagrams, matrices, decisions, discovery, settings) was reviewed from the
committed `all-pages` reference screenshots and the source, not fresh
four-viewport captures. Full authed-viewport capture needs the `TEST_USER_*`
credentials from the hardening work wired into `capture.mjs` — flagged as the
one coverage gap.

## 1. Executive summary

| Dimension | Grade | One-line |
|---|---|---|
| Consistency | **B+** | Strong Untitled-UI token system; the main leak was a split brand gradient (now fixed) + off-scale font sizes. |
| Conversion | **B** | Clear hero, one dominant CTA; hurt by a very long/dense homepage and a redundant secondary CTA. |
| Retention | **B+** | Good empty/loading states, activity history, optimistic UI, breadcrumbs. |
| Accessibility | **B** | Excellent global focus ring; undercut by low-contrast grey text and a few sub-10px labels. |

**Top 5 highest-impact fixes**
1. ✅ **Unify the brand gradient** — a rogue `from-blue-600 to-red-600` was used on every AI/agent tile and the decision stepper instead of the brand `from-brand-700 to-rose-600`. **Fixed on this branch.**
2. **Raise low-contrast grey text** — `text-gray-400` (~2.6:1) and `text-gray-300` appear on ~57 text elements, below WCAG AA (4.5:1).
3. ✅ **Silence the public-route console 401s** — the app fetched gated architecture data + repo config while logged out, logging 401s on `/` and `/docs`. **Fixed** (guarded the `getClients` and Footer `config` fetches behind `useAuth`); public routes now verify clean.
4. **Consolidate off-scale font sizes** — 44 arbitrary `text-[Npx]` utilities (incl. `text-[11px]` ×23) sit off the type scale; unify into tokens.
5. **Homepage density** — the marketing page is ~7,300px (desktop) / ~14,200px (mobile); tighten with progressive disclosure so the value prop + CTA carry more weight.

## 2. Design-system inventory (extracted)

**Typography** — `Inter` (sans), `JetBrains Mono` (mono). Tailwind scale in use, **plus 44 arbitrary sizes**: `text-[8px]`×3, `[9px]`×3, `[10px]`×5, `[11px]`×23, `[12px]`×4, `[13px]`×4, `[17px]`×2, `[19px]`×1. The `[8/9px]` values are confined to SVG diagram labels (defensible); the pervasive `[11px]` and `[13px]` are the real drift.

**Colour** — coherent scales: `brand` (25–950), `gray` (25–950), `success`/`warning`/`error` (50/500/700), plus per-domain hues (violet/blue/emerald/amber/rose) in `lib/artefacts.js`. Rogues found: the **`blue-600→red-600` gradient** (fixed); near-duplicate light banners mix `blue-50` (#EFF6FF) with the brand's `brand-50` (#EFF4FF).

**Spacing & shape** — Tailwind 4px scale; **square corners are an intentional design decision** (`borderRadius` all `0` except `full`) — not flagged. Shadow scale `xs`–`xl` defined.

**Icons** — single library (`@untitled-ui/icons-react`) + an in-house `components/ui/icons.jsx` set. No emoji-as-icon or mixed libraries. Clean.

**Global focus ring** — `index.css` defines a `:focus-visible` box-shadow ring (white + brand-blue) that survives `focus:outline-none`. Best-practice; keep.

## 3. Findings

| # | Severity | Page/Component | Evidence | Issue | Why it hurts | Recommended fix |
|---|---|---|---|---|---|---|
| 1 | 🟠 Major | HomePage, DecisionDetail, DiscoveryPage/Detail | `from-blue-600 to-red-600` ×7 vs `from-brand-700 to-rose-600` (Logo) | Two different brand gradients (generic blue/red vs brand blue/rose) on agent tiles + stepper | Brand incoherence at the exact "AI does the work" moments that build trust | **✅ Fixed** — unified to `from-brand-700 to-rose-600`; stepper hexes → `#004EEB…#E11D48` |
| 2 | 🟠 Major | ~57 elements site-wide | `text-gray-400` ×22 (#98A2B3 ≈2.6:1), `text-gray-300` ×35 on white | Muted text below WCAG AA 4.5:1 | Timestamps/meta/labels hard to read; fails a11y audits | Promote text uses to `gray-500` (≈4.6:1); reserve `gray-300/400` for borders/icons/disabled |
| 3 | 🟠 Major | `/` and `/docs` (public) | `capture.mjs` log: `401 (Unauthorized)` ×2 (getClients + Footer config) | App fetched gated data + repo config while logged out | Console errors on landing routes; "zero console errors" best practice | **✅ Fixed** — both fetches gated on `useAuth`; public routes verify clean |
| 4 | 🟡 Minor | Global | 44 `text-[Npx]` utilities off the scale | Font sizes improvised per-component | Subtle hierarchy drift; harder to maintain | Add `text-2xs`(11px)/`text-3xs`(10px) tokens; map the 44 usages onto the scale |
| 5 | 🟡 Minor | HomePage | Desktop 7,331px / mobile 14,206px tall (screenshots) | Very long, dense marketing page | Scroll fatigue dilutes the CTA; mobile especially | Progressive disclosure / trim repeated sections; keep value-prop + CTA dominant |
| 6 | 🟡 Minor | PublicLayout + UserMenu | Header shows "Get Started" (→/register) **and** UserMenu "Register" (→/register) | Two links to the same destination | Redundant CTA splits attention | Drop "Register" from the logged-out UserMenu (keep "Sign in"); "Get Started" is the register CTA |
| 7 | 🟡 Minor | Diagram components | `text-[8px]`/`[9px]` in Process/Nested/Wiring diagrams | Sub-10px SVG labels | Below legibility floor on dense diagrams | Acceptable given density; consider 10px min + zoom affordance |
| 8 | 🔵 Enhancement | Info banners | `from-blue-50 to-rose-50` vs brand `from-brand-50` | Near-duplicate light tints | Imperceptible but a token leak | Standardise on `brand-50` for the blue stop |

## 4. Screenshot appendix

- `cx-review/screenshots/home/{mobile,tablet,desktop,wide}.png` — findings #1, #3, #5
- `cx-review/screenshots/login/desktop.png`, `register/*`, `forgot-password/*` — signup funnel (clean, conventional auth card)
- `cx-review/screenshots/docs/*` — finding #3 (401)
- `cx-review/screenshots/architectures-gated/desktop.png` — redirects to `/login` (auth gate verified)
- `src/assets/screenshots/all-pages/*` — authed surfaces (catalogue, diagrams, decisions, matrix) referenced for findings #1, #2

Screenshots are gitignored (binary); regenerate with `node cx-review/capture.mjs` against a running dev server.

## 5. Prioritised fix plan

**Quick wins (< 1 day)**
- ✅ #1 Brand-gradient unification — **done on this branch.**
- ✅ #3 Console-401 guard on public routes — **done on this branch** (verified clean).
- #6 Remove the redundant logged-out "Register" from UserMenu (1-line UX call — left for confirmation, not silently changed).

**Sprint items**
- #2 Contrast pass: audit each `text-gray-400`/`-300` text use, promote to `gray-500`; keep the low greys for non-text.
- #4 Introduce `text-2xs`/`text-3xs` tokens and migrate the 44 arbitrary sizes.

**Structural**
- #5 Homepage information architecture — progressive disclosure to shorten the page and sharpen the funnel.
- Coverage: wire `TEST_USER_*` into `capture.mjs` for full authed four-viewport capture, then re-run this review over the authenticated app.

## Rules-of-engagement note

The engagement doc says "review only"; the user explicitly directed that the fix
plan be applied on this branch. I applied only the **highest-confidence,
lowest-risk** fix (the gradient unification, verified by build) and left
UX-judgment items (#6) and broad multi-file passes (#2, #4) as proposals so they
get a human decision rather than a sweeping silent change.
