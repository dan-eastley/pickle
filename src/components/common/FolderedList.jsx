import { useState } from 'react'
import { CloseIcon, PlusIcon } from '../ui/icons'

// UI-8 — organise a list of items into nested folders (max 3 levels) with
// drag-and-drop. `items` is [{ id, node }] where `node` renders the item.
// `controller` is a folder controller (useServerFolders / useFolders) that owns
// the folder state and persistence — this component is agnostic to where
// folders are stored.
export default function FolderedList({ controller, items, itemLabel = 'item' }) {
  const f = controller
  const [collapsed, setCollapsed] = useState(new Set())
  const [renamingId, setRenamingId] = useState(null)
  const [drop, setDrop] = useState(null) // folderId hovered as a drop target ('' = root)

  const childFolders = (parentId) => f.folders.filter((x) => x.parentId === parentId)
  const itemsIn = (folderId) =>
    items.filter((it) => (f.assign[it.id] ?? null) === (folderId ?? null))

  const toggle = (id) =>
    setCollapsed((s) => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })

  // ── Drag and drop ──
  const onDragStart = (e, kind, id) => {
    e.dataTransfer.setData('kind', kind)
    e.dataTransfer.setData('id', id)
    e.dataTransfer.effectAllowed = 'move'
  }
  const onDrop = (e, folderId) => {
    e.preventDefault()
    e.stopPropagation()
    setDrop(null)
    const kind = e.dataTransfer.getData('kind')
    const id = e.dataTransfer.getData('id')
    if (!id) return
    if (kind === 'item') f.assignItem(id, folderId)
    else if (kind === 'folder') f.moveFolder(id, folderId)
  }
  const dropProps = (folderId) => ({
    onDragOver: (e) => {
      e.preventDefault()
      e.stopPropagation()
      setDrop(folderId ?? '')
    },
    onDragLeave: () => setDrop(null),
    onDrop: (e) => onDrop(e, folderId),
  })

  const renderItem = (it) => (
    <div
      key={it.id}
      draggable
      onDragStart={(e) => onDragStart(e, 'item', it.id)}
      className="cursor-move"
      title="Drag to a folder"
    >
      {it.node}
    </div>
  )

  const renderFolder = (folder, depth) => {
    const open = !collapsed.has(folder.id)
    const subs = childFolders(folder.id)
    const own = itemsIn(folder.id)
    const canNest = f.depthOf(folder.id) < f.maxDepth
    const active = drop === folder.id
    return (
      <div key={folder.id} className="mt-2">
        <div
          {...dropProps(folder.id)}
          draggable
          onDragStart={(e) => onDragStart(e, 'folder', folder.id)}
          className={`flex items-center gap-2 px-2 py-1.5 border ${active ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-gray-50'} transition-colors`}
        >
          <button
            onClick={() => toggle(folder.id)}
            className="text-gray-400 hover:text-gray-600"
            aria-label={open ? 'Collapse' : 'Expand'}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              className={`w-3.5 h-3.5 ${open ? 'rotate-90' : ''}`}
            >
              <path
                d="M6 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-gray-400 flex-shrink-0">
            <path
              d="M1.5 4.5h4l1.5 2h7.5v6.5h-13z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
          {renamingId === folder.id ? (
            <input
              // eslint-disable-next-line jsx-a11y/no-autofocus -- focus the rename field when it appears
              autoFocus
              defaultValue={folder.name}
              onBlur={(e) => {
                f.renameFolder(folder.id, e.target.value.trim() || folder.name)
                setRenamingId(null)
              }}
              onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
              className="flex-1 min-w-0 text-sm px-1 py-0.5 border border-gray-300 focus:outline-none"
            />
          ) : (
            <button
              onDoubleClick={() => setRenamingId(folder.id)}
              className="flex-1 min-w-0 text-left text-sm font-medium text-gray-800 truncate"
              title="Double-click to rename"
            >
              {folder.name}
            </button>
          )}
          <span className="text-[11px] text-gray-400 tabular-nums">{own.length}</span>
          {canNest && (
            <button
              onClick={() => f.createFolder('New folder', folder.id)}
              className="text-gray-400 hover:text-brand-600"
              title="Add subfolder"
            >
              <PlusIcon className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => f.deleteFolder(folder.id)}
            className="text-gray-400 hover:text-error-600"
            title="Delete folder (items become unfiled)"
          >
            <CloseIcon className="w-3.5 h-3.5" />
          </button>
        </div>
        {open && (
          <div className="ml-4">
            {subs.map((s) => renderFolder(s, depth + 1))}
            <div className="mt-1 space-y-1">{own.map(renderItem)}</div>
          </div>
        )}
      </div>
    )
  }

  const roots = childFolders(null)
  const unfiled = itemsIn(null)

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-400">Drag a {itemLabel} onto a folder to file it.</p>
        <button
          onClick={() => f.createFolder('New folder', null)}
          className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700"
        >
          <PlusIcon className="w-4 h-4" />
          New folder
        </button>
      </div>

      {roots.map((folder) => renderFolder(folder, 0))}

      {/* Unfiled — also the drop target for moving an item/folder back to root */}
      <div
        {...dropProps(null)}
        className={`mt-3 border border-dashed p-2 ${drop === '' ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}
      >
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 px-1">
          Unfiled
        </p>
        {unfiled.length === 0 ? (
          <p className="px-1 py-2 text-xs text-gray-400">Everything is filed.</p>
        ) : (
          <div className="space-y-1">{unfiled.map(renderItem)}</div>
        )}
      </div>
    </div>
  )
}
