import React from 'react'
import { Check, Clock, IndianRupee, Footprints, ArrowRightLeft, ShieldCheck, Zap, AlertTriangle, Leaf, X } from 'lucide-react'
import { JourneyRouteOption } from '../../types/transit'

interface RouteComparisonTableProps {
  routes: JourneyRouteOption[]
  selectedRouteKey: string
  onSelectRoute: (routeKey: string) => void
  onClose?: () => void
}

export const RouteComparisonTable: React.FC<RouteComparisonTableProps> = ({
  routes,
  selectedRouteKey,
  onSelectRoute,
  onClose
}) => {
  if (!routes || routes.length === 0) return null

  // Find minimums to highlight winners
  const minDuration = Math.min(...routes.map((r) => r.duration_minutes))
  const minFare = Math.min(...routes.map((r) => r.fare))
  const minWalk = Math.min(...routes.map((r) => r.walking_minutes))
  const minWait = Math.min(...routes.map((r) => r.waiting_minutes))
  const minTransfers = Math.min(...routes.map((r) => r.transfers))

  return (
    <div className="u-glass mb-4 w-full p-5 animate-fade">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Zap className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Route Comparison Matrix
              <span className="rounded-full border border-line bg-surface-3 px-2.5 py-0.5 text-[11.5px] font-normal text-ink-secondary">
                {routes.length} Multimodal Options Evaluated
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Cross-comparing speed, transfers, wait time, walking effort, fare and reliability
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="u-icon-btn"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3">Option & Category</th>
              <th className="py-3 px-3 text-center">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Total Time
                </span>
              </th>
              <th className="py-3 px-3 text-center">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Wait Time
                </span>
              </th>
              <th className="py-3 px-3 text-center">
                <span className="inline-flex items-center gap-1">
                  <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                  Walk Time
                </span>
              </th>
              <th className="py-3 px-3 text-center">
                <span className="inline-flex items-center gap-1">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
                  Transfers
                </span>
              </th>
              <th className="py-3 px-3 text-center">
                <span className="inline-flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-teal-400" />
                  Fare
                </span>
              </th>
              <th className="py-3 px-3 text-center">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  Reliability
                </span>
              </th>
              <th className="py-3 px-3 text-center">Live Status</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 text-xs">
            {routes.map((r) => {
              const isSelected = r.route_key === selectedRouteKey
              const isFastest = r.duration_minutes === minDuration
              const isCheapest = r.fare === minFare
              const isLeastWalk = r.walking_minutes === minWalk
              const isLeastWait = r.waiting_minutes === minWait
              const isFewestTransfers = r.transfers === minTransfers

              return (
                <tr
                  key={r.route_key}
                  className={`transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/40 border-l-4 border-indigo-500'
                      : 'hover:bg-surface-3/50'
                  }`}
                  onClick={() => onSelectRoute(r.route_key)}
                >
                  {/* Title & Modes */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.category_badge === 'FASTEST'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : r.category_badge === 'CHEAPEST'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : r.category_badge === 'LEAST WALKING'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : r.category_badge === 'FEWEST TRANSFERS'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : r.category_badge === 'MOST RELIABLE'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : r.category_badge === 'MINIMUM WAIT'
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                              : r.category_badge === 'BRTS BUSWAY'
                              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                              : r.category_badge === 'SUBURBAN RAIL'
                              ? 'bg-purple-600/20 text-purple-300 border border-purple-600/30'
                              : r.category_badge === 'CITY FEEDER'
                              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-600/30'
                              : r.category_badge === 'ACCESSIBLE'
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                              : 'border border-line bg-surface-3 text-ink-secondary'
                          }`}
                        >
                          {r.tag_label || r.category_badge || 'RECOMMENDED'}
                        </span>
                        <span className="font-semibold text-slate-100">{r.summary_title}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 flex-wrap">
                        {r.modes.map((m, mi) => (
                          <span key={mi} className="rounded border border-line bg-surface-3 px-1.5 py-0.5 text-[10px] text-ink-secondary">
                            {m}
                          </span>
                        ))}
                        {r.co2_saved_kg && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400 ml-1">
                            <Leaf className="w-2.5 h-2.5" />
                            {r.co2_saved_kg} kg CO₂ saved
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Total Time */}
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        isFastest
                          ? 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/40'
                          : 'text-slate-200'
                      }`}
                    >
                      {r.duration_minutes} min
                    </span>
                  </td>

                  {/* Wait Time */}
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        isLeastWait
                          ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30'
                          : 'text-slate-300'
                      }`}
                    >
                      {r.waiting_minutes} min
                    </span>
                  </td>

                  {/* Walk Time */}
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        isLeastWalk
                          ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                          : 'text-slate-300'
                      }`}
                    >
                      {r.walking_minutes} min
                    </span>
                  </td>

                  {/* Transfers */}
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        isFewestTransfers
                          ? 'bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30'
                          : 'text-slate-300'
                      }`}
                    >
                      {r.transfers === 0 ? 'Direct (0)' : `${r.transfers} transfer${r.transfers > 1 ? 's' : ''}`}
                    </span>
                  </td>

                  {/* Fare */}
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        isCheapest
                          ? 'bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/40'
                          : 'text-slate-200'
                      }`}
                    >
                      ₹{r.fare}
                    </span>
                  </td>

                  {/* Reliability Score */}
                  <td className="py-3.5 px-3 text-center">
                    <span className="text-purple-300 font-semibold">
                      {Math.round(r.reliability_score * 100)}%
                    </span>
                  </td>

                  {/* Live Status */}
                  <td className="py-3.5 px-3 text-center">
                    {r.delay_minutes > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-red-400 bg-red-950/60 border border-red-500/30 px-2 py-0.5 rounded-full font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        +{r.delay_minutes}m Delay
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                        <Check className="w-3 h-3" />
                        On Time
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectRoute(r.route_key)
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        isSelected
                          ? 'bg-brand-500 text-white shadow-key'
                          : 'border border-line bg-surface-3 text-ink-secondary hover:border-line-strong hover:text-ink'
                      }`}
                    >
                      {isSelected ? 'Viewing' : 'Select'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
