import { useMemo, useState } from 'react'
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
import { Activity, Car, Gauge, Flame, Clock, TrendingUp, TrendingDown, Filter } from 'lucide-react'
import HeaderActions from '../components/HeaderActions'
import { PageHeader } from '../components/common/PageHeader'
import { MetricStrip } from '../components/common/MetricStrip'
import { AnimatedCounter } from '../components/common/AnimatedCounter'
import { axisTick, gridProps, tooltipStyle } from '../components/common/chartTheme'

const hourlyDataProfiles: Record<string, { hour: string; vehicles: number }[]> = {
  '24h': [
    { hour: '00:00', vehicles: 1200 },
    { hour: '03:00', vehicles: 450 },
    { hour: '06:00', vehicles: 3800 },
    { hour: '09:00', vehicles: 8500 },
    { hour: '12:00', vehicles: 7200 },
    { hour: '15:00', vehicles: 6800 },
    { hour: '18:00', vehicles: 9200 },
    { hour: '21:00', vehicles: 4500 },
  ],
  'morning': [
    { hour: '06:00', vehicles: 3800 },
    { hour: '07:00', vehicles: 5400 },
    { hour: '08:00', vehicles: 7900 },
    { hour: '09:00', vehicles: 8500 },
    { hour: '10:00', vehicles: 7800 },
    { hour: '11:00', vehicles: 6900 },
  ],
  'evening': [
    { hour: '16:00', vehicles: 6400 },
    { hour: '17:00', vehicles: 7800 },
    { hour: '18:00', vehicles: 9200 },
    { hour: '19:00', vehicles: 8600 },
    { hour: '20:00', vehicles: 6100 },
    { hour: '21:00', vehicles: 4500 },
  ],
  'monsoon': [
    { hour: '00:00', vehicles: 800 },
    { hour: '04:00', vehicles: 320 },
    { hour: '08:00', vehicles: 6200 },
    { hour: '12:00', vehicles: 5400 },
    { hour: '16:00', vehicles: 6100 },
    { hour: '20:00', vehicles: 4200 },
  ]
}

const vehicleTypes = [
  { name: 'Cars', value: 24850, color: '#E05238' },
  { name: 'Buses (MTC & Shuttles)', value: 3420, color: '#F59E0B' },
  { name: 'Heavy Freight Trucks', value: 2180, color: '#2563EB' },
  { name: 'Two Wheelers (Bikes)', value: 15240, color: '#2F7C4E' },
  { name: 'Auto Rickshaws', value: 2604, color: '#9333EA' },
]

const congestionZones = [
  { area: 'GST Road (Potheri Central Sector)', level: 89, status: 'Critical', trend: 12 },
  { area: 'Guduvanchery Junction Flyover', level: 78, status: 'High', trend: 5 },
  { area: 'Maraimalai Nagar Industrial Hub', level: 72, status: 'High', trend: -3 },
  { area: 'Singaperumal Koil Junction', level: 65, status: 'Medium', trend: 2 },
  { area: 'Chengalpattu Toll Plaza (Paranur)', level: 54, status: 'Medium', trend: -8 },
]

const routeDelays = [
  { route: 'MTC 500 (Tambaram ↔ Chengalpattu)', avgDelay: 14, status: 'High' },
  { route: 'MTC 500A (Express)', avgDelay: 11, status: 'Medium' },
  { route: 'Cybervale Tech Shuttle 1', avgDelay: 9, status: 'Medium' },
  { route: 'TNSTC 104 (Intercity)', avgDelay: 7, status: 'Low' },
  { route: 'Suburban EMU (Potheri Stn)', avgDelay: 5, status: 'Low' },
]

type Focus = 'all' | 'critical'
type TimeWindow = '24h' | 'morning' | 'evening' | 'monsoon'

