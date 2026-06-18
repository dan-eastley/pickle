import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getArtefact } from '../../lib/artefacts'

// ─── Section configuration per document artefact type ─────────────────────────
// type values: prose | highlight | cards | tags | risks | options | diagrams |
//              components | flows | uml | endpoints | sla | code

const SECTION_CONFIGS = {
  'SOL-AVI': [
    { key: 'executive-summary',       label: 'Executive Summary',        type: 'prose' },
    { key: 'vision-statement',        label: 'Vision Statement',         type: 'highlight' },
    { key: 'drivers',                 label: 'Drivers',                  type: 'cards', titleField: 'description', tagField: 'type' },
    { key: 'strategic-objectives',    label: 'Strategic Objectives',     type: 'cards', titleField: 'objective', linksField: 'linked-capabilities' },
    { key: 'constraints',             label: 'Constraints',              type: 'cards', titleField: 'description', tagField: 'type' },
    { key: 'assumptions',             label: 'Assumptions',              type: 'cards', titleField: 'description' },
    { key: 'related-capabilities',    label: 'Related Capabilities',     type: 'tags' },
    { key: 'related-domains',         label: 'Related Domains',          type: 'tags' },
    { key: 'diagrams',                label: 'Diagrams',                 type: 'diagrams' },
  ],
  'SOL-AIN': [
    { key: 'intent-statement',        label: 'Intent Statement',         type: 'highlight' },
    { key: 'context',                 label: 'Context',                  type: 'prose' },
    { key: 'drivers',                 label: 'Drivers',                  type: 'cards', titleField: 'description', tagField: 'type' },
    { key: 'options-considered',      label: 'Options Considered',       type: 'options' },
    { key: 'recommended-direction',   label: 'Recommended Direction',    type: 'prose' },
    { key: 'architecture-principles', label: 'Architecture Principles',  type: 'tags' },
    { key: 'guardrails',              label: 'Guardrails',               type: 'tags' },
    { key: 'open-questions',          label: 'Open Questions',           type: 'cards', titleField: 'question', metaField: 'raised-by' },
    { key: 'diagrams',                label: 'Diagrams',                 type: 'diagrams' },
  ],
  'SOL-SVI': [
    { key: 'executive-summary',       label: 'Executive Summary',        type: 'prose' },
    { key: 'problem-statement',       label: 'Problem Statement',        type: 'prose' },
    { key: 'solution-overview',       label: 'Solution Overview',        type: 'prose' },
    { key: 'key-capabilities',        label: 'Key Capabilities',         type: 'tags' },
    { key: 'platforms-involved',      label: 'Platforms Involved',       type: 'tags' },
    { key: 'assumptions',             label: 'Assumptions',              type: 'cards', titleField: 'description' },
    { key: 'risks',                   label: 'Risks',                    type: 'risks' },
    { key: 'open-questions',          label: 'Open Questions',           type: 'cards', titleField: 'question', metaField: 'raised-by' },
    { key: 'diagrams',                label: 'Diagrams',                 type: 'diagrams' },
  ],
  'SOL-SDE': [
    { key: 'overview',                label: 'Overview',                 type: 'prose' },
    { key: 'solution-components',     label: 'Solution Components',      type: 'components' },
    { key: 'data-flows',              label: 'Data Flows',               type: 'flows' },
    { key: 'uml-diagrams',            label: 'UML Diagrams',             type: 'uml' },
    { key: 'interface-requirements',  label: 'Interface Requirements',   type: 'cards', titleField: 'interface-id', metaField: 'direction' },
    { key: 'non-functional-requirements', label: 'Non-Functional Requirements', type: 'cards', titleField: 'requirement', tagField: 'category' },
    { key: 'assumptions',             label: 'Assumptions',              type: 'cards', titleField: 'description' },
    { key: 'open-questions',          label: 'Open Questions',           type: 'cards', titleField: 'question', metaField: 'raised-by' },
    { key: 'diagrams',                label: 'Diagrams',                 type: 'diagrams' },
  ],
  'SOL-ISP': [
    { key: 'overview',                label: 'Overview',                 type: 'prose' },
    { key: 'endpoints',               label: 'Endpoints',                type: 'endpoints' },
    { key: 'data-model',              label: 'Data Model',               type: 'code' },
    { key: 'error-handling',          label: 'Error Handling',           type: 'prose' },
    { key: 'sla',                     label: 'SLA',                      type: 'sla' },
    { key: 'test-scenarios',          label: 'Test Scenarios',           type: 'cards', titleField: 'description', metaField: 'expected-outcome' },
    { key: 'diagrams',                label: 'Diagrams',                 type: 'diagrams' },
  ],
}

