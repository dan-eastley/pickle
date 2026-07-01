import { describe, it, expect } from 'vitest'
import { can, ACTIONS, buildContext } from './permissions'

const ctx = (over) => buildContext(over)

describe('permissions.can', () => {
  it('denies everything when unauthenticated', () => {
    const c = ctx({ authenticated: false })
    expect(can(c, ACTIONS.VIEW)).toBe(false)
    expect(can(c, ACTIONS.ARCHITECTURE_EDIT, { architectureId: 'fedc' })).toBe(false)
  })

  it('admin can do anything', () => {
    const c = ctx({ authenticated: true, isAdmin: true })
    expect(can(c, ACTIONS.ARCHITECTURE_EDIT, { architectureId: 'fedc' })).toBe(true)
    expect(can(c, ACTIONS.ACCESS_GRANT, { architectureId: 'other' })).toBe(true)
    expect(can(c, ACTIONS.ARCHITECTURE_CREATE)).toBe(true)
  })

  it('any authenticated member may create an architecture (self-serve)', () => {
    const c = ctx({ authenticated: true, memberships: {} })
    expect(can(c, ACTIONS.ARCHITECTURE_CREATE)).toBe(true)
  })

  it('owner can edit + manage only their architecture', () => {
    const c = ctx({ authenticated: true, memberships: { fedc: 'owner' } })
    expect(can(c, ACTIONS.ARCHITECTURE_EDIT, { architectureId: 'fedc' })).toBe(true)
    expect(can(c, ACTIONS.TRANSITION_CREATE, { architectureId: 'fedc' })).toBe(true)
    expect(can(c, ACTIONS.ACCESS_GRANT, { architectureId: 'fedc' })).toBe(true)
    expect(can(c, ACTIONS.GOVERNANCE_WRITE, { architectureId: 'fedc' })).toBe(true)
    // Not their architecture:
    expect(can(c, ACTIONS.ARCHITECTURE_EDIT, { architectureId: 'other' })).toBe(false)
  })

  it('contributor can write governance but not settings/access', () => {
    const c = ctx({ authenticated: true, memberships: { fedc: 'contributor' } })
    expect(can(c, ACTIONS.GOVERNANCE_WRITE, { architectureId: 'fedc' })).toBe(true)
    expect(can(c, ACTIONS.ARCHITECTURE_EDIT, { architectureId: 'fedc' })).toBe(false)
    expect(can(c, ACTIONS.TRANSITION_CREATE, { architectureId: 'fedc' })).toBe(false)
    expect(can(c, ACTIONS.ACCESS_GRANT, { architectureId: 'fedc' })).toBe(false)
    expect(can(c, ACTIONS.DECISION_ADVANCE, { architectureId: 'fedc' })).toBe(false)
  })

  it('consumer can view but write nothing', () => {
    const c = ctx({ authenticated: true, memberships: { fedc: 'consumer' } })
    expect(can(c, ACTIONS.VIEW, { architectureId: 'fedc' })).toBe(true)
    expect(can(c, ACTIONS.GOVERNANCE_WRITE, { architectureId: 'fedc' })).toBe(false)
    expect(can(c, ACTIONS.ARCHITECTURE_EDIT, { architectureId: 'fedc' })).toBe(false)
  })
})
