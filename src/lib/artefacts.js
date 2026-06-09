// Authoritative list of permitted artefact format types.
// Any artefact added to ARTEFACTS must use one of these IDs.
// The same enum should be reflected in config/schemas/artefacts/*/meta.format.
export const FORMATS = [
  {
    id: 'catalogue',
    label: 'Catalogues',
    description: 'Structured lists of architecture entities, validated by JSON Schema.',
  },
  {
    id: 'matrix',
    label: 'Matrices',
    description: 'Grids mapping relationships between entity sets, spanning abstraction layers or domains.',
  },
  {
    id: 'diagram',
    label: 'Diagrams',
    description: 'Visual representations of architecture entities and their relationships.',
  },
  {
    id: 'document',
    label: 'Documents',
    description: 'Free-form narrative content authored in Markdown, used for contextual or explanatory artefacts.',
  },
]

// Diagram sub-types — stored in meta.diagramType on diagram artefacts and schemas.
// Card-based and flow-based are the primary current types; the others are recommended additions.
export const DIAGRAM_TYPES = [
  { id: 'card-based',   label: 'Card Based',   description: 'Hierarchical nested cards (e.g. Business Capability Model).' },
  { id: 'flow-based',   label: 'Flow Based',   description: 'Hierarchical linear flow (e.g. Business Process Model).' },
  { id: 'entity-based', label: 'Entity Based', description: 'Entity-relationship style (e.g. Conceptual Data Model).' },
  { id: 'sequence',     label: 'Sequence',     description: 'Ordered message / event flow between actors or systems.' },
  { id: 'network',      label: 'Network',      description: 'Node-and-edge topology (e.g. infrastructure, integration landscape).' },
  { id: 'timeline',     label: 'Timeline',     description: 'Roadmap or change over time (e.g. capability evolution plan).' },
]

export const getDiagramType = (id) => DIAGRAM_TYPES.find(t => t.id === id)

// Relationship types used in artefact relatedTo links.
// 'feeds' = this artefact's data drives the related artefact's content.
// 'informs' = this artefact provides context or input to the related artefact.
// 'derived-from' = this artefact is produced by analysing the related artefact.
export const RELATIONSHIP_TYPES = ['feeds', 'informs', 'derived-from']

// Canonical display order for format groups in menus and list views.
export const FORMAT_ORDER = ['catalogue', 'matrix', 'diagram', 'document']

export const getFormat = (id) => FORMATS.find(f => f.id === id)

export const DOMAINS = [
  {
    id: 'business',
    name: 'Business',
    acronym: 'BUS',
    description: 'The organisation\'s capabilities, processes, and operating model — what the business does and why. This domain sets the context that all others serve.',
    color: 'violet',
  },
  {
    id: 'data',
    name: 'Data',
    acronym: 'DAT',
    description: 'The data assets, structures, and governance that support business operations — ensuring data is well-defined, trusted, and available where it is needed.',
    color: 'blue',
  },
  {
    id: 'integration',
    name: 'Integration',
    acronym: 'INT',
    description: 'How systems and services connect and communicate — covering APIs, events, messaging, and the rules that govern how information flows between them.',
    color: 'emerald',
  },
  {
    id: 'application',
    name: 'Application',
    acronym: 'APP',
    description: 'The software applications and platforms that deliver business capabilities — what exists, how it is organised, and how it relates to business needs.',
    color: 'amber',
  },
  {
    id: 'solution',
    name: 'Solution',
    acronym: 'SOL',
    description: 'Joined-up designs that span multiple domains to address a specific business need or initiative — bringing together business, data, integration, and application concerns.',
    color: 'rose',
  },
]

export const ABSTRACTIONS = [
  {
    id: 'conceptual',
    name: 'Conceptual',
    label: 'What & Why',
    description: 'Sets the direction — what the architecture needs to achieve and why, independent of any technology choices.',
  },
  {
    id: 'logical',
    name: 'Logical',
    label: 'How',
    description: 'The rules and principles that guide design decisions, without committing to any specific tool or product.',
  },
  {
    id: 'physical',
    name: 'Physical',
    label: 'Where & With What',
    description: 'The concrete standards and technology decisions that govern how the architecture is built and operated.',
  },
]

