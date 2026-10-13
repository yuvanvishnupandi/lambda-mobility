import { useState, useEffect, useMemo } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { MapContainer, Popup, Circle, Marker } from 'react-leaflet'
import { buses as defaultBuses } from '../data/buses'
import { alerts as defaultAlerts } from '../data/alerts'
import { roadHazards as defaultHazards } from '../data/roadHazards'
import { apiService } from '../services/api'
import {
  Layers,
  Bus,
  AlertTriangle,
  Sliders,
  ChevronDown,
  ChevronUp,
  X,
  MapPin,
  Crosshair,
  Route,
} from 'lucide-react'
import HeaderActions from '../components/HeaderActions'
import { PageHeader } from '../components/common/PageHeader'
import { MapTileLayer, MapViewToggle, type MapTileMode } from '../components/common/MapTileLayer'
import { eventIcon, severityTone } from '../components/common/mapIcons'
import { StatusBadge, StatusTone } from '../components/common/StatusBadge'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import { MovingVehicleMarker } from '../components/journey/MovingVehicleMarker'
import { TraccarGpsModal } from '../components/journey/TraccarGpsModal'
import { traccarApi, TraccarGpsPacket } from '../services/traccarApi'
import { LiveVehicle } from '../types/transit'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
})

const severityToneMap: Record<string, StatusTone> = {
  critical: 'rose',
  high: 'amber',
  medium: 'blue',
  low: 'slate',
}

