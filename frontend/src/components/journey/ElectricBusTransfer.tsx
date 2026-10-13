import React from 'react'
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Footprints,
  Zap,
  Accessibility
} from 'lucide-react'

interface ElectricBusTransferProps {
  fromMode: string
  toMode: string
  stationName: string
  walkMinutes: number
  availableWindowMinutes: number
  isTight?: boolean
  nextSafeDeparture?: string
  fromPlatform?: string
  toPlatform?: string
  instructions?: string
  isStepFree?: boolean
}

export const ElectricBusTransfer: React.FC<ElectricBusTransferProps> = ({
  fromMode,
  toMode,
  stationName,
  walkMinutes = 3,
  availableWindowMinutes = 6,
  isTight = false,
  nextSafeDeparture,
  fromPlatform,
  toPlatform,
  instructions,
  isStepFree = true,
}) => {
  const isEBus = toMode === 'MTC_ELECTRIC_BUS' || toMode === 'GANDHINAGAR_ELECTRIC_BUS' || toMode.includes('ELECTRIC')

  return (
    <div
      className={`rounded-xl border p-4 my-2 transition-all ${
        isTight
          ? 'border-rose-200 bg-rose-50 shadow-e1'
          : 'border-emerald-200 bg-emerald-50/70 shadow-e1'
      }`}
    >
      {/* Header: Transfer Badge & Risk Indicator */}
      <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-emerald-100 p-1 text-emerald-700">
            <Footprints className="h-4 w-4" />
          </span>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink">
            Interchange connection · {stationName}
          </h4>
        </div>

        {/* Tight Transfer Warning or Protected Connection */}
        {isTight ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            <span>High-risk transfer</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Protected connection ({availableWindowMinutes}m window)</span>
          </span>
        )}
      </div>

      {/* Transfer Details Grid */}
      <div className="space-y-2 rounded-lg border border-line bg-surface-1 p-3 text-xs">
        <div className="flex items-center justify-between text-ink-secondary">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-ink">{fromMode}</span>
            <ArrowRight className="h-3.5 w-3.5 text-emerald-600" />
            <span className="flex items-center gap-1 font-semibold text-emerald-700">
              <Zap className="h-3 w-3 fill-emerald-600 text-emerald-600" />
              <span>{isEBus ? 'MTC electric bus' : toMode}</span>
            </span>
          </div>

          <span className="u-num text-ink-muted">
            ~{walkMinutes} min walk
          </span>
        </div>

        {/* Platform Guidance */}
        {(fromPlatform || toPlatform) && (
          <div className="u-num flex items-center justify-between border-t border-line pt-1 text-[11px] text-ink-muted">
            <span>From <strong className="font-medium text-ink">{fromPlatform || 'Main concourse'}</strong></span>
            <span>To <strong className="font-medium text-emerald-700">{toPlatform || 'Electric bus stand'}</strong></span>
          </div>
        )}

        {/* Custom Transfer Instructions */}
        {instructions && (
          <p className="border-t border-line pt-1 text-[11px] text-ink-secondary">
            {instructions}
          </p>
        )}
      </div>

      {/* High-Risk Transfer Safe Alternate Advice */}
      {isTight && (
        <div className="mt-2.5 space-y-1 rounded-lg border border-rose-200 bg-rose-100/70 p-2.5 text-xs">
          <p className="flex items-center gap-1.5 font-semibold text-rose-700">
            <Clock className="h-3.5 w-3.5" />
            <span>Tight connection ({availableWindowMinutes}m window vs {walkMinutes}m walk)</span>
          </p>
          <p className="text-[11px] text-ink-secondary">
            If you miss this connection, the next safe scheduled bus departs at{' '}
            <strong className="u-num font-semibold text-emerald-700">
              {nextSafeDeparture || 'subsequent scheduled departure (+10-15m)'}
            </strong>.
          </p>
        </div>
      )}

      {/* Accessibility */}
      {isStepFree && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-teal-700">
          <Accessibility className="h-3 w-3" />
          <span>Step-free accessible route (elevator and tactile path available)</span>
        </div>
      )}
    </div>
  )
}
