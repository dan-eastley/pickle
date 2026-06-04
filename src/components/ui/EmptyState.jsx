export default function EmptyState({ title, description, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-gray-400" />
        </div>
      )}
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-gray-500 max-w-xs">{description}</p>
      )}
    </div>
  )
}
