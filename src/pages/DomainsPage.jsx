import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DOMAINS, DOMAIN_COLORS } from '../lib/artefacts'
import { loadVersionMetrics } from '../lib/metrics'
import { DECISION_STATUS_ORDER, decisionStatusBadge, decisionStatusLabel } from '../lib/theme'
import DomainIcon from '../components/ui/DomainIcon'
import MetricBars from '../components/common/MetricBars'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { ChevronRight, DecisionIcon, RobotIcon } from '../components/ui/icons'
import usePageTitle from '../hooks/usePageTitle'

const DISCOVERY_STATUS_ORDER = ['active', 'archived']
const discoveryStatusBadge = (s) =>
  s === 'archived' ? 'bg-gray-100 text-gray-500' : 'bg-emerald-50 text-emerald-700'
const discoveryStatusLabel = (s) => (s === 'archived' ? 'Archived' : 'Active')

// Clickable per-status breakdown for the decisions / discovery cards. Each chip
// links to the relevant index page with that status group expanded
// (?status=<s>). Zero-count statuses are hidden; a zero total shows a hint.
function StatusBreakdown({ counts, order, badgeOf, labelOf, to }) {
  const shown = order.filter((s) => (counts?.[s] ?? 0) > 0)
  const total = order.reduce((sum, s) => sum + (counts?.[s] ?? 0), 0)
  if (total === 0) {
    return <p className="text-xs text-gray-500">None yet.</p>
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((s) => (
        <Link
          key={s}
          to={`${to}?status=${s}`}
          className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium transition-opacity hover:opacity-80 ${badgeOf(s)}`}
        >
          <span className="tabular-nums font-semibold">{counts[s]}</span>
          {labelOf(s)}
        </Link>
      ))}
    </div>
  )
}

// The whole-domain link wraps the card; the per-entity stat links inside it must
// not trigger navigation, so this Link is the card chrome only and the metrics
// sit beside it.
function DomainCard({ domain, base, dm, loading }) {
  const colors = DOMAIN_COLORS[domain.id]
  const accent = colors.accent

  return (
    <div className={`bg-white border-l-4 ${accent}`}>
      <Link
        to={`${base}/domains/${domain.id}`}
        className="group flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors"
      >
        <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
          <span className={colors.text}>
            <DomainIcon domain={domain.id} className="w-5 h-5" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
            {domain.name} Architecture
          </h3>
          <p className="mt-1 text-sm text-gray-500 leading-relaxed">{domain.description}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-0.5 transition-colors" />
      </Link>
      <div className="px-5 pb-4 -mt-1">
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Spinner size="sm" /> Loading content…
          </div>
        ) : (
          <MetricBars
            perDomain={{ [domain.id]: dm }}
            single
            empty={<p className="text-xs text-gray-500">No content yet in this domain.</p>}
          />
        )}
      </div>
    </div>
  )
}

export default function DomainsPage() {
  const { clientId, versionId } = useParams()
  const base = `/architectures/${clientId}/${versionId}`
  usePageTitle('Architecture Domains')

  const [metrics, setMetrics] = useState(null)
  useEffect(() => {
    let live = true
    setMetrics(null)
    loadVersionMetrics(clientId, versionId).then((m) => live && setMetrics(m))
    return () => {
      live = false
    }
  }, [clientId, versionId])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Architecture Domains</h1>
        <p className="mt-1 text-sm text-gray-500">
          The architecture is organised into five domains: Business, Data, Application, Integration,
          and Solution. Within each domain, content is grouped into three levels of detail:
          Conceptual (what and why), Logical (how), and Physical (where and with what). Select a
          domain to get started.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {DOMAINS.map((domain) => (
          <DomainCard
            key={domain.id}
            domain={domain}
            base={base}
            dm={metrics?.perDomain[domain.id]}
            loading={metrics === null}
          />
        ))}
      </div>

      {/* Cross-cutting capabilities */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <CapabilityCard
          icon={<DecisionIcon className="w-5 h-5 text-brand-700" />}
          title="Architecture Decisions"
          description="The governed, auditable way to change the architecture. Capture the context, problem, and proposed direction, the agents analyse impact and alignment, and once accepted the change is applied through a reviewed pull request."
          stats={
            metrics && (
              <StatusBreakdown
                counts={metrics.decisionsByStatus}
                order={DECISION_STATUS_ORDER}
                badgeOf={decisionStatusBadge}
                labelOf={decisionStatusLabel}
                to={`${base}/decisions`}
              />
            )
          }
          action={
            <Button to={`${base}/decisions/new`} variant="primary" size="sm">
              <DecisionIcon className="w-4 h-4" />
              New Architecture Decision
            </Button>
          }
        />
        <CapabilityCard
          icon={<RobotIcon className="w-5 h-5 text-blue-600" />}
          title="Architecture Discovery"
          description="Ask the Virtual Architect Agent a question about your architecture. It interrogates the model as it stands today and returns a point-in-time view you can keep: read-only, nothing is changed."
          stats={
            metrics && (
              <StatusBreakdown
                counts={metrics.discoveriesByStatus}
                order={DISCOVERY_STATUS_ORDER}
                badgeOf={discoveryStatusBadge}
                labelOf={discoveryStatusLabel}
                to={`${base}/discovery`}
              />
            )
          }
          action={
            <Button to={`${base}/discovery/new`} variant="primary" size="sm">
              <RobotIcon className="w-4 h-4" />
              New Architecture Discovery
            </Button>
          }
        />
        <CapabilityCard
          icon={
            <svg className="w-5 h-5 text-violet-600" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 4h9l5 5v11H5z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="11" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M13 15l2.5 2.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          }
          title="Architecture Scout"
          description="Coming soon. Point Scout at your existing, unstructured architecture content: Word documents, PowerPoint decks, SharePoint sites, and it scans them to seed and build out the structured repository. The fast path from scattered artefacts to a governed model."
          action={
            <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-500 bg-gray-100 cursor-not-allowed">
              Coming soon
            </span>
          }
        />
      </div>
    </div>
  )
}

function CapabilityCard({ icon, title, description, stats, action }) {
  return (
    <div className="border border-gray-200 bg-white p-5 flex flex-col">
      <div className="w-9 h-9 bg-gray-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <h3 className="mt-3 text-sm font-bold text-gray-900">{title}</h3>
      <p className="mt-1.5 text-xs text-gray-500 leading-relaxed flex-1">{description}</p>
      {stats && <div className="mt-3">{stats}</div>}
      <div className="mt-4">{action}</div>
    </div>
  )
}
