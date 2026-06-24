// Generates tests/use-cases.json — a collectively-exhaustive, mutually-exclusive
// corpus of use cases for an enterprise-architecture management tool, expressed
// in a standard user-story format with MoSCoW priority and t-shirt complexity.
//
// Each FUNCTION is a distinct capability the product should support (mutually
// exclusive); together the FUNCTIONS aim to be collectively exhaustive across
// the tool's surface. Each function is expanded into one use case per actor
// role, so the corpus spans every role, complexity, and priority.
//
//   node tests/generate-use-cases.mjs
//
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Complexity (t-shirt) and priority (MoSCoW) vocabularies.
const COMPLEXITY = ['XS', 'S', 'M', 'L', 'XL']
const PRIORITY = ['Must Have', 'Should Have', 'Could Have', "Won't Have"]

// Roles (ids align with config/roles.json) used as use-case actors.
const R = {
  ea: 'Enterprise Architect', ba: 'Business Architect', da: 'Data Architect',
  aa: 'Application Architect', ia: 'Integration Architect', sa: 'Solution Architect',
  seca: 'Security Architect', infra: 'Infrastructure Architect', ta: 'Technical Architect',
  bana: 'Business Analyst', pana: 'Process Analyst', dana: 'Data Analyst', sana: 'Systems Analyst',
  pm: 'Product Manager', po: 'Product Owner', eo: 'Epic Owner',
  pd: 'Programme Director', dm: 'Delivery Manager', rte: 'Release Train Engineer',
  el: 'Engineering Lead', arb: 'Architecture Review Board',
  cio: 'Chief Information Officer', cto: 'Chief Technology Officer', cdo: 'Chief Data Officer',
  ciso: 'Chief Information Security Officer', coo: 'Chief Operating Officer', cdigo: 'Chief Digital Officer',
}

