import Illustration from './Illustration'

// Empty / placeholder state. When `illustration` is set it shows an unDraw
// illustration; otherwise it falls back to a small `icon` tile.
export default function EmptyState({
  title,
  description,
  icon: Icon,
  illustration,
  action,
  size = 'md',
}) {
  const pad = size === 'sm' ? 'py-8' : 'py-16'

  return (
    <div className={`flex flex-col items-center justify-center ${pad} px-6 text-center`}>
      {illustration ? (
        <Illustration name="no-data" className="w-44 mb-5" />
      ) : Icon ? (
        <div className="w-12 h-12 bg-gray-100 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-gray-400" />
        </div>
      ) : null}
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      {description && <p className="mt-1 text-sm text-gray-500 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
