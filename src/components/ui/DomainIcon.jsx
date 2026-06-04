// One geometric SVG icon per architecture domain.
// All use viewBox="0 0 20 20", fill="none", stroke="currentColor", strokeWidth="1.5".

function BusinessIcon({ className }) {
  // Org-chart hierarchy: top box → two child boxes
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="1" width="8" height="5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="14" width="7" height="5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="12" y="14" width="7" height="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4.5M10 10.5H4.5M10 10.5H15.5M4.5 10.5V14M15.5 10.5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

function DataIcon({ className }) {
  // Database cylinders: two stacked discs with side walls
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="10" cy="4.5" rx="7" ry="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 4.5v5M17 4.5v5" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="10" cy="9.5" rx="7" ry="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 9.5v5M17 9.5v5" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="10" cy="14.5" rx="7" ry="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function IntegrationIcon({ className }) {
  // Three nodes connected in a triangle — APIs / events / messaging
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="7.5" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="14" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 9.5L14 4M6 11L14 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

function ApplicationIcon({ className }) {
  // Four equal tiles / app grid
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="8" height="8" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="1" width="8" height="8" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="11" width="8" height="8" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="8" height="8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function SolutionIcon({ className }) {
  // Overlapping / crossing rectangles — cross-cutting blueprint
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="5" width="12" height="10" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="2" width="12" height="10" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="5" width="6" height="5" fill="currentColor" fillOpacity="0.15" stroke="none" />
    </svg>
  )
}

const ICONS = {
  business:    BusinessIcon,
  data:        DataIcon,
  integration: IntegrationIcon,
  application: ApplicationIcon,
  solution:    SolutionIcon,
}

export default function DomainIcon({ domain, className = 'w-5 h-5' }) {
  const Icon = ICONS[domain]
  return Icon ? <Icon className={className} /> : null
}
