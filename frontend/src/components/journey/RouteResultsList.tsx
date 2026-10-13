import React, { useState } from 'react'
import {
  Clock,
  Footprints,
  Shuffle,
  AlertTriangle,
  ArrowRight,
  Train,
  Bus,
  Zap,
  Info,
  Sparkles,
  Leaf,
  Layers,
  ChevronDown,
  ChevronUp,
  Map,
  Navigation
} from 'lucide-react'
import { JourneyRouteOption, DelayAlertCallout, LeaveBySummary } from '../../types/transit'

interface RouteResultsListProps {
  routes: JourneyRouteOption[]
  selectedRouteKey: string | null
  onSelectRoute: (route: JourneyRouteOption) => void
  onToggleMatrix?: () => void
  onOpenMap?: (route?: JourneyRouteOption) => void
  onStartCompanion?: (route: JourneyRouteOption) => void
  delayCallout?: DelayAlertCallout | null
  leaveBySummary?: LeaveBySummary | null
}

const formatWalkDistance = (route: JourneyRouteOption): string => {
  if (route.walking_distance_km !== undefined && route.walking_distance_km > 0) {
    if (route.walking_distance_km < 1) {
      return `${Math.round(route.walking_distance_km * 1000)}m`
    }
    return `${route.walking_distance_km.toFixed(1)} km`
  }
  if (route.steps && route.steps.length > 0) {
    const walkKm = route.steps
      .filter((s) => s.step_type === 'WALK' || s.step_type === 'TRANSFER')
      .reduce((sum, s) => sum + (s.distance_km || 0), 0)
    if (walkKm > 0) {
      if (walkKm < 1) {
        return `${Math.round(walkKm * 1000)}m`
      }
      return `${walkKm.toFixed(1)} km`
    }
  }
  const estM = (route.walking_minutes || 0) * 75
  return estM < 1000 ? `${estM}m` : `${(estM / 1000).toFixed(1)} km`
}

const getBadgeInfo = (route: JourneyRouteOption) => {
  const rawLabel = (route.tag_label || route.category_badge || '').trim()
  const label = rawLabel || 'RECOMMENDED'
  // Category tags stay tinted-on-dark rather than solid saturated blocks so a
  // column of route cards reads as one calm list with a single accent each.
  let colorClass = 'u-chip-slate'

  if (label === 'FASTEST') {
    colorClass = 'u-chip-amber'
  } else if (label === 'CHEAPEST') {
    colorClass = 'u-chip-mint'
  } else if (label === 'LEAST WALKING') {
    colorClass = 'u-chip-brand'
  } else if (label === 'FEWEST TRANSFERS') {
    colorClass = 'u-chip-iris'
  } else if (label === 'MOST RELIABLE') {
    colorClass = 'u-chip-brand'
  } else if (label === 'MINIMUM WAIT' || label === '⏱ MINIMIZE WAITING') {
    colorClass = 'u-chip-aqua'
  } else if (label === 'ELECTRIC EXPRESS' || label === 'ZERO EMISSION') {
    colorClass = 'u-chip-mint'
  } else if (label === 'BRTS BUSWAY') {
    colorClass = 'u-chip-amber'
  } else if (label === 'SUBURBAN RAIL') {
    colorClass = 'u-chip-iris'
  } else if (label === 'CITY FEEDER') {
    colorClass = 'u-chip-mint'
  } else if (label === 'MULTIMODAL') {
    colorClass = 'u-chip-iris'
  } else if (label === 'ALTERNATIVE') {
    colorClass = 'u-chip-slate'
  }

  return { label, colorClass }
}

