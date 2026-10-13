import React from 'react'

interface LambdaLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  subtext?: string
  className?: string
  variant?: 'color' | 'dark' | 'mono'
  id?: string
}

const HEIGHT_SIZE: Record<string, number> = {
  xs: 24,
  sm: 30,
  md: 38,
  lg: 46,
  xl: 56,
}

export const LambdaMark: React.FC<{
  className?: string
  variant?: 'color' | 'dark' | 'mono'
  gradientId?: string
}> = ({ className = '' }) => {
  return (
    <img
      src="/lambda-navbar-logo.png"
      alt="Lambda"
      className={`object-contain ${className}`}
      style={{ imageRendering: '-webkit-optimize-contrast' }}
    />
  )
}

export const LambdaLogo: React.FC<LambdaLogoProps> = ({
  size = 'md',
  subtext,
  className = '',
}) => {
  const h = HEIGHT_SIZE[size] || 38

  return (
    <div className={`inline-flex select-none items-center gap-3 ${className}`}>
      <img
        src="/lambda-navbar-logo.png"
        alt="Lambda"
        className="w-auto object-contain flex-shrink-0"
        style={{
          height: `${h}px`,
          maxHeight: `${h}px`,
          imageRendering: '-webkit-optimize-contrast',
        }}
      />

      {subtext && (
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#777770] border-l border-[#E5E5DF] pl-2.5">
          {subtext}
        </span>
      )}
    </div>
  )
}

export default LambdaLogo