export default function TrafficAnalytics() {
  const [focus, setFocus] = useState<Focus>('all')
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('24h')

  const hourlyTraffic = useMemo(() => hourlyDataProfiles[timeWindow] || hourlyDataProfiles['24h'], [timeWindow])

  const visibleZones = useMemo(
    () => (focus === 'critical' ? congestionZones.filter(z => z.status === 'Critical' || z.status === 'High') : congestionZones),
    [focus]
  )

  const visibleDelays = useMemo(
    () => (focus === 'critical' ? routeDelays.filter(r => r.status !== 'Low') : routeDelays),
    [focus]
  )

  const meanCongestion = Math.round(visibleZones.reduce((sum, z) => sum + z.level, 0) / Math.max(visibleZones.length, 1))
  const meanDelay = (
    visibleDelays.reduce((sum, r) => sum + r.avgDelay, 0) / Math.max(visibleDelays.length, 1)
  ).toFixed(1)

  return (
    <DashboardLayout>
      <PageHeader
        title="Traffic Analytics & Corridor Velocity"
        eyebrow="Mobility Analytics · Tamil Nadu · GST Road (NH 45)"
        icon={Activity}
        live={{ label: 'Live counting active', tone: 'emerald' }}
        subtitle="Real-time multi-modal vehicle counting, congestion indices, and arterial corridor delay patterns across Chengalpattu district"
        actions={<HeaderActions />}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-[#8C8C85]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#666662]">Filter Profile:</span>
            <div className="flex items-center border border-[#D5D5CF] bg-[#FBFBFA] p-0.5">
              <button
                onClick={() => setFocus('all')}
                className={`px-2.5 py-1 text-xs font-mono font-semibold transition-all ${
                  focus === 'all' ? 'bg-[#111111] text-white' : 'text-[#666662] hover:text-[#111111]'
                }`}
              >
                All Corridors
              </button>
              <button
                onClick={() => setFocus('critical')}
                className={`px-2.5 py-1 text-xs font-mono font-semibold transition-all ${
                  focus === 'critical' ? 'bg-[#111111] text-white' : 'text-[#666662] hover:text-[#111111]'
                }`}
              >
                Critical Only
              </button>
            </div>

            <div className="flex items-center border border-[#D5D5CF] bg-[#FBFBFA] p-0.5 ml-1">
              {[
                { id: '24h', label: 'Rolling 24h' },
                { id: 'morning', label: 'Morning Peak' },
                { id: 'evening', label: 'Evening Rush' },
                { id: 'monsoon', label: 'Monsoon Window' },
              ].map(tw => (
                <button
                  key={tw.id}
                  onClick={() => setTimeWindow(tw.id as any)}
                  className={`px-2 py-1 text-[11px] font-mono transition-all ${
                    timeWindow === tw.id ? 'bg-[#FFFFFF] text-[#111111] font-bold shadow-sm' : 'text-[#666662] hover:text-[#111111]'
                  }`}
                >
                  {tw.label}
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs font-mono text-[#666662]">
            {visibleZones.length} Corridors · Mean Congestion: <strong className="text-[#111111]">{meanCongestion}%</strong> · Mean Delay: <strong className="text-[#E05238]">+{meanDelay} min</strong>
          </span>
        </div>
      </PageHeader>

      <div className="flex-1 space-y-5 overflow-auto p-4 sm:p-5">
        <MetricStrip
          dense
          items={[
            { label: 'Vehicles sensed', value: '48,294', sublabel: 'Rolling 24h window', icon: Car },
            { label: 'Mean fleet speed', value: '34 km/h', sublabel: 'Corridor-wide average', icon: Gauge, valueTone: 'emerald' },
            { label: 'Congestion index', value: `${meanCongestion}%`, sublabel: 'Elevated at peak', icon: Flame, valueTone: 'amber' },
            { label: 'Corridor delay', value: `+${meanDelay} min`, sublabel: 'GST Instrumented links', icon: Clock, valueTone: 'rose' },
            { label: 'Probes reporting', value: '248', sublabel: 'Sensing vehicles online', icon: Activity },
          ]}
        />

        {/* ── Volume + mix ──────────────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 sm:p-6 shadow-sm">
            <span className="speakeasy-notch-marker -top-1 -left-1" />
            <span className="speakeasy-notch-marker -top-1 -right-1" />
            <span className="speakeasy-notch-marker -bottom-1 -left-1" />
            <span className="speakeasy-notch-marker -bottom-1 -right-1" />

            <div className="mb-4 flex flex-wrap items-end justify-between gap-3 pb-3 border-b border-[#E5E5DF]">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C8C85]">Density Over Time</p>
                <h2 className="text-sm font-semibold tracking-tight text-[#111111] mt-0.5">
                  Hourly Traffic Volume · Chengalpattu Corridor
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Ingestion
              </span>
            </div>

            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyTraffic} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E05238" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#E05238" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridProps} stroke="#E5E5DF" />
                  <XAxis dataKey="hour" tick={axisTick} stroke="#8C8C85" />
                  <YAxis tick={axisTick} stroke="#8C8C85" />
                  <Tooltip {...tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="vehicles"
                    stroke="#E05238"
                    strokeWidth={2}
                    fill="url(#volumeGrad)"
                    dot={{ fill: '#E05238', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-3 divide-x divide-[#E5E5DF] border-t border-[#E5E5DF] pt-3">
              {[
                ['Peak Hour', '18:00 (Evening Rush)'],
                ['Peak Volume', '9,200 veh / h'],
                ['Quiet Window', '03:00 (Night Logistics)'],
              ].map(([k, v]) => (
                <div key={k} className="px-3 first:pl-0">
                  <p className="text-[10px] font-mono text-[#8C8C85] uppercase">{k}</p>
                  <p className="text-sm font-mono font-bold text-[#111111] mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 sm:p-6 shadow-sm">
            <span className="speakeasy-notch-marker -top-1 -left-1" />
            <span className="speakeasy-notch-marker -top-1 -right-1" />
            <span className="speakeasy-notch-marker -bottom-1 -left-1" />
            <span className="speakeasy-notch-marker -bottom-1 -right-1" />

            <div className="pb-3 border-b border-[#E5E5DF]">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C8C85]">Fleet Modality Mix</p>
              <h2 className="text-sm font-semibold tracking-tight text-[#111111] mt-0.5">Automated Vehicle Classification</h2>
            </div>

            <div className="relative mt-3 flex justify-center h-[180px]">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={vehicleTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {vehicleTypes.map(entry => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-lg font-bold text-[#111111]">48.3K</span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#8C8C85]">Sensed</span>
              </div>
            </div>

            <ul className="mt-3 space-y-2 border-t border-[#E5E5DF] pt-3 text-xs font-mono">
              {vehicleTypes.map(t => (
                <li key={t.name} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-[#666662]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.name}
                  </span>
                  <span className="font-bold text-[#111111]">
                    <AnimatedCounter value={t.value.toLocaleString()} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Congestion + route delays ─────────────────────────────── */}
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 sm:p-6 shadow-sm">
            <span className="speakeasy-notch-marker -top-1 -left-1" />
            <span className="speakeasy-notch-marker -top-1 -right-1" />
            <span className="speakeasy-notch-marker -bottom-1 -left-1" />
            <span className="speakeasy-notch-marker -bottom-1 -right-1" />

            <div className="mb-4 flex items-end justify-between gap-3 pb-3 border-b border-[#E5E5DF]">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C8C85]">Corridor Saturation</p>
                <h2 className="text-sm font-semibold tracking-tight text-[#111111] mt-0.5">Live Congestion Indices</h2>
              </div>
              <span className="px-2 py-0.5 text-xs font-mono bg-rose-50 text-rose-800 border border-rose-200 font-semibold">
                {visibleZones.length} Corridors
              </span>
            </div>

            <ul className="space-y-3.5">
              {visibleZones.map(zone => (
                <li key={zone.area}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-[#111111] font-semibold">{zone.area}</span>
                    <span className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 text-[11px] ${zone.trend > 0 ? 'text-rose-700 font-bold' : 'text-emerald-700'}`}>
                        {zone.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(zone.trend)}%
                      </span>
                      <span className="font-bold text-[#111111]">{zone.level}%</span>
                    </span>
                  </div>
                  <div className="h-2 bg-[#F4F4F0] border border-[#E5E5DF] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        zone.status === 'Critical' ? 'bg-[#E05238]' : zone.status === 'High' ? 'bg-[#F59E0B]' : 'bg-[#2F7C4E]'
                      }`}
                      style={{ width: `${zone.level}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 sm:p-6 shadow-sm">
            <span className="speakeasy-notch-marker -top-1 -left-1" />
            <span className="speakeasy-notch-marker -top-1 -right-1" />
            <span className="speakeasy-notch-marker -bottom-1 -left-1" />
            <span className="speakeasy-notch-marker -bottom-1 -right-1" />

            <div className="pb-3 border-b border-[#E5E5DF]">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C8C85]">Transit Schedule Impact</p>
              <h2 className="text-sm font-semibold tracking-tight text-[#111111] mt-0.5">Average Route Delay (Minutes)</h2>
            </div>

            <div className="h-[230px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visibleDelays} barSize={34} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid {...gridProps} stroke="#E5E5DF" vertical={false} />
                  <XAxis dataKey="route" tick={axisTick} stroke="#8C8C85" />
                  <YAxis tick={axisTick} stroke="#8C8C85" />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="avgDelay" radius={[2, 2, 0, 0]}>
                    {visibleDelays.map(entry => (
                      <Cell
                        key={entry.route}
                        fill={entry.status === 'High' ? '#E05238' : entry.status === 'Medium' ? '#F59E0B' : '#2F7C4E'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
