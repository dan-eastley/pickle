import { describe, it, expect } from 'vitest'
import {
  decisionStatusBadge,
  decisionStatusLabel,
  versionStatusBadge,
  DECISION_STATUS,
  DECISION_STATUS_ORDER,
} from './theme'

describe('decision status helpers', () => {
  it('returns the badge for a known status and a fallback otherwise', () => {
    expect(decisionStatusBadge('accepted')).toBe(DECISION_STATUS.accepted.badge)
    expect(decisionStatusBadge('nonsense')).toBe('bg-gray-100 text-gray-600')
  })

  it('returns the label for a known status and echoes the raw value otherwise', () => {
    expect(decisionStatusLabel('committed')).toBe('Committed')
    expect(decisionStatusLabel('weird')).toBe('weird')
  })

  it('the status order lists every defined status', () => {
    expect([...DECISION_STATUS_ORDER].sort()).toEqual(Object.keys(DECISION_STATUS).sort())
  })
})

describe('versionStatusBadge', () => {
  it('maps a known transition status and falls back for unknown', () => {
    expect(versionStatusBadge('active')).toContain('success')
    expect(versionStatusBadge('draft')).toContain('warning')
    expect(versionStatusBadge(undefined)).toBe('bg-gray-100 text-gray-500')
  })
})
