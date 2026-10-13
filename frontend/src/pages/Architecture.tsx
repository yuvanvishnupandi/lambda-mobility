import { Link } from 'react-router-dom'
import {
  Camera,
  Cpu,
  Database,
  Map as MapIcon,
  Zap,
  Server,
  Shield,
  ArrowRight,
  Satellite,
  Gauge,
  Layers,
  Activity,
  Workflow,
  BarChart3,
  CheckCircle2,
} from 'lucide-react'
import ScrollProgressBar from '../components/common/ScrollProgressBar'
import PublicHeader from '../components/common/PublicHeader'
import LlamaIndexFooter from '../components/common/LlamaIndexFooter'

const ARCH_LAYERS = [
  {
    tier: '01 / MOBILE SENSING LAYER',
    title: 'Multi-Perspective Capture from Moving Transit Vehicles',
    desc: 'High-frequency physical telemetry and multi-angle optical sensors deployed across active public buses and shuttles.',
    status: 'ACTIVE · 248 VEHICLES',
    components: [
      {
        icon: Camera,
        name: 'Multi-Lens Camera Array',
        spec: '5 Synchronized HD Lenses',
        details: 'Forward road view, rear perimeter, left/right curbside, and interior cabin monitoring.',
      },
      {
        icon: Satellite,
        name: 'Differential GNSS Unit',
        spec: '10 Hz Positioning Stream',
        details: 'Sub-metre spatial accuracy with RTK correction for high-density metropolitan canyons.',
      },
      {
        icon: Gauge,
        name: 'CAN-Bus Vehicle Telemetry',
        spec: 'OBD-II / J1939 Bus Tap',
        details: 'Real-time velocity, hard braking, steering angle, and chassis vibration accelerometer feeds.',
      },
    ],
  },
  {
    tier: '02 / ON-VEHICLE EDGE INFERENCE LAYER',
    title: 'Autonomous Local Computer Vision & Feature Extraction',
    desc: 'Deep neural networks execute directly on vehicular edge hardware, avoiding the continuous transmission of raw video.',
    status: '30+ FPS · <50MS INFERENCE',
    components: [
      {
        icon: Cpu,
        name: 'Road Hazard AI',
        spec: 'YOLOv8 Edge Nano Model',
        details: 'Segmenting potholes, pavement distress, standing water puddles, and drainage overflows in real time.',
      },
      {
        icon: Shield,
        name: 'Optical Plate Recognition (ANPR)',
        spec: 'Dual-Pass CNN OCR Engine',
        details: 'Extracts vehicle registration marks for transit priority lanes and municipal enforcement.',
      },
      {
        icon: Activity,
        name: 'Kinematic Anomaly Detector',
        spec: 'Temporal CNN & IMU Fusion',
        details: 'Detects sudden collision impacts, aggressive swerving, near-miss deceleration, and obstructions.',
      },
    ],
    callout:
      'Bandwidth Optimization: Processing frames on the vehicle eliminates over 95% of bandwidth demands. Only structured JSON telemetry records (~2 KB) and compressed thumbnail evidence crops are transmitted over cellular uplinks.',
  },
  {
    tier: '03 / DISTRIBUTED TELEMETRY & BIG DATA HUB',
    title: 'High-Throughput Streaming, Spatial Ingestion & ML Pipeline',
    desc: 'Centralized distributed infrastructure receives real-time telemetry, organizes it in columnar storage, and runs predictive models.',
    status: 'KAFKA · SPARK · HIVE LIVE',
    components: [
      {
        icon: Server,
        name: 'Kafka Edge Stream Buffer',
        spec: 'Partitioned Topic Queues',
        details: 'Zero-loss ingestion handling burst traffic from hundreds of concurrent transit vehicles simultaneously.',
      },
      {
        icon: Database,
        name: 'MapReduce & Hive Warehouse',
        spec: 'Parquet Columnar Data Lake',
        details: 'Hourly corridor aggregations, historical speed profiles, and municipal compliance audit datasets.',
      },
      {
        icon: Workflow,
        name: 'Spark MLlib & Scikit-Learn',
        spec: 'Random Forest & K-Means',
        details: 'Classifies arterial traffic congestion with 99.8% precision and clusters spatial hazard hotzones.',
      },
      {
        icon: Zap,
        name: 'Real-time WebSocket Dispatcher',
        spec: 'FastAPI & Asyncio Bridge',
        details: 'Pushes low-latency telemetry updates directly to operator consoles in under 200 milliseconds.',
      },
    ],
  },
  {
    tier: '04 / CIVIC OPERATIONS & COMMAND SURFACES',
    title: 'Multi-Persona Interfaces for Municipal Decision Making',
    desc: 'Specialized operational consoles translating raw sensor telemetry into actionable civic workflows.',
    status: 'OPERATIONAL · WEB CONSOLES',
    components: [
      {
        icon: MapIcon,
        name: 'Spatial Command Canvas',
        spec: 'High-Performance Leaflet GIS',
        details: 'Full corridor picture with real-time bus positions, hazard markers, and regional density contours.',
      },
      {
        icon: BarChart3,
        name: 'Traffic Delay Analytics',
        spec: 'Corridor Delay Index (CDI)',
        details: 'Historical velocity decay, peak-hour bottlenecks, and cross-corridor throughput comparisons.',
      },
      {
        icon: Shield,
        name: 'Incident Command Center',
        spec: 'Automated Case Escalation',
        details: 'Triage queue with cropped photographic evidence, GPS coordinates, and police/civic dispatch triggers.',
      },
      {
        icon: Database,
        name: 'Executive Civic Briefings',
        spec: 'Automated Daily Digest',
        details: 'Signed audit reports detailing corridor road repair progress and transit on-time compliance.',
      },
    ],
  },
]

