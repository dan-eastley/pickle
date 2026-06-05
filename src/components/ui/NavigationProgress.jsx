import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

// Shows a brief progress bar on route change.
// Uses useLocation (compatible with BrowserRouter) instead of useNavigation
// which requires a data router.
export default function NavigationProgress() {
  const location = useLocation()
  const [width, setWidth] = useState(0)

  useEffect(() => {
    setWidth(40)
    const t1 = setTimeout(() => setWidth(75), 80)
    const t2 = setTimeout(() => setWidth(100), 200)
    const t3 = setTimeout(() => setWidth(0), 380)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [location.pathname])

  if (width === 0) return null

  return (
    <div
      className="fixed top-0 left-0 z-[500] h-0.5 bg-brand-500 transition-[width] duration-150 ease-out"
      style={{ width: `${width}%` }}
    />
  )
}
