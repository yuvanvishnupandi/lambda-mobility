import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import { MapContainer, Marker, Circle } from 'react-leaflet'
import {
  ArrowLeft,
  MapPin,
  Clock,
  Camera,
  CheckCircle2,
  Car,
  ShieldCheck,
  Users,
  FileText,
  Layers,
  Crosshair,
  ArrowRight,
} from 'lucide-react'
import { incidents } from '../data/incidents'
import { PremiumPanel } from '../components/common/PremiumPanel'
import { StatusBadge, StatusTone } from '../components/common/StatusBadge'
import { MapTileLayer, MapViewToggle, type MapTileMode } from '../components/common/MapTileLayer'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

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

const statusToneMap: Record<string, StatusTone> = {
  open: 'rose',
  investigating: 'amber',
  assigned: 'blue',
  resolved: 'emerald',
}

const TIMELINE = [
  { time: '14:32:18', event: 'Optical event detected by on-vehicle AI', state: 'done' },
  { time: '14:32:20', event: 'Bounding box and tracking telemetry locked', state: 'done' },
  { time: '14:32:23', event: 'High-confidence ANPR plate extracted', state: 'done' },
  { time: '14:32:25', event: 'Priority alert dispatched to command', state: 'done' },
  { time: '14:33:00', event: 'Case assigned to Investigation Unit 3', state: 'active' },
]

