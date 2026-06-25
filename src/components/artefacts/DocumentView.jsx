import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getArtefact, resolveRefArtefactId } from '../../lib/artefacts'
import { getArtefactData } from '../../lib/api'
import { nameWithId } from '../../lib/format'
import { DisclosureChevron } from '../ui/icons'
import { toggleInSet } from '../../lib/collections'
import useActiveSection from '../../hooks/useActiveSection'
import usePersistedSet from '../../hooks/usePersistedSet'
import useSearchParamState from '../../hooks/useSearchParamState'
import EntityPanel from './EntityPanel'
import NestedGroupDiagram from './diagrams/NestedGroupDiagram'

// ─── Legacy section configuration (doc types not yet migrated to meta.sections) ──
// Fallback for SOL-ISP until its schema carries a meta.sections block.
// SOL-SDE, SOL-SVI, SOL-AIN, and SOL-AVI are fully schema-driven.
// type values: prose | highlight | cards | tags | risks | options | diagrams |
//              components | flows | uml | endpoints | sla | code

const SECTION_CONFIGS = {
  'SOL-ISP': [
    { key: 'endpoints', label: 'Endpoints', type: 'endpoints' },
    { key: 'data-model', label: 'Data Model', type: 'code' },
    { key: 'error-handling', label: 'Error Handling', type: 'prose' },
    { key: 'sla', label: 'SLA', type: 'sla' },
    {
      key: 'test-scenarios',
      label: 'Test Scenarios',
      type: 'cards',
      titleField: 'description',
      metaField: 'expected-outcome',
    },
    { key: 'diagrams', label: 'Diagrams', type: 'diagrams' },
  ],
}

const STATUS_STYLES = {
  draft: 'bg-gray-100 text-gray-600',
  'in-review': 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  superseded: 'bg-red-50 text-red-600',
}

const METHOD_STYLES = {
  GET: 'bg-blue-100 text-blue-700',
  POST: 'bg-emerald-100 text-emerald-700',
  PUT: 'bg-amber-100 text-amber-700',
  PATCH: 'bg-orange-100 text-orange-700',
  DELETE: 'bg-red-100 text-red-700',
}

const PRIORITY_STYLES = {
  must: 'bg-red-50 text-red-600',
  should: 'bg-amber-50 text-amber-700',
  could: 'bg-blue-50 text-blue-700',
  wont: 'bg-gray-100 text-gray-500',
}

const ADHERENCE_STYLES = {
  adheres: 'bg-emerald-50 text-emerald-700',
  partial: 'bg-amber-50 text-amber-700',
  deviation: 'bg-red-50 text-red-600',
}

// ─── Sub-renderers ─────────────────────────────────────────────────────────────

function ProseSection({ text }) {
  return <p className="text-gray-700 leading-relaxed whitespace-pre-line">{text}</p>
}

