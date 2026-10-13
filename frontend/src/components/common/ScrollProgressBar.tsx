import { useState, useEffect } from 'react'

/** Scroll progress: a safety-orange filament sliding along the top rail. */
export const ScrollProgressBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop || document.body.scrollTop
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      if (windowHeight > 0) {
        const progress = Math.min(100, Math.max(0, (totalScroll / windowHeight) * 100))
        setScrollProgress(progress)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[3px] bg-surface-3 shadow-recessed" aria-hidden="true">
      <div
        className="h-full rounded-r-full bg-brand-500 transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%`, boxShadow: '0 0 10px rgba(255,71,87,0.65), inset 0 1px 0 rgba(255,255,255,0.35)' }}
      />
    </div>
  )
}

export default ScrollProgressBar
