import { Link } from 'react-router-dom'

// Shared button. Renders a <Link> when `to` is given, an <a> for `href`,
// otherwise a <button>. Use variant="custom" with className for the
// domain-coloured buttons (DOMAIN_COLORS[domain].button).
const BASE = 'inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed'

const VARIANTS = {
  primary:   'bg-brand-600 hover:bg-brand-700 text-white',
  secondary: 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-600',
  danger:    'bg-error-50 border border-error-300 hover:bg-error-100 text-error-700',
  ghost:     'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
  custom:    '',
}

const SIZES = {
  sm: 'px-3 py-1.5',
  md: 'px-4 py-1.5',
  lg: 'px-4 py-2',
}

export default function Button({ to, href, variant = 'primary', size = 'md', className = '', children, ...props }) {
  const cls = `${BASE} ${VARIANTS[variant] ?? VARIANTS.primary} ${SIZES[size] ?? SIZES.md} ${className}`.trim()
  if (to) return <Link to={to} className={cls} {...props}>{children}</Link>
  if (href) return <a href={href} className={cls} {...props}>{children}</a>
  return <button className={cls} {...props}>{children}</button>
}
