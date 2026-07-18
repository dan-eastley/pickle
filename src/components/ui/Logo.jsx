import { Link } from 'react-router-dom'

// Reusable Pickle logo: the PICKLE wordmark (brand gradient) with the
// "Agentic Architecture as a Service" tagline underneath in small grey.
// Two alignments (left / center) and a few sizes. Used in the header bar,
// the auth pages, and the homepage hero so the brand stays consistent.
const SIZES = {
  sm: { word: 'text-lg', tag: 'text-3xs', gap: 'mt-0' },
  md: { word: 'text-2xl', tag: 'text-2xs', gap: 'mt-0' },
  lg: { word: 'text-4xl sm:text-5xl', tag: 'text-xs', gap: 'mt-0.5' },
  xl: { word: 'text-6xl sm:text-7xl', tag: 'text-base', gap: 'mt-1' },
}

export default function Logo({ align = 'left', size = 'md', to, className = '' }) {
  const s = SIZES[size] ?? SIZES.md
  const alignCls = align === 'center' ? 'items-center text-center' : 'items-start text-left'

  const content = (
    <span className={`inline-flex flex-col leading-none ${alignCls} ${className}`}>
      <span
        className={`${s.word} font-bold tracking-widest uppercase bg-gradient-to-r from-brand-700 to-rose-600 bg-clip-text text-transparent`}
      >
        Pickle
      </span>
      <span className={`${s.gap} ${s.tag} font-medium tracking-wide text-gray-500`}>
        Agentic Architecture as a Service
      </span>
    </span>
  )

  if (to) {
    return (
      <Link to={to} className="inline-block hover:opacity-90 transition-opacity">
        {content}
      </Link>
    )
  }
  return content
}
