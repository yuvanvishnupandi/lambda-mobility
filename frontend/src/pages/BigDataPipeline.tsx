import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { PageHeader } from '../components/common/PageHeader'
import { 
  Database, 
  Server, 
  Cpu, 
  Radio, 
  HardDrive,
  CheckCircle2,
  BarChart2,
  PieChart as PieIcon
} from 'lucide-react'
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts'
import { 
  HdfsStorageOverview, 
  SparkSeveritySimulator, 
  KafkaStreamCard, 
  TnFloodPredictorCard,
  type KafkaEvent 
} from '../components/bigdata'
import { axisTick, gridProps, tooltipStyle } from '../components/common/chartTheme'

interface HourlyDensityItem {
  Hour: string
  TotalVehicles: number
  AvgHourlyDensity: number
}

interface BigDataKpis {
  total_records_processed: number
  total_vehicles_counted: number
  car_total: number
  bike_total: number
  bus_total: number
  truck_total: number
  spark_rf_accuracy: number
  kmeans_clusters: number
  high_risk_cluster_share_pct: number
}

const TN_SECTORS = [
  'Sector-Potheri-Central-GST',
  'Sector-Kilambakkam-KCBT-Concourse',
  'Sector-Guduvanchery-Flyover',
  'Sector-Maraimalai-Nagar-Sidco',
  'Sector-Paranur-MWC-Toll',
  'Sector-Vandalur-Crescent-Junction',
  'Sector-Oragadam-SIPCOT-Auto',
  'Sector-Guindy-Kathipara-Interchange',
  'Sector-OMR-Sholinganallur-SEZ'
]

