import React from 'react'
import { LucideIcon } from 'lucide-react'

type Accent = 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'slate'
type Tone = 'positive' | 'warning' | 'critical' | 'neutral'

interface KpiCardProps {
  label: string
  value: React.ReactNode
  icon?: LucideIcon
  accent?: Accent
  hint?: React.ReactNode
  trend?: string
  trendTone?: Tone
  delay?: number
  className?: string
}

/** Signal mapping — the safety-orange accent is reserved; other tones carry data meaning only. */
const ACCENT: Record<Accent, { icon: string }> = {
  blue: { icon: 'text-iris-500' },
  indigo: { icon: 'text-iris-500' },
  emerald: { icon: 'text-emerald-500' },
  amber: { icon: 'text-amber-500' },
  rose: { icon: 'text-rose-500' },
  cyan: { icon: 'text-aqua-500' },
  slate: { icon: 'text-ink-muted' },
}

const TREND: Record<Tone, { text: string; led: string; glow: string }> = {
  positive: { text: 'text-emerald-600', led: '#22c55e', glow: 'rgba(34,197,94,0.6)' },
  warning: { text: 'text-amber-600', led: '#d97706', glow: 'rgba(217,119,6,0.6)' },
  critical: { text: 'text-rose-600', led: '#e11d48', glow: 'rgba(225,29,72,0.6)' },
  neutral: { text: 'text-ink-muted', led: '#8391a2', glow: 'rgba(131,145,162,0.45)' },
}

/**
 * Telemetry tile — a bolted instrument module: recessed icon housing,
 * stamped mono label and a tabular readout. Lifts on hover like a panel
 * being picked up.
 */
export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  icon: Icon,
  accent = 'blue',
  hint,
  trend,
  trendTone = 'neutral',
  delay = 0,
  className = '',
}) => {
  const styles = ACCENT[accent]
  const trendStyle = TREND[trendTone]

  return (
    <div
      className={`u-panel u-panel-hover group u-screws overflow-hidden px-4 py-3.5 ${className}`}
      style={{
        animation: 'riseIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="u-overline truncate">{label}</span>
        {Icon && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-0 shadow-groove transition-transform duration-200 ease-mech group-hover:scale-110 group-hover:rotate-6">
            <Icon className={`h-3.5 w-3.5 ${styles.icon}`} />
          </span>
        )}
      </div>

      <div className="u-num mt-2.5 text-[26px] font-bold leading-none tracking-[-0.02em] text-ink">
        {value}
      </div>

      {(hint || trend) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-[rgba(163,177,198,0.3)] pt-2">
          {trend && (
            <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold ${trendStyle.text}`}>
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: trendStyle.led, boxShadow: `0 0 6px 1px ${trendStyle.glow}` }}
              />
              {trend}
            </span>
          )}
          {hint && <span className="u-meta truncate">{hint}</span>}
        </div>
      )}
    </div>
  )
}

export default KpiCard
