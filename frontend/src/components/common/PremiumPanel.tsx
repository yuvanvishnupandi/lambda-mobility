import React from 'react'
import { LucideIcon } from 'lucide-react'
import { VentSlots } from './Industrial'

interface PremiumPanelProps {
  title?: string
  subtitle?: string
  icon?: LucideIcon
  badge?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  headerClassName?: string
  bodyClassName?: string
  /** Renders the header row without the surrounding body padding. */
  flush?: boolean
  /** Drop the header entirely while keeping the panel treatment. */
  hideHeader?: boolean
}

/**
 * Standard module panel — a bolted instrument module: neumorphic body,
 * engraved divider, vented corner and an icon that mounts into a recessed
 * housing. Content is rendered untouched.
 */
export const PremiumPanel: React.FC<PremiumPanelProps> = ({
  title,
  subtitle,
  icon: Icon,
  badge,
  actions,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = 'p-4 sm:p-5',
  flush = false,
  hideHeader = false,
}) => {
  return (
    <section className={`u-panel group/panel ${className}`}>
      <span className="u-hair" aria-hidden="true" />
      <VentSlots />

      {!hideHeader && (title || actions || badge) && (
        <div className={`u-panel-head border-b border-[rgba(163,177,198,0.35)] ${headerClassName}`}>
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon && (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-0 shadow-groove text-ink-muted transition-all duration-200 ease-mech group-hover/panel:rotate-6 group-hover/panel:text-brand-600">
                <Icon className="h-3.5 w-3.5" />
              </span>
            )}
            <div className="min-w-0">
              {title && <h2 className="truncate text-[13px] font-bold tracking-tight text-ink">{title}</h2>}
              {subtitle && <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">{subtitle}</p>}
            </div>
            {badge}
          </div>

          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className={flush ? 'relative' : `relative ${bodyClassName}`}>{children}</div>
    </section>
  )
}

export default PremiumPanel
