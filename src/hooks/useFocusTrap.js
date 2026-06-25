import { useEffect, useRef } from 'react'

// Traps Tab focus within the returned ref's element while `active`, and returns
// focus to whatever was focused before it opened when it unmounts. Apply to
// modal/slide-panel surfaces for keyboard accessibility.
export default function useFocusTrap(active = true) {
  const ref = useRef(null)

  useEffect(() => {
    if (!active) return
    const node = ref.current
    if (!node) return
    const previouslyFocused = document.activeElement

    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',')

    function onKeyDown(e) {
      if (e.key !== 'Tab') return
      const focusable = [...node.querySelectorAll(selector)].filter(
        (el) => el.offsetParent !== null
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    node.addEventListener('keydown', onKeyDown)
    return () => {
      node.removeEventListener('keydown', onKeyDown)
      if (previouslyFocused && typeof previouslyFocused.focus === 'function')
        previouslyFocused.focus()
    }
  }, [active])

  return ref
}
