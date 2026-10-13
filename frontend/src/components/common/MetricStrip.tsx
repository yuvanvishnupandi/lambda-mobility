import React from 'react'
import { LucideIcon } from 'lucide-react'
import { AnimatedCounter } from './AnimatedCounter'

export interface MetricStripItem {
  label: string
  value: string | number
  sublabel?: string
  trend?: {
    value: string | number
    direction: 'up' | 'down' | 'neutral'
    tone?: 'emerald' | 'rose' | 'blue' | 'slate' | 'amber'
  }
  icon?: LucideIcon
  status?: 'active' | 'warning' | 'critical' | 'neutral'
  /** optional emphasis colour for the headline figure */
  valueTone?: 'ink' | 'brand' | 'emerald' | 'amber' | 'rose' | 'iris'
}

interface MetricStripProps {
  items: MetricStripItem[]
  className?: string
  /** denser padding for embedded strips */
  dense?: boolean
}

const COLS: Record<number, string> = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
  5: 'xl:grid-cols-5',
  6: 'xl:grid-cols-6',
}

const TREND_TONE: Record<string, string> = {
  emerald: 'text-emerald-600',
  rose: 'text-rose-600',
  blue: 'text-brand-600',
  amber: 'text-amber-600',
  slate: 'text-ink-muted',
}

const VALUE_TONE: Record<string, string> = {
  ink: 'text-ink',
  brand: 'text-brand-600',
  emerald: 'text-emerald-600',
  amber: 'text-amber-600',
  rose: 'text-rose-600',
  iris: 'text-iris-600',
}

const ARROWS: Record<string, string> = { up: '↑', down: '↓', neutral: '→' }

/**
 * Telemetry instrument strip — one recessed panel with engraved divider
 * columns, like a bank of gauges on a control desk.
 */
export const MetricStrip: React.FC<MetricStripProps> = ({ items, className = '', dense = false }) => {
  const count = Math.min(items.length, 6)
  const cols = COLS[count] ?? COLS[4]
  const midCols = count >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'

  return (
    <div
      className={`u-strip grid grid-cols-2 ${midCols} ${cols} ${className}`}
      role="list"
      aria-label="Operational telemetry"
    >
      {items.map((item, idx) => {
        const Icon = item.icon
        const trendTone = TREND_TONE[item.trend?.tone ?? 'slate']
        const isNumeric = typeof item.value === 'number' || /^[\d,.:\s%]+$/.test(String(item.value))

        return (
          <div
            key={idx}
            role="listitem"
            className={`u-strip-item group flex flex-col justify-between gap-2 ${dense ? 'px-3.5 py-2.5' : ''}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="u-overline leading-tight">{item.label}</span>
              {Icon && (
                <Icon className="h-3.5 w-3.5 shrink-0 text-ink-faint transition-all duration-200 ease-mech group-hover:rotate-6 group-hover:text-brand-600" />
              )}
            </div>

            <div className="flex items-end justify-between gap-2">
              <span
                className={`u-num text-[22px] font-bold leading-none tracking-[-0.02em] ${
                  VALUE_TONE[item.valueTone ?? 'ink']
                }`}
              >
                {isNumeric ? <AnimatedCounter value={item.value} /> : item.value}
              </span>

              {item.trend && (
                <span className={`u-num text-[11px] font-semibold ${trendTone}`}>
                  {ARROWS[item.trend.direction]} {item.trend.value}
                </span>
              )}
            </div>

            {item.sublabel && <span className="u-meta leading-tight">{item.sublabel}</span>}
          </div>
        )
      })}
    </div>
  )
}

export default MetricStrip