// Curated functions. Each: epic, title, goal, benefit, complexity, priority, roles, accept[]
const FUNCTIONS = [
  // ── Browse & navigate ────────────────────────────────────────────────────
  { epic: 'Browse & Navigate', title: 'Browse the architecture by domain', goal: 'browse the architecture organised by the five domains', benefit: 'I can find the area I care about quickly', complexity: 'XS', priority: 'Must Have', roles: [R.ea, R.ba, R.coo], accept: ['All five domains are listed with descriptions', 'Selecting a domain shows its artefacts'] },
  { epic: 'Browse & Navigate', title: 'Drill into an abstraction layer', goal: 'drill from a domain into its conceptual, logical, and physical layers', benefit: 'I can work at the right level of detail', complexity: 'S', priority: 'Must Have', roles: [R.sa, R.ta, R.bana], accept: ['Each layer lists only its artefacts', 'Breadcrumb reflects domain and layer'] },
  { epic: 'Browse & Navigate', title: 'Follow a related-artefact link', goal: 'jump from an artefact to the artefacts it feeds or derives from', benefit: 'I can trace how artefacts relate', complexity: 'S', priority: 'Should Have', roles: [R.ea, R.aa], accept: ['Related artefacts are listed with the relationship type', 'Links navigate to the related artefact'] },
  { epic: 'Browse & Navigate', title: 'See an artefact’s purpose and audience', goal: 'see what an artefact is for and who it is written for', benefit: 'I know whether it is relevant to me', complexity: 'XS', priority: 'Should Have', roles: [R.po, R.dm], accept: ['Purpose is shown on the artefact header', 'Audience roles are listed'] },

  // ── Catalogues ───────────────────────────────────────────────────────────
  { epic: 'Catalogues', title: 'View a business capability catalogue', goal: 'view the hierarchical business capability catalogue', benefit: 'I understand what the organisation does', complexity: 'S', priority: 'Must Have', roles: [R.ba, R.coo, R.pana], accept: ['Capabilities render as a level 1–3 hierarchy', 'Each capability shows id, name, and description'] },
  { epic: 'Catalogues', title: 'View a data domains & concepts catalogue', goal: 'view the data domains and conceptual entities', benefit: 'I understand the organisation’s data landscape', complexity: 'S', priority: 'Must Have', roles: [R.da, R.cdo, R.dana], accept: ['Data domains group their concepts', 'Concepts link to the conceptual data model'] },
  { epic: 'Catalogues', title: 'View principles and guardrails', goal: 'view the architecture principles and guardrails for a domain', benefit: 'I can design within the rules', complexity: 'S', priority: 'Must Have', roles: [R.ea, R.arb, R.seca], accept: ['Principles and guardrails are listed per domain', 'Each states its rationale'] },
  { epic: 'Catalogues', title: 'View the application landscape', goal: 'view the application domains, platforms, and physical applications', benefit: 'I know what systems exist', complexity: 'M', priority: 'Must Have', roles: [R.aa, R.cio, R.sana, R.infra], accept: ['Platforms group under application domains', 'Physical applications show lifecycle status'] },

  // ── Diagrams ─────────────────────────────────────────────────────────────
  { epic: 'Diagrams', title: 'View the business capability model', goal: 'view the capabilities as a nested card diagram', benefit: 'I can see the capability structure visually', complexity: 'M', priority: 'Should Have', roles: [R.ba, R.ea], accept: ['Capabilities render as nested cards', 'Selecting a card opens its detail'] },
  { epic: 'Diagrams', title: 'View the business process model', goal: 'view processes as a level 1–3 chevron flow', benefit: 'I can follow the process sequence', complexity: 'M', priority: 'Should Have', roles: [R.pana, R.bana], accept: ['Processes render as chevrons by level', 'Per-L1 drill-down is available'] },
  { epic: 'Diagrams', title: 'View the integration wiring diagram', goal: 'view platform-to-platform integration wiring', benefit: 'I can see how systems connect', complexity: 'L', priority: 'Could Have', roles: [R.ia, R.aa], accept: ['Platform connections render with flow counts', 'Per-pair interface drill-down is available'] },
  { epic: 'Diagrams', title: 'Fullscreen a diagram', goal: 'expand a diagram to fullscreen', benefit: 'I can present and inspect it clearly', complexity: 'XS', priority: 'Could Have', roles: [R.sa, R.pd], accept: ['A diagram opens fullscreen', 'Escape returns to the page'] },

  // ── Matrices ─────────────────────────────────────────────────────────────
  { epic: 'Matrices', title: 'View a capability-to-process matrix', goal: 'view which processes realise which capabilities', benefit: 'I can check capability coverage', complexity: 'M', priority: 'Should Have', roles: [R.ba, R.pana], accept: ['Rows and columns map the two entity sets', 'Intersections show the relationship'] },
  { epic: 'Matrices', title: 'View a capability-to-application matrix', goal: 'view which platforms support which capabilities', benefit: 'I can spot gaps and overlaps', complexity: 'M', priority: 'Should Have', roles: [R.aa, R.ea], accept: ['Platforms map to level 2 capabilities', 'Unsupported capabilities are visible'] },

  // ── Documents ────────────────────────────────────────────────────────────
  { epic: 'Documents', title: 'Read an architecture vision', goal: 'read the architecture vision for a programme', benefit: 'I understand the strategic direction', complexity: 'S', priority: 'Must Have', roles: [R.cio, R.cdigo, R.pd], accept: ['Vision renders with its sections and contents nav', 'Stakeholders and concerns are shown'] },
  { epic: 'Documents', title: 'Read a solution intent', goal: 'read the solution intent for an initiative', benefit: 'I know what is being built and why', complexity: 'M', priority: 'Must Have', roles: [R.sa, R.po, R.eo], accept: ['Fixed and variable intent are distinguished', 'Capabilities and platforms are referenced'] },
  { epic: 'Documents', title: 'Read an interface specification', goal: 'read the physical interface specification', benefit: 'I can build against the contract', complexity: 'M', priority: 'Should Have', roles: [R.ia, R.el, R.ta], accept: ['Protocol, auth, and data format are specified', 'Endpoints and error handling are documented'] },

  // ── Search & discovery ───────────────────────────────────────────────────
  { epic: 'Search', title: 'Search across the architecture', goal: 'search for any artefact, capability, or entity by name or id', benefit: 'I can jump straight to what I need', complexity: 'L', priority: 'Should Have', roles: [R.ea, R.sa, R.bana], accept: ['A query matches across artefacts and entities', 'Results link to the item'] },
  { epic: 'Discovery', title: 'Raise an architecture discovery', goal: 'ask the Virtual Architect Agent a question about the architecture', benefit: 'I get a point-in-time answer without manual digging', complexity: 'L', priority: 'Could Have', roles: [R.ea, R.cdo, R.coo], accept: ['A discovery captures title, context, and request', 'It is stored as a versioned record'] },
  { epic: 'Discovery', title: 'Review past discoveries', goal: 'review active and archived discoveries', benefit: 'I can reuse earlier analysis', benefitAlt: '', complexity: 'S', priority: 'Could Have', roles: [R.sa, R.dm], accept: ['Active and archived pots are separated', 'A discovery opens to its findings'] },

  // ── Decisions / governance ───────────────────────────────────────────────
  { epic: 'Decisions', title: 'Raise an architecture decision', goal: 'raise an ADR with context, problem, and proposal', benefit: 'changes are governed and traceable', complexity: 'M', priority: 'Must Have', roles: [R.sa, R.ea, R.ta], accept: ['A decision captures context, problem, and proposal', 'It is created as a draft on a branch'] },
  { epic: 'Decisions', title: 'Review automated analysis of a decision', goal: 'review the seven analysis streams generated for a decision', benefit: 'I see impact, integrity, and alignment before approving', complexity: 'L', priority: 'Must Have', roles: [R.arb, R.ea], accept: ['Each analysis stream lists findings', 'Findings can be accepted or declined'] },
  { epic: 'Decisions', title: 'Accept or decline architecture changes', goal: 'accept or decline each proposed architecture change', benefit: 'only approved changes are applied', complexity: 'M', priority: 'Must Have', roles: [R.ea, R.arb], accept: ['Changes group by domain', 'Declined changes are excluded from the PR'] },
  { epic: 'Decisions', title: 'Progress a decision through its lifecycle', goal: 'move a decision draft → proposed → accepted → staged → committed', benefit: 'the workflow drives the right automation at each step', complexity: 'L', priority: 'Must Have', roles: [R.ea, R.dm], accept: ['Each transition dispatches the right workflow', 'Status is reflected in the index'] },
  { epic: 'Decisions', title: 'Apply accepted changes to a PR', goal: 'have accepted changes applied to the artefacts in a pull request', benefit: 'I can review the actual changes before they land', complexity: 'XL', priority: 'Must Have', roles: [R.ea, R.el], accept: ['Accepted changes edit the artefact files', 'A PR to main is opened and linked from the decision'] },
  { epic: 'Decisions', title: 'Commit a decision', goal: 'merge the decision PR into main', benefit: 'the architecture baseline is updated', complexity: 'M', priority: 'Must Have', roles: [R.ea, R.arb], accept: ['The PR is merged and closed', 'The decision branch is deleted and status is committed'] },
  { epic: 'Decisions', title: 'Reject a decision', goal: 'reject a decision as duplicate or superseded', benefit: 'the backlog stays clean and auditable', complexity: 'S', priority: 'Should Have', roles: [R.arb, R.ea], accept: ['A rejection reason is recorded', 'The decision is retained for history'] },
  { epic: 'Decisions', title: 'Filter decisions by scope', goal: 'filter decisions by domain, layer, or artefact', benefit: 'I can focus on decisions affecting my area', complexity: 'S', priority: 'Should Have', roles: [R.da, R.aa, R.ia], accept: ['The scope filter narrows the list', 'The filter is shareable via the URL'] },

  // ── Versioning & baselines ───────────────────────────────────────────────
  { epic: 'Versioning', title: 'Switch between architecture versions', goal: 'switch between versioned baselines for a client', benefit: 'I can compare or work against a specific release', complexity: 'S', priority: 'Must Have', roles: [R.ea, R.pd, R.rte], accept: ['Versions are selectable', 'The view reflects the chosen version'] },
  { epic: 'Versioning', title: 'Create a new version baseline', goal: 'create a new version as a fresh baseline', benefit: 'I can evolve the architecture without altering history', complexity: 'M', priority: 'Should Have', roles: [R.ea, R.cto], accept: ['A new version folder is created', 'Prior versions remain immutable'] },

  // ── Activity & audit ─────────────────────────────────────────────────────
  { epic: 'Audit', title: 'See an artefact’s change history', goal: 'see who changed an artefact and when', benefit: 'I can audit how it evolved', complexity: 'S', priority: 'Should Have', roles: [R.arb, R.cio], accept: ['Activity shows date, action, and author', 'Entries are ordered most-recent first'] },

  // ── Roles & access (future) ──────────────────────────────────────────────
  { epic: 'Roles & Access', title: 'Tailor the view to my role', goal: 'see the artefacts most relevant to my role first', benefit: 'I spend less time hunting', complexity: 'L', priority: 'Could Have', roles: [R.po, R.bana, R.dana], accept: ['Audience-matched artefacts are surfaced', 'Role can be changed'] },
  { epic: 'Roles & Access', title: 'Restrict who can commit decisions', goal: 'restrict decision approval to authorised roles', benefit: 'governance is enforced, not just advised', complexity: 'XL', priority: "Won't Have", roles: [R.ciso, R.arb], accept: ['Only authorised roles can commit', 'Attempts by others are blocked and logged'] },

  // ── Reporting & export ───────────────────────────────────────────────────
  { epic: 'Reporting', title: 'Export a diagram', goal: 'download a diagram as an image', benefit: 'I can use it in slides and docs', complexity: 'M', priority: 'Could Have', roles: [R.sa, R.pd, R.pm], accept: ['A diagram exports to PNG/SVG', 'The export matches the on-screen view'] },
  { epic: 'Reporting', title: 'Export the raw JSON of an artefact', goal: 'view and copy the raw JSON behind an artefact', benefit: 'I can integrate it with other tools', complexity: 'XS', priority: 'Should Have', roles: [R.ta, R.sana, R.el], accept: ['Raw JSON is viewable', 'It can be copied'] },
  { epic: 'Reporting', title: 'Produce a framework alignment view', goal: 'see how the repository maps to TOGAF and SAFe', benefit: 'I can explain coverage to stakeholders', complexity: 'M', priority: 'Could Have', roles: [R.ea, R.cio, R.rte], accept: ['TOGAF and SAFe mappings are shown', 'Supported vs roadmap is clear'] },

  // ── Quality & validation ─────────────────────────────────────────────────
  { epic: 'Quality', title: 'Validate an artefact against its schema', goal: 'have artefact data validated against its JSON Schema', benefit: 'I trust the data is well-formed', complexity: 'L', priority: 'Should Have', roles: [R.da, R.ta], accept: ['Schema violations are reported', 'Validation runs in CI'] },
  { epic: 'Quality', title: 'Check referential integrity of links', goal: 'check that artefact references point at things that exist', benefit: 'I avoid broken cross-references', complexity: 'L', priority: 'Could Have', roles: [R.ea, R.da], accept: ['Dangling references are flagged', 'The check runs on committed data'] },

  // ── Integration ──────────────────────────────────────────────────────────
  { epic: 'Integration', title: 'Link a decision to an external backlog item', goal: 'link a decision to a Jira/ADO epic or feature', benefit: 'architecture and delivery stay connected', complexity: 'M', priority: "Won't Have", roles: [R.po, R.rte, R.dm], accept: ['An external id can be attached', 'The link opens the backlog tool'] },
  { epic: 'Integration', title: 'Ingest the model into an EA tool', goal: 'export the model in an interchange format (e.g. CALM/ArchiMate)', benefit: 'I can use specialised EA tooling', complexity: 'XL', priority: "Won't Have", roles: [R.ea, R.cto], accept: ['The model exports to the agreed format', 'A downstream tool can import it'] },
]

