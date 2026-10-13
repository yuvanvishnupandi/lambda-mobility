import React from 'react'
import { Car, Bike, Bus, Truck } from 'lucide-react'

interface VehicleDistributionCardProps {
  cars: number
  bikes: number
  buses: number
  trucks: number
}

export const VehicleDistributionCard: React.FC<VehicleDistributionCardProps> = ({
  cars,
  bikes,
  buses,
  trucks
}) => {
  const total = cars + bikes + buses + trucks || 1

  return (
    <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 shadow-sm">
      <h3 className="font-semibold text-[#111111] text-lg mb-1 font-sans">Fleet Modality Breakdown</h3>
      <p className="text-xs text-[#666662] mb-6 font-mono">Real-Time Vehicle Categorization along Operating Corridor</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border border-[#E5E5DF] bg-[#FBFBFA]">
          <div className="flex items-center gap-2 text-[#111111] mb-2 font-mono">
            <Car className="w-4 h-4 text-[#E05238]" />
            <span className="text-xs font-semibold uppercase">Cars</span>
          </div>
          <span className="text-2xl font-bold font-mono text-[#111111]">{cars.toLocaleString()}</span>
          <span className="text-[11px] text-[#666662] block mt-1 font-mono">{((cars / total) * 100).toFixed(1)}% fleet</span>
        </div>

        <div className="p-4 border border-[#E5E5DF] bg-[#FBFBFA]">
          <div className="flex items-center gap-2 text-[#111111] mb-2 font-mono">
            <Bike className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold uppercase">Bikes</span>
          </div>
          <span className="text-2xl font-bold font-mono text-[#111111]">{bikes.toLocaleString()}</span>
          <span className="text-[11px] text-[#666662] block mt-1 font-mono">{((bikes / total) * 100).toFixed(1)}% fleet</span>
        </div>

        <div className="p-4 border border-[#E5E5DF] bg-[#FBFBFA]">
          <div className="flex items-center gap-2 text-[#111111] mb-2 font-mono">
            <Bus className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-semibold uppercase">Buses</span>
          </div>
          <span className="text-2xl font-bold font-mono text-[#111111]">{buses.toLocaleString()}</span>
          <span className="text-[11px] text-[#666662] block mt-1 font-mono">{((buses / total) * 100).toFixed(1)}% fleet</span>
        </div>

        <div className="p-4 border border-[#E5E5DF] bg-[#FBFBFA]">
          <div className="flex items-center gap-2 text-[#111111] mb-2 font-mono">
            <Truck className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold uppercase">Trucks</span>
          </div>
          <span className="text-2xl font-bold font-mono text-[#111111]">{trucks.toLocaleString()}</span>
          <span className="text-[11px] text-[#666662] block mt-1 font-mono">{((trucks / total) * 100).toFixed(1)}% fleet</span>
        </div>
      </div>
    </div>
  )
}

export default VehicleDistributionCard
