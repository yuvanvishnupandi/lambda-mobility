import React from 'react'

/* ============================================================================
 * Manufacturing details — the signature elements of Industrial Skeuomorphism.
 * Use sparingly but consistently: every "panel" is a physical object that is
 * bolted, vented and status-lit. All components are decorative (aria-hidden)
 * and never affect layout semantics.
 * ========================================================================= */

/** Screw positions for <Screws />. */
export type ScrewCorners = 'all' | 'top' | 'bottom' | 'tl-br'

interface ScrewsProps {
  corners?: ScrewCorners
  /** inset from each corner, px */
  inset?: number
  className?: string
}

/** Four (or fewer) radial-gradient corner screws, rendered at exact 12px insets. */
export const Screws: React.FC<ScrewsProps> = ({ corners = 'all', inset = 12, className = '' }) => {
  const dent = (x: string, y: string) => (
    <span
      aria-hidden="true"
      className="absolute rounded-full"
      style={{
        width: 8,
        height: 8,
        [x === 'left' ? 'left' : 'right']: inset,
        [y === 'top' ? 'top' : 'bottom']: inset,
        background:
          'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0 1px, rgba(45,52,54,0.32) 1.6px, rgba(45,52,54,0.1) 2.6px, transparent 3.2px)',
        boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.8)',
      }}
    />
  )
  const which =
    corners === 'all'
      ? [['left', 'top'], ['right', 'top'], ['left', 'bottom'], ['right', 'bottom']]
      : corners === 'top'
        ? [['left', 'top'], ['right', 'top']]
        : corners === 'bottom'
          ? [['left', 'bottom'], ['right', 'bottom']]
          : [['left', 'top'], ['right', 'bottom']]

  return (
    <span aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      {which.map(([x, y], i) => (
        <React.Fragment key={i}>{dent(x, y)}</React.Fragment>
      ))}
    </span>
  )
}

/** Three recessed vent slots, top-right — the cooling grille of the module. */
export const VentSlots: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span aria-hidden="true" className={`pointer-events-none absolute right-3 top-3 flex gap-1 ${className}`}>
    {[0, 1, 2].map(i => (
      <span
        key={i}
        className="h-5 w-[3px] rounded-full bg-surface-3"
        style={{ boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.7)' }}
      />
    ))}
  </span>
)

export type LedTone = 'accent' | 'mint' | 'amber' | 'rose' | 'aqua' | 'slate'

const LED: Record<LedTone, { c: string; glow: string }> = {
  accent: { c: '#ff4757', glow: 'rgba(255,71,87,0.6)' },
  mint: { c: '#22c55e', glow: 'rgba(34,197,94,0.6)' },
  amber: { c: '#d97706', glow: 'rgba(217,119,6,0.6)' },
  rose: { c: '#e11d48', glow: 'rgba(225,29,72,0.6)' },
  aqua: { c: '#12aecb', glow: 'rgba(18,174,203,0.6)' },
  slate: { c: '#8391a2', glow: 'rgba(131,145,162,0.4)' },
}

interface LedIndicatorProps {
  tone?: LedTone
  /** label rendered next to the LED in stamped mono type */
  label?: string
  /** turns off the breathing pulse */
  pulse?: boolean
  className?: string
}

/** LED status indicator with glow + mono label ("SYSTEM OPERATIONAL"). */
export const LedIndicator: React.FC<LedIndicatorProps> = ({
  tone = 'mint',
  label,
  pulse = true,
  className = '',
}) => {
  const led = LED[tone]
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        aria-hidden="true"
        className={`inline-block h-2 w-2 shrink-0 rounded-full ${pulse ? 'animate-pulse-soft' : ''}`}
        style={{ background: led.c, boxShadow: `0 0 9px 1.5px ${led.glow}, inset 0 -1px 1px rgba(0,0,0,0.3)` }}
      />
      {label && <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{label}</span>}
    </span>
  )
}

/** Skewed masking-tape metadata label. */
export const TapeLabel: React.FC<{ children: React.ReactNode; className?: string; tone?: 'yellow' | 'white' | 'accent' }> = ({
  children,
  className = '',
  tone = 'yellow',
}) => {
  const bg =
    tone === 'yellow' ? 'rgba(255,230,0,0.35)' : tone === 'accent' ? 'rgba(255,71,87,0.22)' : 'rgba(255,255,255,0.5)'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[2px] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-ink shadow-sm ${className}`}
      style={{ transform: 'skewX(-8deg)', background: bg }}
    >
      {children}
    </span>
  )
}

/** Circular punched hole with inner shadow — for price-tag / hang-tab cards. */
export const HangHole: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    aria-hidden="true"
    className={`absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ${className}`}
    style={{
      background: 'var(--u-chassis)',
      boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.7), 1px 1px 0 rgba(255,255,255,0.7)',
    }}
  />
)

/** Red push-pin with specular highlight. */
export const PushPin: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    aria-hidden="true"
    className={`absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ${className}`}
    style={{
      background: 'radial-gradient(circle at 35% 30%, #ff9ba4, #ff4757 55%, #c22f3c)',
      boxShadow: '2px 3px 5px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(0,0,0,0.25)',
    }}
  />
)

/** Cylindrical pipe that connects "How it works" step nodes (desktop only). */
export const ConnectorPipe: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    aria-hidden="true"
    className={`hidden md:block absolute top-1/2 left-0 h-2.5 w-full -translate-y-1/2 rounded-full ${className}`}
    style={{
      background: 'linear-gradient(180deg, #c3ccd9 0%, #d1d9e6 30%, #b9c3d3 100%)',
      boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.22), inset 0 -1px 1px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.8)',
    }}
  />
)

/** A small CRT screen surface: dark, recessed, scanlines. Wrap content in it. */
export const CrtScreen: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`relative overflow-hidden rounded-lg bg-[#10151c] shadow-recessed ${className}`}>
    {children}
    <span aria-hidden="true" className="u-scanlines pointer-events-none absolute inset-0 opacity-60" />
  </div>
)

export default Screws
