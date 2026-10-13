import React, { useState } from 'react'
import {
  Zap,
  Clock,
  ChevronDown,
  ChevronUp,
  Snowflake,
  Accessibility,
  IndianRupee,
  Navigation,
  ArrowRight
} from 'lucide-react'
import { ElectricBusRoute } from '../../types/transit'
import { ElectricBusBadge } from './ElectricBusBadge'

interface ElectricBusRouteCardProps {
  route: ElectricBusRoute
  onSelectRoute?: (route: ElectricBusRoute) => void
  onPlanTripToRoute?: (origin: string, destination: string) => void
}

export const ElectricBusRouteCard: React.FC<ElectricBusRouteCardProps> = ({
  route,
  onPlanTripToRoute,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const isMwc = route.operator_code.includes('MWC')

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-surface-1 shadow-e1 transition-all duration-300 ${
        isMwc
          ? 'border-teal-200 hover:border-teal-300'
          : 'border-emerald-200 hover:border-emerald-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-line p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <ElectricBusBadge
              routeNumber={route.route_number}
              operator={route.operator_code}
              size="md"
              showZeroEmission={false}
            />
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              {route.electrification_level}
            </span>
          </div>

          <h3 className="text-base font-semibold leading-snug tracking-tight text-ink">
            {route.route_name}
          </h3>

          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
            <span className="font-medium text-ink-secondary">{route.origin}</span>
            <ArrowRight className="h-3 w-3 shrink-0 text-emerald-600" />
            <span className="font-medium text-ink-secondary">{route.destination}</span>
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="u-num inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700">
            <IndianRupee className="h-3.5 w-3.5" />
            <span>{route.fare_min}–{route.fare_max}</span>
          </div>
          <p className="mt-0.5 text-[10px] text-ink-faint">Affordable fare</p>
        </div>
      </div>

      {/* Quick Specs Grid */}
      <div className="grid grid-cols-3 divide-x divide-line bg-surface-2 p-3 text-xs">
        <div className="px-2 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Peak headway</p>
          <p className="u-num mt-0.5 flex items-center justify-center gap-1 font-semibold text-ink">
            <Zap className="h-3 w-3 text-amber-600" />
            <span>Every {route.peak_frequency_minutes}m</span>
          </p>
        </div>

        <div className="px-2 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Service hours</p>
          <p className="u-num mt-0.5 flex items-center justify-center gap-1 font-semibold text-ink-secondary">
            <Clock className="h-3 w-3 text-aqua-600" />
            <span>{route.operating_hours}</span>
          </p>
        </div>

        <div className="px-2 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Operator</p>
          <p className="mt-0.5 truncate font-medium text-emerald-700">
            {isMwc ? 'MWC Shuttle EV' : 'MTC Greenline EV'}
          </p>
        </div>
      </div>

      {/* Features strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-y border-line bg-emerald-50/50 px-4 py-2 text-[11px] text-ink-secondary">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-700">
            <Snowflake className="h-3.5 w-3.5" /> Air conditioned
          </span>
          <span className="flex items-center gap-1 text-teal-700">
            <Accessibility className="h-3.5 w-3.5" /> Low floor · wheelchair
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-emerald-700 transition-colors hover:text-emerald-800"
        >
          <span>{route.stops?.length || route.stops_count || 8} stops</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Expandable Stops Sequence */}
      {isExpanded && route.stops && (
        <div className="u-scroll max-h-60 space-y-2 overflow-y-auto border-t border-line bg-surface-2 p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Route stop sequence
          </p>
          <div className="relative space-y-3 pl-6 before:absolute before:bottom-2 before:left-2 before:top-2 before:w-0.5 before:bg-emerald-200">
            {route.stops.map((s, idx) => (
              <div key={s.stop_id || idx} className="relative flex items-start justify-between gap-2 text-xs">
                <div className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full border-2 border-surface-1 bg-emerald-500" />
                <div>
                  {(s.tamil_name || (s as any).gujarati_name) && (
                    <p className="text-[10px] text-ink-muted">{s.tamil_name || (s as any).gujarati_name}</p>
                  )}
                  {s.is_major_hub && (
                    <span className="mt-0.5 inline-block rounded border border-aqua-200 bg-aqua-50 px-1.5 py-px text-[9px] font-semibold text-aqua-700">
                      Interchange hub
                    </span>
                  )}
                </div>
                {s.distance_from_start_km > 0 && (
                  <span className="u-num text-[10px] text-ink-faint">
                    {s.distance_from_start_km.toFixed(1)} km
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 border-t border-line bg-surface-1 p-3">
        <span className="u-num truncate text-[11px] text-ink-muted">
          Off-peak {route.off_peak_frequency_minutes}m frequency
        </span>

        {onPlanTripToRoute && (
          <button
            onClick={() => onPlanTripToRoute(route.origin, route.destination)}
            className="u-btn u-btn-primary u-btn-sm"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>Plan journey on this route</span>
          </button>
        )}
      </div>
    </div>
  )
}
