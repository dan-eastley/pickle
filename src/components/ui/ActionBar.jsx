// Standard action bar used across the app. Encodes the house rules so every bar
// is consistent:
//   - Optional title with a strapline (help text) beneath it.
//   - Actions are right-aligned and always rendered in the order
//     Tertiary → Secondary → Primary, regardless of how they're passed.
//   - The bar itself carries no icon.
//
// Button kinds (see Button.jsx variants):
//   - Primary   — domain/stage colour, always with an icon on the left.
//   - Secondary — white, never an icon.
//   - Tertiary  — link styled (blue underline).
export default function ActionBar({ title, strapline, tertiary, secondary, primary, tint, className = '' }) {
  const hasHeading = title || strapline
  const hasActions = tertiary || secondary || primary
  return (
    <div className={`flex items-center justify-between gap-4 ${tint ? `px-5 py-3 ${tint}` : ''} ${className}`}>
      {hasHeading ? (
        <div className="min-w-0">
          {title && <h1 className="text-xl font-semibold text-gray-900">{title}</h1>}
          {strapline && <p className={`text-sm text-gray-500 ${title ? 'mt-1' : ''}`}>{strapline}</p>}
        </div>
      ) : <div />}
      {hasActions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {tertiary}
          {secondary}
          {primary}
        </div>
      )}
    </div>
  )
}
