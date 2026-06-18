// Empty / placeholder state with an optional geometric illustration.
// Illustrations follow the app's icon language — square corners, 1.5 strokes —
// with dashed outlines suggesting the content that isn't there yet.

function CatalogueIllustration() {
  return (
    <svg className="w-24 h-16" viewBox="0 0 96 64" fill="none">
      <rect x="18" y="8" width="60" height="48" stroke="#D0D5DD" strokeWidth="1.5" />
      <path d="M26 20h28" stroke="#98A2B3" strokeWidth="1.5" strokeLinecap="square" />
      <rect x="60" y="17.25" width="10" height="5.5" fill="#EFF4FF" stroke="#B2CCFF" strokeWidth="1.5" />
      <path d="M26 32h44M26 44h44" stroke="#EAECF0" strokeWidth="1.5" strokeLinecap="square" strokeDasharray="4 4" />
    </svg>
  )
}

function MatrixIllustration() {
  return (
    <svg className="w-24 h-16" viewBox="0 0 96 64" fill="none">
      <rect x="24" y="8" width="48" height="48" stroke="#D0D5DD" strokeWidth="1.5" />
      <path d="M24 24h48M24 40h48M40 8v48M56 8v48" stroke="#EAECF0" strokeWidth="1.5" />
      <rect x="40" y="24" width="16" height="16" fill="#EFF4FF" />
      <path d="M44.5 32l2.5 2.5 5-5" stroke="#84ADFF" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

function DiagramIllustration() {
  return (
    <svg className="w-24 h-16" viewBox="0 0 96 64" fill="none">
      <rect x="38" y="6" width="20" height="14" stroke="#D0D5DD" strokeWidth="1.5" />
      <rect x="14" y="44" width="20" height="14" stroke="#D0D5DD" strokeWidth="1.5" />
      <rect x="62" y="44" width="20" height="14" stroke="#D0D5DD" strokeWidth="1.5" strokeDasharray="4 4" />
      <path d="M48 20v12M48 32H24M48 32h24M24 32v12M72 32v12" stroke="#EAECF0" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

function DecisionsIllustration() {
  return (
    <svg className="w-24 h-16" viewBox="0 0 96 64" fill="none">
      <rect x="30" y="6" width="36" height="52" stroke="#D0D5DD" strokeWidth="1.5" />
      <path d="M30 16h36M40 16v42" stroke="#D0D5DD" strokeWidth="1.5" />
      <path d="M46 26h14M46 36h14M46 46h9" stroke="#EAECF0" strokeWidth="1.5" strokeLinecap="square" strokeDasharray="4 4" />
    </svg>
  )
}

function FindingsIllustration() {
  return (
    <svg className="w-24 h-16" viewBox="0 0 96 64" fill="none">
      <path d="M16 14h40M16 26h40M16 38h26" stroke="#EAECF0" strokeWidth="1.5" strokeLinecap="square" strokeDasharray="4 4" />
      <rect x="54" y="26" width="20" height="20" stroke="#84ADFF" strokeWidth="1.5" />
      <path d="M74 46l8 8" stroke="#84ADFF" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

const ILLUSTRATIONS = {
  catalogue: CatalogueIllustration,
  matrix:    MatrixIllustration,
  diagram:   DiagramIllustration,
  decisions: DecisionsIllustration,
  findings:  FindingsIllustration,
}

export default function EmptyState({ title, description, icon: Icon, illustration, action, size = 'md' }) {
  const Illustration = illustration ? ILLUSTRATIONS[illustration] : null
  const pad = size === 'sm' ? 'py-8' : 'py-16'

  return (
    <div className={`flex flex-col items-center justify-center ${pad} px-6 text-center`}>
      {Illustration && (
        <div className="mb-4">
          <Illustration />
        </div>
      )}
      {!Illustration && Icon && (
        <div className="w-12 h-12 bg-gray-100 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-gray-400" />
        </div>
      )}
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-gray-500 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