const useCases = []
let n = 0
for (const f of FUNCTIONS) {
  for (const actor of f.roles) {
    n += 1
    useCases.push({
      id: `UC-${String(n).padStart(3, '0')}`,
      title: f.title,
      epic: f.epic,
      actor,
      'user-story': `As a ${actor}, I want to ${f.goal}, so that ${f.benefit}.`,
      complexity: f.complexity,
      priority: f.priority,
      'acceptance-criteria': f.accept,
    })
  }
}

const byBucket = (key, vocab) => Object.fromEntries(vocab.map(v => [v, useCases.filter(u => u[key] === v).length]))

const out = {
  description: 'Use-case corpus for validating the Pickle enterprise-architecture management tool. Standard user-story format with MoSCoW priority and t-shirt complexity. Functions are mutually exclusive; together they aim to be collectively exhaustive across the product surface. Generated by tests/generate-use-cases.mjs.',
  meta: {
    complexities: COMPLEXITY,
    priorities: PRIORITY,
    count: useCases.length,
    'by-complexity': byBucket('complexity', COMPLEXITY),
    'by-priority': byBucket('priority', PRIORITY),
  },
  'use-cases': useCases,
}

writeFileSync(resolve(__dirname, 'use-cases.json'), JSON.stringify(out, null, 2) + '\n')
console.log(`wrote tests/use-cases.json — ${useCases.length} use cases from ${FUNCTIONS.length} functions`)
console.log('by complexity:', out.meta['by-complexity'])
console.log('by priority:  ', out.meta['by-priority'])
const rolesCovered = new Set(useCases.map(u => u.actor))
console.log('roles covered:', rolesCovered.size, '/', Object.keys(R).length)
