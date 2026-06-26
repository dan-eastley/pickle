import { describe, it, expect } from 'vitest'
import { parseNarrative, decisionChangeFields } from './narrative'

describe('parseNarrative', () => {
  it('splits a composed narrative back into the three fields', () => {
    const narrative =
      '## Context\n\nToday we X.\n\n## Problem\n\nThis is bad.\n\n## Proposal\n\nDo Y.'
    expect(parseNarrative(narrative)).toEqual({
      context: 'Today we X.',
      problem: 'This is bad.',
      proposal: 'Do Y.',
    })
  })

  it('puts an un-headed narrative entirely into context', () => {
    expect(parseNarrative('Just some free text.')).toEqual({
      context: 'Just some free text.',
      problem: '',
      proposal: '',
    })
  })

  it('handles a partial narrative (only some headings)', () => {
    expect(parseNarrative('## Context\n\nA\n\n## Proposal\n\nB')).toEqual({
      context: 'A',
      problem: '',
      proposal: 'B',
    })
  })

  it('returns empty fields for empty input', () => {
    expect(parseNarrative('')).toEqual({ context: '', problem: '', proposal: '' })
  })
})

describe('decisionChangeFields', () => {
  it('prefers the split fields when present', () => {
    const d = { context: 'c', problem: 'p', proposal: 'pr', narrative: '## Context\n\nignored' }
    expect(decisionChangeFields(d)).toEqual({ context: 'c', problem: 'p', proposal: 'pr' })
  })

  it('falls back to parsing the narrative for legacy records', () => {
    const d = { narrative: '## Context\n\nlegacy\n\n## Problem\n\ngap' }
    expect(decisionChangeFields(d)).toEqual({ context: 'legacy', problem: 'gap', proposal: '' })
  })
})
