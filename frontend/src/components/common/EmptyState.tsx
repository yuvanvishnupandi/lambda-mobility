import React from 'react'
import { LucideIcon } from 'lucide-react'
import { LambdaMark } from './LambdaLogo'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
  className?: string
}

/** Quiet, branded empty state — a blank instrument face. */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  action,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center gap-3 px-6 py-12 text-center ${className}`}>
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-3 text-ink-faint shadow-recessed">
      {Icon ? <Icon className="h-5 w-5" /> : <LambdaMark className="h-5 w-5" variant="mono" />}
    </span>
    <div>
      <p className="text-[13.5px] font-bold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[12px] leading-relaxed text-ink-muted">{description}</p>}
    </div>
    {action}
  </div>
)

interface LoadingStateProps {
  label?: string
  rows?: number
  className?: string
}

/** Skeleton shimmer — un-etched rails while telemetry resolves. */
export const LoadingState: React.FC<LoadingStateProps> = ({ label = 'Loading telemetry', rows = 3, className = '' }) => (
  <div className={`space-y-2.5 p-4 ${className}`} role="status" aria-live="polite">
    <span className="sr-only">{label}</span>
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="h-11 animate-shimmer rounded-lg bg-surface-3/70 shadow-recessed"
        style={{
          backgroundImage:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animationDelay: `${i * 90}ms`,
        }}
      />
    ))}
  </div>
)

export default EmptyState
