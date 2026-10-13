import React from 'react'
import {
  Zap,
  Battery,
  BatteryCharging,
  BatteryMedium,
  BatteryLow,
  Gauge,
  MapPin,
  Snowflake,
  Accessibility,
  Radio
} from 'lucide-react'
import { ElectricBusVehicle } from '../../types/transit'

interface ElectricBusVehicleCardProps {
  vehicle: ElectricBusVehicle
  onFocusOnMap?: (lat: number, lng: number) => void
  isSelected?: boolean
}

export const ElectricBusVehicleCard: React.FC<ElectricBusVehicleCardProps> = ({
  vehicle,
  onFocusOnMap,
  isSelected = false,
}) => {
  const soc = vehicle.battery_soc_pct ?? 78
  const isCharging = vehicle.charging_status === 'CHARGING' || vehicle.charging_status === 'FAST_CHARGING'
  const isMwc = vehicle.operator?.includes('MWC') || vehicle.agency?.includes('MWC')

  const getBatteryIcon = (level: number) => {
    if (isCharging) return <BatteryCharging className="h-4 w-4 text-emerald-600 animate-pulse-soft" />
    if (level > 60) return <Battery className="h-4 w-4 text-emerald-600" />
    if (level > 25) return <BatteryMedium className="h-4 w-4 text-amber-600" />
    return <BatteryLow className="h-4 w-4 text-rose-600 animate-pulse-soft" />
  }

  return (
    <div
      className={`rounded-xl border p-4 shadow-e1 transition-all duration-300 ${
        isSelected
          ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
          : 'border-line bg-surface-1 hover:border-emerald-200 hover:bg-surface-2'
      }`}
    >
      {/* Top Bar: Vehicle ID, Route & Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Zap className="h-3.5 w-3.5 text-emerald-600 fill-emerald-600" />
              <span>{vehicle.route_number || 'Electric bus'}</span>
            </span>

            <span className="u-num rounded border border-line bg-surface-3/70 px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
              {vehicle.registration || vehicle.vehicle_id}
            </span>

            {/* Operator tag */}
            <span className="rounded border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
              {isMwc ? 'MWC Shuttle EV' : 'MTC Greenline EV'}
            </span>
          </div>

          <p className="mt-1.5 text-sm font-semibold leading-snug text-ink">
            {vehicle.route_name || `Bound for ${vehicle.destination}`}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
            <span>To</span>
            <span className="font-medium text-ink-secondary">{vehicle.destination}</span>
          </p>
        </div>

        {/* Provenance Badge */}
        <div className="text-right shrink-0">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              vehicle.provenance === 'REAL_TIME'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            <Radio className="h-2.5 w-2.5 animate-pulse-soft" />
            <span>{vehicle.provenance || 'REAL_TIME'}</span>
          </span>
          <p className="u-num mt-1 text-[10px] text-ink-faint">
            {vehicle.delay_minutes === 0
              ? '🟢 On Time'
              : `🔴 +${vehicle.delay_minutes}m delay`}
          </p>
        </div>
      </div>

      {/* Battery SOC & Live Telemetry Meter */}
      <div className="mb-3 space-y-2 rounded-lg border border-line bg-surface-3/60 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-medium text-ink-secondary">
            {getBatteryIcon(soc)}
            <span>Battery state of charge</span>
          </span>
          <span className="u-num font-semibold text-emerald-700">
            {soc}% {isCharging ? '(charging)' : ''}
          </span>
        </div>

        {/* Visual Progress Gauge */}
        <div className="h-2 w-full overflow-hidden rounded-full border border-line/60 bg-surface-4">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              soc > 60
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : soc > 25
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                : 'bg-gradient-to-r from-rose-500 to-red-600'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, soc))}%` }}
          />
        </div>

        <div className="u-num flex items-center justify-between pt-1 text-[11px] text-ink-muted">
          <span className="flex items-center gap-1">
            <Gauge className="h-3 w-3 text-aqua-600" />
            <span>Speed <strong className="font-semibold text-ink">{vehicle.speed_kmh} km/h</strong></span>
          </span>
          <span>Status <strong className="font-semibold text-emerald-700">{(vehicle.charging_status || 'IN_SERVICE').replace('_', ' ')}</strong></span>
        </div>
      </div>

      {/* Comfort & Low Floor Badges + Locate Action */}
      <div className="flex items-center justify-between gap-2 border-t border-line pt-3 text-[11px]">
        <div className="flex items-center gap-2 text-ink-muted">
          <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
            <Snowflake className="h-3 w-3" /> AC
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-teal-700">
            <Accessibility className="h-3 w-3" /> Low-floor
          </span>
          <span className="u-num text-ink-faint">
            {vehicle.fleet_number ? `Fleet: ${vehicle.fleet_number}` : ''}
          </span>
        </div>

        {onFocusOnMap && (
          <button
            onClick={() => onFocusOnMap(vehicle.latitude, vehicle.longitude)}
            className="group inline-flex items-center gap-1 rounded-md border border-line bg-surface-3 px-2.5 py-1 text-[11.5px] font-medium text-ink-secondary transition-all hover:border-emerald-200 hover:text-ink"
          >
            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
            <span>Locate bus</span>
          </button>
        )}
      </div>
    </div>
  )
}
