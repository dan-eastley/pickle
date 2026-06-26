// Pure folder-tree operations shared by the local (useFolders) and server
// (useServerFolders) persistence hooks. State shape: { folders: [{id, name,
// parentId}], assign: { itemId: folderId } }. The tree is flat via parentId,
// capped at MAX_DEPTH levels.

export const MAX_DEPTH = 3

let counter = 0
export const newFolderId = () => `f${Date.now().toString(36)}${(counter++).toString(36)}`

export function depthOf(folders, id) {
  let d = 1
  let cur = folders.find((f) => f.id === id)
  while (cur?.parentId) {
    d++
    cur = folders.find((f) => f.id === cur.parentId)
  }
  return d
}

export function addFolder(state, name, parentId = null) {
  if (parentId && depthOf(state.folders, parentId) >= MAX_DEPTH) return state
  return {
    ...state,
    folders: [...state.folders, { id: newFolderId(), name: name || 'New folder', parentId }],
  }
}

export function renameFolder(state, id, name) {
  return { ...state, folders: state.folders.map((f) => (f.id === id ? { ...f, name } : f)) }
}

// Delete a folder and its descendants; their items become unfiled.
export function deleteFolder(state, id) {
  const doomed = new Set([id])
  let grew = true
  while (grew) {
    grew = false
    for (const f of state.folders) {
      if (f.parentId && doomed.has(f.parentId) && !doomed.has(f.id)) {
        doomed.add(f.id)
        grew = true
      }
    }
  }
  const assign = Object.fromEntries(
    Object.entries(state.assign).filter(([, fid]) => !doomed.has(fid))
  )
  return { folders: state.folders.filter((f) => !doomed.has(f.id)), assign }
}

// Move a folder under a new parent (null = root), respecting the depth cap and
// preventing cycles.
export function moveFolder(state, id, parentId) {
  if (id === parentId) return state
  let cur = parentId ? state.folders.find((f) => f.id === parentId) : null
  while (cur) {
    if (cur.id === id) return state // would create a cycle
    cur = cur.parentId ? state.folders.find((f) => f.id === cur.parentId) : null
  }
  if (parentId && depthOf(state.folders, parentId) >= MAX_DEPTH) return state
  return { ...state, folders: state.folders.map((f) => (f.id === id ? { ...f, parentId } : f)) }
}

export function assignItem(state, itemId, folderId) {
  const assign = { ...state.assign }
  if (folderId) assign[itemId] = folderId
  else delete assign[itemId]
  return { ...state, assign }
}
