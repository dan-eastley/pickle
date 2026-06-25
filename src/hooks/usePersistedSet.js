import { useState, useEffect, useRef, useCallback } from 'react'

function read(key) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch {
    return new Set()
  }
}

// A Set persisted to localStorage, used to remember per-page collapse state.
// Reloads when `storageKey` changes (e.g. navigating to another decision or
// switching documents). Returns [set, setSet] where setSet accepts a value or
// an updater, like useState, and writes through to storage.
export default function usePersistedSet(storageKey) {
  const [set, setSetState] = useState(() => read(storageKey))
  const keyRef = useRef(storageKey)

  useEffect(() => {
    if (keyRef.current !== storageKey) {
      keyRef.current = storageKey
      setSetState(read(storageKey))
    }
  }, [storageKey])

  const setSet = useCallback((updater) => {
    setSetState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      try {
        localStorage.setItem(keyRef.current, JSON.stringify([...next]))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  return [set, setSet]
}
