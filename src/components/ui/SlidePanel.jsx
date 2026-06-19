import { createPortal } from 'react-dom'
import useEscapeKey from '../../hooks/useEscapeKey'

export default function SlidePanel({ open, onClose, title, subtitle, children }) {
  useEscapeKey(onClose, open)

  return createPortal(
    <>
      {open && (
        <div
          className="fixed inset-0 z-[150] bg-black/10"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full z-[151] w-96 bg-white border-l border-gray-200 shadow-2xl flex flex-col transition-transform duration-200 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-start justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="min-w-0 pr-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-gray-500 truncate">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </>,
    document.body
  )
}
