import { describe, it, expect } from 'vitest'
import { wrapText, getDiagramColors } from './diagramTheme'

describe('wrapText', () => {
  it('keeps a short label on a single line', () => {
    expect(wrapText('Customer', 20)).toEqual(['Customer'])
  })
  it('wraps onto multiple lines at the character budget', () => {
    const lines = wrapText('Manage Customer Insights', 10, 2)
    expect(lines.length).toBeLessThanOrEqual(2)
    expect(lines.join(' ')).toContain('Manage')
  })
  it('truncates with an ellipsis past maxLines', () => {
    const lines = wrapText('one two three four five six seven eight', 6, 2)
    expect(lines).toHaveLength(2)
    expect(lines[1].endsWith('…')).toBe(true)
  })
})

describe('getDiagramColors', () => {
  it('returns the palette for a known domain', () => {
    expect(getDiagramColors('data').itemFill).toBe('fill-blue-100')
  })
  it('falls back to business for an unknown domain', () => {
    expect(getDiagramColors('nope')).toBe(getDiagramColors('business'))
  })
})
