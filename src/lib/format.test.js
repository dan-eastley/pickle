import { describe, it, expect } from 'vitest'
import { nameWithId } from './format'

describe('nameWithId', () => {
  it('combines a name and id', () => {
    expect(nameWithId('Solution Design', 'SOL-SDE')).toBe('Solution Design [SOL-SDE]')
  })
  it('falls back to the id when there is no name', () => {
    expect(nameWithId('', 'CAP-001')).toBe('CAP-001')
    expect(nameWithId(undefined, 'CAP-001')).toBe('CAP-001')
  })
  it('falls back to the name when there is no id', () => {
    expect(nameWithId('Customer Management', '')).toBe('Customer Management')
  })
  it('returns an empty string when both are missing', () => {
    expect(nameWithId('', '')).toBe('')
    expect(nameWithId()).toBe('')
  })
})
