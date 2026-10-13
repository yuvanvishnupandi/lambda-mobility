import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  MapPin,
  Navigation,
  ArrowUpDown,
  Zap,
  Accessibility,
  X,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Train,
  Bus,
  Search
} from 'lucide-react'
import { TAMIL_NADU_LANDMARKS, TamilNaduLocationItem } from '../../data/tamilNaduLandmarks'

interface JourneySearchPanelProps {
  onSearch: (params: {
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
  }) => void
  isLoading?: boolean
  initialFrom?: string
  initialTo?: string
}

export interface PopularLocationItem {
  name: string
  fullName: string
  city: 'Chengalpattu GST' | 'Chennai Metro & Rail' | 'OMR IT Corridor' | 'Coimbatore & Regional'
  category: string
  lat: number
  lng: number
  keywords?: string[]
}

export const POPULAR_LANDMARKS: PopularLocationItem[] = TAMIL_NADU_LANDMARKS.map(item => ({
  name: item.name,
  fullName: item.fullName,
  city: item.city,
  category: item.category,
  lat: item.lat,
  lng: item.lng,
  keywords: item.keywords
}))

export const JourneySearchPanel: React.FC<JourneySearchPanelProps> = ({
  onSearch,
  isLoading = false,
  initialFrom = '',
  initialTo = ''
}) => {
  const [fromLocation, setFromLocation] = useState(initialFrom || '')
  const [toLocation, setToLocation] = useState(initialTo || '')
  const [fromCoords, setFromCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [toCoords, setToCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [cityTab, setCityTab] = useState<'ALL' | 'Chengalpattu GST' | 'Chennai Metro & Rail' | 'OMR IT Corridor' | 'Coimbatore & Regional'>('ALL')

  useEffect(() => {
    if (initialFrom) setFromLocation(initialFrom)
  }, [initialFrom])

  useEffect(() => {
    if (initialTo) setToLocation(initialTo)
  }, [initialTo])

  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)

  const [timeMode, setTimeMode] = useState<'NOW' | 'DEPART_AT' | 'ARRIVE_BY'>('NOW')
  const [selectedTime, setSelectedTime] = useState('17:30')
  const [preference, setPreference] = useState<'fastest' | 'cheapest' | 'least_walking' | 'fewest_transfers' | 'most_reliable' | 'min_wait'>('fastest')
  
  const [selectedModes, setSelectedModes] = useState<string[]>([
    'METRO',
    'RAIL',
    'BUS',
    'WALK',
    'MTC_ELECTRIC_BUS',
    'TNSTC_EXPRESS'
  ])
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const fromRef = useRef<HTMLDivElement>(null)
  const toRef = useRef<HTMLDivElement>(null)

  // Handle outside click for suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
        setShowFromDropdown(false)
      }
      if (toRef.current && !toRef.current.contains(event.target as Node)) {
        setShowToDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Google-Style multi-keyword autocomplete filtering across 115+ Tamil Nadu places
  const filterPlaces = (query: string): TamilNaduLocationItem[] => {
    const q = (query || '').trim().toLowerCase()
    if (!q) {
      // Return top prominent Tamil Nadu hubs when query is empty
      return TAMIL_NADU_LANDMARKS.filter(item => item.is_popular).slice(0, 8)
    }

    const tokens = q.split(/\s+/).filter(Boolean)
    return TAMIL_NADU_LANDMARKS.filter(item => {
      const searchBlob = `${item.name} ${item.fullName} ${item.category} ${item.city} ${(item.keywords || []).join(' ')}`.toLowerCase()
      return tokens.every(token => searchBlob.includes(token))
    }).slice(0, 9)
  }

  const fromFiltered = useMemo(() => filterPlaces(fromLocation), [fromLocation])
  const toFiltered = useMemo(() => filterPlaces(toLocation), [toLocation])

  const handleSwap = () => {
    const tempName = fromLocation
    const tempCoords = fromCoords
    setFromLocation(toLocation)
    setFromCoords(toCoords)
    setToLocation(tempName)
    setToCoords(tempCoords)
  }

  const handleUseCurrentLocation = (forceRefresh = false) => {
    if (!navigator.geolocation) {
      setValidationError('Geolocation is not supported by your browser.')
      return
    }

    setIsLocating(true)
    setValidationError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude

        setFromLocation('Current Location · GST Corridor (GPS)')
        setFromCoords({ lat, lng })
        setIsLocating(false)
      },
      (err) => {
        setIsLocating(false)
        console.warn('Geolocation error:', err.message)
        // Fallback to Potheri Central Interchange (GST Road)
        setFromLocation('Potheri Central Interchange (GST Road)')
        setFromCoords({ lat: 12.8231, lng: 80.0444 })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: forceRefresh ? 0 : 5000,
      }
    )
  }

  const handleModeToggle = (mode: string) => {
    if (selectedModes.includes(mode)) {
      if (selectedModes.length > 1) {
        setSelectedModes(selectedModes.filter((m) => m !== mode))
      }
    } else {
      setSelectedModes([...selectedModes, mode])
    }
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setValidationError(null)
    const trimmedFrom = fromLocation.trim()
    const trimmedTo = toLocation.trim()

    if (!trimmedFrom && !trimmedTo) {
      setValidationError('Please select or enter both Origin (From) and Destination (To) in Tamil Nadu.')
      return
    }
    if (!trimmedFrom) {
      setValidationError('Please select or enter an Origin (From) station or corridor.')
      return
    }
    if (!trimmedTo) {
      setValidationError('Please select or enter a Destination (To) location.')
      return
    }

    onSearch({
      from: trimmedFrom,
      to: trimmedTo,
      from_lat: fromCoords?.lat,
      from_lng: fromCoords?.lng,
      to_lat: toCoords?.lat,
      to_lng: toCoords?.lng,
      departure: timeMode === 'NOW' ? 'now' : timeMode === 'DEPART_AT' ? selectedTime : undefined,
      arrive_by: timeMode === 'ARRIVE_BY' ? selectedTime : undefined,
      preference,
      modes: selectedModes,
      wheelchair: wheelchairAccessible,
    })
  }

  const getCityBadgeColor = (city: string) => {
    switch (city) {
      case 'Chengalpattu GST':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200'
      case 'Chennai Metro & Rail':
        return 'bg-blue-50 text-blue-800 border-blue-200'
      case 'OMR IT Corridor':
        return 'bg-purple-50 text-purple-800 border-purple-200'
      case 'Coimbatore & Regional':
        return 'bg-amber-50 text-amber-800 border-amber-200'
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200'
    }
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'SUBURBAN_RAIL':
      case 'METRO_STATION':
        return <Train className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
      case 'BUS_TERMINUS':
        return <Bus className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
      case 'TECH_PARK':
        return <Zap className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
      default:
        return <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
    }
  }

  return (
    <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-4 sm:p-5 shadow-sm">
      {/* 4 Speakeasy Corner Notch Markers */}
      <span className="speakeasy-notch-marker -top-1 -left-1" aria-hidden="true" />
      <span className="speakeasy-notch-marker -top-1 -right-1" aria-hidden="true" />
      <span className="speakeasy-notch-marker -bottom-1 -left-1" aria-hidden="true" />
      <span className="speakeasy-notch-marker -bottom-1 -right-1" aria-hidden="true" />

      {/* Header Banner */}
      <div className="flex items-center justify-between gap-3 border-b border-[#E5E5DF] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center border border-[#E5E5DF] bg-[#FBFBFA] text-[#E05238]">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-[#111111]">
              <span>Multimodal Journey Pathfinder</span>
              <span className="px-1.5 py-0.2 bg-[#F4F4F0] border border-[#D5D5CF] text-[10px] font-mono text-[#666662] uppercase">
                115+ TN Hubs
              </span>
            </h2>
            <p className="text-xs text-[#666662] font-mono">
              Southern Railway EMU · MTC Electric Buses · CMRL Metro · Industrial Corridors
            </p>
          </div>
        </div>

        {/* Controls: Wheelchair & Filter Toggle */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setWheelchairAccessible(!wheelchairAccessible)}
            title="Wheelchair accessible transit links only"
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono font-semibold border transition-all ${
              wheelchairAccessible
                ? 'border-[#111111] bg-[#111111] text-white'
                : 'border-[#D5D5CF] bg-[#FFFFFF] text-[#666662] hover:text-[#111111]'
            }`}
          >
            <Accessibility className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Accessible</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono font-semibold border transition-all ${
              showAdvancedFilters
                ? 'border-[#111111] bg-[#FBFBFA] text-[#111111]'
                : 'border-[#D5D5CF] bg-[#FFFFFF] text-[#666662] hover:text-[#111111]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E05238]" />
            <span>Options</span>
            {showAdvancedFilters ? (
              <ChevronUp className="w-3 h-3 ml-0.5" />
            ) : (
              <ChevronDown className="w-3 h-3 ml-0.5 text-[#8C8C85]" />
            )}
          </button>
        </div>
      </div>

      {validationError && (
        <div className="mt-3 flex items-center gap-2 border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-mono text-amber-800">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-3.5 space-y-3">
        {/* Origin & Destination Inputs with Swap */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2.5 items-center">
          {/* FROM Input */}
          <div ref={fromRef} className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#E05238]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E05238]" />
                From · Origin
              </span>
              <button
                type="button"
                onClick={() => handleUseCurrentLocation(true)}
                disabled={isLocating}
                className="flex items-center gap-1 text-[11px] font-mono text-[#E05238] hover:underline disabled:opacity-50"
                title="Use GPS Coordinates"
              >
                {isLocating ? (
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                ) : (
                  <Navigation className="w-2.5 h-2.5" />
                )}
                <span>{isLocating ? 'Locating...' : 'My Location'}</span>
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C8C85]">
                <MapPin className="w-4 h-4 text-[#E05238]" />
              </div>
              <input
                type="text"
                value={fromLocation}
                onChange={(e) => {
                  setFromLocation(e.target.value)
                  setShowFromDropdown(true)
                }}
                onFocus={() => setShowFromDropdown(true)}
                placeholder="Search Tamil Nadu: Potheri, Tambaram, Kilambakkam, Central..."
                className="w-full border border-[#D5D5CF] bg-[#FFFFFF] py-2 pl-9 pr-8 text-xs font-sans text-[#111111] placeholder:text-[#8C8C85] focus:outline-none focus:border-[#111111] transition-all"
              />
              {fromLocation && (
                <button
                  type="button"
                  onClick={() => {
                    setFromLocation('')
                    setFromCoords(null)
                  }}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#8C8C85] hover:text-[#111111]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Google-Style Dropdown for FROM */}
            {showFromDropdown && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto border border-[#D5D5CF] bg-[#FFFFFF] shadow-lg">
                <div className="px-3 py-1.5 border-b border-[#E5E5DF] bg-[#FBFBFA] flex items-center justify-between text-[10px] font-mono text-[#666662]">
                  <span className="flex items-center gap-1">
                    <Search className="w-3 h-3 text-[#E05238]" />
                    {fromLocation.trim() ? `Matching "${fromLocation}"` : 'Recommended Transit Hubs'}
                  </span>
                  <span>{fromFiltered.length} places</span>
                </div>

                {fromFiltered.length === 0 ? (
                  <div className="p-4 text-center text-xs font-mono text-[#8C8C85]">
                    No Tamil Nadu transit stop matching "{fromLocation}".
                  </div>
                ) : (
                  fromFiltered.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setFromLocation(item.fullName)
                        setFromCoords({ lat: item.lat, lng: item.lng })
                        setShowFromDropdown(false)
                      }}
                      className="w-full flex items-center justify-between gap-2 p-2.5 text-left border-b border-[#F4F4F0] hover:bg-[#FBFBFA] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {getItemIcon(item.type)}
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[#111111] truncate">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-[#666662] truncate">
                            {item.fullName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`px-1.5 py-0.5 text-[9px] font-mono font-semibold border ${getCityBadgeColor(item.city)}`}>
                          {item.city}
                        </span>
                        <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[#F4F4F0] text-[#666662] border border-[#E5E5DF]">
                          {item.category}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* SWAP BUTTON */}
          <div className="flex justify-center md:pt-4">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2 border border-[#D5D5CF] bg-[#FBFBFA] hover:bg-[#111111] hover:text-white text-[#111111] transition-all"
              title="Swap Origin and Destination"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* TO Input */}
          <div ref={toRef} className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#2F7C4E]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2F7C4E]" />
                To · Destination
              </span>
              <span className="text-[10px] font-mono text-[#8C8C85]">Tamil Nadu Network</span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C8C85]">
                <MapPin className="w-4 h-4 text-[#2F7C4E]" />
              </div>
              <input
                type="text"
                value={toLocation}
                onChange={(e) => {
                  setToLocation(e.target.value)
                  setShowToDropdown(true)
                }}
                onFocus={() => setShowToDropdown(true)}
                placeholder="Search Tamil Nadu: MWC, OMR Siruseri, Airport, CBE..."
                className="w-full border border-[#D5D5CF] bg-[#FFFFFF] py-2 pl-9 pr-8 text-xs font-sans text-[#111111] placeholder:text-[#8C8C85] focus:outline-none focus:border-[#111111] transition-all"
              />
              {toLocation && (
                <button
                  type="button"
                  onClick={() => {
                    setToLocation('')
                    setToCoords(null)
                  }}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#8C8C85] hover:text-[#111111]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Google-Style Dropdown for TO */}
            {showToDropdown && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto border border-[#D5D5CF] bg-[#FFFFFF] shadow-lg">
                <div className="px-3 py-1.5 border-b border-[#E5E5DF] bg-[#FBFBFA] flex items-center justify-between text-[10px] font-mono text-[#666662]">
                  <span className="flex items-center gap-1">
                    <Search className="w-3 h-3 text-[#2F7C4E]" />
                    {toLocation.trim() ? `Matching "${toLocation}"` : 'Recommended Destinations'}
                  </span>
                  <span>{toFiltered.length} places</span>
                </div>

                {toFiltered.length === 0 ? (
                  <div className="p-4 text-center text-xs font-mono text-[#8C8C85]">
                    No Tamil Nadu transit stop matching "{toLocation}".
                  </div>
                ) : (
                  toFiltered.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setToLocation(item.fullName)
                        setToCoords({ lat: item.lat, lng: item.lng })
                        setShowToDropdown(false)
                      }}
                      className="w-full flex items-center justify-between gap-2 p-2.5 text-left border-b border-[#F4F4F0] hover:bg-[#FBFBFA] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {getItemIcon(item.type)}
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[#111111] truncate">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-[#666662] truncate">
                            {item.fullName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`px-1.5 py-0.5 text-[9px] font-mono font-semibold border ${getCityBadgeColor(item.city)}`}>
                          {item.city}
                        </span>
                        <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[#F4F4F0] text-[#666662] border border-[#E5E5DF]">
                          {item.category}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Regional Hubs Selector */}
        <div className="pt-2 border-t border-[#E5E5DF] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#666662] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#E05238]" />
              Corridor Hubs:
            </span>
            <div className="flex items-center gap-1">
              {(['ALL', 'Chengalpattu GST', 'Chennai Metro & Rail', 'OMR IT Corridor', 'Coimbatore & Regional'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setCityTab(tab)}
                  className={`px-2 py-0.5 text-[10px] font-mono border transition-all ${
                    cityTab === tab
                      ? 'border-[#111111] bg-[#111111] text-white font-bold'
                      : 'border-[#D5D5CF] bg-[#FFFFFF] text-[#666662] hover:text-[#111111]'
                  }`}
                >
                  {tab === 'ALL' ? 'All (115+)' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Hub Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {TAMIL_NADU_LANDMARKS
              .filter(lm => cityTab === 'ALL' || lm.city === cityTab)
              .slice(0, 16)
              .map(lm => (
                <button
                  key={lm.id}
                  type="button"
                  onClick={() => {
                    if (!fromLocation) {
                      setFromLocation(lm.fullName)
                      setFromCoords({ lat: lm.lat, lng: lm.lng })
                    } else {
                      setToLocation(lm.fullName)
                      setToCoords({ lat: lm.lat, lng: lm.lng })
                    }
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-sans border border-[#D5D5CF] bg-[#FFFFFF] hover:border-[#111111] text-[#111111] whitespace-nowrap transition-all flex-shrink-0"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E05238]" />
                  <span>{lm.name}</span>
                </button>
              ))}
          </div>
        </div>

        {/* Collapsible Advanced Preferences & Schedule */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-[#E5E5DF] space-y-3 animate-fade">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Schedule Mode */}
              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#666662] block mb-1">
                  Departure Schedule
                </label>
                <div className="flex items-center gap-1 border border-[#D5D5CF] bg-[#FBFBFA] p-0.5">
                  <button
                    type="button"
                    onClick={() => setTimeMode('NOW')}
                    className={`flex-1 py-1 text-xs font-mono font-semibold transition-all ${
                      timeMode === 'NOW' ? 'bg-[#FFFFFF] text-[#111111] shadow-sm' : 'text-[#666662]'
                    }`}
                  >
                    Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeMode('DEPART_AT')}
                    className={`flex-1 py-1 text-xs font-mono font-semibold transition-all ${
                      timeMode === 'DEPART_AT' ? 'bg-[#FFFFFF] text-[#111111] shadow-sm' : 'text-[#666662]'
                    }`}
                  >
                    Depart at
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeMode('ARRIVE_BY')}
                    className={`flex-1 py-1 text-xs font-mono font-semibold transition-all ${
                      timeMode === 'ARRIVE_BY' ? 'bg-[#FFFFFF] text-[#111111] shadow-sm' : 'text-[#666662]'
                    }`}
                  >
                    Arrive by
                  </button>
                </div>
                {timeMode !== 'NOW' && (
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="mt-1.5 w-full border border-[#D5D5CF] bg-[#FFFFFF] py-1 px-2 text-xs font-mono text-[#111111]"
                  />
                )}
              </div>

              {/* Time Picker or Preference */}
              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#666662] block mb-1">
                  Routing Algorithm Preference
                </label>
                <select
                  value={preference}
                  onChange={(e) => setPreference(e.target.value as any)}
                  className="w-full border border-[#D5D5CF] bg-[#FFFFFF] py-1.5 px-2 text-xs font-mono text-[#111111] focus:outline-none"
                >
                  <option value="fastest">Fastest Travel Time</option>
                  <option value="cheapest">Lowest Fare / Cost</option>
                  <option value="least_walking">Minimum Walking</option>
                  <option value="fewest_transfers">Direct / Fewest Transfers</option>
                  <option value="most_reliable">Maximum On-Time Reliability</option>
                  <option value="min_wait">Minimum Waiting At Stations</option>
                </select>
              </div>
            </div>

            {/* Allowed Modes */}
            <div>
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#666662] block mb-1">
                Active Transit Modes
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'RAIL', label: 'Southern Suburban EMU 🚆' },
                  { id: 'METRO', label: 'Chennai CMRL Metro 🚇' },
                  { id: 'BUS', label: 'MTC Express & City Bus 🚌' },
                  { id: 'MTC_ELECTRIC_BUS', label: 'MTC / MWC Electric Shuttle ⚡' },
                  { id: 'WALK', label: 'Pedestrian Link 🚶' }
                ].map(m => {
                  const active = selectedModes.includes(m.id)
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleModeToggle(m.id)}
                      className={`px-2.5 py-1 text-xs font-mono border transition-all ${
                        active
                          ? 'border-[#111111] bg-[#111111] text-white'
                          : 'border-[#D5D5CF] bg-[#FFFFFF] text-[#666662]'
                      }`}
                    >
                      {m.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[#111111] hover:bg-black text-white font-mono font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Computing Multimodal Routes across Tamil Nadu...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-[#E05238]" />
                <span>Find Optimal Transit Routes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default JourneySearchPanel
