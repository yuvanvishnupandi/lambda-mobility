import React, { useEffect, useRef, useState } from 'react'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  threshold?: number
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  threshold = 0.1,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const domRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const current = domRef.current

    // Reveal content when already in view, or when observation is unavailable,
    // so nothing can be left permanently hidden.
    const rect = current?.getBoundingClientRect()
    const isOnScreen = !!rect && rect.top < window.innerHeight && rect.bottom > 0

    if (isOnScreen || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            if (current) observer.unobserve(current)
          }
        })
      },
      { threshold }
    )

    if (current) {
      observer.observe(current)
    }

    return () => {
      if (current) observer.unobserve(current)
    }
  }, [threshold])

  let transformClass = ''
  if (!isVisible) {
    if (direction === 'up') transformClass = 'translate-y-6 opacity-0 scale-[0.98]'
    else if (direction === 'down') transformClass = '-translate-y-6 opacity-0 scale-[0.98]'
    else if (direction === 'left') transformClass = 'translate-x-6 opacity-0'
    else if (direction === 'right') transformClass = '-translate-x-6 opacity-0'
    else transformClass = 'opacity-0 scale-[0.98]'
  } else {
    transformClass = 'translate-y-0 translate-x-0 opacity-100 scale-100'
  }

  return (
    <div
      ref={domRef}
      style={{
        transitionDuration: '700ms',
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      className={`transition-all ${transformClass} ${className}`}
    >
      {children}
    </div>
  )
}
