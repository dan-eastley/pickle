// User-facing names and descriptions are sourced from config/i18n/<locale>.json
// via the i18n layer and overlaid onto the structural definitions below. The
// inline English strings act as a fallback when a locale omits an entry.
import { tr } from '../i18n'

// Authoritative list of permitted artefact format types.
// Any artefact added to ARTEFACTS must use one of these IDs.
// The same enum should be reflected in config/schemas/artefacts/*/meta.format.
const FORMATS_BASE = [
  {
    id: 'catalogue',
    label: 'Catalogues',
    description: 'Structured lists of architecture entities, validated by JSON Schema.',
  },
  {
    id: 'diagram',
    label: 'Diagrams',
    description: 'Visual representations of architecture entities and their relationships.',
  },
  {
    id: 'document',
    label: 'Documents',
    description:
      'Free-form narrative content authored in Markdown, used for contextual or explanatory artefacts.',
  },
  {
    id: 'matrix',
    label: 'Matrices',
    description:
      'Grids mapping relationships between entity sets, spanning abstraction layers or domains.',
  },
]
export const FORMATS = FORMATS_BASE.map((f) => ({ ...f, ...tr('formats', f.id) }))

// Diagram sub-types: stored in meta.diagramType on diagram artefacts and schemas.
// Card-based and flow-based are the primary current types; the others are recommended additions.
const DIAGRAM_TYPES_BASE = [
  {
    id: 'card-based',
    label: 'Card Based',
    description: 'Hierarchical nested cards (e.g. Business Capability Model).',
  },
  {
    id: 'process-flow',
    label: 'Process Flow',
    description: 'Sequential chevron flow by level (e.g. Business Process Model).',
  },
  {
    id: 'entity-based',
    label: 'Entity Based',
    description: 'Entity-relationship style (e.g. Conceptual Data Model).',
  },
  {
    id: 'sequence',
    label: 'Sequence',
    description: 'Ordered message / event flow between actors or systems.',
  },
  {
    id: 'network',
    label: 'Network',
    description: 'Node-and-edge topology (e.g. infrastructure, integration landscape).',
  },
  {
    id: 'timeline',
    label: 'Timeline',
    description: 'Roadmap or change over time (e.g. capability evolution plan).',
  },
]
export const DIAGRAM_TYPES = DIAGRAM_TYPES_BASE.map((t) => ({ ...t, ...tr('diagramTypes', t.id) }))

// Relationship types used in artefact relatedTo links.
// 'feeds' = this artefact's data drives the related artefact's content.
// 'informs' = this artefact provides context or input to the related artefact.
// 'derived-from' = this artefact is produced by analysing the related artefact.
export const RELATIONSHIP_TYPES = ['feeds', 'informs', 'derived-from']

// Canonical display order for format groups in menus and list views.
export const FORMAT_ORDER = ['catalogue', 'diagram', 'document', 'matrix']

export const getFormat = (id) => FORMATS.find((f) => f.id === id)

const DOMAINS_BASE = [
  {
    id: 'business',
    name: 'Business',
    acronym: 'BUS',
    description:
      "The organisation's capabilities, processes, and operating model: what the business does and why. This domain sets the context that all others serve.",
    color: 'violet',
  },
  {
    id: 'data',
    name: 'Data',
    acronym: 'DAT',
    description:
      'The data assets, structures, and governance that support business operations, ensuring data is well-defined, trusted, and available where it is needed.',
    color: 'blue',
  },
  {
    id: 'application',
    name: 'Application',
    acronym: 'APP',
    description:
      'The software applications and platforms that deliver business capabilities: what exists, how it is organised, and how it relates to business needs.',
    color: 'amber',
  },
  {
    id: 'integration',
    name: 'Integration',
    acronym: 'INT',
    description:
      'How systems and services connect and communicate, covering APIs, events, messaging, and the rules that govern how information flows between them.',
    color: 'emerald',
  },
  {
    id: 'solution',
    name: 'Solution',
    acronym: 'SOL',
    description:
      'Joined-up designs that span multiple domains to address a specific business need or initiative, bringing together business, data, integration, and application concerns.',
    color: 'rose',
  },
]
export const DOMAINS = DOMAINS_BASE.map((d) => ({ ...d, ...tr('domains', d.id) }))

