import React, { useState, useEffect } from 'react'
import {
  Zap,
  Leaf,
  BatteryCharging,
  Gauge,
  Building,
  Sparkles,
  TreeDeciduous,
  Fuel,
  RefreshCw
} from 'lucide-react'
import { ElectricBusStats } from '../../types/transit'
import { transitApi } from '../../services/transitApi'

export const ElectricBusDetails: React.FC = () => {
  const [stats, setStats] = useState<ElectricBusStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const data = await transitApi.getElectricBusStats()
      if (data) {
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to load electric bus stats', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(() => {
      fetchStats()
    }, 20000)
    return () => clearInterval(interval)
  }, [])

  if (!stats) return null

  const { fleet_metrics, environmental_impact, service_quality } = stats

  return (
    <div className="space-y-6 rounded-2xl border border-emerald-200 bg-surface-1 p-6 shadow-e1">
      {/* Network header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Zap className="h-3.5 w-3.5 fill-emerald-600 text-emerald-600" />
              <span>PM-eBus Sewa initiative</span>
            </span>

            <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
              <Leaf className="h-3 w-3 text-teal-600" />
              <span>Tamil Nadu green mobility</span>
            </span>

            <span className="u-num rounded-full border border-line bg-surface-3/70 px-2 py-0.5 text-[10px] text-ink-muted">
              Provenance {stats.provenance}
            </span>
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-ink">{stats.network_name}</h2>
          <p className="text-xs text-ink-secondary">
            Primary operator <strong className="font-semibold text-emerald-700">{stats.operator}</strong> · partner{' '}
            <strong className="font-semibold text-teal-700">{stats.partner_agency}</strong>
          </p>
        </div>

        <button onClick={fetchStats} disabled={isLoading} className="u-icon-btn self-start" title="Refresh fleet stats">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {/* Fleet deployment */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-line bg-surface-2 p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Electric fleet</p>
          <p className="u-num mt-1 text-2xl font-semibold text-ink">
            {fleet_metrics.fleet_total} <span className="text-xs font-normal text-ink-muted">e-buses</span>
          </p>
          <p className="mt-1 text-[10px] font-medium text-emerald-700">100% BEV contracted</p>
        </div>

        <div className="rounded-xl border border-line bg-surface-2 p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Deployed</p>
          <p className="u-num mt-1 text-2xl font-semibold text-emerald-700">
            {fleet_metrics.fleet_deployed} <span className="text-xs font-normal text-ink-muted">on road</span>
          </p>
          <p className="mt-1 text-[10px] font-medium text-ink-muted">Scheduled operations</p>
        </div>

        <div className="rounded-xl border border-line bg-surface-2 p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Active on GPS</p>
          <p className="u-num mt-1 flex items-center gap-1.5 text-2xl font-semibold text-teal-700">
            <span>{fleet_metrics.fleet_active}</span>
            <span className="h-2 w-2 animate-ping-slow rounded-full bg-emerald-500" />
          </p>
          <p className="mt-1 text-[10px] font-medium text-emerald-700">Real-time telemetry</p>
        </div>

        <div className="rounded-xl border border-line bg-surface-2 p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Electrified network</p>
          <p className="u-num mt-1 text-2xl font-semibold text-amber-700">
            {fleet_metrics.active_routes_count} <span className="text-xs font-normal text-ink-muted">routes</span>
          </p>
          <p className="mt-1 text-[10px] font-medium text-ink-muted">
            {fleet_metrics.electrified_stops_count} served stops
          </p>
        </div>
      </div>

      {/* Environmental impact */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
            Daily green impact
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <div className="rounded-lg border border-emerald-200/70 bg-surface-1 p-3">
            <span className="flex items-center gap-1.5 text-ink-muted">
              <Gauge className="h-3.5 w-3.5 text-emerald-600" />
              <span>Clean distance</span>
            </span>
            <p className="u-num mt-1 text-lg font-semibold text-ink">
              {environmental_impact.clean_km_today.toLocaleString()} km
            </p>
            <p className="text-[10px] text-emerald-700">Travelled today</p>
          </div>

          <div className="rounded-lg border border-emerald-200/70 bg-surface-1 p-3">
            <span className="flex items-center gap-1.5 text-ink-muted">
              <Leaf className="h-3.5 w-3.5 text-emerald-600" />
              <span>CO₂ prevented</span>
            </span>
            <p className="u-num mt-1 text-lg font-semibold text-emerald-700">
              {environmental_impact.co2_saved_kg_today.toLocaleString()} kg
            </p>
            <p className="text-[10px] text-ink-muted">Zero tailpipe emission</p>
          </div>

          <div className="rounded-lg border border-emerald-200/70 bg-surface-1 p-3">
            <span className="flex items-center gap-1.5 text-ink-muted">
              <Fuel className="h-3.5 w-3.5 text-amber-600" />
              <span>Diesel displaced</span>
            </span>
            <p className="u-num mt-1 text-lg font-semibold text-amber-700">
              {environmental_impact.diesel_saved_liters_today.toLocaleString()} L
            </p>
            <p className="text-[10px] text-ink-muted">Fuel not burned</p>
          </div>

          <div className="rounded-lg border border-emerald-200/70 bg-surface-1 p-3">
            <span className="flex items-center gap-1.5 text-ink-muted">
              <TreeDeciduous className="h-3.5 w-3.5 text-teal-600" />
              <span>Tree equivalent</span>
            </span>
            <p className="u-num mt-1 text-lg font-semibold text-teal-700">
              {environmental_impact.tree_equivalent_co2_offset.toLocaleString()}
            </p>
            <p className="text-[10px] text-ink-muted">Mature trees / year</p>
          </div>
        </div>
      </div>

      {/* Charging infrastructure */}
      <div>
        <h4 className="mb-2.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          <BatteryCharging className="h-3.5 w-3.5 text-emerald-600" />
          <span>Active EV fast-charging hubs and depots</span>
        </h4>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {fleet_metrics.ev_depot_locations.map((loc, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 rounded-xl border border-line bg-surface-1 p-3 text-[12px] text-ink-secondary"
            >
              <Building className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <p className="font-medium text-ink">{loc}</p>
                <p className="mt-0.5 text-[10px] text-emerald-700">240 kW CCS-2 DC fast chargers</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service quality */}
      {service_quality && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-[11px] text-ink-muted">
          <span>
            Fleet electrification{' '}
            <strong className="font-semibold text-emerald-700">{service_quality.fleet_electrification_rate}</strong>
          </span>
          <span>
            On-time performance{' '}
            <strong className="u-num font-semibold text-ink">{service_quality.on_time_performance_pct}%</strong>
          </span>
          <span>
            Peak headway{' '}
            <strong className="u-num font-semibold text-teal-700">{service_quality.average_peak_headway_mins}m</strong>
          </span>
          <span>
            Low-floor accessible{' '}
            <strong className="u-num font-semibold text-emerald-700">{service_quality.low_floor_accessible_pct}%</strong>
          </span>
        </div>
      )}
    </div>
  )
}
