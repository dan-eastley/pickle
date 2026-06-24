import { useRef, useEffect } from 'react'

// A textarea that starts at `minRows` lines and grows to fit its content,
// so authors aren't boxed into a fixed height. Used for the Context / Problem /
// Proposal / Request fields on decision and discovery forms.
export default function AutoGrowTextarea({ value, onChange, minRows = 2, className = '', ...rest }) {
  const ref = useRef(null)

  function resize(el) {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  // Resize on mount and whenever the value changes (covers programmatic updates,
  // e.g. pre-populating the editor in edit mode).
  useEffect(() => { resize(ref.current) }, [value])

  return (
    <textarea
      ref={ref}
      rows={minRows}
      value={value}
      onChange={e => { resize(e.target); onChange(e) }}
      className={`resize-none overflow-hidden ${className}`}
      {...rest}
    />
  )
}