export default function UrbanMap() {
  const [alerts, setAlerts] = useState(defaultAlerts)
  const [roadHazards, setRoadHazards] = useState(defaultHazards)
  const [mapMode, setMapMode] = useState<MapTileMode>('street')
  const [telemetryCollapsed, setTelemetryCollapsed] = useState(false)
  const [isTraccarModalOpen, setIsTraccarModalOpen] = useState(false)
  const [selected, setSelected] = useState<{ kind: 'hazard' | 'incident'; id: string } | null>(null)
  const [liveVehiclesMap, setLiveVehiclesMap] = useState<Record<string, LiveVehicle>>(() => {
    const initialMap: Record<string, LiveVehicle> = {}
    defaultBuses.forEach((b: any) => {
      initialMap[b.id] = {
        vehicle_id: b.id,
        registration: b.id,
        mode: 'BUS',
        is_electric: b.id.includes('EB') || b.id.includes('EV'),
        battery_soc_pct: 85,
        agency_code: 'MTC',
        agency_name: 'MTC Chennai & Chengalpattu Transit',
        route_number: b.route || 'MTC-500',
        route_name: b.location || 'GST Road (NH 45) Corridor',
        latitude: b.gps[0],
        longitude: b.gps[1],
        speed_kmh: b.speed || 30,
        heading: 0,
        current_location_name: b.location,
        status: 'ON_TIME',
        telemetry_type: 'REAL_TIME',
        data_source: 'ROAD_SNAPPED_TELEMETRY',
      }
    })
    return initialMap
  })

  useEffect(() => {
    apiService.getBuses('online').then(data => {
      if (data && data.length > 0) {
        setLiveVehiclesMap(prev => {
          const next = { ...prev }
          data.forEach((b: any) => {
            next[b.id] = {
              vehicle_id: b.id,
              registration: b.id,
              mode: 'BUS',
              is_electric: b.id.includes('EB') || b.id.includes('EV'),
              battery_soc_pct: 85,
              agency_code: 'MTC',
              agency_name: 'MTC Chennai & Chengalpattu Transit',
              route_number: b.route || 'MTC-500',
              route_name: b.location || 'GST Road (NH 45) Corridor',
              latitude: b.gps[0],
              longitude: b.gps[1],
              speed_kmh: b.speed || 30,
              heading: 0,
              current_location_name: b.location,
              status: 'ON_TIME',
              telemetry_type: 'REAL_TIME',
              data_source: 'ROAD_SNAPPED_TELEMETRY',
            }
          })
          return next
        })
      }
    })
    apiService.getLiveAlerts().then(data => {
      if (data && data.length > 0) setAlerts(data)
    })
    apiService.getRoadHazards().then(data => {
      if (data && data.length > 0) setRoadHazards(data)
    })

    const unsubscribe = traccarApi.connectLiveStream(
      (packet: TraccarGpsPacket) => {
        setLiveVehiclesMap(prev => ({
          ...prev,
          [packet.vehicle_id]: {
            vehicle_id: packet.vehicle_id,
            registration: packet.registration || packet.vehicle_id,
            mode: (packet.mode as any) || prev[packet.vehicle_id]?.mode || 'BUS',
            is_electric: packet.is_electric ?? prev[packet.vehicle_id]?.is_electric,
            battery_soc_pct: packet.battery_soc_pct ?? prev[packet.vehicle_id]?.battery_soc_pct,
            agency_code: prev[packet.vehicle_id]?.agency_code || 'MTC',
            agency_name: packet.operator || prev[packet.vehicle_id]?.agency_name || 'MTC Chennai & Chengalpattu Transit',
            route_number: packet.route_number || prev[packet.vehicle_id]?.route_number || 'Route 500',
            route_name: packet.route_name || prev[packet.vehicle_id]?.route_name || 'GST Road Corridor',
            route_color: packet.route_color || prev[packet.vehicle_id]?.route_color || '#2563EB',
            latitude: packet.latitude,
            longitude: packet.longitude,
            speed_kmh: packet.speed_kmh,
            heading: packet.heading,
            current_location_name: packet.location_name || prev[packet.vehicle_id]?.current_location_name || 'Transit Corridor',
            next_stop_name: packet.next_stop_name || prev[packet.vehicle_id]?.next_stop_name,
            next_stop_id: packet.next_stop_id !== undefined ? String(packet.next_stop_id) : prev[packet.vehicle_id]?.next_stop_id,
            status: 'ON_TIME',
            telemetry_type: 'REAL_TIME',
            data_source: packet.data_source || 'ROAD_SNAPPED_TELEMETRY',
          },
        }))
      },
      (initialVehicles) => {
        if (initialVehicles && initialVehicles.length > 0) {
          setLiveVehiclesMap(prev => {
            const next = { ...prev }
            initialVehicles.forEach(v => {
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

  const [layers, setLayers] = useState({
    buses: true,
    hazards: true,
    incidents: true,
  })

  const toggleLayer = (layer: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }))
  }

  const liveVehicleArray = Object.values(liveVehiclesMap)

  const selectedDetail = useMemo(() => {
    if (!selected) return null
    if (selected.kind === 'hazard') {
      const h = roadHazards.find(x => String(x.id) === selected.id)
      return h
        ? {
            title: h.type,
            kindLabel: 'Road hazard',
            severity: h.severity,
            location: h.location,
            meta: [
              ['Detected by', h.busId],
              ['Confidence', `${h.confidence}%`],
              ['Logged', h.timestamp],
              ['Status', h.status],
            ] as [string, string][],
            to: '/road-intelligence',
            cta: 'Open road intelligence',
          }
        : null
    }
    const a = alerts.find(x => String(x.id) === selected.id)
    return a
      ? {
          title: a.type,
          kindLabel: 'Incident',
          severity: a.severity,
          location: a.location,
          meta: [
            ['Source vehicle', a.busId],
            ['Confidence', `${a.confidence}%`],
            ['Reported', a.timestamp],
            ['Reference', a.id],
          ] as [string, string][],
          to: `/incident/${a.id}`,
          cta: 'Open incident dossier',
        }
      : null
  }, [selected, roadHazards, alerts])

  return (
    <DashboardLayout>
      <PageHeader
        title="Urban Map"
        eyebrow="Tamil Nadu · Chengalpattu Corridor · GST Road Arterial"
        icon={Route}
        live={{ label: 'Grid synced', tone: 'emerald' }}
        subtitle="Fleet positions, road surface hazards and incidents on the GST Road (NH 45) corridor canvas"
        actions={
          <div className="flex items-center gap-2">
            <MapViewToggle mode={mapMode} onChange={setMapMode} className="hidden sm:inline-flex" />
            <button onClick={() => setIsTraccarModalOpen(true)} className="u-btn u-btn-outline u-btn-sm">
              <Sliders className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">NMEA</span>
            </button>
            <HeaderActions />
          </div>
        }
      />

      <div className="relative flex-1 overflow-hidden">
        {/* ── Canvas ─────────────────────────────────────────────────── */}
        <MapContainer
          center={[12.8231, 80.0444]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          className="min-h-[560px]"
        >
          <MapTileLayer mode={mapMode} />

          {layers.buses &&
            liveVehicleArray.map(v => <MovingVehicleMarker key={v.vehicle_id} vehicle={v} />)}

          {layers.hazards &&
            roadHazards.map(hazard => (
              <Circle
                key={hazard.id}
                center={hazard.gps}
                radius={160}
                pathOptions={{
                  color: hazard.severity === 'critical' ? '#DC2626' : hazard.severity === 'high' ? '#D97706' : '#0C8BA6',
                  fillColor: hazard.severity === 'critical' ? '#DC2626' : hazard.severity === 'high' ? '#D97706' : '#0C8BA6',
                  fillOpacity: 0.12,
                  weight: 1.2,
                }}
              >
                <Popup>
                  <div className="space-y-1.5">
                    <p className="text-[12px] font-semibold text-ink">{hazard.type}</p>
                    <p className="text-[11.5px] text-ink-secondary">{hazard.location}</p>
                    <p className="font-mono text-[11px] text-ink-muted">
                      {hazard.busId} · {hazard.confidence}% · {hazard.timestamp}
                    </p>
                    <Link
                      to="/road-intelligence"
                      className="inline-block pt-1 text-[11.5px] font-medium text-brand-600 hover:text-brand-500"
                    >
                      Open road intelligence →
                    </Link>
                  </div>
                </Popup>
              </Circle>
            ))}

          {layers.incidents &&
            alerts.map(alert => (
              <Circle
                key={alert.id}
                center={alert.gps}
                radius={220}
                pathOptions={{
                  color: alert.severity === 'critical' ? '#DC2626' : alert.severity === 'high' ? '#D97706' : '#FF4757',
                  fillColor: alert.severity === 'critical' ? '#DC2626' : alert.severity === 'high' ? '#D97706' : '#FF4757',
                  fillOpacity: 0.09,
                  dashArray: '5, 6',
                  weight: 1.2,
                }}
              />
            ))}

          {layers.incidents &&
            alerts.map(alert => (
              <Marker
                key={`m-${alert.id}`}
                position={alert.gps}
                icon={eventIcon(alert.severity, String(selected?.id) === String(alert.id) ? 22 : 16)}
                eventHandlers={{ click: () => setSelected({ kind: 'incident', id: String(alert.id) }) }}
              >
                <Popup>
                  <div className="space-y-1.5">
                    <p className="text-[12px] font-semibold text-ink">{alert.type}</p>
                    <p className="text-[11.5px] text-ink-secondary">{alert.location}</p>
                    <p className="font-mono text-[11px] text-ink-muted">
                      {alert.busId} · {alert.confidence}% · {alert.timestamp}
                    </p>
                    <Link
                      to={`/incident/${alert.id}`}
                      className="inline-block pt-1 text-[11.5px] font-medium text-brand-600 hover:text-brand-500"
                    >
                      Open dossier →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}

          {layers.hazards &&
            roadHazards.map(hazard => (
              <Marker
                key={`hm-${hazard.id}`}
                position={hazard.gps}
                icon={eventIcon(hazard.severity, String(selected?.id) === String(hazard.id) ? 20 : 14)}
                eventHandlers={{ click: () => setSelected({ kind: 'hazard', id: String(hazard.id) }) }}
              />
            ))}
        </MapContainer>

        {/* ── Floating layer selector ────────────────────────────────── */}
        <div className="pointer-events-none absolute left-3 top-3 z-[500] flex max-w-[calc(100%-1.5rem)] flex-wrap items-start gap-2">
          <div className="u-glass pointer-events-auto flex flex-wrap items-center gap-1 p-1.5">
            <button
              onClick={() => toggleLayer('buses')}
              aria-pressed={layers.buses}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium transition-all duration-150 ${
                layers.buses ? 'bg-brand-500/90 text-white shadow-glow-sm' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Bus className="h-3.5 w-3.5" />
              Fleet · {liveVehicleArray.length}
            </button>
            <button
              onClick={() => toggleLayer('hazards')}
              aria-pressed={layers.hazards}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium transition-all duration-150 ${
                layers.hazards ? 'bg-amber-400/90 text-surface-0' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Hazards · {roadHazards.length}
            </button>
            <button
              onClick={() => toggleLayer('incidents')}
              aria-pressed={layers.incidents}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium transition-all duration-150 ${
                layers.incidents ? 'bg-rose-500/90 text-white' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Incidents · {alerts.length}
            </button>
          </div>
        </div>

        {/* ── Floating telemetry summary ─────────────────────────────── */}
        <div className="pointer-events-none absolute bottom-4 left-3 z-[500] w-[260px] max-w-[calc(100%-1.5rem)]">
          <div className="u-glass pointer-events-auto overflow-hidden">
            <button
              onClick={() => setTelemetryCollapsed(v => !v)}
              className="flex w-full items-center justify-between px-3.5 py-2.5"
              aria-expanded={!telemetryCollapsed}
            >
              <span className="flex items-center gap-2 text-[12px] font-medium text-ink">
                <span className="live-dot" />
                Spatial grid live
              </span>
              {telemetryCollapsed ? (
                <ChevronUp className="h-3.5 w-3.5 text-ink-muted" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
              )}
            </button>

            {!telemetryCollapsed && (
              <dl className="animate-fade space-y-2 border-t border-line px-3.5 py-3 text-[11.5px]">
                {[
                  ['Road probes', `${liveVehicleArray.length} vehicles`, 'text-ink'],
                  ['Surface hazards', `${roadHazards.length} flagged`, 'text-amber-600'],
                  ['Open incidents', `${alerts.length} active`, 'text-rose-600'],
                  ['Centreline snap', 'Active', 'text-emerald-600'],
                ].map(([k, v, tone]) => (
                  <div key={k} className="flex items-center justify-between gap-3">
                    <dt className="text-ink-muted">{k}</dt>
                    <dd className={`u-num font-medium ${tone}`}>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

        {/* ── Floating detail panel ─────────────────────────────────── */}
        {selectedDetail && (
          <div className="absolute right-3 top-3 z-[500] w-[320px] max-w-[calc(100%-1.5rem)] animate-slide-right">
            <div className="u-glass overflow-hidden">
              <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
                <div className="min-w-0">
                  <p className="u-overline">{selectedDetail.kindLabel}</p>
                  <p className="mt-1 truncate text-[14px] font-semibold text-ink">{selectedDetail.title}</p>
                </div>
                <button onClick={() => setSelected(null)} className="u-icon-btn h-7 w-7" aria-label="Close detail panel">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-3 px-4 py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={selectedDetail.severity} tone={severityToneMap[selectedDetail.severity] ?? 'slate'} />
                  <span className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                    <Crosshair className="h-3.5 w-3.5" />
                    {severityTone(selectedDetail.severity)}
                  </span>
                </div>

                <p className="flex items-start gap-1.5 text-[12px] text-ink-secondary">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-faint" />
                  {selectedDetail.location}
                </p>

                <dl className="divide-y divide-line/70 border-t border-line/70">
                  {selectedDetail.meta.map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-3 py-1.5">
                      <dt className="text-[11.5px] text-ink-muted">{k}</dt>
                      <dd className="u-num truncate text-[11.5px] font-medium text-ink-secondary">{v}</dd>
                    </div>
                  ))}
                </dl>

                <Link to={selectedDetail.to} className="u-btn u-btn-outline u-btn-sm w-full">
                  {selectedDetail.cta}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Floating legend ────────────────────────────────────────── */}
        <div className="pointer-events-none absolute right-3 bottom-4 z-[500] hidden md:block">
          <div className="u-glass pointer-events-auto space-y-1.5 px-3.5 py-3">
            <p className="u-overline mb-1">Legend</p>
            {[
              { c: '#FF4757', l: 'Fleet vehicle' },
              { c: '#DC2626', l: 'Critical incident' },
              { c: '#D97706', l: 'High severity' },
              { c: '#0C8BA6', l: 'Surface hazard' },
            ].map(item => (
              <p key={item.l} className="flex items-center gap-2 text-[11px] text-ink-secondary">
                <span className="u-dot" style={{ backgroundColor: item.c }} />
                {item.l}
              </p>
            ))}
          </div>
        </div>
      </div>

      <TraccarGpsModal isOpen={isTraccarModalOpen} onClose={() => setIsTraccarModalOpen(false)} />
    </DashboardLayout>
  )
}
