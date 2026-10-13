import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Menu,
  X,
  Map,
  Bus,
  Activity,
  AlertTriangle,
  BarChart3,
  Radio,
  MapPin,
  Layers,
  Compass,
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react'

export const HeaderDrawerMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { to: '/command-center', icon: Map, label: 'Command Center', desc: 'Real-time citywide operations' },
    { to: '/live-fleet', icon: Bus, label: 'Live Fleet', desc: 'Active bus sensing & camera feeds' },
    { to: '/urban-map', icon: MapPin, label: 'Urban Map', desc: 'Geospatial hazard & transit view' },
    { to: '/journey-planner', icon: Compass, label: 'Journey Planner', desc: 'Multimodal AI route optimizer', highlight: true },
    { to: '/road-intelligence', icon: Layers, label: 'Road Intelligence', desc: 'Pavement & infrastructure analytics' },
    { to: '/traffic-analytics', icon: Activity, label: 'Traffic Analytics', desc: 'Congestion & speed patterns' },
    { to: '/incident-center', icon: AlertTriangle, label: 'Incident Center', desc: 'Edge detections & alert triage' },
    { to: '/vehicle-tracking', icon: BarChart3, label: 'Vehicle Tracking', desc: 'Speed, telemetry & diagnostics' },
  ]

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  // Close drawer on Escape key & lock scroll when open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <>
      {/* Toggle key */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="u-icon-btn h-10 w-10 group cursor-pointer"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
        title="Explore platform modules"
      >
        <Menu className="h-5 w-5 transition-transform duration-200 ease-mech group-hover:rotate-6" />
      </button>

      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-over cabinet */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-full max-w-sm sm:max-w-md bg-surface-2 z-50 flex flex-col shadow-float transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Navigation drawer"
      >
        <span className="u-hair" aria-hidden="true" />

        {/* Cabinet header */}
        <div className="flex items-center justify-between border-b border-[rgba(163,177,198,0.35)] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="u-screws relative flex h-11 w-11 items-center justify-center rounded-xl bg-surface-2 shadow-key">
              <Radio className="h-4 w-4 text-brand-600" />
            </span>
            <div>
              <span className="block text-base font-bold tracking-tight text-ink u-emboss">
                Lambda Platform
              </span>
              <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand-600">
                GovTech AI Ecosystem
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="u-icon-btn"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Module keys */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 u-scroll">
          <div className="flex items-center justify-between px-2 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">
            <span>Platform modules</span>
            <span className="u-chip u-chip-slate">{navItems.length}</span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center justify-between gap-3 p-3 rounded-xl transition-all duration-200 ease-mech ${
                  isActive
                    ? 'bg-surface-3 shadow-pressed text-ink'
                    : 'text-ink-secondary hover:bg-surface-3/60 hover:text-ink'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-key-accent'
                        : 'bg-surface-0 text-ink-muted shadow-groove group-hover:text-brand-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[13px] font-bold">
                      <span>{item.label}</span>
                      {item.highlight && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-brand-500 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-white shadow-glow-accent">
                          <Sparkles className="h-2.5 w-2.5" />
                          <span>AI</span>
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-ink-muted">{item.desc}</p>
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-brand-600" />
              </Link>
            )
          })}

          <div className="u-groove my-3" />

          <Link
            to="/about"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between rounded-xl p-2.5 text-xs font-bold text-ink-secondary transition-colors hover:bg-surface-3/60 hover:text-ink"
          >
            <span className="flex items-center gap-2.5">
              <Info className="h-4 w-4 text-ink-faint" />
              <span>About Lambda Vision</span>
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-ink-faint" />
          </Link>
        </div>
      </aside>
    </>
  )
}

export default HeaderDrawerMenu
