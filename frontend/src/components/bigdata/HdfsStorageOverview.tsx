import React from 'react'
import { HardDrive, Database } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { axisTick, gridProps, tooltipStyle } from '../common/chartTheme'

interface HourlyDensityItem {
  Hour: string
  TotalVehicles: number
  AvgHourlyDensity: number
}

interface HdfsStorageOverviewProps {
  hourlyData: HourlyDensityItem[]
}

export const HdfsStorageOverview: React.FC<HdfsStorageOverviewProps> = ({ hourlyData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 pb-4 border-b border-[#E5E5DF]">
            <div className="p-2.5 border border-[#E5E5DF] bg-[#FBFBFA] text-[#111111]">
              <HardDrive className="w-5 h-5 text-[#E05238]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#111111] text-base font-sans">HDFS Distributed Cluster</h3>
              <p className="text-xs text-[#666662] font-mono">Metropolitan Edge & Regional Data Center Racks</p>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-xs font-mono">
            <div className="flex justify-between py-2 border-b border-[#E5E5DF]">
              <span className="text-[#666662]">Total Records</span>
              <span className="text-[#111111] font-semibold">2,976 records</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#E5E5DF]">
              <span className="text-[#666662]">HDFS Block Size</span>
              <span className="text-[#111111] font-semibold">25 records / block</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#E5E5DF]">
              <span className="text-[#666662]">Replication Factor</span>
              <span className="text-[#E05238] font-semibold">3x (Rack-Aware)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#666662]">Active DataNodes</span>
              <span className="text-emerald-700 font-semibold">4 Nodes Online</span>
            </div>
          </div>
        </div>
        <div className="p-3 border border-[#E5E5DF] bg-[#FBFBFA] text-[11px] text-[#666662] font-mono mt-4">
          MapReduce combiner optimization achieves 73% network shuffle bandwidth reduction.
        </div>
      </div>

      <div className="lg:col-span-2 relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E5DF]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 border border-[#E5E5DF] bg-[#FBFBFA] text-[#111111]">
              <Database className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#111111] text-base font-sans">MapReduce Hourly Traffic Aggregation</h3>
              <p className="text-xs text-[#666662] font-mono">Aggregated Vehicle Volume Profile Across Operating Corridor</p>
            </div>
          </div>
        </div>
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="mrDensity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E05238" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#E05238" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} stroke="#E5E5DF" />
              <XAxis dataKey="Hour" {...axisTick} stroke="#8C8C85" />
              <YAxis {...axisTick} stroke="#8C8C85" />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="TotalVehicles" stroke="#E05238" fill="url(#mrDensity)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default HdfsStorageOverview
