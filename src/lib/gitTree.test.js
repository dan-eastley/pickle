import { describe, it, expect } from 'vitest'
import { remapSubtree, subtreeExists, fileEntries, mergeEntries } from './gitTree'

const tree = [
  { path: 'architectures/fedc/baseline/transition.json', mode: '100644', type: 'blob', sha: 'a' },
  {
    path: 'architectures/fedc/baseline/domains/business/conceptual/BUS-CAP.json',
    mode: '100644',
    type: 'blob',
    sha: 'b',
  },
  { path: 'architectures/fedc/baseline', mode: '040000', type: 'tree' }, // dir entry, ignored
  { path: 'architectures/fedc/architecture.json', mode: '100644', type: 'blob', sha: 'c' }, // outside prefix
]

describe('remapSubtree', () => {
  it('re-points blobs under the prefix, keeping sha + mode', () => {
    const out = remapSubtree(tree, 'architectures/fedc/baseline', 'architectures/fedc/2026-q2')
    expect(out).toEqual([
      {
        path: 'architectures/fedc/2026-q2/transition.json',
        mode: '100644',
        type: 'blob',
        sha: 'a',
      },
      {
        path: 'architectures/fedc/2026-q2/domains/business/conceptual/BUS-CAP.json',
        mode: '100644',
        type: 'blob',
        sha: 'b',
      },
    ])
  })

  it('ignores tree entries and paths outside the prefix', () => {
    const out = remapSubtree(tree, 'architectures/fedc/baseline', 'architectures/fedc/x')
    expect(out.every((e) => e.type === 'blob')).toBe(true)
    expect(out.some((e) => e.path.includes('architecture.json'))).toBe(false)
  })

  it('tolerates a trailing slash on the prefixes', () => {
    const a = remapSubtree(tree, 'architectures/fedc/baseline/', 'architectures/fedc/y/')
    expect(a[0].path).toBe('architectures/fedc/y/transition.json')
  })
})

describe('subtreeExists', () => {
  it('detects a present subtree and rejects an absent one', () => {
    expect(subtreeExists(tree, 'architectures/fedc/baseline')).toBe(true)
    expect(subtreeExists(tree, 'architectures/fedc/2026-q2')).toBe(false)
  })
})

describe('fileEntries', () => {
  it('builds inline-content blob entries', () => {
    expect(fileEntries([{ path: 'a/b.json', content: '{}' }])).toEqual([
      { path: 'a/b.json', mode: '100644', type: 'blob', content: '{}' },
    ])
  })
})

describe('mergeEntries', () => {
  it('lets an override replace a base entry at the same path', () => {
    const base = [
      { path: 'x/transition.json', mode: '100644', type: 'blob', sha: 'old' },
      { path: 'x/keep.json', mode: '100644', type: 'blob', sha: 'k' },
    ]
    const overrides = [{ path: 'x/transition.json', mode: '100644', type: 'blob', content: 'new' }]
    const out = mergeEntries(base, overrides)
    expect(out).toHaveLength(2)
    expect(out.find((e) => e.path === 'x/transition.json')).toEqual(overrides[0])
    expect(out.find((e) => e.path === 'x/keep.json').sha).toBe('k')
  })
})
