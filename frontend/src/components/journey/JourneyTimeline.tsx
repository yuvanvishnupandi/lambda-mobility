import React from 'react'
import {
  MapPin,
  Footprints,
  Train,
  Bus,
  Zap,
  Shuffle,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Map
} from 'lucide-react'
import { JourneyStep, TransportMode } from '../../types/transit'

interface JourneyTimelineProps {
  steps: JourneyStep[]
  fareBreakdown?: { mode: string; mode_display?: string; route_number: string; distance_km: number; fare: number }[]
  totalFare: number
  totalDuration: number
  departureTime: string
  arrivalTime: string
  onOpenMap?: () => void
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({
  steps,
  fareBreakdown,
  totalFare,
  totalDuration,
  departureTime,
  arrivalTime,
  onOpenMap,
}) => {

  const getModeIcon = (mode: TransportMode, stepType: string, routeNumber?: string) => {
    if (stepType === 'TRANSFER') return <Shuffle className="w-4 h-4 text-purple-600" />
    if (mode === 'MTC_ELECTRIC_BUS' || mode === 'GANDHINAGAR_ELECTRIC_BUS' || mode?.includes('ELECTRIC') || routeNumber?.includes('EV') || routeNumber?.startsWith('E-')) {
      return <Zap className="w-4 h-4 text-emerald-300 fill-emerald-300" />
    }
    if (mode === 'METRO' || mode === 'RAIL') return <Train className="w-4 h-4 text-white" />
    if (mode === 'BRTS' || mode === 'AMTS' || mode === 'BUS') return <Bus className="w-4 h-4 text-white" />
    return <Footprints className="w-4 h-4 text-slate-500" />
  }

  const getStepBgColor = (mode: TransportMode, stepType: string, customColor?: string, routeNumber?: string) => {
    if (stepType === 'TRANSFER') return 'bg-purple-100 border-purple-300'
    if (stepType === 'WALK') return 'bg-slate-100 border-slate-300'
    if (mode === 'MTC_ELECTRIC_BUS' || mode === 'GANDHINAGAR_ELECTRIC_BUS' || mode?.includes('ELECTRIC') || routeNumber?.includes('EV') || routeNumber?.startsWith('E-')) {
      return 'bg-gradient-to-r from-emerald-600 to-teal-700 border-emerald-400 text-white shadow-md shadow-emerald-950'
    }
    if (customColor) return `border-transparent text-white`
    if (mode === 'METRO') return 'bg-red-600 border-red-700 text-white'
    if (mode === 'BRTS') return 'bg-orange-500 border-orange-600 text-white'
    if (mode === 'AMTS') return 'bg-emerald-600 border-emerald-700 text-white'
    if (mode === 'RAIL') return 'bg-purple-600 border-purple-700 text-white'
    if (mode === 'BUS') return 'bg-teal-600 border-teal-700 text-white'
    return 'bg-slate-600 text-white'
  }

  return (
    <div className="u-panel space-y-5 p-4 sm:p-5">
      {/* Journey Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 block">
            Step-by-Step Directions
          </span>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mt-0.5">
            <span>{departureTime}</span>
            <span className="text-slate-300">→</span>
            <span>{arrivalTime}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {totalDuration} min total
            </span>
          </h3>
        </div>

        <div className="flex items-center space-x-3 text-right">
          <div className="text-xs text-slate-500">
            Total Fare: <strong className="text-sm font-extrabold text-emerald-600">₹{totalFare}</strong>
          </div>

          {onOpenMap && (
            <button
              type="button"
              onClick={onOpenMap}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold shadow-xs transition-all hover:scale-105 active:scale-95"
            >
              <Map className="w-3.5 h-3.5" />
              <span>View on Map</span>
            </button>
          )}
        </div>
      </div>

      {/* Step-by-Step Vertical Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:top-3 before:bottom-3 before:left-3.5 before:w-0.5 before:bg-slate-200">
        {steps.map((step, idx) => {
          return (
            <div key={idx} className="relative group">
              {/* Timeline Icon Node */}
              <div
                className={`absolute -left-6 top-0 w-7 h-7 rounded-full flex items-center justify-center border shadow-xs transition-transform group-hover:scale-110 ${getStepBgColor(
                  step.mode,
                  step.step_type,
                  step.route_color,
                  step.route_number
                )}`}
                style={step.step_type === 'TRANSIT' && step.route_color ? { backgroundColor: step.route_color } : undefined}
              >
                {getModeIcon(step.mode, step.step_type, step.route_number)}
              </div>

              {/* Step Content Card */}
              <div className="bg-slate-50/70 hover:bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 transition-all space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-xs font-bold text-slate-900">{step.title}</span>
                      {step.step_type === 'TRANSIT' && (
                        <>
                          <span
                            className="text-[10px] font-extrabold px-1.5 py-0.5 rounded text-white shadow-2xs"
                            style={{ backgroundColor: step.route_color || '#2563EB' }}
                          >
                            {step.route_number}
                          </span>
                          {step.fare !== undefined && step.fare > 0 && (
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ₹{step.fare}
                            </span>
                          )}
                        </>
                      )}
                      {step.step_type === 'TRANSFER' && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                          TRANSFER INTERCHANGE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{step.instructions}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-black text-slate-900 block">{step.duration_mins} min</span>
                    <span className="text-[11px] text-slate-400 block">{step.departure_time}</span>
                  </div>
                </div>

                {/* Transfer Intelligence Window Callout */}
                {step.step_type === 'TRANSFER' && (
                  <div className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                    step.is_tight
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-purple-50/80 border-purple-200 text-purple-900'
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-700" />
                        {step.transfer_message || `Transfer Window: ${step.transfer_window_mins || step.duration_mins + 3} Minutes`}
                      </span>
                      {step.is_tight ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Tight Transfer
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-200 text-purple-900 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Protected
                        </span>
                      )}
                    </div>
                    {(step.from_platform || step.to_platform || step.stand_number) && (
                      <div className="text-[11px] text-slate-700 flex items-center gap-2 pt-1 border-t border-purple-200/60">
                        {step.from_platform && <span>From: <strong>{step.from_platform}</strong></span>}
                        {step.to_platform && <span>→ To: <strong>{step.to_platform}</strong></span>}
                        {step.stand_number && <span>Stand: <strong>{step.stand_number}</strong></span>}
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Transit / Platform Details */}
                {step.step_type === 'TRANSIT' && (
                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                    <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                      {step.platform_info && (
                        <span className="u-num rounded-md border border-line bg-surface-3 px-2 py-0.5 font-medium text-ink-secondary">
                          {step.platform_info}
                        </span>
                      )}
                      {step.stand_number && (
                        <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {step.stand_number}
                        </span>
                      )}
                      {step.stops_count && (
                        <span>{step.stops_count} stops</span>
                      )}
                      {step.waiting_mins !== undefined && step.waiting_mins > 0 && (
                        <span className="text-amber-600 font-medium">
                          ~{step.waiting_mins} min wait
                        </span>
                      )}
                    </div>

                    {step.vehicle && (
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                        <span>Live Unit: {step.vehicle.vehicle_id}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Step-Free / Accessibility Note */}
                {step.is_step_free && (
                  <div className="text-[10px] text-iris-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Wheelchair Accessible & Step-Free Concourse</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Arrival Destination Node */}
        <div className="relative">
          <div className="absolute -left-6 top-0 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center border border-red-700 shadow-sm">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div className="bg-red-50/80 rounded-xl p-3.5 border border-red-200 text-xs">
            <div className="font-bold text-red-900">Arrived at Destination</div>
            <div className="text-red-700 text-[11px] mt-0.5">
              Expected Arrival: <strong>{arrivalTime}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Fare Breakdown Box */}
      {fareBreakdown && fareBreakdown.length > 0 && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>Fare Breakdown</span>
              <span className="text-[10px] font-semibold text-slate-400">({fareBreakdown.length} {fareBreakdown.length === 1 ? 'leg' : 'legs'})</span>
            </span>
            <span className="text-emerald-700 font-extrabold text-sm">Total: ₹{totalFare}</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {fareBreakdown.map((item, idx) => {
              const modeDisplay = item.mode_display || (
                item.mode === 'MTC_ELECTRIC_BUS' || item.mode === 'GANDHINAGAR_ELECTRIC_BUS'
                  ? '🚌⚡ MTC Electric Bus'
                  : item.mode
              )
              return (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-line/70 bg-surface-2/60 px-2.5 py-1 text-ink-secondary">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-slate-800">{modeDisplay}</span>
                    {item.route_number && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {item.route_number}
                      </span>
                    )}
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 text-[11px]">{item.distance_km} km</span>
                  </div>
                  <span className="font-bold text-emerald-700">₹{item.fare}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
