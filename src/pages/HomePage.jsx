import { Link } from 'react-router-dom'
import { LayersThree01, GitBranch01, CpuChip01 } from '@untitled-ui/icons-react'

const FEATURE_CARDS = [
  {
    icon: LayersThree01,
    title: 'Architecture as Code',
    what: 'Enterprise architecture stored as structured, version-controlled data — not documents, diagrams, or spreadsheets.',
    points: [
      'Architecture lives in a Git repository — versioned, auditable, and reviewable like any other codebase',
      'Every artefact is machine-readable JSON, validated against a published schema',
      'Changes require a formal Decision Record — no undocumented drift',
      'Teams can query, diff, and compare architecture state the same way they compare source code',
      'Architecture becomes a living, queryable asset rather than a static document that falls out of date',
    ],
    usp: 'Pickle implements the Architecture as Code pattern out of the box — giving you a structured, schema-validated repository for your enterprise architecture from day one.',
  },
  {
    icon: CpuChip01,
    title: 'Agentic AI Architecture',
    what: 'AI agents that actively participate in the architecture process — proposing, analysing, and validating changes alongside your architects.',
    points: [
      'Every architecture decision is automatically analysed across six dimensions — strategy, principles, referential integrity, architecture review, proponent and challenger analysis',
      'Agents surface conflicts, gaps, and opportunities before a change reaches the review board',
      'AI-generated analysis is structured and traceable — not free-form commentary',
      'The human stays in the loop — AI informs and supports, architects decide',
      'Analysis runs on every pull request, building a continuous intelligence layer over your architecture',
    ],
    usp: 'Pickle integrates Claude AI agents directly into the governance workflow — every decision gets automated, structured analysis before it reaches your architects for review.',
  },
  {
    icon: GitBranch01,
    title: 'Architectural Governance',
    what: 'A governed, traceable process for changing your architecture — driven by Architecture Decision Records and enforced through code review.',
    points: [
      'Every architecture change must be justified in an Architecture Decision Record before it is applied',
      'ADRs capture intent, rationale, and analysis — not just the change itself',
      'Git history provides an immutable audit trail of every architectural decision ever made',
      'Human architects review and approve changes through a standard pull request workflow',
      'Guardrails and principles are codified in the architecture — not just stated in documents',
    ],
    usp: 'Pickle combines the rigour of formal decision records with the practicality of pull request workflows — giving you governance that developers and architects can both live with.',
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
                  <div className="bg-brand-50 border-l-2 border-brand-400 px-3 py-2">
                    <p className="text-xs text-brand-700 leading-relaxed">{card.usp}</p>
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
