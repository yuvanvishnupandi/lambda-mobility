import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Radio,
  Play,
  Pause,
  RotateCw,
  Smartphone,
  Activity,
  Copy,
  Check,
  Send,
  Zap,
} from 'lucide-react'
import { traccarApi, TraccarStatus, TraccarGpsPacket } from '../../services/traccarApi'

interface TraccarGpsModalProps {
  isOpen: boolean
  onClose: () => void
  onVehicleUpdated?: (packet: TraccarGpsPacket) => void
}

export const TraccarGpsModal: React.FC<TraccarGpsModalProps> = ({
  isOpen,
  onClose,
  onVehicleUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'phone' | 'manual' | 'packets'>('simulator')
  const [, setStatusInfo] = useState<TraccarStatus | null>(null)
  const [isSimRunning, setIsSimRunning] = useState(false)
  const [simSpeed, setSimSpeed] = useState(1.0)
  const [isSending, setIsSending] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [recentPackets, setRecentPackets] = useState<TraccarGpsPacket[]>([])

  // Manual GPS Inputs — Defaults to Chengalpattu GST Road (NH 45) Corridor
  const [manualId, setManualId] = useState('MTC-500A-101')
  const [manualLat, setManualLat] = useState(12.8231)
  const [manualLon, setManualLon] = useState(80.0444)
  const [manualSpeed, setManualSpeed] = useState(38)
  const [manualBearing, setManualBearing] = useState(180)
  const [manualBatt, setManualBatt] = useState(92)
  const [sendSuccessMsg, setSendSuccessMsg] = useState<string | null>(null)

  // Server URL for phone apps
  const serverHost = window.location.origin
  const clientEndpointUrl = `${serverHost}/api/traccar/client/`

  useEffect(() => {
    if (!isOpen) return

    traccarApi.getStatus().then((data) => {
      setStatusInfo(data)
      setIsSimRunning(data.simulation_running)
      setSimSpeed(data.simulation_speed || 1.0)
      if (data.recent_packets) {
        setRecentPackets(data.recent_packets)
      }
    })

    // Subscribe to SSE stream for live packet monitor
    const unsubscribe = traccarApi.connectLiveStream(
      (packet) => {
        setRecentPackets((prev) => [packet, ...prev.slice(0, 30)])
        if (onVehicleUpdated) {
          onVehicleUpdated(packet)
        }
      },
      undefined,
      (err) => console.warn('Traccar modal SSE issue:', err)
    )

    return () => {
      unsubscribe()
    }
  }, [isOpen, onVehicleUpdated])

  if (!isOpen) return null

  const handleToggleSimulation = async () => {
    try {
      const nextAction = isSimRunning ? 'stop' : 'start'
      await traccarApi.controlSimulator(nextAction, simSpeed)
      setIsSimRunning(!isSimRunning)
    } catch (err) {
      console.error('Failed to toggle simulation:', err)
    }
  }

  const handleStepSimulation = async () => {
    try {
      setIsSending(true)
      const res = await traccarApi.controlSimulator('step')
      if (res.events && res.events.length > 0) {
        setRecentPackets((prev) => [...res.events, ...prev.slice(0, 30)])
        res.events.forEach((ev: TraccarGpsPacket) => {
          if (onVehicleUpdated) onVehicleUpdated(ev)
        })
      }
    } catch (err) {
      console.error('Failed to step simulation:', err)
    } finally {
      setIsSending(false)
    }
  }

  const handleSpeedChange = async (spd: number) => {
    setSimSpeed(spd)
    try {
      await traccarApi.controlSimulator('start', spd)
    } catch (err) {
      console.error('Failed to update speed:', err)
    }
  }

  const handleSendManualGps = async () => {
    try {
      setIsSending(true)
      setSendSuccessMsg(null)
      const res = await traccarApi.sendGpsFix({
        id: manualId,
        lat: manualLat,
        lon: manualLon,
        speed: manualSpeed,
        bearing: manualBearing,
        batt: manualBatt,
      })

      if (res) {
        setSendSuccessMsg(`Telemetry fix pushed for ${manualId} at [${manualLat.toFixed(4)}, ${manualLon.toFixed(4)}]`)
        setTimeout(() => setSendSuccessMsg(null), 3500)
      }
    } catch (err: any) {
      setSendSuccessMsg(`Error: ${err.message}`)
    } finally {
      setIsSending(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative border border-[#D5D5CF] bg-[#FFFFFF] shadow-2xl flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden text-[#111111]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
        <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
        <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
        <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#EBEBE6] bg-[#FBFBFA] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-[#D5D5CF] bg-[#FFFFFF] text-[#111111]">
              <Radio className="h-4 w-4 text-[#E05238] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#111111]">
                  GPS Ingestion & Fleet Telemetry Stream
                </h2>
                <span className="font-mono text-[9px] text-[#2F7C4E] bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 font-bold uppercase">
                  Real-Time Pipeline
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#666662] mt-0.5">
                Traccar Protocol · Poisson Edge Kinematics · Tamil Nadu GST Road Corridor
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center border border-[#D5D5CF] bg-[#FFFFFF] hover:bg-[#111111] hover:text-white transition-all text-[#111111]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs — Crisp Speakeasy Row */}
        <div className="flex border-b border-[#EBEBE6] bg-[#FBFBFA] px-6 pt-2 gap-2 overflow-x-hidden">
          {[
            { id: 'simulator', label: 'Route Simulator', icon: Play },
            { id: 'phone', label: 'Smartphone (Traccar App)', icon: Smartphone },
            { id: 'manual', label: 'Manual GPS Transmitter', icon: Send },
            { id: 'packets', label: `Live Packets (${recentPackets.length})`, icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 ${
                  isActive
                    ? 'border-[#111111] bg-white text-[#111111]'
                    : 'border-transparent text-[#666662] hover:text-[#111111]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E05238]' : 'text-[#888880]'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-[#FFFFFF]">
          {/* TAB 1: ROUTE SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-5">
              <div className="border border-[#D5D5CF] bg-[#F9F9F6] p-4 font-mono">
                <div className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-[#E05238] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-[#111111] text-xs uppercase tracking-wider">
                      Autonomous Tamil Nadu Transit Probe & GST Road GPS Simulator
                    </h3>
                    <p className="text-[12px] text-[#555550] mt-1 leading-relaxed font-sans">
                      Emulates continuous live GPS coordinates streaming from on-board Traccar transponders installed on{' '}
                      <strong>MTC Buses (Route 500A, 118)</strong>, electric campus shuttles, and <strong>Southern Railway EMU units</strong> along the Grand Southern Trunk (GST Road / NH 45) corridor.
                    </p>
                  </div>
                </div>
              </div>

              {/* Simulation Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <div className="border border-[#D5D5CF] bg-[#FFFFFF] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#666662] uppercase text-[11px]">
                      Continuous Playback Stream
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 uppercase border ${
                        isSimRunning
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 animate-pulse'
                          : 'bg-[#F4F4F0] text-[#666662] border-[#E5E5DF]'
                      }`}
                    >
                      {isSimRunning ? 'STREAMING ACTIVE' : 'PAUSED'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleSimulation}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-xs ${
                        isSimRunning
                          ? 'bg-[#111111] hover:bg-black text-white'
                          : 'bg-[#111111] hover:bg-black text-white'
                      }`}
                    >
                      {isSimRunning ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pause Live Movement</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                          <span>Start Live Movement</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleStepSimulation}
                      disabled={isSending}
                      className="px-3 py-2.5 border border-[#D5D5CF] bg-[#FFFFFF] hover:bg-[#FBFBFA] font-mono text-xs font-bold uppercase transition-all disabled:opacity-50"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="border border-[#D5D5CF] bg-[#FFFFFF] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#666662] uppercase text-[11px]">
                      Speed Multiplier
                    </span>
                    <span className="font-bold text-[#2563EB]">
                      {simSpeed}x Realtime
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {[0.5, 1.0, 2.0, 5.0].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSpeedChange(s)}
                        className={`flex-1 py-2 font-mono text-xs font-bold border transition-all ${
                          simSpeed === s
                            ? 'bg-[#111111] text-white border-[#111111]'
                            : 'bg-[#FFFFFF] text-[#444440] border-[#D5D5CF] hover:bg-[#FBFBFA]'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Simulated Routes in Tamil Nadu */}
              <div className="border border-[#D5D5CF] bg-[#FFFFFF] p-4 space-y-3">
                <h4 className="font-mono text-xs font-bold text-[#111111] uppercase tracking-wider">
                  Active Live Simulated Vehicles · Chengalpattu GST
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 bg-[#F9F9F6] border border-[#EBEBE6]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#111111]">MTC-500A-101</span>
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1">Route 500A</span>
                    </div>
                    <div className="text-[11px] text-[#666662] font-sans">Chengalpattu Jn ↔ Tambaram ↔ T. Nagar</div>
                  </div>

                  <div className="p-3 bg-[#F9F9F6] border border-[#EBEBE6]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#111111]">TNSTC-CGL-102</span>
                      <span className="text-[9px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-1">Route 118</span>
                    </div>
                    <div className="text-[11px] text-[#666662] font-sans">Kanchipuram ↔ Chengalpattu ↔ Tambaram</div>
                  </div>

                  <div className="p-3 bg-[#F9F9F6] border border-[#EBEBE6]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#111111]">SR-EMU-103</span>
                      <span className="text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1">Suburban Rail</span>
                    </div>
                    <div className="text-[11px] text-[#666662] font-sans">Chennai Beach ↔ Chengalpattu EMU</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PHONE APP / TRACCAR CLIENT GUIDE */}
          {activeTab === 'phone' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="border border-[#D5D5CF] bg-[#F9F9F6] p-4 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-[#111111] text-xs uppercase tracking-wider">
                    Connect Any Android or iOS Smartphone as a Live Bus Tracker
                  </h3>
                  <p className="text-[12px] text-[#666662] mt-1 leading-relaxed font-sans">
                    Install the official free <strong>Traccar Client</strong> app to turn any mobile phone into a live transit GPS transmitter pushing coordinates into Lambda.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 border border-[#E5E5DF] bg-[#FFFFFF] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#111111] uppercase text-[11px]">
                    <span className="w-4 h-4 bg-[#111111] text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Download Traccar Client</span>
                  </div>
                  <p className="text-[11px] text-[#666662] pl-6 font-sans">
                    Available for free on Google Play Store (Android) and Apple App Store (iOS).
                  </p>
                </div>

                <div className="p-3.5 border border-[#E5E5DF] bg-[#FFFFFF] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#111111] uppercase text-[11px]">
                    <span className="w-4 h-4 bg-[#111111] text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Configure Server URL in App Settings</span>
                  </div>
                  <div className="pl-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={clientEndpointUrl}
                        className="flex-1 border border-[#D5D5CF] bg-[#F9F9F6] px-3 py-1.5 font-mono text-xs text-[#111111]"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(clientEndpointUrl)}
                        className="px-3 py-1.5 bg-[#111111] hover:bg-black text-white text-xs font-bold uppercase transition-all flex items-center gap-1.5"
                      >
                        {copiedUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 border border-[#E5E5DF] bg-[#FFFFFF] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#111111] uppercase text-[11px]">
                    <span className="w-4 h-4 bg-[#111111] text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Set Device Identifier & Start Service</span>
                  </div>
                  <div className="pl-6 text-[11px] text-[#666662] font-sans">
                    Set Device Identifier to <strong className="font-mono text-[#111111]">MTC-500A-101</strong> and toggle Service Status to ON.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MANUAL TRANSMITTER */}
          {activeTab === 'manual' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="border border-[#D5D5CF] bg-[#FFFFFF] p-4 space-y-4">
                <h3 className="font-bold text-[#111111] uppercase tracking-wider text-xs">
                  Push Custom GPS Fix to Lambda GIS Map
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#777770] block mb-1">Device ID / Vehicle</label>
                    <input
                      type="text"
                      value={manualId}
                      onChange={(e) => setManualId(e.target.value)}
                      className="w-full border border-[#D5D5CF] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#777770] block mb-1">Speed (km/h)</label>
                    <input
                      type="number"
                      value={manualSpeed}
                      onChange={(e) => setManualSpeed(Number(e.target.value))}
                      className="w-full border border-[#D5D5CF] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#777770] block mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={manualLat}
                      onChange={(e) => setManualLat(Number(e.target.value))}
                      className="w-full border border-[#D5D5CF] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#777770] block mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={manualLon}
                      onChange={(e) => setManualLon(Number(e.target.value))}
                      className="w-full border border-[#D5D5CF] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#777770] block mb-1">Heading (°)</label>
                    <input
                      type="number"
                      min="0"
                      max="360"
                      value={manualBearing}
                      onChange={(e) => setManualBearing(Number(e.target.value))}
                      className="w-full border border-[#D5D5CF] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#777770] block mb-1">Battery SOC (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={manualBatt}
                      onChange={(e) => setManualBatt(Number(e.target.value))}
                      className="w-full border border-[#D5D5CF] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#111111]"
                    />
                  </div>
                </div>

                {/* Tamil Nadu Quick Location Presets */}
                <div className="pt-2">
                  <div className="text-[10px] uppercase font-bold text-[#777770] mb-2">Tamil Nadu GST Corridor Presets:</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setManualId('MTC-500A-101')
                        setManualLat(12.8231)
                        setManualLon(80.0444)
                        setManualSpeed(38)
                      }}
                      className="px-2.5 py-1 border border-[#D5D5CF] bg-[#F9F9F6] hover:border-[#111111] text-[10px] font-bold uppercase transition-all"
                    >
                      Potheri Central (SRM IST)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setManualId('BUS-087')
                        setManualLat(12.8465)
                        setManualLon(80.0612)
                        setManualSpeed(44)
                      }}
                      className="px-2.5 py-1 border border-[#D5D5CF] bg-[#F9F9F6] hover:border-[#111111] text-[10px] font-bold uppercase transition-all"
                    >
                      Guduvanchery Bypass
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setManualId('SR-EMU-103')
                        setManualLat(12.9250)
                        setManualLon(80.1165)
                        setManualSpeed(55)
                      }}
                      className="px-2.5 py-1 border border-[#D5D5CF] bg-[#F9F9F6] hover:border-[#111111] text-[10px] font-bold uppercase transition-all"
                    >
                      Tambaram Sanatorium
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setManualId('TECH-SHUTTLE-104')
                        setManualLat(12.7420)
                        setManualLon(79.9880)
                        setManualSpeed(32)
                      }}
                      className="px-2.5 py-1 border border-[#D5D5CF] bg-[#F9F9F6] hover:border-[#111111] text-[10px] font-bold uppercase transition-all"
                    >
                      Mahindra World City
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSendManualGps}
                    disabled={isSending}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-black text-white font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Transmit GPS Fix</span>
                  </button>
                </div>

                {sendSuccessMsg && (
                  <div className="p-2 border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs">
                    {sendSuccessMsg}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: LIVE PACKETS STREAM */}
          {activeTab === 'packets' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="border border-[#D5D5CF] bg-[#FFFFFF] p-4">
                <div className="flex items-center justify-between border-b border-[#EBEBE6] pb-2 mb-3">
                  <span className="font-bold text-[#111111] uppercase text-xs">
                    Ingested Raw Traccar / NMEA Packets ({recentPackets.length})
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 font-bold">
                    CONNECTED
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {recentPackets.length === 0 ? (
                    <div className="text-center py-8 text-[#888880]">
                      No packets received yet. Start the Route Simulator or send a manual fix!
                    </div>
                  ) : (
                    recentPackets.map((pkt, idx) => (
                      <div
                        key={idx}
                        className="p-2 border border-[#E5E5DF] bg-[#F9F9F6] text-[11px] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#111111]">{pkt.vehicle_id || (pkt as any).device_id || 'GPS-NODE'}</span>
                          <span className="text-[#888880]">·</span>
                          <span className="text-[#444440]">
                            [{pkt.latitude?.toFixed(4)}, {pkt.longitude?.toFixed(4)}]
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[#666662]">
                          <span>{pkt.speed_kmh?.toFixed(0)} km/h</span>
                          <span className="text-[#888880]">{pkt.timestamp?.substring(11, 19) || 'Just now'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[#EBEBE6] bg-[#FBFBFA] px-6 py-3 flex items-center justify-between font-mono text-xs">
          <div className="text-[11px] text-[#888880]">
            Traccar Protocol: OsmAnd + HTTP Webhook v2 · Tamil Nadu Regional Grid
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border border-[#D5D5CF] bg-[#FFFFFF] hover:bg-[#111111] hover:text-white font-bold uppercase tracking-wider text-xs transition-all"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default TraccarGpsModal
