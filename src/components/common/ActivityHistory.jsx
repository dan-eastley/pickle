// Reusable activity / change-history table shown at the bottom of artefact,
// decision, and discovery pages. Records who did what and when.
//
// Each entry: { timestamp (ISO 8601), action ('Created' | 'Updated' | ...),
//               who (display name), notes? }
//
// In time these entries are auto-populated by the decision process and
// workflows; for now they may be seeded directly in the instance JSON.

function formatTimestamp(ts) {
  try {
    return new Date(ts).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return ts
  }
}

// Canonical activity actions (enforced by the activity-entry schema enum).
const ACTION_STYLES = {
  Created: 'bg-emerald-50 text-emerald-700',
  Updated: 'bg-blue-50 text-blue-700',
  Archived: 'bg-gray-100 text-gray-500',
  Deleted: 'bg-error-50 text-error-700',
}

export default function ActivityHistory({ activity, title = 'Activity' }) {
  if (!activity?.length) return null

  // Most recent first
  const rows = [...activity].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  return (
    <section className="mt-8">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{title}</h2>
      <div className="border border-gray-200 overflow-x-auto bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-48">Date / Time</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">Activity</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">By</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((entry, i) => (
              <tr key={i} className="align-top">
                <td className="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">{formatTimestamp(entry.timestamp)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 ${ACTION_STYLES[entry.action] ?? 'bg-gray-100 text-gray-600'}`}>
                    {entry.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 text-sm">{entry.who || '—'}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{entry.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
