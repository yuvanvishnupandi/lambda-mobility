import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * RouteLoadingBar:
 * Displays a sleek, high-visibility animated gradient line directly at the very top of the viewport
 * whenever the user clicks a link, switches pages, or triggers navigation.
 */
export const RouteLoadingBar: React.FC = () => {
  const location = useLocation()
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const triggerAnimation = () => {
    setIsVisible(true)
    setProgress(20)

    const t1 = setTimeout(() => setProgress(65), 100)
    const t2 = setTimeout(() => setProgress(92), 220)
    const t3 = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsVisible(false)
        setProgress(0)
      }, 250)
    }, 380)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }

  useEffect(() => {
    return triggerAnimation()
  }, [location.pathname, location.search])

  useEffect(() => {
    const handleCustomTrigger = () => triggerAnimation()
    window.addEventListener('trigger-route-loader', handleCustomTrigger)
    return () => window.removeEventListener('trigger-route-loader', handleCustomTrigger)
  }, [])

  if (!isVisible && progress === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none h-[3.5px] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-[#E05238] via-[#F59E0B] via-[#2F7C4E] to-[#2563EB] transition-all duration-200 ease-out shadow-[0_0_12px_rgba(224,82,56,0.8)]"
        style={{
          width: `${progress}%`,
          opacity: isVisible ? 1 : 0,
        }}
      />
    </div>
  )
}

export default RouteLoadingBar
