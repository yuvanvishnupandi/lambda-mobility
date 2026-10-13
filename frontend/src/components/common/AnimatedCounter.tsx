import React, { useState, useEffect, useRef } from 'react'

interface AnimatedCounterProps {
  value: string | number
  duration?: number
  className?: string
}

/**
 * Counts up to a numeric value (immediately when already on screen, otherwise
 * once it scrolls into view), then keeps tracking live updates such as
demo-mode telemetry tiles.
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1800,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<string>('0')
  const elementRef = useRef<HTMLSpanElement>(null)
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    // Parse value into number + prefix + suffix + decimals + comma formatted
    const rawStr = value.toString().trim()
    const numericMatch = rawStr.match(/([0-9,.]+)/)

    if (!numericMatch) {
      setDisplayValue(rawStr)
      return
    }

    const matchedStr = numericMatch[0]
    const cleanNumStr = matchedStr.replace(/,/g, '')
    const targetNumber = parseFloat(cleanNumStr)

    if (isNaN(targetNumber)) {
      setDisplayValue(rawStr)
      return
    }

    // Live value changed after the intro animation finished — snap to it.
    if (hasAnimatedRef.current) {
      setDisplayValue(rawStr)
      return
    }

    let animationFrame = 0
    let cancelled = false

    const runCountUp = () => {
      const startTime = performance.now()

      const animate = (currentTime: number) => {
        if (cancelled) return
        const elapsed = currentTime - startTime
        const progress = Math.min(1, elapsed / duration)

        // Smooth ease out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3)
        const currentNum = targetNumber * easeOut

        let formattedNumber = currentNum.toFixed(
          cleanNumStr.includes('.') ? cleanNumStr.split('.')[1].length : 0
        )

        if (matchedStr.includes(',')) {
          const parts = formattedNumber.split('.')
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          formattedNumber = parts.join('.')
        }

        setDisplayValue(formattedNumber)

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        } else {
          // Final exact string
          setDisplayValue(rawStr)
        }
      }

      animationFrame = requestAnimationFrame(animate)
    }

    const start = () => {
      if (hasAnimatedRef.current) return
      hasAnimatedRef.current = true
      runCountUp()
    }

    // Already on screen (or observation is unavailable) — start straight away
    // so the figure is never left sitting at zero.
    const rect = elementRef.current?.getBoundingClientRect()
    const isOnScreen =
      !!rect && rect.top < window.innerHeight && rect.bottom > 0

    if (isOnScreen || typeof IntersectionObserver === 'undefined') {
      start()
      return () => {
        cancelled = true
        if (animationFrame) cancelAnimationFrame(animationFrame)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) start()
      },
      { threshold: 0.15 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      cancelled = true
      if (animationFrame) cancelAnimationFrame(animationFrame)
      observer.disconnect()
    }
  }, [value, duration])

  return (
    <span ref={elementRef} className={className}>
      {displayValue}
    </span>
  )
}
