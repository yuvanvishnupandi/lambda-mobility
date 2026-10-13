import { useState, useEffect, useMemo } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { MapContainer, Marker, Circle } from 'react-leaflet'
import {
  Search,
  AlertTriangle,
  Siren,
  ListChecks,
  SearchCheck,
  CheckCircle2,
  ClipboardList,
  MapPin,
  ChevronRight,
  Camera,
  Clock,
  Car,
  FileText,
  Layers,
} from 'lucide-react'
import { incidents as defaultIncidents } from '../data/incidents'
import { apiService } from '../services/api'
import { Link } from 'react-router-dom'
import HeaderActions from '../components/HeaderActions'
import { PageHeader } from '../components/common/PageHeader'
import { MetricStrip } from '../components/common/MetricStrip'
import { StatusBadge, StatusTone } from '../components/common/StatusBadge'
import { MapTileLayer, MapViewToggle, type MapTileMode } from '../components/common/MapTileLayer'
import { EmptyState } from '../components/common/EmptyState'
import { severityTone } from '../components/common/mapIcons'
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

export default function IncidentCenter() {
  const [incidents, setIncidents] = useState(defaultIncidents)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mapMode, setMapMode] = useState<MapTileMode>('street')

  useEffect(() => {
    apiService.getIncidents().then(data => {
      if (data && data.length > 0) setIncidents(data)
    })
  }, [])

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch =
      incident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter
    return matchesSearch && matchesStatus && matchesSeverity
  })

  const selected = useMemo(
    () => filteredIncidents.find(i => i.id === selectedId) ?? filteredIncidents[0] ?? null,
    [filteredIncidents, selectedId]
  )

  const criticalCount = incidents.filter(i => i.severity === 'critical').length

  const caseHistory = selected
    ? [
        { time: selected.time, label: 'Optical event detected', detail: `On-vehicle AI · ${selected.busId}`, state: 'done' },
        { time: selected.time, label: 'Classification assigned', detail: `${selected.type} · ${selected.confidence}% confidence`, state: 'done' },
        { time: selected.time, label: 'Dispatch decision', detail: `Status: ${selected.status}`, state: selected.status === 'resolved' ? 'done' : 'active' },
        {
          time: selected.time,
          label: selected.status === 'resolved' ? 'Case closed' : 'Field response pending',
          detail: selected.status === 'resolved' ? 'Cleared by enforcement unit' : 'Queued with traffic control',
          state: selected.status === 'resolved' ? 'done' : 'pending',
        },
      ]
    : []

  return (
    <DashboardLayout>
      <PageHeader
        title="Incident Center & Dispatch Triage"
        eyebrow="Corridor Enforcement · Tamil Nadu · GST Road (NH 45)"
        icon={AlertTriangle}
        live={{ label: `${criticalCount} critical escalations`, tone: 'rose' }}
        subtitle="Autonomous detection triage, vehicle plate correlation, and corridor safety response"
        actions={<HeaderActions />}
      />

      <div className="flex-1 space-y-4 overflow-auto p-4 sm:p-5">
        <MetricStrip
          dense
          items={[
            { label: 'Total incidents', value: incidents.length, sublabel: 'Logged in window', icon: ClipboardList },
            { label: 'Critical', value: criticalCount, sublabel: 'Immediate action', icon: Siren, valueTone: 'rose' },
            { label: 'High priority', value: incidents.filter(i => i.severity === 'high').length, sublabel: 'Enforcement alerted', icon: AlertTriangle, valueTone: 'amber' },
            { label: 'Investigating', value: incidents.filter(i => i.status === 'investigating').length, sublabel: 'Review in progress', icon: SearchCheck, valueTone: 'iris' },
            { label: 'Resolved today', value: incidents.filter(i => i.status === 'resolved').length, sublabel: 'Cases closed', icon: CheckCircle2, valueTone: 'emerald' },
          ]}
        />

        {/* Filter bar with Speakeasy styling */}
        <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-3.5 shadow-sm flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <span className="speakeasy-notch-marker -top-1 -left-1" />
          <span className="speakeasy-notch-marker -top-1 -right-1" />

          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8C8C85]" />
            <input
              type="text"
              placeholder="Search by incident ID, type or location…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full border border-[#D5D5CF] bg-[#FFFFFF] py-2 pl-9 pr-3 text-xs font-sans text-[#111111] placeholder:text-[#8C8C85] focus:outline-none focus:border-[#111111]"
              aria-label="Search incidents"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="border border-[#D5D5CF] bg-[#FFFFFF] py-1.5 px-2.5 text-xs font-mono text-[#111111] focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-[#D5D5CF] bg-[#FFFFFF] py-1.5 px-2.5 text-xs font-mono text-[#111111] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="assigned">Assigned</option>
              <option value="resolved">Resolved</option>
            </select>

            <span className="text-xs font-mono text-[#666662]">{filteredIncidents.length} Cases</span>
          </div>
        </div>

        {/* Master–detail */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
          {/* Feed */}
          <section className="relative border border-[#D5D5CF] bg-[#FFFFFF] flex max-h-[720px] flex-col overflow-hidden shadow-sm">
            <span className="speakeasy-notch-marker -top-1 -left-1" />
            <span className="speakeasy-notch-marker -top-1 -right-1" />
            <span className="speakeasy-notch-marker -bottom-1 -left-1" />
            <span className="speakeasy-notch-marker -bottom-1 -right-1" />

            <div className="flex items-center justify-between border-b border-[#E5E5DF] bg-[#FBFBFA] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center border border-[#D5D5CF] bg-[#FFFFFF] text-rose-600">
                  <ListChecks className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h2 className="text-xs font-semibold uppercase font-mono tracking-wider text-[#111111]">Incident Queue</h2>
                  <p className="text-[11px] text-[#666662] font-mono">Real-time edge sensor detections</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#111111]">{filteredIncidents.length}</span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {filteredIncidents.length === 0 && (
                <EmptyState
                  title="No incidents match these filters"
                  description="Clear the severity or status filter to see the full queue."
                  icon={SearchCheck}
                />
              )}

              {filteredIncidents.map(incident => {
                const isActive = selected?.id === incident.id
                const tone = severityTone(incident.severity)
                const rail =
                  tone === 'rose' ? '#DC2626' : tone === 'amber' ? '#D97706' : tone === 'brand' ? '#FF4757' : '#78716C'

                return (
                  <button
                    key={incident.id}
                    onClick={() => setSelectedId(incident.id)}
                    className={`group relative w-full overflow-hidden border p-3.5 text-left transition-all ${
                      isActive
                        ? 'border-[#111111] bg-[#FBFBFA]'
                        : 'border-[#E5E5DF] bg-[#FFFFFF] hover:border-[#111111]'
                    }`}
                  >
                    <span
                      className="absolute inset-y-0 left-0 w-[3px]"
                      style={{ backgroundColor: rail, opacity: isActive ? 1 : 0.6 }}
                      aria-hidden="true"
                    />
                    <div className="flex items-start justify-between gap-2.5 pl-1">
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono text-[#8C8C85]">{incident.id}</p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-[#111111]">{incident.type}</p>
                      </div>
                      <StatusBadge status={incident.severity} tone={severityToneMap[incident.severity] ?? 'slate'} size="sm" />
                    </div>

                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#666662] pl-1 font-mono">
                      <MapPin className="h-3 w-3 shrink-0 text-[#E05238]" />
                      <span className="truncate">{incident.location}</span>
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#E5E5DF] pt-2 pl-1 font-mono text-[10px] text-[#8C8C85]">
                      <span>
                        {incident.busId} · {incident.confidence}% · {incident.time}
                      </span>
                      <span className={`uppercase font-bold ${isActive ? 'text-[#111111]' : 'text-[#8C8C85]'}`}>
                        {incident.status}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Detail */}
          <section className="relative border border-[#D5D5CF] bg-[#FFFFFF] overflow-hidden shadow-sm">
            <span className="speakeasy-notch-marker -top-1 -left-1" />
            <span className="speakeasy-notch-marker -top-1 -right-1" />
            <span className="speakeasy-notch-marker -bottom-1 -left-1" />
            <span className="speakeasy-notch-marker -bottom-1 -right-1" />

            {!selected ? (
              <EmptyState title="Select an incident" description="Choose a case from the queue to review its evidence and history." />
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5E5DF] p-4 sm:p-5">
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C8C85]">{selected.id} · Case File</p>
                    <h2 className="mt-1 text-base font-semibold tracking-tight text-[#111111]">{selected.type}</h2>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs font-mono text-[#666662]">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#E05238]" />
                        {selected.location}
                      </span>
                      <span className="text-[#8C8C85]">·</span>
                      <span>
                        GPS: {selected.gps[0].toFixed(4)}, {selected.gps[1].toFixed(4)}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={selected.severity} tone={severityToneMap[selected.severity] ?? 'slate'} />
                    <StatusBadge status={selected.status} tone={statusToneMap[selected.status] ?? 'slate'} dot />
                    <Link to={`/incident/${selected.id}`} className="px-3 py-1.5 border border-[#111111] bg-[#111111] text-white font-mono text-xs font-semibold flex items-center gap-1.5 hover:bg-black">
                      <FileText className="h-3.5 w-3.5" />
                      Open Dossier
                    </Link>
                  </div>
                </div>

                {/* Key facts */}
                <div className="grid grid-cols-2 divide-[#E5E5DF] border-b border-[#E5E5DF] sm:grid-cols-4 sm:divide-x text-xs font-mono">
                  {[
                    ['Detected by', selected.busId],
                    ['Confidence', `${selected.confidence}%`],
                    ['Reported Time', selected.time],
                    ['Linked Vehicle', selected.vehicleInfo?.registration ?? 'Under Review'],
                  ].map(([k, v]) => (
                    <div key={k} className="px-4 py-3">
                      <p className="text-[10px] text-[#8C8C85] uppercase">{k}</p>
                      <p className="mt-1 truncate font-bold text-[#111111]">{v}</p>
                    </div>
                  ))}
                </div>

                {selected.description && (
                  <p className="border-b border-[#E5E5DF] px-4 py-3.5 text-xs leading-relaxed text-[#111111] sm:px-5 font-sans bg-[#FBFBFA]">
                    {selected.description}
                  </p>
                )}

                <div className="grid grid-cols-1 divide-y divide-[#E5E5DF] lg:grid-cols-2 lg:divide-x lg:divide-y-0">
                  {/* Map position */}
                  <div className="p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase font-mono tracking-wider text-[#111111]">
                        <Layers className="h-3.5 w-3.5 text-[#E05238]" />
                        GIS Coordinates
                      </h3>
                      <MapViewToggle mode={mapMode} onChange={setMapMode} />
                    </div>

                    <div className="h-56 overflow-hidden border border-[#D5D5CF]">
                      <MapContainer center={selected.gps} zoom={14} style={{ height: '100%', width: '100%' }} key={selected.id}>
                        <MapTileLayer mode={mapMode} />
                        <Circle
                          center={selected.gps}
                          radius={280}
                          pathOptions={{ color: '#DC2626', fillColor: '#DC2626', fillOpacity: 0.15, weight: 1.5 }}
                        />
                        <Marker position={selected.gps} />
                      </MapContainer>
                    </div>

                    {selected.vehicleInfo && (
                      <dl className="mt-3 divide-y divide-[#E5E5DF] border border-[#E5E5DF] bg-[#FBFBFA] px-3.5 text-xs font-mono">
                        {[
                          ['Target Vehicle', `${selected.vehicleInfo.type} · ${selected.vehicleInfo.color}`],
                          ['Corridor Heading', selected.vehicleInfo.direction],
                        ].map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between gap-3 py-2">
                            <dt className="text-[#8C8C85]">{k}</dt>
                            <dd className="font-bold text-[#111111]">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>

                  {/* Case history */}
                  <div className="p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase font-mono tracking-wider text-[#111111]">
                      <Clock className="h-3.5 w-3.5 text-[#E05238]" />
                      Audit Trail & Actions
                    </h3>

                    <ol className="relative space-y-3.5 pl-6 font-mono text-xs">
                      {caseHistory.map((step, i) => (
                        <li key={i} className="relative">
                          <span
                            className={`absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-[#FFFFFF] ${
                              step.state === 'done' ? 'bg-emerald-500' : step.state === 'active' ? 'bg-[#E05238]' : 'bg-slate-300'
                            }`}
                            aria-hidden="true"
                          />
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold text-[#111111]">{step.label}</p>
                              <p className="mt-0.5 text-[#666662]">{step.detail}</p>
                            </div>
                            <span className="shrink-0 text-[#8C8C85]">{step.time}</span>
                          </div>
                        </li>
                      ))}
                    </ol>

                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#E5E5DF] pt-4">
                      <Link to="/vehicle-tracking" className="px-3 py-1.5 border border-[#D5D5CF] bg-[#FFFFFF] hover:bg-[#FBFBFA] text-[#111111] font-mono text-xs font-semibold flex items-center gap-1.5">
                        <Car className="h-3.5 w-3.5 text-[#E05238]" />
                        Track Target Plate
                      </Link>
                      <Link to="/urban-map" className="px-3 py-1.5 border border-[#D5D5CF] bg-[#FFFFFF] hover:bg-[#FBFBFA] text-[#111111] font-mono text-xs font-semibold flex items-center gap-1.5">
                        <Camera className="h-3.5 w-3.5 text-blue-600" />
                        Corridor GIS Live
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}
