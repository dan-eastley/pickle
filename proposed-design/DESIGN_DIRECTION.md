# Pickle — UI Reinvention (proposed)

Exploratory redesigns for the `ui-reinvent` branch. Nothing here is wired into
the app — these are self-contained HTML mockups (Tailwind via CDN) you can open
in a browser to review, plus the rationale. We decide afterwards what to pursue.

- `shell.html` — the reimagined **app shell**: top bar + left sidebar nav,
  shown around a sample content area. This is the centerpiece (the current
  header and domain-tab strip are the weakest part of the product).
- `home.html` — a punchier marketing homepage.
- `../src/assets/screenshots/all-pages/` — current-state screenshots of every
  page, captured from the live deploy, for before/after comparison.

## What's wrong today

- **Two stacked bars** (top bar + domain tabs) with muddled hierarchy: the brand
  is left, the client name is *centred*, and the client/version switchers are
  crammed on the right next to a Docs link.
- The **domain tabs** don't scale — abstraction lives in dropdowns, decisions
  hangs off the end, and there's nowhere for search or future nav.
- Navigation context (where am I in domain → abstraction → artefact) is carried
  only by a thin breadcrumb.

## Direction

**Move primary navigation into a left sidebar; make the top bar a calm global
context strip.** This is the standard shape for a tool with this much structure,
and it frees real estate for search and future surfaces.

### Top bar (slim, 56px)
- Left: the gradient **Pickle** wordmark.
- Centre: a **command/search** pill ("Search capabilities, processes, decisions…")
  — the single biggest usability win; jump anywhere by name or ID.
- Right: **client · version** switcher as one segmented control, a Docs link,
  and a help/account affordance. The client name moves out of the centre.

### Left sidebar (256px, collapsible)
- A **context card**: client initials tile + name + version pill.
- **Architecture** section: the five domains as a vertical list, each with its
  domain colour accent and live artefact count; expanding a domain reveals the
  three abstraction layers (Conceptual / Logical / Physical).
- **Decisions** and **Docs** as their own items.
- Collapses to an icon rail on smaller screens.

### Carry-throughs from the current app (keep what works)
- The square-corner language, the per-domain colour system, the brand gradient
  wash, drop-shadowed content surfaces, and the unDraw/illustration accents.

## Design tokens (unchanged, for consistency)
- Brand blue `#2970FF` (brand-600 `#155EEF`), gradient hero `brand → rose`.
- Domains: business violet, data blue, integration emerald, application amber,
  solution rose. AI/Claude content: blue→red gradient.
- Square corners, 1.5px icon strokes.
