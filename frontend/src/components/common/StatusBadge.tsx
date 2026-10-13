import React from 'react'

export type StatusTone = 'emerald' | 'blue' | 'brand' | 'amber' | 'rose' | 'slate' | 'indigo' | 'iris' | 'cyan' | 'aqua'

export interface StatusBadgeProps {
  status: string
  tone?: StatusTone
  /** alias of `tone`, kept for callers that pass `severity` semantics */
  dot?: boolean
  className?: string
  size?: 'sm' | 'md'
  /** adds a soft pulse to the indicator dot */
  live?: boolean
}

/** Stamped brass-plate chip: engraved recess with an LED dot. */
const TONES: Record<StatusTone, { text: string; dot: string; glow: string; ring: string }> = {
  emerald: { text: 'text-emerald-700', dot: '#22c55e', glow: 'rgba(34,197,94,0.6)', ring: 'rgba(34,197,94,0.35)' },
  blue: { text: 'text-iris-600', dot: '#486085', glow: 'rgba(72,96,133,0.5)', ring: 'rgba(72,96,133,0.3)' },
  brand: { text: 'text-brand-700', dot: '#ff4757', glow: 'rgba(255,71,87,0.6)', ring: 'rgba(255,71,87,0.35)' },
  amber: { text: 'text-amber-700', dot: '#d97706', glow: 'rgba(217,119,6,0.6)', ring: 'rgba(217,119,6,0.35)' },
  rose: { text: 'text-rose-700', dot: '#e11d48', glow: 'rgba(225,29,72,0.6)', ring: 'rgba(225,29,72,0.35)' },
  slate: { text: 'text-ink-muted', dot: '#8391a2', glow: 'rgba(131,145,162,0.45)', ring: 'rgba(163,177,198,0.4)' },
  indigo: { text: 'text-iris-600', dot: '#486085', glow: 'rgba(72,96,133,0.5)', ring: 'rgba(72,96,133,0.3)' },
  iris: { text: 'text-iris-600', dot: '#486085', glow: 'rgba(72,96,133,0.5)', ring: 'rgba(72,96,133,0.3)' },
  cyan: { text: 'text-aqua-700', dot: '#12aecb', glow: 'rgba(18,174,203,0.55)', ring: 'rgba(18,174,203,0.35)' },
  aqua: { text: 'text-aqua-700', dot: '#12aecb', glow: 'rgba(18,174,203,0.55)', ring: 'rgba(18,174,203,0.35)' },
}

/** Compact semantic status chip — an engraved plate with an LED dot. */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  tone = 'slate',
  dot = true,
  className = '',
  size = 'md',
  live = false,
}) => {
  const style = TONES[tone] ?? TONES.slate
  const sizing = size === 'sm' ? 'gap-1 px-1.5 py-[2px] text-[9.5px]' : 'gap-1.5 px-2 py-[3px] text-[10px]'

  return (
    <span
      className={`inline-flex items-center rounded-md bg-surface-0 font-mono font-semibold uppercase tracking-[0.1em] whitespace-nowrap shadow-groove ${style.text} ${sizing} ${className}`}
      style={{ boxShadow: `inset 2px 2px 4px #babecc, inset -2px -2px 4px #ffffff, inset 0 0 0 1px ${style.ring}` }}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0 items-center justify-center">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: style.dot, boxShadow: `0 0 5px 1px ${style.glow}` }}
          />
          {live && (
            <span
              className="absolute h-1.5 w-1.5 animate-ping-slow rounded-full opacity-70"
              style={{ background: style.dot }}
            />
          )}
        </span>
      )}
      <span>{status}</span>
    </span>
  )
}

export default StatusBadge
