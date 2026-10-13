import React, { useState, useEffect } from 'react'
import { MapContainer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { JourneyRouteOption, LiveVehicle, TransitStop } from '../../types/transit'
import { Navigation, Layers, ChevronDown, ChevronUp } from 'lucide-react'
import { MovingVehicleMarker } from './MovingVehicleMarker'
import { traccarApi, TraccarGpsPacket } from '../../services/traccarApi'
import { MapTileLayer, MapViewToggle, type MapTileMode } from '../common/MapTileLayer'

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface TransitMapProps {
  route: JourneyRouteOption | null
  liveVehicles?: LiveVehicle[]
  selectedStop?: TransitStop | null
  onSelectVehicle?: (vehicleId: string) => void
}

// Helper component to auto-fit map bounds to the route polyline
function MapBoundsUpdater({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates.map((c) => [c[0], c[1]]))
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
    }
  }, [coordinates, map])
  return null
}

// Custom DivIcons
const createPinIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-transit-pin',
    html: `
      <div style="
        background: ${color};
        color: white;
        padding: 4px 10px;
        border-radius: 20px;
        font-weight: 800;
        font-size: 11px;
        display: flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid white;
        white-space: nowrap;
        transform: translate(-50%, -50%);
      ">
        <span>${label}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

const createStationIcon = (mode: string, isInterchange: boolean) => {
  let bg = '#FF4757'
  if (mode === 'METRO') bg = '#DC2626'
  else if (mode === 'BRTS') bg = '#F97316'
  else if (mode === 'AMTS') bg = '#059669'
  else if (mode === 'RAIL') bg = '#9333EA'
  else if (mode === 'MTC_ELECTRIC_BUS' || mode === 'GANDHINAGAR_ELECTRIC_BUS' || mode?.includes('ELECTRIC')) bg = '#059669'
  else if (mode === 'BUS') bg = '#0D9488'

  return L.divIcon({
    className: 'station-node-pin',
    html: `
      <div style="
        width: ${isInterchange ? '18px' : '14px'};
        height: ${isInterchange ? '18px' : '14px'};
        background: ${isInterchange ? '#9333EA' : bg};
        border: 2.5px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        transform: translate(-50%, -50%);
      "></div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

