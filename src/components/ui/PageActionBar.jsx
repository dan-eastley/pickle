import DomainIcon from './DomainIcon'
import { DOMAIN_COLORS } from '../../lib/artefacts'

// The one page-header pattern (HANDOFF §4). A white card with a 3px domain-accent
// left border: optional domain icon tile, a title block (h1 + mono ID chip +
// type chip + one-line description), and right-aligned actions in the strict
// order tertiary → secondary → primary.
//
// Props:
//   domain      — domain id; drives the accent border + icon tile colour.
//   icon        — override the tile contents (defaults to the DomainIcon).
//   showIcon    — render the icon tile (artefact/domain pages only).
//   title, id, typeLabel, description
//   tertiary/secondary/primary — action nodes (rendered in that order).
//   accentClass — override the left-border colour (e.g. status green on decisions).
export default function PageActionBar({
  domain,
  icon,
  showIcon = false,
  title,
  id,
  typeLabel,
  description,
  tertiary,
  secondary,
  primary,
  accentClass,
  children,
}) {
  const colors = domain ? DOMAIN_COLORS[domain] : null
  const accent = accentClass ?? colors?.accent ?? 'border-l-gray-300'
  const hasActions = tertiary || secondary || primary
  return (
    <div className={`bg-white border border-gray-200 border-l-[3px] ${accent} shadow-xs`}>
      <div className="flex items-center gap-4 px-5 py-3.5">
        {showIcon && (
          <div
            className={`w-[38px] h-[38px] flex items-center justify-center flex-shrink-0 ${colors?.bg ?? 'bg-gray-100'}`}
          >
            {icon ?? (
              <span className={colors?.text ?? 'text-gray-600'}>
                <DomainIcon domain={domain} className="w-5 h-5" />
              </span>
            )}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {title && <h1 className="text-[17px] font-semibold text-gray-900 truncate">{title}</h1>}
            {id && (
              <span className="font-mono text-2xs bg-gray-100 text-gray-500 px-1.5 py-0.5">
                {id}
              </span>
            )}
            {typeLabel && (
              <span
                className={`text-2xs font-medium px-1.5 py-0.5 ${colors ? `${colors.bg} ${colors.text}` : 'text-gray-500 bg-gray-50 border border-gray-200'}`}
              >
                {typeLabel}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-0.5 text-[13px] text-gray-500 truncate">{description}</p>
          )}
        </div>
        {hasActions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {tertiary}
            {secondary}
            {primary}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}
