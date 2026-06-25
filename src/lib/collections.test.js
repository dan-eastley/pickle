import { describe, it, expect } from 'vitest'
import { toggleInSet, getRootArrayKey } from './collections'

describe('toggleInSet', () => {
  it('adds an id that is absent', () => {
    const next = toggleInSet(new Set(['a']), 'b')
    expect([...next].sort()).toEqual(['a', 'b'])
  })
  it('removes an id that is present', () => {
    const next = toggleInSet(new Set(['a', 'b']), 'b')
    expect([...next]).toEqual(['a'])
  })
  it('does not mutate the original set', () => {
    const original = new Set(['a'])
    toggleInSet(original, 'b')
    expect([...original]).toEqual(['a'])
  })
})

describe('getRootArrayKey', () => {
  it('returns the first array-valued property', () => {
    expect(getRootArrayKey({ $schema: 'x', capabilities: [1, 2] })).toBe('capabilities')
  })
  it('returns undefined when there is no array', () => {
    expect(getRootArrayKey({ a: 1, b: 'two' })).toBeUndefined()
    expect(getRootArrayKey(null)).toBeUndefined()
  })
  // Regression: metadata arrays (audience/author/activity) must not be mistaken
  // for the content collection, even when they appear first.
  it('skips metadata arrays and returns the content array', () => {
    const data = { $schema: 'x', audience: ['Enterprise Architect'], author: ['Business Architect'], capabilities: [1, 2], activity: [{}] }
    expect(getRootArrayKey(data)).toBe('capabilities')
  })
  it('returns undefined when only metadata arrays are present', () => {
    expect(getRootArrayKey({ $schema: 'x', audience: ['X'], activity: [{}] })).toBeUndefined()
  })
})
