import { useCallback, useEffect, useState } from 'react'
import * as ops from '../lib/folders'
import { githubAction } from '../lib/api'

// UI-8 server persistence — folder organisation stored in the decisions /
// discovery index (a `folders` tree + per-entry `folderId`). Seeded from the
// loaded index; every mutation optimistically updates and persists the full
// folder state via the `set-folders` API action. Same interface as the local
// useFolders hook, so FolderedList is agnostic to where folders live.
export default function useServerFolders(clientId, versionId, kind, seed) {
  const [state, setState] = useState(seed)

  // Re-seed when the loaded index changes (e.g. the first fetch resolves).
  const seedKey = JSON.stringify(seed)
  useEffect(() => {
    setState(seed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedKey])

  const persist = useCallback(
    (next) => {
      githubAction({
        action: 'set-folders',
        clientId,
        versionId,
        kind,
        folders: next.folders,
        assignments: next.assign,
      }).catch(() => {
        /* optimistic — a later mutation re-persists the full state */
      })
    },
    [clientId, versionId, kind]
  )

  const mutate = useCallback(
    (fn) => {
      setState((prev) => {
        const next = fn(prev)
        if (next !== prev) persist(next)
        return next
      })
    },
    [persist]
  )

  return {
    folders: state.folders,
    assign: state.assign,
    createFolder: (name, parentId) => mutate((s) => ops.addFolder(s, name, parentId)),
    renameFolder: (id, name) => mutate((s) => ops.renameFolder(s, id, name)),
    deleteFolder: (id) => mutate((s) => ops.deleteFolder(s, id)),
    moveFolder: (id, parentId) => mutate((s) => ops.moveFolder(s, id, parentId)),
    assignItem: (itemId, folderId) => mutate((s) => ops.assignItem(s, itemId, folderId)),
    maxDepth: ops.MAX_DEPTH,
    depthOf: (id) => ops.depthOf(state.folders, id),
  }
}
