import React from 'react'
import {
  AlertTriangle,
  Zap,
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react'
import { ServiceAlertItem } from '../../types/transit'

interface ElectricBusAlertProps {
  alert?: ServiceAlertItem
  title?: string
  description?: string
  severity?: 'INFO' | 'WARNING' | 'CRITICAL'
  routeNumber?: string
  affectedStops?: string[]
  recommendedAlternative?: string
  timeImpactMins?: number
}

export const ElectricBusAlert: React.FC<ElectricBusAlertProps> = ({
  alert,
  title = 'Tamil Nadu GST Road Green Corridor Advisory',
  description = 'MTC electric buses operating with 100% on-time reliability across Chengalpattu and GST Road arterial hubs.',
  severity = 'INFO',
  routeNumber,
  recommendedAlternative,
  timeImpactMins,
}) => {
  const alertTitle = alert?.title || title
  const alertDesc = alert?.description || description
  const alertSev = alert?.severity || severity
  const impact = alert?.delay_impact_mins ?? timeImpactMins

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-50 border-rose-200 text-rose-700'
      case 'WARNING':
        return 'bg-amber-50 border-amber-200 text-amber-700'
      default:
        return 'bg-emerald-50 border-emerald-200 text-emerald-700'
    }
  }

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
      case 'WARNING':
        return <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      default:
        return <Zap className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
    }
  }

  return (
    <div className={`rounded-xl border p-4 shadow-e1 transition-all ${getSeverityStyle(alertSev)}`}>
      <div className="flex items-start gap-3">
        {getSeverityIcon(alertSev)}
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="text-sm font-semibold tracking-tight text-ink">
              {alertTitle}
            </h4>
            {routeNumber && (
              <span className="u-num rounded border border-line bg-surface-3/70 px-2 py-0.5 text-[10px] font-semibold text-ink-secondary">
                Route {routeNumber}
              </span>
            )}
          </div>

          <p className="text-xs leading-relaxed text-ink-secondary">
            {alertDesc}
          </p>

          {/* Alternative Route Advice */}
          {recommendedAlternative && (
            <div className="mt-2 rounded-lg border border-line bg-surface-1 p-2.5 text-xs">
              <p className="mb-0.5 flex items-center gap-1.5 font-semibold text-emerald-700">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>Recommended alternative route</span>
              </p>
              <p className="text-ink-secondary">{recommendedAlternative}</p>
            </div>
          )}

          {impact && impact > 0 && (
            <p className="u-num mt-1 flex items-center gap-1 text-[11px] text-amber-700">
              <Clock className="h-3 w-3" />
              <span>Estimated delay impact +{impact} minutes</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
