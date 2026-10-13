import React from 'react'
import { Bus as BusIcon, Radio, Navigation, CheckCircle2 } from 'lucide-react'
import { Bus } from '../../types'

interface LiveFleetTrackerCardProps {
  buses: Bus[]
  onSelectBus?: (bus: Bus) => void
  selectedBusId?: string
}

export const LiveFleetTrackerCard: React.FC<LiveFleetTrackerCardProps> = ({
  buses,
  onSelectBus,
  selectedBusId
}) => {
  return (
    <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E5DF]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 border border-[#E5E5DF] bg-[#FBFBFA] text-[#111111]">
            <BusIcon className="w-5 h-5 text-[#E05238]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#111111] text-base font-sans">Active Transit Fleet</h3>
            <p className="text-xs text-[#666662] font-mono">Live GPS & Onboard Edge AI Telemetry</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {buses.length} Units Active
        </span>
      </div>

      <div className="mt-4 space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
        {buses.map((bus) => {
          const isSelected = selectedBusId === bus.id
          return (
            <div
              key={bus.id}
              onClick={() => onSelectBus?.(bus)}
              className={`p-3.5 border transition-all cursor-pointer text-xs ${
                isSelected
                  ? 'bg-[#F7F7F4] border-[#111111] shadow-xs'
                  : 'bg-[#FFFFFF] border-[#E5E5DF] hover:border-[#111111]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono px-2 py-0.5 bg-[#F4F4F0] text-[#111111] border border-[#E5E5DF] font-semibold text-[11px]">
                    {bus.id}
                  </span>
                  <div>
                    <span className="text-[#111111] font-semibold block">{bus.route}</span>
                    <span className="text-[11px] text-[#666662] flex items-center gap-1 mt-0.5">
                      <Navigation className="w-3 h-3 text-[#E05238]" /> {bus.location}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="font-mono text-[#111111] font-bold text-sm">
                      {bus.speed} km/h
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      {bus.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#8C8C85] mt-1 justify-end font-mono">
                    <Radio className="w-2.5 h-2.5 text-[#E05238]" />
                    <span>AI: {bus.aiStatus}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LiveFleetTrackerCard
