import L from 'leaflet'

export type MapTone = 'brand' | 'emerald' | 'amber' | 'rose' | 'iris' | 'aqua'

const TONES: Record<MapTone, string> = {
  brand: '#FF4757',
  emerald: '#059669',
  amber: '#D97706',
  rose: '#DC2626',
  iris: '#486085',
  aqua: '#0C8BA6',
}

export const severityTone = (severity: string): MapTone => {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return 'rose'
    case 'high':
      return 'amber'
    case 'medium':
      return 'brand'
    default:
      return 'emerald'
  }
}

/**
 * Fleet marker: a compact rounded node with a soft halo. Uses inline styles so
 * the geometry is independent of the utility-class pipeline.
 */
export const vehicleIcon = (options: {
  tone?: MapTone
  speed?: number
  selected?: boolean
  heading?: number
} = {}) => {
  const { tone = 'brand', speed, selected = false, heading } = options
  const color = TONES[tone]
  const size = selected ? 26 : 20
  const ring = Math.round(size / 2)

  const arrow =
    heading === undefined
      ? ''
      : `<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;transform:rotate(${heading}deg)">
           <span style="width:0;height:0;border-left:3px solid transparent;border-right:3px solid transparent;border-bottom:6px solid rgba(28,25,23,.75);transform:translateY(-4px)"></span>
         </span>`

  return L.divIcon({
    iconSize: [size, size],
    iconAnchor: [ring, ring],
    className: '',
    html: `
      <span style="position:relative;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px">
        <span style="position:absolute;width:${size}px;height:${size}px;border-radius:9px;background:${color}1f;border:1px solid ${color}66"></span>
        ${
          selected
            ? `<span style="position:absolute;width:${size + 12}px;height:${size + 12}px;border-radius:50%;border:1px solid ${color}55"></span>`
            : ''
        }
        <span style="position:relative;width:${size / 2.6}px;height:${size / 2.6}px;border-radius:3px;background:${color};box-shadow:0 0 0 2px rgba(255,255,255,.95), 0 1px 4px rgba(28,25,23,.3)"></span>
        ${arrow}
        ${
          speed !== undefined
            ? `<span style="position:absolute;top:${size + 3}px;left:50%;transform:translateX(-50%);white-space:nowrap;font:600 9px/1 'JetBrains Mono',monospace;color:#2d3436;background:rgba(232,236,242,.94);border:1px solid #a3b1c6;border-radius:5px;padding:2px 4px;box-shadow:0 1px 3px rgba(45,52,54,.25)">${speed}</span>`
            : ''
        }
      </span>`,
  })
}

/** Incident / hazard marker: core dot with a soft severity halo. */
export const eventIcon = (severity: string, size = 16) => {
  const color = TONES[severityTone(severity)]
  return L.divIcon({
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    className: '',
    html: `
      <span style="position:relative;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px">
        <span style="position:absolute;width:${size}px;height:${size}px;border-radius:50%;background:${color}26;border:1px solid ${color}77"></span>
        <span style="position:relative;width:5px;height:5px;border-radius:50%;background:${color};box-shadow:0 0 0 1.5px rgba(255,255,255,.9)"></span>
      </span>`,
  })
}

export const toneColor = (tone: MapTone) => TONES[tone]
