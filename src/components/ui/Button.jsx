import { Link } from 'react-router-dom'
import { DOMAIN_COLORS } from '../../lib/artefacts'

// Shared button. Renders a <Link> when `to` is given, an <a> for `href`,
// otherwise a <button>. Use variant="custom" with className for bespoke styles.
//
// Design refresh: pass `domain` with variant="primary" to get the domain-colour
// primary (violet on Business, etc.); global pages omit it and get brand blue.
const BASE =
  'inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed'

const VARIANTS = {
  primary: 'bg-brand-600 hover:bg-brand-700 text-white',
  secondary: 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-600',
  tertiary: 'text-blue-600 hover:text-blue-700 underline underline-offset-4 !px-0',
  danger: 'bg-error-50 border border-error-300 hover:bg-error-100 text-error-700',
  ghost: 'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
  custom: '',
}

// h-8 (32px) is the design-refresh action height; `md`/`lg` kept for existing
// callers and the auth forms.
const SIZES = {
  h8: 'h-8 px-3 text-[13px]',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-1.5 text-sm',
  lg: 'px-4 py-2 text-sm',
}

export default function Button({
  to,
  href,
  variant = 'primary',
  size = 'md',
  domain,
  className = '',
  children,
  ...props
}) {
  const variantCls =
    variant === 'primary' && domain && DOMAIN_COLORS[domain]
      ? DOMAIN_COLORS[domain].button
      : (VARIANTS[variant] ?? VARIANTS.primary)
  const cls = `${BASE} ${variantCls} ${SIZES[size] ?? SIZES.md} ${className}`.trim()
  if (to)
    return (
      <Link to={to} className={cls} {...props}>
        {children}
      </Link>
    )
  if (href)
    return (
      <a href={href} className={cls} {...props}>
        {children}
      </a>
    )
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  )
}
