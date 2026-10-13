import React from 'react'
import { TileLayer } from 'react-leaflet'
import { Map as MapIcon, Globe } from 'lucide-react'

export type MapTileMode = 'street' | 'satellite'

export const SATELLITE_TILE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
export const SATELLITE_LABELS_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
export const SATELLITE_ROADS_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}'
export const SATELLITE_ATTRIBUTION =
  'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'

export const STREET_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const STREET_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

interface MapTileLayerProps {
  mode: MapTileMode
}

/**
 * Cartography for the operations canvas. Street tiles use the standard light
 * basemap so marker and corridor colours stay legible against the canvas.
 */
export const MapTileLayer: React.FC<MapTileLayerProps> = ({ mode }) => {
  if (mode === 'satellite') {
    return (
      <>
        <TileLayer
          key="satellite-base-imagery"
          url={SATELLITE_TILE_URL}
          attribution={SATELLITE_ATTRIBUTION}
          maxZoom={19}
        />
        <TileLayer
          key="satellite-roads-overlay"
          url={SATELLITE_ROADS_URL}
          attribution=""
          maxZoom={19}
          opacity={0.7}
        />
        <TileLayer
          key="satellite-places-overlay"
          url={SATELLITE_LABELS_URL}
          attribution=""
          maxZoom={19}
          opacity={0.85}
        />
      </>
    )
  }

  return (
    <TileLayer key="street-tiles" url={STREET_TILE_URL} attribution={STREET_ATTRIBUTION} />
  )
}

export interface MapViewToggleProps {
  mode: MapTileMode
  onChange: (mode: MapTileMode) => void
  className?: string
  floating?: boolean
}

export const MapViewToggle: React.FC<MapViewToggleProps> = ({
  mode,
  onChange,
  className = '',
  floating = false,
}) => {
  return (
    <div
      className={`u-seg inline-flex items-center gap-0.5 border border-[#E5E5DF] bg-[#FFFFFF] shadow-sm p-0.5 ${
        floating ? 'absolute right-3 top-3 z-[400]' : ''
      } ${className}`}
      role="group"
      aria-label="Basemap style"
    >
      <button
        type="button"
        onClick={() => onChange('street')}
        aria-pressed={mode === 'street'}
        className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all duration-150 ${
          mode === 'street' ? 'u-seg-item-active' : 'text-ink-muted hover:text-ink'
        }`}
      >
        <MapIcon className="h-3 w-3" />
        <span>Street</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('satellite')}
        aria-pressed={mode === 'satellite'}
        className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all duration-150 ${
          mode === 'satellite' ? 'u-seg-item-active' : 'text-ink-muted hover:text-ink'
        }`}
      >
        <Globe className="h-3 w-3" />
        <span>Satellite</span>
      </button>
    </div>
  )
}

export default MapTileLayer
