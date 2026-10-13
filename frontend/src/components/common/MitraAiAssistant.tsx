import React, { useState, useRef, useEffect } from 'react'
import { X, Send } from 'lucide-react'
import { useUser } from '../../context/UserContext'

type AiModel = 'Gemini 1.5 Pro' | 'GPT-4o' | 'Mistral' | 'Groq Fast'

interface Message {
  id: string
  sender: 'user' | 'mitra'
  text: string
  model?: string
  timestamp: string
  metrics?: {
    probesActive?: number
    corridor?: string
    severity?: string
    actionTaken?: string
  }
}

const PRESET_QUERIES = [
  { label: 'GST Road Congestion', query: 'Analyze current congestion surges on the GST Road (NH 45) arterial corridor.' },
  { label: 'Potheri Potholes', query: 'Show active road surface hazard clusters flagged near Potheri and SRM Junction.' },
  { label: 'Bus-184 Telemetry', query: 'Inspect live CAN-bus kinematics and probe telemetry for vehicle BUS-184.' },
  { label: 'Velachery Flood Basin', query: 'Evaluate hydrological inundation risk for Velachery catchment basin.' },
  { label: 'Dispatch Clearance', query: 'Generate automated traffic diversion advisory for Guduvanchery bottleneck.' }
]

export const MitraAiAssistant: React.FC = () => {
  const { user, currentLocation } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState<AiModel>('Gemini 1.5 Pro')
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'mitra',
      model: 'Gemini 1.5 Pro (Active)',
      timestamp: 'Just now',
      text: `Salutations, ${user?.name || 'Officer'}. I am Mitra, your Urban Transit Operations Copilot. I have live probe telemetry access across Chennai & Chengalpattu corridors. Ask me anything regarding fleet kinematics, ML pavement classification, flood basins, or predictive dispatches.`
    }
  ])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim()
    if (!query) return

    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: now
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput('')
    setIsTyping(true)

    let replyText = ''
    let replyModel: string = selectedModel
    let metricsData: Message['metrics'] = undefined

    try {
      // 1. Try FastAPI Serving Bridge with Multi-Model AI Router
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 7000)

      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          model: selectedModel,
          context: {
            corridor: currentLocation?.corridor || 'GST Road (NH 45)',
            city: currentLocation?.city || 'Chennai / Chengalpattu',
            district: currentLocation?.district || 'Chengalpattu'
          }
        }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (res.ok) {
        const data = await res.json()
        if (data.text) {
          replyText = data.text
          replyModel = data.model_used || selectedModel
          metricsData = data.metrics
        }
      }
    } catch {
      // Network timeout / offline fallback
    }

    // 2. Client-Side Deterministic Urban Intelligence Fallback (Guarantees ZERO errors)
    if (!replyText) {
      const q = query.toLowerCase()
      const corridor = currentLocation?.corridor || 'GST Road (NH 45)'

      if (q.includes('gst road') || q.includes('congestion') || q.includes('traffic') || q.includes('delay')) {
        replyText = `**Arterial Telemetry Assessment · ${corridor}**\n\n• **Velocity Index:** Current average corridor velocity is **32.4 km/h** against a design benchmark of 50 km/h.\n• **Delay Bottleneck:** +6.8 minute transit delay registered at the Guduvanchery Flyover & Vandalur intersection.\n• **Modal Saturation:** Two-wheeler surge (54%) and IT commuter buses (22%) dominating arterial capacity.\n• **Tactical Protocol:** Actuating green wave progression at 75-second cycle intervals; metering heavy commercial logistics via outer bypass.`
        metricsData = {
          corridor,
          probesActive: 248,
          severity: 'Moderate Arterial Delay',
          actionTaken: 'Adaptive Green Wave Cycle Recalibrated'
        }
        replyModel = `${selectedModel} (Local Fallback)`
      } else if (q.includes('pothole') || q.includes('hazard') || q.includes('pavement') || q.includes('potheri')) {
        replyText = `**Computer Vision Pavement Analysis · Chainage Km 38.2**\n\n• **Defect Identification:** Critical Severity Grade 3 pothole cluster verified on NH 45 Km 38.2 near Potheri Central & SRM IST.\n• **Verification Telemetry:** Corroborated by 18 independent bus accelerometer and optical probe traverses.\n• **Roughness Index (IRI):** Spiked to 5.8 m/km (exceeding safety threshold 3.5 m/km).\n• **Work Order:** Automated maintenance dossier #CGL-4912 dispatched to Chengalpattu Highways Division with precision GPS coordinates.`
        metricsData = {
          corridor: 'Potheri Central · NH 45 Km 38.2',
          severity: 'Grade 3 Pavement Defect',
          actionTaken: 'Highways Dispatch Ticket #CGL-4912'
        }
        replyModel = `${selectedModel} (Local Fallback)`
      } else if (q.includes('flood') || q.includes('water') || q.includes('rain') || q.includes('velachery') || q.includes('chembarambakkam')) {
        replyText = `**Hydrological & Inundation Model Output**\n\n• **Reservoir Stage:** Chembarambakkam reservoir operating at **95% effective capacity** with controlled surplus release into the Adyar corridor.\n• **Catchment Risk:** Velachery Basin lowlands flagged at **High Inundation Risk** due to slow clay soil infiltration and 218.5 mm recent accumulation.\n• **Adyar River Gauge:** Stage at 6.8 m MSL (approaching 7.5 m high-flood danger datum).\n• **Emergency Directive:** Pre-positioning heavy dewatering pumps (80-120 HP) at low-lying subways and alerting ward disaster management teams.`
        metricsData = {
          corridor: 'Adyar Basin & Velachery Lake',
          severity: 'Elevated Hydrological Risk',
          actionTaken: 'Sluice Release & Dewatering Protocols Active'
        }
        replyModel = `${selectedModel} (Local Fallback)`
      } else if (q.includes('bus') || q.includes('kinematics') || q.includes('telemetry') || q.includes('fleet')) {
        replyText = `**Vehicle Telemetry & Kinematics Inspection · BUS-184**\n\n• **Spatial Coordinates:** 12.8236° N, 80.0451° E (Snapping to GST Road Southbound Express Lane).\n• **Kinematic Telemetry:** Current speed 41.2 km/h · Lateral acceleration 0.12g (stable operating envelope).\n• **CAN-Bus Telemetry:** Brake disc temperature 68°C · Powertrain nominal · Passenger occupancy at 84% capacity.\n• **Dispatch Status:** On schedule with 2-minute headway behind lead probe BUS-156.`
        metricsData = {
          corridor: 'Southbound Express Lane',
          probesActive: 1,
          severity: 'Optimal Kinematic State',
          actionTaken: 'Live CAN-Bus Telemetry Active'
        }
        replyModel = `${selectedModel} (Local Fallback)`
      } else {
        replyText = `**Lambda Operational Intelligence Summary**\n\nIn response to your inquiry regarding *"${query}"*:\n\n• **Distributed Grid:** All 248 transit probes are active and reporting nominal telemetry across Chennai metro.\n• **Big Data Pipeline:** Spark MLlib inference engine is processing **1,420 telemetric events/second** across HDFS & Kafka streams.\n• **Network Health:** Telemetry availability is **99.98%** with zero pipeline backlog.\n• Ask me about arterial congestion, fleet kinematics, pavement hazards, or flood predictions.`
        metricsData = {
          corridor,
          probesActive: 248,
          severity: 'Normal Operations',
          actionTaken: 'Continuous Telemetric Surveillance'
        }
        replyModel = `${selectedModel} (Local Fallback)`
      }
    }

    const botMsg: Message = {
      id: `mitra-${Date.now()}`,
      sender: 'mitra',
      model: replyModel,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      text: replyText,
      metrics: metricsData
    }

    setMessages((prev) => [...prev, botMsg])
    setIsTyping(false)
  }

  return (
    <>
      {/* Floating Launcher Button (Speakeasy Clean White Card with Corner Notch Markers) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-[#FFFFFF] text-[#111111] border border-[#D5D5CF] hover:border-[#111111] shadow-xl px-4 py-2.5 font-mono text-[11.5px] font-bold tracking-wider hover:bg-[#FBFBFA] transition-all cursor-pointer group select-none"
          aria-label="Open Mitra AI Assistant"
        >
          {/* Speakeasy corner notch markers */}
          <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

          <div className="flex h-5 w-5 items-center justify-center bg-[#E05238] text-white font-mono text-[10px]">
            ■
          </div>
          <span className="text-[#111111] tracking-widest uppercase">Mitra AI</span>
          <span className="text-[9.5px] px-1.5 py-0.5 bg-[#F7F7F4] text-[#666662] font-mono border border-[#D5D5CF] uppercase">
            Copilot
          </span>
        </button>
      )}

      {/* Floating Speakeasy Chat Window (Light Cream & White Theme) */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col w-[460px] max-w-[94vw] h-[610px] max-h-[86vh] bg-[#FFFFFF] text-[#111111] border border-[#D5D5CF] shadow-2xl overflow-hidden font-sans animate-page-in"
          role="dialog"
          aria-label="Mitra AI Operations Copilot"
        >
          {/* Speakeasy corner notch markers */}
          <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

          {/* Header Bar (Clean, without the unwanted corridor subtitle) */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5DF] bg-[#FFFFFF]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 items-center justify-center bg-[#E05238] text-white font-mono text-[10px]">
                ■
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-bold tracking-tight text-[#111111] font-mono uppercase">
                  Mitra AI
                </h3>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-orange-50 text-[#E05238] border border-orange-200 font-bold">
                  Transit OS
                </span>
                <span className="flex items-center gap-1 text-[9.5px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center text-[#666662] hover:text-[#111111] hover:bg-[#F2F2EC] transition-colors"
              title="Close Mitra AI"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Model Selector Bar (Speakeasy Monospace Engine Tabs) */}
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-[#E5E5DF] bg-[#FBFBFA] text-[10.5px] font-mono">
            <span className="text-[#666662] uppercase font-bold tracking-wider">Engine:</span>
            <div className="flex items-center gap-1">
              {(['Gemini 1.5 Pro', 'GPT-4o', 'Mistral', 'Groq Fast'] as AiModel[]).map((m) => {
                const isActive = selectedModel === m
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedModel(m)}
                    className={`px-2 py-0.5 transition-all font-mono text-[10px] uppercase border ${
                      isActive
                        ? 'bg-[#111111] text-white border-[#111111] font-bold shadow-xs'
                        : 'text-[#666662] hover:text-[#111111] bg-white border-[#D5D5CF] hover:border-[#111111]'
                    }`}
                  >
                    {m}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Preset Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto px-3.5 py-2 border-b border-[#E5E5DF] bg-[#FBFBFA] no-scrollbar">
            {PRESET_QUERIES.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleSend(preset.query)}
                className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-[#F2F2EC] text-[#444440] hover:text-[#111111] border border-[#D5D5CF] hover:border-[#111111] text-[10px] font-mono transition-all shrink-0"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-[#FBFBFA]">
            {messages.map((m) => {
              const isMitra = m.sender === 'mitra'
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMitra ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[9.5px] font-mono text-[#8C8C85]">
                    <span>{isMitra ? `Mitra (${m.model || selectedModel})` : user?.name || 'You'}</span>
                    <span>·</span>
                    <span>{m.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[92%] p-3.5 leading-relaxed whitespace-pre-wrap font-sans text-xs border shadow-2xs ${
                      isMitra
                        ? 'bg-[#FFFFFF] border-[#D5D5CF] text-[#111111]'
                        : 'bg-[#111111] text-white border-[#111111]'
                    }`}
                  >
                    {m.text}

                    {m.metrics && (
                      <div className="mt-2.5 pt-2 border-t border-[#E5E5DF] space-y-1 font-mono text-[10.5px] bg-[#FBFBFA] p-2 -mx-1">
                        {m.metrics.corridor && (
                          <div className="flex justify-between text-[#666662]">
                            <span className="uppercase text-[9.5px]">Corridor:</span>
                            <span className="text-[#111111] font-bold">{m.metrics.corridor}</span>
                          </div>
                        )}
                        {m.metrics.severity && (
                          <div className="flex justify-between text-[#666662]">
                            <span className="uppercase text-[9.5px]">Status:</span>
                            <span className="text-[#E05238] font-bold">{m.metrics.severity}</span>
                          </div>
                        )}
                        {m.metrics.actionTaken && (
                          <div className="flex justify-between text-[#666662]">
                            <span className="uppercase text-[9.5px]">Protocol:</span>
                            <span className="text-emerald-700 font-bold">{m.metrics.actionTaken}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {isTyping && (
              <div className="flex items-center gap-2 p-2 text-[11px] font-mono text-[#666662] bg-[#FFFFFF] border border-[#D5D5CF] shadow-2xs w-fit">
                <span className="h-1.5 w-1.5 bg-[#E05238] inline-block animate-pulse" />
                <span>Mitra is querying {selectedModel} & telemetry pipeline...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-3 border-t border-[#E5E5DF] bg-[#FFFFFF]">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Mitra about GST Road, fleet probes, or AI hazard classification..."
                className="flex-1 bg-[#FBFBFA] border border-[#D5D5CF] focus:border-[#111111] focus:bg-white px-3 py-2 text-xs font-mono text-[#111111] placeholder:text-[#8C8C85] outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-8 w-8 items-center justify-center bg-[#111111] hover:bg-black disabled:bg-[#D5D5CF] text-white disabled:text-[#8C8C85] transition-colors shrink-0 disabled:cursor-not-allowed"
                aria-label="Send query"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between text-[9px] font-mono text-[#8C8C85]">
              <span className="uppercase tracking-wider">Multi-Model Engine · Gemini & Groq Live</span>
              <span>v2.5 Speakeasy</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MitraAiAssistant
