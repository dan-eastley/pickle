import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Renders the markdown used in authored and AI-generated decision/document
// content (bold, italics, lists, code, links). Tight spacing so it drops into
// prose, table cells, and list items without extra margins.
const COMPONENTS = {
  p:      ({ node: _node, ...p }) => <p className="mb-2 last:mb-0" {...p} />,
  ul:     ({ node: _node, ...p }) => <ul className="list-disc pl-5 mb-2 last:mb-0 space-y-0.5" {...p} />,
  ol:     ({ node: _node, ...p }) => <ol className="list-decimal pl-5 mb-2 last:mb-0 space-y-0.5" {...p} />,
  strong: ({ node: _node, ...p }) => <strong className="font-semibold text-gray-900" {...p} />,
  code:   ({ node: _node, ...p }) => <code className="font-mono text-[0.85em] bg-gray-100 px-1 py-0.5" {...p} />,
  // Link content is supplied by react-markdown at runtime via {...p}.
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  a:      ({ node: _node, ...p }) => <a className="text-brand-600 hover:underline" target="_blank" rel="noopener noreferrer" {...p} />,
}

export default function Markdown({ children, className = '' }) {
  if (children == null || children === '') return null
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {String(children)}
      </ReactMarkdown>
    </div>
  )
}