export const RouteResultsList: React.FC<RouteResultsListProps> = ({
  routes,
  selectedRouteKey,
  onSelectRoute,
  onToggleMatrix,
  onOpenMap,
  onStartCompanion,
  delayCallout,
  leaveBySummary,
}) => {
  const [showAllRoutes, setShowAllRoutes] = useState(false)
  const TOP_ROUTES_LIMIT = 5

  if (!routes || routes.length === 0) {
    return (
      <div className="u-panel space-y-3 p-8 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface-3 text-brand-500">
          <Info className="h-5 w-5" />
        </div>
        <h3 className="text-[14px] font-semibold text-ink">No direct transit route found</h3>
        <p className="mx-auto max-w-sm text-[12px] leading-relaxed text-ink-muted">
          Try expanding your walking distance preference or enabling all transport modes (Metro, BRTS, AMTS, Rail, Regional Bus).
        </p>
      </div>
    )
  }

  const hasMore = routes.length > TOP_ROUTES_LIMIT
  const visibleRoutes = showAllRoutes ? routes : routes.slice(0, TOP_ROUTES_LIMIT)
  const remainingCount = routes.length - TOP_ROUTES_LIMIT

  return (
    <div className="space-y-4">
      {/* Top Action & Summary Bar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="u-overline">
            {hasMore && !showAllRoutes
              ? `Top 5 of ${routes.length} routes`
              : `${routes.length} multimodal routes`}
          </span>
          <span className="u-chip u-chip-mint">
            <span className="live-dot" />
            Live verified
          </span>
        </div>

        {onToggleMatrix && (
          <button
            type="button"
            onClick={onToggleMatrix}
            className="u-btn u-btn-outline u-btn-sm"
          >
            <Layers className="h-3.5 w-3.5 text-ink-faint" />
            <span>Side-by-side matrix</span>
          </button>
        )}
      </div>

      {/* Leave By Target Arrival Box (if present) */}
      {leaveBySummary && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-200/70 bg-brand-50/70 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-200/60 bg-surface-2/60 text-brand-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="u-overline">
                Recommended departure for {leaveBySummary.target_arrival_time} arrival
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="u-num text-[18px] font-semibold text-ink">
                  {leaveBySummary.recommended_departure_time}
                </span>
                <span className="u-chip u-chip-brand">
                  +{leaveBySummary.safety_buffer_minutes}m buffer
                </span>
              </div>
            </div>
          </div>
          <div className="u-num text-[11.5px] text-ink-muted">
            Expected arrival{' '}
            <strong className="font-medium text-ink">{leaveBySummary.expected_arrival_time}</strong>
          </div>
        </div>
      )}

      {/* Delay-Aware Dynamic Alert Callout */}
      {delayCallout && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50 p-3.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12.5px] font-medium text-ink">Delay advisory</span>
              <span className="u-chip u-chip-amber">saves ~{delayCallout.time_saved_minutes} min</span>
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-secondary">
              {delayCallout.alert_message}
            </p>
          </div>
        </div>
      )}

      {/* Route Cards List */}
      <div className="space-y-3">
        {visibleRoutes.map((route, idx) => {
          const isSelected = selectedRouteKey === route.route_key || (!selectedRouteKey && idx === 0)
          const tightStep = route.steps.find((s) => s.is_tight)

          return (
            <div
              key={route.route_key || idx}
              onClick={() => onSelectRoute(route)}
              className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-4 transition-all duration-200 ease-silk md:p-5 ${
                isSelected
                  ? 'border-brand-200/70 bg-brand-50/50 shadow-e2'
                  : 'border-line bg-surface-2/70 hover:border-line-strong hover:bg-surface-3/60'
              }`}
            >
              {/* Category tag · title · timing · actions */}
              <div className="mb-2.5 flex flex-wrap items-start gap-x-3 gap-y-2">
                <div className="flex min-w-0 flex-1 basis-[17rem] items-start gap-2.5">
                  {(() => {
                    const { label, colorClass } = getBadgeInfo(route)
                    return <span className={`u-chip ${colorClass} mt-0.5`}>{label}</span>
                  })()}
                  <h3 className="min-w-0 flex-1 text-[14px] font-semibold leading-snug tracking-[-0.01em] text-ink">
                    {route.summary_title}
                  </h3>
                </div>

                {/* Fare, duration, map & journey-companion actions */}
                <div className="ml-auto flex shrink-0 items-center gap-2">
                  <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                    <span className="u-num text-[18px] font-semibold leading-none tracking-tight text-ink">
                      {route.duration_minutes}
                      <span className="ml-0.5 text-[10px] font-medium text-ink-muted">min</span>
                    </span>
                    <span className="u-num rounded-md border border-emerald-200/70 bg-emerald-50 px-2 py-0.5 text-[11.5px] font-semibold text-emerald-600">
                      ₹{route.fare}
                    </span>
                  </div>

                  {onOpenMap && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectRoute(route)
                        onOpenMap(route)
                      }}
                      title="Open full interactive map modal"
                      className="u-btn u-btn-outline u-btn-sm"
                    >
                      <Map className="h-3.5 w-3.5" />
                      <span>Map</span>
                    </button>
                  )}

                  {onStartCompanion && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectRoute(route)
                        onStartCompanion(route)
                      }}
                      title="Start live turn-by-turn journey companion"
                      className="u-btn u-btn-primary u-btn-sm"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Start</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Why Recommended / Key Advantages */}
              {route.why_recommended && route.why_recommended.length > 0 && (
                <div className="my-2 flex flex-wrap items-center gap-1.5">
                  {route.why_recommended.map((adv, ai) => (
                    <span
                      key={ai}
                      className="inline-flex items-center gap-1.5 rounded-md border border-iris-200/60 bg-iris-50 px-2 py-0.5 text-[11px] font-medium text-iris-600"
                    >
                      <Sparkles className="h-2.5 w-2.5 text-iris-600" />
                      {adv}
                    </span>
                  ))}
                  {route.co2_saved_kg && (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                      <Leaf className="h-2.5 w-2.5 text-mint-400" />
                      {route.co2_saved_kg} kg CO₂ saved
                    </span>
                  )}
                </div>
              )}

              {/* Tight Transfer Warning if applicable */}
              {tightStep && (
                <div className="mb-2 flex items-center gap-2 rounded-lg border border-rose-200/70 bg-rose-50 p-2 text-[11px] text-rose-600">
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-rose-400" />
                  <span>
                    <strong>🔴 Tight Transfer Connection:</strong> {tightStep.tight_transfer_warning || `Only ${tightStep.transfer_window_mins || 4} mins transfer window.`}
                  </span>
                </div>
              )}

              {/* Mode chain — WALK → METRO → BRTS → WALK */}
              <div className="flex flex-wrap items-center gap-1.5 py-1.5">
                {route.steps.map((step, sIdx) => {
                  const isEBus = step.mode === 'MTC_ELECTRIC_BUS' || step.mode === 'GANDHINAGAR_ELECTRIC_BUS' || step.mode?.includes('ELECTRIC') || step.route_number?.includes('EV') || step.route_number?.startsWith('E-')
                  const lineColor = step.route_color || (isEBus ? '#0E8A61' : '#2563EB')

                  return (
                    <React.Fragment key={sIdx}>
                      {step.step_type === 'WALK' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-3/60 px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
                          <Footprints className="h-3 w-3 text-ink-faint" />
                          {step.duration_mins}m
                        </span>
                      ) : step.step_type === 'TRANSFER' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-iris-200/60 bg-iris-50 px-2 py-0.5 text-[11px] font-medium text-iris-600">
                          <Shuffle className="h-3 w-3" />
                          Transfer {step.duration_mins}m
                          {step.transfer_window_mins ? (
                            <span className="font-normal opacity-70">{step.transfer_window_mins}m window</span>
                          ) : null}
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-3/60 py-0.5 pl-1.5 pr-2 text-[11px]"
                          title={`${step.route_number} · ${step.duration_mins} min${step.fare ? ` · ₹${step.fare}` : ''}`}
                        >
                          <span className="h-3.5 w-[3px] shrink-0 rounded-full" style={{ backgroundColor: lineColor }} aria-hidden="true" />
                          {step.mode === 'METRO' || step.mode === 'RAIL' ? (
                            <Train className="h-3 w-3 shrink-0" style={{ color: lineColor }} />
                          ) : isEBus ? (
                            <Zap className="h-3 w-3 shrink-0" style={{ color: lineColor }} />
                          ) : (
                            <Bus className="h-3 w-3 shrink-0" style={{ color: lineColor }} />
                          )}
                          <span className="font-semibold text-ink">{step.route_number}</span>
                          <span className="u-num text-ink-muted">
                            {step.duration_mins}m{step.fare !== undefined && step.fare > 0 ? ` · ₹${step.fare}` : ''}
                          </span>
                        </span>
                      )}
                      {sIdx < route.steps.length - 1 && (
                        <ArrowRight className="h-3 w-3 shrink-0 text-ink-faint" aria-hidden="true" />
                      )}
                    </React.Fragment>
                  )
                })}
              </div>

              {/* Operational footer */}
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line/70 pt-3 text-[11px] text-ink-muted sm:grid-cols-4">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
                  <span className="u-num whitespace-nowrap">
                    {route.departure_time} → {route.arrival_time}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Footprints className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
                  <span>
                    Walk <strong className="u-num font-semibold text-ink-secondary">{route.walking_minutes} min</strong>{' '}
                    <span className="text-ink-faint">({formatWalkDistance(route)})</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Shuffle className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
                  <span>
                    <strong className="u-num font-semibold text-ink-secondary">{route.transfers}</strong> transfer
                    {route.transfers === 1 ? '' : 's'} · <span className="u-num">{route.total_distance_km} km</span>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1.5 sm:justify-end">
                  {route.delay_minutes > 0 ? (
                    <span className="u-num inline-flex items-center gap-1.5 font-semibold text-amber-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      +{route.delay_minutes}m delay
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600">
                      <span className="live-dot" />
                      On time
                    </span>
                  )}
                  <span className="u-num rounded border border-line bg-surface-3 px-1.5 py-0.5 text-[10px] font-semibold text-ink-faint">
                    {Math.round(route.reliability_score * 100)}% rel
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {/* Expand / Collapse More Routes Option Button */}
        {hasMore && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAllRoutes(!showAllRoutes)}
              className="u-btn u-btn-outline group w-full py-2.5"
            >
              {showAllRoutes ? (
                <>
                  <ChevronUp className="h-4 w-4 text-ink-faint transition-transform group-hover:-translate-y-0.5" />
                  <span>Show fastest 5 · hide {remainingCount} alternatives</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 text-ink-faint transition-transform group-hover:translate-y-0.5" />
                  <span>Show {remainingCount} more multimodal routes</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
