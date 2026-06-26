import { describe, it, expect } from 'vitest'
import { maturityTier, extractContentItems, mergeContent } from './metrics'

describe('maturityTier', () => {
  it('maps a populated ratio to its tier label', () => {
    expect(maturityTier(1)).toBe('Complete')
    expect(maturityTier(0.9)).toBe('Mature')
    expect(maturityTier(0.75)).toBe('Mature')
    expect(maturityTier(0.6)).toBe('Established')
    expect(maturityTier(0.5)).toBe('Established')
    expect(maturityTier(0.3)).toBe('Developing')
    expect(maturityTier(0.25)).toBe('Developing')
    expect(maturityTier(0.1)).toBe('Seed')
    expect(maturityTier(0)).toBe('Seed')
  })
})

describe('extractContentItems', () => {
  it('counts content arrays and ignores document metadata arrays', () => {
    const data = {
      description: 'x',
      author: ['a', 'b'],
      audience: ['x'],
      activity: [{ action: 'Created' }],
      strategies: [{ id: 'S1' }, { id: 'S2' }],
    }
    const items = extractContentItems(data, 'business')
    expect(items).toEqual([{ label: 'Strategies', count: 2 }])
  })

  it('splits capabilities by level', () => {
    const data = {
      capabilities: [{ level: 1 }, { level: 2 }, { level: 2 }, { level: 3 }],
    }
    const [caps] = extractContentItems(data, 'business')
    expect(caps.count).toBe(4)
    expect(caps.sub).toEqual([
      { label: 'L1', count: 1 },
      { label: 'L2', count: 2 },
      { label: 'L3', count: 1 },
    ])
  })

  it('qualifies ambiguous domain labels', () => {
    const data = { domains: [{ id: 'D1' }], concepts: [{ id: 'C1' }] }
    const labels = extractContentItems(data, 'data').map((i) => i.label)
    expect(labels).toContain('Data Domains')
    expect(labels).toContain('Data Concepts')
  })
})

describe('mergeContent', () => {
  it('sums counts and per-level sub-counts across lists, ordered by priority', () => {
    const merged = mergeContent([
      [
        { label: 'Principles', count: 3 },
        { label: 'Capabilities', count: 2, sub: [{ label: 'L1', count: 2 }] },
      ],
      [
        {
          label: 'Capabilities',
          count: 4,
          sub: [
            { label: 'L1', count: 1 },
            { label: 'L2', count: 3 },
          ],
        },
      ],
    ])
    // Capabilities sorts before Principles.
    expect(merged[0].label).toBe('Capabilities')
    expect(merged[0].count).toBe(6)
    expect(merged[0].sub).toEqual([
      { label: 'L1', count: 3 },
      { label: 'L2', count: 3 },
    ])
    expect(merged[1]).toEqual({ label: 'Principles', count: 3, sub: undefined })
  })
})
