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
  { id: 'BUS-STR', domain: 'business', abstraction: 'conceptual', format: 'catalogue', key: true,  name: 'Business Strategy',               description: 'The goals, priorities, and direction for the Business domain.' },
  { id: 'BUS-CAP', domain: 'business', abstraction: 'conceptual', format: 'catalogue', key: false, name: 'Business Capabilities',           description: 'A structured view of what the organisation does, broken down into capability areas.' },
  { id: 'BUS-BCM', domain: 'business', abstraction: 'conceptual', format: 'diagram',   key: false, name: 'Business Capability Model',       description: 'A visual map of the organisation\'s capabilities.' },
  { id: 'BUS-PRO', domain: 'business', abstraction: 'conceptual', format: 'catalogue', key: false, name: 'Business Processes',              description: 'The key processes the organisation runs to deliver value.' },
  { id: 'BUS-BPM', domain: 'business', abstraction: 'conceptual', format: 'diagram',   key: false, name: 'Business Process Model',          description: 'A visual flow diagram of the organisation\'s key processes.' },
  { id: 'BUS-PRN', domain: 'business', abstraction: 'logical',    format: 'catalogue', key: true,  name: 'Business Principles',             description: 'Guidelines that shape how Business architecture decisions are made.' },
  { id: 'BUS-GRD', domain: 'business', abstraction: 'physical',   format: 'catalogue', key: true,  name: 'Business Guardrails',             description: 'Rules and minimum standards that must be followed in Business Architecture.' },
  // Data
  { id: 'DAT-STR', domain: 'data',        abstraction: 'conceptual', format: 'catalogue', key: true,  name: 'Data Strategy',                   description: 'The goals, priorities, and direction for the Data domain.' },
  { id: 'DAT-DAC', domain: 'data',        abstraction: 'conceptual', format: 'catalogue', key: false, name: 'Data Domains & Concepts',         description: 'The organisation\'s key data subject areas and the concepts within each.' },
  { id: 'DAT-CDM', domain: 'data',        abstraction: 'conceptual', format: 'diagram',   key: false, name: 'Conceptual Data Model',           description: 'A visual map of the organisation\'s key data concepts and how they relate.' },
  { id: 'DAT-PRN', domain: 'data',        abstraction: 'logical',    format: 'catalogue', key: true,  name: 'Data Principles',                 description: 'Guidelines that shape how Data architecture decisions are made.' },
  { id: 'DAT-GRD', domain: 'data',        abstraction: 'physical',   format: 'catalogue', key: true,  name: 'Data Guardrails',                 description: 'Rules and minimum standards that must be followed in Data Architecture.' },
  // Integration
  { id: 'INT-STR', domain: 'integration', abstraction: 'conceptual', format: 'catalogue', key: true,  name: 'Integration Strategy',            description: 'The goals, priorities, and direction for the Integration domain.' },
  { id: 'INT-PRN', domain: 'integration', abstraction: 'logical',    format: 'catalogue', key: true,  name: 'Integration Principles',          description: 'Guidelines that shape how Integration architecture decisions are made.' },
  { id: 'INT-GRD', domain: 'integration', abstraction: 'physical',   format: 'catalogue', key: true,  name: 'Integration Guardrails',          description: 'Rules and minimum standards that must be followed in Integration Architecture.' },
  // Application
  { id: 'APP-STR', domain: 'application', abstraction: 'conceptual', format: 'catalogue', key: true,  name: 'Application Strategy',            description: 'The goals, priorities, and direction for the Application domain.' },
  { id: 'APP-DAP', domain: 'application', abstraction: 'logical',    format: 'catalogue', key: false, name: 'Application Domains & Platforms', description: 'The organisation\'s application landscape, grouped by business area and the platforms within each.' },
  { id: 'APP-DPM', domain: 'application', abstraction: 'logical',    format: 'diagram',   key: false, name: 'Domains & Platforms Model',       description: 'A visual map of the organisation\'s application landscape.' },
  { id: 'APP-PRN', domain: 'application', abstraction: 'logical',    format: 'catalogue', key: true,  name: 'Application Principles',          description: 'Guidelines that shape how Application architecture decisions are made.' },
  { id: 'APP-GRD', domain: 'application', abstraction: 'physical',   format: 'catalogue', key: true,  name: 'Application Guardrails',          description: 'Rules and minimum standards that must be followed in Application Architecture.' },
  // Solution
  { id: 'SOL-STR', domain: 'solution',    abstraction: 'conceptual', format: 'catalogue', key: true,  name: 'Solution Strategy',               description: 'The goals, priorities, and direction for the Solution domain.' },
  { id: 'SOL-PRN', domain: 'solution',    abstraction: 'logical',    format: 'catalogue', key: true,  name: 'Solution Principles',             description: 'Guidelines that shape how Solution architecture decisions are made.' },
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
  conceptual: { bg: 'bg-blue-50',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700' },
  logical:    { bg: 'bg-amber-50',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700' },
  physical:   { bg: 'bg-rose-50',   text: 'text-rose-700',   badge: 'bg-rose-100 text-rose-700' },
}
