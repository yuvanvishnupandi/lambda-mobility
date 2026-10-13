import React, { useState, useEffect } from 'react'
import { AlertTriangle, Info, XCircle, X } from 'lucide-react'
import { ServiceAlertItem } from '../../types/transit'
import { transitApi } from '../../services/transitApi'

export const ServiceAlertsBanner: React.FC = () => {
  const [alerts, setAlerts] = useState<ServiceAlertItem[]>([])
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    transitApi.getAlerts().then((data) => {
      if (data && data.length > 0) setAlerts(data)
    })
  }, [])

  if (isDismissed || alerts.length === 0) return null

  const activeAlert = alerts[0]

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return { bg: 'bg-red-50 border-red-200 text-red-900', icon: XCircle, iconColor: 'text-red-600' }
      case 'WARNING':
        return { bg: 'bg-amber-50 border-amber-200 text-amber-900', icon: AlertTriangle, iconColor: 'text-amber-600' }
      default:
        return { bg: 'bg-blue-50 border-blue-200 text-blue-900', icon: Info, iconColor: 'text-blue-600' }
    }
  }

  const badge = getSeverityBadge(activeAlert.severity)
  const Icon = badge.icon

  return (
    <div className={`${badge.bg} flex items-start justify-between gap-3 rounded-2xl border p-3.5 transition-all animate-fade`}>
      <div className="flex items-start gap-2.5">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${badge.iconColor}`} />
        <div className="text-[12.5px]">
          <div className="flex flex-wrap items-center gap-2 font-medium">
            <span>{activeAlert.title}</span>
            {activeAlert.delay_impact_mins > 0 && (
              <span className="u-num rounded border border-amber-200/70 bg-amber-50 px-1.5 py-0.5 text-[10.5px] font-medium text-amber-600">
                +{activeAlert.delay_impact_mins} min delay
              </span>
            )}
          </div>
          <p className="mt-0.5 leading-relaxed opacity-90">{activeAlert.description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        className="u-icon-btn h-7 w-7 shrink-0"
        title="Dismiss alert"
        aria-label="Dismiss service alert"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
