// Renders an unDraw illustration (MIT, no attribution required — sourced from
// balazser/undraw-svg-collection) inlined into the DOM so its accent colour can
// be themed via the `--primary-svg-color` custom property the SVGs reference.
//
// Inlining (rather than <img>) is what lets the CSS variable cascade in, so the
// accent can pick up the brand or a domain colour. Pass `domain` for a domain
// tint, `color` for an explicit hex, or neither for the brand blue.

const modules = import.meta.glob('../../assets/illustrations/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const SVGS = {}
for (const [path, raw] of Object.entries(modules)) {
  const name = path.split('/').pop().replace('.svg', '')
  SVGS[name] = raw
}

// Domain accent hexes — mirror the -500 tints used in DOMAIN_COLORS.
const DOMAIN_HEX = {
  business: '#8b5cf6',
  data: '#3b82f6',
  integration: '#10b981',
  application: '#f59e0b',
  solution: '#f43f5e',
}

const BRAND = '#2970FF'

export const illustrationNames = Object.keys(SVGS)

export default function Illustration({ name, domain, color, className = '' }) {
  const svg = SVGS[name]
  if (!svg) return null
  const accent = color ?? (domain && DOMAIN_HEX[domain]) ?? BRAND
  return (
    <div
      aria-hidden="true"
      className={`[&>svg]:w-full [&>svg]:h-auto ${className}`}
      style={{ '--primary-svg-color': accent }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
