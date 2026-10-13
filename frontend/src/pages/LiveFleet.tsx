import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import {
  Search,
  Camera,
  Bus,
  MapPin,
  ChevronRight,
  Wifi,
  Gauge,
  Sliders,
  Crosshair,
  Activity,
  XCircle,
  Cpu,
  Clock,
  ExternalLink,
} from 'lucide-react'

import { MapContainer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import { buses as defaultBuses } from '../data/buses'
import { apiService } from '../services/api'
import HeaderActions from '../components/HeaderActions'
import { PageHeader } from '../components/common/PageHeader'
import { MetricStrip } from '../components/common/MetricStrip'
import { StatusBadge, StatusTone } from '../components/common/StatusBadge'
import { TraccarGpsModal } from '../components/journey/TraccarGpsModal'
import { traccarApi, TraccarGpsPacket } from '../services/traccarApi'
import { MapTileLayer, MapViewToggle, type MapTileMode } from '../components/common/MapTileLayer'
import { vehicleIcon } from '../components/common/mapIcons'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Smoothly pan the mini map as the selected vehicle moves along its route
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.panTo(center, { animate: true, duration: 0.6 })
  }, [center, map])
  return null
}

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

const statusTone = (status: string): StatusTone =>
  status === 'online' ? 'emerald' : status === 'processing' ? 'blue' : 'rose'

const FILTERS = ['all', 'online', 'processing', 'offline'] as const

