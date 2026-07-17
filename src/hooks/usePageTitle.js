import { useEffect } from 'react'

const DEFAULT_TITLE = 'Pickle - Agentic Architecture as a Service'

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} - Pickle` : DEFAULT_TITLE
    return () => {
      document.title = DEFAULT_TITLE
    }
  }, [title])
}
