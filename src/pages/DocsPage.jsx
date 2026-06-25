import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Spinner from '../components/ui/Spinner'
import TextLink from '../components/ui/TextLink'

function resolveDocLink(href, currentPath) {
  if (!href) return href
  if (href.startsWith('http://') || href.startsWith('https://')) return href
  if (href.startsWith('/')) return href

  // Strip .md extension and resolve relative to current doc's directory
  const clean = href.replace(/\.md$/, '')
  if (clean.startsWith('#')) return clean

  const currentDir = currentPath.includes('/')
    ? currentPath.slice(0, currentPath.lastIndexOf('/'))
    : ''

  const parts = (currentDir ? `${currentDir}/${clean}` : clean).split('/')
  const resolved = []
  for (const part of parts) {
    if (part === '..') resolved.pop()
    else if (part && part !== '.') resolved.push(part)
  }
  return `/docs/${resolved.join('/')}`
}

function MermaidBlock({ children }) {
  return (
    <div className="my-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-sm text-gray-500">
      <div className="mb-2 font-medium text-gray-400">Mermaid diagram</div>
      <pre className="text-left text-xs text-gray-400 overflow-auto">{children}</pre>
    </div>
  )
}

function MarkdownComponents(currentPath) {
  return {
    a({ href, children }) {
      const resolved = resolveDocLink(href, currentPath)
      if (resolved?.startsWith('/docs/')) {
        return <TextLink to={resolved}>{children}</TextLink>
      }
      return (
        <TextLink href={resolved} target="_blank" rel="noreferrer">
          {children}
        </TextLink>
      )
    },
    code({ className, children, ...props }) {
      const lang = (className ?? '').replace('language-', '')
      if (lang === 'mermaid') {
        return <MermaidBlock>{children}</MermaidBlock>
      }
      const inline = !className
      return inline
        ? <code className="px-1 py-0.5 rounded bg-gray-100 text-sm font-mono text-gray-800" {...props}>{children}</code>
        : <code className="block overflow-auto text-sm font-mono" {...props}>{children}</code>
    },
    pre({ children }) {
      return (
        <pre className="my-4 rounded-lg bg-gray-900 text-gray-100 p-4 overflow-auto text-sm leading-relaxed">
          {children}
        </pre>
      )
    },
    h1({ children }) {
      return <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-0">{children}</h1>
    },
    h2({ children }) {
      return <h2 className="text-xl font-semibold text-gray-900 mb-3 mt-8 pb-2 border-b border-gray-200">{children}</h2>
    },
    h3({ children }) {
      return <h3 className="text-base font-semibold text-gray-900 mb-2 mt-6">{children}</h3>
    },
    p({ children }) {
      return <p className="text-sm text-gray-700 leading-relaxed mb-4">{children}</p>
    },
    ul({ children }) {
      return <ul className="list-disc pl-5 mb-4 space-y-1 text-sm text-gray-700">{children}</ul>
    },
    ol({ children }) {
      return <ol className="list-decimal pl-5 mb-4 space-y-1 text-sm text-gray-700">{children}</ol>
    },
    li({ children }) {
      return <li className="leading-relaxed">{children}</li>
    },
    table({ children }) {
      return (
        <div className="my-4 overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">{children}</table>
        </div>
      )
    },
    thead({ children }) {
      return <thead className="bg-gray-50">{children}</thead>
    },
    th({ children }) {
      return <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{children}</th>
    },
    td({ children }) {
      return <td className="px-4 py-3 text-gray-700 border-t border-gray-100">{children}</td>
    },
    blockquote({ children }) {
      return (
        <blockquote className="my-4 border-l-4 border-brand-300 pl-4 text-gray-600 text-sm">
          {children}
        </blockquote>
      )
    },
    hr() {
      return <hr className="my-6 border-gray-200" />
    },
  }
}

export default function DocsPage() {
  const { '*': docPath } = useParams()
  const navigate = useNavigate()
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!docPath) {
      navigate('/docs/index', { replace: true })
      return
    }
    setLoading(true)
    setNotFound(false)
    setContent(null)

    fetch(`/api/docs/${docPath}.md`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null }
        if (!r.ok) throw new Error(`Failed to load doc: ${r.status}`)
        return r.text()
      })
      .then(text => {
        if (text !== null) setContent(text)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docPath])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-medium text-gray-500">Page not found</p>
        <p className="mt-1 text-xs text-gray-400">{docPath}</p>
      </div>
    )
  }

  return (
    <article className="prose-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={MarkdownComponents(docPath ?? '')}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
