import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import useEscapeKey from '../../hooks/useEscapeKey'
import useFocusTrap from '../../hooks/useFocusTrap'

export default function SlidePanel({ open, onClose, title, subtitle, children }) {
  useEscapeKey(onClose, open)
  // Trap Tab within the panel while open and restore focus to the trigger on
  // close. The panel stays mounted (off-screen) when closed, so mark it `inert`
  // to keep its controls out of the tab order, and move focus in on open.
  const panelRef = useFocusTrap(open)
  useEffect(() => {
    const node = panelRef.current
    if (!node) return
    node.inert = !open
    if (open) node.focus()
  }, [open, panelRef])

  return createPortal(
    <>
      {open && (
        // Backdrop: clicking dismisses the panel; keyboard users dismiss with
        // Escape (see useEscapeKey above).
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
        <div className="fixed inset-0 z-[150] bg-black/10" onClick={onClose} />
      )}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Details'}
        aria-hidden={!open}
        tabIndex={-1}
        className={`fixed top-0 right-0 h-full z-[151] w-96 bg-white border-l border-gray-200 shadow-2xl flex flex-col transition-transform duration-200 ease-in-out focus:outline-none ${
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
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>,
    document.body
  )
}
