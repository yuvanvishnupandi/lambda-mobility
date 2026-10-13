import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  ArrowRight,
  Radio,
  Cpu,
  Map as MapIcon,
  BarChart3,
  Target,
  Lightbulb,
} from 'lucide-react'
import ScrollProgressBar from '../components/common/ScrollProgressBar'
import PublicHeader from '../components/common/PublicHeader'
import LlamaIndexFooter from '../components/common/LlamaIndexFooter'

const CAPABILITIES = [
  {
    title: 'Road Hazard AI',
    desc: 'Automated detection of potholes, pavement cracking, standing water pooling, and drain overflows.',
    tag: 'CV · YOLOv8 Nano',
    stat: '98.4% Acc',
  },
  {
    title: 'Corridor Delay & Density',
    desc: 'Real-time traffic density estimation, arterial speed indexing, and congestion bottleneck forecasting.',
    tag: 'Spark MLlib · RF',
    stat: '99.8% Acc',
  },
  {
    title: 'Infrastructure Integrity',
    desc: 'Continuous surveillance of median dividers, lane markers, overhead signage, and street furniture.',
    tag: 'Edge Segmentation',
    stat: 'Sub-meter GIS',
  },
  {
    title: 'Incident Command',
    desc: 'Immediate flagging of vehicle collisions, disabled vehicles, unauthorized roadblocks, and lane obstructions.',
    tag: 'Temporal CNN',
    stat: '<50ms Trigger',
  },
  {
    title: 'Plate Recognition (ANPR)',
    desc: 'Dual-pass optical character recognition for transport audit, bus-lane enforcement, and transit compliance.',
    tag: 'OCR Engine',
    stat: '94.6% mAP',
  },
  {
    title: 'Vulnerable Road Users',
    desc: 'Spatial tracking of pedestrians, cyclist clusters, and transit passengers around school zones and bus shelters.',
    tag: 'Cross-Object Tracking',
    stat: '30 FPS Live',
  },
]

const STACK_MODULES = [
  {
    category: '01 / Edge Sensing',
    name: 'YOLOv8 & Mobile Cameras',
    desc: 'Synchronized HD camera lenses and GNSS receivers mounted on public buses for on-board inference.',
    badge: 'Hardware Edge',
  },
  {
    category: '02 / Telemetry Stream',
    name: 'Kafka & Hive Pipeline',
    desc: 'High-throughput event streaming handling millions of spatial telemetry packets per corridor day.',
    badge: 'Distributed Pub/Sub',
  },
  {
    category: '03 / Predictive Engine',
    name: 'Spark MLlib & Scikit-Learn',
    desc: 'Random Forest classifiers for arterial congestion and K-Means spatial clustering for hazard zones.',
    badge: 'Joblib & Python 3.11',
  },
  {
    category: '04 / Operations Canvas',
    name: 'Leaflet GIS & Recharts',
    desc: 'Low-latency operator command interface with real-time incident queues and automated municipal briefs.',
    badge: 'React 18 & Vite',
  },
]

