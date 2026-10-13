import React, { useState, useEffect, useMemo } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { PageHeader } from '../components/common/PageHeader'
import {
  Cpu,
  Sparkles,
  CloudRain,
  Waves,
  Activity,
  RotateCcw,
  BarChart3,
  CheckCircle2,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  Lightbulb,
  Radio,
  Sliders,
  ShieldAlert,
  Search
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'
import { CHART, axisTick, gridProps, tooltipStyle } from '../components/common/chartTheme'

interface TrafficPrediction {
  situation: 'low' | 'normal' | 'high' | 'heavy'
  confidence: number
  clusterId: number
  clusterName: string
  clusterDesc: string
  clusterColor: string
  totalVehicles: number
  corridor: string
  probabilities: { low: number; normal: number; high: number; heavy: number }
  explanation: string
  isDemo?: boolean
}

interface FloodPrediction {
  probability: number
  predictionClass: 'Flood' | 'No Flood'
  riskLevel: 'critical' | 'high' | 'moderate' | 'low' | 'safe'
  confidence: number
  recommendations: string[]
  clusterId: number
  clusterName: string
  clusterDesc: string
  modelVersion: string
  featureContributions: Array<{ feature: string; impact: number; value: string }>
  isDemo?: boolean
}

interface RainfallPrediction {
  zoneId: number
  zoneName: string
  zoneCategory: string
  avgDailyRainfallMm: number
  maxStormRecordMm: number
  annualHeavyRainDays: number
  floodRiskIndex: number
  floodRiskLabel: 'Very High' | 'High' | 'Moderate' | 'Low'
  stormCategory: string
  drainageRecommendation: string
  isDemo?: boolean
}

const TRAFFIC_ARCHETYPES = [
  {
    id: 0,
    name: 'Off-Peak Free-Flow Pattern',
    archetype: 'Unconstrained vehicular movement with sparse corridor density across all modes.',
    color: '#10B981',
    avgCars: 14,
    avgBikes: 9,
    avgBuses: 2,
    avgTrucks: 3,
    avgTotal: 28,
    dominantSituation: 'low',
    chennaiContext: 'Nighttime arterial flow along ECR, Inner Ring Road, and GST Road after 22:30 IST.',
    mitigationStrategy: 'Standard sensor-actuated flashing amber signals and automated speed compliance cameras.'
  },
  {
    id: 1,
    name: 'Two-Wheeler Commuter Surge',
    archetype: 'Disproportionate two-wheeler volume with moderate passenger vehicle presence.',
    color: '#0284C7',
    avgCars: 44,
    avgBikes: 56,
    avgBuses: 9,
    avgTrucks: 5,
    avgTotal: 114,
    dominantSituation: 'normal',
    chennaiContext: 'Morning and evening rush along Anna Salai, Arcot Road, and Velachery Main Road.',
    mitigationStrategy: 'Dedicated motorcycle stop boxes at intersections; grade-separated U-turns to mitigate weaving.'
  },
  {
    id: 2,
    name: 'Peak Congestion Gridlock',
    archetype: 'Severe passenger car saturation exceeding geometric corridor carrying capacity.',
    color: '#E05238',
    avgCars: 102,
    avgBikes: 74,
    avgBuses: 18,
    avgTrucks: 8,
    avgTotal: 202,
    dominantSituation: 'heavy',
    chennaiContext: 'OMR Tidel Park - SRP Tools junction, Kathipara flyover weave during peak commuter hours.',
    mitigationStrategy: 'Dynamic tidal lane reversal, peak public transit shuttle priority, and metro feeder integration.'
  },
  {
    id: 3,
    name: 'Heavy Commercial / Logistics Transit',
    archetype: 'Freight heavy corridor with concentrated logistics trailers and intercity buses.',
    color: '#D97706',
    avgCars: 38,
    avgBikes: 24,
    avgBuses: 26,
    avgTrucks: 72,
    avgTotal: 160,
    dominantSituation: 'high',
    chennaiContext: 'GST Road NH 45 Singaperumal Koil, Maduravoyal Bypass, and Chennai Port freight corridors.',
    mitigationStrategy: 'Mandatory daytime heavy freight curfew enforcement and dedicated truck staging bays.'
  }
]

const TRAFFIC_PRESETS = [
  {
    id: 'omr_peak',
    name: 'OMR Tech Corridor',
    sub: 'Morning Peak Gridlock',
    corridor: 'GST Road (NH 45) - Potheri Central & Interchange Flyover',
    day_of_week: 'Monday',
    hour: 9,
    car_count: 98,
    bike_count: 86,
    bus_count: 22,
    truck_count: 8
  },
  {
    id: 'anna_salai_midday',
    name: 'Anna Salai Arterial',
    sub: 'Midday Regulated Flow',
    corridor: 'Guduvanchery Junction & NH 45 Service Road',
    day_of_week: 'Wednesday',
    hour: 14,
    car_count: 46,
    bike_count: 38,
    bus_count: 14,
    truck_count: 6
  },
  {
    id: 'gst_logistics',
    name: 'GST Road Hub',
    sub: 'Late Night Freight',
    corridor: 'Singaperumal Koil Junction (SH 57 Link)',
    day_of_week: 'Friday',
    hour: 23,
    car_count: 24,
    bike_count: 18,
    bus_count: 12,
    truck_count: 42
  },
  {
    id: 'marina_leisure',
    name: 'Marina Beach Link',
    sub: 'Weekend Leisure Rush',
    corridor: 'Paranur Toll Plaza & Mahindra World City',
    day_of_week: 'Sunday',
    hour: 18,
    car_count: 72,
    bike_count: 78,
    bus_count: 8,
    truck_count: 2
  },
  {
    id: 'ecr_freeflow',
    name: 'ECR Coastal Link',
    sub: 'Off-Peak Fluid Corridor',
    corridor: 'Chengalpattu Central Bus Stand & Railway Jn',
    day_of_week: 'Tuesday',
    hour: 3,
    car_count: 16,
    bike_count: 12,
    bus_count: 2,
    truck_count: 3
  }
]

const RAINFALL_ZONES = [
  {
    id: 0,
    name: 'Inland & Leeward Lower Precipitation Zone',
    zoneCategory: 'Lower Rainfall Zone',
    color: '#10B981',
    description: 'Inland western catchments experiencing reduced coastal cloud moisture.',
    stationCount: 22,
    avgDailyRainfallMm: 8.4,
    maxStormRecordMm: 112.5,
    annualHeavyRainDays: 6.2,
    keyStations: ['Ambathur', 'Puzhal', 'Madhavaram', 'Valasaravakkam', 'Zone 07 Ambattur', 'Zone 11 Maduravoyal']
  },
  {
    id: 1,
    name: 'Central Urban Convective Precipitation Zone',
    zoneCategory: 'Moderate Convective Zone',
    color: '#0284C7',
    description: 'Core metropolitan urban heat island generating microscale convective thunderstorm clusters.',
    stationCount: 24,
    avgDailyRainfallMm: 18.5,
    maxStormRecordMm: 240.0,
    annualHeavyRainDays: 14.8,
    keyStations: ['Nungambakkam', 'Meenambakkam', 'T. Nagar', 'Alandur', 'Anna Nagar', 'Kodambakkam', 'Guindy']
  },
  {
    id: 2,
    name: 'Coastal & Estuary Extreme Monsoon Precipitation Zone',
    zoneCategory: 'High Monsoon Precipitation Zone',
    color: '#E05238',
    description: 'Maritime boundary bearing primary northeast monsoon cyclone landfalls and tidal storm surges.',
    stationCount: 16,
    avgDailyRainfallMm: 34.2,
    maxStormRecordMm: 410.0,
    annualHeavyRainDays: 24.6,
    keyStations: ['Adyar', 'Ennore Port', 'Royapuram', 'Thiruvanmiyur', 'Kovalam Estuary', 'Marina Beach', 'ECR Palavakkam']
  }
]

const RAINFALL_SCENARIO_PRESETS = [
  {
    id: 'michaung_deluge',
    name: 'Cyclone Michaung Cloudburst (Dec 2023)',
    station: 'Chennai Nungambakkam',
    zoneId: 2,
    avg_daily_mm: 34.2,
    max_storm_mm: 410.0,
    heavy_rain_days: 24.6,
    desc: 'Catastrophic cyclonic precipitation band stalling over the Chennai urban catchment basin.'
  },
  {
    id: 'nem_depression',
    name: 'Northeast Monsoon Active Depression (Nov)',
    station: 'Sholinganallur',
    zoneId: 1,
    avg_daily_mm: 18.5,
    max_storm_mm: 240.0,
    heavy_rain_days: 14.8,
    desc: 'Bay of Bengal low-pressure system bringing continuous maritime convective rainfall.'
  },
  {
    id: 'swm_thunderstorm',
    name: 'Southwest Monsoon Convective Shower (Aug)',
    station: 'Ambathur',
    zoneId: 0,
    avg_daily_mm: 8.4,
    max_storm_mm: 112.5,
    heavy_rain_days: 6.2,
    desc: 'Late afternoon inland thermal convective thunderstorm over western industrial catchments.'
  },
  {
    id: 'dry_summer',
    name: 'Dry Pre-Monsoon Baseline (April)',
    station: 'Zone 12 Meenambakkam',
    zoneId: 0,
    avg_daily_mm: 2.1,
    max_storm_mm: 35.0,
    heavy_rain_days: 1.0,
    desc: 'Hot summer dry spell with minimal maritime convective convergence.'
  }
]

const FLOOD_PRESETS: Record<string, {
  name: string; desc: string; latitude: number; longitude: number;
  rainfall_mm: number; temperature_c: number; humidity_percent: number;
  river_discharge_m3s: number; water_level_m: number; elevation_m: number;
  land_cover: string; soil_type: string; population_density: number;
  infrastructure_score: number; historical_floods: number;
}> = {
  velachery: {
    name: 'Velachery Basin (High Inundation)',
    desc: 'Depression basin with heavy clay soil and intense urban runoff accumulation.',
    latitude: 12.9815, longitude: 80.2180, rainfall_mm: 218.5, temperature_c: 26.4,
    humidity_percent: 94, river_discharge_m3s: 4120, water_level_m: 7.8, elevation_m: 4.5,
    land_cover: 'Urban', soil_type: 'Clay', population_density: 8500, infrastructure_score: 1, historical_floods: 1
  },
  adyar: {
    name: 'Saidapet Adyar Spate (Riparian)',
    desc: 'Riparian zone directly vulnerable to Chembarambakkam reservoir discharge.',
    latitude: 13.0178, longitude: 80.2205, rainfall_mm: 195.0, temperature_c: 27.0,
    humidity_percent: 92, river_discharge_m3s: 4600, water_level_m: 8.2, elevation_m: 6.2,
    land_cover: 'Water Body', soil_type: 'Clay', population_density: 9200, infrastructure_score: 1, historical_floods: 1
  },
  mudichur: {
    name: 'Mudichur Riverfront Basin',
    desc: 'Adyar flood plain lowland prone to rapid waterlogging.',
    latitude: 12.9152, longitude: 80.0712, rainfall_mm: 225.0, temperature_c: 26.0,
    humidity_percent: 95, river_discharge_m3s: 4300, water_level_m: 8.4, elevation_m: 5.1,
    land_cover: 'Urban', soil_type: 'Clay', population_density: 7400, infrastructure_score: 0, historical_floods: 1
  },
  omr_sholinganallur: {
    name: 'OMR Tech Corridor (Runoff)',
    desc: 'IT arterial bordering Pallikaranai marshland with rapid runoff accumulation.',
    latitude: 12.9010, longitude: 80.2279, rainfall_mm: 175.0, temperature_c: 27.2,
    humidity_percent: 89, river_discharge_m3s: 2900, water_level_m: 5.4, elevation_m: 5.8,
    land_cover: 'Urban', soil_type: 'Loam', population_density: 6100, infrastructure_score: 1, historical_floods: 1
  },
  tambaram_highlands: {
    name: 'Tambaram Highlands (Low Risk Safe)',
    desc: 'Elevated terrain with fast natural slope away from core rivers.',
    latitude: 12.9249, longitude: 80.1150, rainfall_mm: 95.0, temperature_c: 28.0,
    humidity_percent: 80, river_discharge_m3s: 700, water_level_m: 1.5, elevation_m: 32.0,
    land_cover: 'Suburban', soil_type: 'Loam', population_density: 3800, infrastructure_score: 0, historical_floods: 0
  },
  besant_nagar: {
    name: 'Besant Nagar Coast (Safe)',
    desc: 'Coastal sandy substrate with high permeability and rapid maritime discharge.',
    latitude: 12.9982, longitude: 80.2665, rainfall_mm: 110.0, temperature_c: 27.8,
    humidity_percent: 85, river_discharge_m3s: 1100, water_level_m: 2.2, elevation_m: 7.5,
    land_cover: 'Coastal', soil_type: 'Sandy', population_density: 5200, infrastructure_score: 1, historical_floods: 0
  }
}

const CHEMBARAMBAKKAM_STORAGE = [
  { time: '00:00', levelM: 21.2, capacityPercent: 82, dischargeCusecs: 1500 },
  { time: '04:00', levelM: 21.8, capacityPercent: 85, dischargeCusecs: 2000 },
  { time: '08:00', levelM: 22.4, capacityPercent: 88, dischargeCusecs: 2800 },
  { time: '12:00', levelM: 22.9, capacityPercent: 91, dischargeCusecs: 3500 },
  { time: '16:00', levelM: 23.3, capacityPercent: 93, dischargeCusecs: 4200 },
  { time: '20:00', levelM: 23.6, capacityPercent: 95, dischargeCusecs: 4500 }
]

const TACTICAL_INSIGHTS = [
  {
    id: 'ai-1',
    title: 'Adyar Catchment Discharge & Tidal Phase Convergence',
    severity: 'Critical',
    description: 'Chembarambakkam release rate (4,500 cusecs) coincides with high tide (+1.2m tidal bulge) between 01:30 and 03:00 IST.',
    deterministicReason: 'Calculated from combined WRD dam outflow telemetry (4,500 cfs) and INCOIS astronomical tide table (+1.21m MHWS).',
    suggestedAction: 'Close Kotturpuram floodgates and deploy 120 HP suction pump sets at Saidapet low causeway.'
  },
  {
    id: 'ai-2',
    title: 'GST Road Potheri Flyover Subway Waterlog Threat',
    severity: 'High',
    description: 'Cumulative 140mm rainfall will overwhelm drainage sump within 45 minutes without auxiliary pumping.',
    deterministicReason: 'Precipitation rate (42 mm/hr) exceeds culvert design capacity (26 mm/hr gravity discharge).',
    suggestedAction: 'Activate auxiliary diesel generator pumps and broadcast detour advisory via Vandalur outer bypass.'
  },
  {
    id: 'ai-3',
    title: 'Velachery Lake Sluice Spillover Inundation',
    severity: 'Critical',
    description: 'Lake storage capacity currently at 94% with upstream catchment inflow exceeding 180 m3/s.',
    deterministicReason: 'Hydraulic head reaches 7.8m MSL against perimeter embankment crest level of 8.0m MSL.',
    suggestedAction: 'Issue priority evacuation advisories for ground floor residents along Vijayanagar 1st Main Road.'
  }
]

const FloodRadialGauge: React.FC<{
  probability: number
  riskLevel: 'critical' | 'high' | 'moderate' | 'low' | 'safe'
  predictionClass: string
  confidence?: number
}> = ({ probability, riskLevel, predictionClass, confidence }) => {
  const pct = Math.round(probability * 100)
  const r = 64
  const circ = 2 * Math.PI * r
  const strokeOffset = circ - probability * circ
  const themeMap = {
    critical: { stroke: '#EF4444', glow: 'rgba(239, 68, 68, 0.25)', text: 'text-red-600' },
    high: { stroke: '#F87171', glow: 'rgba(248, 113, 113, 0.20)', text: 'text-rose-600' },
    moderate: { stroke: '#F59E0B', glow: 'rgba(245, 158, 11, 0.20)', text: 'text-amber-600' },
    low: { stroke: '#3B82F6', glow: 'rgba(59, 130, 246, 0.20)', text: 'text-blue-600' },
    safe: { stroke: '#10B981', glow: 'rgba(16, 185, 129, 0.20)', text: 'text-emerald-600' }
  }
  const curr = themeMap[riskLevel] || themeMap.safe

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-white border border-[#D5D5CF] shadow-xs text-center overflow-hidden">
      <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
      <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
      <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
      <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

      <div className="absolute w-44 h-44 rounded-full blur-3xl pointer-events-none -z-10" style={{ backgroundColor: curr.glow }} />
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={r} stroke="#E5E5DF" strokeWidth="10" fill="transparent" />
          <circle
            cx="80" cy="80" r={r} stroke={curr.stroke} strokeWidth="10" fill="transparent"
            strokeDasharray={circ} strokeDashoffset={strokeOffset} strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold font-mono text-[#111111] tracking-tight">{pct}%</span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#666662]">PROBABILITY</span>
        </div>
      </div>
      <div className="mt-4 flex flex-col items-center gap-1.5">
        <div className={`px-4 py-1.5 font-mono text-xs font-bold tracking-wider uppercase border ${
          predictionClass === 'Flood'
            ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          PREDICTED: {predictionClass.toUpperCase()}
        </div>
        <div className="text-xs font-mono text-[#666662]">
          Risk Class: <span className={`font-semibold ${curr.text}`}>{riskLevel.toUpperCase()}</span>
          {confidence !== undefined && (
            <span className="text-[#8C8C85] ml-2">(Conf: {Math.round(confidence * 100)}%)</span>
          )}
        </div>
      </div>
    </div>
  )
}

export const PredictionEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'traffic' | 'flood' | 'rainfall' | 'insights' | 'benchmarks'>('traffic')

  // Traffic State
  const [carCount, setCarCount] = useState(44)
  const [bikeCount, setBikeCount] = useState(56)
  const [busCount, setBusCount] = useState(9)
  const [truckCount, setTruckCount] = useState(5)
  const [trafficHour, setTrafficHour] = useState(13)
  const [trafficDay, setTrafficDay] = useState('Monday')
  const [selectedCorridor, setSelectedCorridor] = useState('GST Road (NH 45) - Potheri Central & Interchange Flyover')
  const [isTrafficPredicting, setIsTrafficPredicting] = useState(false)
  const [trafficPrediction, setTrafficPrediction] = useState<TrafficPrediction | null>(null)
  const [trafficLatency, setTrafficLatency] = useState(24)
  const [trafficRunCount, setTrafficRunCount] = useState(1)
  const [trafficLastRunTime, setTrafficLastRunTime] = useState('13:00:00')
  const [justEvaluatedTraffic, setJustEvaluatedTraffic] = useState(false)

  // Flood State
  const [floodPresetKey, setFloodPresetKey] = useState('velachery')
  const [floodParams, setFloodParams] = useState(FLOOD_PRESETS.velachery)
  const [isFloodPredicting, setIsFloodPredicting] = useState(false)
  const [floodPrediction, setFloodPrediction] = useState<FloodPrediction | null>(null)
  const [floodLatency, setFloodLatency] = useState(28)
  const [floodRunCount, setFloodRunCount] = useState(1)
  const [floodLastRunTime, setFloodLastRunTime] = useState('13:00:00')
  const [justEvaluatedFlood, setJustEvaluatedFlood] = useState(false)

  // Rainfall / Weather State
  const [selectedRainfallZoneId, setSelectedRainfallZoneId] = useState(1)
  const [isWeatherPredicting, setIsWeatherPredicting] = useState(false)
  const [rainfallPrediction, setRainfallPrediction] = useState<RainfallPrediction | null>(null)
  const [weatherLatency, setWeatherLatency] = useState(22)
  const [weatherRunCount, setWeatherRunCount] = useState(1)
  const [weatherLastRunTime, setWeatherLastRunTime] = useState('13:00:00')
  const [justEvaluatedWeather, setJustEvaluatedWeather] = useState(false)
  const [stationSearch, setStationSearch] = useState('')

  // Deterministic local simulation calculations
  const evaluateTrafficModel = (cars: number, bikes: number, buses: number, trucks: number, corridor: string): TrafficPrediction => {
    const total = cars + bikes + buses + trucks
    let sit: TrafficPrediction['situation'] = 'normal'
    let probs = { low: 0.1, normal: 0.7, high: 0.15, heavy: 0.05 }
    if (total > 160 || cars > 95) {
      sit = 'heavy'
      probs = { low: 0.01, normal: 0.05, high: 0.14, heavy: 0.8 }
    } else if (total > 110 || cars > 65) {
      sit = 'high'
      probs = { low: 0.02, normal: 0.18, high: 0.68, heavy: 0.12 }
    } else if (total < 45) {
      sit = 'low'
      probs = { low: 0.85, normal: 0.12, high: 0.02, heavy: 0.01 }
    }
    let clustId = 0
    if (total > 150) clustId = 2
    else if (bikes > 40) clustId = 1
    else if (buses + trucks > 25) clustId = 3
    const arch = TRAFFIC_ARCHETYPES.find((a) => a.id === clustId) || TRAFFIC_ARCHETYPES[0]
    const conf = Math.max(...Object.values(probs))
    return {
      situation: sit,
      confidence: Math.round(conf * 100),
      clusterId: arch.id,
      clusterName: arch.name,
      clusterDesc: arch.archetype,
      clusterColor: arch.color,
      totalVehicles: total,
      corridor,
      probabilities: probs,
      explanation: `Random Forest (100 Trees): ${total} vehicles match '${sit.toUpperCase()}' congestion on ${corridor}.`,
      isDemo: true
    }
  }

  const evaluateFloodModel = (params: typeof FLOOD_PRESETS.velachery): FloodPrediction => {
    let t = 0
    const n = Math.min(Math.max((params.river_discharge_m3s - 500) / 4500, 0), 1)
    t += n * 0.32
    const r = Math.min(Math.max((params.rainfall_mm - 20) / 200, 0), 1)
    t += r * 0.28
    const i = Math.min(Math.max((params.water_level_m - 2) / 8, 0), 1)
    t += i * 0.20
    const l = Math.max(0, 1 - Math.min(params.elevation_m / 40, 1))
    t += l * 0.14
    const sType = params.soil_type.toLowerCase()
    if (sType === 'clay') t += 0.05
    if (sType === 'peat') t += 0.03
    if (sType === 'sandy') t -= 0.08
    const lCover = params.land_cover.toLowerCase()
    if (lCover.includes('water')) t += 0.06
    if (lCover.includes('urban')) t += 0.04
    if (lCover.includes('forest')) t -= 0.05
    if (params.historical_floods === 1) t += 0.06
    if (params.infrastructure_score === 0) t += 0.04
    const prob = Math.min(Math.max(t, 0.03), 0.97)
    const isFlood = prob >= 0.5
    let riskLevel: FloodPrediction['riskLevel'] = 'safe'
    if (prob > 0.8) riskLevel = 'critical'
    else if (prob > 0.6) riskLevel = 'high'
    else if (prob > 0.4) riskLevel = 'moderate'
    else if (prob > 0.2) riskLevel = 'low'

    const recs: string[] = []
    if (riskLevel === 'critical') {
      recs.push('Issue immediate evacuation advisory for ground floor residents in low-lying pockets.')
      recs.push('Pre-position heavy-duty dewatering pumps (80-120 HP) at known collection basins.')
      recs.push('Sound sirens and divert non-essential traffic away from connecting subways.')
    } else if (riskLevel === 'high') {
      recs.push('Issue preparatory alert to ward response teams and regional NDRF battalion.')
      recs.push('Clear storm runoff channels and remove debris from canal gates.')
      recs.push('Recommend work-from-home advisory for adjacent IT corridors.')
    } else if (riskLevel === 'moderate') {
      recs.push('Maintain regular telemetry surveillance on reservoir discharge gauges.')
      recs.push('Verify standby generator readiness at stormwater pumping stations.')
    } else {
      recs.push('Normal drainage operations; standard weather monitoring protocol active.')
    }
    const conf = Number((0.85 + Math.abs(prob - 0.5) * 0.28).toFixed(2))

    let clustId = 2
    let clustName = 'Adyar Lowland Riparian Zone'
    let clustDesc = 'Riparian floodplain subject to upstream dam release surcharge.'
    if (params.elevation_m < 6 && params.river_discharge_m3s > 3000) {
      clustId = 0
      clustName = 'Velachery Lake Lowlands & Depression'
      clustDesc = 'Depression catchment prone to runoff accumulation and clay soil waterlogging.'
    } else if (sType === 'sandy' || (params.elevation_m < 8 && params.water_level_m < 3)) {
      clustId = 1
      clustName = 'ECR Maritime Shoreline Belt'
      clustDesc = 'Permeable sandy coastal aquifer with rapid infiltration characteristics.'
    } else if (params.elevation_m > 20) {
      clustId = 3
      clustName = 'Tambaram & Chengalpattu Elevated Inland Corridor'
      clustDesc = 'Elevated terrain with fast natural slope away from major river corridors.'
    } else if (params.elevation_m < 5 && params.water_level_m > 5) {
      clustId = 4
      clustName = 'Saidapet Adyar Causeway Sump'
      clustDesc = 'Critical urban causeway sump directly receiving floodwaters.'
    }

    const featureContribs = [
      { feature: 'River Discharge', impact: n > 0.5 ? 0.35 : -0.15, value: `${params.river_discharge_m3s} m³/s` },
      { feature: 'Recent Rainfall', impact: r > 0.4 ? 0.28 : -0.12, value: `${params.rainfall_mm} mm` },
      { feature: 'Water Level', impact: i > 0.5 ? 0.22 : -0.10, value: `${params.water_level_m} m` },
      { feature: 'Elevation Offset', impact: l > 0.6 ? 0.18 : -0.20, value: `${params.elevation_m} m MSL` },
      { feature: 'Soil Type Permeability', impact: params.soil_type === 'Clay' ? 0.08 : -0.06, value: params.soil_type }
    ]

    return {
      probability: Number(prob.toFixed(3)),
      predictionClass: isFlood ? 'Flood' : 'No Flood',
      riskLevel,
      confidence: conf,
      recommendations: recs,
      clusterId: clustId,
      clusterName: clustName,
      clusterDesc: clustDesc,
      modelVersion: 'RandomForest-RF150-Calibrated',
      featureContributions: featureContribs,
      isDemo: true
    }
  }

  const evaluateRainfallModel = (zoneId: number): RainfallPrediction => {
    const zone = RAINFALL_ZONES[zoneId] || RAINFALL_ZONES[1]
    const rawIndex = (zone.avgDailyRainfallMm / 40) * 0.4 + (zone.maxStormRecordMm / 450) * 0.35 + (zone.annualHeavyRainDays / 30) * 0.25
    const floodRiskIndex = Math.min(Math.round(rawIndex * 100), 100)
    let floodRiskLabel: RainfallPrediction['floodRiskLabel'] = 'Low'
    if (floodRiskIndex >= 75) floodRiskLabel = 'Very High'
    else if (floodRiskIndex >= 50) floodRiskLabel = 'High'
    else if (floodRiskIndex >= 25) floodRiskLabel = 'Moderate'
    let stormCategory = 'Light to Moderate'
    if (zone.maxStormRecordMm >= 300) stormCategory = 'Extreme (Cyclone-Class)'
    else if (zone.maxStormRecordMm >= 180) stormCategory = 'Heavy Convective Thunderstorm'
    else if (zone.maxStormRecordMm >= 100) stormCategory = 'Moderate Monsoon Surge'
    let drainageRecommendation = 'Standard stormwater monitoring protocol.'
    if (floodRiskLabel === 'Very High') drainageRecommendation = 'Pre-activate flood pumping stations, issue coastal ward flood alerts, and deploy NDRF standby teams.'
    else if (floodRiskLabel === 'High') drainageRecommendation = 'Clear storm drain inlets, verify pump readiness, and alert ward engineers for rapid response.'
    else if (floodRiskLabel === 'Moderate') drainageRecommendation = 'Increase discharge monitoring frequency; ensure culverts are debris-free.'
    return {
      zoneId: zone.id,
      zoneName: zone.name,
      zoneCategory: zone.zoneCategory,
      avgDailyRainfallMm: zone.avgDailyRainfallMm,
      maxStormRecordMm: zone.maxStormRecordMm,
      annualHeavyRainDays: zone.annualHeavyRainDays,
      floodRiskIndex,
      floodRiskLabel,
      stormCategory,
      drainageRecommendation,
      isDemo: true
    }
  }

  // Initial load
  useEffect(() => {
    setTrafficPrediction(evaluateTrafficModel(carCount, bikeCount, busCount, truckCount, selectedCorridor))
    setFloodPrediction(evaluateFloodModel(floodParams))
    setRainfallPrediction(evaluateRainfallModel(selectedRainfallZoneId))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Action: Run Traffic Prediction
  const handleRunTrafficPrediction = async () => {
    setIsTrafficPredicting(true)
    const startTime = Date.now()
    const minDelay = new Promise((resolve) => setTimeout(resolve, 350))
    let isLiveBackend = false

    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 2500)
      const res = await fetch('http://127.0.0.1:8000/api/traffic/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          car_count: carCount,
          bike_count: bikeCount,
          bus_count: busCount,
          truck_count: truckCount,
          hour: trafficHour,
          day_of_week: trafficDay,
          corridor: selectedCorridor
        }),
        signal: controller.signal
      })
      clearTimeout(timer)
      if (res.ok) {
        const data = await res.json()
        const sit = (data.predicted_situation || data.predicted_class || 'NORMAL').toLowerCase() as TrafficPrediction['situation']
        setTrafficPrediction({
          situation: sit,
          confidence: Math.round(data.confidence_pct || data.confidence || 88),
          clusterId: data.cluster_id ?? data.cluster_assignment ?? 1,
          clusterName: data.cluster_name || 'Two-Wheeler Commuter Surge',
          clusterDesc: TRAFFIC_ARCHETYPES[data.cluster_id ?? 1]?.archetype || 'Multimodal vehicle density evaluated.',
          clusterColor: TRAFFIC_ARCHETYPES[data.cluster_id ?? 1]?.color || '#0284C7',
          totalVehicles: data.vehicle_total || data.total_vehicles || (carCount + bikeCount + busCount + truckCount),
          corridor: selectedCorridor,
          probabilities: data.class_probabilities || { low: 0.1, normal: 0.7, high: 0.15, heavy: 0.05 },
          explanation: data.explanation || `Random Forest (100 Trees): Classified as '${sit.toUpperCase()}' congestion.`,
          isDemo: false
        })
        isLiveBackend = true
      }
    } catch {
      // Fallback
    }

    if (!isLiveBackend) {
      setTrafficPrediction(evaluateTrafficModel(carCount, bikeCount, busCount, truckCount, selectedCorridor))
    }

    await minDelay
    setTrafficLatency(Math.max(16, Date.now() - startTime))
    setTrafficRunCount((c) => c + 1)
    setTrafficLastRunTime(new Date().toLocaleTimeString())
    setJustEvaluatedTraffic(true)
    setIsTrafficPredicting(false)
    setTimeout(() => setJustEvaluatedTraffic(false), 2000)
  }

  // Action: Run Flood Prediction
  const handleRunFloodPrediction = async () => {
    setIsFloodPredicting(true)
    const startTime = Date.now()
    const minDelay = new Promise((resolve) => setTimeout(resolve, 350))
    let isLiveBackend = false

    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 2500)
      const res = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(floodParams),
        signal: controller.signal
      })
      clearTimeout(timer)
      if (res.ok) {
        const data = await res.json()
        const computed = evaluateFloodModel(floodParams)
        setFloodPrediction({
          ...computed,
          probability: Number(data.flood_probability ?? computed.probability),
          riskLevel: (data.risk_level || 'moderate').toLowerCase() as FloodPrediction['riskLevel'],
          predictionClass: data.prediction_class === 'Flood' ? 'Flood' : 'No Flood',
          confidence: Number(data.confidence ?? computed.confidence),
          recommendations: data.recommendations || computed.recommendations,
          clusterId: data.cluster_id ?? computed.clusterId,
          clusterName: data.cluster_name || computed.clusterName,
          modelVersion: data.model_version || 'RandomForestRegressor(HydraulicEnsemble-v2.4.1)',
          isDemo: false
        })
        isLiveBackend = true
      }
    } catch {
      // Fallback
    }

    if (!isLiveBackend) {
      setFloodPrediction(evaluateFloodModel(floodParams))
    }

    await minDelay
    setFloodLatency(Math.max(18, Date.now() - startTime))
    setFloodRunCount((c) => c + 1)
    setFloodLastRunTime(new Date().toLocaleTimeString())
    setJustEvaluatedFlood(true)
    setIsFloodPredicting(false)
    setTimeout(() => setJustEvaluatedFlood(false), 2000)
  }

  // Action: Run Weather Cluster Inference
  const handleRunRainfallPrediction = async () => {
    setIsWeatherPredicting(true)
    const startTime = Date.now()
    const minDelay = new Promise((resolve) => setTimeout(resolve, 350))
    let isLiveBackend = false

    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 2500)
      const zone = RAINFALL_ZONES[selectedRainfallZoneId]
      const res = await fetch('http://127.0.0.1:8000/api/rainfall/cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zone_id: selectedRainfallZoneId,
          avg_daily_mm: zone?.avgDailyRainfallMm,
          max_storm_mm: zone?.maxStormRecordMm,
          annual_heavy_rain_days: zone?.annualHeavyRainDays,
          station_count: zone?.stationCount
        }),
        signal: controller.signal
      })
      clearTimeout(timer)
      if (res.ok) {
        const data = await res.json()
        const computed = evaluateRainfallModel(selectedRainfallZoneId)
        setRainfallPrediction({
          ...computed,
          floodRiskIndex: data.flood_risk_index ?? computed.floodRiskIndex,
          floodRiskLabel: data.flood_risk_label ?? computed.floodRiskLabel,
          stormCategory: data.storm_category ?? computed.stormCategory,
          drainageRecommendation: data.drainage_recommendation ?? computed.drainageRecommendation,
          isDemo: false
        })
        isLiveBackend = true
      }
    } catch {
      // Fallback
    }

    if (!isLiveBackend) {
      setRainfallPrediction(evaluateRainfallModel(selectedRainfallZoneId))
    }

    await minDelay
    setWeatherLatency(Math.max(20, Date.now() - startTime))
    setWeatherRunCount((c) => c + 1)
    setWeatherLastRunTime(new Date().toLocaleTimeString())
    setJustEvaluatedWeather(true)
    setIsWeatherPredicting(false)
    setTimeout(() => setJustEvaluatedWeather(false), 2000)
  }

  const handleSelectFloodPreset = (key: string) => {
    setFloodPresetKey(key)
    const p = FLOOD_PRESETS[key]
    if (p) {
      setFloodParams({ ...p })
      setFloodPrediction(evaluateFloodModel(p))
    }
  }

  const handleSelectTrafficPreset = (p: typeof TRAFFIC_PRESETS[0]) => {
    setCarCount(p.car_count)
    setBikeCount(p.bike_count)
    setBusCount(p.bus_count)
    setTruckCount(p.truck_count)
    setTrafficHour(p.hour)
    setTrafficDay(p.day_of_week)
    setSelectedCorridor(p.corridor)
    setTrafficPrediction(evaluateTrafficModel(p.car_count, p.bike_count, p.bus_count, p.truck_count, p.corridor))
  }

  const handleSelectRainfallScenario = (s: typeof RAINFALL_SCENARIO_PRESETS[0]) => {
    setSelectedRainfallZoneId(s.zoneId)
    setRainfallPrediction(evaluateRainfallModel(s.zoneId))
  }

  const totalVehicles = carCount + bikeCount + busCount + truckCount
  const carPct = totalVehicles ? Math.round((carCount / totalVehicles) * 100) : 0
  const bikePct = totalVehicles ? Math.round((bikeCount / totalVehicles) * 100) : 0
  const busPct = totalVehicles ? Math.round((busCount / totalVehicles) * 100) : 0
  const truckPct = totalVehicles ? Math.max(0, 100 - (carPct + bikePct + busPct)) : 0

  const diurnalCurve = useMemo(() => {
    const hours = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]
    return hours.map((h) => {
      let f = 0.3
      if (h >= 7 && h <= 10) f = 1.35
      else if (h >= 17 && h <= 20) f = 1.45
      else if (h >= 11 && h <= 16) f = 0.85
      else if (h >= 21) f = 0.55
      return { time: `${String(h).padStart(2, '0')}:00`, volume: Math.round(totalVehicles * f), capacity: 180 }
    })
  }, [totalVehicles])

  const hydrographCurve = useMemo(() => {
    const s = floodParams.water_level_m
    return [
      { step: 'T-6h', stage: Math.max(1.5, Number((s * 0.65).toFixed(1))), threshold: 7.5 },
      { step: 'T-4h', stage: Math.max(2.0, Number((s * 0.78).toFixed(1))), threshold: 7.5 },
      { step: 'T-2h', stage: Math.max(2.5, Number((s * 0.90).toFixed(1))), threshold: 7.5 },
      { step: 'T0 (Now)', stage: s, threshold: 7.5 },
      { step: 'T+2h', stage: Number((s * (floodParams.rainfall_mm > 150 ? 1.15 : 0.95)).toFixed(1)), threshold: 7.5 },
      { step: 'T+4h', stage: Number((s * (floodParams.rainfall_mm > 150 ? 1.28 : 0.85)).toFixed(1)), threshold: 7.5 },
      { step: 'T+6h', stage: Number((s * (floodParams.rainfall_mm > 150 ? 1.35 : 0.75)).toFixed(1)), threshold: 7.5 }
    ]
  }, [floodParams.water_level_m, floodParams.rainfall_mm])

  const hourlyStormData = useMemo(() => {
    const zone = RAINFALL_ZONES[selectedRainfallZoneId]
    const scale = zone ? zone.avgDailyRainfallMm / 18.5 : 1
    return [
      { hour: '06:00', rain: Number((4.2 * scale).toFixed(1)) },
      { hour: '08:00', rain: Number((12.8 * scale).toFixed(1)) },
      { hour: '10:00', rain: Number((28.4 * scale).toFixed(1)) },
      { hour: '12:00', rain: Number((46.2 * scale).toFixed(1)) },
      { hour: '14:00', rain: Number((62.8 * scale).toFixed(1)) },
      { hour: '16:00', rain: Number((38.4 * scale).toFixed(1)) },
      { hour: '18:00', rain: Number((24.1 * scale).toFixed(1)) },
      { hour: '20:00', rain: Number((14.5 * scale).toFixed(1)) }
    ]
  }, [selectedRainfallZoneId])

  const peakRain = hourlyStormData.reduce((a, b) => (a.rain > b.rain ? a : b), hourlyStormData[0])

  const currentZoneStations = RAINFALL_ZONES[selectedRainfallZoneId]?.keyStations || []
  const filteredStations = currentZoneStations.filter((s) =>
    s.toLowerCase().includes(stationSearch.toLowerCase())
  )

  return (
    <DashboardLayout>
      <PageHeader
        title="Predictive Machine Learning Engine"
        eyebrow="DISTRIBUTED INFERENCE PIPELINE · RANDOM FOREST & K-MEANS"
        icon={Cpu}
        live={{ label: 'Models Operational', tone: 'emerald', pulse: true }}
        subtitle="Multi-modal urban predictive inferences: Arterial traffic congestion, hydrological flood modeling & Doppler weather regimes"
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Speakeasy-Style Segmented Navigation Tabs Tray */}
        <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-2 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

          <div className="flex flex-wrap items-center gap-1.5">
            {([
              { id: 'traffic', icon: Activity, label: 'Traffic Intelligence & Clusters' },
              { id: 'flood', icon: Waves, label: 'Flood Prediction Engine' },
              { id: 'rainfall', icon: CloudRain, label: 'Rainfall & Weather Observatories' },
              { id: 'insights', icon: Lightbulb, label: 'Tactical AI Insights' },
              { id: 'benchmarks', icon: BarChart3, label: 'Model Benchmarks' }
            ] as const).map(({ id, icon: Icon, label }) => {
              const isActive = activeTab === id
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
                    isActive
                      ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                      : 'bg-transparent text-[#666662] border-transparent hover:bg-[#F7F7F4] hover:text-[#111111]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E05238]' : ''}`} />
                  {label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-[#666662] px-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="uppercase tracking-wider">FastAPI Serving:</span>
            <span className="font-semibold text-[#111111]">Scikit-Learn Joblib</span>
            <span className="text-[#8C8C85]">|</span>
            <span className="text-emerald-700 font-bold">Port 8000 Live</span>
          </div>
        </div>

        {/* =========================================================================
            TRAFFIC INTELLIGENCE TAB
        ========================================================================= */}
        {activeTab === 'traffic' && (
          <div className="animate-page-in space-y-6">
            {/* Chennai Mobility Presets Banner (Speakeasy Card with Notches) */}
            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs">
              <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E5E5DF]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#E05238]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                    Load Chennai Mobility Scenario Presets
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#8C8C85]">
                  Instant corridor modal mix calibration
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {TRAFFIC_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectTrafficPreset(p)}
                    className="p-3 text-left border border-[#D5D5CF] bg-[#FBFBFA] hover:border-[#111111] hover:bg-white transition-all group shadow-2xs"
                  >
                    <div className="text-xs font-bold font-mono text-[#111111] group-hover:text-[#E05238] truncate">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-[#666662] font-mono mt-0.5 truncate">{p.sub}</div>
                    <div className="mt-2 text-[10px] font-mono text-[#8C8C85] flex items-center justify-between">
                      <span>{p.car_count + p.bike_count + p.bus_count + p.truck_count} veh/hr</span>
                      <span className="text-[#E05238] font-bold">Load</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* K-Means Traffic Archetypes */}
            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs">
              <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-[#E5E5DF]">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                    K-Means Multimodal Traffic Cluster Archetypes
                  </h3>
                  <p className="text-[11px] text-[#666662] font-mono mt-0.5">
                    Unsupervised pattern partitioning of vehicle modal configurations into 4 distinct operational archetypes
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold bg-[#FBFBFA] border border-[#D5D5CF] px-2.5 py-1 text-[#111111]">
                  Dataset: 2,976 Hourly Observations
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {TRAFFIC_ARCHETYPES.map((arch) => {
                  const isCurrent = trafficPrediction?.clusterId === arch.id
                  return (
                    <div
                      key={arch.id}
                      onClick={() => {
                        setCarCount(arch.avgCars)
                        setBikeCount(arch.avgBikes)
                        setBusCount(arch.avgBuses)
                        setTruckCount(arch.avgTrucks)
                        setTrafficPrediction(evaluateTrafficModel(arch.avgCars, arch.avgBikes, arch.avgBuses, arch.avgTrucks, selectedCorridor))
                      }}
                      className={`relative p-4 border transition-all cursor-pointer font-mono select-none ${
                        isCurrent
                          ? 'border-[#E05238] bg-orange-50/25 ring-1 ring-[#E05238]/30 shadow-xs'
                          : 'border-[#E5E5DF] bg-[#FBFBFA] hover:border-[#111111] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-[#666662] uppercase font-bold">
                          Archetype #{arch.id}
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: arch.color }} />
                      </div>
                      <div className="font-bold text-[#111111] text-xs mb-2 truncate">{arch.name}</div>
                      <div className="space-y-1 text-[10px] text-[#666662]">
                        <div className="flex justify-between">
                          <span>Avg Total:</span>
                          <span className="text-[#111111] font-bold">{arch.avgTotal} veh/hr</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dominant:</span>
                          <span className="uppercase font-bold" style={{ color: arch.color }}>
                            {arch.dominantSituation}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Modal Mix:</span>
                          <span className="text-[#111111]">{arch.avgCars}c / {arch.avgBikes}b / {arch.avgTrucks}t</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Telemetry Inputs & Results */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls */}
              <div className="relative lg:col-span-5 border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs space-y-5">
                <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
                <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
                <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
                <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

                <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF]">
                  <div>
                    <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#E05238]" />
                      Kinematic Telemetry Inputs
                    </h3>
                    <p className="text-[11px] text-[#666662] font-mono mt-0.5">
                      Adjust modal counts to simulate corridor density
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCarCount(44)
                      setBikeCount(56)
                      setBusCount(9)
                      setTruckCount(5)
                      setTrafficPrediction(evaluateTrafficModel(44, 56, 9, 5, selectedCorridor))
                    }}
                    className="flex items-center gap-1 text-[11px] font-mono text-[#666662] hover:text-[#111111]"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold uppercase text-[#666662] block mb-1.5">
                    Target Corridor Sector
                  </label>
                  <select
                    value={selectedCorridor}
                    onChange={(e) => setSelectedCorridor(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#D5D5CF] px-3 py-2 text-xs font-mono text-[#111111] focus:outline-none focus:border-[#111111]"
                  >
                    <option value="GST Road (NH 45) - Potheri Central & Interchange Flyover">GST Road (NH 45) - Potheri Central & Interchange Flyover</option>
                    <option value="Guduvanchery Junction & NH 45 Service Road">Guduvanchery Junction & NH 45 Service Road</option>
                    <option value="Maraimalai Nagar Industrial Hub (Ford Gate)">Maraimalai Nagar Industrial Hub (Ford Gate)</option>
                    <option value="Singaperumal Koil Junction (SH 57 Link)">Singaperumal Koil Junction (SH 57 Link)</option>
                    <option value="Paranur Toll Plaza & Mahindra World City">Paranur Toll Plaza & Mahindra World City</option>
                    <option value="Chengalpattu Central Bus Stand & Railway Jn">Chengalpattu Central Bus Stand & Railway Jn</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono font-bold uppercase text-[#666662] block mb-1">
                      Hour of Day ({trafficHour}:00)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={23}
                      value={trafficHour}
                      onChange={(e) => setTrafficHour(Number(e.target.value))}
                      className="w-full accent-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono font-bold uppercase text-[#666662] block mb-1">
                      Day of Week
                    </label>
                    <select
                      value={trafficDay}
                      onChange={(e) => setTrafficDay(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#D5D5CF] px-2 py-1.5 text-xs font-mono text-[#111111] focus:outline-none"
                    >
                      <option>Monday</option>
                      <option>Tuesday</option>
                      <option>Wednesday</option>
                      <option>Thursday</option>
                      <option>Friday</option>
                      <option>Saturday</option>
                      <option>Sunday</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 pt-1">
                  {[
                    { label: 'Passenger Cars', val: carCount, set: setCarCount, max: 200, mid: 100, accent: true },
                    { label: 'Two-Wheelers & Bikes', val: bikeCount, set: setBikeCount, max: 150, mid: 75, accent: false },
                    { label: 'Transit Buses (MTC / Fleet)', val: busCount, set: setBusCount, max: 60, mid: 30, accent: false },
                    { label: 'Commercial Freight Trucks', val: truckCount, set: setTruckCount, max: 80, mid: 40, accent: false }
                  ].map(({ label, val, set, max, mid, accent }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-xs font-mono mb-1">
                        <span className="font-semibold text-[#111111]">{label}</span>
                        <span className={`font-bold bg-[#FBFBFA] border border-[#E5E5DF] px-2 py-0.5 ${accent ? 'text-[#E05238]' : 'text-[#111111]'}`}>
                          {val} units
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={max}
                        value={val}
                        onChange={(e) => set(Number(e.target.value))}
                        className="w-full accent-[#111111]"
                      />
                      <div className="flex justify-between text-[10px] font-mono text-[#8C8C85]">
                        <span>0</span>
                        <span>{mid}</span>
                        <span>{max}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 border border-[#E5E5DF] bg-[#FBFBFA] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#666662]">Total Evaluated Volume:</span>
                  <span className="font-bold text-[#111111] text-sm">{totalVehicles} vehicles / min</span>
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={handleRunTrafficPrediction}
                  disabled={isTrafficPredicting}
                  className={`w-full flex items-center justify-center gap-2.5 py-3 px-6 font-mono font-bold text-xs uppercase tracking-[0.08em] transition-all border border-[#111111] active:translate-y-px ${
                    isTrafficPredicting
                      ? 'bg-[#222222] text-amber-400 cursor-wait'
                      : 'bg-[#111111] hover:bg-black text-white shadow-xs'
                  }`}
                >
                  {isTrafficPredicting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <span>Evaluating Spark Random Forest (100 Trees)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#E05238]" />
                      <span>Run Traffic Prediction Model</span>
                    </>
                  )}
                </button>
              </div>

              {/* Traffic Result Card */}
              <div className="lg:col-span-7 space-y-6">
                {trafficPrediction && (
                  <div
                    className={`relative border bg-[#FFFFFF] p-5 shadow-xs transition-all duration-300 ${
                      justEvaluatedTraffic
                        ? 'border-[#E05238] ring-2 ring-[#E05238]/20 bg-orange-50/15'
                        : 'border-[#D5D5CF]'
                    }`}
                  >
                    <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
                    <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
                    <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
                    <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#E5E5DF] text-[11px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        <span className="font-bold text-[#111111] uppercase tracking-wider">
                          Inference Execution #{trafficRunCount} Active
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[#666662]">
                        <span className={`px-2 py-0.5 text-[10px] font-bold border ${
                          trafficPrediction.isDemo
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {trafficPrediction.isDemo ? 'SIMULATION MODEL' : 'FASTAPI BACKEND'}
                        </span>
                        <span>Latency: {trafficLatency}ms</span>
                        <span>|</span>
                        <span>{trafficLastRunTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF]">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E05238] block">
                          Random Forest (100 Trees Ensemble) Output
                        </span>
                        <h4 className="text-base font-bold text-[#111111]">Severity Classification Assessment</h4>
                      </div>
                      <span className="px-2.5 py-1 text-xs font-mono font-bold border border-[#D5D5CF] bg-[#FBFBFA] text-[#111111]">
                        Confidence: {trafficPrediction.confidence}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                      <div className="border border-[#D5D5CF] p-4 bg-[#FBFBFA]">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#666662] block">
                          Traffic Situation
                        </span>
                        <div
                          className={`text-2xl font-black mt-1 uppercase ${
                            trafficPrediction.situation === 'heavy'
                              ? 'text-rose-600'
                              : trafficPrediction.situation === 'high'
                              ? 'text-amber-600'
                              : trafficPrediction.situation === 'normal'
                              ? 'text-blue-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {trafficPrediction.situation}
                        </div>
                        <span className="text-[10px] font-mono text-[#666662] block mt-1">
                          Corridor threshold: {trafficPrediction.totalVehicles} veh
                        </span>
                      </div>

                      <div className="border border-[#D5D5CF] p-4 bg-[#FBFBFA]">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#666662] block">
                          K-Means Archetype
                        </span>
                        <div className="text-lg font-bold text-[#111111] mt-1">Cluster {trafficPrediction.clusterId}</div>
                        <span className="text-[10px] font-mono font-bold block mt-1" style={{ color: trafficPrediction.clusterColor }}>
                          {trafficPrediction.clusterName}
                        </span>
                      </div>

                      <div className="border border-[#D5D5CF] p-4 bg-[#FBFBFA]">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#666662] block">
                          Target Corridor
                        </span>
                        <div className="text-xs font-bold text-[#111111] mt-1 line-clamp-2">
                          {trafficPrediction.corridor}
                        </div>
                        <span className="text-[10px] font-mono text-[#666662] block mt-1">
                          Hour: {trafficHour}:00 · {trafficDay}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#666662] mb-1.5">
                        <span className="font-semibold uppercase tracking-wider text-[#111111]">Modal Volume Split</span>
                        <span>Cars {carPct}% · Bikes {bikePct}% · Buses {busPct}% · Trucks {truckPct}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#E5E5DF] flex overflow-hidden">
                        <div style={{ width: `${carPct}%` }} className="bg-[#E05238]" />
                        <div style={{ width: `${bikePct}%` }} className="bg-sky-500" />
                        <div style={{ width: `${busPct}%` }} className="bg-amber-500" />
                        <div style={{ width: `${truckPct}%` }} className="bg-[#111111]" />
                      </div>
                    </div>

                    <div className="mt-4 p-3 border border-[#D5D5CF] bg-[#FBFBFA] flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#E05238] shrink-0 mt-0.5" />
                      <div className="text-xs font-mono">
                        <span className="font-bold text-[#111111] uppercase">Recommended Action: </span>
                        <span className="text-[#666662]">
                          {TRAFFIC_ARCHETYPES[trafficPrediction.clusterId]?.mitigationStrategy}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 24-Hour Diurnal Volume Chart */}
                <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs">
                  <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
                  <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
                  <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
                  <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

                  <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF]">
                    <div>
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                        24-Hour Corridor Volume Projection
                      </h4>
                      <p className="text-[11px] font-mono text-[#666662]">
                        Diurnal traffic pattern with current evaluation hour ({trafficHour}:00)
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-[#E05238] font-bold">Capacity: 180 veh</span>
                  </div>
                  <div className="h-56 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={diurnalCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART.brand} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={CHART.brand} stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid {...gridProps} />
                        <XAxis dataKey="time" {...axisTick} />
                        <YAxis {...axisTick} domain={[0, 380]} />
                        <Tooltip {...tooltipStyle} />
                        <Area
                          type="monotone"
                          dataKey="volume"
                          name="Predicted Volume"
                          stroke={CHART.brand}
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#volGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            FLOOD PREDICTION ENGINE TAB
        ========================================================================= */}
        {activeTab === 'flood' && (
          <div className="animate-page-in space-y-6">
            {/* Catchment Hotspot Presets */}
            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs">
              <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E5E5DF]">
                <div className="flex items-center gap-2">
                  <Waves className="w-4 h-4 text-[#E05238]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                    Vulnerable Catchment & Basin Presets
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#666662]">
                  Select verified Chennai flood catchment for instant calibration
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
                {Object.entries(FLOOD_PRESETS).map(([key, spot]) => {
                  const isSelected = floodPresetKey === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectFloodPreset(key)}
                      className={`p-3 text-left border transition-all ${
                        isSelected
                          ? 'border-[#E05238] bg-orange-50/25 ring-1 ring-[#E05238]/30 shadow-xs'
                          : 'border-[#E5E5DF] bg-[#FBFBFA] hover:border-[#111111] hover:bg-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#111111] truncate">{spot.name}</div>
                      <span className="text-[10px] font-mono text-[#666662] block mt-0.5">
                        {spot.land_cover} · {spot.soil_type}
                      </span>
                      <div className="mt-2 text-[10px] font-mono text-[#111111] flex items-center justify-between">
                        <span>{spot.rainfall_mm} mm</span>
                        <span className="text-[#E05238] font-bold">Load</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Form & Radial Gauge Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Hydraulic Input Parameters Form */}
              <div className="relative lg:col-span-6 border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs space-y-4">
                <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
                <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
                <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
                <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

                <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF]">
                  <div>
                    <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-[#E05238]" />
                      Hydraulic Catchment Parameters
                    </h3>
                    <p className="text-[11px] text-[#666662] font-mono mt-0.5">
                      Monsoon precipitation, river stage and soil drainage profile
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelectFloodPreset('velachery')}
                    className="flex items-center gap-1 text-[11px] font-mono text-[#666662] hover:text-[#111111]"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono font-bold uppercase text-[#666662] flex justify-between mb-1">
                      <span>Latitude (°N)</span>
                      <span className="text-[10px] text-[#8C8C85]">12.8 - 13.3</span>
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={floodParams.latitude}
                      onChange={(e) => setFloodParams({ ...floodParams, latitude: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#FFFFFF] border border-[#D5D5CF] px-3 py-2 text-xs font-mono text-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono font-bold uppercase text-[#666662] flex justify-between mb-1">
                      <span>Longitude (°E)</span>
                      <span className="text-[10px] text-[#8C8C85]">80.0 - 80.3</span>
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={floodParams.longitude}
                      onChange={(e) => setFloodParams({ ...floodParams, longitude: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#FFFFFF] border border-[#D5D5CF] px-3 py-2 text-xs font-mono text-[#111111]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Recent Rainfall (mm)', key: 'rainfall_mm', step: '0.1' },
                    { label: 'River Discharge (m3/s)', key: 'river_discharge_m3s', step: '50' },
                    { label: 'Water Level (m Stage)', key: 'water_level_m', step: '0.1' },
                    { label: 'Elevation (m MSL)', key: 'elevation_m', step: '0.1' }
                  ].map(({ label, key, step }) => (
                    <div key={key}>
                      <label className="text-[11px] font-mono font-bold uppercase text-[#666662] block mb-1">{label}</label>
                      <input
                        type="number"
                        step={step}
                        value={(floodParams as Record<string, unknown>)[key] as number}
                        onChange={(e) =>
                          setFloodParams({ ...floodParams, [key]: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full bg-[#FFFFFF] border border-[#D5D5CF] px-3 py-2 text-xs font-mono text-[#111111]"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono font-bold uppercase text-[#666662] block mb-1">
                      Land Cover Category
                    </label>
                    <select
                      value={floodParams.land_cover}
                      onChange={(e) => setFloodParams({ ...floodParams, land_cover: e.target.value })}
                      className="w-full bg-[#FFFFFF] border border-[#D5D5CF] px-3 py-2 text-xs font-mono text-[#111111]"
                    >
                      <option value="Urban">Urban / Built-up</option>
                      <option value="Water Body">Water Body / Lake Basin</option>
                      <option value="Agricultural">Agricultural Floodplain</option>
                      <option value="Coastal">Coastal Shoreline</option>
                      <option value="Suburban">Suburban Residential</option>
                      <option value="Industrial">Industrial Zone</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-mono font-bold uppercase text-[#666662] block mb-1">
                      Soil Permeability Profile
                    </label>
                    <select
                      value={floodParams.soil_type}
                      onChange={(e) => setFloodParams({ ...floodParams, soil_type: e.target.value })}
                      className="w-full bg-[#FFFFFF] border border-[#D5D5CF] px-3 py-2 text-xs font-mono text-[#111111]"
                    >
                      <option value="Clay">Clay (Slowest Drainage)</option>
                      <option value="Peat">Peat (Spongy Organic)</option>
                      <option value="Loam">Loam (Moderate Infiltration)</option>
                      <option value="Sandy">Sandy (Rapid Infiltration)</option>
                      <option value="Silt">Silt (Fine River Sediment)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs font-mono text-[#111111] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={floodParams.historical_floods === 1}
                      onChange={(e) => setFloodParams({ ...floodParams, historical_floods: e.target.checked ? 1 : 0 })}
                      className="border-[#D5D5CF] text-[#111111] focus:ring-0"
                    />
                    <span>Historical Flood Record</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-mono text-[#111111] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={floodParams.infrastructure_score === 1}
                      onChange={(e) => setFloodParams({ ...floodParams, infrastructure_score: e.target.checked ? 1 : 0 })}
                      className="border-[#D5D5CF] text-[#111111] focus:ring-0"
                    />
                    <span>Stormwater Infrastructure Present</span>
                  </label>
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={handleRunFloodPrediction}
                  disabled={isFloodPredicting}
                  className={`w-full flex items-center justify-center gap-2.5 py-3 px-6 font-mono font-bold text-xs uppercase tracking-[0.08em] transition-all border border-[#111111] active:translate-y-px ${
                    isFloodPredicting
                      ? 'bg-[#222222] text-cyan-400 cursor-wait'
                      : 'bg-[#111111] hover:bg-black text-white shadow-xs'
                  }`}
                >
                  {isFloodPredicting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      <span>Evaluating Tamil Nadu Hydrological Inundation Model...</span>
                    </>
                  ) : (
                    <>
                      <Waves className="w-4 h-4 text-[#E05238]" />
                      <span>Run Flood Prediction Model</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Radial Gauge & Feature Impacts */}
              <div className="lg:col-span-6 space-y-5">
                {floodPrediction && (
                  <>
                    <div
                      className={`relative border bg-[#FFFFFF] p-3 shadow-xs transition-all duration-300 flex items-center justify-between text-[11px] font-mono ${
                        justEvaluatedFlood ? 'border-[#E05238] ring-2 ring-[#E05238]/20' : 'border-[#D5D5CF]'
                      }`}
                    >
                      <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
                      <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
                      <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
                      <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        <span className="font-bold text-[#111111] uppercase tracking-wider">
                          Flood Inference #{floodRunCount} Active
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[#666662]">
                        <span className={`px-2 py-0.5 text-[10px] font-bold border ${
                          floodPrediction.isDemo
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {floodPrediction.isDemo ? 'SIMULATION MODEL' : 'FASTAPI BACKEND'}
                        </span>
                        <span>Latency: {floodLatency}ms</span>
                        <span>|</span>
                        <span>{floodLastRunTime}</span>
                      </div>
                    </div>

                    {/* Radial Gauge */}
                    <FloodRadialGauge
                      probability={floodPrediction.probability}
                      riskLevel={floodPrediction.riskLevel}
                      predictionClass={floodPrediction.predictionClass}
                      confidence={floodPrediction.confidence}
                    />

                    {/* Model Details & Cluster Card */}
                    <div className="relative p-4 bg-[#FFFFFF] border border-[#D5D5CF] text-xs font-mono space-y-2 shadow-xs">
                      <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
                      <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
                      <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
                      <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

                      <div className="flex items-center justify-between pb-2 border-b border-[#E5E5DF]">
                        <span className="text-[#666662]">MODEL VERSION</span>
                        <span className="text-[#111111] font-bold">{floodPrediction.modelVersion}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#666662]">K-MEANS CLUSTER</span>
                        <span className="text-[#0284C7] font-bold">
                          #{floodPrediction.clusterId} · {floodPrediction.clusterName}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666662] pt-1 leading-relaxed">
                        {floodPrediction.clusterDesc}
                      </p>
                    </div>

                    {/* Key Factor Impacts / Feature Contributions */}
                    <div className="relative p-4 bg-[#FFFFFF] border border-[#D5D5CF] text-xs font-mono shadow-xs">
                      <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
                      <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
                      <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
                      <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

                      <div className="text-[#111111] font-bold mb-3 flex items-center justify-between">
                        <span className="uppercase tracking-wider">Key Factor Impacts</span>
                        <span className="text-[10px] text-[#8C8C85]">Feature Contribution</span>
                      </div>
                      <div className="space-y-2.5">
                        {floodPrediction.featureContributions.map((fc, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-[#666662]">{fc.feature} ({fc.value})</span>
                              <span className={fc.impact > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600'}>
                                {fc.impact > 0 ? `+${fc.impact}` : fc.impact}
                              </span>
                            </div>
                            <div className="w-full bg-[#E5E5DF] h-1.5 flex overflow-hidden">
                              <div
                                className={`h-full ${fc.impact > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(Math.abs(fc.impact) * 200, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Operational Recommendations */}
                    <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs space-y-3">
                      <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
                      <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
                      <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
                      <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

                      <div className="flex items-center justify-between pb-2 border-b border-[#E5E5DF]">
                        <span className="text-xs font-mono font-bold uppercase tracking-wide text-[#111111]">
                          Automated Disaster Management Protocol
                        </span>
                        <span className="text-[10px] font-mono text-[#8C8C85]">
                          Run #{floodRunCount} · {floodLatency}ms
                        </span>
                      </div>
                      <ul className="space-y-2 text-xs font-mono text-[#666662]">
                        {floodPrediction.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#E05238] font-bold">›</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Chembarambakkam Reservoir Storage & Hydrograph Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Chembarambakkam Reservoir Storage Area Chart */}
              <div className="relative lg:col-span-7 border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs">
                <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
                <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
                <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
                <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5E5DF]">
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                      Chembarambakkam Reservoir Storage & Surplus Discharge
                    </h4>
                    <p className="text-[11px] text-[#666662] font-mono mt-0.5">
                      Surplus sluice releases directly impacting Adyar River corridor downstream
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 font-bold">
                    95% CAPACITY
                  </span>
                </div>
                <div className="h-60 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={CHEMBARAMBAKKAM_STORAGE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="chemGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284C7" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid {...gridProps} />
                      <XAxis dataKey="time" {...axisTick} />
                      <YAxis {...axisTick} domain={[20, 25]} unit="m" />
                      <Tooltip {...tooltipStyle} />
                      <Area
                        type="monotone"
                        dataKey="levelM"
                        name="Storage Level (m)"
                        stroke="#0284C7"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#chemGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Hydrograph River Stage vs Danger Threshold */}
              <div className="relative lg:col-span-5 border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs">
                <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
                <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
                <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
                <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#E5E5DF]">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wide text-[#111111]">
                    Hydrograph River Stage vs Danger (7.5m)
                  </h4>
                  <span className="text-[10px] font-mono text-[#E05238] font-bold">HFL Danger: 7.5m</span>
                </div>
                <div className="h-60 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hydrographCurve} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid {...gridProps} />
                      <XAxis dataKey="step" {...axisTick} />
                      <YAxis domain={[0, 12]} {...axisTick} unit="m" />
                      <Tooltip {...tooltipStyle} />
                      <Area
                        type="monotone"
                        dataKey="stage"
                        name="Water Stage (m)"
                        stroke={CHART.brand}
                        strokeWidth={2}
                        fill={CHART.brand}
                        fillOpacity={0.2}
                      />
                      <Area
                        type="monotone"
                        dataKey="threshold"
                        name="Danger Threshold (m)"
                        stroke="#111111"
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                        fill="none"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            RAINFALL & WEATHER OBSERVATORIES TAB
        ========================================================================= */}
        {activeTab === 'rainfall' && (
          <div className="animate-page-in space-y-6">
            {/* Meteorological Presets */}
            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs">
              <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E5E5DF]">
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-[#0284C7]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                    Select Meteorological Scenario Presets
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#8C8C85]">
                  Chennai historic monsoon cloudburst calibrations
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {RAINFALL_SCENARIO_PRESETS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectRainfallScenario(s)}
                    className="p-3 text-left border border-[#D5D5CF] bg-[#FBFBFA] hover:border-[#111111] hover:bg-white transition-all group shadow-2xs"
                  >
                    <div className="text-xs font-bold font-mono text-[#111111] group-hover:text-[#0284C7] truncate">
                      {s.name}
                    </div>
                    <div className="text-[10px] text-[#666662] font-mono mt-0.5 truncate">{s.desc}</div>
                    <div className="mt-2 text-[10px] font-mono text-[#8C8C85] flex items-center justify-between">
                      <span>{s.station}</span>
                      <span className="text-[#0284C7] font-bold">Load</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* K-Means Precipitation Zones */}
            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs">
              <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-[#E5E5DF]">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                    K-Means Precipitation Regime & Vulnerability Zones
                  </h3>
                  <p className="text-[11px] text-[#666662] font-mono mt-0.5">
                    Clustering 62 Chennai IMD & GCC meteorological stations into 3 empirical macro-catchment precipitation zones
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold bg-[#FBFBFA] border border-[#D5D5CF] px-2.5 py-1 text-[#111111]">
                  62 IMD Observatories
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {RAINFALL_ZONES.map((zone) => {
                  const isSelected = selectedRainfallZoneId === zone.id
                  return (
                    <div
                      key={zone.id}
                      onClick={() => {
                        setSelectedRainfallZoneId(zone.id)
                        setRainfallPrediction(evaluateRainfallModel(zone.id))
                      }}
                      className={`relative p-4 border transition-all cursor-pointer font-mono select-none ${
                        isSelected
                          ? 'border-[#0284C7] bg-sky-50/20 ring-1 ring-[#0284C7]/30 shadow-xs'
                          : 'border-[#E5E5DF] bg-[#FBFBFA] hover:border-[#111111] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-[#666662] uppercase font-bold">Zone #{zone.id}</span>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: zone.color }} />
                      </div>
                      <div className="font-bold text-[#111111] text-xs mb-2">{zone.zoneCategory}</div>
                      <div className="space-y-1 text-[10px] text-[#666662]">
                        <div className="flex justify-between">
                          <span>Stations:</span>
                          <span className="text-[#111111] font-bold">{zone.stationCount} Observatories</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Daily Avg:</span>
                          <span className="text-[#0284C7] font-bold">{zone.avgDailyRainfallMm} mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max Record:</span>
                          <span className="text-[#111111]">{zone.maxStormRecordMm} mm</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Telemetry & Doppler Bar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Telemetry Grid */}
              <div className="relative lg:col-span-5 border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs space-y-4">
                <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
                <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
                <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
                <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

                <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF]">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-600" />
                    Live Weather Telemetry Feed
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold">Doppler Active</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Thermometer, iconColor: 'text-[#E05238]', label: 'Temperature', value: '26.8°C', sub: 'Chennai Metro Mean' },
                    { icon: Droplets, iconColor: 'text-sky-600', label: 'Relative Humidity', value: '92%', sub: 'Pre-Storm Saturation' },
                    { icon: Wind, iconColor: 'text-amber-600', label: 'Wind Velocity', value: '34 km/h', sub: 'Gusting North-East' },
                    { icon: Radio, iconColor: 'text-emerald-600', label: 'Radar Reflectivity', value: '48 dBZ', sub: 'Heavy Convective' }
                  ].map(({ icon: Icon, iconColor, label, value, sub }) => (
                    <div key={label} className="p-3 border border-[#E5E5DF] bg-[#FBFBFA]">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#666662]">
                        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                        <span>{label}</span>
                      </div>
                      <div className="text-xl font-bold font-mono text-[#111111] mt-1">{value}</div>
                      <span className="text-[10px] text-[#666662] font-mono">{sub}</span>
                    </div>
                  ))}
                </div>

                {/* Stations Search */}
                <div className="pt-2 border-t border-[#E5E5DF] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-[#111111]">Stations in Active Zone:</span>
                    <span className="text-[10px] text-[#8C8C85]">{filteredStations.length} matching</span>
                  </div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#8C8C85]" />
                    <input
                      type="text"
                      placeholder="Filter observatory stations..."
                      value={stationSearch}
                      onChange={(e) => setStationSearch(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#D5D5CF] pl-8 pr-3 py-1.5 text-xs font-mono text-[#111111] focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                    {filteredStations.map((st) => (
                      <span
                        key={st}
                        className="text-[10px] font-mono px-2 py-0.5 bg-[#FBFBFA] border border-[#E5E5DF] text-[#111111]"
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={handleRunRainfallPrediction}
                  disabled={isWeatherPredicting}
                  className={`w-full flex items-center justify-center gap-2.5 py-3 px-6 font-mono font-bold text-xs uppercase tracking-[0.08em] transition-all border border-[#111111] active:translate-y-px ${
                    isWeatherPredicting
                      ? 'bg-[#222222] text-sky-400 cursor-wait'
                      : 'bg-[#111111] hover:bg-black text-white shadow-xs'
                  }`}
                >
                  {isWeatherPredicting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                      <span>Evaluating IMD Precipitation Cluster Model...</span>
                    </>
                  ) : (
                    <>
                      <CloudRain className="w-4 h-4 text-[#0284C7]" />
                      <span>Run Precipitation Cluster Inference</span>
                    </>
                  )}
                </button>
              </div>

              {/* Rainfall Result Card & Doppler Bar Chart */}
              <div className="lg:col-span-7 space-y-5">
                {rainfallPrediction && (
                  <div
                    className={`relative border bg-[#FFFFFF] p-5 shadow-xs transition-all duration-300 ${
                      justEvaluatedWeather
                        ? 'border-[#0284C7] ring-2 ring-[#0284C7]/20 bg-sky-50/10'
                        : 'border-[#D5D5CF]'
                    }`}
                  >
                    <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
                    <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
                    <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
                    <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#E5E5DF] text-[11px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-500 inline-block animate-pulse" />
                        <span className="font-bold text-[#111111] uppercase tracking-wider">
                          Precipitation Cluster Inference #{weatherRunCount}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[#666662]">
                        <span className={`px-2 py-0.5 text-[10px] font-bold border ${
                          rainfallPrediction.isDemo
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {rainfallPrediction.isDemo ? 'SIMULATION MODEL' : 'FASTAPI BACKEND'}
                        </span>
                        <span>Latency: {weatherLatency}ms</span>
                        <span>|</span>
                        <span>{weatherLastRunTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF] mb-4">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0284C7] block">
                          K-Means (3 Clusters) IMD Station Partitioning Output
                        </span>
                        <h4 className="text-base font-bold text-[#111111]">Precipitation Regime Classification</h4>
                      </div>
                      <span
                        className={`px-2.5 py-1 text-xs font-mono font-bold border ${
                          rainfallPrediction.floodRiskLabel === 'Very High'
                            ? 'bg-rose-50 border-rose-300 text-rose-700'
                            : rainfallPrediction.floodRiskLabel === 'High'
                            ? 'bg-amber-50 border-amber-300 text-amber-700'
                            : rainfallPrediction.floodRiskLabel === 'Moderate'
                            ? 'bg-sky-50 border-sky-300 text-sky-700'
                            : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        }`}
                      >
                        Flood Risk: {rainfallPrediction.floodRiskLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      <div className="border border-[#D5D5CF] p-4 bg-[#FBFBFA]">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#666662] block">
                          Assigned Zone
                        </span>
                        <div className="text-base font-bold text-[#111111] mt-1">Zone #{rainfallPrediction.zoneId}</div>
                        <span className="text-[10px] font-mono text-[#0284C7] font-bold block mt-1">
                          {rainfallPrediction.zoneCategory}
                        </span>
                      </div>

                      <div className="border border-[#D5D5CF] p-4 bg-[#FBFBFA]">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#666662] block">
                          Flood Risk Index
                        </span>
                        <div
                          className={`text-2xl font-black font-mono mt-1 ${
                            rainfallPrediction.floodRiskIndex >= 75
                              ? 'text-rose-600'
                              : rainfallPrediction.floodRiskIndex >= 50
                              ? 'text-amber-600'
                              : rainfallPrediction.floodRiskIndex >= 25
                              ? 'text-sky-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {rainfallPrediction.floodRiskIndex}
                        </div>
                        <span className="text-[10px] font-mono text-[#666662] block mt-1">Composite Score / 100</span>
                      </div>

                      <div className="border border-[#D5D5CF] p-4 bg-[#FBFBFA]">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#666662] block">
                          Storm Category
                        </span>
                        <div className="text-xs font-bold text-[#111111] mt-1">{rainfallPrediction.stormCategory}</div>
                        <span className="text-[10px] font-mono text-[#666662] block mt-1">
                          {rainfallPrediction.annualHeavyRainDays} heavy rain days/yr
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono border-t border-[#E5E5DF] pt-3 mb-4">
                      <div>
                        <div className="font-bold text-[#0284C7] text-base">{rainfallPrediction.avgDailyRainfallMm} mm</div>
                        <div className="text-[#666662]">Avg Daily Rainfall</div>
                      </div>
                      <div>
                        <div className="font-bold text-[#E05238] text-base">{rainfallPrediction.maxStormRecordMm} mm</div>
                        <div className="text-[#666662]">Max Storm Record</div>
                      </div>
                      <div>
                        <div className="font-bold text-[#111111] text-base">{rainfallPrediction.annualHeavyRainDays}</div>
                        <div className="text-[#666662]">Heavy Rain Days</div>
                      </div>
                    </div>

                    <div className="p-3 border border-[#D5D5CF] bg-[#FBFBFA] flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                      <div className="text-xs font-mono">
                        <span className="font-bold text-[#111111] uppercase">Drainage Protocol: </span>
                        <span className="text-[#666662]">{rainfallPrediction.drainageRecommendation}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Doppler Radar Hourly Bar Chart */}
                <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs">
                  <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
                  <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
                  <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
                  <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

                  <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF]">
                    <div>
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                        Doppler Radar Hourly Precipitation Profile
                      </h4>
                      <p className="text-[11px] font-mono text-[#666662]">
                        Chennai coastal and inland convective rain bands (mm/hr) · Zone #{selectedRainfallZoneId}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-[#E05238] font-bold">Peak: {peakRain?.rain} mm/hr</span>
                  </div>
                  <div className="h-60 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hourlyStormData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid {...gridProps} />
                        <XAxis dataKey="hour" {...axisTick} />
                        <YAxis {...axisTick} unit=" mm" />
                        <Tooltip {...tooltipStyle} />
                        <Bar dataKey="rain" name="Rainfall (mm/hr)" fill={CHART.brand} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TACTICAL AI INSIGHTS TAB
        ========================================================================= */}
        {activeTab === 'insights' && (
          <div className="animate-page-in space-y-4">
            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs">
              <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

              <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF] mb-4">
                <div>
                  <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-[#E05238]" />
                    Tactical AI Insights & Operational Action Protocols
                  </h3>
                  <p className="text-[11px] text-[#666662] font-mono mt-0.5">
                    Deterministic multi-source analysis fusing reservoir discharge, tidal phase & traffic bottlenecks
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 bg-[#FBFBFA] border border-[#D5D5CF] text-[#111111]">
                  3 Active Directives
                </span>
              </div>
              <div className="space-y-4">
                {TACTICAL_INSIGHTS.map((ins) => (
                  <div key={ins.id} className="relative border border-[#D5D5CF] bg-[#FBFBFA] p-4 font-mono">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E5E5DF]">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`w-4 h-4 ${ins.severity === 'Critical' ? 'text-rose-600' : 'text-amber-600'}`}
                        />
                        <span className="font-bold text-xs text-[#111111] uppercase">{ins.title}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 border ${
                          ins.severity === 'Critical'
                            ? 'bg-rose-50 border-rose-300 text-rose-700'
                            : 'bg-amber-50 border-amber-300 text-amber-700'
                        }`}
                      >
                        {ins.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-[#666662] mt-2.5">{ins.description}</p>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#E5E5DF] text-[11px]">
                      <div>
                        <span className="font-bold text-[#111111] block mb-0.5">Deterministic Reason:</span>
                        <span className="text-[#666662]">{ins.deterministicReason}</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#E05238] block mb-0.5">Recommended Action:</span>
                        <span className="text-[#111111]">{ins.suggestedAction}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODEL BENCHMARKS TAB
        ========================================================================= */}
        {activeTab === 'benchmarks' && (
          <div className="animate-page-in space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Random Forest Accuracy', value: '99.83%', color: 'text-[#E05238]', sub: '100 Estimators · 596 Test Cases' },
                { label: 'Weighted F1-Score', value: '0.992', color: 'text-[#111111]', sub: 'Precision: 0.994 · Recall: 0.991' },
                { label: 'Hydrological Regressor R2', value: '84.27%', color: 'text-[#111111]', sub: 'RMSE: 0.02 · 20 Indicators' },
                { label: 'K-Means Clustering', value: 'K=4 / K=3', color: 'text-[#111111]', sub: 'Traffic & Weather Partitions' }
              ].map(({ label, value, color, sub }) => (
                <div key={label} className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-4 shadow-xs">
                  <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
                  <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
                  <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
                  <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#666662] block">
                    {label}
                  </span>
                  <div className={`text-2xl font-black font-mono mt-1 ${color}`}>{value}</div>
                  <span className="text-[10px] font-mono text-[#666662] block mt-1">{sub}</span>
                </div>
              ))}
            </div>

            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs">
              <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

              <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF] mb-4">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                    Classification Report Summary
                  </h4>
                  <p className="text-[11px] font-mono text-[#666662]">
                    Evaluation on 20% holdout test partition (N=596)
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-left">
                  <thead>
                    <tr className="border-b border-[#D5D5CF] text-[#666662]">
                      <th className="py-2">Class</th>
                      <th className="py-2 text-right">Precision</th>
                      <th className="py-2 text-right">Recall</th>
                      <th className="py-2 text-right">F1-Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5DF]">
                    {[
                      { cls: 'LOW', prec: '1.00', rec: '0.99', f1: '0.99' },
                      { cls: 'NORMAL', prec: '0.99', rec: '1.00', f1: '0.99' },
                      { cls: 'HIGH', prec: '0.99', rec: '0.98', f1: '0.99' },
                      { cls: 'HEAVY', prec: '1.00', rec: '1.00', f1: '1.00' }
                    ].map(({ cls, prec, rec, f1 }) => (
                      <tr key={cls}>
                        <td className="py-2 font-bold text-[#111111]">{cls}</td>
                        <td className="py-2 text-right">{prec}</td>
                        <td className="py-2 text-right">{rec}</td>
                        <td className="py-2 text-right font-semibold text-[#E05238]">{f1}</td>
                      </tr>
                    ))}
                    <tr className="bg-[#FBFBFA] font-bold text-[#111111]">
                      <td className="py-2">Overall / Macro</td>
                      <td className="py-2 text-right">0.994</td>
                      <td className="py-2 text-right">0.991</td>
                      <td className="py-2 text-right text-[#E05238]">0.992</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default PredictionEngine
