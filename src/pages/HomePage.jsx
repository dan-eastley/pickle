import { Link } from 'react-router-dom'
import { LayersThree01, GitBranch01, CpuChip01 } from '@untitled-ui/icons-react'

const FEATURE_CARDS = [
  {
    icon: LayersThree01,
    title: 'Architecture Domains',
    description: 'Browse and manage your enterprise architecture across five domains — Business, Data, Integration, Application, and Solution — at three levels of detail.',
  },
  {
    icon: GitBranch01,
    title: 'Decision Records',
    description: 'Every change to the architecture is driven by a formal Architecture Decision Record, giving you a full audit trail of what changed, why, and when.',
  },
  {
    icon: CpuChip01,
    title: 'AI-Assisted Analysis',
    description: 'Architecture Decision Records are automatically analysed for alignment with strategy, principles, and referential integrity before they are applied.',
  },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-gray-200 bg-gray-50 px-6 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 uppercase">Pickle</h1>
        <p className="mt-3 text-xl text-gray-500">Agentic Architecture as a Service</p>
        <p className="mt-4 text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
          A structured, version-controlled approach to enterprise architecture. Capture decisions,
          browse architecture state, and let AI help you assess the impact of every change.
        </p>
        <div className="mt-8">
          <Link
            to="/clients"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            View Clients
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {FEATURE_CARDS.map(card => {
            const Icon = card.icon
            return (
              <div key={card.title} className="bg-white border-l-4 border-brand-600 p-6">
                <div className="w-10 h-10 bg-brand-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{card.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{card.description}</p>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
