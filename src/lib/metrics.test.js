import { describe, it, expect } from 'vitest'
import { maturityTier } from './metrics'

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