// Executive summary: an opening paragraph followed by key statements/bullets.
// Tolerates a plain string for not-yet-migrated content.
function ExecSummary({ value }) {
  if (typeof value === 'string') return <ProseSection text={value} />
  return (
    <div className="space-y-3">
      {value.summary && <p className="text-gray-700 leading-relaxed">{value.summary}</p>}
      {value.points?.length > 0 && (
        <ul className="space-y-1.5">
          {value.points.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-1.5 w-1.5 h-1.5 bg-rose-400 flex-shrink-0" />
              {p}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function HighlightSection({ text }) {
  return (
    <blockquote className="border-l-4 border-rose-400 pl-5 py-1">
      <p className="text-lg text-gray-800 font-medium leading-relaxed">{text}</p>
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
              <span className="text-xs font-mono text-gray-400 pt-0.5 flex-shrink-0">
                {item.id}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 font-medium">
                {item[config.titleField] ?? JSON.stringify(item)}
              </p>
              {config.metaField && item[config.metaField] && (
                <p className="mt-0.5 text-xs text-gray-500">{item[config.metaField]}</p>
              )}
              {config.linksField && item[config.linksField]?.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {item[config.linksField].map((link) => (
                    <span
                      key={link}
                      className="px-1.5 py-0.5 bg-violet-50 text-violet-700 text-xs font-mono"
                    >
                      {link}
                    </span>
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
  const IMPACT_COLOR = {
    low: 'bg-emerald-50 text-emerald-700',
    medium: 'bg-amber-50 text-amber-700',
    high: 'bg-red-50 text-red-700',
  }
  return (
    <div className="space-y-2">
      {items.map((risk, i) => (
        <div key={risk.id ?? i} className="border border-gray-200 px-4 py-3 bg-white">
          <div className="flex items-start gap-3">
            {risk.id && (
              <span className="text-xs font-mono text-gray-400 pt-0.5 flex-shrink-0">
                {risk.id}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 font-medium">{risk.description}</p>
              {risk.mitigation && (
                <p className="mt-1 text-xs text-gray-500">
                  <span className="font-medium">Mitigation:</span> {risk.mitigation}
                </p>
              )}
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              {risk.likelihood && (
                <span
                  className={`text-xs px-2 py-0.5 capitalize ${IMPACT_COLOR[risk.likelihood] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  L: {risk.likelihood}
                </span>
              )}
              {risk.impact && (
                <span
                  className={`text-xs px-2 py-0.5 capitalize ${IMPACT_COLOR[risk.impact] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  I: {risk.impact}
                </span>
              )}
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
          {opt.description && (
            <p className="px-4 pt-3 pb-1 text-sm text-gray-700">{opt.description}</p>
          )}
          <div className="px-4 pb-3 grid grid-cols-2 gap-4 mt-2">
            {opt.pros?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-emerald-700 mb-1">Pros</p>
                <ul className="space-y-0.5">
                  {opt.pros.map((p, j) => (
                    <li key={j} className="text-xs text-gray-600 flex gap-1.5">
                      <span className="text-emerald-500 flex-shrink-0">+</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {opt.cons?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-600 mb-1">Cons</p>
                <ul className="space-y-0.5">
                  {opt.cons.map((c, j) => (
                    <li key={j} className="text-xs text-gray-600 flex gap-1.5">
                      <span className="text-red-400 flex-shrink-0">−</span>
                      {c}
                    </li>
                  ))}
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
          <span className="font-mono text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 flex-shrink-0 mt-0.5">
            {c['platform-id']}
          </span>
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
          {flow.description && (
            <p className="px-4 pt-3 text-sm text-gray-600">{flow.description}</p>
          )}
          {flow.steps?.length > 0 && (
            <ol className="px-4 py-3 space-y-1 list-decimal list-inside">
              {flow.steps.map((step, j) => (
                <li key={j} className="text-sm text-gray-700">
                  {step}
                </li>
              ))}
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
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {uml.type}
            </span>
            <span className="text-sm font-medium text-gray-800">{uml.title}</span>
            <span className="ml-auto text-xs px-2 py-0.5 bg-white border border-gray-200 text-gray-500">
              {uml.format}
            </span>
          </div>
          {uml.description && <p className="px-4 pt-2 text-sm text-gray-600">{uml.description}</p>}
          <pre className="px-4 py-3 text-xs text-gray-700 overflow-x-auto bg-gray-50 font-mono leading-relaxed whitespace-pre">
            {uml.content}
          </pre>
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
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-20">
              Method
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Path
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Description
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {items.map((ep, i) => (
            <tr key={i}>
              <td className="px-4 py-2.5">
                <span
                  className={`text-xs px-2 py-0.5 font-bold ${METHOD_STYLES[ep.method] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  {ep.method}
                </span>
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
    ['Throughput', sla['throughput-tps'] != null ? `${sla['throughput-tps']} TPS` : null],
    [
      'Availability',
      sla['availability-percent'] != null ? `${sla['availability-percent']}%` : null,
    ],
  ].filter(([, v]) => v)
  return (
    <div className="border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 w-48">
                {label}
              </td>
              <td className="px-4 py-2.5 font-mono text-gray-800">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CodeBlock({ text }) {
  return (
    <pre className="p-4 bg-gray-50 border border-gray-200 text-xs text-gray-700 font-mono overflow-x-auto whitespace-pre leading-relaxed">
      {text}
    </pre>
  )
}

function DiagramRefs({ refs, clientId, versionId }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {refs.map((ref, i) => {
        const artefact = getArtefact(ref['artefact-id'])
        return (
          <div
            key={i}
            className="border border-gray-200 bg-white px-4 py-3 flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">
                {nameWithId(ref.title ?? artefact?.name, ref['artefact-id'])}
              </p>
              {ref.caption && <p className="text-xs text-gray-500 mt-0.5">{ref.caption}</p>}
            </div>
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

// ─── New (schema-driven) content renderers ───────────────────────────────────

// A compact, table-like list of entity references (capabilities, processes,
// platforms, strategies). Each row is clickable when the entity resolves and
// darkens on hover to signal it opens the entity detail panel.
function EntityRefList({ items, onOpenEntity }) {
  return (
    <div className="border border-gray-200 divide-y divide-gray-100">
      {items.map((ref, i) => {
        const id = ref['artefact-id']
        const resolvable = !!resolveRefArtefactId(id)
        const inner = (
          <>
            <span className="font-mono text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 flex-shrink-0">
              {id}
            </span>
            {ref.note && <span className="text-sm text-gray-600 min-w-0 truncate">{ref.note}</span>}
          </>
        )
        return resolvable ? (
          <button
            key={id ?? i}
            onClick={() => onOpenEntity?.(id)}
            title="View details"
            className="w-full text-left flex items-center gap-3 px-3 py-1.5 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {inner}
          </button>
        ) : (
          <div key={id ?? i} className="flex items-center gap-3 px-3 py-1.5">
            {inner}
          </div>
        )
      })}
    </div>
  )
}

// Every array-valued property across the loaded catalogues, flattened.
function flattenCatalogues(catalogues) {
  const out = []
  for (const data of Object.values(catalogues)) {
    if (!data) continue
    for (const v of Object.values(data)) if (Array.isArray(v)) out.push(...v)
  }
  return out
}

// True when `child` sits one level under `parent` — by parent-id, domain-id, or
// id-prefix nesting (e.g. PROC-001-01 under PROC-001).
function isChildOf(child, parent) {
  if (child.id === parent.id) return false
  if (child['parent-id'] === parent.id) return true
  if (child['domain-id'] === parent.id) return true
  return (
    child.id.startsWith(parent.id + '-') &&
    child.id.split('-').length === parent.id.split('-').length + 1
  )
}

// Build NestedGroupDiagram groups from the referenced entities only, nesting a
// referenced child under a referenced parent where that relationship exists.
function buildDiagramGroups(refs, catalogues) {
  const all = flattenCatalogues(catalogues)
  const entities = refs.map((r) => all.find((e) => e && e.id === r['artefact-id'])).filter(Boolean)
  const parentOf = (e) => entities.find((p) => isChildOf(e, p))
  return entities
    .filter((e) => !parentOf(e))
    .map((e) => ({
      id: e.id,
      name: e.name ?? e.id,
      meta: { importance: e.importance },
      items: entities
        .filter((c) => parentOf(c)?.id === e.id)
        .map((c) => ({ id: c.id, name: c.name ?? c.id })),
    }))
}

// A small card diagram of the referenced entities, loaded from their
// catalogue(s). Rendered only when every reference maps to a single domain
// (so the diagram has one coherent palette); mixed-domain lists show no diagram.
function EntityRefDiagram({ items, clientId, versionId, onOpenEntity }) {
  const [catalogues, setCatalogues] = useState(null)

  const typeIds = [
    ...new Set(items.map((r) => resolveRefArtefactId(r['artefact-id'])).filter(Boolean)),
  ]
  const artefacts = typeIds.map(getArtefact).filter(Boolean)
  const domains = [...new Set(artefacts.map((a) => a.domain))]
  const renderable = domains.length === 1 && artefacts.length > 0

  useEffect(() => {
    if (!renderable) {
      setCatalogues(null)
      return
    }
    let cancelled = false
    Promise.all(
      artefacts.map((a) =>
        getArtefactData(clientId, versionId, a.domain, a.abstraction, a.id).then((d) => [a.id, d])
      )
    ).then((entries) => {
      if (!cancelled) setCatalogues(Object.fromEntries(entries))
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(items.map((r) => r['artefact-id'])), clientId, versionId])

  if (!renderable || !catalogues) return null
  const groups = buildDiagramGroups(items, catalogues)
  if (groups.length === 0) return null

  return (
    <div className="border border-gray-200 bg-white p-3">
      <NestedGroupDiagram
        groups={groups}
        domain={domains[0]}
        diagramType="card-based"
        onItemClick={onOpenEntity}
      />
    </div>
  )
}

// Entity references rendered as a mini card-diagram plus a compact detail list.
function EntityRefsBlock({ items, clientId, versionId, onOpenEntity }) {
  return (
    <div className="space-y-3">
      <EntityRefDiagram
        items={items}
        clientId={clientId}
        versionId={versionId}
        onOpenEntity={onOpenEntity}
      />
      <EntityRefList items={items} onOpenEntity={onOpenEntity} />
    </div>
  )
}

function ContextLinks({ items, clientId, versionId }) {
  const REL_LABEL = { 'informed-by': 'Informed by', informs: 'Informs', related: 'Related' }
  return (
    <div className="space-y-2">
      {items.map((link, i) => {
        const artefact = getArtefact(link['artefact-id'])
        const href = artefact
          ? `/clients/${clientId}/${versionId}/domains/${artefact.domain}/${artefact.abstraction}/${artefact.id}`
          : null
        return (
          <div
            key={i}
            className="border border-gray-200 bg-white px-4 py-3 flex items-center gap-3"
          >
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex-shrink-0 w-28">
              {REL_LABEL[link.relationship] ?? link.relationship}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">
                {nameWithId(link.title, link['document-id'])}
              </p>
              {artefact && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {nameWithId(artefact.name, artefact.id)}
                </p>
              )}
            </div>
            {href && (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Open ↗
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}

function RequirementList({ items }) {
  return (
    <div className="space-y-2">
      {items.map((req, i) => (
        <div key={req.id ?? i} className="border border-gray-200 px-4 py-3 bg-white">
          <div className="flex items-start gap-3">
            {req.id && (
              <span className="text-xs font-mono text-gray-400 pt-0.5 flex-shrink-0">{req.id}</span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800">{req.requirement}</p>
              {req.rationale && (
                <p className="mt-1 text-xs text-gray-500">
                  <span className="font-medium">Rationale:</span> {req.rationale}
                </p>
              )}
            </div>
            {req.priority && (
              <span
                className={`text-xs px-2 py-0.5 uppercase tracking-wide flex-shrink-0 ${PRIORITY_STYLES[req.priority] ?? 'bg-gray-100 text-gray-500'}`}
              >
                {req.priority}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function BulletList({ items }) {
  return (
    <ul className="space-y-1.5">
      {items.map((b, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
          <span className="mt-1.5 w-1.5 h-1.5 bg-rose-400 flex-shrink-0" />
          {b}
        </li>
      ))}
    </ul>
  )
}

function FeatureList({ items }) {
  return (
    <div className="space-y-2">
      {items.map((feat, i) => (
        <div key={feat.id ?? i} className="border border-gray-200 px-4 py-3 bg-white">
          <div className="flex items-baseline gap-3">
            {feat.id && (
              <span className="text-xs font-mono text-gray-400 flex-shrink-0">{feat.id}</span>
            )}
            <span className="text-sm font-semibold text-gray-900">{feat.name}</span>
          </div>
          {feat.description && <p className="mt-1 text-sm text-gray-600">{feat.description}</p>}
        </div>
      ))}
    </div>
  )
}

function DomainArchitecture({ value, clientId, versionId, onOpenEntity }) {
  return (
    <div className="space-y-4">
      {value.description && <ProseSection text={value.description} />}
      {value.references?.length > 0 && (
        <EntityRefsBlock
          items={value.references}
          clientId={clientId}
          versionId={versionId}
          onOpenEntity={onOpenEntity}
        />
      )}
      {value.diagrams?.length > 0 && (
        <DiagramRefs refs={value.diagrams} clientId={clientId} versionId={versionId} />
      )}
    </div>
  )
}

function PrincipleAdherenceList({ items, onOpenEntity }) {
  return (
    <div className="space-y-2">
      {items.map((row, i) => {
        const resolvable = !!resolveRefArtefactId(row['principle-id'])
        const idChip = (
          <span className="font-mono text-xs px-2 py-0.5 bg-gray-100 text-gray-700">
            {row['principle-id']}
          </span>
        )
        return (
          <div key={i} className="border border-gray-200 bg-white px-4 py-3 flex items-start gap-3">
            {resolvable ? (
              <button
                onClick={() => onOpenEntity?.(row['principle-id'])}
                className="flex-shrink-0 hover:opacity-80 transition-opacity"
                title="View details"
              >
                {idChip}
              </button>
            ) : (
              <span className="flex-shrink-0">{idChip}</span>
            )}
            {row.statement && (
              <p className="text-sm text-gray-700 flex-1 min-w-0">{row.statement}</p>
            )}
            <span
              className={`text-xs px-2 py-0.5 uppercase tracking-wide flex-shrink-0 ${ADHERENCE_STYLES[row.adherence] ?? 'bg-gray-100 text-gray-500'}`}
            >
              {row.adherence}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function FlowSection({ items }) {
  return (
    <div className="space-y-4">
      {items.map((flow, i) => (
        <div key={flow.id ?? i} className="border border-gray-200 bg-white">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
            {flow.id && <span className="text-xs font-mono text-gray-400">{flow.id}</span>}
            <span className="text-sm font-semibold text-gray-900">{flow.title}</span>
            {flow.format && (
              <span className="ml-auto text-xs px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-500">
                {flow.format}
              </span>
            )}
          </div>
          {flow.description && (
            <p className="px-4 pt-3 text-sm text-gray-600">{flow.description}</p>
          )}
          {flow.steps?.length > 0 && (
            <ol className="px-4 py-3 space-y-1 list-decimal list-inside">
              {flow.steps.map((step, j) => (
                <li key={j} className="text-sm text-gray-700">
                  {step}
                </li>
              ))}
            </ol>
          )}
          {flow.content && (
            <pre className="px-4 py-3 text-xs text-gray-700 overflow-x-auto bg-gray-50 font-mono leading-relaxed whitespace-pre">
              {flow.content}
            </pre>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Content dispatchers ─────────────────────────────────────────────────────

// Legacy flat dispatcher (SECTION_CONFIGS path)
function SectionContent({ config, value, clientId, versionId }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null
  switch (config.type) {
    case 'prose':
      return <ProseSection text={value} />
    case 'highlight':
      return <HighlightSection text={value} />
    case 'tags':
      return <TagList items={value} />
    case 'cards':
      return <CardList items={value} config={config} />
    case 'risks':
      return <RiskList items={value} />
    case 'options':
      return <OptionList items={value} />
    case 'components':
      return <ComponentList items={value} />
    case 'flows':
      return <FlowList items={value} />
    case 'uml':
      return <UmlList items={value} />
    case 'endpoints':
      return <EndpointTable items={value} />
    case 'sla':
      return <SlaTable sla={value} />
    case 'code':
      return <CodeBlock text={value} />
    case 'diagrams':
      return <DiagramRefs refs={value} clientId={clientId} versionId={versionId} />
    default:
      return <pre className="text-xs text-gray-500">{JSON.stringify(value, null, 2)}</pre>
  }
}

// Schema-driven dispatcher (meta.sections content types)
function SchemaContent({ contentType, value, clientId, versionId, onOpenEntity }) {
  switch (contentType) {
    case 'prose':
      return <ProseSection text={value} />
    case 'exec-summary':
      return <ExecSummary value={value} />
    case 'highlight':
      return <HighlightSection text={value} />
    case 'context-links':
      return <ContextLinks items={value} clientId={clientId} versionId={versionId} />
    case 'capability-refs':
    case 'entity-refs':
      return (
        <EntityRefsBlock
          items={value}
          clientId={clientId}
          versionId={versionId}
          onOpenEntity={onOpenEntity}
        />
      )
    case 'tags':
      return <TagList items={value} />
    case 'requirements':
      return <RequirementList items={value} />
    case 'features':
      return <FeatureList items={value} />
    case 'bullets':
      return <BulletList items={value} />
    case 'objectives':
      return (
        <CardList
          items={value}
          config={{ titleField: 'objective', linksField: 'linked-capabilities' }}
        />
      )
    case 'drivers':
    case 'constraints':
      return <CardList items={value} config={{ titleField: 'description', tagField: 'type' }} />
    case 'stakeholders':
      return (
        <CardList
          items={value}
          config={{ titleField: 'name', metaField: 'role', linksField: 'concerns' }}
        />
      )
    case 'concerns':
      return <CardList items={value} config={{ titleField: 'description', tagField: 'type' }} />
    case 'options':
      return <OptionList items={value} />
    case 'assumptions':
      return <CardList items={value} config={{ titleField: 'description' }} />
    case 'risks':
      return <RiskList items={value} />
    case 'open-questions':
      return <CardList items={value} config={{ titleField: 'question', metaField: 'raised-by' }} />
    case 'domain-architecture':
      return (
        <DomainArchitecture
          value={value}
          clientId={clientId}
          versionId={versionId}
          onOpenEntity={onOpenEntity}
        />
      )
    case 'principle-adherence':
      return <PrincipleAdherenceList items={value} onOpenEntity={onOpenEntity} />
    case 'flows':
      return <FlowSection items={value} />
    default:
      return <pre className="text-xs text-gray-500">{JSON.stringify(value, null, 2)}</pre>
  }
}

function hasContent(value) {
  if (value == null || value === '') return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') {
    return Object.values(value).some((v) => hasContent(v))
  }
  return true
}

// ─── ISP metadata table (shown at top for interface spec docs) ────────────────

function IspMetaTable({ doc }) {
  const rows = [
    ['Interface', doc['interface-id']],
    ['Source', doc['source-system']],
    ['Target', doc['target-system']],
    ['Protocol', doc['technical-protocol']],
    ['Auth', doc['authentication']],
    ['Data Format', doc['data-format']],
    ['Trigger', doc['trigger']],
  ].filter(([, v]) => v)
  if (rows.length === 0) return null
  return (
    <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-px border border-gray-200 bg-gray-200 overflow-hidden">
      {rows.map(([label, value]) => (
        <div key={label} className="bg-white px-3 py-2">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
            {label}
          </p>
          <p className="text-sm font-mono text-gray-800">{value}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Document selector ────────────────────────────────────────────────────────

export function DocumentSelector({ artefact, documents, selectedIdx, onSelect }) {
  return (
    <div className="mb-5 px-5 py-4 bg-white shadow-xl">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
        {nameWithId(artefact?.name, artefact?.id)}
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-0">
          <select
            value={selectedIdx}
            onChange={(e) => onSelect(Number(e.target.value))}
            className="w-full appearance-none pl-3 pr-10 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 cursor-pointer"
          >
            {documents.map((d, i) => (
              <option key={d.id ?? i} value={i}>
                {nameWithId(d.title, d.id)}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">
          {documents.length} document{documents.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}

// ─── Schema-driven document body ──────────────────────────────────────────────

function SchemaDrivenDocument({ doc, sections, clientId, versionId, storageKey }) {
  const sectionRefs = useRef({})
  const [collapsed, setCollapsed] = usePersistedSet(storageKey)
  // Entity panel selection lives in the URL (?entity=…) so it is deep-linkable.
  const [entityId, setEntityId] = useSearchParamState('entity')
  const [activeKey, setActiveKey] = useActiveSection(sectionRefs, [doc, collapsed])

  // Build visible structure with stable, schema-derived numbering.
  // A section is either a parent (has `subsections`) or a leaf (has its own `content`).
  const visible = sections
    .map((section, si) => {
      const subs = (section.subsections ?? [])
        .map((sub, ssi) => ({ ...sub, number: `${si + 1}.${ssi + 1}`, value: doc[sub.key] }))
        .filter((sub) => hasContent(sub.value))
      const leafValue = section.content ? doc[section.key] : undefined
      const isLeaf = !section.subsections && section.content != null
      return { ...section, number: `${si + 1}`, subs, isLeaf, leafValue }
    })
    .filter((section) => (section.isLeaf ? hasContent(section.leafValue) : section.subs.length > 0))

  const allKeys = visible.flatMap((s) => [s.key, ...s.subs.map((ss) => ss.key)])

  // Reset the active section when the document changes (collapse state is
  // persisted per document by usePersistedSet).
  useEffect(() => {
    setActiveKey(visible[0]?.subs[0]?.key ?? visible[0]?.key ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc])

  function toggle(key) {
    setCollapsed((prev) => toggleInSet(prev, key))
  }
  const expandAll = () => setCollapsed(new Set())
  const collapseAll = () => setCollapsed(new Set(allKeys))

  // Map each subsection key to its parent section key, so clicking a nav entry
  // can expand whatever needs expanding before scrolling to it.
  const parentOf = {}
  for (const s of visible) for (const sub of s.subs) parentOf[sub.key] = s.key

  function scrollTo(key) {
    const toReveal = parentOf[key] ? [parentOf[key], key] : [key]
    setCollapsed((prev) => {
      if (!toReveal.some((k) => prev.has(k))) return prev
      const next = new Set(prev)
      toReveal.forEach((k) => next.delete(k))
      return next
    })
    // Wait a frame so a just-expanded section is in the DOM before scrolling.
    requestAnimationFrame(() => {
      sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <>
      <div className="flex gap-8">
        {/* Contents nav — H1 + H2 only, stays on the page background */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <nav className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Contents
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={expandAll}
                  className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                >
                  Expand all
                </button>
                <span className="text-gray-300">·</span>
                <button
                  onClick={collapseAll}
                  className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                >
                  Collapse all
                </button>
              </div>
            </div>
            <ul className="space-y-0.5">
              {visible.map((section) => (
                <li key={section.key}>
                  <button
                    onClick={() => scrollTo(section.key)}
                    className={`w-full text-left text-sm px-3 py-1.5 font-medium transition-colors flex gap-2 ${
                      section.isLeaf && activeKey === section.key
                        ? 'bg-rose-50 text-rose-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-gray-400 font-mono text-xs pt-0.5">{section.number}</span>
                    <span className="min-w-0">{section.title}</span>
                  </button>
                  <ul className="space-y-0.5">
                    {section.subs.map((sub) => (
                      <li key={sub.key}>
                        <button
                          onClick={() => scrollTo(sub.key)}
                          className={`w-full text-left text-sm pl-7 pr-3 py-1 transition-colors flex gap-2 border-l-2 ${
                            activeKey === sub.key
                              ? 'bg-rose-50 text-rose-700 border-rose-500'
                              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-transparent'
                          }`}
                        >
                          <span className="font-mono text-xs pt-0.5 opacity-60">{sub.number}</span>
                          <span className="min-w-0">{sub.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Document body — white box with drop shadow, the 'document' surface */}
        <article className="flex-1 min-w-0 bg-white shadow-xl px-8 py-7">
          {/* Document title (H0) */}
          <header className="mb-8 pb-5 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">{nameWithId(doc.title, doc.id)}</h1>
            {doc.description && (
              <p className="mt-2 text-gray-600 leading-relaxed">{doc.description}</p>
            )}
          </header>

          {visible.map((section) => {
            const sectionCollapsed = collapsed.has(section.key)
            return (
              <section
                key={section.key}
                ref={(el) => {
                  sectionRefs.current[section.key] = el
                }}
                data-section={section.key}
                className="mb-8 scroll-mt-20"
              >
                <button
                  onClick={() => toggle(section.key)}
                  className="w-full flex items-start gap-2 text-left group"
                >
                  <span className="text-gray-300 group-hover:text-gray-500 mt-1.5">
                    <DisclosureChevron open={!sectionCollapsed} />
                  </span>
                  <h2 className="text-xl font-bold text-gray-900">
                    <span className="text-gray-400 font-mono text-base mr-2">{section.number}</span>
                    {section.title}
                  </h2>
                </button>
                {section.description && (
                  <p className="mt-1 ml-6 text-sm text-gray-500">{section.description}</p>
                )}

                {!sectionCollapsed && section.isLeaf && (
                  <div className="mt-4 ml-6">
                    <SchemaContent
                      contentType={section.content}
                      value={section.leafValue}
                      clientId={clientId}
                      versionId={versionId}
                      onOpenEntity={setEntityId}
                    />
                  </div>
                )}

                {!sectionCollapsed && !section.isLeaf && (
                  <div className="mt-5 ml-6 space-y-8">
                    {section.subs.map((sub) => {
                      const subCollapsed = collapsed.has(sub.key)
                      return (
                        <div
                          key={sub.key}
                          ref={(el) => {
                            sectionRefs.current[sub.key] = el
                          }}
                          data-section={sub.key}
                          className="scroll-mt-20"
                        >
                          <button
                            onClick={() => toggle(sub.key)}
                            className="w-full flex items-start gap-2 text-left group"
                          >
                            <span className="text-gray-300 group-hover:text-gray-500 mt-1">
                              <DisclosureChevron open={!subCollapsed} className="w-3 h-3" />
                            </span>
                            <h3 className="text-base font-semibold text-gray-900">
                              <span className="text-gray-400 font-mono text-sm mr-2">
                                {sub.number}
                              </span>
                              {sub.title}
                            </h3>
                          </button>
                          {sub.description && (
                            <p className="mt-0.5 ml-5 text-sm text-gray-500">{sub.description}</p>
                          )}
                          {!subCollapsed && (
                            <div className="mt-3 ml-5">
                              <SchemaContent
                                contentType={sub.content}
                                value={sub.value}
                                clientId={clientId}
                                versionId={versionId}
                                onOpenEntity={setEntityId}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            )
          })}
        </article>
      </div>
      <EntityPanel
        entityId={entityId}
        clientId={clientId}
        versionId={versionId}
        onOpenEntity={setEntityId}
        onClose={() => setEntityId(null)}
      />
    </>
  )
}

// ─── Legacy flat document body (doc types without meta.sections) ──────────────

function LegacyDocument({ doc, sections, artefact, clientId, versionId }) {
  const sectionRefs = useRef({})
  const [activeSection, setActiveSection] = useActiveSection(sectionRefs, [doc, sections.length])

  useEffect(() => {
    setActiveSection('overview')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc])

  function scrollTo(key) {
    sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex gap-8">
      <aside className="hidden lg:block w-48 flex-shrink-0">
        <nav className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Contents
          </p>
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
            {sections.map((cfg) => (
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

      <article className="flex-1 min-w-0 bg-white shadow-xl px-8 py-7">
        <div
          ref={(el) => {
            sectionRefs.current['overview'] = el
          }}
          data-section="overview"
          className="mb-8 scroll-mt-20"
        >
          <div className="flex items-center gap-2 mb-3">
            {doc.status && (
              <span
                className={`text-xs px-2 py-0.5 font-medium uppercase tracking-wide ${STATUS_STYLES[doc.status] ?? 'bg-gray-100 text-gray-600'}`}
              >
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
          {doc.description && <p className="text-gray-600 leading-relaxed">{doc.description}</p>}
          {doc.overview && (
            <p className="mt-3 text-gray-700 leading-relaxed whitespace-pre-line">{doc.overview}</p>
          )}

          {artefact?.id === 'SOL-ISP' && (
            <div className="mt-5">
              <IspMetaTable doc={doc} />
            </div>
          )}
        </div>

        {sections.map((cfg) => (
          <section
            key={cfg.key}
            ref={(el) => {
              sectionRefs.current[cfg.key] = el
            }}
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
  )
}

// ─── Main DocumentView ─────────────────────────────────────────────────────────

export default function DocumentView({
  data,
  artefact,
  schema,
  clientId,
  versionId,
  selectedIdx = 0,
}) {
  const documents = data?.documents ?? []

  if (documents.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400 text-sm border border-gray-200 bg-white">
        No documents yet. Add entries to the{' '}
        <code className="font-mono text-xs bg-gray-100 px-1">documents</code> array.
      </div>
    )
  }

  const doc = documents[selectedIdx] ?? documents[0]
  const metaSections = schema?.meta?.sections
  const legacySections = (SECTION_CONFIGS[artefact?.id] ?? []).filter((cfg) =>
    hasContent(doc?.[cfg.key])
  )

  return Array.isArray(metaSections) && metaSections.length > 0 ? (
    <SchemaDrivenDocument
      doc={doc}
      sections={metaSections}
      clientId={clientId}
      versionId={versionId}
      storageKey={`doc-collapsed:${artefact?.id}:${doc?.id}`}
    />
  ) : (
    <LegacyDocument
      doc={doc}
      sections={legacySections}
      artefact={artefact}
      clientId={clientId}
      versionId={versionId}
    />
  )
}
