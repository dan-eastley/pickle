// Per-client logo tiles. Each known sample client gets a distinct sector glyph
// and brand colour — a placeholder for what would eventually be the customer's
// real logo. Unknown clients fall back to coloured initials. Shared by the
// clients picker and the versions page so the mark carries through.

function initials(name) {
  return (
    name
      .split(/\s+/)
      .filter((w) => /^[A-Z]/.test(w))
      .map((w) => w[0])
      .slice(0, 3)
      .join('') || name.slice(0, 2).toUpperCase()
  )
}

// Sector glyphs — geometric strokes, strokeWidth 1.5, matching the icon set.
const TRANSMISSION = (
  <>
    <path d="M12 3 6 21M12 3l6 18M5 21h14" />
    <path d="M8 10h8M7 15h10" />
    <path d="M9 10l3 2 3-2M8 15l4 2 4-2" strokeOpacity="0.55" />
  </>
)
const DISTRIBUTION = (
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 12l3.5-3" />
    <path d="M12 3.5v1.5M20.5 12H19M12 20.5V19M3.5 12H5" />
  </>
)
const WATER = (
  <>
    <path d="M12 3.5s6.5 6.8 6.5 11a6.5 6.5 0 0 1-13 0c0-4.2 6.5-11 6.5-11Z" />
    <path d="M8.5 14a3.5 3.5 0 0 0 3.5 3.5" strokeOpacity="0.6" />
  </>
)
const GENERATION = (
  <>
    <path d="M12 13v8M9 21h6" />
    <circle cx="12" cy="11" r="1.4" />
    <path d="M12 9.6V3.5M13.2 11.7l5.3 3M10.8 11.7l-5.3 3" />
  </>
)
const RETAIL = (
  <>
    <path d="M9.5 18.5h5M10.5 21h3" />
    <path d="M12 3a6 6 0 0 1 3.5 10.9c-.5.4-.8 1-.8 1.6v.5h-5.4v-.5c0-.6-.3-1.2-.8-1.6A6 6 0 0 1 12 3Z" />
  </>
)

const LOGOS = {
  fetc: { glyph: TRANSMISSION, tile: 'bg-indigo-600' },
  fedc: { glyph: DISTRIBUTION, tile: 'bg-amber-500' },
  fwwc: { glyph: WATER, tile: 'bg-sky-600' },
  fegc: { glyph: GENERATION, tile: 'bg-emerald-600' },
  fersc: { glyph: RETAIL, tile: 'bg-rose-600' },
}

export default function ClientLogo({ clientId, name = '', className = 'w-12 h-12' }) {
  const logo = LOGOS[clientId]
  if (!logo) {
    return (
      <div
        className={`${className} bg-brand-50 flex items-center justify-center flex-shrink-0`}
        aria-hidden="true"
      >
        <span className="text-sm font-bold text-brand-600 tracking-tight">{initials(name)}</span>
      </div>
    )
  }
  return (
    <div
      className={`${className} ${logo.tile} flex items-center justify-center flex-shrink-0 text-white`}
      role="img"
      aria-label={`${name || clientId} logo`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-7 h-7"
      >
        {logo.glyph}
      </svg>
    </div>
  )
}
