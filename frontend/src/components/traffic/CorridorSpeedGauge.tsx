import React from 'react'
import { Gauge } from 'lucide-react'

interface CorridorSpeedGaugeProps {
  averageSpeed: number
  peakSpeed: number
  congestionLevel: string
}

export const CorridorSpeedGauge: React.FC<CorridorSpeedGaugeProps> = ({
  averageSpeed,
  peakSpeed,
  congestionLevel
}) => {
  return (
    <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E5DF]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 border border-[#E5E5DF] bg-[#FBFBFA] text-[#111111]">
            <Gauge className="w-5 h-5 text-[#E05238]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#111111] text-base font-sans">Corridor Velocity Monitor</h3>
            <p className="text-xs text-[#666662] font-mono">Real-Time Kinematic Speed Telemetry</p>
          </div>
        </div>
        <span className="px-2.5 py-1 font-mono text-xs font-semibold bg-[#F7F7F4] text-[#111111] border border-[#E5E5DF] uppercase">
          {congestionLevel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="p-4 border border-[#E5E5DF] bg-[#FBFBFA]">
          <span className="text-xs text-[#666662] block mb-1 font-mono">Average Velocity</span>
          <span className="text-3xl font-bold font-mono text-[#111111]">{averageSpeed}</span>
          <span className="text-xs text-[#8C8C85] ml-1 font-mono">km/h</span>
        </div>
        <div className="p-4 border border-[#E5E5DF] bg-[#FBFBFA]">
          <span className="text-xs text-[#666662] block mb-1 font-mono">Peak Flow Velocity</span>
          <span className="text-3xl font-bold font-mono text-[#E05238]">{peakSpeed}</span>
          <span className="text-xs text-[#8C8C85] ml-1 font-mono">km/h</span>
        </div>
      </div>
    </div>
  )
}

export default CorridorSpeedGauge
