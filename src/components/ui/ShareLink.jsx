import { useState } from 'react'

// Copy-the-deep-link control ([UI-11]). Copies the current page URL (which
// already deep-links the artefact, and any selected entity via the query
// string) to the clipboard, with a brief "Copied" confirmation.
export default function ShareLink({ className = '' }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard blocked (insecure context / permissions) — no-op.
    }
  }

  return (
    <button
      onClick={copy}
      title="Copy link to this artefact"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors ${className}`}
    >
      {copied ? (
        <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 20 20" fill="none">
          <path
            d="M4 10l4 4 8-8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none">
          <path
            d="M8 12a3 3 0 004.24 0l2.5-2.5a3 3 0 00-4.24-4.24l-1 1M12 8a3 3 0 00-4.24 0l-2.5 2.5a3 3 0 004.24 4.24l1-1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {copied ? 'Copied' : 'Share'}
    </button>
  )
}
