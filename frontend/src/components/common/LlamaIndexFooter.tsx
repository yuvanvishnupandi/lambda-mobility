import React from 'react'
import { Link } from 'react-router-dom'
import { Github, Star, ExternalLink } from 'lucide-react'

export const LlamaIndexFooter: React.FC = () => {

  return (
    <footer className="w-full border-t border-[#E5E5DF] bg-[#FBFBFA] text-[#111111] font-sans selection:bg-[#E05238]/20 transition-colors">
      <div className="mx-auto max-w-[1600px] px-6 pt-16 pb-12 sm:px-8 lg:px-12">
        {/* Top Grid: Left CTAs | Middle Columns | Right Subscribe & Badges */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 pb-16 border-b border-[#EBEBE6]">
          {/* Left Column: Platform identity & CTA buttons */}
          <div className="lg:col-span-3 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-none bg-[#E05238]" />
                <span className="font-mono text-[11px] font-bold tracking-[0.18em] uppercase text-[#111111]">
                  LAMBDA PLATFORM
                </span>
              </div>
              <p className="text-[12px] text-[#666662] leading-relaxed">
                Metropolitan transit sensor network & distributed big data telemetry engine for Chennai and Chengalpattu urban corridors.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 pt-1">
              <Link
                to="/command-center"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-none border border-[#111111] bg-transparent text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-[#111111] hover:bg-[#111111] hover:text-[#FFFFFF] transition-all duration-200 text-center"
              >
                Command Center
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-none border border-[#111111] bg-[#111111] text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-[#FFFFFF] hover:bg-[#2A2A2A] transition-all duration-200 shadow-sm text-center"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Middle Columns: PLATFORM OS, RESEARCH & SPECS, GOVERNANCE */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-6 sm:gap-8">
            {/* Platform OS Column */}
            <div>
              <div className="flex items-center gap-1.5 mb-4 text-[11px] font-mono font-bold uppercase tracking-wider text-[#111111]">
                <span className="h-1.5 w-1.5 bg-[#111111] inline-block" />
                <span>Platform OS</span>
              </div>
              <ul className="space-y-2.5 text-[13px] text-[#555550]">
                <li>
                  <Link to="/command-center" className="hover:text-[#111111] transition-colors">
                    Command Center
                  </Link>
                </li>
                <li>
                  <Link to="/live-fleet" className="hover:text-[#111111] transition-colors">
                    Fleet Kinematics
                  </Link>
                </li>
                <li>
                  <Link to="/road-intelligence" className="hover:text-[#111111] transition-colors">
                    Road Hazard AI
                  </Link>
                </li>
                <li>
                  <Link to="/bigdata-pipeline" className="hover:text-[#111111] transition-colors">
                    Big Data Engine
                  </Link>
                </li>
                <li>
                  <Link to="/urban-map" className="hover:text-[#111111] transition-colors">
                    Spatial GIS Map
                  </Link>
                </li>
                <li>
                  <Link to="/incident-center" className="hover:text-[#111111] transition-colors">
                    Incident Command
                  </Link>
                </li>
              </ul>
            </div>

            {/* Research & Specs Column */}
            <div>
              <div className="flex items-center gap-1.5 mb-4 text-[11px] font-mono font-bold uppercase tracking-wider text-[#111111]">
                <span className="h-1.5 w-1.5 bg-[#111111] inline-block" />
                <span>Research & Specs</span>
              </div>
              <ul className="space-y-2.5 text-[13px] text-[#555550]">
                <li>
                  <Link to="/architecture" className="hover:text-[#111111] transition-colors">
                    Distributed Architecture
                  </Link>
                </li>
                <li>
                  <Link to="/bigdata-pipeline" className="hover:text-[#111111] transition-colors">
                    Kafka & Spark Pipelines
                  </Link>
                </li>
                <li>
                  <Link to="/journey-planner" className="hover:text-[#111111] transition-colors">
                    Multimodal AI Routing
                  </Link>
                </li>
                <li>
                  <Link to="/traffic-analytics" className="hover:text-[#111111] transition-colors">
                    Corridor Delay Index
                  </Link>
                </li>
                <li>
                  <Link to="/vehicle-tracking" className="hover:text-[#111111] transition-colors">
                    CAN-Bus Telemetry
                  </Link>
                </li>
                <li>
                  <Link to="/reports" className="hover:text-[#111111] transition-colors">
                    Executive Briefings
                  </Link>
                </li>
              </ul>
            </div>

            {/* Governance Column */}
            <div>
              <div className="flex items-center gap-1.5 mb-4 text-[11px] font-mono font-bold uppercase tracking-wider text-[#111111]">
                <span className="h-1.5 w-1.5 bg-[#111111] inline-block" />
                <span>Governance</span>
              </div>
              <ul className="space-y-2.5 text-[13px] text-[#555550]">
                <li>
                  <Link to="/about" className="hover:text-[#111111] transition-colors">
                    Chengalpattu Operations
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-[#111111] transition-colors">
                    Tamil Nadu Transit OS
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-[#111111] transition-colors">
                    Operator Security
                  </Link>
                </li>
                <li>
                  <Link to="/architecture" className="hover:text-[#111111] transition-colors">
                    Hardware Edge Specs
                  </Link>
                </li>
                <li>
                  <Link to="/reports" className="hover:text-[#111111] transition-colors">
                    Municipal Audit Briefs
                  </Link>
                </li>
                <li>
                  <Link to="/urban-map" className="hover:text-[#111111] transition-colors">
                    Corridor Live Canvas
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: GitHub Repository Card & Live Telemetry Status */}
          <div className="lg:col-span-4 space-y-4">
            {/* GitHub Repository & Star Box (Speakeasy Card with Notches) */}
            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs">
              <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
              <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E5E5DF]">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-[#111111]" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#111111]">
                    GitHub Repository
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 font-bold uppercase">
                  Open Source
                </span>
              </div>

              <p className="text-[12px] text-[#666662] mb-4 leading-relaxed font-sans">
                Lambda Urban Mobility Control Plane & Distributed Big Data Pipeline engine. Explore the architecture, datasets, and Spark models.
              </p>

              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href="https://github.com/yuvanvishnupandi/lambda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#111111] hover:bg-black text-white text-[11px] font-mono font-bold uppercase tracking-wider transition-all shadow-xs"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>View GitHub Repo</span>
                  <ExternalLink className="w-3 h-3 text-[#A0A09B]" />
                </a>

                <a
                  href="https://github.com/yuvanvishnupandi/lambda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FBFBFA] hover:bg-[#FFFFFF] text-[#111111] border border-[#D5D5CF] hover:border-[#111111] text-[11px] font-mono font-bold uppercase tracking-wider transition-all shadow-2xs"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Star</span>
                  <span className="text-[10px] text-[#666662] ml-1 bg-[#EBEBE6] px-1.5 py-0.2">★ 142</span>
                </a>
              </div>
            </div>

            {/* Live Operational Status Telemetry Indicator */}
            <div>
              <div className="inline-flex items-center gap-2.5 px-3.5 py-2 border border-[#D5D5CF] bg-[#FFFFFF] text-[11px] font-mono text-[#444440] shadow-2xs">
                <span className="h-2 w-2 rounded-none bg-[#2F7C4E] animate-pulse" />
                <span className="font-bold text-[#111111] uppercase tracking-wider">SYSTEM STATUS</span>
                <span className="text-[#888880]">·</span>
                <span className="text-[#555550]">Corridor Telemetry 99.98% Uptime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Giant Bottom Brand Wordmark (MedTech & Enky Style) */}
        <div className="relative w-full pt-8 pb-4 select-none overflow-hidden flex items-center justify-center">
          <svg
            viewBox="0 0 880 200"
            className="w-full max-w-full h-auto max-h-[300px] overflow-visible select-none"
            aria-hidden="true"
            preserveAspectRatio="xMidYMid meet"
          >
            <text
              x="47%"
              y="82%"
              textAnchor="middle"
              fill="#E5E5DE"
              className="font-black hover:fill-[#D8D8D0] transition-colors"
              style={{
                fontSize: '240px',
                fontWeight: 900,
                letterSpacing: '-0.075em',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
              }}
            >
              Lambda
            </text>
            <text
              x="93%"
              y="38%"
              textAnchor="middle"
              fill="#E5E5DE"
              className="font-bold"
              style={{
                fontSize: '56px',
                fontWeight: 700,
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
              }}
            >
              ®
            </text>
          </svg>
        </div>

        {/* Footer legal & copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#EBEBE6] text-[12px] text-[#777770] font-normal">
          <div>
            © 2026 Lambda Urban Intelligence Platform.
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link to="/about" className="hover:text-[#111111] transition-colors">
              Privacy Notice
            </Link>
            <span className="text-[#CCCCCC]">▪</span>
            <Link to="/about" className="hover:text-[#111111] transition-colors">
              Terms of Service
            </Link>
            <span className="text-[#CCCCCC]">▪</span>
            <Link to="/about" className="hover:text-[#111111] transition-colors">
              Data Processing Addendum
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default LlamaIndexFooter
