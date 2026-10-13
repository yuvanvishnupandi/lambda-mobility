import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import {
  Clock,
  Radio,
  Compass,
  Navigation,
  RefreshCw,
  Database,
  Activity,
  Sparkles,
  Map as MapIcon,
  ArrowRight,
} from 'lucide-react'
import { JourneySearchPanel } from '../components/journey/JourneySearchPanel'
import { RouteResultsList } from '../components/journey/RouteResultsList'
import { JourneyTimeline } from '../components/journey/JourneyTimeline'
import { DepartureBoard } from '../components/journey/DepartureBoard'
import { LiveVehicleTrackerCard } from '../components/journey/LiveVehicleTrackerCard'
import { NearbyTransportFinder } from '../components/journey/NearbyTransportFinder'
import { ServiceAlertsBanner } from '../components/journey/ServiceAlertsBanner'
import { DataSourceStatusModal } from '../components/journey/DataSourceStatusModal'
import { AiJourneyAssistantBar } from '../components/journey/AiJourneyAssistantBar'
import { RouteComparisonTable } from '../components/journey/RouteComparisonTable'
import { AdminNetworkMonitorModal } from '../components/journey/AdminNetworkMonitorModal'
import { TransitMapModal } from '../components/journey/TransitMapModal'
import { TraccarGpsModal } from '../components/journey/TraccarGpsModal'
import { JourneyProgressTracker } from '../components/journey/JourneyProgressTracker'
import { JourneyPlanResult, JourneyRouteOption, LiveVehicle } from '../types/transit'
import { transitApi } from '../services/transitApi'
import { PageHeader } from '../components/common/PageHeader'
import { SectionHeader } from '../components/common/SectionHeader'

type FeatureMode = 'plan' | 'ai' | 'tracker' | 'departures' | 'nearby'

const FEATURES: { id: FeatureMode; label: string; icon: any; live?: boolean }[] = [
  { id: 'plan', label: 'Plan trip', icon: Compass },
  { id: 'ai', label: 'AI assistant', icon: Sparkles },
  { id: 'tracker', label: 'Live tracker', icon: Radio, live: true },
  { id: 'departures', label: 'Departures', icon: Clock },
  { id: 'nearby', label: 'Nearby stops', icon: Navigation },
]

const CORRIDORS = [
  { from: 'Tambaram Central Bus Terminus & Southern Railway EMU Hub', to: 'SRM Institute of Science & Technology · Kattankulathur Campus', label: 'Tambaram → SRM Potheri', desc: 'MTC Route 500A + Southern EMU' },
  { from: 'Puratchi Thalaivar Dr. M.G. Ramachandran Central Railway Terminal', to: 'Mahindra World City Tech & Industrial SEZ', label: 'Chennai Central → MWC', desc: 'Suburban EMU Express Corridor' },
  { from: 'Kalaignar Centenary Bus Terminus (KCBT Kilambakkam)', to: 'Cybervale Technology Park & Research Corridor', label: 'Kilambakkam → Cybervale', desc: 'Electric Tech Shuttle Corridor' },
  { from: 'Guindy Industrial Estate Metro & Suburban Station', to: 'Chengalpattu Central Railway Junction (CGL Terminal)', label: 'Guindy → Chengalpattu Jn', desc: 'CMRL Metro + Fast Suburban Link' },
]

