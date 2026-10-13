import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  ArrowRight,
  Loader2,
  Mic,
  Compass,
  Clock,
  IndianRupee,
  Shuffle,
  ShieldCheck,
  X,
  Radio,
  MapPin,
  Check
} from 'lucide-react'
import { transitApi } from '../../services/transitApi'
import { JourneyPlanResult, AiJourneyResponse } from '../../types/transit'

interface AiJourneyAssistantBarProps {
  onJourneyPlanned: (plan: JourneyPlanResult, queryText: string) => void
  onUpdateSearchParams?: (from: string, to: string) => void
  /** query pushed in from the example-query chips on the planner page */
  presetQuery?: string
}

const SAMPLE_QUERIES = [
  'Tambaram to Chennai Airport',
  'Potheri SRM to Kilambakkam KCBT before 9 AM',
  'Guindy Metro to Siruseri SIPCOT (Cheapest)'
]

export const AiJourneyAssistantBar: React.FC<AiJourneyAssistantBarProps> = ({
  onJourneyPlanned,
  onUpdateSearchParams,
  presetQuery
}) => {
  const [query, setQuery] = useState('')

  // Example chips on the planner page hand their text over here
  useEffect(() => {
    if (presetQuery) setQuery(presetQuery)
  }, [presetQuery])
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [aiData, setAiData] = useState<AiJourneyResponse | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isApplied, setIsApplied] = useState(false)

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSpeechSupported(true)
    }
  }, [])

  const startVoiceInput = () => {
    if (!speechSupported) return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-IN'
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => setIsListening(true)
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setQuery(transcript)
        setIsListening(false)
        handleSubmit(transcript)
      }
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
      recognition.start()
    } catch (err) {
      console.warn('Speech recognition error:', err)
      setIsListening(false)
    }
  }

  const handleSubmit = async (textToSubmit?: string) => {
    const q = textToSubmit || query
    if (!q.trim()) return

    setLoading(true)
    setIsOpen(true)
    setIsApplied(false)
    try {
      const res: AiJourneyResponse = await transitApi.askAiAssistant(q)
      if (res) {
        setAiData(res)

        if (res.journey_plan && res.journey_plan.routes && res.journey_plan.routes.length > 0) {
          onJourneyPlanned(res.journey_plan, q)
        }

        if (onUpdateSearchParams && res.parsed_intent) {
          onUpdateSearchParams(res.parsed_intent.from_location, res.parsed_intent.to_location)
        }
      }
    } catch (err) {
      console.error('AI assistant error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyRoute = () => {
    if (aiData?.journey_plan && aiData.journey_plan.routes?.length > 0) {
      onJourneyPlanned(aiData.journey_plan, query)
      if (onUpdateSearchParams && aiData.parsed_intent) {
        onUpdateSearchParams(aiData.parsed_intent.from_location, aiData.parsed_intent.to_location)
      }
      setIsApplied(true)
    }
  }

  const card = aiData?.structured_card
  const bestRoute = aiData?.journey_plan?.routes?.[0]

  return (
    <div className="u-panel w-full p-4 transition-all">
      {/* Top Header */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface-3 text-iris-500">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
              Lambda AI
              <span className="u-chip u-chip-iris">Transit AI</span>
            </h3>
            <p className="mt-0.5 text-[11px] text-ink-muted">
              Answers are grounded in the live transit network
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-1.5 sm:flex">
          <span className="u-chip u-chip-mint">
            <Radio className="h-2.5 w-2.5 animate-pulse" />
            Live network data
          </span>
        </div>
      </div>

      {/* Query Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Compass className="w-4 h-4 text-indigo-600" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything (e.g., 'Fastest way from Tambaram to Airport' or 'Reach Kilambakkam before 9 AM')"
            className="u-input py-2.5 pl-10 pr-10 text-[12.5px]"
          />

          {speechSupported && (
            <button
              type="button"
              onClick={startVoiceInput}
              title="Voice Input"
              className={`absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer ${
                isListening ? 'text-rose-500 animate-pulse' : 'text-slate-400 hover:text-indigo-600'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-xs flex-shrink-0 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Ask AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
        <span className="text-[11px] text-slate-500 font-medium">Try asking:</span>
        {SAMPLE_QUERIES.map((sq, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setQuery(sq)
              handleSubmit(sq)
            }}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200/80 hover:border-indigo-300 transition truncate cursor-pointer font-medium"
          >
            "{sq}"
          </button>
        ))}
      </div>

      {/* Clean, Non-Congested AI Response Card */}
      {isOpen && card && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 animate-fadeIn">
          <div className="bg-slate-50/90 border border-indigo-100 rounded-xl p-4 space-y-3">
            {/* Header with Title & Dismiss */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                  AI RECOMMENDATION
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {card.structured_title}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Concise Stats Row (Travel Time, Fare, Transfers, Punctuality) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="rounded-xl border border-line bg-surface-2/60 p-2.5">
                <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3 text-indigo-600" /> Travel Time
                </div>
                <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {card.travel_time_mins} min
                </div>
                {card.departure_time && card.arrival_time && (
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {card.departure_time} → {card.arrival_time}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-line bg-surface-2/60 p-2.5">
                <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                  <IndianRupee className="w-3 h-3 text-emerald-600" /> Total Fare
                </div>
                <div className="font-extrabold text-emerald-700 text-sm mt-0.5">
                  ₹{card.fare}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  Save {card.taxi_comparison?.savings_pct || 90}% vs cab
                </div>
              </div>

              <div className="rounded-xl border border-line bg-surface-2/60 p-2.5">
                <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                  <Shuffle className="w-3 h-3 text-iris-600" /> Transfers
                </div>
                <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {card.transfers_count === 0 ? 'Direct (0)' : `${card.transfers_count} transfer`}
                </div>
                <div className="text-[10px] text-blue-700 font-medium mt-0.5 truncate">
                  {card.modes.join(' + ') || 'Transit'}
                </div>
              </div>

              <div className="rounded-xl border border-line bg-surface-2/60 p-2.5">
                <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3 h-3 text-purple-600" /> Reliability
                </div>
                <div className="font-extrabold text-purple-700 text-sm mt-0.5">
                  {card.reliability_pct}% Punctual
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {card.co2_saved_kg} kg CO₂ saved
                </div>
              </div>
            </div>

            {/* Simple Transit Leg Breakdown */}
            {bestRoute && bestRoute.steps && (
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] pt-1">
                <span className="text-slate-500 font-medium">Route:</span>
                {bestRoute.steps.map((s, si) => (
                  <span
                    key={si}
                    className={`px-2 py-0.5 rounded ${
                      s.step_type === 'WALK'
                        ? 'bg-slate-200 text-slate-700 font-medium'
                        : s.step_type === 'TRANSFER'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200 font-bold'
                        : 'bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold'
                    }`}
                  >
                    {s.step_type === 'WALK'
                      ? `Walk (${s.duration_mins}m)`
                      : s.step_type === 'TRANSFER'
                      ? `Transfer (${s.duration_mins}m)`
                      : `${s.route_number || s.mode} (${s.duration_mins}m)`}
                  </span>
                ))}
              </div>
            )}

            {/* One Simple Advisory Line */}
            {aiData?.parsed_intent?.arrive_by && (
              <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg font-medium">
                ⏰ <strong>Target Arrival:</strong> Arrive before {aiData.parsed_intent.arrive_by} with safety buffer.
              </p>
            )}

            {/* Clean Action Footer */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-xs">
              <div className="text-[11px] text-slate-500 font-medium">
                Found {aiData?.journey_plan?.routes?.length || 1} candidate options
              </div>

              <button
                type="button"
                onClick={handleApplyRoute}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  isApplied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-500 hover:bg-brand-400 text-white shadow-xs'
                }`}
              >
                {isApplied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Plotted on Map</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3.5 h-3.5" />
                    <span>View on Map</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AiJourneyAssistantBar
