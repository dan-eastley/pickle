import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DOMAINS, DOMAIN_COLORS, getArtefactsForDomain } from '../lib/artefacts'
import { loadClientMetrics } from '../lib/metrics'
import DomainIcon from '../components/ui/DomainIcon'
import FormatIcon from '../components/ui/FormatIcon'
import Button from '../components/ui/Button'
import { ChevronRight, DecisionIcon, RobotIcon } from '../components/ui/icons'
import usePageTitle from '../hooks/usePageTitle'

function DomainCard({ domain, base, dm }) {
  const colors = DOMAIN_COLORS[domain.id]
  const accent = colors.accent
  const artefacts = getArtefactsForDomain(domain.id)
  // Registry counts (artefact *types*) are the placeholder until live metrics
  // arrive; then we show populated counts, and — crucially — document
  // *instances* (a document artefact can hold several documents).
  const reg = (fmt) => artefacts.filter((a) => a.format === fmt).length

  const counts = [
    { format: 'catalogue', n: dm?.catalogue ?? reg('catalogue'), label: 'Catalogue' },
    { format: 'diagram', n: dm?.diagram ?? reg('diagram'), label: 'Diagram' },
    { format: 'matrix', n: dm?.matrix ?? reg('matrix'), label: 'Matrix', plural: 'Matrices' },
    { format: 'document', n: dm?.documents ?? reg('document'), label: 'Document' },
  ]

  return (
    <Link
      to={`${base}/domains/${domain.id}`}
      className={`group flex items-start gap-4 p-5 bg-white hover:bg-gray-50 transition-colors border-l-4 ${accent}`}
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
        <div className="mt-3 flex items-center gap-4 flex-wrap">
          {counts.map(({ format, n, label, plural }) => (
            <span key={format} className="flex items-center gap-1 text-xs text-gray-400">
              <FormatIcon format={format} className="w-3.5 h-3.5" />
              {n} {n === 1 ? label : (plural ?? label + 's')}
            </span>
          ))}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-0.5 transition-colors" />
    </Link>
  )
}

export default function DomainsPage() {
  const { clientId, versionId } = useParams()
  const base = `/clients/${clientId}/${versionId}`
  usePageTitle('Architecture Domains')

  const [metrics, setMetrics] = useState(null)
  useEffect(() => {
    let live = true
    loadClientMetrics(clientId, versionId).then((m) => live && setMetrics(m))
    return () => {
      live = false
    }
  }, [clientId, versionId])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Architecture Domains</h1>
        <p className="mt-1 text-sm text-gray-500">
          The architecture is organised into five domains — Business, Data, Application,
          Integration, and Solution. Within each domain, content is grouped into three levels of
          detail: Conceptual (what and why), Logical (how), and Physical (where and with what).
          Select a domain to get started.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {DOMAINS.map((domain) => (
          <DomainCard
            key={domain.id}
            domain={domain}
            base={base}
            dm={metrics?.perDomain[domain.id]}
          />
        ))}
      </div>

      {/* Cross-cutting capabilities */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <CapabilityCard
          icon={<DecisionIcon className="w-5 h-5 text-brand-700" />}
          title="Architecture Decisions"
          description="The governed, auditable way to change the architecture. Capture the context, problem, and proposed direction — the agents analyse impact and alignment, and once accepted the change is applied through a reviewed pull request."
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
          description="Ask the Virtual Architect Agent a question about your architecture. It interrogates the model as it stands today and returns a point-in-time view you can keep — read-only, nothing is changed."
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
          description="Coming soon. Point Scout at your existing, unstructured architecture content — Word documents, PowerPoint decks, SharePoint sites — and it scans them to seed and build out the structured repository. The fast path from scattered artefacts to a governed model."
          action={
            <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-400 bg-gray-100 cursor-not-allowed">
              Coming soon
            </span>
          }
        />
      </div>
    </div>
  )
}

function CapabilityCard({ icon, title, description, action }) {
  return (
    <div className="border border-gray-200 bg-white p-5 flex flex-col">
      <div className="w-9 h-9 bg-gray-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <h3 className="mt-3 text-sm font-bold text-gray-900">{title}</h3>
      <p className="mt-1.5 text-xs text-gray-500 leading-relaxed flex-1">{description}</p>
      <div className="mt-4">{action}</div>
    </div>
  )
}
