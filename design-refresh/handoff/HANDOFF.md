# Pickle UI Refresh — Developer Handoff

Design reference files (open in a browser):
- `Pickle App Refresh.dc.html` — 8 app screens: artefact, domains, domain, decisions, decision detail, discovery detail, document, architectures picker + New Decision modal
- `Pickle Homepage Refresh.dc.html` — public homepage

All values map onto the existing Tailwind config (Untitled UI palette, Inter). New: JetBrains Mono for IDs/codes/kbd.

## 1. Design language (global)

- **No border radius anywhere.** Square corners on buttons, chips, cards, inputs, modals.
- Typeface: Inter (existing). Code/IDs: `font-mono` → JetBrains Mono, 10–12px, `bg-gray-100 text-gray-500 px-1.5 py-0.5`.
- Base text 13px in app chrome; page bg `gray-50`; cards `white` with `border-gray-200` and `shadow-xs`.
- Domain accent shows as a **3px left border** on the page-title card and row highlights, never as tinted card backgrounds.
- Domain colours (unchanged, from `enums.js`): business violet-500/700, data blue-500/700, application amber-500/700, integration emerald-500/700, solution rose-500/700. PICKLE logo gradient `#004EEB → #E11D48` (unchanged).
- Links: `text-blue-600 underline underline-offset-4` for tertiary actions.

## 2. Header (`TopBar.jsx`) — 56px single row

Left → right:
1. PICKLE wordmark (gradient text, letter-spacing 0.18em, 17px/700). Tagline removed from app header (kept on homepage only).
2. 1px divider (`gray-200`).
3. **Context switcher chip** (replaces separate architecture/transition breadcrumb row): `bg-gray-100 hover:bg-gray-200 h-8 px-3` containing `{Architecture name} / {transition}` — transition in mono 12px gray-500, chevron-down. Opens the picker. Hidden on the architectures picker page.
4. Spacer.
5. **Search "Jump to…"**: `w-[300px] h-8 bg-gray-100 focus:bg-white focus:border-gray-300`, `/` kbd hint in mono with 1px border.
6. Divider, then 32px square avatar `bg-blue-600 text-white text-xs font-semibold`.

Bottom border: **2px solid blue-600** (brand line, replaces gray border).

## 3. Nav row (`DomainNav.jsx`) — 42px, replaces old domain nav + breadcrumb band

- Tabs left: Overview, then 5 domains with 13px domain icon (from `DomainIcon.jsx`) in domain colour.
- Active tab: domain-tinted bg (e.g. `bg-violet-50 text-violet-700`) + `inset 0 -2px 0` underline in domain colour. Inactive: `text-gray-500 hover:text-gray-700 hover:bg-gray-50`.
- Right-aligned: **Decisions** and **Discovery** tabs with count badges (`bg-blue-50 text-blue-700` / `bg-emerald-50 text-emerald-700`, 11px/600).
- Breadcrumb moves INTO the content column (12px, `gray-500`, `/` separators), directly above the action bar.
- Both header and nav are sticky.

## 4. Action bar (new `PageActionBar` component, replaces `ActionBar.jsx` usage)

One pattern on every page: white card, `border-gray-200`, 3px left border in domain accent, `px-5 py-3.5`, flex row:
- 38px icon tile (domain-tinted bg + domain icon) — artefact/domain pages only.
- Title block: `h1` 17px/600 + mono ID chip + type chip (e.g. "Conceptual · Catalogue"), description 13px gray-500 single-line ellipsis.
- Actions right, strict order **tertiary → secondary → primary**, all h-8 (32px):
  - Tertiary: underlined link (e.g. "View Decisions").
  - Secondary: white, `border-gray-300`, 13px/500 (e.g. "New Discovery").
  - Primary: filled in **domain colour** on domain-scoped pages (violet-600 on Business), blue-600 on global pages, 13px/600, optional 13px icon.

## 5. Stats bar (new `StatsBar` component) — artefact pages, echoed on list pages

Attached directly beneath the action bar (`border-top: none`, shares the card edge):
- Left: stat cells `px-5 py-2.5`, right-divided by `gray-100`: 19px/600 number over 11px/600 uppercase gray-500 label. Content: entry counts, levels, related artefacts, open decisions.
- Right: "Updated {date} by {user}" 12px, divider, then h-7 utility buttons: Share, Download (with chevron menu), and a dark mono chip `bg-gray-800 text-gray-200` with the raw filename (`BUS-CAP.json`) linking to the JSON.
- The read-only/governance notice becomes a single 12px line below the stats bar with a lock icon, plus a collapsible "Purpose & related artefacts" toggle (chevron, rotates 90°) revealing a 2-col grid: purpose bullets | related-artefact chips (`relationship label + name + mono ID`).

