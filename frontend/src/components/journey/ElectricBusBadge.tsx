import React from 'react'
import { Zap, Leaf } from 'lucide-react'

interface ElectricBusBadgeProps {
  routeNumber?: string
  operator?: 'MTC_EV' | 'MWC_TRANSIT' | 'TNSTC' | string
  size?: 'sm' | 'md' | 'lg'
  showZeroEmission?: boolean
  showOperator?: boolean
  className?: string
}

export const ElectricBusBadge: React.FC<ElectricBusBadgeProps> = ({
  routeNumber,
  operator = 'MTC_EV',
  size = 'md',
  showZeroEmission = true,
  showOperator = true,
  className = '',
}) => {
  const isMwc = operator.includes('MWC')

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }

  return (
    <div className={`inline-flex items-center flex-wrap gap-1.5 ${className}`}>
      {/* Primary Electric Bus Badge */}
      <span
        className={`inline-flex items-center font-bold tracking-wide rounded-full border shadow-sm transition-all duration-300 ${
          sizeClasses[size]
        } ${
          isMwc
            ? 'bg-teal-50 border-teal-200 text-teal-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}
      >
        <span className="relative flex items-center justify-center">
          <Zap className={`${iconSizes[size]} text-emerald-600 fill-emerald-600`} />
        </span>
        <span className="font-semibold text-emerald-700">
          {routeNumber ? routeNumber : 'MTC electric bus'}
        </span>
        {showOperator && (
          <span className="u-num ml-0.5 rounded border border-line bg-surface-3/70 px-1.5 py-px text-[10px] font-medium text-ink-muted">
            {isMwc ? 'MWC Shuttle EV' : 'MTC Greenline EV'}
          </span>
        )}
      </span>

      {/* Zero Emission Tag */}
      {showZeroEmission && (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
          <Leaf className="h-2.5 w-2.5 text-emerald-600" />
          <span>Zero emission</span>
        </span>
      )}
    </div>
  )
}