export default function IncidentDetails() {
  const { id } = useParams()
  const [mapMode, setMapMode] = useState<MapTileMode>('street')
  const incident = incidents.find(i => i.id === id) || incidents[0]

  return (
    <DashboardLayout>
      {/* ── Case header ─────────────────────────────────────────────── */}
      <header className="relative z-20 border-b border-[#E5E5DF] bg-[#FFFFFF] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/incident-center" className="u-icon-btn" aria-label="Back to incident center">
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="u-num text-[19px] font-semibold tracking-tight text-ink sm:text-[21px]">
                  {incident.id}
                </h1>
                <StatusBadge status={incident.severity} tone={severityToneMap[incident.severity] ?? 'slate'} />
                <StatusBadge status={incident.status} tone={statusToneMap[incident.status] ?? 'slate'} />
              </div>
              <p className="u-overline mt-1 truncate">
                {incident.type} · automated optical detection · {incident.location}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="u-chip u-chip-mint">
              <span className="live-dot" />
              Case file active
            </span>
            <Link to="/vehicle-tracking" className="u-btn u-btn-primary u-btn-sm">
              Track linked vehicle
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* ── Evidence column ─────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Overview */}
            <section className="u-panel overflow-hidden">
              <span className="u-hair" aria-hidden="true" />

              <div className="u-panel-head">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface-3 text-rose-600">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <h2 className="text-[13px] font-semibold text-ink">Detection summary</h2>
                    <p className="text-[11px] text-ink-muted">What the network recorded</p>
                  </div>
                </div>
                <span className="u-num text-[11px] text-ink-muted">
                  {incident.gps[0].toFixed(4)}, {incident.gps[1].toFixed(4)}
                </span>
              </div>

              <div className="grid grid-cols-2 divide-line/70 sm:grid-cols-4 sm:divide-x">
                {[
                  ['Status', incident.status, 'text-amber-600'],
                  ['Confidence', `${incident.confidence}%`, 'text-emerald-600'],
                  ['Location', incident.location, 'text-ink'],
                  ['Sensed by', incident.busId, 'text-brand-600'],
                ].map(([k, v, tone]) => (
                  <div key={k} className="px-4 py-3.5">
                    <p className="u-overline">{k}</p>
                    <p className={`mt-1.5 truncate text-[13px] font-medium capitalize ${tone}`}>{v}</p>
                  </div>
                ))}
              </div>

              {incident.description && (
                <p className="border-t border-line/70 px-4 py-3.5 text-[12.5px] leading-relaxed text-ink-secondary sm:px-5">
                  {incident.description}
                </p>
              )}
            </section>

            {/* Timeline */}
            <section className="u-panel p-4 sm:p-5">
              <div className="mb-5 flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface-3 text-brand-500">
                  <Clock className="h-3.5 w-3.5" />
                </span>
                <h2 className="text-[13px] font-semibold text-ink">Investigation timeline</h2>
              </div>

              <ol className="relative space-y-4 pl-4">
                <span className="u-timeline-rail top-1.5" aria-hidden="true" />
                {TIMELINE.map((item, index) => (
                  <li key={index} className="relative">
                    <span
                      className={`absolute -left-4 top-1 h-3 w-3 rounded-full border-2 border-surface-2 ${
                        item.state === 'done' ? 'bg-emerald-400' : 'bg-brand-500'
                      }`}
                      aria-hidden="true"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[12.5px] font-medium text-ink">{item.event}</span>
                      <span className="u-num text-[11px] text-ink-faint">{item.time}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Vehicle telemetry */}
            {incident.vehicleInfo && (
              <section className="u-panel overflow-hidden">
                <span className="u-hair" aria-hidden="true" />
                <div className="u-panel-head">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface-3 text-iris-500">
                      <Car className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <h2 className="text-[13px] font-semibold text-ink">Flagged vehicle</h2>
                      <p className="text-[11px] text-ink-muted">Automatic number plate recognition</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
                  <div className="rounded-xl border border-line bg-surface-1/60 p-4">
                    <p className="u-overline">Registration</p>
                    <p className="u-num mt-2 text-[22px] font-semibold tracking-[0.06em] text-ink">
                      {incident.vehicleInfo.registration}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      ANPR confidence {incident.confidence}%
                    </p>
                  </div>

                  <dl className="divide-y divide-line/70 rounded-xl border border-line/70 bg-surface-1/40 px-3.5 py-1">
                    {[
                      ['Vehicle model', incident.vehicleInfo.type],
                      ['Detected exterior', incident.vehicleInfo.color],
                      ['Heading', incident.vehicleInfo.direction],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-3 py-2.5">
                        <dt className="text-[11.5px] text-ink-muted">{k}</dt>
                        <dd className="text-[11.5px] font-medium text-ink-secondary">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </section>
            )}

            {/* Optical evidence */}
            <section className="u-panel p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-[13px] font-semibold text-ink">Optical evidence capture</h2>
                <span className="u-chip u-chip-rose">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
                  REC
                </span>
              </div>

              {/* Camera viewport — kept dark on purpose: a live video frame is content, not chrome. */}
              <div className="relative aspect-video overflow-hidden rounded-xl border border-ink/30 bg-ink">
                <div className="u-scanline" aria-hidden="true" />
                <div className="absolute inset-5 rounded-lg border border-dashed border-white/15" aria-hidden="true" />

                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-md border border-white/20 bg-[#111111] px-2 py-1 font-mono">
                  <Camera className="h-3.5 w-3.5 text-white/60" />
                  <span className="u-num text-[10.5px] text-white/90">RAW FRAME #{incident.id}-01</span>
                </div>

                {incident.vehicleInfo && (
                  <div className="absolute right-[16%] top-1/3 rounded-lg border border-cyan-400/60 bg-[#111111] p-3 font-mono shadow-md">
                    <p className="u-num text-[11.5px] font-medium text-cyan-300">
                      ANPR {incident.vehicleInfo.registration}
                    </p>
                    <p className="u-num mt-1 text-[10.5px] text-emerald-300">CONFIDENCE {incident.confidence}%</p>
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-white/15 px-4 py-2.5">
                  <span className="u-num text-[10.5px] text-white/50">{incident.busId} · CAM-FRONT</span>
                  <span className="u-num flex items-center gap-1.5 text-[10.5px] text-white/50">
                    <Crosshair className="h-3 w-3" />
                    tracked 4.2s
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <Link to="/vehicle-tracking" className="u-btn u-btn-primary u-btn-sm">
                  Track across fleet
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link to="/urban-map" className="u-btn u-btn-outline u-btn-sm">
                  <Layers className="h-3.5 w-3.5" />
                  View on map
                </Link>
                <button className="u-btn u-btn-ghost u-btn-sm">
                  <FileText className="h-3.5 w-3.5" />
                  Export dossier
                </button>
              </div>
            </section>
          </div>

          {/* ── Case sidebar ────────────────────────────────────────── */}
          <div className="space-y-4">
            <PremiumPanel
              flush
              title="Geo-location"
              subtitle="Precise incident coordinates"
              icon={MapPin}
              actions={<MapViewToggle mode={mapMode} onChange={setMapMode} />}
            >
              <div className="relative h-56">
                <MapContainer center={incident.gps} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                  <MapTileLayer mode={mapMode} />
                  <Circle
                    center={incident.gps}
                    radius={300}
                    pathOptions={{ color: '#DC2626', fillColor: '#DC2626', fillOpacity: 0.14, weight: 1.2 }}
                  />
                  <Marker position={incident.gps} />
                </MapContainer>
              </div>
              <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
                <span className="u-overline">GPS</span>
                <span className="u-num text-[11.5px] text-ink-secondary">{incident.gps.join(', ')}</span>
              </div>
            </PremiumPanel>

            <section className="u-panel p-4">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface-3 text-emerald-600">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-[13px] font-semibold text-ink">Audit summary</h3>
              </div>

              <dl className="divide-y divide-line/70">
                {[
                  { icon: Clock, k: 'Detection time', v: incident.time },
                  { icon: MapPin, k: 'Location', v: incident.location },
                  { icon: Camera, k: 'Sensing vehicle', v: incident.busId },
                  { icon: CheckCircle2, k: 'Confidence', v: `${incident.confidence}%` },
                ].map(row => (
                  <div key={row.k} className="flex items-center gap-3 py-2.5">
                    <row.icon className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
                    <dt className="flex-1 text-[11.5px] text-ink-muted">{row.k}</dt>
                    <dd className="u-num truncate text-[11.5px] font-medium text-ink-secondary">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="u-panel p-4">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface-3 text-brand-500">
                  <Users className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-[13px] font-semibold text-ink">Assigned teams</h3>
              </div>

              <ul className="space-y-2">
                {[
                  { name: 'Investigation Unit 3', role: 'Primary case lead' },
                  { name: 'Traffic command & control', role: 'Civil support dispatch' },
                ].map(team => (
                  <li key={team.name} className="rounded-xl border border-line bg-surface-2/60 px-3.5 py-2.5">
                    <p className="text-[12.5px] font-medium text-ink">{team.name}</p>
                    <p className="mt-0.5 text-[11px] text-ink-muted">{team.role}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
