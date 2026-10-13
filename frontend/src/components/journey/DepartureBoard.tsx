import React, { useState, useEffect } from 'react'
import {
  Clock,
  Train,
  Bus,
  RefreshCw,
  MapPin,
  Search
} from 'lucide-react'
import { StopDeparturesData, TransportMode } from '../../types/transit'
import { transitApi, ALL_TRANSIT_STOPS } from '../../services/transitApi'

interface DepartureBoardProps {
  initialStopId?: string
}

const POPULAR_STOPS = [
  // Chengalpattu GST Road Corridor
  { id: 'TN-01', name: 'SRM University Main Campus / Potheri', shortName: 'Potheri SRM', mode: 'BUS' as TransportMode, city: 'Chengalpattu' },
  { id: 'TN-03', name: 'Kilambakkam Kalaignar Centenary Bus Terminus (KCBT)', shortName: 'Kilambakkam KCBT', mode: 'BUS' as TransportMode, city: 'Chengalpattu' },
  { id: 'TN-04', name: 'Tambaram Central Railway Station & Bus Stand', shortName: 'Tambaram Central', mode: 'RAIL' as TransportMode, city: 'Chennai' },
  { id: 'TN-05', name: 'Mahindra World City (MWC) Paranur', shortName: 'Paranur MWC', mode: 'RAIL' as TransportMode, city: 'Chengalpattu' },
  { id: 'TN-07', name: 'Guduvanchery Bus Stand & Railway Station', shortName: 'Guduvanchery', mode: 'BUS' as TransportMode, city: 'Chengalpattu' },
  { id: 'TN-08', name: 'Maraimalai Nagar Industrial Hub', shortName: 'Maraimalai Nagar', mode: 'BUS' as TransportMode, city: 'Chengalpattu' },
  { id: 'TN-02', name: 'Chengalpattu Junction Railway Station', shortName: 'Chengalpattu Jn', mode: 'RAIL' as TransportMode, city: 'Chengalpattu' },
  { id: 'TN-06', name: 'Vandalur Crescent & Zoological Park Hub', shortName: 'Vandalur Crescent', mode: 'BUS' as TransportMode, city: 'Chengalpattu' },

  // Chennai Metro & Rail
  { id: 'TN-13', name: 'Chennai Central (Puratchi Thalaivar Dr. MGR)', shortName: 'Chennai Central', mode: 'RAIL' as TransportMode, city: 'Chennai' },
  { id: 'TN-14', name: 'Chennai Egmore Railway Station & Metro', shortName: 'Chennai Egmore', mode: 'METRO' as TransportMode, city: 'Chennai' },
  { id: 'TN-15', name: 'Guindy Metro Station & Suburban Interchange', shortName: 'Guindy Metro', mode: 'METRO' as TransportMode, city: 'Chennai' },
  { id: 'TN-16', name: 'Chennai International Airport (Meenambakkam)', shortName: 'Chennai Airport', mode: 'METRO' as TransportMode, city: 'Chennai' },
  { id: 'TN-18', name: 'CMBT Koyambedu Metro & Bus Terminal', shortName: 'CMBT Koyambedu', mode: 'METRO' as TransportMode, city: 'Chennai' },

  // OMR IT Expressway & Coimbatore
  { id: 'TN-20', name: 'Tidel Park Taramani Metro / MRTS', shortName: 'Tidel Park OMR', mode: 'METRO' as TransportMode, city: 'Chennai' },
  { id: 'TN-24', name: 'Siruseri SIPCOT IT Park Terminal', shortName: 'Siruseri SIPCOT', mode: 'BUS' as TransportMode, city: 'Chennai' },
  { id: 'TN-31', name: 'Coimbatore Gandhipuram Central Bus Stand', shortName: 'Coimbatore Gandhipuram', mode: 'BUS' as TransportMode, city: 'Coimbatore' },
]

