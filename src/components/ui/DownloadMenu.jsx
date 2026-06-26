import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from './icons'
import Spinner from './Spinner'
import useEscapeKey from '../../hooks/useEscapeKey'

function DownloadGlyph({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2v8m0 0L5 7m3 3l3-3M3 13h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Small "Download ▾" split menu. `options` is an array of
// { label, sublabel?, onSelect } — onSelect may return a Promise; the menu shows
// a spinner until it settles. Used by catalogue, diagram, and document views.
export default function DownloadMenu({ options, label = 'Download', align = 'right' }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const ref = useRef(null)
  useEscapeKey(() => setOpen(false), open)

  useEffect(() => {
    if (!open) return
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const run = async (option) => {
    setOpen(false)
    try {
      setBusy(true)
      await option.onSelect()
    } catch (err) {
      console.error('[download]', err)
      window.alert(`Download failed: ${err.message ?? err}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={busy}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors disabled:opacity-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {busy ? <Spinner size="sm" /> : <DownloadGlyph />}
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute z-30 mt-1 min-w-[12rem] bg-white border border-gray-200 shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {options.map((option) => (
            <button
              key={option.label}
              role="menuitem"
              onClick={() => run(option)}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex flex-col"
            >
              <span className="text-sm text-gray-800">{option.label}</span>
              {option.sublabel && (
                <span className="text-xs text-gray-400 mt-0.5">{option.sublabel}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
