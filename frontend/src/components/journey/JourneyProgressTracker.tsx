import React, { useState, useEffect } from 'react'
import {
  CheckCircle2,
  Footprints,
  Train,
  Bus,
  Zap,
  ArrowRight,
  AlertTriangle,
  X
} from 'lucide-react'
import { JourneyRouteOption, JourneyStep } from '../../types/transit'

interface JourneyProgressTrackerProps {
  route: JourneyRouteOption
  onClose: () => void
  onFocusStepOnMap?: (coordinates: [number, number][]) => void
}

export const JourneyProgressTracker: React.FC<JourneyProgressTrackerProps> = ({
  route,
  onClose,
  onFocusStepOnMap,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [elapsedMinutes, setElapsedMinutes] = useState(0)
  const steps = route.steps || []
  const currentStep = steps[currentStepIndex] || steps[0]

  // Simulated elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedMinutes(prev => prev + 1)
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const totalMinutes = route.duration_minutes || 35
  const remainingMinutes = Math.max(0, totalMinutes - elapsedMinutes)
  const progressPct = Math.min(100, Math.round(((currentStepIndex + 0.5) / Math.max(1, steps.length)) * 100))

  const getStepIcon = (step: JourneyStep) => {
    if (step.step_type === 'WALK') return <Footprints className="h-4 w-4 text-amber-600" />
    if (step.mode === 'MTC_ELECTRIC_BUS' || step.mode === 'GANDHINAGAR_ELECTRIC_BUS' || step.mode?.includes('ELECTRIC'))
      return <Zap className="h-4 w-4 fill-emerald-600 text-emerald-600" />
    if (step.mode === 'METRO') return <Train className="h-4 w-4 text-red-600" />
    if (step.mode === 'BRTS') return <Bus className="h-4 w-4 text-amber-600" />
    return <Bus className="h-4 w-4 text-aqua-700" />
  }

  return (
    <div className="animate-slide-right fixed inset-x-4 bottom-4 z-50 rounded-2xl border-2 border-emerald-300 bg-surface-1 p-5 shadow-float md:inset-x-auto md:bottom-6 md:right-6 md:w-[460px]">
      {/* Companion Mode Header */}
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-600"></span>
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Live companion mode
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="u-num rounded-full border border-line bg-surface-3 px-2.5 py-0.5 text-[11.5px] font-medium text-ink">
            {remainingMinutes}m remaining
          </span>
          <button
            onClick={onClose}
            className="u-icon-btn"
            title="Exit companion mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Step Progress Bar */}
      <div className="space-y-1.5 mb-4">
        <div className="u-num flex items-center justify-between text-[11px] text-ink-muted">
          <span>Step {currentStepIndex + 1} of {steps.length}</span>
          <span className="font-semibold text-emerald-700">{progressPct}% completed</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full border border-line bg-surface-4 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-aqua-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Active Current Step Focus Card */}
      {currentStep && (
        <div className="mb-4 space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-lg border border-emerald-200 bg-surface-1 p-2">
                {getStepIcon(currentStep)}
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight text-ink">
                  {currentStep.title}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {currentStep.from_name} → {currentStep.to_name}
                </p>
              </div>
            </div>

            <span className="u-num shrink-0 rounded border border-emerald-200 bg-surface-1 px-2 py-1 text-xs font-semibold text-emerald-700">
              ~{currentStep.duration_mins} min
            </span>
          </div>

          <p className="rounded-lg border border-line bg-surface-1 p-2.5 text-[12px] leading-relaxed text-ink-secondary">
            {currentStep.instructions}
          </p>

          {/* Platform / Stand Reminder */}
          {(currentStep.from_platform || currentStep.platform_info) && (
            <div className="u-num flex items-center justify-between rounded-lg border border-aqua-200 bg-aqua-50 px-3 py-1.5 text-[11px] text-aqua-700">
              <span>Platform / bay</span>
              <strong className="font-semibold text-ink">{currentStep.from_platform || currentStep.platform_info}</strong>
            </div>
          )}

          {/* High risk transfer warning if on tight transfer step */}
          {currentStep.is_tight && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{currentStep.tight_transfer_warning || 'Connection window is tight — walk briskly to the next stand.'}</span>
            </div>
          )}
        </div>
      )}

      {/* Step Navigation Controls */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
          disabled={currentStepIndex === 0}
          className="u-btn u-btn-outline u-btn-sm"
        >
          Previous step
        </button>

        {currentStepIndex < steps.length - 1 ? (
          <button
            onClick={() => {
              const nextIdx = currentStepIndex + 1
              setCurrentStepIndex(nextIdx)
              if (onFocusStepOnMap && steps[nextIdx]?.coordinates) {
                onFocusStepOnMap(steps[nextIdx].coordinates)
              }
            }}
            className="u-btn u-btn-primary u-btn-sm flex-1"
          >
            <span className="truncate">Next: {steps[currentStepIndex + 1]?.title}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="u-btn u-btn-primary u-btn-sm flex-1"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Complete journey</span>
          </button>
        )}
      </div>
    </div>
  )
}
