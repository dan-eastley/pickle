import { useState, useEffect } from 'react'

// Tracks which section is currently in view for a sticky contents nav.
// `refsRef` is a ref whose `.current` maps section keys to elements carrying a
// `data-section` attribute. `deps` re-establishes the observer when the
// observed set changes. Returns [activeKey, setActiveKey].
export default function useActiveSection(refsRef, deps = []) {
  const [activeKey, setActiveKey] = useState(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveKey(entry.target.dataset.section)
        }
      },
      { rootMargin: '-10% 0px -75% 0px' }
    )
    Object.values(refsRef.current).forEach((el) => {
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return [activeKey, setActiveKey]
}