const ABSTRACTIONS_BASE = [
  {
    id: 'conceptual',
    name: 'Conceptual',
    label: 'What & Why',
    description:
      'Sets the direction: what the architecture needs to achieve and why, independent of any technology choices. In TOGAF terms, conceptual artefacts are Architecture Building Blocks (ABBs).',
  },
  {
    id: 'logical',
    name: 'Logical',
    label: 'How',
    description:
      'The rules and principles that guide design decisions, without committing to any specific tool or product. In TOGAF terms, logical artefacts are Architecture Building Blocks (ABBs).',
  },
  {
    id: 'physical',
    name: 'Physical',
    label: 'Where & With What',
    description:
      'The concrete standards and technology decisions that govern how the architecture is built and operated. In TOGAF terms, physical artefacts are Solution Building Blocks (SBBs).',
  },
]
export const ABSTRACTIONS = ABSTRACTIONS_BASE.map((a) => ({ ...a, ...tr('abstractions', a.id) }))

// key: true marks STR/PRN/GRD as the three foundational artefacts per domain.
// They are pinned to the top of menus and visually highlighted throughout the UI.
const ARTEFACTS_BASE = [
  // Business
  {
    id: 'BUS-STR',
    domain: 'business',
    abstraction: 'conceptual',
    format: 'catalogue',
    key: true,
    name: 'Business Architecture Strategy',
    description:
      'A catalogue of strategic goals and direction for the Business domain, the outcomes the organisation is trying to achieve and why.',
    relatedTo: [
      { artefactId: 'BUS-CAP', relationship: 'informs' },
      { artefactId: 'BUS-PRO', relationship: 'informs' },
      { artefactId: 'BUS-STR-PRN', relationship: 'informs' },
    ],
  },
  {
    id: 'BUS-CAP',
    domain: 'business',
    abstraction: 'conceptual',
    format: 'catalogue',
    key: false,
    name: 'Business Capabilities',
    description:
      'A hierarchical catalogue of what the organisation does, structured by capability area and sub-capability.',
    relatedTo: [
      { artefactId: 'BUS-BCM', relationship: 'feeds' },
      { artefactId: 'BUS-CAP-PRO', relationship: 'feeds' },
      { artefactId: 'APP-DAP', relationship: 'informs' },
      { artefactId: 'APP-CAP-DAP', relationship: 'informs' },
    ],
  },
  {
    id: 'BUS-BCM',
    domain: 'business',
    abstraction: 'conceptual',
    format: 'diagram',
    key: false,
    name: 'Business Capability Model',
    description: "A visual map of the organisation's capabilities, arranged as a nested hierarchy.",
    diagramType: 'card-based',
    relatedTo: [{ artefactId: 'BUS-CAP', relationship: 'derived-from' }],
  },
  {
    id: 'BUS-PRO',
    domain: 'business',
    abstraction: 'conceptual',
    format: 'catalogue',
    key: false,
    name: 'Business Processes',
    description:
      'A catalogue of the key processes the organisation runs to deliver business value, structured by type and level.',
    relatedTo: [
      { artefactId: 'BUS-BPM', relationship: 'feeds' },
      { artefactId: 'BUS-CAP-PRO', relationship: 'feeds' },
    ],
  },
  {
    id: 'BUS-BPM',
    domain: 'business',
    abstraction: 'conceptual',
    format: 'diagram',
    key: false,
    name: 'Business Process Model',
    description:
      "A sequential chevron flow of the organisation's processes at Level 1 and 2, with per-L1 drill-downs to Level 3.",
    diagramType: 'process-flow',
    relatedTo: [{ artefactId: 'BUS-PRO', relationship: 'derived-from' }],
  },
  {
    id: 'BUS-CAP-PRO',
    domain: 'business',
    abstraction: 'conceptual',
    format: 'matrix',
    key: false,
    name: 'Business Capabilities ↔ Business Processes',
    description:
      'Maps business capabilities to the processes that realise them at Level 1 and Level 2.',
    relatedTo: [
      { artefactId: 'BUS-CAP', relationship: 'derived-from' },
      { artefactId: 'BUS-PRO', relationship: 'derived-from' },
    ],
  },
  {
    id: 'BUS-PRN',
    domain: 'business',
    abstraction: 'logical',
    format: 'catalogue',
    key: true,
    name: 'Business Architecture Principles',
    description: 'The guiding principles that shape how Business architecture decisions are made.',
    relatedTo: [
      { artefactId: 'BUS-STR-PRN', relationship: 'informs' },
      { artefactId: 'BUS-PRN-GRD', relationship: 'informs' },
    ],
  },
  {
    id: 'BUS-STR-PRN',
    domain: 'business',
    abstraction: 'logical',
    format: 'matrix',
    key: false,
    name: 'Business Architecture Strategy ↔ Principles',
    description:
      'Maps Business Architecture Strategy statements to the Architecture Principles that operationalise them.',
    relatedTo: [
      { artefactId: 'BUS-STR', relationship: 'derived-from' },
      { artefactId: 'BUS-PRN', relationship: 'derived-from' },
    ],
  },
  {
    id: 'BUS-GRD',
    domain: 'business',
    abstraction: 'physical',
    format: 'catalogue',
    key: true,
    name: 'Business Architecture Guardrails',
    description: 'Rules and minimum standards that must be followed in Business Architecture.',
    relatedTo: [{ artefactId: 'BUS-PRN-GRD', relationship: 'informs' }],
  },
  {
    id: 'BUS-PRN-GRD',
    domain: 'business',
    abstraction: 'physical',
    format: 'matrix',
    key: false,
    name: 'Business Architecture Principles ↔ Guardrails',
    description:
      'Maps Business Architecture Principles to the Guardrails that make them concrete and enforceable.',
    relatedTo: [
      { artefactId: 'BUS-PRN', relationship: 'derived-from' },
      { artefactId: 'BUS-GRD', relationship: 'derived-from' },
    ],
  },
  // Data
  {
    id: 'DAT-STR',
    domain: 'data',
    abstraction: 'conceptual',
    format: 'catalogue',
    key: true,
    name: 'Data Architecture Strategy',
    description: 'A catalogue of strategic goals and direction for the Data domain.',
    relatedTo: [{ artefactId: 'DAT-STR-PRN', relationship: 'informs' }],
  },
  {
    id: 'DAT-DAC',
    domain: 'data',
    abstraction: 'conceptual',
    format: 'catalogue',
    key: false,
    name: 'Data Domains & Concepts',
    description:
      "The organisation's key data subject areas and the conceptual data entities within each.",
    relatedTo: [
      { artefactId: 'DAT-CDM', relationship: 'feeds' },
      { artefactId: 'DAT-PRO-DAC', relationship: 'informs' },
      { artefactId: 'INT-DAC-IFC', relationship: 'informs' },
    ],
  },
  {
    id: 'DAT-CDM',
    domain: 'data',
    abstraction: 'conceptual',
    format: 'diagram',
    key: false,
    name: 'Conceptual Data Model',
    description: "A visual map of the organisation's key data concepts and how they relate.",
    diagramType: 'entity-based',
    relatedTo: [{ artefactId: 'DAT-DAC', relationship: 'derived-from' }],
  },
  {
    id: 'DAT-PRO-DAC',
    domain: 'data',
    abstraction: 'conceptual',
    format: 'matrix',
    key: false,
    name: 'Business Processes ↔ Data Domains & Concepts',
    description:
      'CRUD mapping showing which business processes create, read, update, or delete which conceptual data entities.',
    relatedTo: [
      { artefactId: 'BUS-PRO', relationship: 'derived-from' },
      { artefactId: 'DAT-DAC', relationship: 'derived-from' },
    ],
  },
  {
    id: 'DAT-PRN',
    domain: 'data',
    abstraction: 'logical',
    format: 'catalogue',
    key: true,
    name: 'Data Architecture Principles',
    description: 'The guiding principles that shape how Data architecture decisions are made.',
    relatedTo: [
      { artefactId: 'DAT-STR-PRN', relationship: 'informs' },
      { artefactId: 'DAT-PRN-GRD', relationship: 'informs' },
    ],
  },
  {
    id: 'DAT-STR-PRN',
    domain: 'data',
    abstraction: 'logical',
    format: 'matrix',
    key: false,
    name: 'Data Architecture Strategy ↔ Principles',
    description:
      'Maps Data Architecture Strategy statements to the Architecture Principles that operationalise them.',
    relatedTo: [
      { artefactId: 'DAT-STR', relationship: 'derived-from' },
      { artefactId: 'DAT-PRN', relationship: 'derived-from' },
    ],
  },
  {
    id: 'DAT-GRD',
    domain: 'data',
    abstraction: 'physical',
    format: 'catalogue',
    key: true,
    name: 'Data Architecture Guardrails',
    description: 'Rules and minimum standards that must be followed in Data Architecture.',
    relatedTo: [{ artefactId: 'DAT-PRN-GRD', relationship: 'informs' }],
  },
  {
    id: 'DAT-PRN-GRD',
    domain: 'data',
    abstraction: 'physical',
    format: 'matrix',
    key: false,
    name: 'Data Architecture Principles ↔ Guardrails',
    description:
      'Maps Data Architecture Principles to the Guardrails that make them concrete and enforceable.',
    relatedTo: [
      { artefactId: 'DAT-PRN', relationship: 'derived-from' },
      { artefactId: 'DAT-GRD', relationship: 'derived-from' },
    ],
  },
  // Integration
  {
    id: 'INT-STR',
    domain: 'integration',
    abstraction: 'conceptual',
    format: 'catalogue',
    key: true,
    name: 'Integration Architecture Strategy',
    description: 'A catalogue of strategic goals and direction for the Integration domain.',
    relatedTo: [{ artefactId: 'INT-STR-PRN', relationship: 'informs' }],
  },
  {
    id: 'INT-IFC',
    domain: 'integration',
    abstraction: 'logical',
    format: 'catalogue',
    key: false,
    name: 'Interface Catalogue',
    description:
      'The logical interfaces that connect platforms across the application landscape, and the direction of data flow between them.',
    relatedTo: [
      { artefactId: 'INT-WRD', relationship: 'feeds' },
      { artefactId: 'INT-DAC-IFC', relationship: 'feeds' },
    ],
  },
  {
    id: 'INT-WRD',
    domain: 'integration',
    abstraction: 'logical',
    format: 'diagram',
    key: false,
    name: 'Interface Wiring Diagram',
    description:
      'Visual map of the integration landscape: platform-to-platform connections with flow counts and per-pair interface drill-down.',
    diagramType: 'wiring',
    relatedTo: [
      { artefactId: 'INT-IFC', relationship: 'derived-from' },
      { artefactId: 'APP-DAP', relationship: 'derived-from' },
    ],
  },
  {
    id: 'INT-DAC-IFC',
    domain: 'integration',
    abstraction: 'logical',
    format: 'matrix',
    key: false,
    name: 'Data Domains & Concepts ↔ Interface Catalogue',
    description:
      'Maps each interface in the Interface Catalogue to the conceptual data entities that flow across it.',
    relatedTo: [
      { artefactId: 'DAT-DAC', relationship: 'derived-from' },
      { artefactId: 'INT-IFC', relationship: 'derived-from' },
    ],
  },
  {
    id: 'INT-PRN',
    domain: 'integration',
    abstraction: 'logical',
    format: 'catalogue',
    key: true,
    name: 'Integration Architecture Principles',
    description:
      'The guiding principles that shape how Integration architecture decisions are made.',
    relatedTo: [
      { artefactId: 'INT-STR-PRN', relationship: 'informs' },
      { artefactId: 'INT-PRN-GRD', relationship: 'informs' },
    ],
  },
  {
    id: 'INT-STR-PRN',
    domain: 'integration',
    abstraction: 'logical',
    format: 'matrix',
    key: false,
    name: 'Integration Architecture Strategy ↔ Principles',
    description:
      'Maps Integration Architecture Strategy statements to the Architecture Principles that operationalise them.',
    relatedTo: [
      { artefactId: 'INT-STR', relationship: 'derived-from' },
      { artefactId: 'INT-PRN', relationship: 'derived-from' },
    ],
  },
  {
    id: 'INT-GRD',
    domain: 'integration',
    abstraction: 'physical',
    format: 'catalogue',
    key: true,
    name: 'Integration Architecture Guardrails',
    description: 'Rules and minimum standards that must be followed in Integration Architecture.',
    relatedTo: [{ artefactId: 'INT-PRN-GRD', relationship: 'informs' }],
  },
  {
    id: 'INT-PRN-GRD',
    domain: 'integration',
    abstraction: 'physical',
    format: 'matrix',
    key: false,
    name: 'Integration Architecture Principles ↔ Guardrails',
    description:
      'Maps Integration Architecture Principles to the Guardrails that make them concrete and enforceable.',
    relatedTo: [
      { artefactId: 'INT-PRN', relationship: 'derived-from' },
      { artefactId: 'INT-GRD', relationship: 'derived-from' },
    ],
  },
  // Application
  {
    id: 'APP-STR',
    domain: 'application',
    abstraction: 'conceptual',
    format: 'catalogue',
    key: true,
    name: 'Application Architecture Strategy',
    description: 'A catalogue of strategic goals and direction for the Application domain.',
    relatedTo: [{ artefactId: 'APP-STR-PRN', relationship: 'informs' }],
  },
  {
    id: 'APP-DAP',
    domain: 'application',
    abstraction: 'logical',
    format: 'catalogue',
    key: false,
    name: 'Application Domains & Platforms',
    description:
      "The organisation's application landscape, grouped by business domain and the platforms within each.",
    relatedTo: [
      { artefactId: 'APP-DPM', relationship: 'feeds' },
      { artefactId: 'BUS-CAP', relationship: 'derived-from' },
      { artefactId: 'APP-DAP-CAT', relationship: 'informs' },
      { artefactId: 'APP-CAP-DAP', relationship: 'informs' },
      { artefactId: 'INT-IFC', relationship: 'informs' },
    ],
  },
  {
    id: 'APP-DPM',
    domain: 'application',
    abstraction: 'logical',
    format: 'diagram',
    key: false,
    name: 'Domains & Platforms Model',
    description: "A visual map of the organisation's application landscape.",
    diagramType: 'card-based',
    relatedTo: [{ artefactId: 'APP-DAP', relationship: 'derived-from' }],
  },
  {
    id: 'APP-CAP-DAP',
    domain: 'application',
    abstraction: 'logical',
    format: 'matrix',
    key: false,
    name: 'Business Capabilities ↔ Application Domains & Platforms',
    description: 'Maps each APP-DAP platform to the Level 2 business capabilities it supports.',
    relatedTo: [
      { artefactId: 'BUS-CAP', relationship: 'derived-from' },
      { artefactId: 'APP-DAP', relationship: 'derived-from' },
    ],
  },
  {
    id: 'APP-PRO-DAP',
    domain: 'application',
    abstraction: 'logical',
    format: 'matrix',
    key: false,
    name: 'Business Processes ↔ Application Domains & Platforms',
    description: 'Maps which application platforms support which Level 1 business processes.',
    relatedTo: [
      { artefactId: 'BUS-PRO', relationship: 'derived-from' },
      { artefactId: 'APP-DAP', relationship: 'derived-from' },
    ],
  },
  {
    id: 'APP-DAP-DAC',
    domain: 'application',
    abstraction: 'logical',
    format: 'matrix',
    key: false,
    name: 'Application Domains & Platforms ↔ Data Concepts',
    description:
      'Maps which application platform is the system of record for (or a consumer of) each data concept.',
    relatedTo: [
      { artefactId: 'APP-DAP', relationship: 'derived-from' },
      { artefactId: 'DAT-DAC', relationship: 'derived-from' },
    ],
  },
  {
    id: 'APP-PRN',
    domain: 'application',
    abstraction: 'logical',
    format: 'catalogue',
    key: true,
    name: 'Application Architecture Principles',
    description:
      'The guiding principles that shape how Application architecture decisions are made.',
    relatedTo: [
      { artefactId: 'APP-STR-PRN', relationship: 'informs' },
      { artefactId: 'APP-PRN-GRD', relationship: 'informs' },
    ],
  },
  {
    id: 'APP-STR-PRN',
    domain: 'application',
    abstraction: 'logical',
    format: 'matrix',
    key: false,
    name: 'Application Architecture Strategy ↔ Principles',
    description:
      'Maps Application Architecture Strategy statements to the Architecture Principles that operationalise them.',
    relatedTo: [
      { artefactId: 'APP-STR', relationship: 'derived-from' },
      { artefactId: 'APP-PRN', relationship: 'derived-from' },
    ],
  },
  {
    id: 'APP-GRD',
    domain: 'application',
    abstraction: 'physical',
    format: 'catalogue',
    key: true,
    name: 'Application Architecture Guardrails',
    description: 'Rules and minimum standards that must be followed in Application Architecture.',
    relatedTo: [{ artefactId: 'APP-PRN-GRD', relationship: 'informs' }],
  },
  {
    id: 'APP-PRN-GRD',
    domain: 'application',
    abstraction: 'physical',
    format: 'matrix',
    key: false,
    name: 'Application Architecture Principles ↔ Guardrails',
    description:
      'Maps Application Architecture Principles to the Guardrails that make them concrete and enforceable.',
    relatedTo: [
      { artefactId: 'APP-PRN', relationship: 'derived-from' },
      { artefactId: 'APP-GRD', relationship: 'derived-from' },
    ],
  },
  {
    id: 'APP-CAT',
    domain: 'application',
    abstraction: 'physical',
    format: 'catalogue',
    key: false,
    name: 'Application Catalogue',
    description:
      'The physical applications (vendor products) deployed across the organisation, with their lifecycle status and TIME classification.',
    relatedTo: [{ artefactId: 'APP-DAP-CAT', relationship: 'feeds' }],
  },
  {
    id: 'APP-DAP-CAT',
    domain: 'application',
    abstraction: 'physical',
    format: 'matrix',
    key: false,
    name: 'Application Domains & Platforms ↔ Application Catalogue',
    description:
      'Maps each APP-DAP platform to the physical application(s) in APP-CAT that implement it.',
    relatedTo: [
      { artefactId: 'APP-DAP', relationship: 'derived-from' },
      { artefactId: 'APP-CAT', relationship: 'derived-from' },
    ],
  },
  // Solution
  {
    id: 'SOL-STR',
    domain: 'solution',
    abstraction: 'conceptual',
    format: 'catalogue',
    key: true,
    name: 'Solution Architecture Strategy',
    description: 'A catalogue of strategic goals and direction for the Solution domain.',
    relatedTo: [{ artefactId: 'SOL-STR-PRN', relationship: 'informs' }],
  },
  {
    id: 'SOL-PRN',
    domain: 'solution',
    abstraction: 'logical',
    format: 'catalogue',
    key: true,
    name: 'Solution Architecture Principles',
    description: 'The guiding principles that shape how Solution architecture decisions are made.',
    relatedTo: [
      { artefactId: 'SOL-STR-PRN', relationship: 'informs' },
      { artefactId: 'SOL-PRN-GRD', relationship: 'informs' },
    ],
  },
  {
    id: 'SOL-STR-PRN',
    domain: 'solution',
    abstraction: 'logical',
    format: 'matrix',
    key: false,
    name: 'Solution Architecture Strategy ↔ Principles',
    description:
      'Maps Solution Architecture Strategy statements to the Architecture Principles that operationalise them.',
    relatedTo: [
      { artefactId: 'SOL-STR', relationship: 'derived-from' },
      { artefactId: 'SOL-PRN', relationship: 'derived-from' },
    ],
  },
  {
    id: 'SOL-GRD',
    domain: 'solution',
    abstraction: 'physical',
    format: 'catalogue',
    key: true,
    name: 'Solution Architecture Guardrails',
    description: 'Rules and minimum standards that must be followed in Solution Architecture.',
    relatedTo: [{ artefactId: 'SOL-PRN-GRD', relationship: 'informs' }],
  },
  {
    id: 'SOL-PRN-GRD',
    domain: 'solution',
    abstraction: 'physical',
    format: 'matrix',
    key: false,
    name: 'Solution Architecture Principles ↔ Guardrails',
    description:
      'Maps Solution Architecture Principles to the Guardrails that make them concrete and enforceable.',
    relatedTo: [
      { artefactId: 'SOL-PRN', relationship: 'derived-from' },
      { artefactId: 'SOL-GRD', relationship: 'derived-from' },
    ],
  },
  // Solution: Documents
  {
    id: 'SOL-AVI',
    domain: 'solution',
    abstraction: 'conceptual',
    format: 'document',
    key: false,
    name: 'Architecture Vision(s)',
    description:
      'TOGAF Phase A: Architecture Vision. One or more architecture vision documents capturing the strategic intent, objectives, drivers, and constraints for a programme or domain, together with the stakeholders involved and the concerns they hold. Multiple instances, one per initiative.',
    relatedTo: [
      { artefactId: 'BUS-CAP', relationship: 'informs' },
      { artefactId: 'SOL-AIN', relationship: 'informs' },
    ],
  },
  {
    id: 'SOL-AIN',
    domain: 'solution',
    abstraction: 'conceptual',
    format: 'document',
    key: false,
    name: 'Architecture Intent(s)',
    description:
      'TOGAF Phase A: Architecture Vision. Structured records of architecture direction before formal ADRs, capturing context, the stakeholders and concerns in play, options considered, and the recommended direction. Multiple instances, one per domain or capability area.',
    relatedTo: [
      { artefactId: 'SOL-AVI', relationship: 'derived-from' },
      { artefactId: 'SOL-SVI', relationship: 'informs' },
    ],
  },
  {
    id: 'SOL-SVI',
    domain: 'solution',
    abstraction: 'logical',
    format: 'document',
    key: false,
    name: 'Solution Intent(s)',
    description:
      'TOGAF Phases B–D: Architecture Definition. The SAFe Solution Intent, the single source of truth for what is being built and why, distinguishing fixed intent (committed requirements and decisions) from variable intent (options still under exploration). High-level solution descriptions per epic or feature: problem statement, solution overview, platforms involved, risks, and assumptions. Multiple instances, one per epic or initiative.',
    relatedTo: [
      { artefactId: 'SOL-AIN', relationship: 'derived-from' },
      { artefactId: 'SOL-SDE', relationship: 'informs' },
      { artefactId: 'APP-DAP', relationship: 'informs' },
    ],
  },
  {
    id: 'SOL-SDE',
    domain: 'solution',
    abstraction: 'logical',
    format: 'document',
    key: false,
    name: 'Solution Design(s)',
    description:
      'TOGAF Phases B–D: Architecture Definition. Detailed logical solution designs per feature: solution components, data flows, UML diagrams (Mermaid/PlantUML), interface requirements, and NFRs. Multiple instances, one per feature or design area.',
    relatedTo: [
      { artefactId: 'SOL-SVI', relationship: 'derived-from' },
      { artefactId: 'INT-IFC', relationship: 'informs' },
      { artefactId: 'SOL-ISP', relationship: 'informs' },
    ],
  },
  {
    id: 'SOL-ISP',
    domain: 'solution',
    abstraction: 'physical',
    format: 'document',
    key: false,
    name: 'Interface Specification(s)',
    description:
      'TOGAF Phases B–D: Architecture Definition (Technology Architecture). Physical-level technical specifications for integration interfaces: protocol, auth, data format, endpoints, data model, error handling, SLA, and test scenarios. Multiple instances, one per interface.',
    relatedTo: [
      { artefactId: 'SOL-SDE', relationship: 'derived-from' },
      { artefactId: 'INT-IFC', relationship: 'derived-from' },
    ],
  },
]
export const ARTEFACTS = ARTEFACTS_BASE.map((a) => ({ ...a, ...tr('artefacts', a.id) }))

