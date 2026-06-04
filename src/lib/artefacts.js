export const DOMAINS = [
  {
    id: 'business',
    name: 'Business',
    acronym: 'BUS',
    description: 'Capabilities, processes, and operating model',
    color: 'violet',
  },
  {
    id: 'data',
    name: 'Data',
    acronym: 'DAT',
    description: 'Data assets, structures, and governance',
    color: 'blue',
  },
  {
    id: 'integration',
    name: 'Integration',
    acronym: 'INT',
    description: 'APIs, events, and messaging patterns',
    color: 'emerald',
  },
  {
    id: 'application',
    name: 'Application',
    acronym: 'APP',
    description: 'Applications, platforms, and functions',
    color: 'amber',
  },
  {
    id: 'solution',
    name: 'Solution',
    acronym: 'SOL',
    description: 'Cross-cutting designs spanning multiple domains',
    color: 'rose',
  },
]

export const ABSTRACTIONS = [
  {
    id: 'conceptual',
    name: 'Conceptual',
    label: 'What & Why',
    description: 'Strategic intent — outcomes, drivers, target states',
  },
  {
    id: 'logical',
    name: 'Logical',
    label: 'How',
    description: 'Vendor-neutral guidelines that shape design decisions',
  },
  {
    id: 'physical',
    name: 'Physical',
    label: 'Where & With What',
    description: 'Non-negotiable constraints and mandatory standards',
  },
]

// key: true marks STR/PRN/GRD as the three foundational artefacts per domain.
// They are pinned to the top of menus and visually highlighted throughout the UI.
export const ARTEFACTS = [
  // Business
  { id: 'BUS-STR', domain: 'business', abstraction: 'conceptual', format: 'catalogue', key: true,  name: 'Business Strategy',          description: 'Outcome-oriented strategic statements for the Business domain' },
  { id: 'BUS-CAP', domain: 'business', abstraction: 'conceptual', format: 'catalogue', key: false, name: 'Business Capabilities',      description: 'Hierarchical catalogue of what the business does' },
  { id: 'BUS-BCM', domain: 'business', abstraction: 'conceptual', format: 'diagram',   key: false, name: 'Business Capability Model',  description: 'Visual map of business capabilities' },
  { id: 'BUS-PRO', domain: 'business', abstraction: 'conceptual', format: 'catalogue', key: false, name: 'Business Processes',         description: 'Sequences of activities that deliver business value' },
  { id: 'BUS-BPM', domain: 'business', abstraction: 'conceptual', format: 'diagram',   key: false, name: 'Business Process Model',     description: 'Visual flow of business processes' },
  { id: 'BUS-PRN', domain: 'business', abstraction: 'logical',    format: 'catalogue', key: true,  name: 'Business Principles',        description: 'Design guidelines for the Business domain' },
  { id: 'BUS-GRD', domain: 'business', abstraction: 'physical',   format: 'catalogue', key: true,  name: 'Business Guardrails',        description: 'Non-negotiable constraints for the Business domain' },
  // Data
  { id: 'DAT-STR', domain: 'data',        abstraction: 'conceptual', format: 'catalogue', key: true,  name: 'Data Strategy',              description: 'Strategic statements for the Data domain' },
  { id: 'DAT-DAC', domain: 'data',        abstraction: 'conceptual', format: 'catalogue', key: false, name: 'Data Domains & Concepts',    description: 'Data subject areas and conceptual entities' },
  { id: 'DAT-CDM', domain: 'data',        abstraction: 'conceptual', format: 'diagram',   key: false, name: 'Conceptual Data Model',      description: 'Visual conceptual data model' },
  { id: 'DAT-PRN', domain: 'data',        abstraction: 'logical',    format: 'catalogue', key: true,  name: 'Data Principles',            description: 'Design guidelines for the Data domain' },
  { id: 'DAT-GRD', domain: 'data',        abstraction: 'physical',   format: 'catalogue', key: true,  name: 'Data Guardrails',            description: 'Non-negotiable constraints for data' },
  // Integration
  { id: 'INT-STR', domain: 'integration', abstraction: 'conceptual', format: 'catalogue', key: true,  name: 'Integration Strategy',       description: 'Strategic statements for Integration' },
  { id: 'INT-PRN', domain: 'integration', abstraction: 'logical',    format: 'catalogue', key: true,  name: 'Integration Principles',     description: 'Design guidelines for Integration' },
  { id: 'INT-GRD', domain: 'integration', abstraction: 'physical',   format: 'catalogue', key: true,  name: 'Integration Guardrails',     description: 'Non-negotiable constraints for integration' },
  // Application
  { id: 'APP-STR', domain: 'application', abstraction: 'conceptual', format: 'catalogue', key: true,  name: 'Application Strategy',       description: 'Strategic statements for Application' },
  { id: 'APP-DAP', domain: 'application', abstraction: 'logical',    format: 'catalogue', key: false, name: 'Application Domains & Platforms', description: 'Application groupings and the platforms within them' },
  { id: 'APP-DPM', domain: 'application', abstraction: 'logical',    format: 'diagram',   key: false, name: 'Domains & Platforms Model',  description: 'Visual application model' },
  { id: 'APP-PRN', domain: 'application', abstraction: 'logical',    format: 'catalogue', key: true,  name: 'Application Principles',     description: 'Design guidelines for Application' },
  { id: 'APP-GRD', domain: 'application', abstraction: 'physical',   format: 'catalogue', key: true,  name: 'Application Guardrails',     description: 'Non-negotiable constraints for applications' },
  // Solution
  { id: 'SOL-STR', domain: 'solution',    abstraction: 'conceptual', format: 'catalogue', key: true,  name: 'Solution Strategy',          description: 'Strategic statements for Solution' },
  { id: 'SOL-PRN', domain: 'solution',    abstraction: 'logical',    format: 'catalogue', key: true,  name: 'Solution Principles',        description: 'Design guidelines for Solution' },
  { id: 'SOL-GRD', domain: 'solution',    abstraction: 'physical',   format: 'catalogue', key: true,  name: 'Solution Guardrails',        description: 'Non-negotiable constraints for solutions' },
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
