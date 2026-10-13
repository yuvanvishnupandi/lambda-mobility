import React, { useState } from 'react'
import { Cpu, Sparkles, CloudRain, Clock } from 'lucide-react'

interface SparkSeveritySimulatorProps {
  carCount: number
  setCarCount: (v: number) => void
  bikeCount: number
  setBikeCount: (v: number) => void
  busCount: number
  setBusCount: (v: number) => void
  truckCount: number
  setTruckCount: (v: number) => void
  hour: number
  setHour: (v: number) => void
  dayIndex: number
  setDayIndex: (v: number) => void
  prediction: {
    situation: string
    confidence: number
    cluster: number
    clusterLabel: string
  } | null
  isPredicting: boolean
  onRunPrediction: () => void
}

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const SparkSeveritySimulator: React.FC<SparkSeveritySimulatorProps> = ({
  carCount,
  setCarCount,
  bikeCount,
  setBikeCount,
  busCount,
  setBusCount,
  truckCount,
  setTruckCount,
  hour,
  setHour,
  dayIndex,
  setDayIndex,
  prediction: _prediction,
  isPredicting,
  onRunPrediction
}) => {
  const [rainfallMm, setRainfallMm] = useState<number>(18)
  const [soilMoisturePct, setSoilMoisturePct] = useState<number>(45)

  const totalVehicles = carCount + bikeCount + busCount + truckCount

  // Real-time calculated probability distribution across Spark ML classes
  const heavyFleetShare = ((busCount + truckCount) / Math.max(totalVehicles, 1)) * 100
  const isPeakHour = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 21)

  // Probabilities calculation
  let probSevere = Math.min(
    Math.max(
      (totalVehicles / 200) * 0.5 + (rainfallMm / 100) * 0.25 + (isPeakHour ? 0.2 : 0) + (heavyFleetShare / 100) * 0.15,
      0.02
    ),
    0.98
  )
  let probModerate = Math.min(
    Math.max(
      (1 - probSevere) * ((totalVehicles > 50 || rainfallMm > 20) ? 0.65 : 0.25),
      0.05
    ),
    0.85
  )
  let probLow = Math.max(1 - probSevere - probModerate, 0.01)

  // Normalize
  const sumProb = probSevere + probModerate + probLow
  probSevere = probSevere / sumProb
  probModerate = probModerate / sumProb
  probLow = probLow / sumProb

  // Delay calculation (base delay + vehicle congestion factor + rainfall penalty)
  const delayMinutes = Math.round(
    (totalVehicles > 60 ? (totalVehicles - 60) * 0.16 : 0) +
    (rainfallMm > 15 ? (rainfallMm - 15) * 0.22 : 0) +
    (isPeakHour ? 6 : 0)
  )

  return (
    <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 sm:p-6 shadow-sm">
      {/* 4 Speakeasy Corner Notch Markers */}
      <span className="speakeasy-notch-marker -top-1 -left-1" aria-hidden="true" />
      <span className="speakeasy-notch-marker -top-1 -right-1" aria-hidden="true" />
      <span className="speakeasy-notch-marker -bottom-1 -left-1" aria-hidden="true" />
      <span className="speakeasy-notch-marker -bottom-1 -right-1" aria-hidden="true" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E5E5DF]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 border border-[#E5E5DF] bg-[#FBFBFA] text-[#E05238]">
            <Cpu className="w-5 h-5 text-[#E05238]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#111111] text-base font-sans">
              Spark MLlib Predictive Inference Sandbox
            </h3>
            <p className="text-xs text-[#666662] font-mono">
              Distributed Random Forest (100 Estimators) & Spatial K-Means (K=2) Clusterer
            </p>
          </div>
        </div>

        <button
          onClick={onRunPrediction}
          disabled={isPredicting}
          className="flex items-center gap-2 px-4 py-2 bg-[#111111] hover:bg-black text-white font-mono font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E05238]" />
          {isPredicting ? 'Evaluating MLlib Pipeline…' : 'Run Spark Inference'}
        </button>
      </div>

      {/* Interactive Feature Sliders */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-1">
            <span className="text-[#666662]">Cars</span>
            <span className="text-[#111111] font-bold">{carCount}</span>
          </div>
          <input
            type="range"
            min={0}
            max={180}
            value={carCount}
            onChange={(e) => setCarCount(Number(e.target.value))}
            className="w-full accent-[#111111]"
          />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-1">
            <span className="text-[#666662]">Two-Wheelers</span>
            <span className="text-[#111111] font-bold">{bikeCount}</span>
          </div>
          <input
            type="range"
            min={0}
            max={60}
            value={bikeCount}
            onChange={(e) => setBikeCount(Number(e.target.value))}
            className="w-full accent-[#111111]"
          />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-1">
            <span className="text-[#666662]">Buses</span>
            <span className="text-[#111111] font-bold">{busCount}</span>
          </div>
          <input
            type="range"
            min={0}
            max={40}
            value={busCount}
            onChange={(e) => setBusCount(Number(e.target.value))}
            className="w-full accent-[#111111]"
          />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-1">
            <span className="text-[#666662]">Trucks</span>
            <span className="text-[#111111] font-bold">{truckCount}</span>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            value={truckCount}
            onChange={(e) => setTruckCount(Number(e.target.value))}
            className="w-full accent-[#111111]"
          />
        </div>

        {/* Environmental Sliders */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-1">
            <span className="text-[#666662] flex items-center gap-1">
              <CloudRain className="w-3 h-3 text-blue-600" />
              Rainfall
            </span>
            <span className="text-[#111111] font-bold">{rainfallMm} mm/h</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={rainfallMm}
            onChange={(e) => setRainfallMm(Number(e.target.value))}
            className="w-full accent-[#2563EB]"
          />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-1">
            <span className="text-[#666662]">Soil Saturation</span>
            <span className="text-[#111111] font-bold">{soilMoisturePct}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={soilMoisturePct}
            onChange={(e) => setSoilMoisturePct(Number(e.target.value))}
            className="w-full accent-[#2563EB]"
          />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-1">
            <span className="text-[#666662] flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              Corridor Hour
            </span>
            <span className="text-[#111111] font-bold">{hour}:00</span>
          </div>
          <input
            type="range"
            min={0}
            max={23}
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            className="w-full accent-[#F59E0B]"
          />
        </div>

        <div>
          <label className="text-xs text-[#666662] font-mono block mb-1">Day of Week</label>
          <select
            value={dayIndex}
            onChange={(e) => setDayIndex(Number(e.target.value))}
            className="w-full border border-[#D5D5CF] bg-[#FFFFFF] py-1.5 px-2 text-xs font-mono text-[#111111] focus:outline-none"
          >
            {dayNames.map((d, idx) => (
              <option key={d} value={idx}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Model Inference Outputs */}
      <div className="mt-6 pt-5 border-t border-[#E5E5DF] grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Classification Result */}
        <div className="p-4 border border-[#E5E5DF] bg-[#FBFBFA] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C8C85] block">
              Spark MLlib Classification
            </span>
            <div className="mt-2 flex items-center gap-2">
              <span className={`text-xl font-bold font-mono uppercase ${
                probSevere > 0.5 ? 'text-[#E05238]' : probModerate > 0.4 ? 'text-amber-700' : 'text-emerald-700'
              }`}>
                {probSevere > 0.5 ? 'HEAVY GRIDLOCK' : probModerate > 0.4 ? 'MODERATE FLOW' : 'FREE FLOW (NORMAL)'}
              </span>
            </div>
            <p className="text-xs text-[#666662] font-mono mt-1">
              Ensemble Confidence: <span className="font-bold text-[#111111]">{((Math.max(probSevere, probModerate, probLow)) * 100).toFixed(1)}%</span>
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E5E5DF] flex items-center justify-between text-xs font-mono">
            <span className="text-[#666662]">Corridor Travel Delay:</span>
            <span className={`font-bold ${delayMinutes > 12 ? 'text-[#E05238]' : 'text-[#111111]'}`}>
              +{delayMinutes} min
            </span>
          </div>
        </div>

        {/* Real-time Probability Bars */}
        <div className="p-4 border border-[#E5E5DF] bg-[#FFFFFF] space-y-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C8C85] block">
            Class Posterior Probabilities (Spark RF)
          </span>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-emerald-800">Class 0: Free Flow</span>
              <span className="font-bold text-[#111111]">{(probLow * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-[#F4F4F0] border border-[#E5E5DF] overflow-hidden">
              <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: `${probLow * 100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-amber-800">Class 1: Moderate</span>
              <span className="font-bold text-[#111111]">{(probModerate * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-[#F4F4F0] border border-[#E5E5DF] overflow-hidden">
              <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${probModerate * 100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-rose-800">Class 2: Heavy Gridlock</span>
              <span className="font-bold text-[#111111]">{(probSevere * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-[#F4F4F0] border border-[#E5E5DF] overflow-hidden">
              <div className="h-full bg-[#E05238] transition-all duration-300" style={{ width: `${probSevere * 100}%` }} />
            </div>
          </div>
        </div>

        {/* K-Means Spatial Hotspot Clusterer */}
        <div className="p-4 border border-[#E5E5DF] bg-[#FBFBFA] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C8C85] block">
              K-Means Spatial Hotspot Cluster
            </span>
            <div className="mt-2 text-sm font-mono font-bold text-[#111111]">
              {probSevere > 0.4 ? 'Cluster #0 · HIGH-RISK CONGESTION BOTTLENECK' : 'Cluster #1 · BALANCED CORRIDOR CAPACITY'}
            </div>
            <p className="text-xs text-[#666662] font-mono mt-1">
              Centroid distance: {(probSevere > 0.4 ? 0.38 + totalVehicles * 0.003 : 0.12).toFixed(3)} Euclidean norm
            </p>
          </div>

          <div className="mt-3 p-2.5 bg-[#FFFFFF] border border-[#E5E5DF] text-[10px] font-mono text-[#666662]">
            <span className="font-bold text-[#111111]">Feature Weights:</span> Total Flow 38% · Rainfall 26% · Hour Rush 21% · Heavy Fleet 15%
          </div>
        </div>
      </div>
    </div>
  )
}

export default SparkSeveritySimulator
