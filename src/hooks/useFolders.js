import { useCallback, useEffect, useState } from 'react'

// UI-8 — lightweight folder organisation for a list (decisions / discoveries).
//
// MVP persistence is client-side (localStorage) keyed per client/version/kind;
// promoting this to the architecture index (a `folders` array + `folderPath` on
// each entry, written through the API) is the documented next step. The tree is
// flat — folders carry a `parentId` — with a hard 3-level depth cap, and item
// assignments are an id → folderId map.

const MAX_DEPTH = 3
let counter = 0
const newId = () => `f${Date.now().toString(36)}${(counter++).toString(36)}`

function load(key) {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return { folders: [], assign: {} }
}

export default function useFolders(key) {
  const [state, setState] = useState(() => load(key))

  // Reload when the storage key (client/version/kind) changes.
  useEffect(() => {
    setState(load(key))
  }, [key])

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      /* ignore quota / disabled storage */
    }
  }, [key, state])

  const depthOf = useCallback((folders, id) => {
    let d = 1
    let cur = folders.find((f) => f.id === id)
    while (cur?.parentId) {
      d++
      cur = folders.find((f) => f.id === cur.parentId)
    }
    return d
  }, [])

  const createFolder = useCallback(
    (name, parentId = null) => {
      setState((s) => {
        if (parentId && depthOf(s.folders, parentId) >= MAX_DEPTH) return s
        return {
          ...s,
          folders: [...s.folders, { id: newId(), name: name || 'New folder', parentId }],
        }
      })
    },
    [depthOf]
  )

  const renameFolder = useCallback((id, name) => {
    setState((s) => ({
      ...s,
      folders: s.folders.map((f) => (f.id === id ? { ...f, name } : f)),
    }))
  }, [])

  // Delete a folder (and its descendants); their items fall back to unfiled.
  const deleteFolder = useCallback((id) => {
    setState((s) => {
      const doomed = new Set([id])
      let grew = true
      while (grew) {
        grew = false
        for (const f of s.folders) {
          if (f.parentId && doomed.has(f.parentId) && !doomed.has(f.id)) {
            doomed.add(f.id)
            grew = true
          }
        }
      }
      const assign = Object.fromEntries(
        Object.entries(s.assign).filter(([, fid]) => !doomed.has(fid))
      )
      return { folders: s.folders.filter((f) => !doomed.has(f.id)), assign }
    })
  }, [])

  // Move a folder under a new parent (null = root), respecting the depth cap and
  // preventing cycles.
  const moveFolder = useCallback(
    (id, parentId) => {
      setState((s) => {
        if (id === parentId) return s
        // No moving into own descendant.
        let cur = parentId ? s.folders.find((f) => f.id === parentId) : null
        while (cur) {
          if (cur.id === id) return s
          cur = cur.parentId ? s.folders.find((f) => f.id === cur.parentId) : null
        }
        if (parentId && depthOf(s.folders, parentId) >= MAX_DEPTH) return s
        return { ...s, folders: s.folders.map((f) => (f.id === id ? { ...f, parentId } : f)) }
      })
    },
    [depthOf]
  )

  // Assign an item to a folder (null = unfiled).
  const assignItem = useCallback((itemId, folderId) => {
    setState((s) => {
      const assign = { ...s.assign }
      if (folderId) assign[itemId] = folderId
      else delete assign[itemId]
      return { ...s, assign }
    })
  }, [])

  return {
    folders: state.folders,
    assign: state.assign,
    createFolder,
    renameFolder,
    deleteFolder,
    moveFolder,
    assignItem,
    maxDepth: MAX_DEPTH,
    depthOf: (id) => depthOf(state.folders, id),
  }
}
