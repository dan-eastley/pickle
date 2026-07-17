import { collectEnums } from '../../lib/enums'

// Legend for the enum meta present on a diagram's entities ([UI-15]). Renders one
// row per enum (Importance / Type / Status / …) with a coloured swatch per value,
// matching the badges drawn on the entities. Renders nothing when there's no enum
// meta, so it's safe to drop onto any model.
export default function EnumLegend({ groups, className = '' }) {
  const enums = collectEnums(groups)
  if (enums.length === 0) return null

  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 ${className}`}>
      {enums.map((e) => (
        <div key={e.key} className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            {e.label}
          </span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {e.values.map((v) => (
              <span
                key={v.value}
                className="inline-flex items-center gap-1.5 text-xs text-gray-600"
              >
                <span className={`w-2 h-2 ${v.style.dot}`} />
                {v.label}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