export const DepartureBoard: React.FC<DepartureBoardProps> = ({
  initialStopId = 'TN-01'
}) => {
  const [selectedStopId, setSelectedStopId] = useState(initialStopId)
  const [selectedModeFilter, setSelectedModeFilter] = useState<string | undefined>(undefined)
  const [boardData, setBoardData] = useState<StopDeparturesData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)

  const fetchDepartures = async (stopId: string) => {
    setIsLoading(true)
    try {
      const data = await transitApi.getDepartures(stopId, 8)
      if (data) {
        setBoardData(data)
        setLastUpdated(new Date())
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartures(selectedStopId)
    // Auto-refresh every 20 seconds
    const interval = setInterval(() => {
      fetchDepartures(selectedStopId)
    }, 20000)
    return () => clearInterval(interval)
  }, [selectedStopId])

  const filteredPopularStops = selectedModeFilter
    ? POPULAR_STOPS.filter((st) => st.mode === selectedModeFilter)
    : POPULAR_STOPS

  const searchedStops = searchQuery.trim()
    ? ALL_TRANSIT_STOPS.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.name_gu && s.name_gu.includes(searchQuery))
      ).slice(0, 8)
    : []

  return (
    <div className="u-panel space-y-4 p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-iris-600 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              Live Station Departures
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Real-time platform countdowns & timetables
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-slate-400">
            Updated {Math.max(1, Math.round((new Date().getTime() - lastUpdated.getTime()) / 1000))}s ago
          </span>
          <button
            type="button"
            onClick={() => fetchDepartures(selectedStopId)}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Refresh departures"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mode Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-xs">
          {[
            { id: undefined, label: 'All Modes' },
            { id: 'METRO', label: 'Metro' },
            { id: 'BRTS', label: 'BRTS' },
            { id: 'AMTS', label: 'AMTS' },
          ].map((item) => {
            const isSelected = selectedModeFilter === item.id
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setSelectedModeFilter(item.id)}
                className={`px-3 py-1 rounded-lg font-semibold border transition-all text-[11px] ${
                  isSelected
                    ? 'border-line-strong bg-surface-4 text-ink shadow-e1'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        {/* Quick Search Input */}
        <div className="relative">
          <div className="flex w-48 items-center rounded-xl border border-line bg-surface-1/70 px-2.5 py-1 text-[12.5px] transition-all focus-within:w-64 focus-within:border-brand-400/70">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
            <input
              type="text"
              placeholder="Search station..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSearchDropdown(true)
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="bg-transparent border-none outline-none text-xs w-full text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showSearchDropdown && searchedStops.length > 0 && (
            <div className="u-glass u-scroll absolute right-0 top-full z-30 mt-1.5 max-h-48 w-64 overflow-y-auto py-1">
              {searchedStops.map((st) => (
                <button
                  key={st.stop_id}
                  type="button"
                  onClick={() => {
                    setSelectedStopId(st.stop_id)
                    setSearchQuery('')
                    setShowSearchDropdown(false)
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-xs flex items-center justify-between border-b border-slate-100 last:border-none"
                >
                  <div className="truncate pr-2">
                    <span className="font-bold text-slate-800 block truncate">{st.name}</span>
                    <span className="text-[10px] text-slate-400">{st.stop_id}</span>
                  </div>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase">
                    {st.mode}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Station Selector Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {filteredPopularStops.map((st) => {
          const isSelected = selectedStopId === st.id
          const isCgl = st.city === 'Chengalpattu'
          const isCbe = st.city === 'Coimbatore'
          const dotColor = isSelected ? 'bg-white' : isCgl ? 'bg-teal-500' : isCbe ? 'bg-amber-500' : 'bg-blue-500'

          return (
            <button
              key={st.id}
              type="button"
              onClick={() => setSelectedStopId(st.id)}
              aria-pressed={isSelected}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                isSelected
                  ? 'border-brand-200/70 bg-brand-50 text-brand-600'
                  : 'border-line bg-surface-3/60 text-ink-secondary hover:border-line-strong hover:bg-surface-4/70'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`}></span>
              {st.mode === 'METRO' ? <Train className="w-3 h-3" /> : <Bus className="w-3 h-3" />}
              <span>{st.shortName}</span>
            </button>
          )
        })}
      </div>

      {/* Selected Station Title */}
      {boardData?.stop && (
        <div className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-900 block text-xs">{boardData.stop.name}</strong>
              <span className="text-[11px] text-slate-500 font-medium">
                {boardData.stop.platform_info || `${boardData.stop.mode} Platform`}
              </span>
            </div>
          </div>
          {boardData.stop.is_interchange && (
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 tracking-wide">
              INTERCHANGE HUB
            </span>
          )}
        </div>
      )}

      {/* Departures Table / List */}
      <div className="space-y-2">
        {isLoading && !boardData ? (
          <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Fetching live station departures & timetable...</span>
          </div>
        ) : boardData?.departures && boardData.departures.length > 0 ? (
          boardData.departures.map((dep, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-2xs shrink-0"
                  style={{ backgroundColor: dep.color || '#2563EB' }}
                >
                  {dep.mode === 'METRO' ? <Train className="w-4 h-4" /> : <Bus className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900">{dep.route_number}</span>
                    <span className="text-xs text-slate-700 font-medium">→ {dep.destination}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Scheduled at {dep.departure_time}
                  </div>
                </div>
              </div>

              {/* Countdown and Live Tag */}
              <div className="text-right">
                <div className="text-base font-black text-slate-900 flex items-center justify-end gap-1">
                  <span>{dep.eta_minutes}</span>
                  <span className="text-xs font-semibold text-slate-500">min</span>
                </div>
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider inline-block mt-0.5 ${
                    dep.status === 'LIVE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {dep.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No immediate departures found. Refreshing timetable...
          </div>
        )}
      </div>
    </div>
  )
}
