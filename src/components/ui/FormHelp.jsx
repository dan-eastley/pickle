// Friendly, light-touch help panel shown to the right of the full decision /
// discovery forms. Replaces the per-field helper text with a single calm aside.
export default function FormHelp({ title, tips, footer }) {
  return (
    <aside className="lg:w-72 flex-shrink-0">
      <div className="lg:sticky lg:top-20 bg-gradient-to-br from-blue-50/60 to-rose-50/40 border border-blue-100 p-5">
        <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
          <span aria-hidden>💡</span> {title}
        </p>
        <dl className="mt-3 space-y-3">
          {tips.map(([term, desc]) => (
            <div key={term}>
              <dt className="text-xs font-semibold text-gray-700">{term}</dt>
              <dd className="text-xs text-gray-500 leading-relaxed">{desc}</dd>
            </div>
          ))}
        </dl>
        {footer && <p className="mt-4 text-xs text-blue-700 leading-relaxed">{footer}</p>}
      </div>
    </aside>
  )
}
