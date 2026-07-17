// Small count pill used on the nav tabs (Decisions / Discovery) and elsewhere.
// 11px/600, square, tinted. Renders nothing for a null/0 count unless
// `showZero` is set.
const TONES = {
  blue: 'bg-blue-50 text-blue-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  gray: 'bg-gray-100 text-gray-600',
  brand: 'bg-brand-50 text-brand-700',
}

export default function CountBadge({ count, tone = 'gray', showZero = false, className = '' }) {
  const n = count ?? 0
  if (!n && !showZero) return null
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[18px] px-1.5 h-[18px] text-[11px] font-semibold tabular-nums ${TONES[tone] ?? TONES.gray} ${className}`}
    >
      {n}
    </span>
  )
}
