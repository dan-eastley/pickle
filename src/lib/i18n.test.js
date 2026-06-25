import { describe, it, expect } from 'vitest'
import { strings } from '../i18n'
import { ARTEFACTS, DOMAINS, ABSTRACTIONS, FORMATS, DIAGRAM_TYPES } from './artefacts'

// The locale (config/i18n/en.json) is the source of truth for user-facing
// names/descriptions; the inline strings in artefacts.js are only a fallback.
// These tests enforce that the locale covers every registry id, so the two
// can't drift silently and a new artefact can't ship without a locale entry.
describe('i18n locale coverage', () => {
  const cases = [
    ['artefacts', ARTEFACTS, ['name', 'description']],
    ['domains', DOMAINS, ['name', 'description']],
    ['abstractions', ABSTRACTIONS, ['name', 'label', 'description']],
    ['formats', FORMATS, ['label', 'description']],
    ['diagramTypes', DIAGRAM_TYPES, ['label', 'description']],
  ]

  for (const [section, list, fields] of cases) {
    it(`${section}: every id has locale ${fields.join('/')}`, () => {
      for (const item of list) {
        const entry = strings[section]?.[item.id]
        expect(entry, `${section}.${item.id} missing from en.json`).toBeTruthy()
        for (const f of fields) {
          expect(entry[f], `${section}.${item.id}.${f} missing`).toBeTruthy()
        }
      }
    })
  }
})
