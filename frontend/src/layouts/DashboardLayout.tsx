import React, { ReactNode, useState, useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Search,
  LayoutDashboard,
  Bus,
  Map,
  Database,
  Activity,
  Layers,
  AlertTriangle,
  FileText,
  Compass,
  ScanLine,
  Cpu,
  Info,
  User,
  CornerDownLeft
} from 'lucide-react'
import { MegaNavbar } from '../components/common/MegaNavbar'
import { apiService } from '../services/api'

interface DashboardLayoutProps {
  children: ReactNode
}

interface PaletteItem {
  to: string
  label: string
  section: string
  hint: string
  icon: React.ComponentType<{ className?: string }>
}

const PALETTE_ITEMS: PaletteItem[] = [
  { to: '/command-center', label: 'Command Center', section: 'Operations', hint: 'City operations console', icon: LayoutDashboard },
  { to: '/live-fleet', label: 'Live Fleet', section: 'Operations', hint: 'Vehicle telemetry', icon: Bus },
  { to: '/urban-map', label: 'Urban GIS Map', section: 'Operations', hint: 'Spatial intelligence', icon: Map },
  { to: '/vehicle-tracking', label: 'Vehicle Tracking', section: 'Operations', hint: 'Live kinematics', icon: ScanLine },
  { to: '/bigdata-pipeline', label: 'Big Data Pipeline', section: 'Intelligence', hint: 'Kafka · HDFS · Spark ML', icon: Database },
  { to: '/prediction-engine', label: 'Prediction Engine', section: 'Intelligence', hint: 'Random Forest · K-Means · Flood ML', icon: Cpu },
  { to: '/traffic-analytics', label: 'Traffic Analytics', section: 'Intelligence', hint: 'Corridor velocity & delays', icon: Activity },
  { to: '/road-intelligence', label: 'Road Intelligence', section: 'Intelligence', hint: 'Pavement condition & hazards', icon: Layers },
  { to: '/incident-center', label: 'Incident Center', section: 'Intelligence', hint: 'Live dispatch case queue', icon: AlertTriangle },
  { to: '/reports', label: 'Reports', section: 'Intelligence', hint: 'Executive briefings & audits', icon: FileText },
  { to: '/journey-planner', label: 'Journey Planner', section: 'Mobility', hint: 'Multimodal AI transit routing', icon: Compass },
  { to: '/architecture', label: 'Architecture', section: 'Platform', hint: 'Distributed topology specs', icon: Cpu },
  { to: '/about', label: 'About Platform', section: 'Platform', hint: 'Platform vision & standards', icon: Info },
  { to: '/profile', label: 'User Profile', section: 'Platform', hint: 'Operator settings & zone localization', icon: User },
]

/** Global Command Palette (⌘K / Ctrl+K) */
const CommandPalette: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return PALETTE_ITEMS
    return PALETTE_ITEMS.filter((i) =>
      `${i.label} ${i.section} ${i.hint}`.toLowerCase().includes(q)
    )
  }, [query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      const id = window.setTimeout(() => inputRef.current?.focus(), 40)
      return () => window.clearTimeout(id)
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center px-4 pt-[10vh]">
      <div
        className="absolute inset-0 bg-black/40 animate-fade"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-label="Module search"
        className="relative z-10 w-full max-w-lg border border-[#D5D5CF] bg-[#FFFFFF] p-0 shadow-2xl animate-pop"
      >
        {/* Speakeasy corner notch markers */}
        <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
        <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
        <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
        <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

        <div className="flex items-center gap-2.5 border-b border-[#E5E5DF] px-4 py-3">
          <Search className="h-4 w-4 text-[#8C8C85]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActive((a) => Math.min(a + 1, results.length - 1))
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActive((a) => Math.max(a - 1, 0))
              }
              if (e.key === 'Enter' && results[active]) {
                navigate(results[active].to)
                onClose()
              }
              if (e.key === 'Escape') onClose()
            }}
            placeholder="Search Lambda modules, corridors, and tools…"
            className="w-full bg-transparent font-mono text-xs text-[#111111] placeholder:text-[#8C8C85] focus:outline-none"
          />
          <kbd className="border border-[#D5D5CF] bg-[#FBFBFA] px-1.5 py-0.5 font-mono text-[9.5px] text-[#666662]">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs font-mono text-[#8C8C85]">
              No module matches “{query}”.
            </p>
          ) : (
            results.map((item, index) => {
              const ItemIcon = item.icon
              const isSelected = index === active
              return (
                <button
                  key={item.to}
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => {
                    navigate(item.to)
                    onClose()
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-left font-mono transition-colors border ${
                    isSelected
                      ? 'bg-[#F2F2EC] text-[#111111] font-semibold border-[#D5D5CF]'
                      : 'text-[#444440] hover:bg-[#FBFBFA] border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ItemIcon className="h-4 w-4 text-[#8C8C85]" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#111111]">{item.label}</span>
                        <span className="text-[10px] text-[#8C8C85] uppercase tracking-wider">
                          · {item.section}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666662] truncate">{item.hint}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <CornerDownLeft className="h-3.5 w-3.5 text-[#E05238] flex-shrink-0" />
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [openIncidents, setOpenIncidents] = useState(3)

  // Global keyboard shortcuts (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Poll live open incident count
  useEffect(() => {
    let active = true
    const fetchIncidents = async () => {
      try {
        const incidents = await apiService.getIncidents()
        if (active && Array.isArray(incidents)) {
          const count = incidents.filter(
            (i) => i.status === 'open' || i.status === 'investigating'
          ).length
          setOpenIncidents(count || 3)
        }
      } catch {
        // Keep fallback
      }
    }
    fetchIncidents()
    const timer = setInterval(fetchIncidents, 30000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-[#FBFBFA] font-sans text-[#111111] antialiased selection:bg-[#E05238]/20 selection:text-[#111111]">
      {/* Sticky Mega-Menu Navbar */}
      <MegaNavbar
        openIncidentsCount={openIncidents}
        onSearchClick={() => setPaletteOpen(true)}
      />

      {/* Global Command Palette */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* Full-width Main Viewport Content Area */}
      <main className="relative z-10 w-full min-h-[calc(100vh-5rem)] flex flex-col">
        <div key={location.pathname} className="flex-1 animate-page-in">
          {children}
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
