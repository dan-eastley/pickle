import { Link } from 'react-router-dom'

export const TEXT_LINK_CLASS = 'text-brand-600 hover:text-brand-700 underline transition-colors'

export default function TextLink({ to, href, className = '', children, ...props }) {
  const cls = `${TEXT_LINK_CLASS} ${className}`.trim()
  if (to)
    return (
      <Link to={to} className={cls} {...props}>
        {children}
      </Link>
    )
  return (
    <a href={href} className={cls} {...props}>
      {children}
    </a>
  )
}