export default function LiveFleet() {
  const [buses, setBuses] = useState(defaultBuses)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeLens, setActiveLens] = useState<'front' | 'rear' | 'left' | 'right' | 'passenger'>('front')
  const [showTraccarModal, setShowTraccarModal] = useState(false)

  const [searchParams, setSearchParams] = useSearchParams()
  const busQueryParam = searchParams.get('bus')

  const [mapMode, setMapMode] = useState<MapTileMode>('street')
  const [selectedBusId, setSelectedBusId] = useState<string>(busQueryParam || 'BUS-104')
  const detailsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    apiService.getBuses(statusFilter).then(data => {
      if (data && data.length > 0) setBuses(data)
    })

    const unsubscribe = traccarApi.connectLiveStream((packet: TraccarGpsPacket) => {
      setBuses(prev =>
        prev.map(b => {
          if (b.id.toLowerCase() === packet.vehicle_id.toLowerCase()) {
            return {
              ...b,
              gps: [packet.latitude, packet.longitude],
              speed: packet.speed_kmh,
              location: packet.location_name || b.location,
              lastUpdate: 'Live (snapped)',
              status: 'online',
            }
          }
          return b
        })
      )
    })

    return () => {
      unsubscribe()
    }
  }, [statusFilter])

  useEffect(() => {
    if (busQueryParam) setSelectedBusId(busQueryParam)
  }, [busQueryParam])

  const filteredBuses = buses.filter(bus => {
    const matchesSearch =
      bus.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || bus.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const selectedBus = buses.find(b => b.id.toLowerCase() === selectedBusId.toLowerCase()) || buses[0] || defaultBuses[0]

  const handleSelectBus = (busId: string) => {
    setSelectedBusId(busId)
    setSearchParams({ bus: busId })
    if (detailsRef.current) {
      detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const selectedActiveCameras = Object.values(selectedBus.cameras || {}).filter(Boolean).length
  const onlineCount = buses.filter(b => b.status === 'online').length
  const processingCount = buses.filter(b => b.status === 'processing').length

  const inferenceTimeline = [
    { label: 'GPS lock', detail: `${selectedBus.gps[0].toFixed(4)}, ${selectedBus.gps[1].toFixed(4)}`, state: 'ok' },
    { label: 'Optical array', detail: `${selectedActiveCameras}/5 lenses streaming`, state: selectedActiveCameras >= 4 ? 'ok' : 'warn' },
    { label: 'Inference engine', detail: selectedBus.aiStatus || 'Idle', state: selectedBus.status === 'online' ? 'ok' : 'warn' },
    { label: 'Uplink', detail: selectedBus.lastUpdate, state: 'ok' },
  ]

  return (
    <DashboardLayout>
      <PageHeader
        title="Live Fleet"
        eyebrow="Connected transit fleet · 248 probes"
        icon={Bus}
        live={{ label: 'Telemetry streaming', tone: 'emerald' }}
        subtitle="Kinematics, camera array health and on-vehicle inference state for every sensing vehicle"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setShowTraccarModal(true)} className="u-btn u-btn-outline u-btn-sm">
              <Sliders className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">NMEA config</span>
            </button>
            <HeaderActions />
          </div>
        }
      />

      <div className="flex-1 space-y-4 overflow-auto p-4 sm:p-5">
        {/* Telemetry strip */}
        <MetricStrip
          dense
          items={[
            { label: 'Fleet probes', value: '248', sublabel: 'Registered vehicles', icon: Bus },
            { label: 'Active on road', value: onlineCount || 236, sublabel: 'Transmitting live', icon: Wifi, valueTone: 'emerald' },
            { label: 'Depot standby', value: buses.filter(b => b.status === 'offline').length, sublabel: 'Bay inspection', icon: XCircle },
            { label: 'Vision channels', value: (onlineCount || 236) * 5, sublabel: '1080p @ 30fps', icon: Gauge, valueTone: 'brand' },
            { label: 'Inference busy', value: processingCount, sublabel: 'Batch classification', icon: Cpu, valueTone: 'iris' },
          ]}
        />

        {/* ── Fleet register ────────────────────────────────────────── */}
        <section className="u-panel overflow-hidden">
          <span className="u-hair" aria-hidden="true" />

          <div className="flex flex-col gap-3 border-b border-line p-3.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
              <input
                type="text"
                placeholder="Filter by vehicle ID, route or street…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="u-search u-num"
                aria-label="Filter fleet"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="u-seg" role="group" aria-label="Status filter">
                {FILTERS.map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    aria-pressed={statusFilter === st}
                    className={`u-seg-item capitalize ${statusFilter === st ? 'u-seg-item-active' : ''}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <span className="u-num text-[11.5px] text-ink-muted">{filteredBuses.length} vehicles</span>
            </div>
          </div>

          <div className="u-scroll-x">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-surface-1/60">
                <tr>
                  <th className="u-th">Vehicle</th>
                  <th className="u-th">Route</th>
                  <th className="u-th">Position</th>
                  <th className="u-th">Speed</th>
                  <th className="u-th">Camera array</th>
                  <th className="u-th">AI state</th>
                  <th className="u-th">Status</th>
                  <th className="u-th text-right">Feed</th>
                </tr>
              </thead>
              <tbody>
                {filteredBuses.map(bus => {
                  const isSelected = selectedBusId.toLowerCase() === bus.id.toLowerCase()
                  const activeCams = Object.values(bus.cameras || {}).filter(Boolean).length

                  return (
                    <tr
                      key={bus.id}
                      onClick={() => handleSelectBus(bus.id)}
                      className={`group cursor-pointer border-t border-line/70 transition-colors duration-150 ${
                        isSelected ? 'bg-brand-50/50' : 'hover:bg-surface-3/60'
                      }`}
                    >
                      <td className="u-td">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`u-dot ${bus.status === 'online' ? 'bg-emerald-400' : bus.status === 'processing' ? 'bg-brand-400' : 'bg-rose-400'}`}
                          />
                          <span className="u-num text-[12.5px] font-semibold text-ink">{bus.id}</span>
                        </div>
                        {/* Hover reveal: connection diagnostics */}
                        <div className="mt-1.5 hidden items-center gap-3 text-[10.5px] text-ink-faint opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:flex">
                          <span className="flex items-center gap-1">
                            <Radio2 /> heartbeat 1.2s
                          </span>
                          <span>RSSI −64 dBm</span>
                          <span>{bus.lastUpdate}</span>
                        </div>
                      </td>
                      <td className="u-td">
                        <span className="whitespace-nowrap rounded-md border border-line bg-surface-3/70 px-2 py-0.5 text-[11.5px] text-ink-secondary">
                          {bus.route}
                        </span>
                      </td>
                      <td className="u-td max-w-[240px]">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 shrink-0 text-ink-faint" />
                          <span className="truncate">{bus.location}</span>
                        </span>
                      </td>
                      <td className="u-td u-num whitespace-nowrap text-ink">{bus.speed} km/h</td>
                      <td className="u-td">
                        <span className="u-num text-ink-secondary">
                          {activeCams}
                          <span className="text-ink-faint">/5</span>
                        </span>
                      </td>
                      <td className="u-td">
                        <span className="flex items-center gap-1.5">
                          <span className="u-dot bg-brand-400" />
                          <span className="truncate text-[12px]">{bus.aiStatus}</span>
                        </span>
                      </td>
                      <td className="u-td">
                        <StatusBadge status={bus.status} tone={statusTone(bus.status)} size="sm" />
                      </td>
                      <td className="u-td text-right">
                        <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-brand-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          Inspect
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredBuses.length === 0 && (
            <div className="border-t border-line/70 px-4 py-10 text-center">
              <p className="text-[13px] font-medium text-ink">No vehicles match this filter</p>
              <p className="mt-1 text-[12px] text-ink-muted">Try a different vehicle ID, route or street.</p>
            </div>
          )}
        </section>

        {/* ── Selected vehicle mission control ──────────────────────── */}
        <section ref={detailsRef} className="u-panel overflow-hidden">
          <span className="u-hair" aria-hidden="true" />

          {/* Vehicle identity */}
          <div className="flex flex-wrap items-start justify-between gap-5 border-b border-line p-4 sm:p-5">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="u-num text-[24px] font-semibold leading-none tracking-tight text-ink sm:text-[28px]">
                  {selectedBus.id}
                </h2>
                <span className="whitespace-nowrap rounded-md border border-line bg-surface-3/70 px-2 py-0.5 text-[11.5px] text-ink-secondary">
                  {selectedBus.route}
                </span>
                <StatusBadge
                  status={selectedBus.status}
                  tone={statusTone(selectedBus.status)}
                  live={selectedBus.status === 'online'}
                />
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[12px] text-ink-muted">
                <MapPin className="h-3.5 w-3.5" />
                {selectedBus.location}
                <span className="text-ink-faint">·</span>
                <span className="u-num">
                  {selectedBus.gps[0].toFixed(4)}, {selectedBus.gps[1].toFixed(4)}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link to={`/vehicle-tracking`} className="u-btn u-btn-outline u-btn-sm">
                <ExternalLink className="h-3.5 w-3.5" />
                Track vehicle
              </Link>
              <button onClick={() => setShowTraccarModal(true)} className="u-btn u-btn-outline u-btn-sm">
                <Sliders className="h-3.5 w-3.5" />
                Telemetry config
              </button>
            </div>
          </div>

          {/* Vehicle health strip */}
          <div className="grid grid-cols-2 divide-line/70 border-b border-line/70 sm:grid-cols-4 sm:divide-x lg:grid-cols-5">
            {[
              { k: 'Speed', v: `${selectedBus.speed} km/h`, tone: 'text-ink' },
              { k: 'Optical array', v: `${selectedActiveCameras}/5 active`, tone: 'text-emerald-600' },
              { k: 'AI engine', v: selectedBus.aiStatus || 'Idle', tone: 'text-brand-600' },
              { k: 'Uplink', v: selectedBus.lastUpdate, tone: 'text-ink-secondary' },
              { k: 'Heartbeat', v: '1.2 s · stable', tone: 'text-emerald-600' },
            ].map(item => (
              <div key={item.k} className="px-4 py-3">
                <p className="u-overline">{item.k}</p>
                <p className={`u-num mt-1.5 truncate text-[13px] font-medium ${item.tone}`}>{item.v}</p>
              </div>
            ))}
          </div>

          {/* Map + optical feed */}
          <div className="grid grid-cols-1 divide-y divide-line/70 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            {/* Mini map */}
            <div className="p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                  <MapPin className="h-3.5 w-3.5 text-brand-500" />
                  Road-snapped position
                </h3>
                <MapViewToggle mode={mapMode} onChange={setMapMode} />
              </div>

              <div className="relative h-72 overflow-hidden rounded-xl border border-line">
                <MapContainer center={selectedBus.gps} zoom={14} style={{ height: '100%', width: '100%' }} key={selectedBus.id}>
                  <MapTileLayer mode={mapMode} />
                  <MapRecenter center={selectedBus.gps} />
                  <Circle
                    center={selectedBus.gps}
                    radius={300}
                    pathOptions={{ color: '#FF4757', fillColor: '#FF4757', fillOpacity: 0.12, weight: 1.2 }}
                  />
                  <Marker position={selectedBus.gps} icon={vehicleIcon({ tone: 'brand', speed: selectedBus.speed, selected: true })}>
                    <Popup>
                      <div className="space-y-1">
                        <p className="font-mono text-[12px] font-semibold text-ink">{selectedBus.id}</p>
                        <p className="text-[11.5px] text-ink-secondary">{selectedBus.route}</p>
                        <p className="text-[11.5px] text-ink-muted">{selectedBus.location}</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-line-soft bg-surface-1/60 px-3 py-2">
                <span className="flex items-center gap-2 text-[11.5px] text-ink-muted">
                  <span className="live-dot" />
                  GPS locked to road centreline
                </span>
                <span className="u-num text-[11.5px] text-ink-secondary">{selectedBus.lastUpdate}</span>
              </div>
            </div>

            {/* Optical stream */}
            <div className="p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                  <Camera className="h-3.5 w-3.5 text-brand-500" />
                  Optical stream · {activeLens} lens
                </h3>

                <div className="u-seg">
                  {(['front', 'rear', 'left', 'right', 'passenger'] as const).map(lens => (
                    <button
                      key={lens}
                      onClick={() => setActiveLens(lens)}
                      aria-pressed={activeLens === lens}
                      className={`u-seg-item capitalize ${activeLens === lens ? 'u-seg-item-active' : ''}`}
                    >
                      {lens.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Camera viewport — kept dark on purpose: a live video frame is content, not chrome. */}
              <div className="relative h-72 overflow-hidden rounded-xl border border-ink/30 bg-ink">
                <div className="u-scanline" aria-hidden="true" />

                {/* Reticle */}
                <div className="absolute inset-6 rounded-lg border border-dashed border-white/15" aria-hidden="true" />
                <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-400/40" aria-hidden="true" />
                <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400" aria-hidden="true" />

                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                  <span className="flex items-center gap-2 text-[11px] font-medium text-rose-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
                    LIVE · 1080p 30fps
                  </span>
                  <span className="u-num text-[11px] text-white/50">
                    {new Date().toISOString().substring(11, 19)} UTC
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 space-y-2 p-3">
                  <div className="flex items-center justify-center">
                    <span className="flex items-center gap-2 rounded-lg border border-brand-400/40 bg-[#111111] px-2.5 py-1.5 text-[11px] font-medium text-brand-200">
                      <Crosshair className="h-3.5 w-3.5" />
                      Surface analysis running · potholes & obstacles
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/15 pt-2 text-[10.5px] text-white/50">
                    <span className="u-num">
                      {selectedBus.id} // CAM-{activeLens.toUpperCase()}
                    </span>
                    <span className="u-num">confidence 96.4%</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                  { k: 'Lens', v: 'Online', tone: 'text-emerald-600' },
                  { k: 'Bitrate', v: '4.2 Mbps', tone: 'text-ink' },
                  { k: 'Pipeline', v: 'YOLOv8 edge', tone: 'text-brand-600' },
                ].map(item => (
                  <div key={item.k} className="rounded-xl border border-line-soft bg-surface-1/60 px-2 py-2">
                    <p className="u-overline">{item.k}</p>
                    <p className={`u-num mt-1 text-[12px] font-medium ${item.tone}`}>{item.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Inference timeline */}
          <div className="border-t border-line p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                <Activity className="h-3.5 w-3.5 text-brand-500" />
                Vehicle pipeline
              </h3>
              <span className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                <Clock className="h-3.5 w-3.5" />
                updated {selectedBus.lastUpdate}
              </span>
            </div>

            <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {inferenceTimeline.map((step, i) => (
                <li key={step.label} className="relative rounded-xl border border-line bg-surface-2/60 px-3.5 py-3">
                  <div className="flex items-center justify-between">
                    <span className="u-overline">{String(i + 1).padStart(2, '0')}</span>
                    <span
                      className={`u-dot ${step.state === 'ok' ? 'bg-emerald-400' : 'bg-amber-400'}`}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-2 text-[12.5px] font-medium text-ink">{step.label}</p>
                  <p className="u-num mt-1 truncate text-[11.5px] text-ink-muted">{step.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>

      <TraccarGpsModal isOpen={showTraccarModal} onClose={() => setShowTraccarModal(false)} />
    </DashboardLayout>
  )
}

/** Tiny inline heartbeat glyph used inside the hover diagnostics line. */
const Radio2 = () => (
  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden="true">
    <path d="M1 7h2l1-4 1.5 7L7 5l1 2h3" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
)
