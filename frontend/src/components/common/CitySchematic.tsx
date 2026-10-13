import React from 'react'

/**
 * Schematic city canvas used in marketing surfaces: a stylised arterial
 * network with vehicles moving along road geometry and detection events
 * pulsing on the grid — drawn like an etched blueprint plate. Pure SVG +
 * SMIL, no map library, no network calls.
 */
export const CitySchematic: React.FC<{ className?: string }> = ({ className = '' }) => {
  const vehicles = [
    { path: 'M-20,64 H420', dur: '22s', color: '#FF4757', delay: '0s', label: 'GST-500A' },
    { path: 'M420,150 H-20', dur: '26s', color: '#059669', delay: '-6s', label: 'MTC-70V' },
    { path: 'M96,300 V-20', dur: '24s', color: '#486085', delay: '-11s', label: 'CMRL-METRO' },
    { path: 'M300,-20 V300', dur: '28s', color: '#0C8BA6', delay: '-3s', label: 'MWC-EV' },
  ]

  const events = [
    { x: 148, y: 118, tone: '#D97706' },
    { x: 268, y: 196, tone: '#E11D48' },
    { x: 340, y: 74, tone: '#0C8BA6' },
  ]

  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      role="img"
      aria-label="Schematic map of the city sensing network with vehicles and detections"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="schematic-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0F2F5" />
          <stop offset="100%" stopColor="#DDE3EC" />
        </linearGradient>
        <radialGradient id="schematic-core" cx="18%" cy="8%" r="70%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      <rect width="400" height="300" fill="url(#schematic-fade)" />
      <rect width="400" height="300" fill="url(#schematic-core)" />

      {/* City blocks */}
      {[
        [22, 26, 54, 26],
        [96, 26, 74, 26],
        [190, 26, 62, 26],
        [272, 26, 96, 26],
        [22, 86, 54, 22],
        [190, 86, 62, 22],
        [22, 176, 54, 30],
        [96, 176, 74, 30],
        [272, 176, 96, 30],
        [148, 232, 96, 30],
        [300, 74, 68, 60],
        [22, 232, 96, 30],
      ].map(([x, y, w, h], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={w}
          height={h}
          rx="3"
          fill="rgba(45,52,54,0.035)"
          stroke="rgba(45,52,54,0.09)"
          strokeWidth="1"
        />
      ))}

      {/* Arterial network — etched guide lines */}
      <g stroke="rgba(45,52,54,0.16)" strokeWidth="1.4" fill="none">
        <path d="M-20,64 H420" />
        <path d="M-20,150 H420" />
        <path d="M-20,224 H420" />
        <path d="M96,-20 V300" />
        <path d="M300,-20 V300" />
      </g>
      <g stroke="rgba(45,52,54,0.08)" strokeWidth="1" fill="none">
        <path d="M190,-20 V300" strokeDasharray="4 6" />
        <path d="M-20,120 H420" strokeDasharray="4 6" />
      </g>

      {/* Transit corridor — the safety-orange line */}
      <path
        d="M-20,224 C 90,224 120,150 200,150 C 280,150 320,64 420,64"
        stroke="rgba(255,71,87,0.6)"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Detection events */}
      {events.map((e, i) => (
        <g key={i}>
          <circle cx={e.x} cy={e.y} r="3" fill={e.tone} />
          <circle cx={e.x} cy={e.y} r="3" fill="none" stroke={e.tone} strokeWidth="1">
            <animate attributeName="r" values="3;16" dur="3.4s" begin={`${i * 0.7}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0" dur="3.4s" begin={`${i * 0.7}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}

      {/* Vehicles on road geometry */}
      {vehicles.map(v => (
        <g key={v.label}>
          <circle r="3.6" fill={v.color}>
            <animateMotion dur={v.dur} begin={v.delay} repeatCount="indefinite" path={v.path} />
          </circle>
          <circle r="7" fill="none" stroke={v.color} strokeOpacity="0.45" strokeWidth="1">
            <animateMotion dur={v.dur} begin={v.delay} repeatCount="indefinite" path={v.path} />
          </circle>
        </g>
      ))}
    </svg>
  )
}

export default CitySchematic
