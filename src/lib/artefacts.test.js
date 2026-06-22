import { describe, it, expect } from 'vitest'
import { resolveRefArtefactId, getArtefact } from './artefacts'

describe('resolveRefArtefactId', () => {
  it('maps capability ids to BUS-CAP', () => {
    expect(resolveRefArtefactId('CAP-006')).toBe('BUS-CAP')
  })
  it('maps process ids to BUS-PRO', () => {
    expect(resolveRefArtefactId('PROC-001-03')).toBe('BUS-PRO')
  })
  it('maps platforms and application domains to APP-DAP', () => {
    expect(resolveRefArtefactId('PLAT-BI')).toBe('APP-DAP')
    expect(resolveRefArtefactId('APP-DOM-CUSTOMER')).toBe('APP-DAP')
  })
  it('maps interface ids to INT-IFC', () => {
    expect(resolveRefArtefactId('INT-IFC-001')).toBe('INT-IFC')
  })
  it('maps principle and strategy ids to their domain catalogue', () => {
    expect(resolveRefArtefactId('SOL-PRN-002')).toBe('SOL-PRN')
    expect(resolveRefArtefactId('DAT-STR-001')).toBe('DAT-STR')
  })
  it('returns null for unknown prefixes and empty input', () => {
    expect(resolveRefArtefactId('GRD-SOL-001')).toBeNull()
    expect(resolveRefArtefactId('')).toBeNull()
    expect(resolveRefArtefactId(undefined)).toBeNull()
  })
})

describe('getArtefact', () => {
  it('looks up a registered artefact by id', () => {
    expect(getArtefact('SOL-SDE')?.domain).toBe('solution')
  })
  it('returns undefined for an unknown id', () => {
    expect(getArtefact('NOPE')).toBeUndefined()
  })
})
