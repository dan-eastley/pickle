import { useState } from 'react'
import { createPortal } from 'react-dom'
import useEscapeKey from '../../hooks/useEscapeKey'

export default function JsonPreview({ data, label = 'JSON', docUrl, prUrl }) {
  const [open, setOpen] = useState(false)

  useEscapeKey(() => setOpen(false), open)

  if (!data) return null

  return (
    <>
      {/* Floating toolbar — fixed bottom-right */}
      <div className="fixed bottom-4 right-4 z-[50] flex items-center gap-2">
        {prUrl && (
          <a
            href={prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-gray-200 text-xs font-mono hover:bg-gray-600 transition-colors shadow-lg"
            title="Open the pull request on GitHub"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 3.5v9M4 3.5a1.5 1.5 0 100-.001zM4 12.5a1.5 1.5 0 100 .001zM12 7.5v-2a2 2 0 00-2-2H8m4 4a1.5 1.5 0 100 .001z"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            View PR
            <svg className="w-2.5 h-2.5 opacity-60" viewBox="0 0 10 10" fill="none">
              <path
                d="M2 8L8 2M4 2h4v4"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="square"
              />
            </svg>
          </a>
        )}
        {docUrl && (
          <a
            href={docUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 text-gray-200 text-xs font-mono hover:bg-gray-500 transition-colors shadow-lg"
            title="Open schema documentation"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 2h10v10H2zM5 7h4M7 5v4"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="square"
              />
            </svg>
            Schema Docs
            <svg className="w-2.5 h-2.5 opacity-60" viewBox="0 0 10 10" fill="none">
              <path
                d="M2 8L8 2M4 2h4v4"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="square"
              />
            </svg>
          </a>
        )}
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-gray-200 text-xs font-mono hover:bg-gray-700 transition-colors shadow-lg"
          title="View raw JSON"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 4l3 3-3 3M6 10h7"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="square"
            />
          </svg>
          {label}
        </button>
      </div>

      {/* Full-screen overlay */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[200] bg-gray-900 flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 bg-gray-800 border-b border-gray-700 flex-shrink-0">
              <span className="text-xs font-mono text-gray-400">{label} — raw JSON</span>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Close (Esc)"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M5 5l10 10M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="square"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-5">
              <pre className="text-xs text-green-400 font-mono leading-relaxed">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
