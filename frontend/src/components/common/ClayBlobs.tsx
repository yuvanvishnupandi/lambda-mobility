import React from 'react'

interface ClayBlobsProps {
  variant?: 'app' | 'display'
}

/**
 * Ambient canvas layer — the workshop bench under a single top-left light.
 * A blueprint grid, a lighting hotspot from the top-left corner, a faint
 * safety-orange bloom and a matte-plastic noise grain. Purely decorative.
 */
export const ClayBlobs: React.FC<ClayBlobsProps> = ({ variant = 'app' }) => {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-surface-0">
      {/* Blueprint / schematic grid */}
      <div className="absolute inset-0 bg-grid-fine opacity-80" />

      {/* Lighting hotspot — reinforces the 45° top-left light source */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(1100px 700px at 12% -5%, rgba(255,255,255,0.5), transparent 60%), radial-gradient(900px 600px at 105% 110%, rgba(163,177,198,0.25), transparent 60%)',
        }}
      />

      {/* Faint accent bloom */}
      <div
        className="absolute -right-52 top-1/4 h-[560px] w-[560px] rounded-full opacity-[0.35] blur-[130px]"
        style={{ background: 'radial-gradient(closest-side, rgba(255,71,87,0.12), transparent 72%)' }}
      />

      {variant === 'display' && (
        <div
          className="absolute -bottom-56 left-1/4 h-[520px] w-[720px] rounded-full opacity-40 blur-[130px]"
          style={{ background: 'radial-gradient(closest-side, rgba(163,177,198,0.3), transparent 75%)' }}
        />
      )}

      {/* Matte plastic noise grain */}
      <div className="u-noise absolute inset-0 opacity-[0.18] mix-blend-overlay" />
    </div>
  )
}

export default ClayBlobs
