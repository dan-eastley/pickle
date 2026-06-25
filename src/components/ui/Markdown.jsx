/* eslint-disable jsx-a11y/anchor-has-content, jsx-a11y/heading-has-content -- link/heading content is supplied by react-markdown at runtime via {...p} */
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Renders the markdown used in authored and AI-generated decision/discovery and
// document content. Beyond inline marks (bold, italics, code, links) it styles
// the block elements an AI-authored document actually uses — headings, tables,
// blockquotes, rules — so a findings field reads like a formatted document
// rather than a wall of text. Spacing stays tight so it still drops cleanly into
// prose, table cells, and list items.
const COMPONENTS = {
  h1: ({ node: _node, ...p }) => (
    <h1 className="text-lg font-bold text-gray-900 mt-5 mb-2 first:mt-0" {...p} />
  ),
  h2: ({ node: _node, ...p }) => (
    <h2 className="text-base font-bold text-gray-900 mt-5 mb-2 first:mt-0" {...p} />
  ),
  h3: ({ node: _node, ...p }) => (
    <h3 className="text-sm font-semibold text-gray-900 mt-4 mb-1.5 first:mt-0" {...p} />
  ),
  h4: ({ node: _node, ...p }) => (
    <h4 className="text-sm font-semibold text-gray-700 mt-3 mb-1 first:mt-0" {...p} />
  ),
  p: ({ node: _node, ...p }) => <p className="mb-2 last:mb-0 leading-relaxed" {...p} />,
  ul: ({ node: _node, ...p }) => (
    <ul className="list-disc pl-5 mb-2 last:mb-0 space-y-0.5" {...p} />
  ),
  ol: ({ node: _node, ...p }) => (
    <ol className="list-decimal pl-5 mb-2 last:mb-0 space-y-0.5" {...p} />
  ),
  strong: ({ node: _node, ...p }) => <strong className="font-semibold text-gray-900" {...p} />,
  em: ({ node: _node, ...p }) => <em className="italic" {...p} />,
  blockquote: ({ node: _node, ...p }) => (
    <blockquote className="border-l-4 border-gray-200 pl-4 my-2 text-gray-600 italic" {...p} />
  ),
  hr: ({ node: _node, ...p }) => <hr className="my-4 border-gray-200" {...p} />,
  code: ({ node: _node, ...p }) => (
    <code className="font-mono text-[0.85em] bg-gray-100 px-1 py-0.5" {...p} />
  ),
  pre: ({ node: _node, ...p }) => (
    <pre
      className="my-2 p-3 bg-gray-50 border border-gray-200 text-xs text-gray-700 font-mono overflow-x-auto whitespace-pre leading-relaxed [&_code]:bg-transparent [&_code]:p-0"
      {...p}
    />
  ),
  // Tables — bordered, zebra header, matching the document table styling.
  table: ({ node: _node, ...p }) => (
    <div className="my-3 overflow-x-auto border border-gray-200">
      <table className="w-full text-sm border-collapse" {...p} />
    </div>
  ),
  thead: ({ node: _node, ...p }) => <thead className="bg-gray-50" {...p} />,
  tr: ({ node: _node, ...p }) => <tr className="border-b border-gray-100 last:border-0" {...p} />,
  th: ({ node: _node, ...p }) => (
    <th
      className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide align-top"
      {...p}
    />
  ),
  td: ({ node: _node, ...p }) => (
    <td className="px-3 py-2 text-gray-700 align-top break-words" {...p} />
  ),
  // Link content is supplied by react-markdown at runtime via {...p}.
  a: ({ node: _node, ...p }) => (
    <a
      className="text-brand-600 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      {...p}
    />
  ),
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
