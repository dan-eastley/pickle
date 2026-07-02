import { describe, it, expect } from 'vitest'
import { enumLabel, enumValueLabel, enumValueStyle, collectEnums } from './enums'

describe('enumLabel', () => {
  it('uses a known label or title-cases the key', () => {
    expect(enumLabel('importance')).toBe('Importance')
    expect(enumLabel('lifecycle')).toBe('Lifecycle')
    expect(enumLabel('somethingNew')).toBe('SomethingNew')
  })
})

describe('enumValueLabel', () => {
  it('title-cases and de-dashes a value', () => {
    expect(enumValueLabel('system-of-engagement')).toBe('System Of Engagement')
    expect(enumValueLabel('adopt')).toBe('Adopt')
  })
})

describe('enumValueStyle', () => {
  it('gives a full token set with an explicit colour for a known value', () => {
    const s = enumValueStyle('importance', 'strategic')
    expect(s).toMatchObject({
      dot: expect.stringContaining('violet'),
      badge: expect.stringContaining('violet'),
      fill: expect.stringContaining('violet'),
      textFill: expect.stringContaining('violet'),
    })
  })

  it('assigns unknown values a stable colour (same value → same colour)', () => {
    const a = enumValueStyle('type', 'made-up-value')
    const b = enumValueStyle('type', 'made-up-value')
    expect(a).toEqual(b)
    expect(a.dot).toMatch(/^bg-/)
  })
})

describe('collectEnums', () => {
  it('collects distinct enum values across groups and nested items', () => {
    const groups = [
      {
        id: 'g1',
        meta: { importance: 'strategic' },
        items: [
          { id: 'i1', meta: { importance: 'foundational' } },
          { id: 'i2', meta: { importance: 'strategic', lifecycle: 'adopt' } },
        ],
      },
      { id: 'g2', meta: { lifecycle: 'trial' } },
    ]
    const out = collectEnums(groups)
    const byKey = Object.fromEntries(out.map((e) => [e.key, e.values.map((v) => v.value)]))
    expect(byKey.importance).toEqual(['foundational', 'strategic'])
    expect(byKey.lifecycle).toEqual(['adopt', 'trial'])
    // each value carries a label + style
    expect(out[0].values[0]).toHaveProperty('label')
    expect(out[0].values[0].style).toHaveProperty('dot')
  })

  it('returns [] when there is no enum meta', () => {
    expect(collectEnums([{ id: 'g', items: [{ id: 'i' }] }])).toEqual([])
    expect(collectEnums(undefined)).toEqual([])
  })
})
