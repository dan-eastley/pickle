export default function Badge({ label, variant = 'gray', size = 'sm' }) {
  const variants = {
    gray:    'bg-gray-100 text-gray-700',
    blue:    'bg-blue-50 text-blue-700',
    violet:  'bg-violet-50 text-violet-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber:   'bg-amber-50 text-amber-700',
    rose:    'bg-rose-50 text-rose-700',
    success: 'bg-success-50 text-success-700',
    warning: 'bg-warning-50 text-warning-700',
    error:   'bg-error-50 text-error-700',
  }
  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-sm font-medium',
  }
  return (
    <span className={`inline-flex items-center rounded-full ${variants[variant]} ${sizes[size]}`}>
      {label}
    </span>
  )
}
