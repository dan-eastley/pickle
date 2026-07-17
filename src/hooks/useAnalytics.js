import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Send a Google Analytics page_view on every client-side route change (the
// gtag config sets send_page_view:false so navigations aren't missed). No-ops
// when gtag isn't present (e.g. blocked, or a non-configured environment).
export default function useAnalytics() {
  const location = useLocation()
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
    const path = location.pathname + location.search
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [location.pathname, location.search])
}
