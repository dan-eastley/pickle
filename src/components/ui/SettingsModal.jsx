import { useState, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'
import useEscapeKey from '../../hooks/useEscapeKey'
import useFocusTrap from '../../hooks/useFocusTrap'
import useDraggable from '../../hooks/useDraggable'
import Button from './Button'
import { CloseIcon } from './icons'

// Reusable settings-modal shell ([EDIT-1]). A left-hand category rail acts as
// tabs — clicking a category shows its section — with a Save Settings / Cancel
// footer in the same format as the New Decision / New Discovery modals.
// Consumers pass `categories` and render a matching <SettingsSection sectionKey=…>.
const ActiveSectionContext = createContext(null)

export function SettingsSection({ sectionKey, title, children }) {
  const active = useContext(ActiveSectionContext)
  // In tabbed mode only the active section renders.
  if (active != null && active !== sectionKey) return null
  return (
    <section data-settings-section={sectionKey}>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export default function SettingsModal({
  title,
  subtitle,
  icon,
  categories = [],
  onClose,
  onSave,
  saving = false,
  error = null,
  saveLabel = 'Save Settings',
  saveDisabled = false,
  dirty = false,
  children,
}) {
  const trapRef = useFocusTrap()
  const { dragHandleProps, style: dragStyle } = useDraggable()
  const [active, setActive] = useState(categories[0]?.key ?? null)

  const requestClose = () => {
    if (dirty && !saving && !window.confirm('Discard your changes?')) return
    onClose()
  }
  useEscapeKey(requestClose)

  return createPortal(
    <>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div className="fixed inset-0 bg-black/30 z-[150]" onClick={requestClose} />
      <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
        <div
          ref={trapRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          style={dragStyle}
          className="bg-white w-full max-w-3xl flex flex-col shadow-xl max-h-[90vh]"
        >
          {/* Header (drag handle) */}
          <div
            {...dragHandleProps}
            className="flex items-start justify-between gap-3 px-5 py-4 bg-brand-50 flex-shrink-0 cursor-move"
          >
            <div className="flex items-start gap-3 min-w-0">
              {icon && (
                <div className="w-8 h-8 bg-white/70 flex items-center justify-center flex-shrink-0">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                {subtitle && (
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{subtitle}</p>
                )}
              </div>
            </div>
            <button
              onClick={requestClose}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white/50 transition-colors flex-shrink-0"
              title="Close (Esc)"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Body: category rail + sections */}
          <div className="flex-1 min-h-0 flex">
            {categories.length > 1 && (
              <nav className="w-44 flex-shrink-0 border-r border-gray-100 py-4 px-2 overflow-y-auto">
                <ul className="space-y-0.5">
                  {categories.map((c) => (
                    <li key={c.key}>
                      <button
                        onClick={() => setActive(c.key)}
                        className={`w-full text-left text-sm px-3 py-1.5 border-l-2 transition-colors ${
                          active === c.key
                            ? 'bg-brand-50 text-brand-700 border-brand-500 font-medium'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent'
                        }`}
                      >
                        {c.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-8">
              <ActiveSectionContext.Provider value={active}>
                {children}
              </ActiveSectionContext.Provider>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={requestClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <Button onClick={onSave} disabled={saving || saveDisabled} size="sm">
              {saving ? 'Saving…' : saveLabel}
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
