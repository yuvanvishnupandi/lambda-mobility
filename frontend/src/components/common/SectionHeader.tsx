import React from 'react'

interface SectionHeaderProps {
  /** small uppercase overline label */
  eyebrow?: string
  title: string
  description?: string
  aside?: React.ReactNode
  align?: 'left' | 'center'
  className?: string
  /** larger editorial scale for landing-page sections */
  size?: 'md' | 'lg'
}

/**
 * Editorial section intro — stamped overline, embossed headline and optional
 * aside. Used to break the "everything is a card" repetition.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  aside,
  align = 'left',
  className = '',
  size = 'md',
}) => {
  const isCenter = align === 'center'

  return (
    <div
      className={`flex flex-wrap gap-x-6 gap-y-3 ${isCenter ? 'flex-col items-center text-center' : 'items-end justify-between'} ${className}`}
    >
      <div className={`max-w-3xl ${isCenter ? 'mx-auto' : ''}`}>
        {eyebrow && (
          <div className={`u-overline mb-2.5 inline-flex items-center gap-2 ${isCenter ? 'justify-center' : ''}`}>
            <span className="h-[3px] w-5 rounded-full bg-brand-500 shadow-glow-accent" />
            {eyebrow}
          </div>
        )}
        <h2
          className={
            size === 'lg'
              ? 'text-[26px] font-bold leading-[1.15] tracking-[-0.03em] text-ink u-emboss sm:text-[32px]'
              : 'u-h2'
          }
        >
          {title}
        </h2>
        {description && (
          <p className={`mt-2.5 text-[13.5px] leading-relaxed text-ink-secondary ${isCenter ? 'mx-auto' : ''}`}>
            {description}
          </p>
        )}
      </div>

      {aside && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{aside}</div>}
    </div>
  )
}

export default SectionHeader
