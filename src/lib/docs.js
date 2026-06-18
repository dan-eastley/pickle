export const DOCS_NAV = [
  {
    id: 'core-schemas',
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
      // Business
      { title: 'BUS-STR — Strategy',                        path: 'schemas/artefacts/domains/business/conceptual/BUS-STR',        group: 'Business' },
      { title: 'BUS-CAP — Capabilities',                    path: 'schemas/artefacts/domains/business/conceptual/BUS-CAP',        group: 'Business' },
      { title: 'BUS-BCM — Capability Model',                path: 'schemas/artefacts/domains/business/conceptual/BUS-BCM',        group: 'Business' },
      { title: 'BUS-PRO — Processes',                       path: 'schemas/artefacts/domains/business/conceptual/BUS-PRO',        group: 'Business' },
      { title: 'BUS-BPM — Process Model',                   path: 'schemas/artefacts/domains/business/conceptual/BUS-BPM',        group: 'Business' },
      { title: 'BUS-CAP-PRO — Capabilities ↔ Processes',   path: 'schemas/artefacts/domains/business/conceptual/BUS-CAP-PRO',    group: 'Business' },
      { title: 'BUS-PRN — Principles',                      path: 'schemas/artefacts/domains/business/logical/BUS-PRN',           group: 'Business' },
      { title: 'BUS-STR-PRN — Strategy ↔ Principles',      path: 'schemas/artefacts/domains/business/logical/BUS-STR-PRN',       group: 'Business' },
      { title: 'BUS-GRD — Guardrails',                      path: 'schemas/artefacts/domains/business/physical/BUS-GRD',          group: 'Business' },
      { title: 'BUS-PRN-GRD — Principles ↔ Guardrails',    path: 'schemas/artefacts/domains/business/physical/BUS-PRN-GRD',      group: 'Business' },
      // Data
      { title: 'DAT-STR — Strategy',                        path: 'schemas/artefacts/domains/data/conceptual/DAT-STR',            group: 'Data' },
      { title: 'DAT-DAC — Data Domains & Concepts',         path: 'schemas/artefacts/domains/data/conceptual/DAT-DAC',            group: 'Data' },
      { title: 'DAT-CDM — Conceptual Data Model',           path: 'schemas/artefacts/domains/data/conceptual/DAT-CDM',            group: 'Data' },
      { title: 'DAT-PRN — Principles',                      path: 'schemas/artefacts/domains/data/logical/DAT-PRN',               group: 'Data' },
      { title: 'DAT-STR-PRN — Strategy ↔ Principles',      path: 'schemas/artefacts/domains/data/logical/DAT-STR-PRN',           group: 'Data' },
      { title: 'DAT-GRD — Guardrails',                      path: 'schemas/artefacts/domains/data/physical/DAT-GRD',              group: 'Data' },
      { title: 'DAT-PRN-GRD — Principles ↔ Guardrails',    path: 'schemas/artefacts/domains/data/physical/DAT-PRN-GRD',          group: 'Data' },
      // Integration
      { title: 'INT-STR — Strategy',                        path: 'schemas/artefacts/domains/integration/conceptual/INT-STR',     group: 'Integration' },
      { title: 'INT-IFC — Interface Catalogue',             path: 'schemas/artefacts/domains/integration/logical/INT-IFC',        group: 'Integration' },
      { title: 'INT-WRD — Interface Wiring Diagram',        path: 'schemas/artefacts/domains/integration/logical/INT-WRD',        group: 'Integration' },
      { title: 'INT-DAC-IFC — Data Concepts ↔ Interfaces', path: 'schemas/artefacts/domains/integration/logical/INT-DAC-IFC',    group: 'Integration' },
      { title: 'INT-PRN — Principles',                      path: 'schemas/artefacts/domains/integration/logical/INT-PRN',        group: 'Integration' },
      { title: 'INT-STR-PRN — Strategy ↔ Principles',      path: 'schemas/artefacts/domains/integration/logical/INT-STR-PRN',    group: 'Integration' },
      { title: 'INT-GRD — Guardrails',                      path: 'schemas/artefacts/domains/integration/physical/INT-GRD',       group: 'Integration' },
      { title: 'INT-PRN-GRD — Principles ↔ Guardrails',    path: 'schemas/artefacts/domains/integration/physical/INT-PRN-GRD',   group: 'Integration' },
      // Application
      { title: 'APP-STR — Strategy',                        path: 'schemas/artefacts/domains/application/conceptual/APP-STR',     group: 'Application' },
      { title: 'APP-DAP — Domains & Platforms',             path: 'schemas/artefacts/domains/application/logical/APP-DAP',        group: 'Application' },
      { title: 'APP-DPM — Domains & Platforms Model',       path: 'schemas/artefacts/domains/application/logical/APP-DPM',        group: 'Application' },
      { title: 'APP-CAP-DAP — Capabilities ↔ Platforms',   path: 'schemas/artefacts/domains/application/logical/APP-CAP-DAP',    group: 'Application' },
      { title: 'APP-PRN — Principles',                      path: 'schemas/artefacts/domains/application/logical/APP-PRN',        group: 'Application' },
      { title: 'APP-STR-PRN — Strategy ↔ Principles',      path: 'schemas/artefacts/domains/application/logical/APP-STR-PRN',    group: 'Application' },
      { title: 'APP-CAT — Application Catalogue',           path: 'schemas/artefacts/domains/application/physical/APP-CAT',       group: 'Application' },
      { title: 'APP-DAP-CAT — Platforms ↔ Applications',   path: 'schemas/artefacts/domains/application/physical/APP-DAP-CAT',   group: 'Application' },
      { title: 'APP-GRD — Guardrails',                      path: 'schemas/artefacts/domains/application/physical/APP-GRD',       group: 'Application' },
      { title: 'APP-PRN-GRD — Principles ↔ Guardrails',    path: 'schemas/artefacts/domains/application/physical/APP-PRN-GRD',   group: 'Application' },
      // Solution
      { title: 'SOL-STR — Strategy',                        path: 'schemas/artefacts/domains/solution/conceptual/SOL-STR',        group: 'Solution' },
      { title: 'SOL-AVI — Architecture Vision(s)',          path: 'schemas/artefacts/domains/solution/conceptual/SOL-AVI',        group: 'Solution' },
      { title: 'SOL-AIN — Architecture Intent(s)',          path: 'schemas/artefacts/domains/solution/conceptual/SOL-AIN',        group: 'Solution' },
      { title: 'SOL-PRN — Principles',                      path: 'schemas/artefacts/domains/solution/logical/SOL-PRN',           group: 'Solution' },
      { title: 'SOL-STR-PRN — Strategy ↔ Principles',      path: 'schemas/artefacts/domains/solution/logical/SOL-STR-PRN',       group: 'Solution' },
      { title: 'SOL-SVI — Solution Vision(s)',              path: 'schemas/artefacts/domains/solution/logical/SOL-SVI',           group: 'Solution' },
      { title: 'SOL-SDE — Solution Design(s)',              path: 'schemas/artefacts/domains/solution/logical/SOL-SDE',           group: 'Solution' },
      { title: 'SOL-GRD — Guardrails',                      path: 'schemas/artefacts/domains/solution/physical/SOL-GRD',          group: 'Solution' },
      { title: 'SOL-PRN-GRD — Principles ↔ Guardrails',    path: 'schemas/artefacts/domains/solution/physical/SOL-PRN-GRD',      group: 'Solution' },
      { title: 'SOL-ISP — Interface Specification(s)',      path: 'schemas/artefacts/domains/solution/physical/SOL-ISP',          group: 'Solution' },
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
