import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

// State backed by a URL query parameter, so it is shareable, survives refresh,
// and is restorable from a deep link. Returns [value, setValue] where setValue
// accepts a string (sets the param) or null/undefined (removes it). Uses
// `replace` so rapid changes (e.g. clicking through an entity panel) don't
// flood the history stack.
export default function useSearchParamState(key) {
  const [params, setParams] = useSearchParams()
  const value = params.get(key)

  const setValue = useCallback(
    (next) => {
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev)
          if (next == null || next === '') out.delete(key)
          else out.set(key, next)
          return out
        },
        { replace: true }
      )
    },
    [key, setParams]
  )

  return [value, setValue]
}