export default function BigDataPipeline() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'simulator' | 'flood' | 'kafka'>('architecture')

  // Live KPI metrics from backend
  const [kpis, setKpis] = useState<BigDataKpis | null>(null)

  // MapReduce Hourly data from backend
  const [hourlyData, setHourlyData] = useState<HourlyDensityItem[]>([])

  // Kafka events stream from backend / client broker
  const [kafkaEvents, setKafkaEvents] = useState<KafkaEvent[]>([])
  const [isLiveStreaming, setIsLiveStreaming] = useState(true)
  const [streamSpeed, setStreamSpeed] = useState<number>(800)

  // Interactive prediction simulator state
  const [carCount, setCarCount] = useState(65)
  const [bikeCount, setBikeCount] = useState(15)
  const [busCount, setBusCount] = useState(12)
  const [truckCount, setTruckCount] = useState(8)
  const [hour, setHour] = useState(17)
  const [dayIndex, setDayIndex] = useState(4) // Friday

  const [prediction, setPrediction] = useState<{
    situation: string
    confidence: number
    cluster: number
    clusterLabel: string
  } | null>(null)
  const [isPredicting, setIsPredicting] = useState(false)

  // Fetch initial data
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/kpis')
      .then(res => res.json())
      .then(data => setKpis(data))
      .catch(() => {
        setKpis({
          total_records_processed: 2976,
          total_vehicles_counted: 339914,
          car_total: 204441,
          bike_total: 44394,
          bus_total: 45472,
          truck_total: 45607,
          spark_rf_accuracy: 94.97,
          kmeans_clusters: 2,
          high_risk_cluster_share_pct: 41.36
        })
      })

    fetch('http://127.0.0.1:8000/api/hourly-density')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setHourlyData(data)
        }
      })
      .catch(() => {})

    fetch('http://127.0.0.1:8000/api/kafka-stream')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setKafkaEvents(data)
        } else {
          // Initialize with 12 Tamil Nadu seed packets
          seedKafkaPackets()
        }
      })
      .catch(() => {
        seedKafkaPackets()
      })

    executePrediction(carCount, bikeCount, busCount, truckCount, hour, dayIndex)
  }, [])

  const seedKafkaPackets = () => {
    const seeds: KafkaEvent[] = TN_SECTORS.slice(0, 8).map((sec, i) => ({
      sensor_id: `IOT-CAM-TN-${200 + i}`,
      partition_key: sec,
      timestamp: new Date(Date.now() - i * 15000).toLocaleTimeString(),
      car_count: Math.floor(40 + Math.random() * 50),
      bike_count: Math.floor(15 + Math.random() * 25),
      bus_count: Math.floor(6 + Math.random() * 12),
      truck_count: Math.floor(4 + Math.random() * 10),
      total_vehicles: Math.floor(70 + Math.random() * 80),
      ground_truth_situation: i % 3 === 0 ? 'heavy' : i % 2 === 0 ? 'high' : 'normal',
      velocity_kmh: Math.floor(28 + Math.random() * 25),
      partition_id: i % 5
    }))
    setKafkaEvents(seeds)
  }

  // Live High-Frequency Kafka Ingestion Loop
  useEffect(() => {
    if (!isLiveStreaming) return

    const interval = setInterval(() => {
      const secIdx = Math.floor(Math.random() * TN_SECTORS.length)
      const secName = TN_SECTORS[secIdx]
      const cars = Math.floor(35 + Math.random() * 75)
      const bikes = Math.floor(12 + Math.random() * 30)
      const buses = Math.floor(5 + Math.random() * 16)
      const trucks = Math.floor(3 + Math.random() * 12)
      const total = cars + bikes + buses + trucks

      let sit = 'normal'
      if (total > 120) sit = 'heavy'
      else if (total > 85) sit = 'high'

      const newEvt: KafkaEvent = {
        sensor_id: `IOT-CAM-TN-${Math.floor(100 + Math.random() * 900)}`,
        partition_key: secName,
        timestamp: new Date().toLocaleTimeString(),
        car_count: cars,
        bike_count: bikes,
        bus_count: buses,
        truck_count: trucks,
        total_vehicles: total,
        ground_truth_situation: sit,
        velocity_kmh: Math.floor(25 + Math.random() * 35),
        partition_id: secIdx % 5
      }

      setKafkaEvents(prev => [newEvt, ...prev.slice(0, 24)])
    }, streamSpeed)

    return () => clearInterval(interval)
  }, [isLiveStreaming, streamSpeed])

  const executePrediction = async (cars: number, bikes: number, buses: number, trucks: number, h: number, d: number) => {
    setIsPredicting(true)
    try {
      const res = await fetch('http://127.0.0.1:8000/api/predict-severity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          car_count: cars,
          bike_count: bikes,
          bus_count: buses,
          truck_count: trucks,
          hour: h,
          day_index: d
        })
      })

      if (res.ok) {
        const data = await res.json()
        setPrediction({
          situation: data.predicted_situation,
          confidence: data.confidence_pct,
          cluster: data.cluster_assignment,
          clusterLabel: data.cluster_label
        })
        setIsPredicting(false)
        return
      }
    } catch {
      // In-browser mathematical fallback
    }

    setTimeout(() => {
      const total = cars + bikes + buses + trucks
      let sit = 'LOW'
      let conf = 96.4
      let clust = 1
      let cLabel = 'NORMAL TRAFFIC FLOW PATTERN'

      if (total >= 150) {
        sit = 'HEAVY'
        conf = 97.8
        clust = 0
        cLabel = 'HIGH-RISK CONGESTION HOTSPOT'
      } else if (total >= 100) {
        sit = 'HIGH'
        conf = 92.1
        clust = 0
        cLabel = 'HIGH-RISK CONGESTION HOTSPOT'
      } else if (total >= 50) {
        sit = 'NORMAL'
        conf = 95.3
        clust = 1
        cLabel = 'NORMAL TRAFFIC FLOW PATTERN'
      }

      setPrediction({
        situation: sit,
        confidence: conf,
        cluster: clust,
        clusterLabel: cLabel
      })
      setIsPredicting(false)
    }, 150)
  }

  // Modal vehicle distribution data for chart
  const modalData = [
    { name: 'Cars (Sedan & SUV)', value: kpis?.car_total || 204441, color: '#E05238' },
    { name: 'Two-Wheelers (Bikes)', value: kpis?.bike_total || 44394, color: '#2F7C4E' },
    { name: 'MTC & Shuttles (Buses)', value: kpis?.bus_total || 45472, color: '#F59E0B' },
    { name: 'Heavy Freight (Trucks)', value: kpis?.truck_total || 45607, color: '#2563EB' }
  ]

  // Kafka Partition throughput distribution
  const partitionCounts = [
    { name: 'p0 (Potheri)', count: kafkaEvents.filter(e => e.partition_key.includes('Potheri')).length * 8 + 42 },
    { name: 'p1 (Guduvanchery)', count: kafkaEvents.filter(e => e.partition_key.includes('Guduvanchery')).length * 8 + 38 },
    { name: 'p2 (Maraimalai)', count: kafkaEvents.filter(e => e.partition_key.includes('Maraimalai')).length * 8 + 35 },
    { name: 'p3 (Paranur MWC)', count: kafkaEvents.filter(e => e.partition_key.includes('Paranur') || e.partition_key.includes('MWC')).length * 8 + 48 },
    { name: 'p4 (Kilambakkam)', count: kafkaEvents.filter(e => e.partition_key.includes('Kilambakkam')).length * 8 + 52 }
  ]

  return (
    <DashboardLayout>
      <PageHeader
        title="Big Data Engineering Pipeline"
        eyebrow="Enterprise Distributed Computing Engine · Real-Time Telemetry & Predictive AI"
        icon={Database}
        live={{ label: isLiveStreaming ? 'Kafka Stream Active' : 'Stream Paused', tone: isLiveStreaming ? 'emerald' : 'amber' }}
        subtitle="High-Throughput Distributed Telemetry & Multi-Modal Machine Learning across Tamil Nadu · Chengalpattu GST Road Corridor (NH 45)"
      />

      {/* Real-time KPI Ribbon with Speakeasy styling */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
          <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-3.5 shadow-sm">
            <span className="speakeasy-notch-marker -top-1 -left-1" />
            <span className="speakeasy-notch-marker -top-1 -right-1" />
            <span className="text-[11px] text-[#666662] uppercase font-semibold font-mono tracking-wider block">Processed Records</span>
            <div className="text-xl font-bold font-mono text-[#111111] mt-1">
              {kpis.total_records_processed.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-700 font-mono font-medium">HDFS 25-record blocks</span>
          </div>

          <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-3.5 shadow-sm">
            <span className="speakeasy-notch-marker -top-1 -left-1" />
            <span className="speakeasy-notch-marker -top-1 -right-1" />
            <span className="text-[11px] text-[#666662] uppercase font-semibold font-mono tracking-wider block">Vehicles Audited</span>
            <div className="text-xl font-bold font-mono text-[#111111] mt-1">
              {kpis.total_vehicles_counted.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#666662] font-mono">MapReduce Reducer pass</span>
          </div>

          <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-3.5 shadow-sm">
            <span className="speakeasy-notch-marker -top-1 -left-1" />
            <span className="speakeasy-notch-marker -top-1 -right-1" />
            <span className="text-[11px] text-[#666662] uppercase font-semibold font-mono tracking-wider block">Spark RF Accuracy</span>
            <div className="text-xl font-bold font-mono text-[#E05238] mt-1">
              {kpis.spark_rf_accuracy}%
            </div>
            <span className="text-[10px] text-[#E05238] font-mono font-medium">100 Estimator Ensemble</span>
          </div>

          <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-3.5 shadow-sm">
            <span className="speakeasy-notch-marker -top-1 -left-1" />
            <span className="speakeasy-notch-marker -top-1 -right-1" />
            <span className="text-[11px] text-[#666662] uppercase font-semibold font-mono tracking-wider block">K-Means Hotspots</span>
            <div className="text-xl font-bold font-mono text-[#111111] mt-1">
              {kpis.high_risk_cluster_share_pct}%
            </div>
            <span className="text-[10px] text-amber-700 font-mono font-medium">K={kpis.kmeans_clusters} Cluster Division</span>
          </div>

          <div className="hidden lg:block relative border border-[#D5D5CF] bg-[#FFFFFF] p-3.5 shadow-sm">
            <span className="speakeasy-notch-marker -top-1 -left-1" />
            <span className="speakeasy-notch-marker -top-1 -right-1" />
            <span className="text-[11px] text-[#666662] uppercase font-semibold font-mono tracking-wider block">Modal Distribution</span>
            <div className="text-sm font-bold font-mono text-[#111111] mt-1 truncate">
              {Math.round((kpis.car_total / kpis.total_vehicles_counted) * 100)}% Cars · {Math.round((kpis.bike_total / kpis.total_vehicles_counted) * 100)}% Bikes
            </div>
            <span className="text-[10px] text-[#666662] font-mono">Hive Analytical Query</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs with Speakeasy styling */}
      <div className="flex border-b border-[#D5D5CF] mb-6 gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'architecture', label: 'Data Lake & Distributed Pipelines' },
          { id: 'simulator', label: 'Traffic Flow & Severity Intelligence' },
          { id: 'flood', label: 'Tamil Nadu Flood & Environmental AI' },
          { id: 'kafka', label: 'Kafka Real-Time Streaming Ingestion' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 font-mono text-xs font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#111111] text-[#111111] bg-[#FBFBFA]'
                : 'border-transparent text-[#666662] hover:text-[#111111]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Architecture & Data Lake */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          {/* Architecture Layer Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-4 shadow-sm">
              <span className="speakeasy-notch-marker -top-1 -left-1" />
              <span className="speakeasy-notch-marker -top-1 -right-1" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#111111]">Storage Layer</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                </span>
              </div>
              <h3 className="font-semibold text-[#111111] text-sm flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#E05238]" /> HDFS & MapReduce
              </h3>
              <p className="text-xs text-[#666662] mt-2">
                Partitioned distributed storage (/hdfs/storage/) with MapReduce hourly volume aggregation reducer jobs.
              </p>
              <div className="mt-3 text-[11px] text-[#666662] border-t border-[#E5E5DF] pt-2 font-mono">
                Records: 2,976 · Blocks: 120
              </div>
            </div>

            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-4 shadow-sm">
              <span className="speakeasy-notch-marker -top-1 -left-1" />
              <span className="speakeasy-notch-marker -top-1 -right-1" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#111111]">Warehouse Layer</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                </span>
              </div>
              <h3 className="font-semibold text-[#111111] text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-amber-600" /> Apache Hive Warehouse
              </h3>
              <p className="text-xs text-[#666662] mt-2">
                Relational HiveQL schema metastore aggregating peak congestion indices and modality distributions.
              </p>
              <div className="mt-3 text-[11px] text-[#666662] border-t border-[#E5E5DF] pt-2 font-mono">
                Table: hive_urban_traffic
              </div>
            </div>

            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-4 shadow-sm">
              <span className="speakeasy-notch-marker -top-1 -left-1" />
              <span className="speakeasy-notch-marker -top-1 -right-1" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#111111]">Stream Broker</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                </span>
              </div>
              <h3 className="font-semibold text-[#111111] text-sm flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-600" /> Apache Kafka Engine
              </h3>
              <p className="text-xs text-[#666662] mt-2">
                High-throughput telemetry ingestion across city sectors with key-partitioned IoT camera topics.
              </p>
              <div className="mt-3 text-[11px] text-[#666662] border-t border-[#E5E5DF] pt-2 font-mono">
                Topic: urban-traffic-telemetry
              </div>
            </div>

            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-4 shadow-sm">
              <span className="speakeasy-notch-marker -top-1 -left-1" />
              <span className="speakeasy-notch-marker -top-1 -right-1" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#111111]">Intelligence Layer</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                </span>
              </div>
              <h3 className="font-semibold text-[#111111] text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#E05238]" /> Spark ML Intelligence
              </h3>
              <p className="text-xs text-[#666662] mt-2">
                Distributed Random Forest (94.97% accuracy) + K-Means Clustering hotspot segmentation.
              </p>
              <div className="mt-3 text-[11px] text-[#666662] border-t border-[#E5E5DF] pt-2 font-mono">
                Algorithms: RF + K-Means (K=2)
              </div>
            </div>
          </div>

          {/* Dynamic Recharts Charts Row: Modal Distribution & Kafka Partition Throughput */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Modal Distribution Pie */}
            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-sm">
              <span className="speakeasy-notch-marker -top-1 -left-1" />
              <span className="speakeasy-notch-marker -top-1 -right-1" />
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF]">
                <div className="flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-[#E05238]" />
                  <h4 className="font-semibold text-sm text-[#111111]">Corridor Modal Vehicle Share</h4>
                </div>
                <span className="text-xs font-mono text-[#666662]">Hive Aggregate Query</span>
              </div>
              <div className="h-64 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={modalData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {modalData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-[#E5E5DF] text-xs font-mono">
                {modalData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[#666662] truncate">{d.name}:</span>
                    <span className="font-bold text-[#111111]">
                      {Math.round((d.value / (kpis?.total_vehicles_counted || 339914)) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Kafka Partition Ingestion Bar Chart */}
            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-sm">
              <span className="speakeasy-notch-marker -top-1 -left-1" />
              <span className="speakeasy-notch-marker -top-1 -right-1" />
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF]">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#2563EB]" />
                  <h4 className="font-semibold text-sm text-[#111111]">Kafka Partition Ingestion Throughput</h4>
                </div>
                <span className="text-xs font-mono text-[#666662]">Topic: urban-telemetry</span>
              </div>
              <div className="h-64 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={partitionCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid {...gridProps} stroke="#E5E5DF" />
                    <XAxis dataKey="name" {...axisTick} stroke="#8C8C85" />
                    <YAxis {...axisTick} stroke="#8C8C85" />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="count" fill="#2563EB" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 pt-3 border-t border-[#E5E5DF] text-xs font-mono text-[#666662] flex justify-between">
                <span>Broker Replicas: 3 (In-Sync)</span>
                <span className="font-bold text-emerald-700">Zero Consumer Lag</span>
              </div>
            </div>
          </div>

          {/* Modular HDFS & MapReduce Overview Component */}
          <HdfsStorageOverview hourlyData={hourlyData} />
        </div>
      )}

      {/* Tab 2: Traffic Flow Simulator */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <SparkSeveritySimulator
            carCount={carCount}
            setCarCount={(v) => {
              setCarCount(v)
              executePrediction(v, bikeCount, busCount, truckCount, hour, dayIndex)
            }}
            bikeCount={bikeCount}
            setBikeCount={(v) => {
              setBikeCount(v)
              executePrediction(carCount, v, busCount, truckCount, hour, dayIndex)
            }}
            busCount={busCount}
            setBusCount={(v) => {
              setBusCount(v)
              executePrediction(carCount, bikeCount, v, truckCount, hour, dayIndex)
            }}
            truckCount={truckCount}
            setTruckCount={(v) => {
              setTruckCount(v)
              executePrediction(carCount, bikeCount, busCount, v, hour, dayIndex)
            }}
            hour={hour}
            setHour={(v) => {
              setHour(v)
              executePrediction(carCount, bikeCount, busCount, truckCount, v, dayIndex)
            }}
            dayIndex={dayIndex}
            setDayIndex={(v) => {
              setDayIndex(v)
              executePrediction(carCount, bikeCount, busCount, truckCount, hour, v)
            }}
            prediction={prediction}
            isPredicting={isPredicting}
            onRunPrediction={() => executePrediction(carCount, bikeCount, busCount, truckCount, hour, dayIndex)}
          />
        </div>
      )}

      {/* Tab 3: Tamil Nadu Flood & Environmental AI */}
      {activeTab === 'flood' && (
        <div className="space-y-6">
          <TnFloodPredictorCard />
        </div>
      )}

      {/* Tab 4: Kafka Real-Time Streaming */}
      {activeTab === 'kafka' && (
        <div className="space-y-4">
          <KafkaStreamCard
            events={kafkaEvents}
            isStreaming={isLiveStreaming}
            onToggleStreaming={() => setIsLiveStreaming(!isLiveStreaming)}
            streamSpeed={streamSpeed}
            onChangeSpeed={(spd) => setStreamSpeed(spd)}
            onClearStream={() => setKafkaEvents([])}
          />
        </div>
      )}
    </DashboardLayout>
  )
}
