import { useEffect, useRef } from 'react'

// Calls `handler` when a mousedown lands outside the referenced element, while
// `active` is true. Replaces the repeated outside-click effect across the
// dropdown / menu / picker components. The latest handler is read via a ref so
// the listener subscribes once (not on every render).
export default function useClickOutside(elementRef, handler, active = true) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    if (!active) return
    function onPointerDown(e) {
      const el = elementRef.current
      if (el && !el.contains(e.target)) handlerRef.current(e)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [elementRef, active])
}
