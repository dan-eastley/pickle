// Shared inline SVG icons. House style: geometric strokes, strokeWidth 1.5,
// square linecaps — matching DomainIcon and FormatIcon. Use these instead of
// re-declaring per-file SVGs so size and stroke style stay consistent.

export function ChevronRight({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

export function ChevronDown({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none">
      <path
        d="M3 5l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  )
}

export function ArrowRight({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  )
}

export function ArrowLeft({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none">
      <path
        d="M11 7H3M6 4L3 7l3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  )
}

export function PlusIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

export function CheckIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none">
      <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

export function CloseIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <path
        d="M3 3l10 10M13 3L3 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  )
}

// Amber star marking the key (STR/PRN/GRD) artefacts.
export function KeyStar({ className = 'w-3 h-3' }) {
  return (
    <svg
      className={`text-amber-500 flex-shrink-0 ${className}`}
      viewBox="0 0 12 12"
      fill="currentColor"
    >
      <path d="M6 1l1.29 3.09L10.5 4.5 8.25 6.65l.54 3.1L6 8.25 3.21 9.75l.54-3.1L1.5 4.5l3.21-.41z" />
    </svg>
  )
}

// Boxed-record glyph used wherever a Decision Record is represented.
export function DecisionIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none">
      <path
        d="M2 2h10v10H2zM2 5h10M5 5v7"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
    </svg>
  )
}

// Robot / AI agent icon — used for the Architecture Discovery (Virtual Architect Agent).
export function RobotIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <rect
        x="3"
        y="5"
        width="10"
        height="8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
      <path
        d="M8 2v3M5.5 9h.01M10.5 9h.01M1.5 8v2M14.5 8v2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="8" cy="2" r="0.9" fill="currentColor" />
    </svg>
  )
}
