import DashboardLayout from '../layouts/DashboardLayout'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { AlertTriangle, Route, Wrench, ListOrdered, MapPin } from 'lucide-react'
import HeaderActions from '../components/HeaderActions'
import { PageHeader } from '../components/common/PageHeader'
import { MetricStrip } from '../components/common/MetricStrip'
import { StatusBadge, StatusTone } from '../components/common/StatusBadge'
import { CHART, axisTick, gridProps, tooltipStyle } from '../components/common/chartTheme'

const hazardsByCategory = [
  { name: 'Potholes', value: 142, color: CHART.rose },
  { name: 'Road damage', value: 89, color: CHART.amber },
  { name: 'Waterlogging', value: 54, color: CHART.brand },
  { name: 'Missing dividers', value: 28, color: CHART.iris },
  { name: 'Other hazards', value: 14, color: CHART.slate },
]

const trendData = [
  { month: 'Jan', hazards: 245, repaired: 180 },
  { month: 'Feb', hazards: 289, repaired: 210 },
  { month: 'Mar', hazards: 312, repaired: 265 },
  { month: 'Apr', hazards: 298, repaired: 280 },
  { month: 'May', hazards: 327, repaired: 290 },
]

const confidenceData = [
  { range: '90–100%', count: 248, fill: CHART.emerald },
  { range: '80–89%', count: 56, fill: CHART.brand },
  { range: '70–79%', count: 18, fill: CHART.amber },
  { range: '<70%', count: 5, fill: CHART.rose },
]

const maintenancePriority = [
  { road: 'GST Road (NH 45), Potheri Sector', hazards: 18, severity: 'Critical', lastDetection: '2 hours ago', priority: 'HIGH', pci: 34 },
  { road: 'Guduvanchery Junction Flyover Approach', hazards: 14, severity: 'High', lastDetection: '4 hours ago', priority: 'HIGH', pci: 41 },
  { road: 'Maraimalai Nagar Industrial Hub (Ford Gate)', hazards: 12, severity: 'High', lastDetection: '6 hours ago', priority: 'MEDIUM', pci: 53 },
  { road: 'Singaperumal Koil Bypass (SH 57 Link)', hazards: 9, severity: 'Medium', lastDetection: '8 hours ago', priority: 'MEDIUM', pci: 62 },
  { road: 'Paranur Toll Plaza / MWC Corridor', hazards: 7, severity: 'Medium', lastDetection: '12 hours ago', priority: 'LOW', pci: 71 },
]

const zoneDefects = [
  { zone: 'Technology Corridor & Innovation Zone', count: 89, color: CHART.rose },
  { zone: 'Chengalpattu Urban Central', count: 76, color: CHART.amber },
  { zone: 'Maraimalai Nagar Industrial Hub', count: 68, color: CHART.brand },
  { zone: 'Guduvanchery - Vandalur Sector', count: 54, color: CHART.emerald },
  { zone: 'Singaperumal Koil - Oragadam Corridor', count: 40, color: CHART.iris },
]

const priorityTone: Record<string, StatusTone> = { HIGH: 'rose', MEDIUM: 'amber', LOW: 'blue' }

const pciTone = (pci: number) => (pci < 50 ? 'bg-rose-400' : pci < 65 ? 'bg-amber-400' : 'bg-emerald-400')

