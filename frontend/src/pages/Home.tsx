import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Terminal,
  Check
} from 'lucide-react'
import LlamaIndexFooter from '../components/common/LlamaIndexFooter'
import PublicHeader from '../components/common/PublicHeader'

export const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'commuter' | 'dispatch'>('dispatch')
  const [liveTelemetryTick, setLiveTelemetryTick] = useState({
    vehicleId: 'TN-11-N-4892',
    route: 'Route 500A (GST Arterial)',
    location: 'SRM IST Main Gate Sector',
    speed: 46.2,
    pciIndex: 88.4,
    trafficLevel: 'MODERATE',
    rfConfidence: 94.8,
    cluster: 'FLOW-OPTIMIZED',
    kafkaOffset: 489218
  })

  // Simulated live telemetry stream update (Speakeasy live demo style)
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTelemetryTick((prev) => ({
        ...prev,
        speed: +(38 + Math.random() * 16).toFixed(1),
        rfConfidence: +(92 + Math.random() * 6).toFixed(1),
        kafkaOffset: prev.kafkaOffset + Math.floor(Math.random() * 7) + 1
      }))
    }, 2800)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#111111] font-sans selection:bg-[#E05238]/20 antialiased overflow-x-hidden">
      {/* Unified Speakeasy Public Header */}
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-12 pb-20 sm:px-8 md:pt-20 md:pb-24 lg:px-12 border-b border-[#E5E5DF]">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left Column: Eyebrow + Headline + Description + CTAs */}
            <div className="lg:col-span-7 space-y-7">
              {/* Announcement Eyebrow Badge (Speakeasy Style with 4px Hard Drop Shadow) */}
              <div>
                <Link
                  to="/bigdata-pipeline"
                  className="group inline-flex items-center gap-2.5 border border-[#D0D0C8] bg-[#F7F7F4] px-4 py-2 text-[12px] font-mono text-[#111111] shadow-[4px_4px_0_#E5E5DF] hover:shadow-[5px_5px_0_#D0D0C8] transition-all hover:-translate-x-px hover:-translate-y-px"
                >
                  <span className="h-2 w-2 bg-[#E05238] inline-block" />
                  <span className="text-[#777770] font-normal">New</span>
                  <span className="font-semibold">Full Big Data Telemetry for Chengalpattu Corridor</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>

              {/* Display Headline (Speakeasy Exact Style) */}
              <h1 className="text-[clamp(3.2rem,6.2vw,6.4rem)] font-extrabold leading-[0.98] tracking-[-0.035em] text-[#111111]">
                <span className="block">Securely Scale</span>
                <span className="block">Urban Mobility.</span>
              </h1>

              {/* Lead Paragraph */}
              <p className="max-w-[620px] text-[1.125rem] md:text-[1.25rem] leading-[1.38] text-[#5A5A54] font-normal">
                The AI control plane for every transit vehicle, sensor probe, and arterial corridor in your municipality.
                Built around distributed Apache Kafka streams, Spark MLlib classifiers, and spatial GIS.
                Give each department one governed path to real-time telemetry, with safety and dispatch policy enforced on every action.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                <Link
                  to="/command-center"
                  className="inline-flex items-center justify-center px-7 py-3.5 bg-[#111111] hover:bg-black text-white text-[13.5px] font-medium transition-all rounded-[4px] shadow-sm whitespace-nowrap"
                >
                  Deploy for free
                </Link>
                <Link
                  to="/journey-planner"
                  className="inline-flex items-center justify-center px-7 py-3.5 border border-[#D0D0C8] bg-white text-[#111111] hover:bg-[#F2F2EC] text-[13.5px] font-medium transition-all rounded-[4px] shadow-xs whitespace-nowrap"
                >
                  Plan Journey
                </Link>
              </div>
            </div>

            {/* Right Column: Live Interactive Telemetry Card (Speakeasy System Inspector) */}
            <div className="lg:col-span-5">
              <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xl">
                {/* 4 Corner Crosshairs */}
                <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
                <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
                <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
                <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

                {/* Card Top Terminal Header */}
                <div className="flex items-center justify-between border-b border-[#EBEBE6] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#2F7C4E] animate-pulse" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                      Live Corridor Probe · Chengalpattu GST
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#888880]">
                    Offset #{liveTelemetryTick.kafkaOffset}
                  </span>
                </div>

                {/* Telemetry Key-Value Matrix */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-[#F9F9F6] border border-[#EBEBE6]">
                    <span className="text-[#777770]">Vehicle Identifier:</span>
                    <span className="font-bold text-[#111111]">{liveTelemetryTick.vehicleId}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#F9F9F6] border border-[#EBEBE6]">
                    <span className="text-[#777770]">Route / Sector:</span>
                    <span className="font-semibold text-[#111111]">{liveTelemetryTick.route}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#F9F9F6] border border-[#EBEBE6]">
                    <span className="text-[#777770]">Kinematic Velocity:</span>
                    <span className="font-bold text-[#2563EB]">{liveTelemetryTick.speed} km/h (Smooth Flow)</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#F9F9F6] border border-[#EBEBE6]">
                    <span className="text-[#777770]">Spark ML Random Forest:</span>
                    <span className="font-bold text-[#2F7C4E]">{liveTelemetryTick.rfConfidence}% Confidence</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#F9F9F6] border border-[#EBEBE6]">
                    <span className="text-[#777770]">K-Means Clustered Hotspot:</span>
                    <span className="font-semibold text-[#D97706]">{liveTelemetryTick.cluster} (Zone 0)</span>
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="mt-4 pt-3 border-t border-[#EBEBE6] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#777770] font-mono">Dynamic Poisson ticks active</span>
                  <Link
                    to="/live-fleet"
                    className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-[#E05238] hover:underline"
                  >
                    Open Live Feed →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Corridor Deployments */}
      <section className="relative px-6 py-14 sm:px-8 lg:px-12 border-b border-[#E5E5DF] bg-[#F7F7F4]">
        <div className="mx-auto max-w-[1440px]">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#888880] mb-6">
            Institutional Transit Partners & Corridors
          </p>

          <div className="relative border border-[#D5D5CF] bg-[#FFFFFF]">
            {/* 4 Corner Crosshairs */}
            <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
            <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
            <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
            <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

            {/* Row 1: The biggest corridors */}
            <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr] border-b border-[#E5E5DF]">
              <div className="flex items-center p-6 bg-[#FAFAF7] border-b md:border-b-0 md:border-r border-[#E5E5DF]">
                <p className="text-[1.25rem] font-bold tracking-tight text-[#111111]">
                  The <span className="underline decoration-[#E05238] decoration-2 underline-offset-4">arterial</span> corridors
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[#E5E5DF]">
                <div className="flex h-20 items-center justify-center p-4 text-center font-mono text-xs font-bold text-[#444440]">
                  SRM IST Kattankulathur
                </div>
                <div className="flex h-20 items-center justify-center p-4 text-center font-mono text-xs font-bold text-[#444440]">
                  Chennai Metropolitan (CMDA)
                </div>
                <div className="flex h-20 items-center justify-center p-4 text-center font-mono text-xs font-bold text-[#444440]">
                  MTC Chennai Transit (R-500)
                </div>
                <div className="flex h-20 items-center justify-center p-4 text-center font-mono text-xs font-bold text-[#444440]">
                  TNSTC Chengalpattu Division
                </div>
              </div>
            </div>

            {/* Row 2: The fastest hubs */}
            <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr]">
              <div className="flex items-center p-6 bg-[#FAFAF7] border-b md:border-b-0 md:border-r border-[#E5E5DF]">
                <p className="text-[1.25rem] font-bold tracking-tight text-[#111111]">
                  The <span className="underline decoration-[#2563EB] decoration-2 underline-offset-4">fastest</span> tech hubs
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[#E5E5DF]">
                <div className="flex h-20 items-center justify-center p-4 text-center font-mono text-xs font-bold text-[#444440]">
                  Cybervale Technology Park
                </div>
                <div className="flex h-20 items-center justify-center p-4 text-center font-mono text-xs font-bold text-[#444440]">
                  Oragadam Industrial SIPCOT
                </div>
                <div className="flex h-20 items-center justify-center p-4 text-center font-mono text-xs font-bold text-[#444440]">
                  Maraimalai Nagar Auto Zone
                </div>
                <div className="flex h-20 items-center justify-center p-4 text-center font-mono text-xs font-bold text-[#444440]">
                  TIDEL Park IT Highway
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solutions */}
      <section className="relative px-6 py-20 sm:px-8 md:py-24 lg:px-12 border-b border-[#E5E5DF]">
        <div className="mx-auto max-w-[1440px]">
          <h2 className="text-[clamp(2.4rem,4.5vw,4.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-[#111111] max-w-[960px] mb-14">
            The missing pieces in your municipality's transit rollout.
          </h2>

          <div className="relative grid grid-cols-1 lg:grid-cols-3 border border-[#D5D5CF] bg-[#FFFFFF]">
            {/* Corner Crosshairs */}
            <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
            <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
            <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
            <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

            {/* Column 1: Fleet Kinematics (CONNECT) with ASCII Art */}
            <div className="flex flex-col p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-[#E5E5DF]">
              {/* ASCII Art in Moss Green */}
              <div className="mb-6 font-mono text-[5px] select-none text-[#2F7C4E] leading-[1.1]">
                <pre>{`
  xv---·x-v·-·x·vvxv·--vvxxxvv··v·v 
  -·v·vx·x---·vxvvx--vvvvvxxx-v·vxv 
  xvxvxvvxx·--·vx·x-v·--xvxv-vxv-xv 
  vv-v--·  vv-vvx-xxxxv·xv-v·x-vx-v 
  -vv-x      x--vvx            x·xx 
  ·xxv-      xvxvvv·vxvxx··--vx·xvx 
  vvv-v       x·vv-v·--xvvvv··xxvvx 
  xvvvv      vvx-xx        -vvvvv·v 
  vvx·vv     vxx-vxxxx-vxvvv-x·xxvv 
                `}</pre>
              </div>

              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#2F7C4E] mb-1">
                ▪ Connect
              </p>
              <h3 className="text-[1.75rem] font-bold tracking-tight text-[#111111]">
                Fleet Kinematics & Identity
              </h3>
              <p className="text-[14px] leading-relaxed text-[#666660] mt-3 mb-8">
                Every vehicle probe operates under verified GNSS telemetry and assigned corridor identity.
              </p>

              <div className="mt-auto space-y-3 pt-6 border-t border-[#E5E5DF]">
                <div className="flex items-center gap-2.5 font-mono text-[12px] text-[#222220]">
                  <Check className="h-3.5 w-3.5 text-[#2F7C4E] flex-shrink-0" />
                  <span>Access governed by municipal dispatch identity</span>
                </div>
                <div className="flex items-center gap-2.5 font-mono text-[12px] text-[#222220]">
                  <Check className="h-3.5 w-3.5 text-[#2F7C4E] flex-shrink-0" />
                  <span>Short-lived, route-scoped sensor credentials</span>
                </div>
                <div className="flex items-center gap-2.5 font-mono text-[12px] text-[#222220]">
                  <Check className="h-3.5 w-3.5 text-[#2F7C4E] flex-shrink-0" />
                  <span>Every telemetry tick attributed to a vehicle probe</span>
                </div>
              </div>

              <Link
                to="/live-fleet"
                className="inline-flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-wider text-[#111111] hover:text-[#2F7C4E] mt-8 transition-colors"
              >
                <span>Explore Fleet Telemetry</span>
                <span>→</span>
              </Link>
            </div>

            {/* Column 2: Big Data Serving Gateway (DISTRIBUTE) */}
            <div className="flex flex-col p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-[#E5E5DF]">
              {/* ASCII Art in Ember Orange */}
              <div className="mb-6 font-mono text-[5px] select-none text-[#D97706] leading-[1.1]">
                <pre>{`
                 -x·vxx            
               -x--  ··x·          
             x·vv  ·-  vx          
           -·vx  x--v  vvxxx       
         x·--  x·x-  --xvxv-vxv    
       ·vvv  vvx-   xv·      -vx   
     x-v-   x--   -·x   ·x-  ·x·   
    v-x   --x   vv·   xx··  vx·    
    -    vv   ·vv-  --xv  v··x     
                `}</pre>
              </div>

              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#D97706] mb-1">
                ▪ Distribute
              </p>
              <h3 className="text-[1.75rem] font-bold tracking-tight text-[#111111]">
                Big Data Serving Gateway
              </h3>
              <p className="text-[14px] leading-relaxed text-[#666660] mt-3 mb-8">
                One governed pipeline for high-throughput Kafka topics, HDFS partitions, and Spark ML inference.
              </p>

              <div className="mt-auto space-y-3 pt-6 border-t border-[#E5E5DF]">
                <div className="flex items-center gap-2.5 font-mono text-[12px] text-[#222220]">
                  <Check className="h-3.5 w-3.5 text-[#D97706] flex-shrink-0" />
                  <span>One official schema registry for transit topics</span>
                </div>
                <div className="flex items-center gap-2.5 font-mono text-[12px] text-[#222220]">
                  <Check className="h-3.5 w-3.5 text-[#D97706] flex-shrink-0" />
                  <span>Real-time Poisson vehicle arrival simulation</span>
                </div>
                <div className="flex items-center gap-2.5 font-mono text-[12px] text-[#222220]">
                  <Check className="h-3.5 w-3.5 text-[#D97706] flex-shrink-0" />
                  <span>Every vehicle tick logged to distributed OTEL sinks</span>
                </div>
              </div>

              <Link
                to="/bigdata-pipeline"
                className="inline-flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-wider text-[#111111] hover:text-[#D97706] mt-8 transition-colors"
              >
                <span>Explore Big Data Engine</span>
                <span>→</span>
              </Link>
            </div>

            {/* Column 3: Corridor Security & AI Vision (SECURE) */}
            <div className="flex flex-col p-8 sm:p-10">
              {/* ASCII Art in Vermilion */}
              <div className="mb-6 font-mono text-[5px] select-none text-[#E05238] leading-[1.1]">
                <pre>{`
             x-vvv·v              
            ·-x·x-x·vxx            
           v··x-x--vv··x           
          ·-·x·     --vvx          
         ---·v       vvvvx         
         x·--         -xvx         
         vvv-v       v·xv-         
          -vx--     xvvx·          
      x-·x--xvxvvv·vxvxx··--v      
                `}</pre>
              </div>

              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#E05238] mb-1">
                ▪ Secure
              </p>
              <h3 className="text-[1.75rem] font-bold tracking-tight text-[#111111]">
                Corridor Security & AI Vision
              </h3>
              <p className="text-[14px] leading-relaxed text-[#666660] mt-3 mb-8">
                Every road hazard, congestion anomaly, and pavement fault evaluated automatically.
              </p>

              <div className="mt-auto space-y-3 pt-6 border-t border-[#E5E5DF]">
                <div className="flex items-center gap-2.5 font-mono text-[12px] text-[#222220]">
                  <Check className="h-3.5 w-3.5 text-[#E05238] flex-shrink-0" />
                  <span>Policy enforced across all arterial corridors</span>
                </div>
                <div className="flex items-center gap-2.5 font-mono text-[12px] text-[#222220]">
                  <Check className="h-3.5 w-3.5 text-[#E05238] flex-shrink-0" />
                  <span>AI Pavement Condition Index (PCI) & hazard grading</span>
                </div>
                <div className="flex items-center gap-2.5 font-mono text-[12px] text-[#222220]">
                  <Check className="h-3.5 w-3.5 text-[#E05238] flex-shrink-0" />
                  <span>Dijkstra dynamic bypass routing for bottlenecks</span>
                </div>
              </div>

              <Link
                to="/road-intelligence"
                className="inline-flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-wider text-[#111111] hover:text-[#E05238] mt-8 transition-colors"
              >
                <span>Explore Road Intelligence</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="relative px-6 py-20 sm:px-8 md:py-24 lg:px-12 border-b border-[#E5E5DF] bg-[#F7F7F4]">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
            <div>
              <h3 className="text-[clamp(2rem,3.2vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-[#111111]">
                Lambda extends your transit stack
              </h3>
              <p className="text-[1.125rem] text-[#666660] max-w-[640px] mt-3">
                Lambda connects to the identity, GIS, telemetry sensors, distributed computing, and municipal dispatch tools
                you already operate, so probes work under the same controls as your operators.
              </p>
            </div>
            <Link
              to="/architecture"
              className="font-mono text-xs font-bold uppercase tracking-wider text-[#111111] underline underline-offset-4"
            >
              Explore Topology Specs →
            </Link>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px border border-[#D5D5CF] bg-[#E5E5DF]">
            {/* Box 1: Identity & Roles */}
            <div className="flex flex-col gap-4 bg-[#FFFFFF] p-7">
              <p className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#888880]">
                Identity & Access Providers
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F5F5F0] border border-[#E0E0DA] text-[#222220]">
                  Municipal SSO (SAML/OIDC)
                </span>
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F5F5F0] border border-[#E0E0DA] text-[#222220]">
                  Traffic Police Command
                </span>
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F5F5F0] border border-[#E0E0DA] text-[#222220]">
                  Citizen Commuter Portal
                </span>
                <span className="text-xs font-mono text-[#888880]">+ Role-based Clearance</span>
              </div>
            </div>

            {/* Box 2: Arterial Corridors */}
            <div className="flex flex-col gap-4 bg-[#FFFFFF] p-7">
              <p className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#888880]">
                Arterial Corridors & Roadways
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F5F5F0] border border-[#E0E0DA] text-[#222220]">
                  GST Road (NH 45)
                </span>
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F5F5F0] border border-[#E0E0DA] text-[#222220]">
                  Anna Salai Mount Road
                </span>
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F5F5F0] border border-[#E0E0DA] text-[#222220]">
                  OMR IT Expressway
                </span>
                <span className="text-xs font-mono text-[#888880]">+ Tambaram Bypass</span>
              </div>
            </div>

            {/* Box 3: Distributed Big Data */}
            <div className="flex flex-col gap-4 bg-[#FFFFFF] p-7">
              <p className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#888880]">
                Distributed Streaming Engine
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F5F5F0] border border-[#E0E0DA] text-[#222220]">
                  Apache Kafka Stream
                </span>
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F5F5F0] border border-[#E0E0DA] text-[#222220]">
                  Apache Spark MLlib
                </span>
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F5F5F0] border border-[#E0E0DA] text-[#222220]">
                  HDFS Storage Sink
                </span>
                <span className="text-xs font-mono text-[#888880]">+ Airflow DAGs</span>
              </div>
            </div>

            {/* Box 4: ML Intelligence Suite */}
            <div className="flex flex-col gap-4 bg-[#FFFFFF] p-7">
              <p className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#888880]">
                Machine Learning Classifiers
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F5F5F0] border border-[#E0E0DA] text-[#222220]">
                  Random Forest Classifier
                </span>
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F5F5F0] border border-[#E0E0DA] text-[#222220]">
                  K-Means Hotspot Clusterer
                </span>
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F5F5F0] border border-[#E0E0DA] text-[#222220]">
                  Dijkstra Dynamic Router
                </span>
                <span className="text-xs font-mono text-[#888880]">+ 94.6% Accuracy</span>
              </div>
            </div>

            {/* Box 5: Observability & GIS */}
            <div className="flex flex-col gap-4 bg-[#FFFFFF] p-7">
              <p className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#888880]">
                Observability & Spatial GIS
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F5F5F0] border border-[#E0E0DA] text-[#222220]">
                  Leaflet Interactive GIS
                </span>
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F5F5F0] border border-[#E0E0DA] text-[#222220]">
                  OpenTelemetry Metrics
                </span>
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F5F5F0] border border-[#E0E0DA] text-[#222220]">
                  FastAPI Serving Bridge
                </span>
                <span className="text-xs font-mono text-[#888880]">+ Live Alert Stream</span>
              </div>
            </div>

            {/* Box 6: Vehicle Hardware Protocols */}
            <div className="flex flex-col gap-4 bg-[#FFFFFF] p-7">
              <p className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#888880]">
                Vehicle Telematics & Sensors
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F5F5F0] border border-[#E0E0DA] text-[#222220]">
                  Traccar GPS Protocol
                </span>
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F5F5F0] border border-[#E0E0DA] text-[#222220]">
                  Optical Edge Inference
                </span>
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F5F5F0] border border-[#E0E0DA] text-[#222220]">
                  OBD-II Kinematics
                </span>
                <span className="text-xs font-mono text-[#888880]">+ Road Simulator</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* District Mobility Operating Infrastructure & Architecture Matrix */}
      <section className="border-b border-[#E5E5DF] bg-[#FFFFFF] px-6 py-20 sm:px-8 md:py-24 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#E05238] mb-3">
                ■ Distributed Architecture & Real-Time Telemetry
              </p>
              <h2 className="text-[clamp(2.2rem,4vw,3.8rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-[#111111]">
                Built for heavy arterial transit loads.
              </h2>
            </div>
            <p className="text-sm text-[#666660] max-w-md leading-relaxed font-sans">
              From on-vehicle probe telemetry to distributed Spark ML hazard classifiers, every layer is built for municipal scale across Tamil Nadu.
            </p>
          </div>

          {/* 4 Speakeasy Boxes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Box 1: Fleet Kinematics */}
            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 flex flex-col justify-between hover:border-[#111111] transition-all shadow-xs group">
              <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#8C8C85]">
                  01 / SENSORS & INGESTION
                </span>
                <h3 className="text-[17px] font-bold text-[#111111] mt-2 mb-2 leading-snug">
                  Sub-Second Fleet Kinematics
                </h3>
                <p className="text-xs text-[#666662] leading-relaxed">
                  248 edge GPS and CAN-bus probes streaming continuous velocity vectors and heading along the GST Road corridor.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#E5E5DF] flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#2F7C4E] bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                  248 LIVE PROBES
                </span>
                <Link
                  to="/live-fleet"
                  className="font-mono text-[11px] font-bold text-[#111111] group-hover:text-[#E05238] transition-colors"
                >
                  Live Fleet →
                </Link>
              </div>
            </div>

            {/* Box 2: Big Data Engine */}
            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 flex flex-col justify-between hover:border-[#111111] transition-all shadow-xs group">
              <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#8C8C85]">
                  02 / PIPELINE & ENGINE
                </span>
                <h3 className="text-[17px] font-bold text-[#111111] mt-2 mb-2 leading-snug">
                  Kafka & Spark ML Engine
                </h3>
                <p className="text-xs text-[#666662] leading-relaxed">
                  High-throughput Poisson message queues partitioned into distributed HDFS storage with on-stream Random Forest inference.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#E5E5DF] flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 border border-blue-200">
                  100K+ MSG/SEC
                </span>
                <Link
                  to="/bigdata-pipeline"
                  className="font-mono text-[11px] font-bold text-[#111111] group-hover:text-[#E05238] transition-colors"
                >
                  Pipeline →
                </Link>
              </div>
            </div>

            {/* Box 3: Road AI */}
            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 flex flex-col justify-between hover:border-[#111111] transition-all shadow-xs group">
              <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#8C8C85]">
                  03 / PAVEMENT VISION AI
                </span>
                <h3 className="text-[17px] font-bold text-[#111111] mt-2 mb-2 leading-snug">
                  Pothole & Hazard Vision
                </h3>
                <p className="text-xs text-[#666662] leading-relaxed">
                  Automated asphalt condition classification (PCI), road roughness detection, and duplicate alert voiding algorithms.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#E5E5DF] flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#D97706] bg-amber-50 px-2 py-0.5 border border-amber-200">
                  97.4% ACCURACY
                </span>
                <Link
                  to="/road-intelligence"
                  className="font-mono text-[11px] font-bold text-[#111111] group-hover:text-[#E05238] transition-colors"
                >
                  Road AI →
                </Link>
              </div>
            </div>

            {/* Box 4: GIS Command Center */}
            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 flex flex-col justify-between hover:border-[#111111] transition-all shadow-xs group">
              <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#8C8C85]">
                  04 / OPERATIONS CONSOLE
                </span>
                <h3 className="text-[17px] font-bold text-[#111111] mt-2 mb-2 leading-snug">
                  District GIS Command
                </h3>
                <p className="text-xs text-[#666662] leading-relaxed">
                  Unified municipal operations canvas linking emergency signal priority, incident dispatch queues, and citizen trip planning.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#E5E5DF] flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#7C3AED] bg-purple-50 px-2 py-0.5 border border-purple-200">
                  ALL OPERATIONAL
                </span>
                <Link
                  to="/command-center"
                  className="font-mono text-[11px] font-bold text-[#111111] group-hover:text-[#E05238] transition-colors"
                >
                  Command Center →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Flow */}
      <section className="px-6 py-20 sm:px-8 md:py-24 lg:px-12 border-b border-[#E5E5DF] bg-[#FBFBFA]">
        <div className="mx-auto max-w-[1440px]">
          <div className="max-w-[850px] mb-12">
            <h2 className="text-[clamp(2.4rem,4.5vw,4.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-[#111111]">
              One golden path<br />for every transit node.
            </h2>
            <p className="text-[1.125rem] text-[#666660] mt-4 leading-relaxed">
              Whether citizen commuters are planning multimodal journeys along GST Road, or municipal operators
              are supervising district fleet dispatch, Lambda brings them under one intelligence layer, with one shared
              gateway to every spatial feed, and one set of safety policies.
            </p>
          </div>

          {/* Interactive Dual-Mode Switcher */}
          <div className="flex items-center gap-3 mb-8">
            <button
              type="button"
              onClick={() => setActiveTab('dispatch')}
              className={`px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all border ${
                activeTab === 'dispatch'
                  ? 'bg-[#111111] text-white border-[#111111] shadow-sm'
                  : 'bg-[#FFFFFF] text-[#666660] border-[#D5D5CF] hover:border-[#111111] hover:text-[#111111]'
              }`}
            >
              Municipal Authority Flow (ADMIN)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('commuter')}
              className={`px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all border ${
                activeTab === 'commuter'
                  ? 'bg-[#111111] text-white border-[#111111] shadow-sm'
                  : 'bg-[#FFFFFF] text-[#666660] border-[#D5D5CF] hover:border-[#111111] hover:text-[#111111]'
              }`}
            >
              Citizen Commuter Flow (USER)
            </button>
          </div>

          {/* Dual Flow Card Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 border border-[#D5D5CF] bg-[#FFFFFF] p-7 shadow-lg relative">
              <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

              <div className="flex items-center justify-between border-b border-[#EBEBE6] pb-4 mb-6">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#E05238]">
                    {activeTab === 'dispatch' ? 'Municipal Level 4 Clearance' : 'Citizen Level 1 Navigation'}
                  </span>
                  <h4 className="text-[1.25rem] font-bold text-[#111111] mt-0.5">
                    {activeTab === 'dispatch'
                      ? 'Metropolitan Operations & Incident Dispatch'
                      : 'Multimodal Journey & Live Bus Tracker'}
                  </h4>
                </div>
                <span className="px-2.5 py-1 font-mono text-[10px] font-bold bg-[#EFEFEA] text-[#111111]">
                  {activeTab === 'dispatch' ? 'OPERATOR CONSOLE' : 'PASSENGER APP'}
                </span>
              </div>

              {activeTab === 'dispatch' ? (
                <div className="space-y-4">
                  <p className="text-[13.5px] text-[#666660] leading-relaxed">
                    Operators receive real-time anomaly escalations generated by Apache Spark MLlib. Potholes and road
                    failures classified with confidence &gt; 90% are dispatched directly to public works teams.
                  </p>
                  <div className="grid grid-cols-2 gap-3 font-mono text-xs pt-2">
                    <div className="p-3 bg-[#F9F9F6] border border-[#EBEBE6]">
                      <span className="text-[#888880] block text-[10px]">ACTIVE VEHICLE PROBES:</span>
                      <span className="text-base font-bold text-[#111111]">248 Vehicles Live</span>
                    </div>
                    <div className="p-3 bg-[#F9F9F6] border border-[#EBEBE6]">
                      <span className="text-[#888880] block text-[10px]">MODEL ACCURACY:</span>
                      <span className="text-base font-bold text-[#2F7C4E]">94.6% Random Forest</span>
                    </div>
                  </div>
                  <div className="pt-3">
                    <Link
                      to="/command-center"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#2A2A2A] transition-all"
                    >
                      <span>Open Operations Console</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[13.5px] text-[#666660] leading-relaxed">
                    Commuters view synchronized arrivals for Route 500 & 500A, suburban trains at Tambaram &
                    Potheri stations, and receive AI-suggested congestion bypass routes in real time.
                  </p>
                  <div className="grid grid-cols-2 gap-3 font-mono text-xs pt-2">
                    <div className="p-3 bg-[#F9F9F6] border border-[#EBEBE6]">
                      <span className="text-[#888880] block text-[10px]">NEXT BUS ARRIVAL:</span>
                      <span className="text-base font-bold text-[#2563EB]">4 Mins (SRM Gate)</span>
                    </div>
                    <div className="p-3 bg-[#F9F9F6] border border-[#EBEBE6]">
                      <span className="text-[#888880] block text-[10px]">CONGESTION DELAY SAVED:</span>
                      <span className="text-base font-bold text-[#2F7C4E]">16.5 Mins via Bypass</span>
                    </div>
                  </div>
                  <div className="pt-3">
                    <Link
                      to="/journey-planner"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#2A2A2A] transition-all"
                    >
                      <span>Plan Commuter Route</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Terminal Live Stream Code Card */}
            <div className="lg:col-span-5 border border-[#111111] bg-[#161614] text-[#EDEDEA] p-5 shadow-2xl font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#2A2A28] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 text-[#38BDF8]" />
                  <span className="text-[11px] font-bold text-[#FFFFFF]">kafka-stream-logger.py</span>
                </div>
                <span className="text-[10px] text-[#777770]">ONLINE</span>
              </div>
              <pre className="text-[11px] leading-[1.6] text-[#A0A09A] overflow-x-auto">
{`$ kafka-console-consumer --topic urban.chengalpattu.probes
{"ts": "LIVE", "bus_id": "${liveTelemetryTick.vehicleId}",
 "corridor": "GST Road (NH 45)",
 "vel_kmh": ${liveTelemetryTick.speed},
 "lat": 12.8231, "lon": 80.0444,
 "spark_rf_class": "MODERATE_TRAFFIC",
 "spark_confidence": ${liveTelemetryTick.rfConfidence}%,
 "kmeans_hotspot_id": 0}
--> Dispatched to serving gateway http://localhost:8000/api`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 sm:px-8 md:py-24 lg:px-12 border-b border-[#E5E5DF] bg-[#FFFFFF] text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#E05238]">
            Deployment Ready
          </p>
          <h2 className="text-[clamp(2.4rem,4.5vw,4.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-[#111111]">
            Ready to govern and scale your municipal transit network?
          </h2>
          <p className="text-[1.125rem] text-[#666660] max-w-xl mx-auto">
            Deploy Lambda across your municipality in minutes or test our live Tamil Nadu corridor demo right in your browser.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#111111] text-white font-mono text-xs font-bold uppercase tracking-[0.12em] hover:bg-[#2A2A2A] transition-all rounded-sm shadow-md whitespace-nowrap"
            >
              Deploy for Free
            </Link>
            <Link
              to="/command-center"
              className="w-full sm:w-auto px-8 py-3.5 border border-[#D0D0C8] bg-transparent text-[#111111] font-mono text-xs font-bold uppercase tracking-[0.12em] hover:bg-[#F2F2EC] transition-all rounded-sm whitespace-nowrap"
            >
              Enter Live Command Center
            </Link>
          </div>
        </div>
      </section>

      <LlamaIndexFooter />
    </div>
  )
}

export default Home
