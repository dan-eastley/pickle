// Small "Expand all · Collapse all" control used on index pages with
// collapsible groups.
export default function ExpandCollapseAll({ onExpandAll, onCollapseAll, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button onClick={onExpandAll} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Expand all</button>
      <span className="text-gray-300">·</span>
      <button onClick={onCollapseAll} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Collapse all</button>
    </div>
  )
}