// key: true marks STR/PRN/GRD as the three foundational artefacts per domain.
// They are pinned to the top of menus and visually highlighted throughout the UI.
export const ARTEFACTS = [
  // Business
  { id: 'BUS-STR', domain: 'business', abstraction: 'conceptual', format: 'catalogue', key: true,  name: 'Business Strategy',               description: 'A catalogue of strategic goals and direction for the Business domain — the outcomes the organisation is trying to achieve and why.',
    relatedTo: [{ artefactId: 'BUS-CAP', relationship: 'informs' }, { artefactId: 'BUS-PRO', relationship: 'informs' }] },
  { id: 'BUS-CAP', domain: 'business', abstraction: 'conceptual', format: 'catalogue', key: false, name: 'Business Capabilities',           description: 'A hierarchical catalogue of what the organisation does, structured by capability area and sub-capability.',
    relatedTo: [{ artefactId: 'BUS-BCM', relationship: 'feeds' }, { artefactId: 'APP-DAP', relationship: 'informs' }] },
  { id: 'BUS-BCM', domain: 'business', abstraction: 'conceptual', format: 'diagram',   key: false, name: 'Business Capability Model',       description: 'A visual map of the organisation\'s capabilities, arranged as a nested hierarchy.',
    diagramType: 'card-based',
    relatedTo: [{ artefactId: 'BUS-CAP', relationship: 'derived-from' }] },
  { id: 'BUS-PRO', domain: 'business', abstraction: 'conceptual', format: 'catalogue', key: false, name: 'Business Processes',              description: 'A catalogue of the key processes the organisation runs to deliver business value, structured by type and level.',
    relatedTo: [{ artefactId: 'BUS-BPM', relationship: 'feeds' }] },
  { id: 'BUS-BPM', domain: 'business', abstraction: 'conceptual', format: 'diagram',   key: false, name: 'Business Process Model',          description: 'A visual flow diagram of the organisation\'s key processes.',
    diagramType: 'flow-based',
    relatedTo: [{ artefactId: 'BUS-PRO', relationship: 'derived-from' }] },
  { id: 'BUS-PRN', domain: 'business', abstraction: 'logical',    format: 'catalogue', key: true,  name: 'Business Principles',             description: 'The guiding principles that shape how Business architecture decisions are made.' },
  { id: 'BUS-GRD', domain: 'business', abstraction: 'physical',   format: 'catalogue', key: true,  name: 'Business Guardrails',             description: 'Rules and minimum standards that must be followed in Business Architecture.' },
  // Data
  { id: 'DAT-STR', domain: 'data',        abstraction: 'conceptual', format: 'catalogue', key: true,  name: 'Data Strategy',                   description: 'A catalogue of strategic goals and direction for the Data domain.' },
  { id: 'DAT-DAC', domain: 'data',        abstraction: 'conceptual', format: 'catalogue', key: false, name: 'Data Domains & Concepts',         description: 'The organisation\'s key data subject areas and the conceptual data entities within each.',
    relatedTo: [{ artefactId: 'DAT-CDM', relationship: 'feeds' }] },
  { id: 'DAT-CDM', domain: 'data',        abstraction: 'conceptual', format: 'diagram',   key: false, name: 'Conceptual Data Model',           description: 'A visual map of the organisation\'s key data concepts and how they relate.',
    diagramType: 'entity-based',
    relatedTo: [{ artefactId: 'DAT-DAC', relationship: 'derived-from' }] },
  { id: 'DAT-PRN', domain: 'data',        abstraction: 'logical',    format: 'catalogue', key: true,  name: 'Data Principles',                 description: 'The guiding principles that shape how Data architecture decisions are made.' },
  { id: 'DAT-GRD', domain: 'data',        abstraction: 'physical',   format: 'catalogue', key: true,  name: 'Data Guardrails',                 description: 'Rules and minimum standards that must be followed in Data Architecture.' },
  // Integration
  { id: 'INT-STR', domain: 'integration', abstraction: 'conceptual', format: 'catalogue', key: true,  name: 'Integration Strategy',            description: 'A catalogue of strategic goals and direction for the Integration domain.' },
  { id: 'INT-PRN', domain: 'integration', abstraction: 'logical',    format: 'catalogue', key: true,  name: 'Integration Principles',          description: 'The guiding principles that shape how Integration architecture decisions are made.' },
  { id: 'INT-GRD', domain: 'integration', abstraction: 'physical',   format: 'catalogue', key: true,  name: 'Integration Guardrails',          description: 'Rules and minimum standards that must be followed in Integration Architecture.' },
  // Application
  { id: 'APP-STR', domain: 'application', abstraction: 'conceptual', format: 'catalogue', key: true,  name: 'Application Strategy',            description: 'A catalogue of strategic goals and direction for the Application domain.' },
  { id: 'APP-DAP', domain: 'application', abstraction: 'logical',    format: 'catalogue', key: false, name: 'Application Domains & Platforms', description: 'The organisation\'s application landscape, grouped by business domain and the platforms within each.',
    relatedTo: [{ artefactId: 'APP-DPM', relationship: 'feeds' }, { artefactId: 'BUS-CAP', relationship: 'derived-from' }] },
  { id: 'APP-DPM', domain: 'application', abstraction: 'logical',    format: 'diagram',   key: false, name: 'Domains & Platforms Model',       description: 'A visual map of the organisation\'s application landscape.',
    diagramType: 'card-based',
    relatedTo: [{ artefactId: 'APP-DAP', relationship: 'derived-from' }] },
  { id: 'APP-PRN', domain: 'application', abstraction: 'logical',    format: 'catalogue', key: true,  name: 'Application Principles',          description: 'The guiding principles that shape how Application architecture decisions are made.' },
  { id: 'APP-GRD', domain: 'application', abstraction: 'physical',   format: 'catalogue', key: true,  name: 'Application Guardrails',          description: 'Rules and minimum standards that must be followed in Application Architecture.' },
  // Solution
  { id: 'SOL-STR', domain: 'solution',    abstraction: 'conceptual', format: 'catalogue', key: true,  name: 'Solution Strategy',               description: 'A catalogue of strategic goals and direction for the Solution domain.' },
  { id: 'SOL-PRN', domain: 'solution',    abstraction: 'logical',    format: 'catalogue', key: true,  name: 'Solution Principles',             description: 'The guiding principles that shape how Solution architecture decisions are made.' },
  { id: 'SOL-GRD', domain: 'solution',    abstraction: 'physical',   format: 'catalogue', key: true,  name: 'Solution Guardrails',             description: 'Rules and minimum standards that must be followed in Solution Architecture.' },
]

export const getArtefact = (id) => ARTEFACTS.find(a => a.id === id)
export const getDomain = (id) => DOMAINS.find(d => d.id === id)
export const getAbstraction = (id) => ABSTRACTIONS.find(a => a.id === id)

export const getArtefactsForDomain = (domainId, abstractionId = null) =>
  ARTEFACTS.filter(
    a => a.domain === domainId && (!abstractionId || a.abstraction === abstractionId)
  )

export const DOMAIN_COLORS = {
  business:    { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  dot: 'bg-violet-500' },
  data:        { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500' },
  integration: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  application: { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500' },
  solution:    { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    dot: 'bg-rose-500' },
}

export const ABSTRACTION_COLORS = {
  conceptual: { bg: 'bg-blue-50',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700',   header: 'bg-blue-600 text-white' },
  logical:    { bg: 'bg-amber-50',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700', header: 'bg-amber-500 text-white' },
  physical:   { bg: 'bg-rose-50',   text: 'text-rose-700',   badge: 'bg-rose-100 text-rose-700',   header: 'bg-rose-600 text-white' },
}
