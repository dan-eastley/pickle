import { PlusIcon, CloseIcon } from '../ui/icons'

// Editable list of decision requirements ({ title, description, type }). Shared
// by the full decision editor and the inline edit on the decision detail page.
export default function RequirementsList({ requirements, onChange }) {
  function add() {
    onChange([...requirements, { title: '', description: '', type: 'Functional' }])
  }
  function update(i, field, val) {
    onChange(requirements.map((r, j) => (j === i ? { ...r, [field]: val } : r)))
  }
  function remove(i) {
    onChange(requirements.filter((_, j) => j !== i))
  }

  return (
    <div className="space-y-3">
      {requirements.map((req, i) => (
        <div key={i} className="border border-gray-200 bg-gray-50 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={req.title ?? ''}
              onChange={(e) => update(i, 'title', e.target.value)}
              placeholder="Requirement title"
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
            />
            <select
              value={req.type ?? 'Functional'}
              onChange={(e) => update(i, 'type', e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
            >
              <option>Functional</option>
              <option>Non-Functional</option>
            </select>
            <button
              onClick={() => remove(i)}
              className="p-1.5 text-gray-400 hover:text-error-600 transition-colors flex-shrink-0"
              title="Remove"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={req.description ?? ''}
            onChange={(e) => update(i, 'description', e.target.value)}
            rows={2}
            placeholder="What must the system do or achieve? Be specific and testable."
            className="w-full px-3 py-1.5 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white resize-none"
          />
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 transition-colors"
      >
        <PlusIcon className="w-4 h-4" />
        Add requirement
      </button>
    </div>
  )
}
