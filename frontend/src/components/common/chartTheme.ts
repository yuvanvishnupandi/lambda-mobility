import type { CSSProperties } from 'react'

/**
 * Chart palette — instrument-panel data colours. Safety orange is the primary
 * series; signal colours carry additional series or state meaning. Grid and
 * axis read like etched guide lines on a recessed plot.
 */
export const CHART = {
  brand: '#FF4757',
  brandDeep: '#C22F3C',
  iris: '#486085',
  aqua: '#0C8BA6',
  mint: '#0E8A61',
  emerald: '#059669',
  amber: '#D97706',
  orange: '#EA580C',
  rose: '#DC2626',
  slate: '#5F6B7A',
  grid: 'rgba(163,177,198,0.35)',
  axis: '#5F6B7A',
} as const

export const axisTick = { fill: CHART.axis, fontSize: 11, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' } as const

export const gridProps = {
  stroke: CHART.grid,
  strokeDasharray: '3 3',
} as const

export const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#e8ecf2',
    border: 'none',
    borderRadius: '10px',
    boxShadow: '8px 8px 16px #babecc, -8px -8px 16px #ffffff',
    fontSize: '12px',
    padding: '8px 10px',
  } as CSSProperties,
  labelStyle: { color: '#2d3436', fontWeight: 700, marginBottom: 2 } as CSSProperties,
  itemStyle: { color: '#4a5568', fontSize: '12px' } as CSSProperties,
  cursor: { fill: 'rgba(45,52,54,0.05)', stroke: 'rgba(45,52,54,0.1)' },
}
