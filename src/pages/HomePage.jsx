import { Link } from 'react-router-dom'
import { LayersThree01, GitBranch01, CpuChip01 } from '@untitled-ui/icons-react'

const FEATURE_CARDS = [
  {
    icon: LayersThree01,
    title: 'Architecture as Code',
    what: 'Enterprise architecture stored as structured, version-controlled data — not documents or spreadsheets.',
    points: [
      'Architecture lives in a Git repository — versioned, auditable, and reviewable',
      'Every artefact is machine-readable JSON, validated against a schema',
      'Changes require a formal Decision Record — no undocumented drift',
      'Query, diff, and compare architecture state like source code',
    ],
    usp: 'Pickle gives you a structured, schema-validated architecture repository from day one.',
  },
  {
    icon: CpuChip01,
    title: 'Agentic AI Architecture',
    what: 'AI agents that actively participate in the process — analysing and validating changes alongside your architects.',
    points: [
      'Every decision is analysed across six dimensions: strategy, principles, integrity, review, proponent and challenger',
      'Agents surface conflicts and gaps before a change reaches the review board',
      'Analysis is structured and traceable — not free-form commentary',
      'The human stays in the loop — AI informs, architects decide',
    ],
    usp: 'Pickle integrates Claude AI agents into the governance workflow — every decision gets automated analysis before it reaches your architects.',
  },
  {
    icon: GitBranch01,
    title: 'Architectural Governance',
    what: 'A governed, traceable process for changing your architecture — driven by Decision Records and enforced through code review.',
    points: [
      'Every change must be justified in an Architecture Decision Record',
      'ADRs capture intent, rationale, and analysis — not just the change',
      'Git history provides an immutable audit trail of every decision',
      'Guardrails and principles are codified, not just documented',
    ],
    usp: 'Pickle combines the rigour of decision records with the practicality of pull requests — governance that developers and architects can both live with.',
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {FEATURE_CARDS.map(card => {
            const Icon = card.icon
            return (
              <div key={card.title} className="bg-white border-l-4 border-brand-600 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="w-10 h-10 bg-brand-50 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{card.what}</p>
                </div>

                {/* Points */}
                <ul className="p-6 space-y-2 flex-1">
                  {card.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-1.5 w-1.5 h-1.5 bg-brand-400 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>

                {/* USP */}
                <div className="px-6 pb-6">
                  <div className="bg-brand-50 border-l-2 border-brand-500 px-4 py-3">
                    <p className="text-sm font-semibold text-brand-700 leading-snug">{card.usp}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
