import React from 'react'
import { LucideIcon } from 'lucide-react'

type LiveTone = 'emerald' | 'blue' | 'amber' | 'rose'

interface PageHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: string
  icon?: LucideIcon
  accent?: string
  live?: {
    label: string
    tone?: LiveTone
    pulse?: boolean
  }
  meta?: React.ReactNode
  actions?: React.ReactNode
  children?: React.ReactNode
}

const LIVE_TONE: Record<LiveTone, { led: 'mint' | 'accent' | 'amber' | 'rose'; text: string }> = {
  emerald: { led: 'mint', text: 'text-emerald-700' },
  blue: { led: 'accent', text: 'text-iris-600' },
  amber: { led: 'amber', text: 'text-amber-700' },
  rose: { led: 'rose', text: 'text-rose-700' },
}

/**
 * Module command bar — the single header used by every operations screen.
 * A control-room masthead: embossed title, live LED plate and action keys,
 * all mounted on a vented instrument band.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  icon: Icon,
  live,
  meta,
  actions,
  children,
}) => {
  const tone = live?.tone ?? 'emerald'
  const toneStyle = LIVE_TONE[tone]

  return (
    <header className="relative z-30 bg-[#FFFFFF] border-b border-[#E5E5DF] shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 px-4 py-3 sm:px-6">
        {/* Identity */}
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <span className="hidden h-9 w-9 shrink-0 items-center justify-center border border-[#E5E5DF] bg-[#FBFBFA] text-[#111111] sm:flex font-mono">
              <Icon className="h-4 w-4" />
            </span>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="truncate text-[19px] font-bold leading-tight tracking-[-0.025em] text-[#111111] sm:text-[21px]">
                {title}
              </h1>

              {live && (
                <span className="inline-flex items-center rounded-[3px] border border-[#D5D5CF] bg-[#F7F7F4] px-2 py-[2px] font-mono text-[10px] font-bold uppercase tracking-[0.08em]">
                  <span className={`whitespace-nowrap ${toneStyle.text}`}>{live.label}</span>
                </span>
              )}

              {eyebrow && !live && <span className="u-overline">{eyebrow}</span>}
            </div>

            {eyebrow && live && <div className="u-overline mt-1 truncate">{eyebrow}</div>}

            {subtitle && (
              <p className="mt-1 max-w-2xl truncate text-[12px] font-normal text-ink-muted">{subtitle}</p>
            )}
          </div>
        </div>

        {/* State + actions */}
        {(meta || actions) && (
          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            {meta}
            {actions}
          </div>
        )}
      </div>

      {children && (
        <div className="border-t border-[rgba(163,177,198,0.35)] bg-surface-2/60 px-4 py-2.5 sm:px-6">{children}</div>
      )}
    </header>
  )
}

export default PageHeader
