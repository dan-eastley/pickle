import { Expand01, Minimize01 } from '@untitled-ui/icons-react'

// Toolbar button to enter/exit a full-screen view, shared by the catalogue and
// matrix views.
export default function FullscreenToggle({ fullscreen, onToggle }) {
  return (
    <div className="ml-auto flex items-center gap-1">
      <button
        onClick={onToggle}
        title={fullscreen ? 'Exit full screen (Esc)' : 'Full screen'}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
      >
        {fullscreen ? (
          <>
            <Minimize01 className="w-3.5 h-3.5" />
            Exit full screen
          </>
        ) : (
          <>
            <Expand01 className="w-3.5 h-3.5" />
            Full screen
          </>
        )}
      </button>
    </div>
  )
}