// Maps an entity instance ID (e.g. CAP-006, PLAT-BI, INT-IFC-001, SOL-PRN-002)
// to the artefact type whose catalogue holds it, so references in documents can
// link or open a detail view. Returns null when the prefix isn't recognised.
export const resolveRefArtefactId = (entityId) => {
  if (!entityId) return null
  if (entityId.startsWith('CAP-')) return 'BUS-CAP'
  if (entityId.startsWith('PROC-')) return 'BUS-PRO'
  if (entityId.startsWith('CON-') || entityId.startsWith('DAT-DOM-')) return 'DAT-DAC'
  if (entityId.startsWith('APP-DOM-') || entityId.startsWith('PLAT-')) return 'APP-DAP'
  if (entityId.startsWith('INT-IFC')) return 'INT-IFC'
  const prn = entityId.match(/^([A-Z]+)-PRN/)
  if (prn) return `${prn[1]}-PRN`
  const str = entityId.match(/^([A-Z]+)-STR/)
  if (str) return `${str[1]}-STR`
  return null
}

export const getArtefact = (id) => ARTEFACTS.find((a) => a.id === id)
export const getDomain = (id) => DOMAINS.find((d) => d.id === id)
export const getAbstraction = (id) => ABSTRACTIONS.find((a) => a.id === id)

