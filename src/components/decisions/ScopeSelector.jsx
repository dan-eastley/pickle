import { DOMAINS, ABSTRACTIONS, ARTEFACTS } from '../../lib/artefacts'

const selectClass =
  'px-3 py-1.5 text-xs border border-gray-300 bg-white focus:outline-none focus:border-brand-500 text-gray-700'

function FilterIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 16 16" fill="none">
      <path
        d="M2 4h12M4 8h8M6 12h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  )
}

export default function ScopeSelector({ domain, abstraction, artefact, onChange }) {
  const availableAbstractions = domain ? ABSTRACTIONS : []
  const availableArtefacts = ARTEFACTS.filter(
    (a) => (!domain || a.domain === domain) && (!abstraction || a.abstraction === abstraction)
  )

  function setDomain(value) {
    onChange({ domain: value, abstraction: '', artefact: '' })
  }
  function setAbstraction(value) {
    onChange({ domain, abstraction: value, artefact: '' })
  }
  function setArtefact(value) {
    onChange({ domain, abstraction, artefact: value })
  }
  function clear() {
    onChange({ domain: '', abstraction: '', artefact: '' })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <FilterIcon />
      <select value={domain} onChange={(e) => setDomain(e.target.value)} className={selectClass}>
        <option value="">All Domains</option>
        {DOMAINS.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      <select
        value={abstraction}
        onChange={(e) => setAbstraction(e.target.value)}
        disabled={!domain}
        className={`${selectClass} disabled:opacity-40`}
      >
        <option value="">All Abstractions</option>
        {availableAbstractions.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      <select
        value={artefact}
        onChange={(e) => setArtefact(e.target.value)}
        disabled={!domain}
        className={`${selectClass} disabled:opacity-40`}
      >
        <option value="">All Artefacts</option>
        {availableArtefacts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      {(domain || abstraction || artefact) && (
        <button
          onClick={clear}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
        >
          Clear
        </button>
      )}
    </div>
  )
}
