import { useRef, useState, useCallback, useEffect } from 'react'

// Makes a modal (or any absolutely/flex-centred element) draggable by a handle
// ([UI-13]). Spread `dragHandleProps` on the header and apply `style` to the
// dialog. Dragging starts only on a plain drag of the handle — clicks on
// buttons/inputs/links inside the handle are ignored so controls still work.
export default function useDraggable() {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const drag = useRef(null)

  const onMouseDown = useCallback(
    (e) => {
      if (e.button !== 0) return
      // Don't hijack interactive controls that may live in the handle.
      if (e.target.closest('button, a, input, select, textarea')) return
      drag.current = {
        startX: e.clientX,
        startY: e.clientY,
        baseX: offset.x,
        baseY: offset.y,
      }
      e.preventDefault()
    },
    [offset]
  )

  useEffect(() => {
    const move = (e) => {
      if (!drag.current) return
      setOffset({
        x: drag.current.baseX + (e.clientX - drag.current.startX),
        y: drag.current.baseY + (e.clientY - drag.current.startY),
      })
    }
    const stop = () => {
      drag.current = null
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', stop)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', stop)
    }
  }, [])

  return {
    dragHandleProps: { onMouseDown },
    style: offset.x || offset.y ? { transform: `translate(${offset.x}px, ${offset.y}px)` } : undefined,
  }
}
