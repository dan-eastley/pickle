import { describe, it, expect } from 'vitest'
import { inferRunningWorkflow } from './decisionWorkflow'

describe('inferRunningWorkflow ([DEC-8])', () => {
  it('is null with no decision, and in non-workflow / terminal states', () => {
    expect(inferRunningWorkflow(null)).toBeNull()
    expect(inferRunningWorkflow({ status: 'draft' })).toBeNull()
    expect(inferRunningWorkflow({ status: 'committed' })).toBeNull()
    expect(inferRunningWorkflow({ status: 'rejected' })).toBeNull()
  })

  it('proposed is running until challenger-analysis lands', () => {
    expect(inferRunningWorkflow({ status: 'proposed' })).toMatchObject({ status: 'proposed' })
    expect(inferRunningWorkflow({ status: 'proposed', 'challenger-analysis': [] })).toMatchObject({
      status: 'proposed',
    })
    expect(
      inferRunningWorkflow({ status: 'proposed', 'challenger-analysis': [{ finding: 'x' }] })
    ).toBeNull()
  })

  it('accepted is running until architecture-changes lands', () => {
    expect(inferRunningWorkflow({ status: 'accepted' })).toBeTruthy()
    expect(
      inferRunningWorkflow({
        status: 'accepted',
        'architecture-changes': [{ 'change-type': 'create' }],
      })
    ).toBeNull()
  })

  it('staged is running until a pr-number lands', () => {
    expect(inferRunningWorkflow({ status: 'staged' })).toBeTruthy()
    expect(inferRunningWorkflow({ status: 'staged', 'pr-number': 42 })).toBeNull()
  })
})
