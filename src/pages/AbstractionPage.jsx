import { useParams, Navigate } from 'react-router-dom'
import { getDomain, getAbstraction, getArtefactsForDomain, ABSTRACTION_COLORS } from '../lib/artefacts'
import ArtefactRow from '../components/artefacts/ArtefactRow'
import usePageTitle from '../hooks/usePageTitle'

export default function AbstractionPage() {
  const { clientId, versionId, domain, abstraction } = useParams()
  const base = `/clients/${clientId}/${versionId}`
  const domainData = getDomain(domain)
  const abstractionData = getAbstraction(abstraction)
  const colors = ABSTRACTION_COLORS[abstraction]
  usePageTitle(abstractionData && domainData ? `${abstractionData.name} — ${domainData.name}` : null)

  if (!domainData || !abstractionData) {
    return <Navigate to={`${base}/domains/${domain}`} replace />
  }

  const artefacts = getArtefactsForDomain(domain, abstraction)
  const sorted = [...artefacts.filter(a => a.key), ...artefacts.filter(a => !a.key)]

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 ${colors?.badge}`}>
            {abstractionData.label}
          </span>
          <span className="text-xs text-gray-400">{domainData.name} Architecture</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">{abstractionData.name}</h1>
        <p className="mt-1 text-sm text-gray-500 max-w-3xl">{abstractionData.description}</p>
      </div>

      <div className="border border-gray-200 bg-white">
        {sorted.map((artefact, i) => (
          <ArtefactRow
            key={artefact.id}
            artefact={artefact}
            to={`${base}/domains/${domain}/${abstraction}/${artefact.id}`}
            clientId={clientId}
            versionId={versionId}
            divider={i > 0}
          />
        ))}
      </div>
    </div>
  )
}
