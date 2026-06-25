import ScopeSelector from './ScopeSelector'

// Thin adapter: drives a scope filter (domain / abstraction / artefact) from the
// URL search params so filters are shareable and bookmarkable. Shared by the
// Decisions and Discovery index pages.
export default function ScopeFilter({ searchParams, setSearchParams }) {
  const scope = {
    domain: searchParams.get('domain') ?? '',
    abstraction: searchParams.get('abstraction') ?? '',
    artefact: searchParams.get('artefact') ?? '',
  }

  function handleChange({ domain, abstraction, artefact }) {
    const next = new URLSearchParams()
    if (domain) next.set('domain', domain)
    if (abstraction) next.set('abstraction', abstraction)
    if (artefact) next.set('artefact', artefact)
    setSearchParams(next)
  }

  return <ScopeSelector {...scope} onChange={handleChange} />
}
