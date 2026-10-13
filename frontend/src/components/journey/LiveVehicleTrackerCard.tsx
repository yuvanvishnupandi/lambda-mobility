import React, { useState, useEffect } from 'react'
import {
  Radio,
  Train,
  Bus,
  MapPin,
  Gauge,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Compass
} from 'lucide-react'
import { LiveVehicle, TransportMode } from '../../types/transit'
import { transitApi, FALLBACK_LIVE_VEHICLES } from '../../services/transitApi'
import { roadSimulator } from '../../services/roadSimulator'

interface LiveVehicleTrackerCardProps {
  initialVehicleId?: string
  onFocusVehicleOnMap?: (lat: number, lng: number) => void
}

export const LiveVehicleTrackerCard: React.FC<LiveVehicleTrackerCardProps> = ({
  initialVehicleId = 'GMRC-METRO-101',
  onFocusVehicleOnMap,
}) => {
  const [vehicles, setVehicles] = useState<LiveVehicle[]>(() => roadSimulator.getLiveVehicles())
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialVehicleId)
  const [selectedMode, setSelectedMode] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  const fetchVehicles = async () => {
    setIsLoading(true)
    try {
      const data = await transitApi.getLiveVehicles(selectedMode)
      if (data && data.length > 0) {
        setVehicles(data)
      }
    } catch (e) {
      // Fallback
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
    const unsubscribe = roadSimulator.subscribe((liveVehs) => {
      setVehicles(liveVehs)
    })
    return () => {
      unsubscribe()
    }
  }, [selectedMode])

  const filteredVehicles = selectedMode
    ? vehicles.filter((v) => v.mode === selectedMode)
    : vehicles

  const currentVehicle =
    filteredVehicles.find((v) => v.vehicle_id === selectedVehicleId) ||
    filteredVehicles[0] ||
    FALLBACK_LIVE_VEHICLES[0]

  const getModeIcon = (mode: TransportMode) => {
    if (mode === 'METRO') return <Train className="w-3.5 h-3.5" />
    return <Bus className="w-3.5 h-3.5" />
  }

  return (
    <div className="u-panel space-y-4 p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Radio className="w-4 h-4 animate-pulse text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              Live Fleet Telemetry
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Active Metro, BRTS & AMTS fleet positions & real-time ETA
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchVehicles}
          disabled={isLoading}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          title="Refresh vehicle telemetry"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </button>
      </div>

      {/* Mode Filters */}
      <div className="flex items-center gap-1.5 text-xs">
        {[
          { id: undefined, label: 'All Fleet' },
          { id: 'METRO', label: 'CMRL Metro' },
          { id: 'RAIL', label: 'Suburban EMU' },
          { id: 'MTC_ELECTRIC_BUS', label: 'MTC e-Bus' },
          { id: 'BUS', label: 'MTC Express' },
        ].map((item) => {
          const isSelected = selectedMode === item.id
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setSelectedMode(item.id)
              }}
              className={`px-3 py-1 rounded-lg font-semibold border transition-all text-[11px] ${
                isSelected
                  ? 'border-line-strong bg-surface-4 text-ink shadow-e1'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Vehicle Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {filteredVehicles.map((v) => {
          const isSelected = currentVehicle?.vehicle_id === v.vehicle_id
          return (
            <button
              key={v.vehicle_id}
              type="button"
              onClick={() => setSelectedVehicleId(v.vehicle_id)}
              className={`px-3 py-1.5 rounded-xl font-semibold border whitespace-nowrap transition-all text-xs flex items-center gap-1.5 ${
                isSelected
                  ? 'border-line-strong bg-surface-4 text-ink shadow-e1'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {getModeIcon(v.mode)}
              <span>{v.route_number || v.vehicle_id}</span>
            </button>
          )
        })}
      </div>

      {/* Active Vehicle Status Card */}
      {currentVehicle && (
        <div className="bg-slate-50/90 rounded-xl p-4 border border-slate-200 space-y-3.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="font-extrabold text-sm text-slate-900">{currentVehicle.vehicle_id}</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded text-white shadow-2xs"
                  style={{ backgroundColor: currentVehicle.route_color || '#2563EB' }}
                >
                  {currentVehicle.route_number}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  {currentVehicle.registration}
                </span>
              </div>
              <div className="text-xs text-slate-600 mt-1 font-medium">{currentVehicle.route_name}</div>
            </div>

            {/* Delay Badge */}
            {(currentVehicle.delay_minutes ?? 0) > 0 ? (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center gap-1 shrink-0">
                <AlertTriangle className="w-3 h-3" />
                +{currentVehicle.delay_minutes}m delay
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                ON TIME
              </span>
            )}
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs pt-2 border-t border-slate-200/70">
            <div className="p-2 bg-white rounded-lg border border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Location</span>
              <strong className="text-slate-800 flex items-center gap-1 mt-0.5 text-xs truncate">
                <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                <span className="truncate">{currentVehicle.current_location_name}</span>
              </strong>
            </div>

            <div className="p-2 bg-white rounded-lg border border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Next Approaching Stop</span>
              <strong className="text-slate-800 flex items-center gap-1 mt-0.5 text-xs truncate">
                <Navigation className="w-3 h-3 text-blue-500 shrink-0" />
                <span className="truncate">{currentVehicle.next_stop_name || 'Approaching Station'}</span>
              </strong>
            </div>

            <div className="p-2 bg-white rounded-lg border border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Speed</span>
              <strong className="text-slate-800 flex items-center gap-1 mt-0.5 text-xs">
                <Gauge className="w-3 h-3 text-slate-500 shrink-0" />
                {currentVehicle.speed_kmh} km/h
              </strong>
            </div>

            <div className="p-2 bg-white rounded-lg border border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ETA Next Stop</span>
              <strong className="text-emerald-700 font-bold flex items-center gap-1 mt-0.5 text-xs">
                <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                ~{currentVehicle.eta_next_stop_mins} min
              </strong>
            </div>
          </div>

          {/* Freshness & Transparency Notice & Map Action */}
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {currentVehicle.freshness_label}
            </span>
            <div className="flex items-center space-x-2">
              {onFocusVehicleOnMap && (
                <button
                  type="button"
                  onClick={() => onFocusVehicleOnMap(currentVehicle.latitude, currentVehicle.longitude)}
                  className="px-2.5 py-1 rounded-lg bg-iris-50 text-iris-600 hover:bg-iris-100 font-semibold text-[11px] transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Compass className="w-3 h-3" />
                  <span>Locate on Map</span>
                </button>
              )}
              <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-semibold">
                {currentVehicle.data_source}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
