import { useState, useEffect, useMemo } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { MapContainer, Marker, Popup, Circle } from 'react-leaflet'
import {
  Activity,
  Bus,
  Layers,
  AlertTriangle,
  ShieldCheck,
  Play,
  Square,
  MapPin,
  ChevronRight,
  Crosshair,
  Waypoints,
} from 'lucide-react'

import { buses as defaultBuses } from '../data/buses'
import { alerts as defaultAlerts } from '../data/alerts'
import { apiService } from '../services/api'
import { roadSimulator } from '../services/roadSimulator'
import { Link } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { PageHeader } from '../components/common/PageHeader'
import { MetricStrip } from '../components/common/MetricStrip'
import { StatusBadge, StatusTone } from '../components/common/StatusBadge'
import { MapTileLayer, MapViewToggle, type MapTileMode } from '../components/common/MapTileLayer'
import { vehicleIcon, eventIcon, severityTone } from '../components/common/mapIcons'
import { EmptyState } from '../components/common/EmptyState'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet default icon issue
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

export default function CommandCenter() {
  const { user } = useUser()
  const isCommuter = user?.account_type === 'USER'
  const [mapMode, setMapMode] = useState<MapTileMode>('street')
  const [demoMode, setDemoMode] = useState(false)
  const [buses, setBuses] = useState(defaultBuses)
  const [alerts, setAlerts] = useState(defaultAlerts)
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null)
  const [stats, setStats] = useState({
    activeBuses: 248,
    onlineBuses: 236,
    detections: 12846,
    incidents: 18,
    criticalAlerts: 4,
  })

  // Live stats, alerts and road-snapped vehicle movement
  useEffect(() => {
    apiService.getDashboardSummary().then(data => {
      setStats(prev => ({ ...prev, ...data }))
    })
    apiService.getLiveAlerts().then(data => {
      if (data && data.length > 0) setAlerts(data)
    })
    apiService.getBuses('online').then(data => {
      if (data && data.length > 0) setBuses(data)
    })

    const unsubscribe = roadSimulator.subscribeBuses((liveBuses) => {
      setBuses(liveBuses.filter(b => b.status === 'online'))
    })

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!demoMode) {
      apiService.stopDemoMode()
      return
    }

    apiService.startDemoMode()

    const interval = setInterval(() => {
      apiService.getDashboardSummary().then(data => {
        setStats(prev => ({ ...prev, ...data }))
      })
      apiService.getLiveAlerts().then(data => {
        if (data && data.length > 0) setAlerts(data)
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [demoMode])

  const selectedAlert = useMemo(
    () => alerts.find(a => String(a.id) === selectedAlertId) ?? alerts[0],
    [alerts, selectedAlertId]
  )

  const criticalCount = alerts.filter(a => a.severity === 'critical').length

  return (
    <DashboardLayout>
      <PageHeader
        title={isCommuter ? "Citizen Corridor Command" : "Command Center"}
        eyebrow={user?.corridor ? `Corridor Live · ${user.corridor}` : "Operations · Tamil Nadu · Chengalpattu Corridor"}
        icon={Activity}
        live={{ label: isCommuter ? 'Corridor telemetry live' : 'All systems operational', tone: 'emerald' }}
        subtitle={
          isCommuter
            ? `${stats.onlineBuses} transit probes streaming · ${alerts.length} verified corridor updates · Personalized for ${user?.name || 'Commuter'}`
            : `${stats.onlineBuses} vehicles transmitting · ${alerts.length} events in feed · ${criticalCount} critical escalations`
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDemoMode(!demoMode)}
              className={`u-btn u-btn-sm ${demoMode ? 'u-btn-danger' : 'u-btn-outline'}`}
              aria-pressed={demoMode}
            >
              {demoMode ? (
                <>
                  <Square className="h-3 w-3 fill-current" />
                  <span className="hidden sm:inline">Pause stream</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 fill-current" />
                  <span className="hidden sm:inline">Live stream</span>
                </>
              )}
            </button>
          </div>
        }
      />

      <div className="flex-1 space-y-4 overflow-auto p-4 sm:p-5">
        {/* Operational telemetry strip */}
        <MetricStrip
          dense
          items={[
            { label: 'Fleet active', value: stats.activeBuses, sublabel: 'Probes transmitting', icon: Bus },
            { label: 'AI events today', value: '12.8K', sublabel: 'On-vehicle inferences', icon: Activity },
            { label: 'Road hazards', value: '327', sublabel: 'Awaiting repair', icon: Layers, valueTone: 'amber' },
            { label: 'Open incidents', value: stats.incidents, sublabel: `${stats.criticalAlerts} priority`, icon: AlertTriangle, valueTone: 'rose' },
            { label: 'Detection confidence', value: '94.6%', sublabel: 'Network benchmark', icon: ShieldCheck, valueTone: 'emerald' },
          ]}
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* ── Live city canvas ─────────────────────────────────────── */}
          <section className="u-panel flex min-h-[560px] flex-col overflow-hidden lg:min-h-[640px]">
            <span className="u-hair" aria-hidden="true" />

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] text-[#E05238] font-bold">■</span>
                <h2 className="text-[13px] font-semibold text-ink">Regional operations canvas</h2>
                <span className="u-overline hidden sm:inline">GIS · live</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="u-num hidden rounded-lg border border-line bg-surface-3/60 px-2 py-1 text-[11px] text-ink-muted sm:inline">
                  {buses.length} nodes
                </span>
                <MapViewToggle mode={mapMode} onChange={setMapMode} />
              </div>
            </div>

            <div className="relative flex-1">
              <div className="u-scanline z-[450]" aria-hidden="true" />

              <MapContainer
                center={[12.8231, 80.0444]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
              >
                <MapTileLayer mode={mapMode} />

                {/* Fleet nodes */}
                {buses.map(bus => (
                  <Marker
                    key={bus.id}
                    position={bus.gps}
                    icon={vehicleIcon({ tone: 'brand', speed: bus.speed })}
                  >
                    <Popup>
                      <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="font-mono text-[12px] font-semibold text-ink">{bus.id}</span>
                          <span className="text-[10px] uppercase tracking-wider text-ink-muted">{bus.route}</span>
                        </div>
                        <p className="text-[11.5px] text-ink-secondary">{bus.location}</p>
                        <p className="font-mono text-[11px] text-ink-muted">
                          {bus.speed} km/h · {bus.status}
                        </p>
                        <Link
                          to={`/live-fleet?bus=${bus.id}`}
                          className="inline-block pt-1 text-[11.5px] font-medium text-brand-600 hover:text-brand-500"
                        >
                          Open vehicle feed →
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Incident radius zones */}
                {alerts.map(alert => (
                  <Circle
                    key={`zone-${alert.id}`}
                    center={alert.gps}
                    radius={200}
                    pathOptions={{
                      color: alert.severity === 'critical' ? '#DC2626' : alert.severity === 'high' ? '#D97706' : '#FF4757',
                      fillColor: alert.severity === 'critical' ? '#DC2626' : alert.severity === 'high' ? '#D97706' : '#FF4757',
                      fillOpacity: 0.12,
                      weight: 1.2,
                    }}
                  />
                ))}

                {/* Incident markers */}
                {alerts.map(alert => (
                  <Marker
                    key={alert.id}
                    position={alert.gps}
                    icon={eventIcon(alert.severity, String(alert.id) === String(selectedAlert?.id) ? 22 : 16)}
                  >
                    <Popup>
                      <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-[12px] font-semibold text-ink">{alert.type}</span>
                          <span className="text-[10px] uppercase tracking-wider text-ink-muted">{alert.severity}</span>
                        </div>
                        <p className="text-[11.5px] text-ink-secondary">{alert.location}</p>
                        <p className="font-mono text-[11px] text-ink-muted">
                          {alert.busId} · {alert.confidence}% · {alert.timestamp}
                        </p>
                        <Link
                          to={`/incident/${alert.id}`}
                          className="inline-block pt-1 text-[11.5px] font-medium text-brand-600 hover:text-brand-500"
                        >
                          Open incident dossier →
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* Floating canvas overlays - SOLID WHITE, ZERO BLUR */}
              <div className="pointer-events-none absolute bottom-4 left-4 z-[400] flex flex-wrap gap-2">
                <div className="pointer-events-auto border border-[#E5E5DF] bg-[#FFFFFF] px-3 py-2 shadow-sm font-mono text-xs">
                  <p className="text-[10px] uppercase font-bold text-[#666662] tracking-wider">Snap quality</p>
                  <p className="mt-0.5 text-[12px] font-bold text-emerald-600">100% centreline</p>
                </div>
                <div className="pointer-events-auto border border-[#E5E5DF] bg-[#FFFFFF] px-3 py-2 shadow-sm font-mono text-xs">
                  <p className="text-[10px] uppercase font-bold text-[#666662] tracking-wider">Open incidents</p>
                  <p className="mt-0.5 text-[12px] font-bold text-rose-600">{alerts.length} active</p>
                </div>
              </div>

              <div className="pointer-events-none absolute right-4 top-4 z-[400] hidden lg:block">
                <div className="pointer-events-auto border border-[#E5E5DF] bg-[#FFFFFF] p-3 shadow-sm space-y-1.5 font-mono text-xs">
                  <p className="text-[10px] uppercase font-bold text-[#666662] tracking-wider mb-1">Corridor Legend</p>
                  {[
                    { c: '#E05238', l: 'Fleet node' },
                    { c: '#DC2626', l: 'Critical event' },
                    { c: '#D97706', l: 'High severity' },
                    { c: '#059669', l: 'Nominal corridor' },
                  ].map(item => (
                    <p key={item.l} className="flex items-center gap-2 text-[11px] text-[#2E2E2C]">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.c }} />
                      {item.l}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Live operations feed ─────────────────────────────────── */}
          <section className="u-panel flex max-h-[640px] flex-col overflow-hidden">
            <span className="u-hair" aria-hidden="true" />

            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  <span className="absolute h-1.5 w-1.5 animate-ping-slow rounded-full bg-rose-400" />
                </span>
                <h2 className="text-[13px] font-semibold text-ink">Live event feed</h2>
              </div>
              <span className="u-num text-[11px] text-ink-muted">{alerts.length} events</span>
            </div>

            <div className="u-scroll flex-1 space-y-2 overflow-y-auto p-3">
              {alerts.length === 0 && (
                <EmptyState title="No active events" description="Detections will appear here as the fleet moves." />
              )}

              {alerts.map(alert => {
                const isSelected = String(alert.id) === String(selectedAlert?.id)
                return (
                  <button
                    key={alert.id}
                    onClick={() => setSelectedAlertId(String(alert.id))}
                    className={`group relative w-full overflow-hidden border px-3.5 py-3 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-[#111111] bg-[#F7F7F4]'
                        : 'border-[#E5E5DF] bg-[#FFFFFF] hover:border-[#111111]'
                    }`}
                  >
                    <span
                      className="absolute inset-y-0 left-0 w-[3px]"
                      style={{
                        backgroundColor:
                          alert.severity === 'critical' ? '#DC2626' : alert.severity === 'high' ? '#D97706' : '#E05238',
                        opacity: isSelected ? 1 : 0.6,
                      }}
                      aria-hidden="true"
                    />

                    <div className="flex items-start justify-between gap-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-ink">{alert.type}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{alert.location}</span>
                        </p>
                      </div>
                      <StatusBadge status={alert.severity} tone={severityToneMap[alert.severity] ?? 'slate'} size="sm" />
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line/70 pt-2 font-mono">
                      <span className="text-[10.5px] text-ink-muted">
                        {alert.busId} · {alert.confidence}% · {alert.timestamp}
                      </span>
                      <Link
                        to={`/incident/${alert.id}`}
                        onClick={e => e.stopPropagation()}
                        className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#111111] hover:text-[#E05238] transition-colors"
                      >
                        Dossier
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
              <Link
                to="/incident-center"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#111111] hover:text-[#E05238] transition-colors font-mono"
              >
                All queued incidents
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              <span className="flex items-center gap-1.5 text-[11px] text-ink-faint font-mono">
                <Crosshair className="h-3.5 w-3.5" />
                {severityTone(selectedAlert?.severity ?? 'medium')}
              </span>
            </div>
          </section>
        </div>

        {/* ── Speakeasy Mac Terminal Telemetry Card & ML Visualizations ───────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Live Speakeasy Mac Terminal Console */}
          <div className="lg:col-span-7 relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E5E5DF] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#FF5F56] inline-block" />
                <span className="h-3 w-3 rounded-full bg-[#FFBD2E] inline-block" />
                <span className="h-3 w-3 rounded-full bg-[#27C93F] inline-block" />
                <span className="ml-2 font-mono text-[11px] text-[#666662]">
                  terminal — lambda-kafka-consumer — 248 probes
                </span>
              </div>
              <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-bold uppercase">
                STREAMING
              </span>
            </div>

            <div className="bg-[#111111] p-4 font-mono text-[11px] text-emerald-400 space-y-1.5 overflow-x-auto selection:bg-white selection:text-black">
              <div className="text-white/60">
                $ kafka-console-consumer --bootstrap-server localhost:9092 --topic corridor-telemetry --group lambda-core
              </div>
              <div className="text-white/90">
                [KAFKA-OFFSET: 489426] :: Partition 2 · Rebalance complete · 248 producers attached
              </div>
              <div className="text-emerald-300">
                ✔ PROBE-TN-11-N-4892: lat: 12.8231, lon: 80.0444 | vel: 48.5 km/h | PCI: 0.88 | SparkRF: OPTIMAL | Zone: GST-Corridor
              </div>
              <div className="text-amber-300">
                ⚠ PROBE-TN-11-N-0891: lat: 12.8390, lon: 80.0512 | vel: 32.1 km/h | PCI: 0.72 | SparkRF: CONGESTED | Zone: Guduvanchery Flyover
              </div>
              <div className="text-emerald-300">
                ✔ PROBE-TN-11-N-1204: lat: 12.8055, lon: 80.0381 | vel: 54.0 km/h | PCI: 0.94 | SparkRF: FREE_FLOW | Zone: Maraimalai Nagar
              </div>
              <div className="text-rose-400">
                ⚡ HAZARD_DETECT: Pothole severity 0.88 on NH 45 (Near SRM IST) | Automated case #INC-892 dispatched to municipal queue
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E5E5DF] font-mono text-[10.5px] text-[#666662]">
              <span>Active model: Spark MLlib Random Forest v2.4</span>
              <span>K-Means Hotspotting: 5 Clusters Active</span>
            </div>
          </div>

          {/* ML Telemetry Inferences & Velocity Distribution */}
          <div className="lg:col-span-5 relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#E5E5DF] pb-3 mb-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                  Spark ML Telemetry Classifier
                </span>
                <span className="font-mono text-[10px] text-[#666662]">96.1% Confidence</span>
              </div>

              {/* Progress bars / Metrics */}
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#666662]">Free-flow Velocity (&gt;45 km/h)</span>
                    <span className="font-bold text-[#111111]">68.4%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#F4F4F0] overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[68.4%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#666662]">Moderate Kinematic Impedance</span>
                    <span className="font-bold text-[#111111]">22.1%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#F4F4F0] overflow-hidden">
                    <div className="h-full bg-amber-500 w-[22.1%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#666662]">Critical Bottleneck / Delay</span>
                    <span className="font-bold text-[#111111]">9.5%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#F4F4F0] overflow-hidden">
                    <div className="h-full bg-rose-500 w-[9.5%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E5DF] mt-4 flex items-center justify-between text-xs font-mono">
              <span className="text-[#666662]">Poisson Arrival Rate:</span>
              <span className="font-bold text-[#111111]">λ = 4.2 vehicles / min</span>
            </div>
          </div>
        </section>

        {/* ── Dynamic Corridor summary rows ─────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[
            {
              title: 'Operating Corridor Status',
              icon: Waypoints,
              rows: [
                { k: 'GST Road Arterial (NH 45)', v: 'Nominal flow · 12 hazards' },
                { k: 'Tambaram - Chengalpattu Link', v: 'Normal · 6 hazards' },
                { k: 'Singaperumal Koil Junction (SH 57)', v: 'Moderate · 8 hazards' },
              ],
              to: '/road-intelligence',
              cta: 'Road intelligence',
            },
            {
              title: 'Fleet telemetry readiness',
              icon: Bus,
              rows: [
                { k: 'Transmitting', v: `${stats.onlineBuses} vehicles` },
                { k: 'Depot standby', v: `${Math.max(stats.activeBuses - stats.onlineBuses, 0)} vehicles` },
                { k: 'Camera channels', v: `${stats.onlineBuses * 5} streams` },
              ],
              to: '/live-fleet',
              cta: 'Fleet console',
            },
            {
              title: 'Transit network telemetry',
              icon: Layers,
              rows: [
                { k: 'Suburban Rail (Chengalpattu)', v: 'On-schedule' },
                { k: 'MTC Express Feeders', v: '98% on-time' },
                { k: 'Corridor Sensor Health', v: '100% telemetry online' },
              ],
              to: '/journey-planner',
              cta: 'Journey planner',
            },
          ].map(card => (
            <div key={card.title} className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-4 shadow-sm hover:border-[#111111] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <card.icon className="h-3.5 w-3.5 text-[#E05238]" />
                  <h3 className="text-[13px] font-semibold text-[#111111]">{card.title}</h3>
                </div>
                <Link
                  to={card.to}
                  className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-[#666662] transition-colors hover:text-[#111111]"
                >
                  {card.cta}
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <dl className="mt-3 divide-y divide-[#E5E5DF] border-t border-[#E5E5DF]">
                {card.rows.map(row => (
                  <div key={row.k} className="flex items-center justify-between py-2">
                    <dt className="text-[12px] text-[#666662]">{row.k}</dt>
                    <dd className="font-mono text-[12px] font-medium text-[#111111]">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </section>
      </div>
    </DashboardLayout>
  )
}