export const TransitMap: React.FC<TransitMapProps> = ({
  route,
  liveVehicles: propVehicles = [],
  onSelectVehicle,
}) => {
  const [mapMode, setMapMode] = useState<MapTileMode>('street')
  const [isLegendMinimized, setIsLegendMinimized] = useState(false)
  const [liveVehiclesMap, setLiveVehiclesMap] = useState<Record<string, LiveVehicle>>({})

  const defaultCenter: [number, number] = [12.8231, 80.0444] // Metropolitan Transit Midpoint

  // Initialize and sync vehicles from props
  useEffect(() => {
    if (propVehicles && propVehicles.length > 0) {
      setLiveVehiclesMap((prev) => {
        const next = { ...prev }
        propVehicles.forEach((v) => {
          next[v.vehicle_id] = { ...v, ...(next[v.vehicle_id] || {}) }
        })
        return next
      })
    }
  }, [propVehicles])

  // Subscribe to real-time Traccar SSE stream
  useEffect(() => {
    const unsubscribe = traccarApi.connectLiveStream(
      (packet: TraccarGpsPacket) => {
        setLiveVehiclesMap((prev) => {
          const existing = prev[packet.vehicle_id] || ({} as Partial<LiveVehicle>)
          const updated: LiveVehicle = {
            vehicle_id: packet.vehicle_id,
            registration: packet.registration || existing.registration || packet.vehicle_id,
            mode: (packet.mode as any) || existing.mode || 'MTC_ELECTRIC_BUS',
            is_electric: packet.is_electric ?? true,
            battery_soc_pct: packet.battery_soc_pct ?? existing.battery_soc_pct ?? 85,
            charging_status: (packet.charging_status as any) || existing.charging_status || 'DISCHARGING',
            agency_code: existing.agency_code || 'MTC_EV',
            agency_name: packet.operator || existing.agency_name || 'MTC Greenline Electric Bus',
            route_number: packet.route_number || existing.route_number || '500A-EV',
            route_name: packet.route_name || existing.route_name || 'Chengalpattu ↔ Tambaram Corridor',
            latitude: packet.latitude,
            longitude: packet.longitude,
            speed_kmh: packet.speed_kmh,
            heading: packet.heading,
            current_location_name: packet.location_name || existing.current_location_name || 'GST Road (NH 45) Transit Corridor',
            next_stop_name: packet.next_stop_name || existing.next_stop_name,
            next_stop_id: packet.next_stop_id !== undefined ? String(packet.next_stop_id) : existing.next_stop_id,
            eta_next_stop_mins: existing.eta_next_stop_mins || 3,
            delay_minutes: existing.delay_minutes || 0,
            status: (existing.status as any) || 'ON_TIME',
            telemetry_type: 'REAL_TIME',
            provenance: 'REAL_TIME',
            data_source: packet.data_source || 'TRACCAR_GPS_FEED',
            freshness_label: 'Updated just now',
          }
          return {
            ...prev,
            [packet.vehicle_id]: updated,
          }
        })
      },
      (initialVehicles) => {
        if (initialVehicles && initialVehicles.length > 0) {
          setLiveVehiclesMap((prev) => {
            const next = { ...prev }
            initialVehicles.forEach((v) => {
              next[v.vehicle_id] = { ...v, ...(next[v.vehicle_id] || {}) }
            })
            return next
          })
        }
      }
    )

    return () => {
      unsubscribe()
    }
  }, [])

  // Collect all coordinates for bounds fitting
  const allCoords: [number, number][] = route?.polyline || [
    [23.0762, 72.5855],
    [23.1600, 72.6840],
  ]

  const originCoord: [number, number] | null =
    route?.steps && route.steps.length > 0 && route.steps[0].coordinates.length > 0
      ? route.steps[0].coordinates[0]
      : null

  const destCoord: [number, number] | null =
    route?.steps && route.steps.length > 0
      ? route.steps[route.steps.length - 1].coordinates[route.steps[route.steps.length - 1].coordinates.length - 1]
      : null

  const activeVehiclesList = Object.values(liveVehiclesMap)

  return (
    <div className="u-panel relative flex h-full min-h-[420px] flex-col overflow-hidden">
      {/* Map Header Overlay */}
      <div className="u-glass absolute left-3 top-3 z-[400] flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium text-ink">
        <Navigation className="w-3.5 h-3.5 text-indigo-600" />
        <span>Tamil Nadu • Chengalpattu • Metropolitan Transit GIS</span>
      </div>



      {/* Legend Overlay with Minimize / Expand option */}
      <div className="u-glass absolute bottom-3 left-3 z-[400] max-w-[240px] overflow-hidden text-[11px] transition-all duration-200">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsLegendMinimized(!isLegendMinimized)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsLegendMinimized(!isLegendMinimized)
            }
          }}
          className="flex items-center justify-between gap-3 px-2.5 py-1.5 bg-slate-50/90 hover:bg-slate-100 cursor-pointer select-none transition-colors"
          title={isLegendMinimized ? 'Expand Transit Network' : 'Minimize Transit Network'}
        >
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
              Transit Network
            </span>
          </div>
          <button
            type="button"
            aria-label={isLegendMinimized ? 'Expand Transit Network' : 'Minimize Transit Network'}
            className="p-0.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition"
          >
            {isLegendMinimized ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {!isLegendMinimized && (
          <div className="p-2.5 pt-2 space-y-1.5 border-t border-slate-100 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-red-600 rounded flex-shrink-0"></span>
              <span className="font-medium text-slate-700">Chennai Metro Rail (CMRL Blue/Green)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-emerald-600 rounded flex-shrink-0 shadow-sm shadow-emerald-400"></span>
              <span className="font-bold text-emerald-800">MTC Electric Bus (Route 500A / 70V 🚌⚡)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-purple-600 rounded flex-shrink-0"></span>
              <span className="font-medium text-slate-700">Southern Railway Suburban (EMU)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-teal-600 rounded flex-shrink-0"></span>
              <span className="font-medium text-slate-700">Cybervale & MWC Tech Shuttle</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-orange-500 rounded flex-shrink-0"></span>
              <span className="font-medium text-slate-700">TNSTC Arterial Express Bus</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 border-t-2 border-dashed border-slate-500 flex-shrink-0"></span>
              <span className="font-medium text-slate-700">Pedestrian Walk</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Street / Satellite Switch */}
      <MapViewToggle mode={mapMode} onChange={setMapMode} floating />

      <MapContainer
        center={defaultCenter}
        zoom={12}
        className="w-full h-full min-h-[420px] z-0"
        scrollWheelZoom={true}
      >
        <MapTileLayer mode={mapMode} />

        {/* Auto fit bounds to current route */}
        {allCoords.length > 0 && <MapBoundsUpdater coordinates={allCoords} />}

        {/* Draw Polylines for each step */}
        {route?.steps.map((step, idx) => {
          const isWalk = step.step_type === 'WALK' || step.step_type === 'TRANSFER'
          let lineColor = '#64748B'
          if (step.route_color) {
            lineColor = step.route_color
          } else if (step.mode === 'METRO') {
            lineColor = '#DC2626'
          } else if (step.mode === 'MTC_ELECTRIC_BUS' || step.mode === 'GANDHINAGAR_ELECTRIC_BUS' || step.mode?.includes('ELECTRIC')) {
            lineColor = '#059669'
          } else if (step.mode === 'BRTS') {
            lineColor = '#F97316'
          } else if (step.mode === 'AMTS') {
            lineColor = '#059669'
          } else if (step.mode === 'RAIL') {
            lineColor = '#9333EA'
          } else if (step.mode === 'BUS') {
            lineColor = '#0D9488'
          }

          return (
            <Polyline
              key={idx}
              positions={step.coordinates}
              pathOptions={{
                color: lineColor,
                weight: isWalk ? 4 : 6,
                opacity: 0.9,
                dashArray: isWalk ? '6, 8' : undefined,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          )
        })}

        {/* Origin Marker */}
        {originCoord && (
          <Marker
            position={originCoord}
            icon={createPinIcon('#FF4757', 'Start')}
          >
            <Popup>
              <div className="p-1 text-xs">
                <strong className="text-slate-900 block">{route?.steps[0]?.from_name || 'Origin'}</strong>
                <span className="text-slate-500">Starting Point • Departs {route?.departure_time}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destCoord && (
          <Marker
            position={destCoord}
            icon={createPinIcon('#DC2626', 'Destination')}
          >
            <Popup>
              <div className="p-1 text-xs">
                <strong className="text-slate-900 block">{route?.steps[route.steps.length - 1]?.to_name || 'Destination'}</strong>
                <span className="text-slate-500">Final Arrival • Expected {route?.arrival_time}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Intermediate Station Nodes */}
        {route?.steps.map((step, idx) => {
          if (step.step_type === 'TRANSIT') {
            return step.coordinates.map((coord, cIdx) => (
              <Marker
                key={`${idx}-${cIdx}`}
                position={coord}
                icon={createStationIcon(step.mode, cIdx === 0 || cIdx === step.coordinates.length - 1)}
              >
                <Popup>
                  <div className="p-1 text-xs space-y-1">
                    <div className="font-bold text-slate-800">{step.mode} Transit Stop</div>
                    <div className="text-slate-600">{step.route_name}</div>
                    {step.platform_info && (
                      <div className="text-[11px] font-semibold text-iris-600">{step.platform_info}</div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))
          }
          return null
        })}

        {/* Animated Moving Vehicles on Map via MovingVehicleMarker */}
        {activeVehiclesList.map((v) => (
          <MovingVehicleMarker
            key={v.vehicle_id}
            vehicle={v}
            onClick={() => onSelectVehicle && onSelectVehicle(v.vehicle_id)}
          />
        ))}
      </MapContainer>
    </div>
  )
}
