import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Compass } from 'lucide-react'
import { TransitMap } from './TransitMap'
import { JourneyRouteOption, LiveVehicle, TransitStop } from '../../types/transit'

interface TransitMapModalProps {
  isOpen: boolean
  onClose: () => void
  route: JourneyRouteOption | null
  liveVehicles: LiveVehicle[]
  selectedStop?: TransitStop | null
  onSelectVehicle?: (vehicleId: string) => void
}

export const TransitMapModal: React.FC<TransitMapModalProps> = ({
  isOpen,
  onClose,
  route,
  liveVehicles,
  selectedStop,
  onSelectVehicle,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-3 sm:p-5 md:p-8 animate-fade"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative flex h-[88vh] max-h-[900px] w-full max-w-6xl flex-col border border-[#D5D5CF] bg-[#FFFFFF] shadow-2xl overflow-hidden">
        {/* Speakeasy Corner Notch Markers */}
        <span className="speakeasy-notch-marker -top-1 -left-1" aria-hidden="true" />
        <span className="speakeasy-notch-marker -top-1 -right-1" aria-hidden="true" />
        <span className="speakeasy-notch-marker -bottom-1 -left-1" aria-hidden="true" />
        <span className="speakeasy-notch-marker -bottom-1 -right-1" aria-hidden="true" />

        {/* Modal Top Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-[#E5E5DF] bg-[#FBFBFA] px-5 py-3">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center border border-[#D5D5CF] bg-[#FFFFFF] text-[#E05238]">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-tight text-[#111111]">Metropolitan Transit Map</h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Tamil Nadu Network
                </span>
              </div>
              <p className="text-xs text-[#666662] font-mono">
                {route
                  ? `Active Path: ${route.summary_title} · ${route.duration_minutes} min (₹${route.fare})`
                  : 'Chennai ↔ Chengalpattu GST Arterial Corridor · Southern EMU · MTC Electric Fleet'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>{liveVehicles.length || 24} Telemetry Probes Active</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 border border-[#D5D5CF] bg-[#FFFFFF] hover:bg-[#111111] hover:text-white text-[#111111] transition-colors"
              title="Close Map (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Map Body */}
        <div className="flex-1 min-h-0 w-full relative">
          <TransitMap
            route={route}
            liveVehicles={liveVehicles}
            selectedStop={selectedStop}
            onSelectVehicle={onSelectVehicle}
          />
        </div>
      </div>
    </div>,
    document.body
  )
}

export default TransitMapModal
