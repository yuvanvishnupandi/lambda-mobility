import React, { useRef, useState } from 'react'

interface InteractiveGlowCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  glowColor?: string
}

/**
 * Interactive module card — a neumorphic panel that lifts on hover while an
 * LED-warm glow follows the cursor across its face.
 */
export const InteractiveGlowCard: React.FC<InteractiveGlowCardProps> = ({
  children,
  className = '',
  onClick,
  glowColor = 'rgba(255, 71, 87, 0.1)',
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    setMousePosition(null)
  }

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`u-panel u-panel-hover overflow-hidden ${className}`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
    >
      {/* Subtle mouse-follow glow */}
      {isHovered && mousePosition && (
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(350px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 70%)`,
          }}
        />
      )}

      {/* Card content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default InteractiveGlowCard
