import { getDomain, getAbstraction, getArtefact, DOMAIN_COLORS } from '../../lib/artefacts'
import DomainIcon from '../ui/DomainIcon'

// Domain-coloured chip summarising a decision's scope:
// Domain › Abstraction › Artefact. Used on the decisions index and detail pages.
export default function ScopeChip({ scope }) {
  if (!scope?.domain) return null
  const domainData = getDomain(scope.domain)
  const dc = DOMAIN_COLORS[scope.domain]
  const extra = [
    scope.abstraction ? getAbstraction(scope.abstraction)?.name ?? scope.abstraction : null,
    scope.artefact    ? getArtefact(scope.artefact)?.name ?? scope.artefact           : null,
  ].filter(Boolean)
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 flex-shrink-0 ${dc?.bg ?? 'bg-gray-100'} ${dc?.text ?? 'text-gray-700'}`}>
      <DomainIcon domain={scope.domain} className="w-3 h-3 flex-shrink-0" />
      {domainData?.name ?? scope.domain}
      {extra.length > 0 && <span className="opacity-60 ml-0.5">› {extra.join(' › ')}</span>}
    </span>
  )
}
