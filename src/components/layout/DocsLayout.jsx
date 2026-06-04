import { Outlet, NavLink, useParams } from 'react-router-dom'
import TopBar from './TopBar'
import { DOCS_NAV } from '../../lib/docs'

function groupItems(items) {
  const groups = []
  let current = null
  for (const item of items) {
    const g = item.group ?? null
    if (!current || g !== current.label) {
      current = { label: g, items: [] }
      groups.push(current)
    }
    current.items.push(item)
  }
  return groups
}

function NavSection({ section }) {
  const groups = groupItems(section.items)
  return (
    <div className="mb-6">
      <div className="px-3 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {section.title}
      </div>
      {groups.map((group, gi) => (
        <div key={gi}>
          {group.label && (
            <div className="px-3 pt-2 pb-0.5 text-xs font-medium text-gray-400">
              {group.label}
            </div>
          )}
          {group.items.map(item => (
            <NavLink
              key={item.path}
              to={`/docs/${item.path}`}
              className={({ isActive }) =>
                `block px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-medium border-l-2 border-brand-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-l-2 border-transparent'
                }`
              }
            >
              {item.title}
            </NavLink>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function DocsLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-64 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto py-4 px-2">
          {DOCS_NAV.map(section => (
            <NavSection key={section.id} section={section} />
          ))}
        </nav>
        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
