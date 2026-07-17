import { useState, useRef, useEffect } from 'react'
import { Link, useParams, useMatch } from 'react-router-dom'
import {
  DOMAINS,
  ABSTRACTIONS,
  DOMAIN_COLORS,
  ABSTRACTION_COLORS,
  getArtefactsForDomain,
  FORMAT_ORDER,
  getFormat,
} from '../../lib/artefacts'
import DomainIcon from '../ui/DomainIcon'
import FormatIcon from '../ui/FormatIcon'
import { ChevronDown, ChevronRight, KeyStar, DecisionIcon, RobotIcon } from '../ui/icons'
import useClickOutside from '../../hooks/useClickOutside'
import { getArtefactData } from '../../lib/api'

function FormatGroup({ format, artefacts, base, domainId, abstractionId, onClose }) {
  const fmt = getFormat(format)
  const isDoc = format === 'document'
  const [, , clientId, versionId] = base.split('/') // base = /architectures/<c>/<v>
  const [docCounts, setDocCounts] = useState({})

  const sorted = [...artefacts.filter((a) => a.key), ...artefacts.filter((a) => !a.key)]

  // Document types carry multiple instances; show the count per type (like the
  // domain page). Fetched lazily on open, document format only.
  useEffect(() => {
    if (!isDoc || !artefacts.length) return
    let live = true
    Promise.all(
      sorted.map((a) =>
        getArtefactData(clientId, versionId, a.domain, a.abstraction, a.id)
          .then((d) => [a.id, Array.isArray(d?.documents) ? d.documents.length : 0])
          .catch(() => [a.id, null])
      )
    ).then((entries) => live && setDocCounts(Object.fromEntries(entries)))
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDoc, clientId, versionId])

  if (!fmt || !artefacts.length) return null

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center gap-1.5 px-2 py-1 mb-1 bg-gray-50">
        <FormatIcon format={format} className="w-3 h-3 text-gray-500" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {isDoc ? 'Document Types' : fmt.label}
        </span>
      </div>
      <div className="space-y-px">
        {sorted.map((artefact) => (
          <Link
            key={artefact.id}
            to={`${base}/domains/${domainId}/${abstractionId}/${artefact.id}`}
            onClick={onClose}
            className={`flex items-center gap-2 px-2 py-1.5 text-sm transition-colors border-l-2 ${
              artefact.key
                ? 'border-amber-400 bg-amber-50 hover:bg-amber-100 text-gray-700'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {artefact.key && <KeyStar className="w-2.5 h-2.5" />}
            <span className="truncate flex-1">{artefact.name}</span>
            {isDoc && docCounts[artefact.id] != null && (
              <span className="text-xs text-gray-400 flex-shrink-0 tabular-nums">
                {docCounts[artefact.id]}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

function DomainDropdown({ domain, base, onClose }) {
  const colors = DOMAIN_COLORS[domain.id]

  return (
    <div className="absolute left-0 right-0 top-full bg-white border-b-2 border-gray-200 shadow-lg z-40">
      <div className="max-w-[1400px] mx-auto px-6 py-5">
        {/* Domain header: links to the domain overview page */}
        <Link
          to={`${base}/domains/${domain.id}`}
          onClick={onClose}
          className="group flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 hover:opacity-80 transition-opacity"
        >
          <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
            <span className={colors.text}>
              <DomainIcon domain={domain.id} className="w-4 h-4" />
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 group-hover:text-brand-700 transition-colors">
              {domain.name} Architecture
            </p>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{domain.description}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 ml-auto flex-shrink-0 transition-colors" />
        </Link>

        {/* Three abstraction columns */}
        <div className="grid grid-cols-3 gap-6">
          {ABSTRACTIONS.map((abstraction) => {
            const artefacts = getArtefactsForDomain(domain.id, abstraction.id)
            if (!artefacts.length) return null
            const abColors = ABSTRACTION_COLORS[abstraction.id]

            return (
              <div key={abstraction.id}>
                {/* Abstraction column header: links to abstraction page */}
                <Link
                  to={`${base}/domains/${domain.id}/${abstraction.id}`}
                  onClick={onClose}
                  className={`group flex items-center gap-2 mb-3 px-2 py-1.5 transition-colors ${abColors.header} hover:opacity-90`}
                >
                  <span className="text-xs font-semibold px-1.5 py-0.5 bg-white bg-opacity-30">
                    {abstraction.label}
                  </span>
                  <span className="text-xs font-semibold group-hover:opacity-90 transition-opacity">
                    {abstraction.name}
                  </span>
                </Link>

                {/* Format-grouped artefacts */}
                {FORMAT_ORDER.map((fmt) => (
                  <FormatGroup
                    key={fmt}
                    format={fmt}
                    artefacts={artefacts.filter((a) => a.format === fmt)}
                    base={base}
                    domainId={domain.id}
                    abstractionId={abstraction.id}
                    onClose={onClose}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function DomainNav() {
  const [activeDropdown, setActiveDropdown] = useState(null)
  const navRef = useRef(null)
  const { clientId, versionId, domain: activeDomain } = useParams()
  const base = `/architectures/${clientId}/${versionId}`

  const decisionsMatch = useMatch('/architectures/:clientId/:versionId/decisions/*')
  const onDecisionsPage = !!decisionsMatch
  const discoveryMatch = useMatch('/architectures/:clientId/:versionId/discovery/*')
  const onDiscoveryPage = !!discoveryMatch

  useClickOutside(navRef, () => setActiveDropdown(null))

  useEffect(() => {
    setActiveDropdown(null)
  }, [activeDomain])

  if (!clientId || !versionId) return null

  const activeDomainData = DOMAINS.find((d) => d.id === activeDropdown)

  return (
    <div ref={navRef} className="relative bg-white border-b border-gray-200 z-30">
      <div className="max-w-[1400px] mx-auto px-5">
        <div className="flex items-stretch h-11 gap-0">
          {/* Overview */}
          <Link
            to={`${base}/domains`}
            onClick={() => setActiveDropdown(null)}
            className={`flex items-center px-4 text-sm font-medium border-b-2 transition-colors ${
              !activeDomain && !onDecisionsPage && activeDropdown === null
                ? 'border-brand-600 text-brand-700 bg-brand-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Overview
          </Link>

          {/* Domain tabs */}
          {DOMAINS.map((domain) => {
            const isActive = activeDomain === domain.id
            const isOpen = activeDropdown === domain.id
            const ac = DOMAIN_COLORS[domain.id].nav

            return (
              <button
                key={domain.id}
                onClick={() => setActiveDropdown((prev) => (prev === domain.id ? null : domain.id))}
                className={`flex items-center gap-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive || isOpen
                    ? `${ac.border} ${ac.text} ${ac.bg}`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span
                  className={`flex-shrink-0 ${isActive || isOpen ? ac.icon : DOMAIN_COLORS[domain.id].text}`}
                >
                  <DomainIcon domain={domain.id} className="w-3.5 h-3.5" />
                </span>
                {domain.name}
                <span className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-3.5 h-3.5" />
                </span>
              </button>
            )
          })}

          {/* Decisions + Discovery: right-aligned */}
          <div className="flex-1" />
          <Link
            to={`${base}/decisions`}
            onClick={() => setActiveDropdown(null)}
            className={`flex items-center gap-1.5 px-4 text-sm font-medium border-b-2 transition-colors ${
              onDecisionsPage
                ? 'border-gray-400 text-gray-700 bg-gray-100'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <DecisionIcon className="w-3.5 h-3.5" />
            Decisions
          </Link>
          <Link
            to={`${base}/discovery`}
            onClick={() => setActiveDropdown(null)}
            className={`flex items-center gap-1.5 px-4 text-sm font-medium border-b-2 transition-colors ${
              onDiscoveryPage
                ? 'border-gray-400 text-gray-700 bg-gray-100'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <RobotIcon className="w-3.5 h-3.5" />
            Discovery
          </Link>
        </div>
      </div>

      {activeDropdown && activeDomainData && (
        <DomainDropdown
          domain={activeDomainData}
          base={base}
          onClose={() => setActiveDropdown(null)}
        />
      )}
    </div>
  )
}
