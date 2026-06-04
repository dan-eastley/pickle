// Icons for artefact formats: catalogue, matrix, diagram.
// Using inline SVGs to avoid dependency on exact icon package naming.
// Replace with @untitled-ui/icons-react equivalents as needed.

function CatalogueIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 5h14M3 10h14M3 15h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function MatrixIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function DiagramIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 15L7 9l3 4 3-6 4 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function FormatIcon({ format, className = 'w-4 h-4' }) {
  if (format === 'catalogue') return <CatalogueIcon className={className} />
  if (format === 'matrix')    return <MatrixIcon className={className} />
  if (format === 'diagram')   return <DiagramIcon className={className} />
  return null
}