export const getArtefactsForDomain = (domainId, abstractionId = null) =>
  ARTEFACTS.filter(
    (a) => a.domain === domainId && (!abstractionId || a.abstraction === abstractionId)
  )

// Per-domain colour kit. One entry per domain: every component that needs a
// domain-coloured element reads from here rather than defining its own map.
//   bg/text/border/dot: tints for chips, icon tiles and indicators
//   accent: solid left-border accent on cards and rows
//   button: solid call-to-action button colours
//   nav   : active state for the domain navigation tabs
export const DOMAIN_COLORS = {
  business: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    dot: 'bg-violet-500',
    accent: 'border-violet-400',
    button: 'bg-violet-600 hover:bg-violet-700 text-white',
    nav: {
      border: 'border-violet-500',
      text: 'text-violet-700',
      bg: 'bg-violet-50',
      icon: 'text-violet-600',
    },
  },
  data: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    accent: 'border-blue-400',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    nav: {
      border: 'border-blue-500',
      text: 'text-blue-700',
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
    },
  },
  integration: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    accent: 'border-emerald-400',
    button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    nav: {
      border: 'border-emerald-500',
      text: 'text-emerald-700',
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
    },
  },
  application: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    accent: 'border-amber-400',
    button: 'bg-amber-500 hover:bg-amber-600 text-white',
    nav: {
      border: 'border-amber-500',
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
    },
  },
  solution: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    accent: 'border-rose-400',
    button: 'bg-rose-600 hover:bg-rose-700 text-white',
    nav: {
      border: 'border-rose-500',
      text: 'text-rose-700',
      bg: 'bg-rose-50',
      icon: 'text-rose-600',
    },
  },
}

export const ABSTRACTION_COLORS = {
  conceptual: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    header: 'bg-gray-700 text-white',
  },
  logical: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    header: 'bg-gray-700 text-white',
  },
  physical: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-700',
    header: 'bg-gray-700 text-white',
  },
}