export default function About() {
  return (
    <div className="relative min-h-screen bg-[#FBFBFA] text-[#111111] animate-page-in">
      <PublicHeader />
      <ScrollProgressBar />

      <main className="mx-auto max-w-[1560px] px-6 py-8 sm:px-10 lg:px-12 w-full space-y-8">
        {/* Top Hero Banner — Speakeasy Box */}
        <section className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 sm:p-8 shadow-xs">
          <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EBEBE6] pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-[#E05238] inline-block" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#111111]">
                ABOUT THE PLATFORM · REGIONAL TRANSIT INTELLIGENCE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[#2F7C4E] bg-[#EBF5EE] border border-[#C2E4CD] px-2 py-0.5 font-semibold">
                OPERATIONAL · CHENGALPATTU & CHENNAI
              </span>
            </div>
          </div>

          <div className="max-w-4xl space-y-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#111111] leading-tight">
              Public transport already covers the city. We gave it a way to observe.
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[#555550] leading-relaxed">
              Lambda transforms everyday public transit buses into an autonomous, distributed mobile sensor mesh.
              As each vehicle runs its normal scheduled route along the Grand Southern Trunk (GST Road / NH 45) corridor,
              on-board edge intelligence continuously analyzes road pavement quality, traffic density, and safety anomalies—giving
              civic operators full arterial visibility without erecting expensive roadside camera poles.
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-[#EBEBE6] flex flex-wrap items-center gap-3">
            <Link
              to="/command-center"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-black text-[#FFFFFF] text-[11px] font-mono font-bold uppercase tracking-wider transition-all shadow-xs"
            >
              <span>Open Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/architecture"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFFFFF] hover:bg-[#FBFBFA] text-[#111111] border border-[#D5D5CF] hover:border-[#111111] text-[11px] font-mono font-bold uppercase tracking-wider transition-all shadow-2xs"
            >
              <Cpu className="w-3.5 h-3.5 text-[#666662]" />
              <span>Inspect Architecture</span>
            </Link>
          </div>
        </section>

        {/* The Problem vs. The Approach — 2 Connected Speakeasy Boxes */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Box 1: The Problem */}
          <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 shadow-xs flex flex-col justify-between">
            <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
            <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
            <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
            <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

            <div>
              <div className="flex items-center justify-between border-b border-[#EBEBE6] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-600" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                    THE CHALLENGE · ARTERIAL BLIND SPOTS
                  </span>
                </div>
                <span className="font-mono text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5">
                  LEGACY SHORTCOMINGS
                </span>
              </div>

              <h2 className="text-lg font-bold text-[#111111] mb-2.5">
                Uneven Coverage Where It Matters Most
              </h2>
              <p className="text-[13px] text-[#666662] leading-relaxed mb-5">
                Cities manage hundreds of kilometres of metropolitan roadways using static junction cameras that leave
                blind spots between intersections. Pothole inspections rely on slow manual surveys or citizen complaints
                filed long after vehicle damage occurs.
              </p>

              <div className="space-y-2 font-mono text-[11.5px] border-t border-[#EBEBE6] pt-4">
                <div className="flex items-center justify-between p-2.5 bg-[#F9F9F6] border border-[#EBEBE6]">
                  <span className="text-[#777770]">Fixed CCTV Arterial Coverage:</span>
                  <span className="font-bold text-[#111111]">&lt;18% of Total Route Km</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#F9F9F6] border border-[#EBEBE6]">
                  <span className="text-[#777770]">Manual Audit Lag:</span>
                  <span className="font-bold text-rose-700">14 to 30 Days</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#F9F9F6] border border-[#EBEBE6]">
                  <span className="text-[#777770]">Deployment Capital Cost:</span>
                  <span className="font-bold text-[#111111]">₹450,000 per Gantry</span>
                </div>
              </div>
            </div>
          </div>

          {/* Box 2: The Approach */}
          <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 shadow-xs flex flex-col justify-between">
            <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
            <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
            <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
            <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

            <div>
              <div className="flex items-center justify-between border-b border-[#EBEBE6] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-emerald-600" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                    THE ARCHITECTURE · CONTINUOUS TRANSIT OBSERVATION
                  </span>
                </div>
                <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5">
                  LAMBDA SOLUTION
                </span>
              </div>

              <h2 className="text-lg font-bold text-[#111111] mb-2.5">
                Perception Hardware Rides on Active Fleets
              </h2>
              <p className="text-[13px] text-[#666662] leading-relaxed mb-5">
                Low-power edge devices mounted behind vehicle windscreens run real-time computer vision models locally.
                Instead of streaming massive raw video streams, vehicles emit small, structured telemetry events
                with precise GPS coordinates, severity scores, and cropped evidence.
              </p>

              <div className="space-y-2 font-mono text-[11.5px] border-t border-[#EBEBE6] pt-4">
                <div className="flex items-center justify-between p-2.5 bg-[#F9F9F6] border border-[#EBEBE6]">
                  <span className="text-[#777770]">Network Route Coverage:</span>
                  <span className="font-bold text-emerald-700">100% of Fleet Transit Paths</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#F9F9F6] border border-[#EBEBE6]">
                  <span className="text-[#777770]">Edge Detection Latency:</span>
                  <span className="font-bold text-[#111111]">&lt;50 Milliseconds</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#F9F9F6] border border-[#EBEBE6]">
                  <span className="text-[#777770]">Bandwidth Efficiency:</span>
                  <span className="font-bold text-emerald-700">95% Saved vs Video</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sensory Capabilities Grid — Speakeasy Card with 6 Cells */}
        <section className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 shadow-xs">
          <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

          <div className="flex items-center justify-between border-b border-[#EBEBE6] pb-3 mb-5">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#111111]" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                CONTINUOUS DETECTION FAMILIES · 6 ACTIVE SUBSYSTEMS
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#777770]">ON-BOARD INFERENCE RUNNING AT 30 FPS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAPABILITIES.map((cap) => (
              <div
                key={cap.title}
                className="p-4 bg-[#F9F9F6] border border-[#EBEBE6] hover:border-[#D5D5CF] transition-colors relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold uppercase text-[#E05238] bg-[#E05238]/10 px-1.5 py-0.5">
                    {cap.tag}
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-[#2F7C4E]">
                    {cap.stat}
                  </span>
                </div>
                <h3 className="text-[13.5px] font-bold text-[#111111] mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {cap.title}
                </h3>
                <p className="text-[12px] text-[#666662] leading-relaxed">
                  {cap.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Technology Stack — Speakeasy Grid */}
        <section className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 shadow-xs">
          <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

          <div className="flex items-center justify-between border-b border-[#EBEBE6] pb-3 mb-5">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#111111]" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                UNDER THE HOOD · DISTRIBUTED ARCHITECTURAL STACK
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#777770]">END-TO-END PIPELINE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STACK_MODULES.map((item) => (
              <div
                key={item.category}
                className="p-4 bg-[#FFFFFF] border border-[#EBEBE6] hover:border-[#111111] transition-all"
              >
                <div className="font-mono text-[10px] text-[#888880] uppercase tracking-wider mb-1">
                  {item.category}
                </div>
                <div className="text-[14px] font-bold text-[#111111] mb-1">
                  {item.name}
                </div>
                <p className="text-[12px] text-[#666662] leading-relaxed mb-3">
                  {item.desc}
                </p>
                <div className="pt-2 border-t border-[#EBEBE6]">
                  <span className="font-mono text-[10px] text-[#444440] bg-[#F7F7F4] border border-[#E5E5DF] px-2 py-0.5">
                    {item.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live Operational Corridor & Deployment Stats — Speakeasy Banner */}
        <section className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 shadow-xs">
          <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-[#E05238]" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                  CORRIDOR FIELD DEPLOYMENT · CHENGALPATTU & NH 45
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#111111]">
                Active Coverage Across Metropolitan Transit Arteries
              </h2>
              <p className="text-[13px] text-[#666662] leading-relaxed">
                Deployed on MTC Metropolitan buses, electric corporate shuttles, and Southern Railway suburban stations
                spanning the Grand Southern Trunk (GST Road) arterial corridor.
              </p>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto font-mono">
              <div className="p-3 bg-[#F9F9F6] border border-[#EBEBE6] text-center min-w-[100px]">
                <div className="text-xl font-bold text-[#111111]">3</div>
                <div className="text-[10px] text-[#777770] uppercase">Districts</div>
              </div>
              <div className="p-3 bg-[#F9F9F6] border border-[#EBEBE6] text-center min-w-[100px]">
                <div className="text-xl font-bold text-[#111111]">248</div>
                <div className="text-[10px] text-[#777770] uppercase">Fleet Buses</div>
              </div>
              <div className="p-3 bg-[#F9F9F6] border border-[#EBEBE6] text-center min-w-[100px]">
                <div className="text-xl font-bold text-[#111111]">64</div>
                <div className="text-[10px] text-[#777770] uppercase">Corridors</div>
              </div>
              <div className="p-3 bg-[#F9F9F6] border border-[#EBEBE6] text-center min-w-[100px]">
                <div className="text-xl font-bold text-[#2F7C4E]">1.2M+</div>
                <div className="text-[10px] text-[#777770] uppercase">Daily Events</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[#EBEBE6] flex flex-wrap items-center justify-between gap-4">
            <span className="font-mono text-[11px] text-[#666662]">
              Explore the live geographical layers and real-time transit telemetry:
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/urban-map"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFFFFF] hover:bg-[#FBFBFA] text-[#111111] border border-[#D5D5CF] hover:border-[#111111] text-[11px] font-mono font-bold uppercase tracking-wider transition-all shadow-2xs"
              >
                <MapIcon className="w-3.5 h-3.5 text-[#111111]" />
                <span>Open Spatial GIS</span>
              </Link>
              <Link
                to="/traffic-analytics"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#111111] hover:bg-black text-[#FFFFFF] text-[11px] font-mono font-bold uppercase tracking-wider transition-all shadow-xs"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Traffic Analytics</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LlamaIndexFooter />
    </div>
  )
}
