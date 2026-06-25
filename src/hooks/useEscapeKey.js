import { useEffect } from 'react'

// Calls `handler` when Escape is pressed, while `active` is true.
// Replaces the repeated keydown add/remove effect across modals, panels,
// and full-screen views.
export default function useEscapeKey(handler, active = true) {
  useEffect(() => {
    if (!active) return
    const onKey = (e) => {
      if (e.key === 'Escape') handler()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [handler, active])
}
