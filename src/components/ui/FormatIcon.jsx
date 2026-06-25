// Icons for artefact format types: catalogue, matrix, diagram, document.

function CatalogueIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 5h14M3 10h14M3 15h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MatrixIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function DiagramIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 15L7 9l3 4 3-6 4 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DocumentIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 2h7l4 4v12H5V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 2v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path
        d="M7 9h6M7 12h6M7 15h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function FormatIcon({ format, className = 'w-4 h-4' }) {
  if (format === 'catalogue') return <CatalogueIcon className={className} />
  if (format === 'matrix') return <MatrixIcon className={className} />
  if (format === 'diagram') return <DiagramIcon className={className} />
  if (format === 'document') return <DocumentIcon className={className} />
  return null
}