export default function RoadIntelligence() {
  const totalHazards = hazardsByCategory.reduce((sum, c) => sum + c.value, 0)

  return (
    <DashboardLayout>
      <PageHeader
        title="Road Intelligence"
        eyebrow="Infrastructure workspace · pavement condition"
        icon={Route}
        live={{ label: '24 segments prioritised', tone: 'amber' }}
        subtitle="Automated defect detection, surface quality indexing and civil repair dispatch"
        actions={<HeaderActions />}
      />

      <div className="flex-1 space-y-4 overflow-auto p-4 sm:p-5">
        <MetricStrip
          dense
          items={[
            { label: 'Roads scanned', value: '1,284 km', sublabel: 'Network coverage', icon: Route },
            { label: 'Hazards detected', value: 327, sublabel: 'Surface defects logged', icon: AlertTriangle, valueTone: 'amber' },
            { label: 'Critical segments', value: 24, sublabel: 'Needs civil repair', icon: Wrench, valueTone: 'rose' },
            { label: 'Repair queue', value: 86, sublabel: 'Ranked by PCI', icon: ListOrdered },
            { label: 'Mean PCI score', value: 58, sublabel: 'Below intervention line', icon: MapPin, valueTone: 'brand' },
          ]}
        />

        {/* ── Hero visualisation ─────────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="u-panel p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="u-overline">Five-month view</p>
                <h2 className="u-h3 mt-1">Detections against completed repairs</h2>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-2 text-ink-secondary">
                  <span className="h-0.5 w-4 rounded bg-rose-400" /> Hazards detected
                </span>
                <span className="flex items-center gap-2 text-ink-secondary">
                  <span className="h-0.5 w-4 rounded bg-emerald-400" /> Repaired
                </span>
              </div>
            </div>

            <div className="u-recharts">
              <ResponsiveContainer width="100%" height={264}>
                <AreaChart data={trendData} margin={{ top: 4, right: 6, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hazardGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART.rose} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={CHART.rose} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="repairGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART.emerald} stopOpacity={0.24} />
                      <stop offset="100%" stopColor={CHART.emerald} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="hazards"
                    stroke={CHART.rose}
                    strokeWidth={2}
                    fill="url(#hazardGrad)"
                    animationDuration={1200}
                  />
                  <Area
                    type="monotone"
                    dataKey="repaired"
                    stroke={CHART.emerald}
                    strokeWidth={2}
                    fill="url(#repairGrad)"
                    animationDuration={1400}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-3 divide-x divide-line/70 border-t border-line/70 pt-3">
              {[
                ['Detected this month', '327'],
                ['Repaired this month', '290'],
                ['Backlog', '37'],
              ].map(([k, v]) => (
                <div key={k} className="px-3 first:pl-0">
                  <p className="u-overline">{k}</p>
                  <p className="u-num mt-1 text-[18px] font-semibold text-ink">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hazard distribution */}
          <div className="u-panel p-4 sm:p-5">
            <p className="u-overline">Defect classification</p>
            <h2 className="u-h3 mt-1">Hazard distribution</h2>

            <div className="mt-4 flex items-center gap-5">
              <div className="u-recharts relative">
                <ResponsiveContainer width={148} height={148}>
                  <PieChart>
                    <Pie
                      data={hazardsByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={0}
                      animationDuration={1100}
                    >
                      {hazardsByCategory.map(entry => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="u-num text-[20px] font-semibold text-ink">{totalHazards}</span>
                  <span className="u-overline mt-0.5">flagged</span>
                </div>
              </div>

              <ul className="flex-1 space-y-2.5">
                {hazardsByCategory.map(c => (
                  <li key={c.name} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-[12px] text-ink-secondary">
                      <span className="u-dot" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </span>
                    <span className="u-num text-[12px] font-medium text-ink">{c.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Zone + model quality ───────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="u-panel p-4 sm:p-5">
            <p className="u-overline">Spatial distribution</p>
            <h2 className="u-h3 mt-1">Defects by city zone</h2>

            <ul className="mt-4 space-y-3.5">
              {zoneDefects.map(zone => (
                <li key={zone.zone}>
                  <div className="mb-1.5 flex items-center justify-between text-[12px]">
                    <span className="flex items-center gap-2 text-ink-secondary">
                      <span className="u-dot" style={{ backgroundColor: zone.color }} />
                      {zone.zone}
                    </span>
                    <span className="u-num font-medium text-ink">{zone.count}</span>
                  </div>
                  <div className="u-progress">
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-silk"
                      style={{ width: `${(zone.count / 89) * 100}%`, backgroundColor: zone.color }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="u-panel p-4 sm:p-5">
            <p className="u-overline">Model quality</p>
            <h2 className="u-h3 mt-1">Detection confidence distribution</h2>

            <div className="u-recharts mt-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={confidenceData} barSize={44} margin={{ top: 4, right: 6, left: -18, bottom: 0 }}>
                  <CartesianGrid {...gridProps} vertical={false} />
                  <XAxis dataKey="range" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={1100}>
                    {confidenceData.map(entry => (
                      <Cell key={entry.range} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ── Maintenance queue ──────────────────────────────────────── */}
        <section className="u-panel overflow-hidden">
          <span className="u-hair" aria-hidden="true" />

          <div className="u-panel-head">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface-3 text-amber-600">
                <Wrench className="h-3.5 w-3.5" />
              </span>
              <div>
                <h2 className="text-[13px] font-semibold text-ink">Maintenance queue</h2>
                <p className="text-[11px] text-ink-muted">Ranked by pavement condition index and repeat detections</p>
              </div>
            </div>
            <span className="u-chip u-chip-amber">{maintenancePriority.length} segments</span>
          </div>

          <div className="u-scroll-x">
            <table className="w-full min-w-[820px] text-left">
              <thead className="bg-surface-1/60">
                <tr>
                  <th className="u-th">Segment</th>
                  <th className="u-th">Defects</th>
                  <th className="u-th">PCI score</th>
                  <th className="u-th">Severity</th>
                  <th className="u-th">Last detection</th>
                  <th className="u-th">Priority</th>
                </tr>
              </thead>
              <tbody>
                {maintenancePriority.map(item => (
                  <tr key={item.road} className="u-row">
                    <td className="u-td">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-6 w-[3px] rounded-full"
                          style={{
                            backgroundColor:
                              item.priority === 'HIGH' ? CHART.rose : item.priority === 'MEDIUM' ? CHART.amber : CHART.brand,
                          }}
                        />
                        <span className="font-medium text-ink">{item.road}</span>
                      </span>
                    </td>
                    <td className="u-td u-num">{item.hazards} spots</td>
                    <td className="u-td">
                      <span className="flex items-center gap-2.5">
                        <span className="u-progress w-20">
                          <span className={`block h-full rounded-full ${pciTone(item.pci)}`} style={{ width: `${item.pci}%` }} />
                        </span>
                        <span className="u-num text-ink">{item.pci}</span>
                      </span>
                    </td>
                    <td className="u-td">{item.severity}</td>
                    <td className="u-td u-num text-ink-muted">{item.lastDetection}</td>
                    <td className="u-td">
                      <StatusBadge status={item.priority} tone={priorityTone[item.priority] ?? 'slate'} size="sm" dot={false} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
