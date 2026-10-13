import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { Search, Camera, AlertCircle, Car, Route, ScanLine, Clock, Layers } from 'lucide-react'
import { MapContainer, Polyline, Marker, Circle } from 'react-leaflet'
import { apiService } from '../services/api'
import { PageHeader } from '../components/common/PageHeader'
import { MapTileLayer, MapViewToggle, type MapTileMode } from '../components/common/MapTileLayer'
import { eventIcon } from '../components/common/mapIcons'
import { Link } from 'react-router-dom'
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

// Verified Tamil Nadu · Chengalpattu GST Road (NH 45) Corridor ANPR sightings
const defaultDetections = [
  { id: 1, busId: 'BUS-104', location: 'GST Road (NH 45) · Potheri Central Station', timestamp: '14:32:18', direction: 'Northbound', confidence: 96.4, gps: [12.8231, 80.0444] as [number, number] },
  { id: 2, busId: 'BUS-087', location: 'Guduvanchery Junction Flyover (NH 45)', timestamp: '14:28:45', direction: 'Southbound', confidence: 94.2, gps: [12.8465, 80.0612] as [number, number] },
  { id: 3, busId: 'BUS-121', location: 'Vandalur Crescent Arterial Corridor', timestamp: '14:25:12', direction: 'Northbound', confidence: 92.8, gps: [12.8885, 80.0815] as [number, number] },
  { id: 4, busId: 'BUS-156', location: 'Tambaram Sanatorium Transit Interchange', timestamp: '14:20:33', direction: 'Southbound', confidence: 89.5, gps: [12.9250, 80.1165] as [number, number] },
]