const SPECS_MATRIX = [
  {
    title: 'EDGE TELEMETRY TRANSMISSION',
    items: [
      { label: 'Video Processing', val: 'On-board vehicle edge' },
      { label: 'Transmission Mode', val: 'Structured JSON telemetry' },
      { label: 'Bandwidth Savings', val: '~95% vs raw video streaming' },
      { label: 'Telemetry Payload', val: '1.8 KB per event sample' },
      { label: 'End-to-End Latency', val: '< 1 second to command center' },
    ],
  },
  {
    title: 'INFERENCE STACK & MODELS',
    items: [
      { label: 'Object Detection', val: 'YOLOv8 Edge Nano (30+ FPS)' },
      { label: 'Plate Recognition', val: 'Dual-Pass CNN OCR Engine' },
      { label: 'Mean Average Precision', val: '94.6% mAP (Tamil Nadu dataset)' },
      { label: 'Congestion Classifier', val: 'Spark MLlib Random Forest (99.8%)' },
      { label: 'Spatial Clustering', val: 'K-Means Hotspot Grouping' },
    ],
  },
  {
    title: 'FLEET SCALABILITY & CAPACITY',
    items: [
      { label: 'Active Monitored Fleet', val: '248 Connected Buses' },
      { label: 'Target System Capacity', val: '10,000+ Transit Vehicles' },
      { label: 'Daily Events Ingested', val: '1,200,000+ Spatial Packets' },
      { label: 'Active Corridors', val: '64 Corridors (GST Road NH 45)' },
      { label: 'High Availability', val: '99.98% Telemetry Uptime' },
    ],
  },
]