export default function JourneyPlanner() {
  const [activeFeature, setActiveFeature] = useState<FeatureMode>('plan')
  const [journeyData, setJourneyData] = useState<JourneyPlanResult | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<JourneyRouteOption | null>(null)
  const [liveVehicles, setLiveVehicles] = useState<LiveVehicle[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showAdminMonitor, setShowAdminMonitor] = useState(false)
  const [showTraccarModal, setShowTraccarModal] = useState(false)
  const [showMatrix, setShowMatrix] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const [isCompanionActive, setIsCompanionActive] = useState(false)
  const [companionRoute, setCompanionRoute] = useState<JourneyRouteOption | null>(null)

  const [searchFrom, setSearchFrom] = useState('')
  const [searchTo, setSearchTo] = useState('')
  const [aiPreset, setAiPreset] = useState<string | undefined>(undefined)
  const [selectedDepartureStopId, setSelectedDepartureStopId] = useState('METRO-INT-01')

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const vehicles = await transitApi.getLiveVehicles()
      setLiveVehicles(vehicles)
      if (searchFrom && searchTo) {
        const res = await transitApi.planJourney({
          from: searchFrom,
          to: searchTo,
          preference: 'fastest',
        })
        if (res) {
          setJourneyData(res)
          if (res.routes && res.routes.length > 0) setSelectedRoute(res.routes[0])
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    transitApi.getLiveVehicles().then(setLiveVehicles)
    const interval = setInterval(() => {
      transitApi.getLiveVehicles().then(setLiveVehicles)
    }, 20000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = async (params: {
    from: string
    to: string
    from_lat?: number
    from_lng?: number
    to_lat?: number
    to_lng?: number
    departure?: string
    arrive_by?: string
    preference: string
    modes: string[]
    wheelchair: boolean
  }) => {
    setIsLoading(true)
    if (params.from) setSearchFrom(params.from)
    if (params.to) setSearchTo(params.to)
    try {
      const res = await transitApi.planJourney(params)
      if (res) {
        setJourneyData(res)
        if (res.routes && res.routes.length > 0) setSelectedRoute(res.routes[0])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAiPlan = (plan: JourneyPlanResult, _queryText?: string) => {
    setJourneyData(plan)
    if (plan.routes && plan.routes.length > 0) setSelectedRoute(plan.routes[0])
    if (plan.from?.name) setSearchFrom(plan.from.name)
    if (plan.to?.name) setSearchTo(plan.to.name)
  }

  const featureToolbar = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="u-seg flex-wrap" role="tablist" aria-label="Planner features">
        {FEATURES.map(feat => {
          const Icon = feat.icon
          const isActive = activeFeature === feat.id
          return (
            <button
              key={feat.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveFeature(feat.id)}
              className={`u-seg-item flex items-center gap-2 ${isActive ? 'u-seg-item-active' : ''}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {feat.label}
              {feat.live && (
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-emerald-500'}`} aria-hidden="true" />
              )}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setShowMapModal(true)} className="u-btn u-btn-primary u-btn-sm">
          <MapIcon className="h-3.5 w-3.5" />
          Open map
        </button>
        <button
          type="button"
          onClick={() => setShowAdminMonitor(true)}
          className="u-btn u-btn-outline u-btn-sm"
          title="Live network status"
        >
          <Activity className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Network</span>
        </button>
        <button
          type="button"
          onClick={() => setShowStatusModal(true)}
          className="u-btn u-btn-outline u-btn-sm"
          title="Data feeds"
        >
          <Database className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Feeds</span>
        </button>
        <button
          type="button"
          onClick={() => setShowTraccarModal(true)}
          className="u-btn u-btn-ghost u-btn-sm"
          title="GPS telemetry configuration"
        >
          <Radio className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Telemetry</span>
        </button>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          className="u-btn u-btn-ghost u-btn-sm"
          title="Refresh live data"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </div>
  )

  return (
    <DashboardLayout>
      <PageHeader
        title="Journey Planner"
        eyebrow="Mobility · Tamil Nadu · Chengalpattu Corridor · GST Road"
        icon={Compass}
        live={{ label: `${liveVehicles.length || 26} vehicles reporting`, tone: 'emerald' }}
        subtitle="Multimodal routing across MTC buses, electric tech shuttles, Southern Railway EMU and industrial links"
      >
        {featureToolbar}
      </PageHeader>

      <div className="flex-1 overflow-auto p-4 sm:p-5">
        <div className="mx-auto w-full max-w-[1400px]">
          {/* ── PLAN ─────────────────────────────────────────────────── */}
          {activeFeature === 'plan' && (
            <div className="space-y-4 animate-fade">
              <ServiceAlertsBanner />

              <JourneySearchPanel
                onSearch={handleSearch}
                isLoading={isLoading}
                initialFrom={searchFrom}
                initialTo={searchTo}
              />

              {showMatrix && journeyData && journeyData.routes && (
                <RouteComparisonTable
                  routes={journeyData.routes}
                  selectedRouteKey={selectedRoute?.route_key || ''}
                  onSelectRoute={key => {
                    const target = journeyData.routes.find(r => r.route_key === key)
                    if (target) setSelectedRoute(target)
                  }}
                  onClose={() => setShowMatrix(false)}
                />
              )}

              {!journeyData ? (
                <section className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 sm:p-6 shadow-sm">
                  <span className="speakeasy-notch-marker -top-1 -left-1" />
                  <span className="speakeasy-notch-marker -top-1 -right-1" />
                  <span className="speakeasy-notch-marker -bottom-1 -left-1" />
                  <span className="speakeasy-notch-marker -bottom-1 -right-1" />

                  <SectionHeader
                    eyebrow="Suggested Corridors"
                    title="Popular Tamil Nadu Transit Corridors"
                    description="Pick an arterial corridor to route instantly across Southern Railway EMU, MTC electric fleet, and CMRL metro."
                    aside={
                      <button type="button" onClick={() => setShowMapModal(true)} className="px-3 py-1.5 border border-[#111111] bg-[#111111] text-white font-mono text-xs font-semibold flex items-center gap-1.5 hover:bg-black">
                        <MapIcon className="h-3.5 w-3.5 text-[#E05238]" />
                        Open Transit Map
                      </button>
                    }
                  />

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {CORRIDORS.map(item => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setSearchFrom(item.from)
                          setSearchTo(item.to)
                          handleSearch({
                            from: item.from,
                            to: item.to,
                            preference: 'fastest',
                            modes: ['METRO', 'BRTS', 'AMTS', 'RAIL', 'BUS', 'WALK'],
                            wheelchair: false,
                          })
                        }}
                        className="group flex items-center justify-between gap-4 border border-[#E5E5DF] bg-[#FFFFFF] hover:border-[#111111] hover:bg-[#FBFBFA] p-3.5 text-left transition-all"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-bold text-[#111111] font-mono">{item.label}</span>
                          <span className="mt-1 block truncate text-[11px] text-[#666662] font-mono">{item.desc}</span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-[#8C8C85] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#E05238]" />
                      </button>
                    ))}
                  </div>
                </section>
              ) : (
                <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
                  <RouteResultsList
                    routes={journeyData.routes}
                    selectedRouteKey={selectedRoute?.route_key || null}
                    onSelectRoute={r => setSelectedRoute(r)}
                    onToggleMatrix={() => setShowMatrix(!showMatrix)}
                    onOpenMap={r => {
                      if (r) setSelectedRoute(r)
                      setShowMapModal(true)
                    }}
                    onStartCompanion={r => {
                      setCompanionRoute(r)
                      setIsCompanionActive(true)
                    }}
                    delayCallout={journeyData.delay_alert_callout}
                    leaveBySummary={journeyData.leave_by_summary}
                  />

                  <div className="xl:sticky xl:top-4">
                    {selectedRoute && (
                      <JourneyTimeline
                        steps={selectedRoute.steps}
                        fareBreakdown={selectedRoute.fare_breakdown}
                        totalFare={selectedRoute.fare}
                        totalDuration={selectedRoute.duration_minutes}
                        departureTime={selectedRoute.departure_time}
                        arrivalTime={selectedRoute.arrival_time}
                        onOpenMap={() => setShowMapModal(true)}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── AI ASSISTANT ─────────────────────────────────────────── */}
          {activeFeature === 'ai' && (
            <div className="mx-auto max-w-3xl space-y-4 animate-fade">
              <SectionHeader
                eyebrow="Transit intelligence"
                title="Ask the network a question"
                description="The assistant understands corridors, landmarks, transfer windows and fares — and can route you straight from an answer."
              />

              <AiJourneyAssistantBar
                presetQuery={aiPreset}
                onJourneyPlanned={plan => {
                  handleAiPlan(plan)
                  setActiveFeature('plan')
                }}
                onUpdateSearchParams={(from, to) => {
                  setSearchFrom(from)
                  setSearchTo(to)
                }}
              />

              <div className="u-panel p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="u-overline">Example queries</p>
                    <p className="mt-1 text-[12px] text-ink-muted">Type naturally — no special syntax needed.</p>
                  </div>
                  <button type="button" onClick={() => setShowMapModal(true)} className="u-btn u-btn-outline u-btn-sm">
                    <MapIcon className="h-3.5 w-3.5" />
                    Open map
                  </button>
                </div>

                <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                  {[
                    'Fastest route from Tambaram Central to SRM Potheri before 9 AM',
                    'Cheapest transit from Kilambakkam KCBT to Chennai Central',
                    'Direct path from Guindy Metro to Mahindra World City SEZ',
                  ].map(prompt => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setAiPreset(prompt)}
                      className="rounded-xl border border-line bg-surface-2/60 px-3.5 py-3 text-left text-[12.5px] leading-relaxed text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
                    >
                      “{prompt}”
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── LIVE TRACKER ─────────────────────────────────────────── */}
          {activeFeature === 'tracker' && (
            <div className="mx-auto max-w-4xl space-y-3 animate-fade">
              <SectionHeader
                eyebrow="Live"
                title="Transit fleet tracker"
                aside={
                  <button type="button" onClick={() => setShowMapModal(true)} className="u-btn u-btn-primary u-btn-sm">
                    <MapIcon className="h-3.5 w-3.5" />
                    View on map
                  </button>
                }
              />
              <LiveVehicleTrackerCard />
            </div>
          )}

          {/* ── DEPARTURES ───────────────────────────────────────────── */}
          {activeFeature === 'departures' && (
            <div className="mx-auto max-w-4xl space-y-3 animate-fade">
              <SectionHeader
                eyebrow="Live"
                title="Platform departure board"
                aside={
                  <button type="button" onClick={() => setShowMapModal(true)} className="u-btn u-btn-primary u-btn-sm">
                    <MapIcon className="h-3.5 w-3.5" />
                    View station
                  </button>
                }
              />
              <DepartureBoard initialStopId={selectedDepartureStopId} />
            </div>
          )}

          {/* ── NEARBY ───────────────────────────────────────────────── */}
          {activeFeature === 'nearby' && (
            <div className="mx-auto max-w-4xl space-y-3 animate-fade">
              <SectionHeader
                eyebrow="Live"
                title="Stops and hubs near you"
                aside={
                  <button type="button" onClick={() => setShowMapModal(true)} className="u-btn u-btn-primary u-btn-sm">
                    <MapIcon className="h-3.5 w-3.5" />
                    View on map
                  </button>
                }
              />
              <NearbyTransportFinder
                onSelectStopDepartures={stopId => {
                  setSelectedDepartureStopId(stopId)
                  setActiveFeature('departures')
                }}
                onSelectOriginStop={name => {
                  handleSearch({
                    from: name,
                    to: journeyData?.to?.name || 'Tambaram Central Railway Station',
                    preference: 'fastest',
                    modes: ['METRO', 'BRTS', 'AMTS', 'RAIL', 'BUS', 'WALK'],
                    wheelchair: false,
                  })
                  setActiveFeature('plan')
                }}
              />
            </div>
          )}
        </div>
      </div>

      <TransitMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        route={selectedRoute}
        liveVehicles={liveVehicles}
        onSelectVehicle={() => {
          setShowMapModal(false)
          setActiveFeature('tracker')
        }}
      />

      <DataSourceStatusModal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} />

      {isCompanionActive && (companionRoute || selectedRoute) && (
        <JourneyProgressTracker
          route={companionRoute || selectedRoute!}
          onClose={() => setIsCompanionActive(false)}
          onFocusStepOnMap={() => setShowMapModal(true)}
        />
      )}

      <AdminNetworkMonitorModal isOpen={showAdminMonitor} onClose={() => setShowAdminMonitor(false)} />

      <TraccarGpsModal isOpen={showTraccarModal} onClose={() => setShowTraccarModal(false)} />
    </DashboardLayout>
  )
}
