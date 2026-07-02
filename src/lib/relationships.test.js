import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the data layer so we control what each matrix / catalogue returns.
const getArtefactData = vi.fn()
vi.mock('./api', () => ({ getArtefactData: (...a) => getArtefactData(...a) }))

const { loadEntityRelationships } = await import('./relationships')

beforeEach(() => getArtefactData.mockReset())

describe('loadEntityRelationships', () => {
  it('returns [] for an unrecognised entity id', async () => {
    expect(await loadEntityRelationships('ZZZ-1', 'fedc', 'baseline')).toEqual([])
    expect(getArtefactData).not.toHaveBeenCalled()
  })

  it('walks the matrices for a capability and groups related entities by type', async () => {
    // Every matrix that references BUS-CAP links CAP-001 to PROC-009; catalogues
    // return no name map (so names fall back to ids) — enough to prove the graph
    // traversal + grouping.
    getArtefactData.mockResolvedValue({
      relationships: [{ 'row-id': 'CAP-001', 'column-id': 'PROC-009' }],
    })

    const groups = await loadEntityRelationships('CAP-001', 'fedc', 'baseline')
    expect(getArtefactData).toHaveBeenCalled()
    // PROC-009 resolves to the BUS-PRO artefact type.
    const proc = groups.find((g) => g.artefact?.id === 'BUS-PRO')
    expect(proc).toBeTruthy()
    expect(proc.entities.map((e) => e.id)).toContain('PROC-009')
  })

  it('returns [] when no matrix relates to the entity', async () => {
    getArtefactData.mockResolvedValue({ relationships: [] })
    expect(await loadEntityRelationships('CAP-001', 'fedc', 'baseline')).toEqual([])
  })
})
