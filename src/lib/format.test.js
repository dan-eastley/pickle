import { describe, it, expect } from 'vitest'
import { nameWithId, humanize, formatDate, formatDateTime } from './format'

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

describe('humanize', () => {
  it('title-cases kebab and snake case keys', () => {
    expect(humanize('system-of-engagement')).toBe('System Of Engagement')
    expect(humanize('data_domains')).toBe('Data Domains')
  })
  it('title-cases a single word', () => {
    expect(humanize('capabilities')).toBe('Capabilities')
  })
  it('stringifies non-string input', () => {
    expect(humanize(42)).toBe('42')
  })
})

describe('formatDate / formatDateTime', () => {
  // Local-time timestamps (no Z) so the assertions hold in any timezone.
  it('formats a valid timestamp as an en-GB date', () => {
    expect(formatDate('2026-03-04T14:10:00')).toBe('04 Mar 2026')
  })
  it('includes the time in formatDateTime', () => {
    expect(formatDateTime('2026-03-04T14:10:00')).toBe('04 Mar 2026, 14:10')
  })
  it('falls back to the raw value for an unparseable date', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
    expect(formatDateTime('not-a-date')).toBe('not-a-date')
  })
})