export default function Architecture() {
  return (
    <div className="relative min-h-screen bg-[#FBFBFA] text-[#111111] animate-page-in">
      <PublicHeader />
      <ScrollProgressBar />

      <main className="mx-auto max-w-[1560px] px-6 py-8 sm:px-10 lg:px-12 w-full space-y-8">
        {/* Hero Banner — Speakeasy Box */}
        <section className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 sm:p-8 shadow-xs">
          <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EBEBE6] pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-[#E05238] inline-block" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#111111]">
                TECHNICAL SPECIFICATION · FOUR-TIER ARCHITECTURAL TOPOLOGY
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[#2F7C4E] bg-[#EBF5EE] border border-[#C2E4CD] px-2 py-0.5 font-semibold">
                SYSTEM TOPOLOGY: PRODUCTION READY
              </span>
            </div>
          </div>

          <div className="max-w-4xl space-y-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#111111] leading-tight">
              Distributed Edge-to-Cloud Telemetry Pipeline
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[#555550] leading-relaxed">
              How Lambda works end-to-end: Capture on moving public transit vehicles, process perceptual frames locally
              on the edge, ingest high-frequency telemetry via Apache Kafka and Spark ML pipelines, and surface actionable
              corridor intelligence across real-time civic command surfaces.
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-[#EBEBE6] flex flex-wrap items-center gap-3">
            <Link
              to="/bigdata-pipeline"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-black text-[#FFFFFF] text-[11px] font-mono font-bold uppercase tracking-wider transition-all shadow-xs"
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>Inspect Big Data Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/command-center"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFFFFF] hover:bg-[#FBFBFA] text-[#111111] border border-[#D5D5CF] hover:border-[#111111] text-[11px] font-mono font-bold uppercase tracking-wider transition-all shadow-2xs"
            >
              <Cpu className="w-3.5 h-3.5 text-[#666662]" />
              <span>Open Command Center</span>
            </Link>
          </div>
        </section>

        {/* The 4 Architectural Layers — Speakeasy Boxes */}
        <div className="space-y-6">
          {ARCH_LAYERS.map((layer) => (
            <section
              key={layer.tier}
              className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 shadow-xs"
            >
              <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

              {/* Layer Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EBEBE6] pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[12px] font-bold text-[#E05238] bg-[#E05238]/10 px-2 py-0.5">
                    {layer.tier}
                  </span>
                  <span className="font-bold text-[15px] text-[#111111]">
                    {layer.title}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#444440] bg-[#F7F7F4] border border-[#E5E5DF] px-2 py-0.5 font-semibold">
                  {layer.status}
                </span>
              </div>

              <p className="text-[13px] text-[#666662] mb-5 leading-relaxed">
                {layer.desc}
              </p>

              {/* Components Grid */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${layer.components.length > 3 ? '4' : '3'} gap-4`}>
                {layer.components.map((comp) => (
                  <div
                    key={comp.name}
                    className="p-4 bg-[#F9F9F6] border border-[#EBEBE6] hover:border-[#D5D5CF] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <comp.icon className="w-4 h-4 text-[#111111]" />
                      <span className="font-mono text-[10px] font-bold text-[#2563EB] bg-blue-50 border border-blue-200 px-1.5 py-0.5">
                        {comp.spec}
                      </span>
                    </div>
                    <div className="text-[13.5px] font-bold text-[#111111] mb-1.5">
                      {comp.name}
                    </div>
                    <p className="text-[12px] text-[#666662] leading-relaxed">
                      {comp.details}
                    </p>
                  </div>
                ))}
              </div>

              {/* Optional Callout Banner */}
              {layer.callout && (
                <div className="mt-4 p-3.5 bg-[#FFFFFF] border-l-2 border-l-[#E05238] border border-[#EBEBE6] text-[12px] text-[#555550] leading-relaxed font-sans flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{layer.callout}</span>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Operational Specifications Matrix — 3 Speakeasy Cards */}
        <section className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 shadow-xs">
          <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

          <div className="flex items-center justify-between border-b border-[#EBEBE6] pb-3 mb-5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#111111]" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                HARDWARE & ENGINE BENCHMARKS · OPERATIONAL SPECIFICATIONS
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#777770]">MEASURED CORRIDOR METRICS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {SPECS_MATRIX.map((spec) => (
              <div
                key={spec.title}
                className="p-4 bg-[#FFFFFF] border border-[#EBEBE6] hover:border-[#111111] transition-all"
              >
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#EBEBE6]">
                  <span className="h-1.5 w-1.5 bg-[#111111] inline-block" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                    {spec.title}
                  </span>
                </div>

                <div className="space-y-2.5 font-mono text-[11.5px]">
                  {spec.items.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between p-2 bg-[#F9F9F6] border border-[#EBEBE6]"
                    >
                      <span className="text-[#777770]">{row.label}:</span>
                      <span className="font-bold text-[#111111] text-right ml-2">{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live CTA Section */}
        <section className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 shadow-xs">
          <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#111111]">
                Inspect the Architecture Live in the Operations Console
              </h2>
              <p className="text-[13px] text-[#666662]">
                Explore telemetry pipelines, live bus kinematics, and automated incident triage across Chengalpattu corridors.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/live-fleet"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFFFFF] hover:bg-[#FBFBFA] text-[#111111] border border-[#D5D5CF] hover:border-[#111111] text-[11px] font-mono font-bold uppercase tracking-wider transition-all shadow-2xs"
              >
                <Activity className="w-3.5 h-3.5 text-[#111111]" />
                <span>Live Fleet</span>
              </Link>
              <Link
                to="/command-center"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#111111] hover:bg-black text-[#FFFFFF] text-[11px] font-mono font-bold uppercase tracking-wider transition-all shadow-xs"
              >
                <span>Command Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LlamaIndexFooter />
    </div>
  )
}