const STATUS_STYLES = {
  'draft':      'bg-gray-100 text-gray-600',
  'in-review':  'bg-amber-50 text-amber-700',
  'approved':   'bg-emerald-50 text-emerald-700',
  'superseded': 'bg-red-50 text-red-600',
}

const METHOD_STYLES = {
  GET:     'bg-blue-100 text-blue-700',
  POST:    'bg-emerald-100 text-emerald-700',
  PUT:     'bg-amber-100 text-amber-700',
  PATCH:   'bg-orange-100 text-orange-700',
  DELETE:  'bg-red-100 text-red-700',
}

// ─── Sub-renderers ─────────────────────────────────────────────────────────────

function ProseSection({ text }) {
  return <p className="text-gray-700 leading-relaxed whitespace-pre-line">{text}</p>
}

function HighlightSection({ text }) {
  return (
    <blockquote className="border-l-4 border-rose-400 pl-5 py-1">
      <p className="text-lg text-gray-800 font-medium leading-relaxed italic">{text}</p>
    </blockquote>
  )
}

function TagList({ items }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-mono">
          {item}
        </span>
      ))}
    </div>
  )
}

function CardList({ items, config }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={item.id ?? i} className="border border-gray-200 px-4 py-3 bg-white">
          <div className="flex items-start gap-3">
            {item.id && (
              <span className="text-xs font-mono text-gray-400 pt-0.5 flex-shrink-0">{item.id}</span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 font-medium">{item[config.titleField] ?? JSON.stringify(item)}</p>
              {config.metaField && item[config.metaField] && (
                <p className="mt-0.5 text-xs text-gray-500">{item[config.metaField]}</p>
              )}
              {config.linksField && item[config.linksField]?.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {item[config.linksField].map(link => (
                    <span key={link} className="px-1.5 py-0.5 bg-violet-50 text-violet-700 text-xs font-mono">{link}</span>
                  ))}
                </div>
              )}
            </div>
            {config.tagField && item[config.tagField] && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 flex-shrink-0 capitalize">
                {item[config.tagField]}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function RiskList({ items }) {
  const IMPACT_COLOR = { low: 'bg-emerald-50 text-emerald-700', medium: 'bg-amber-50 text-amber-700', high: 'bg-red-50 text-red-700' }
  return (
    <div className="space-y-2">
      {items.map((risk, i) => (
        <div key={risk.id ?? i} className="border border-gray-200 px-4 py-3 bg-white">
          <div className="flex items-start gap-3">
            {risk.id && <span className="text-xs font-mono text-gray-400 pt-0.5 flex-shrink-0">{risk.id}</span>}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 font-medium">{risk.description}</p>
              {risk.mitigation && <p className="mt-1 text-xs text-gray-500"><span className="font-medium">Mitigation:</span> {risk.mitigation}</p>}
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              {risk.likelihood && <span className={`text-xs px-2 py-0.5 capitalize ${IMPACT_COLOR[risk.likelihood] ?? 'bg-gray-100 text-gray-600'}`}>L: {risk.likelihood}</span>}
              {risk.impact && <span className={`text-xs px-2 py-0.5 capitalize ${IMPACT_COLOR[risk.impact] ?? 'bg-gray-100 text-gray-600'}`}>I: {risk.impact}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function OptionList({ items }) {
  return (
    <div className="space-y-4">
      {items.map((opt, i) => (
        <div key={opt.id ?? i} className="border border-gray-200 bg-white">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
            <span className="text-xs font-mono text-gray-400">{opt.id}</span>
            <span className="text-sm font-semibold text-gray-900">{opt.name}</span>
          </div>
          {opt.description && <p className="px-4 pt-3 pb-1 text-sm text-gray-700">{opt.description}</p>}
          <div className="px-4 pb-3 grid grid-cols-2 gap-4 mt-2">
            {opt.pros?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-emerald-700 mb-1">Pros</p>
                <ul className="space-y-0.5">
                  {opt.pros.map((p, j) => <li key={j} className="text-xs text-gray-600 flex gap-1.5"><span className="text-emerald-500 flex-shrink-0">+</span>{p}</li>)}
                </ul>
              </div>
            )}
            {opt.cons?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-600 mb-1">Cons</p>
                <ul className="space-y-0.5">
                  {opt.cons.map((c, j) => <li key={j} className="text-xs text-gray-600 flex gap-1.5"><span className="text-red-400 flex-shrink-0">−</span>{c}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ComponentList({ items }) {
  return (
    <div className="divide-y divide-gray-200 border border-gray-200">
      {items.map((c, i) => (
        <div key={c['platform-id'] ?? i} className="px-4 py-3 flex items-start gap-4 bg-white">
          <span className="font-mono text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 flex-shrink-0 mt-0.5">{c['platform-id']}</span>
          <div>
            <p className="text-sm font-medium text-gray-800">{c.role}</p>
            {c.notes && <p className="text-xs text-gray-500 mt-0.5">{c.notes}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

function FlowList({ items }) {
  return (
    <div className="space-y-4">
      {items.map((flow, i) => (
        <div key={flow.id ?? i} className="border border-gray-200 bg-white">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
            <span className="text-xs font-mono text-gray-400">{flow.id}</span>
            <span className="text-sm font-semibold text-gray-900">{flow.name}</span>
          </div>
          {flow.description && <p className="px-4 pt-3 text-sm text-gray-600">{flow.description}</p>}
          {flow.steps?.length > 0 && (
            <ol className="px-4 py-3 space-y-1 list-decimal list-inside">
              {flow.steps.map((step, j) => <li key={j} className="text-sm text-gray-700">{step}</li>)}
            </ol>
          )}
        </div>
      ))}
    </div>
  )
}

function UmlList({ items }) {
  return (
    <div className="space-y-4">
      {items.map((uml, i) => (
        <div key={i} className="border border-gray-200 bg-white">
          <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{uml.type}</span>
            <span className="text-sm font-medium text-gray-800">{uml.title}</span>
            <span className="ml-auto text-xs px-2 py-0.5 bg-white border border-gray-200 text-gray-500">{uml.format}</span>
          </div>
          {uml.description && <p className="px-4 pt-2 text-sm text-gray-600">{uml.description}</p>}
          <pre className="px-4 py-3 text-xs text-gray-700 overflow-x-auto bg-gray-50 font-mono leading-relaxed whitespace-pre">{uml.content}</pre>
        </div>
      ))}
    </div>
  )
}

function EndpointTable({ items }) {
  return (
    <div className="border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-20">Method</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Path</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {items.map((ep, i) => (
            <tr key={i}>
              <td className="px-4 py-2.5">
                <span className={`text-xs px-2 py-0.5 font-bold ${METHOD_STYLES[ep.method] ?? 'bg-gray-100 text-gray-600'}`}>{ep.method}</span>
              </td>
              <td className="px-4 py-2.5 font-mono text-xs text-gray-700">{ep.path}</td>
              <td className="px-4 py-2.5 text-sm text-gray-600">{ep.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SlaTable({ sla }) {
  const rows = [
    ['Latency (p99)', sla['latency-p99-ms'] != null ? `${sla['latency-p99-ms']} ms` : null],
    ['Throughput',    sla['throughput-tps'] != null ? `${sla['throughput-tps']} TPS` : null],
    ['Availability',  sla['availability-percent'] != null ? `${sla['availability-percent']}%` : null],
  ].filter(([, v]) => v)
  return (
    <div className="border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 w-48">{label}</td>
              <td className="px-4 py-2.5 font-mono text-gray-800">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CodeBlock({ text }) {
  return <pre className="p-4 bg-gray-50 border border-gray-200 text-xs text-gray-700 font-mono overflow-x-auto whitespace-pre leading-relaxed">{text}</pre>
}

function DiagramRefs({ refs, clientId, versionId }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {refs.map((ref, i) => {
        const artefact = getArtefact(ref['artefact-id'])
        return (
          <div key={i} className="border border-gray-200 bg-white px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">{ref.title ?? artefact?.name ?? ref['artefact-id']}</p>
              {ref.caption && <p className="text-xs text-gray-500 mt-0.5">{ref.caption}</p>}
            </div>
            <span className="font-mono text-xs text-gray-400 flex-shrink-0">{ref['artefact-id']}</span>
            {artefact && (
              <Link
                to={`/clients/${clientId}/${versionId}/domains/${artefact.domain}/${artefact.abstraction}/${artefact.id}`}
                className="flex-shrink-0 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                View →
              </Link>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Section renderer dispatcher ─────────────────────────────────────────────

function SectionContent({ config, value, clientId, versionId }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null
  switch (config.type) {
    case 'prose':      return <ProseSection text={value} />
    case 'highlight':  return <HighlightSection text={value} />
    case 'tags':       return <TagList items={value} />
    case 'cards':      return <CardList items={value} config={config} />
    case 'risks':      return <RiskList items={value} />
    case 'options':    return <OptionList items={value} />
    case 'components': return <ComponentList items={value} />
    case 'flows':      return <FlowList items={value} />
    case 'uml':        return <UmlList items={value} />
    case 'endpoints':  return <EndpointTable items={value} />
    case 'sla':        return <SlaTable sla={value} />
    case 'code':       return <CodeBlock text={value} />
    case 'diagrams':   return <DiagramRefs refs={value} clientId={clientId} versionId={versionId} />
    default:           return <pre className="text-xs text-gray-500">{JSON.stringify(value, null, 2)}</pre>
  }
}

// ─── ISP metadata table (shown at top for interface spec docs) ────────────────

function IspMetaTable({ doc }) {
  const rows = [
    ['Interface',     doc['interface-id']],
    ['Source',        doc['source-system']],
    ['Target',        doc['target-system']],
    ['Protocol',      doc['technical-protocol']],
    ['Auth',          doc['authentication']],
    ['Data Format',   doc['data-format']],
    ['Trigger',       doc['trigger']],
  ].filter(([, v]) => v)
  if (rows.length === 0) return null
  return (
    <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-px border border-gray-200 bg-gray-200 overflow-hidden">
      {rows.map(([label, value]) => (
        <div key={label} className="bg-white px-3 py-2">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
          <p className="text-sm font-mono text-gray-800">{value}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Main DocumentView ─────────────────────────────────────────────────────────

export default function DocumentView({ data, artefact, clientId, versionId }) {
  const documents = data?.documents ?? []
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [activeSection, setActiveSection] = useState('overview')
  const sectionRefs = useRef({})
  const observerRef = useRef(null)

  const doc = documents[selectedIdx]
  const sections = (SECTION_CONFIGS[artefact?.id] ?? []).filter(cfg => {
    const val = doc?.[cfg.key]
    return val != null && val !== '' && !(Array.isArray(val) && val.length === 0)
  })

  // Reset on document change
  useEffect(() => {
    setActiveSection('overview')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selectedIdx])

  // Track active section via IntersectionObserver
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()
    const refs = sectionRefs.current
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.dataset.section)
          }
        }
      },
      { rootMargin: '-10% 0px -75% 0px' }
    )
    Object.values(refs).forEach(el => { if (el) observerRef.current.observe(el) })
    return () => observerRef.current?.disconnect()
  }, [doc, sections.length])

  function scrollTo(key) {
    const el = sectionRefs.current[key]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (documents.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400 text-sm border border-gray-200 bg-white">
        No documents yet. Add entries to the <code className="font-mono text-xs bg-gray-100 px-1">documents</code> array.
      </div>
    )
  }

  return (
    <div>
      {/* ── Instance selector ──────────────────────────────────────────────── */}
      <div className="mb-6 pb-5 border-b border-gray-200 flex items-center gap-3 flex-wrap">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex-shrink-0">
          {artefact?.name}
        </span>
        <div className="relative flex-shrink-0">
          <select
            value={selectedIdx}
            onChange={e => setSelectedIdx(Number(e.target.value))}
            className="appearance-none pl-3 pr-8 py-1.5 border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 cursor-pointer"
          >
            {documents.map((d, i) => (
              <option key={d.id ?? i} value={i}>{d.title} — {d.id}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-xs text-gray-400">{documents.length} document{documents.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Two-column layout ──────────────────────────────────────────────── */}
      <div className="flex gap-8 items-start">
        {/* Sticky nav */}
        <aside className="hidden lg:block w-48 flex-shrink-0">
          <nav className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Contents</p>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => scrollTo('overview')}
                  className={`w-full text-left text-sm px-3 py-1.5 transition-colors ${
                    activeSection === 'overview'
                      ? 'bg-rose-50 text-rose-700 font-medium border-l-2 border-rose-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-l-2 border-transparent'
                  }`}
                >
                  Overview
                </button>
              </li>
              {sections.map(cfg => (
                <li key={cfg.key}>
                  <button
                    onClick={() => scrollTo(cfg.key)}
                    className={`w-full text-left text-sm px-3 py-1.5 transition-colors ${
                      activeSection === cfg.key
                        ? 'bg-rose-50 text-rose-700 font-medium border-l-2 border-rose-500'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-l-2 border-transparent'
                    }`}
                  >
                    {cfg.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Content */}
        <article className="flex-1 min-w-0">
          {/* ── Document header ─────────────────────────────────────────── */}
          <div
            ref={el => { sectionRefs.current['overview'] = el }}
            data-section="overview"
            className="mb-8 scroll-mt-20"
          >
            <div className="flex items-center gap-2 mb-3">
              {doc.status && (
                <span className={`text-xs px-2 py-0.5 font-medium uppercase tracking-wide ${STATUS_STYLES[doc.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {doc.status}
                </span>
              )}
              {doc.scope && (
                <span className="text-xs text-gray-500 border border-gray-200 px-2 py-0.5">
                  {doc.scope}
                </span>
              )}
              <span className="text-xs font-mono text-gray-300 ml-auto">{doc.id}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{doc.title}</h2>
            {doc.description && (
              <p className="text-gray-600 leading-relaxed">{doc.description}</p>
            )}

            {/* ISP-specific metadata */}
            {artefact?.id === 'SOL-ISP' && (
              <div className="mt-5">
                <IspMetaTable doc={doc} />
              </div>
            )}
          </div>

          {/* ── Sections ────────────────────────────────────────────────── */}
          {sections.map(cfg => (
            <section
              key={cfg.key}
              ref={el => { sectionRefs.current[cfg.key] = el }}
              data-section={cfg.key}
              className="mb-10 scroll-mt-20"
            >
              <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                {cfg.label}
              </h3>
              <SectionContent
                config={cfg}
                value={doc[cfg.key]}
                clientId={clientId}
                versionId={versionId}
              />
            </section>
          ))}
        </article>
      </div>
    </div>
  )
}