export default function VehicleTracking() {
  const [mapMode, setMapMode] = useState<MapTileMode>('street')
  const [searchQuery, setSearchQuery] = useState('TN 19 AZ 4821')
  const [vehicleDetections, setVehicleDetections] = useState(defaultDetections)
  const [vehiclePath, setVehiclePath] = useState<[number, number][]>([
    [12.8231, 80.0444],
    [12.8465, 80.0612],
    [12.8885, 80.0815],
    [12.9250, 80.1165],
  ])

  const handleSearch = () => {
    if (!searchQuery) return
    apiService.searchVehicle(searchQuery).then(res => {
      if (res && res.route && res.route.length > 0) {
        setVehiclePath(res.route)
      }
      if (res && res.sightings && res.sightings.length > 0) {
        setVehicleDetections(
          res.sightings.map((s: any) => ({
            id: s.id,
            busId: s.bus_id || 'BUS-104',
            location: s.location,
            timestamp: s.timestamp ? s.timestamp.substring(11, 19) : '14:30:00',
            direction: s.direction || 'Northbound',
            confidence: Math.round((s.confidence || 0.95) * 100),
            gps: s.gps || [12.8231, 80.0444],
          }))
        )
      }
    })
  }

  useEffect(() => {
    handleSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const meanConfidence = (
    vehicleDetections.reduce((sum, d) => sum + d.confidence, 0) / Math.max(vehicleDetections.length, 1)
  ).toFixed(1)

  return (
    <DashboardLayout>
      <PageHeader
        title="Vehicle Tracking"
        eyebrow="Tamil Nadu Transit OS · ANPR Optical Enforcement"
        icon={ScanLine}
        live={{ label: 'Cross-fleet correlation active', tone: 'blue' }}
        subtitle="Automatic Number Plate Recognition (ANPR) and trajectory reconstruction along GST Road (NH 45)"
      >
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#888880]" />
            <input
              type="text"
              placeholder="Registration plate (e.g. TN 19 AZ 4821)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSearch()
              }}
              className="w-full bg-[#FFFFFF] border border-[#D5D5CF] pl-9 pr-3 py-2 text-[12px] font-mono uppercase text-[#111111] focus:border-[#111111] focus:outline-none transition-colors"
              aria-label="Search vehicle registration"
            />
          </div>
          <button
            onClick={handleSearch}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#111111] hover:bg-black text-[#FFFFFF] text-[11px] font-mono font-bold uppercase tracking-wider transition-all shadow-xs"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search Fleet ANPR</span>
          </button>
        </div>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          {/* Left Column: Target Metadata, Timeline & Evidence */}
          <div className="space-y-5">
            {/* Speakeasy Target Card */}
            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs">
              <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EBEBE6] pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-2 w-2 rounded-none bg-[#E05238]" />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#888880]">
                      Identified Target · Chengalpattu Division
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-mono font-bold tracking-wider text-[#111111]">
                    {searchQuery || 'No Plate Selected'}
                  </h2>
                  <p className="mt-1 text-[12px] font-mono text-[#666662]">
                    Correlated across {vehicleDetections.length} fleet sightings · Mean confidence {meanConfidence}%
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase text-rose-800 bg-rose-50 border border-rose-300 px-2 py-1">
                    Flagged for Investigation
                  </span>
                  <Link
                    to="/incident/INC-1042"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFFFFF] hover:bg-[#FBFBFA] border border-[#D5D5CF] text-[11px] font-mono font-bold uppercase tracking-wider text-[#111111]"
                  >
                    <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                    <span>Case INC-1042</span>
                  </Link>
                </div>
              </div>

              {/* Attributes Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs mb-4">
                {[
                  { icon: Car, k: 'Registration', v: searchQuery || '—' },
                  { icon: Car, k: 'Vehicle Type', v: 'White Sedan' },
                  { icon: Layers, k: 'Optical Colour', v: 'White Pearl' },
                  { icon: Clock, k: 'Sightings Count', v: `${vehicleDetections.length} Sightings` },
                ].map(item => (
                  <div key={item.k} className="p-3 bg-[#F9F9F6] border border-[#EBEBE6]">
                    <div className="flex items-center gap-1 text-[10px] text-[#777770] uppercase mb-1">
                      <item.icon className="h-3 w-3" />
                      <span>{item.k}</span>
                    </div>
                    <div className="font-bold text-[#111111] truncate">{item.v}</div>
                  </div>
                ))}
              </div>

              {/* Associated Incident Escalation Callout */}
              <div className="flex items-start gap-3 p-3.5 bg-[#FFF9F8] border border-[#F8D2CC] text-xs">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <div>
                  <span className="font-bold text-rose-900 uppercase font-mono text-[11px]">
                    Associated Incident Escalation:
                  </span>
                  <p className="mt-0.5 text-[#555550] leading-relaxed">
                    This vehicle matches active case <strong className="font-mono text-[#111111]">INC-1042</strong> — a
                    hit-and-run incident detected on the GST Road (NH 45) Potheri Central Station Sector. Subsequent
                    optical sightings by MTC buses are streamed directly to the Chengalpattu District Traffic Operations Room.
                  </p>
                </div>
              </div>
            </div>

            {/* Speakeasy Detection Timeline Card */}
            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs">
              <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

              <div className="flex items-center justify-between border-b border-[#EBEBE6] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#111111]" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                    ANPR Optical Timeline · Sighting Sequence
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#2F7C4E] bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-bold uppercase">
                  {vehicleDetections.length} Sightings Logged
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#EBEBE6] text-[#777770] uppercase text-[10px]">
                      <th className="py-2 pr-3">Sensing Bus</th>
                      <th className="py-2 pr-3">Street Location</th>
                      <th className="py-2 pr-3">Timestamp</th>
                      <th className="py-2 pr-3">Direction</th>
                      <th className="py-2 text-right">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBEBE6]">
                    {vehicleDetections.map(detection => (
                      <tr key={detection.id} className="hover:bg-[#F9F9F6] transition-colors">
                        <td className="py-2.5 pr-3">
                          <Link to="/live-fleet" className="font-bold text-[#E05238] hover:underline">
                            {detection.busId}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-3 text-[#111111] font-sans font-medium">{detection.location}</td>
                        <td className="py-2.5 pr-3 text-[#777770]">{detection.timestamp}</td>
                        <td className="py-2.5 pr-3 text-[#444440]">{detection.direction}</td>
                        <td className="py-2.5 text-right font-bold text-emerald-700">
                          {detection.confidence}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Speakeasy Evidence Frames */}
            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs">
              <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

              <div className="flex items-center justify-between border-b border-[#EBEBE6] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#111111]" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                    Extracted Optical Frames · Onboard Camera Array
                  </span>
                </div>
                <span className="font-mono text-[10px] text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 font-bold uppercase">
                  Evidence Stored
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { bus: 'BUS-104', match: '96.4%' },
                  { bus: 'BUS-087', match: '94.2%' },
                  { bus: 'BUS-121', match: '92.8%' },
                  { bus: 'BUS-156', match: '89.5%' },
                ].map(item => (
                  <div
                    key={item.bus}
                    className="relative aspect-video bg-[#F7F7F4] border border-[#D5D5CF] flex flex-col items-center justify-center p-2 text-center"
                  >
                    <Camera className="h-6 w-6 text-[#A0A09B] mb-1" />
                    <span className="font-mono text-[11px] font-bold text-[#111111]">{item.bus}</span>
                    <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 mt-1">
                      {item.match} match
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Reconstructed Path on Leaflet Map */}
          <div>
            <div className="sticky top-4">
              <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs">
                <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
                <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
                <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
                <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

                <div className="flex items-center justify-between border-b border-[#EBEBE6] pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Route className="w-4 h-4 text-[#111111]" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                      Reconstructed Path
                    </span>
                  </div>
                  <MapViewToggle mode={mapMode} onChange={setMapMode} />
                </div>

                <div className="relative h-[420px] border border-[#EBEBE6]">
                  <MapContainer
                    center={[12.8550, 80.0650]}
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <MapTileLayer mode={mapMode} />
                    <Polyline
                      positions={vehiclePath as [number, number][]}
                      pathOptions={{ color: '#E05238', weight: 4, dashArray: '6 6' }}
                    />
                    {vehicleDetections.map(detection => (
                      <Circle
                        key={`c-${detection.id}`}
                        center={detection.gps}
                        radius={250}
                        pathOptions={{ color: '#E05238', fillColor: '#E05238', fillOpacity: 0.15, weight: 1.5 }}
                      />
                    ))}
                    {vehicleDetections.map(detection => (
                      <Marker
                        key={detection.id}
                        position={detection.gps}
                        icon={eventIcon(detection.confidence >= 94 ? 'high' : 'medium', 14)}
                      />
                    ))}
                  </MapContainer>

                  <div className="pointer-events-none absolute left-3 top-3 border border-[#D5D5CF] bg-[#FFFFFF] px-2.5 py-1.5 shadow-xs font-mono text-xs">
                    <div className="text-[10px] text-[#888880] uppercase">Trajectory Vector</div>
                    <div className="font-bold text-[#111111]">{vehiclePath.length} GPS checkpoints</div>
                  </div>
                </div>

                {/* Path Key Metrics */}
                <div className="space-y-2 mt-4 pt-3 border-t border-[#EBEBE6] font-mono text-xs">
                  <div className="flex items-center justify-between p-2 bg-[#F9F9F6] border border-[#EBEBE6]">
                    <span className="text-[#777770]">First Sighting:</span>
                    <span className="font-bold text-[#111111]">
                      {vehicleDetections[vehicleDetections.length - 1]?.timestamp} · Tambaram
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#F9F9F6] border border-[#EBEBE6]">
                    <span className="text-[#777770]">Last Sighting:</span>
                    <span className="font-bold text-[#111111]">
                      {vehicleDetections[0]?.timestamp} · Potheri NH 45
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#F9F9F6] border border-[#EBEBE6]">
                    <span className="text-[#777770]">Corridor Distance:</span>
                    <span className="font-bold text-[#2563EB]">12.4 km along NH 45</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#F9F9F6] border border-[#EBEBE6]">
                    <span className="text-[#777770]">Mean ANPR Confidence:</span>
                    <span className="font-bold text-[#2F7C4E]">{meanConfidence}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
