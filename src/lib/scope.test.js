import { describe, it, expect } from 'vitest'
import { buildScope } from './scope'

describe('buildScope', () => {
  it('returns null when no domain is chosen (whole-architecture scope)', () => {
    expect(buildScope('', '', '')).toBeNull()
    expect(buildScope(undefined, 'logical', 'BUS-CAP')).toBeNull()
  })

  it('includes only the levels that are set', () => {
    expect(buildScope('business')).toEqual({ domain: 'business' })
    expect(buildScope('business', 'logical')).toEqual({
      domain: 'business',
      abstraction: 'logical',
    })
    expect(buildScope('business', 'logical', 'BUS-CAP')).toEqual({
      domain: 'business',
      abstraction: 'logical',
      artefact: 'BUS-CAP',
    })
  })

  it('omits an artefact set without an abstraction', () => {
    expect(buildScope('data', '', 'DAT-DAC')).toEqual({ domain: 'data', artefact: 'DAT-DAC' })
  })
})
