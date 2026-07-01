import { describe, it, expect } from 'vitest'
import {
  valueToString,
  arrayToTable,
  catalogueTables,
  catalogueToBlocks,
  documentToBlocks,
} from './blocks'

describe('valueToString', () => {
  it('renders scalars and joins arrays of scalars', () => {
    expect(valueToString('x')).toBe('x')
    expect(valueToString(3)).toBe('3')
    expect(valueToString(['a', 'b'])).toBe('a, b')
  })

  it('summarises objects as key/value pairs', () => {
    expect(valueToString({ 'source-system': 'CRM', count: 2 })).toBe('Source System: CRM; Count: 2')
  })
})

describe('arrayToTable', () => {
  it('builds columns from the union of object keys', () => {
    const table = arrayToTable([
      { id: 'C1', name: 'One' },
      { id: 'C2', level: 2 },
    ])
    expect(table.columns).toEqual(['Id', 'Name', 'Level'])
    expect(table.rows).toEqual([
      ['C1', 'One', ''],
      ['C2', '', '2'],
    ])
  })

  it('handles arrays of scalars with a single Value column', () => {
    expect(arrayToTable(['a', 'b'])).toEqual({
      type: 'table',
      columns: ['Value'],
      rows: [['a'], ['b']],
    })
  })
})

describe('catalogueTables', () => {
  it('emits one table per array property and skips activity', () => {
    const data = {
      description: 'ignored',
      capabilities: [{ id: 'CAP-1', name: 'Bill' }],
      domains: [{ id: 'DOM-1' }],
      activity: [{ action: 'Created' }],
    }
    const tables = catalogueTables(data)
    expect(tables.map((t) => t.name)).toEqual(['Capabilities', 'Domains'])
  })
})

describe('catalogueToBlocks', () => {
  it('leads with a title and description heading', () => {
    const blocks = catalogueToBlocks(
      { description: 'A catalogue', capabilities: [{ id: 'CAP-1' }] },
      { id: 'BUS-CAP', name: 'Business Capabilities' }
    )
    expect(blocks[0]).toEqual({ type: 'heading', level: 1, text: 'Business Capabilities' })
    expect(blocks[1]).toEqual({ type: 'paragraph', text: 'A catalogue' })
    expect(blocks.some((b) => b.type === 'table')).toBe(true)
  })
})

describe('documentToBlocks', () => {
  const sections = [
    {
      key: 'overview',
      title: 'Overview',
      subsections: [
        { key: 'vision-statement', title: 'Vision', content: 'prose' },
        { key: 'missing', title: 'Missing', content: 'prose' },
      ],
    },
  ]

  it('walks meta.sections and skips empty leaves', () => {
    const doc = { id: 'AVI-001', title: 'Vision Doc', 'vision-statement': 'Be great.' }
    const blocks = documentToBlocks(doc, sections)
    const texts = blocks.map((b) => b.text)
    expect(blocks[0]).toEqual({ type: 'heading', level: 1, text: 'Vision Doc' })
    expect(texts).toContain('Overview')
    expect(texts).toContain('Vision')
    expect(texts).not.toContain('Missing') // empty leaf is pruned
  })

  it('falls back to walking instance fields when there are no sections', () => {
    const doc = { id: 'X', title: 'Doc', 'key-finding': 'Important', status: 'active' }
    const blocks = documentToBlocks(doc, undefined)
    const texts = blocks.map((b) => b.text)
    expect(texts).toContain('Key Finding')
    expect(texts).toContain('Important')
    expect(texts).not.toContain('Status') // metadata key skipped
  })
})