## 6. Tables & rows

- Row padding: `py-2` (dense) — the app default; headers `py-2`, 11px/600 uppercase gray-500 on `gray-50`.
- ID chips mono 11px on gray-100. Importance/status chips 11px/500 tinted (strategic violet, differentiating blue, foundational gray).
- Key artefact rows: 3px amber left border + amber tint bg, "KEY" chip 10px amber.
- Abstraction group headers: dark band `bg-gray-800 text-white py-2` with layer chip ("What & Why") — replaces the old blue band.

## 7. Decisions

- List: status groups with tinted group headers (Draft gray, Proposed blue, Accepted green, Staged dark-green, Committed gray-800, Rejected red); rows = mono ID chip + title + one-line desc + domain chip + date.
- Stats bar variant: Total / Accepted / Staged / Committed counts left, filter selects right.
- Detail: action bar (status-green left border, "View on GitHub" tertiary, Reject secondary, "Stage Changes" primary blue) → stats bar (dimensions analysed, advisory findings, artefacts affected, requirements + workflow stepper Draft→Proposed→Accepted→Staged→Committed right-aligned) → 2:1 grid: Change card (Context/Problem/Direction) + 7-dimension analysis table (verdict chips: Pass green, For blue, Advisory amber) | Scope + History sidebar.

## 8. Discovery detail

Action bar with agent-gradient icon tile (`#004EEB→#7C3AED`), DSC mono ID, Active chip; "read-only · nothing is changed" as description. Stats: artefacts read / platforms found / interfaces traced + run timestamp. Body 2:1: question (gray card) + answer (blue-50 card) | evidence-trail artefact chips.

## 9. Document view (SOL-SVI)

Action bar + stats (documents / sections / related), then 260px document list (active = rose left border + tint) | document body: title + Approved chip + author/audience/version meta, numbered sections, max-width 75ch.

## 10. Architectures picker

No context chip, no domain nav (public-style chrome). Action bar (New Architecture primary blue) + stats bar (architectures/transitions/decisions/discoveries). One card per architecture: 38px coloured initial tile, name over "ARCHITECTURE" eyebrow, transition count, mono code, chevron; second row of domain-coloured stat chips (replaces old 5-col metric tables).

## 11. New Decision modal

640px, square corners, `rgba(16,24,40,.55)` overlay. Header: icon tile + title + one-line explainer + close. Body: **Scope pre-filled from current artefact** (domain-tinted chip + artefact chip + "Change scope" link), Title input, Context textarea, Proposed direction textarea (all square, `border-gray-300`, focus `border-blue-600`). Footer on gray-50: lock note "Created as Draft — analysis runs when you propose it", Cancel secondary, "Create Draft Decision" primary in domain colour.

## 12. Homepage (`HomePage.jsx`) — same content, sales-forward

- Header 60px: wordmark+tagline stacked left; "How it works", "Frameworks" links; "View Architectures" primary button. 2px blue bottom border.
- Hero: 2-col. Left: status-dot eyebrow chip, 46px/800 headline "Enterprise architecture that *governs itself*" (gradient on last words), 17px subcopy, 4 checkmark value bullets, primary + secondary CTAs. Right: **mock of the refreshed app UI** (static, ~11px scale) with floating ADR card. Below: domain colour-strip band (5 coloured squares + labels).
- Sections, each with 12px uppercase blue eyebrow + 32px/700 heading: Why Pickle (3 pillar cards, top-border accent blue/violet/rose, takeaway tint box); The model (5 domain cards + 3 layer cards + 4 format cards); Foundation band (dark gradient `#00359E→#3538CD→#9F1239`, STR/PRN/GRD cards, "15 foundation artefacts" line); Analysis pipeline (8-card grid: 7 dimensions with tag chips + question line, 8th = Human review on gray); Frameworks (TOGAF/SAFe/Zachman/UAF cards with 4 mapping lines each); Discovery (copy + chat-style agent card); final CTA + mono footer.

## Implementation notes

- Components to add: `PageActionBar`, `StatsBar`, `WorkflowStepper`, `CountBadge`. Components to modify: `TopBar`, `DomainNav` (absorb breadcrumb), `Button` (square, h-8, domain-colour variant), `Badge` (square), modals.
- Remove: `rounded-*` classes globally, the separate breadcrumb band, header tagline, old metric tables on picker cards.
- Keep: routes/URLs, `enums.js` colours, logo gradient, all copy except homepage hero headline.
