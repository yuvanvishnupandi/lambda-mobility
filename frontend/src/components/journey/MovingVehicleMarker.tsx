import React, { useEffect, useRef, useState } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { LiveVehicle } from '../../types/transit'

interface MovingVehicleMarkerProps {
  vehicle: LiveVehicle
  isSelected?: boolean
  onClick?: () => void
}

/**
 * Animated Leaflet marker with smooth position interpolation (lerp) and a
 * direction caret. The mark itself stays deliberately small so a dense fleet
 * still reads as a network rather than a field of labels — identifier chips
 * fade in only when the canvas is zoomed in far enough to have room for them.
 */
export const MovingVehicleMarker: React.FC<MovingVehicleMarkerProps> = ({
  vehicle,
  isSelected = false,
  onClick,
}) => {
  const markerRef = useRef<L.Marker | null>(null)
  const [currentPos, setCurrentPos] = useState<[number, number]>([vehicle.latitude, vehicle.longitude])
  const prevPosRef = useRef<[number, number]>([vehicle.latitude, vehicle.longitude])
  const animFrameRef = useRef<number | null>(null)

  // Zoom-aware label density
  const map = useMap()
  const [zoom, setZoom] = useState(() => map.getZoom())
  useEffect(() => {
    const sync = () => setZoom(map.getZoom())
    map.on('zoomend', sync)
    sync()
    return () => {
      map.off('zoomend', sync)
    }
  }, [map])

  // Smooth position interpolation whenever vehicle.latitude / vehicle.longitude changes
  useEffect(() => {
    const targetPos: [number, number] = [vehicle.latitude, vehicle.longitude]
    const startPos = prevPosRef.current

    const dist = Math.hypot(targetPos[0] - startPos[0], targetPos[1] - startPos[1])
    if (dist < 0.00001) {
      setCurrentPos(targetPos)
      return
    }

    const duration = 1400 // ms
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(1.0, elapsed / duration)
      const ease = 1 - Math.pow(1 - progress, 3)

      const lat = startPos[0] + (targetPos[0] - startPos[0]) * ease
      const lon = startPos[1] + (targetPos[1] - startPos[1]) * ease

      setCurrentPos([lat, lon])
      if (markerRef.current) markerRef.current.setLatLng([lat, lon])

      if (progress < 1.0) {
        animFrameRef.current = requestAnimationFrame(animate)
      } else {
        prevPosRef.current = targetPos
      }
    }

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [vehicle.latitude, vehicle.longitude])

  // ── Mode palette (mirrors the transit chips used across the planner) ──
  const isElectric =
    vehicle.mode === 'MTC_ELECTRIC_BUS' ||
    vehicle.mode === 'GANDHINAGAR_ELECTRIC_BUS' ||
    vehicle.is_electric ||
    vehicle.vehicle_id.includes('EB') ||
    vehicle.vehicle_id.includes('MTC') ||
    vehicle.vehicle_id.includes('MWC') ||
    vehicle.vehicle_id.includes('EV') ||
    vehicle.operator?.toLowerCase().includes('greenline') ||
    vehicle.operator?.toLowerCase().includes('mtc')

  let tone = '#059669' // AMTS feeder / electric
  if (vehicle.mode === 'METRO') tone = '#2563EB'
  else if (vehicle.mode === 'BRTS') tone = '#EA580C'
  else if (vehicle.mode === 'RAIL') tone = '#7C3AED'
  if (vehicle.status === 'DELAYED') tone = '#DC2626'

  const shortId = vehicle.vehicle_id.replace(/^GGTSL-|^METRO-|^BRTS-|^AMTS-/, '')
  const headingDeg = vehicle.heading || 0
  const batterySoc = vehicle.battery_soc_pct ?? (isElectric ? 84 : undefined)
  const showLabel = isSelected || zoom >= 13

  const node = isSelected ? 24 : 18
  const bolt = `<svg viewBox="0 0 24 24" width="8" height="8" fill="#FFFFFF"><path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12z"/></svg>`

  const customIcon = L.divIcon({
    className: 'lambda-vehicle-node',
    html: `
      <div style="position:relative;transform:translate(-50%,-50%);cursor:pointer;user-select:none;">
        ${
          isSelected
            ? `<div style="position:absolute;top:50%;left:50%;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;background:${tone}26;animation:ping 2.2s cubic-bezier(0,0,0.2,1) infinite;pointer-events:none;"></div>`
            : ''
        }
        <div style="
          position:relative;width:${node}px;height:${node}px;border-radius:${Math.round(node / 2.8)}px;
          background:${tone}1a;border:1px solid ${isSelected ? tone : tone + '66'};
          box-shadow:0 0 0 2px rgba(255,255,255,.95), 0 2px 6px rgba(28,25,23,.25);
          display:flex;align-items:center;justify-content:center;
          transition:width .2s ease,height .2s ease,border-color .2s ease;">
          ${
            isElectric
              ? `<span style="display:flex;align-items:center;justify-content:center;width:${node / 2.2}px;height:${node / 2.2}px;border-radius:${Math.round(node / 6)}px;background:${tone};">${bolt}</span>`
              : `<span style="width:${node / 2.6}px;height:${node / 2.6}px;border-radius:50%;background:${tone};box-shadow:0 0 6px ${tone}88;"></span>`
          }
          <span style="
            position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
            transform:rotate(${headingDeg}deg);transition:transform .5s ease;pointer-events:none;">
            <span style="width:0;height:0;border-left:3px solid transparent;border-right:3px solid transparent;
              border-bottom:5px solid rgba(28,25,23,.8);transform:translateY(-${node / 2 + 4}px);"></span>
          </span>
        </div>
        ${
          showLabel
            ? `<span style="
                position:absolute;top:${node + 3}px;left:50%;transform:translateX(-50%);white-space:nowrap;
                font:600 9px/1 'JetBrains Mono',monospace;letter-spacing:.03em;
                color:${isSelected ? '#1C1917' : '#57534E'};
                background:rgba(255,255,255,.94);border:1px solid ${isSelected ? tone + '88' : '#E4DED2'};
                border-radius:5px;padding:2px 4px;box-shadow:0 1px 3px rgba(28,25,23,.12);">${shortId}${
                  batterySoc !== undefined ? ` ${batterySoc}%` : ''
                }</span>`
            : ''
        }
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })

  const statusTone =
    vehicle.status === 'DELAYED'
      ? 'u-chip-rose'
      : vehicle.status === 'ON_TIME'
        ? 'u-chip-emerald'
        : 'u-chip-slate'

  return (
    <Marker
      ref={markerRef}
      position={currentPos}
      icon={customIcon}
      eventHandlers={{
        click: () => onClick && onClick(),
      }}
    >
      <Popup className="lambda-vehicle-popup">
        <div className="w-[224px] space-y-2.5 font-sans">
          {/* Identity */}
          <div className="flex items-start justify-between gap-2 border-b border-line pb-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                {isElectric && (
                  <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0 text-mint-600" fill="currentColor">
                    <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12z" />
                  </svg>
                )}
                <span className="u-num truncate text-[13px] font-semibold text-ink">{vehicle.vehicle_id}</span>
              </div>
              <div className="truncate text-[11px] text-ink-muted">{vehicle.operator || 'City transit unit'}</div>
            </div>
            <span className={`u-chip ${statusTone}`}>{(vehicle.status || 'LIVE').replace('_', ' ')}</span>
          </div>

          {/* Telemetry */}
          <div className="space-y-1.5 text-[11.5px]">
            {vehicle.route_number && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-ink-muted">Route</span>
                <span className="u-num font-semibold text-ink">
                  {vehicle.route_number}
                  {vehicle.route_name ? <span className="font-normal text-ink-secondary"> · {vehicle.route_name}</span> : null}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <span className="text-ink-muted">Speed</span>
              <span className="u-num font-semibold text-ink">{vehicle.speed_kmh} km/h</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-ink-muted">Heading</span>
              <span className="u-num font-semibold text-ink">{headingDeg}°</span>
            </div>
            {vehicle.current_location_name && (
              <div className="flex items-start justify-between gap-3">
                <span className="shrink-0 text-ink-muted">Location</span>
                <span className="text-right font-medium text-ink-secondary">{vehicle.current_location_name}</span>
              </div>
            )}
          </div>

          {vehicle.next_stop_name && (
            <div className="rounded-lg border border-line bg-surface-2/70 px-2 py-1.5 text-[11px]">
              <span className="u-overline">Next stop</span>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium text-ink">{vehicle.next_stop_name}</span>
                {vehicle.eta_next_stop_mins ? (
                  <span className="u-num shrink-0 font-semibold text-mint-600">~{vehicle.eta_next_stop_mins}m</span>
                ) : null}
              </div>
            </div>
          )}

          {isElectric && batterySoc !== undefined && (
            <div className="space-y-1.5 border-t border-line pt-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-ink-muted">Battery state of charge</span>
                <span
                  className={`u-num font-semibold ${
                    batterySoc > 50 ? 'text-mint-600' : batterySoc > 20 ? 'text-amber-600' : 'text-rose-600'
                  }`}
                >
                  {batterySoc}%
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-surface-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    batterySoc > 50 ? 'bg-mint-500' : batterySoc > 20 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.max(5, Math.min(100, batterySoc))}%` }}
                />
              </div>
            </div>
          )}

          {/* Provenance */}
          <div className="flex items-center justify-between gap-2 border-t border-line pt-2 text-[10.5px]">
            <span className="text-ink-faint">{vehicle.freshness_label || 'Live GPS feed'}</span>
            <span className="u-num font-semibold text-mint-600">{vehicle.data_source || 'TRACCAR'}</span>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}
