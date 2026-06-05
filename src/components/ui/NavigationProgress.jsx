import { useEffect, useState } from 'react'
import { useNavigation } from 'react-router-dom'

export default function NavigationProgress() {
  const navigation = useNavigation()
  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (navigation.state !== 'idle') {
      setVisible(true)
      setWidth(35)
      const t1 = setTimeout(() => setWidth(65), 150)
      const t2 = setTimeout(() => setWidth(80), 500)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    } else if (visible) {
      setWidth(100)
      const t = setTimeout(() => { setVisible(false); setWidth(0) }, 250)
      return () => clearTimeout(t)
    }
  }, [navigation.state])

  if (!visible) return null

  return (
    <div
      className="fixed top-0 left-0 z-[500] h-0.5 bg-brand-500 transition-all duration-200 ease-out"
      style={{ width: `${width}%` }}
    />
  )
}
