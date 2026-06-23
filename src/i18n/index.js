// Localisation layer. User-facing strings live in config/i18n/<locale>.json,
// keyed by the structural ID they describe. English is the only locale today;
// adding another is a matter of dropping in config/i18n/<locale>.json and
// extending LOCALES below.
//
// The artefact registry (src/lib/artefacts.js) holds the structural model
// (IDs, domains, relationships, formats) and overlays the localised name and
// description from here, so translations never fork the structure.
import en from '../../config/i18n/en.json'

const LOCALES = { en }

// Single-language for now; swap this to read a user/browser preference when
// more locales are added.
export const ACTIVE_LOCALE = 'en'

export const strings = LOCALES[ACTIVE_LOCALE] ?? en

// Look up a localised entry, e.g. tr('artefacts', 'BUS-CAP') → { name, description }.
export function tr(section, id) {
  return strings[section]?.[id] ?? {}
}
