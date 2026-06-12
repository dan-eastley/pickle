export const DOCS_NAV = [
  {
    id: 'model',
    title: 'Architecture Model',
    items: [
      { title: 'Overview', path: 'index' },
      { title: 'Domains', path: 'domains' },
      { title: 'Abstraction Layers', path: 'abstraction-layers' },
      { title: 'Output Formats', path: 'output-formats' },
      { title: 'Artefact Types', path: 'artefacts' },
    ],
  },
  {
    id: 'schemas',
    title: 'Core Schemas',
    items: [
      { title: 'Overview', path: 'schemas/index' },
      { title: 'Clients index', path: 'schemas/clients' },
      { title: 'Client', path: 'schemas/client' },
      { title: 'Versions index', path: 'schemas/versions' },
      { title: 'Version', path: 'schemas/version' },
      { title: 'Decisions index', path: 'schemas/decisions' },
      { title: 'Decision (ADR)', path: 'schemas/decision' },
      { title: 'Artefact schema index', path: 'schemas/artefacts' },
    ],
  },
  {
    id: 'artefact-schemas',
    title: 'Artefact Schemas',
    items: [
      { title: 'BUS-STR — Business Architecture Strategy', path: 'schemas/artefacts/domains/business/conceptual/BUS-STR', group: 'Business' },
      { title: 'BUS-CAP — Business Capabilities', path: 'schemas/artefacts/domains/business/conceptual/BUS-CAP', group: 'Business' },
      { title: 'BUS-PRO — Business Processes', path: 'schemas/artefacts/domains/business/conceptual/BUS-PRO', group: 'Business' },
      { title: 'BUS-PRN — Business Architecture Principles', path: 'schemas/artefacts/domains/business/logical/BUS-PRN', group: 'Business' },
      { title: 'BUS-STR-PRN — Business Architecture Strategy ↔ Principles', path: 'schemas/artefacts/domains/business/logical/BUS-STR-PRN', group: 'Business' },
      { title: 'BUS-GRD — Business Architecture Guardrails', path: 'schemas/artefacts/domains/business/physical/BUS-GRD', group: 'Business' },
      { title: 'BUS-PRN-GRD — Business Architecture Principles ↔ Guardrails', path: 'schemas/artefacts/domains/business/physical/BUS-PRN-GRD', group: 'Business' },
      { title: 'DAT-STR — Data Architecture Strategy', path: 'schemas/artefacts/domains/data/conceptual/DAT-STR', group: 'Data' },
      { title: 'DAT-DAC — Data Domains & Concepts', path: 'schemas/artefacts/domains/data/conceptual/DAT-DAC', group: 'Data' },
      { title: 'DAT-PRN — Data Architecture Principles', path: 'schemas/artefacts/domains/data/logical/DAT-PRN', group: 'Data' },
      { title: 'DAT-STR-PRN — Data Architecture Strategy ↔ Principles', path: 'schemas/artefacts/domains/data/logical/DAT-STR-PRN', group: 'Data' },
      { title: 'DAT-GRD — Data Architecture Guardrails', path: 'schemas/artefacts/domains/data/physical/DAT-GRD', group: 'Data' },
      { title: 'DAT-PRN-GRD — Data Architecture Principles ↔ Guardrails', path: 'schemas/artefacts/domains/data/physical/DAT-PRN-GRD', group: 'Data' },
      { title: 'INT-STR — Integration Architecture Strategy', path: 'schemas/artefacts/domains/integration/conceptual/INT-STR', group: 'Integration' },
      { title: 'INT-PRN — Integration Architecture Principles', path: 'schemas/artefacts/domains/integration/logical/INT-PRN', group: 'Integration' },
      { title: 'INT-STR-PRN — Integration Architecture Strategy ↔ Principles', path: 'schemas/artefacts/domains/integration/logical/INT-STR-PRN', group: 'Integration' },
      { title: 'INT-GRD — Integration Architecture Guardrails', path: 'schemas/artefacts/domains/integration/physical/INT-GRD', group: 'Integration' },
      { title: 'INT-PRN-GRD — Integration Architecture Principles ↔ Guardrails', path: 'schemas/artefacts/domains/integration/physical/INT-PRN-GRD', group: 'Integration' },
      { title: 'APP-STR — Application Architecture Strategy', path: 'schemas/artefacts/domains/application/conceptual/APP-STR', group: 'Application' },
      { title: 'APP-DAP — Application Domains & Platforms', path: 'schemas/artefacts/domains/application/logical/APP-DAP', group: 'Application' },
      { title: 'APP-PRN — Application Architecture Principles', path: 'schemas/artefacts/domains/application/logical/APP-PRN', group: 'Application' },
      { title: 'APP-STR-PRN — Application Architecture Strategy ↔ Principles', path: 'schemas/artefacts/domains/application/logical/APP-STR-PRN', group: 'Application' },
      { title: 'APP-GRD — Application Architecture Guardrails', path: 'schemas/artefacts/domains/application/physical/APP-GRD', group: 'Application' },
      { title: 'APP-PRN-GRD — Application Architecture Principles ↔ Guardrails', path: 'schemas/artefacts/domains/application/physical/APP-PRN-GRD', group: 'Application' },
      { title: 'SOL-STR — Solution Architecture Strategy', path: 'schemas/artefacts/domains/solution/conceptual/SOL-STR', group: 'Solution' },
      { title: 'SOL-PRN — Solution Architecture Principles', path: 'schemas/artefacts/domains/solution/logical/SOL-PRN', group: 'Solution' },
      { title: 'SOL-STR-PRN — Solution Architecture Strategy ↔ Principles', path: 'schemas/artefacts/domains/solution/logical/SOL-STR-PRN', group: 'Solution' },
      { title: 'SOL-GRD — Solution Architecture Guardrails', path: 'schemas/artefacts/domains/solution/physical/SOL-GRD', group: 'Solution' },
      { title: 'SOL-PRN-GRD — Solution Architecture Principles ↔ Guardrails', path: 'schemas/artefacts/domains/solution/physical/SOL-PRN-GRD', group: 'Solution' },
    ],
  },
  {
    id: 'workflows',
    title: 'Workflows',
    items: [
      { title: 'Overview', path: 'workflows/index' },
      { title: 'Validate Branch', path: 'workflows/validate-branch' },
      { title: 'Validate Schema', path: 'workflows/validate-schema' },
      { title: 'Validate Structure', path: 'workflows/validate-structure' },
      { title: 'Validate Context', path: 'workflows/validate-context' },
      { title: 'Validate Merge', path: 'workflows/validate-merge' },
      { title: 'Decisions Analysis', path: 'workflows/decisions-analysis' },
      { title: 'Create Pull Request', path: 'workflows/create-pull-request' },
      { title: 'Create Release', path: 'workflows/create-release' },
    ],
  },
]

export function findDocByPath(path) {
  for (const section of DOCS_NAV) {
    for (const item of section.items) {
      if (item.path === path) return item
    }
  }
  return null
}
