import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Bus,
  Map,
  ScanLine,
  Database,
  Activity,
  Layers,
  AlertTriangle,
  FileText,
  Compass,
  Cpu,
  ChevronDown,
  Search,
  Bell,
  MapPin,
  User,
  Check,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  CheckCheck,
  ChevronRight,
} from 'lucide-react'
import { useUser } from '../../context/UserContext'
import { apiService } from '../../services/api'

interface MegaNavItem {
  to: string
  tag: string
  tagColor: string
  title: string
  desc: string
  icon: React.ComponentType<{ className?: string }>
}

interface MegaNavGroup {
  id: string
  title: string
  eyebrow: string
  items: MegaNavItem[]
  pills: { label: string; to: string }[]
}

const MEGA_MENU_GROUPS: MegaNavGroup[] = [
  {
    id: 'operations',
    title: 'Operations',
    eyebrow: 'AI URBAN TRANSIT CONTROL PLANE',
    items: [
      {
        to: '/command-center',
        tag: '■ DISPATCH',
        tagColor: 'text-emerald-400',
        title: 'Command Center',
        desc: 'Central operations console, probe telemetry & live dispatch supervision.',
        icon: LayoutDashboard
      },
      {
        to: '/live-fleet',
        tag: '■ TELEMETRY',
        tagColor: 'text-blue-400',
        title: 'Live Fleet Probes',
        desc: 'Road-constrained GPS telemetry, probe velocities & speed profiles.',
        icon: Bus
      },
      {
        to: '/urban-map',
        tag: '■ MAPPING',
        tagColor: 'text-amber-400',
        title: 'Urban GIS Map',
        desc: 'District spatial layers, road network overlays & traffic density heatmaps.',
        icon: Map
      },
      {
        to: '/vehicle-tracking',
        tag: '■ KINEMATICS',
        tagColor: 'text-rose-400',
        title: 'Vehicle Kinematics',
        desc: 'High-frequency telemetry, CAN-bus acceleration & brake curves.',
        icon: ScanLine
      }
    ],
    pills: [
      { label: 'WHAT IS LAMBDA CONTROL PLANE?', to: '/about' },
      { label: 'CORRIDOR CHANGELOG', to: '/command-center' },
      { label: 'OPERATIONAL SPECS', to: '/architecture' }
    ]
  },
  {
    id: 'intelligence',
    title: 'Intelligence',
    eyebrow: 'DISTRIBUTED INTELLIGENCE & ML ENGINES',
    items: [
      {
        to: '/prediction-engine',
        tag: '■ PREDICTIVE ML',
        tagColor: 'text-amber-400',
        title: 'Prediction Engine',
        desc: 'Random Forest severity classification, K-Means clustering & flood risk models.',
        icon: Cpu
      },
      {
        to: '/bigdata-pipeline',
        tag: '■ STREAMING',
        tagColor: 'text-violet-400',
        title: 'Big Data Engine',
        desc: 'Distributed Apache Kafka streaming, Spark MLlib models & HDFS storage.',
        icon: Database
      },
      {
        to: '/road-intelligence',
        tag: '■ VISION AI',
        tagColor: 'text-rose-400',
        title: 'Road Hazard AI',
        desc: 'Pavement vision inferences, pothole severity scoring & repair flags.',
        icon: Layers
      },
      {
        to: '/traffic-analytics',
        tag: '■ ANALYTICS',
        tagColor: 'text-blue-400',
        title: 'Traffic Analytics',
        desc: 'Corridor velocity curves, delay index estimation & bottleneck alerts.',
        icon: Activity
      },
      {
        to: '/incident-center',
        tag: '■ INCIDENTS',
        tagColor: 'text-red-400',
        title: 'Incident Command',
        desc: 'Real-time hazard dossier queues & multi-agency response dispatch.',
        icon: AlertTriangle
      }
    ],
    pills: [
      { label: 'ML PREDICTION ENGINE', to: '/prediction-engine' },
      { label: 'APACHE SPARK ML SUITE', to: '/bigdata-pipeline' },
      { label: 'PAVEMENT VISION BENCHMARK', to: '/road-intelligence' },
      { label: 'EXECUTIVE AUDIT BRIEFS', to: '/reports' }
    ]
  },
  {
    id: 'mobility',
    title: 'Mobility',
    eyebrow: 'MULTIMODAL MOBILITY & ROUTING ENGINE',
    items: [
      {
        to: '/journey-planner',
        tag: '■ ROUTING',
        tagColor: 'text-emerald-400',
        title: 'Journey Planner',
        desc: 'Multimodal AI pathfinding combining suburban rail, MTC & feeder lines.',
        icon: Compass
      },
      {
        to: '/command-center',
        tag: '■ DISPATCH',
        tagColor: 'text-blue-400',
        title: 'Transit Dispatch',
        desc: 'Municipal headway management & real-time passenger clearance.',
        icon: LayoutDashboard
      },
      {
        to: '/reports',
        tag: '■ AUDITS',
        tagColor: 'text-amber-400',
        title: 'Corridor Reports',
        desc: 'District punctuality audits, emissions index & fleet health metrics.',
        icon: FileText
      },
      {
        to: '/architecture',
        tag: '■ HARDWARE',
        tagColor: 'text-indigo-400',
        title: 'Edge Architecture',
        desc: 'On-vehicle compute node specifications & CAN-bus hardware interfaces.',
        icon: Cpu
      }
    ],
    pills: [
      { label: 'MULTIMODAL PATHFINDER', to: '/journey-planner' },
      { label: 'TRANSIT GIS CANVAS', to: '/urban-map' },
      { label: 'MUNICIPAL STANDARDS', to: '/about' }
    ]
  }
]

interface MegaNavbarProps {
  openIncidentsCount?: number
  onSearchClick?: () => void
}

export const MegaNavbar: React.FC<MegaNavbarProps> = ({
  openIncidentsCount: _openIncidentsCount = 3,
  onSearchClick
}) => {
  const { user, locations, currentLocation, switchLocation, logout, isAuthenticated, theme, toggleTheme } = useUser()
  const location = useLocation()
  const navigate = useNavigate()

  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null)
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notifAlerts, setNotifAlerts] = useState<any[]>([])

  const [currentTime, setCurrentTime] = useState('')
  const navRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  // Load live notifications
  useEffect(() => {
    apiService.getNotifications().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setNotifAlerts(data)
      }
    })
    const interval = setInterval(() => {
      apiService.getNotifications().then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setNotifAlerts(data)
        }
      })
    }, 20000)
    return () => clearInterval(interval)
  }, [])

  // Real-time digital clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Close dropdowns on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMegaMenu(null)
        setIsLocationDropdownOpen(false)
        setIsUserMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMegaMenu(null)
        setIsLocationDropdownOpen(false)
        setIsUserMenuOpen(false)
        setIsNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Close menus on route navigation
  useEffect(() => {
    setActiveMegaMenu(null)
    setIsLocationDropdownOpen(false)
    setIsUserMenuOpen(false)
    setIsMobileMenuOpen(false)
    setIsNotificationsOpen(false)
  }, [location.pathname])

  return (
    <>
      {/* Top rainbow gradient micro-bar matching Speakeasy */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF6B4A] via-[#E05238] to-[#6366F1]" />

      <header
        ref={navRef}
        className="sticky top-0 z-50 w-full border-b border-[#E5E5DF] bg-[#FBFBFA] shadow-xs transition-colors"
      >
        {/* Full-width container hugging left & right edges with comfortable padding */}
        <div className="w-full flex h-[76px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Brand Identity shifted cleanly to the far left + Direct Navigation Tabs */}
          <div className="flex items-center gap-3 lg:gap-5 shrink-0">
            {/* Lambda Brand Logo shifted to far left with no extra badge clutter */}
            <Link
              to="/"
              className="flex items-center group focus:outline-none shrink-0"
              aria-label="Lambda Home"
            >
              <img
                src="/lambda-navbar-logo.png"
                alt="Lambda Urban Intelligence"
                className="h-10 sm:h-11 w-auto max-h-12 max-w-[210px] object-contain transition-transform duration-200 group-hover:scale-102 shrink-0"
                style={{
                  height: '40px',
                  maxHeight: '40px',
                  width: 'auto',
                  maxWidth: '200px',
                  objectFit: 'contain',
                  imageRendering: '-webkit-optimize-contrast',
                }}
              />
            </Link>

            {/* Desktop Direct Navigation & Mega Menu Tabs */}
            <nav className="hidden lg:flex items-center space-x-1 shrink-0 whitespace-nowrap" aria-label="Main Navigation">
              {/* Direct Command Center Button */}
              <Link
                to="/command-center"
                className={`whitespace-nowrap shrink-0 px-3.5 py-2 text-[13px] font-medium transition-all rounded-[4px] border ${
                  location.pathname === '/command-center'
                    ? 'bg-white text-[#111111] font-semibold border-[#D5D5CF] shadow-xs'
                    : 'text-[#555550] hover:text-[#111111] hover:bg-[#F2F2EC] border-transparent'
                }`}
              >
                Command Center
              </Link>

              {/* Operations Mega Menu Trigger */}
              <div
                className="relative shrink-0"
                onMouseEnter={() => setActiveMegaMenu('operations')}
              >
                <button
                  type="button"
                  onClick={() => setActiveMegaMenu(activeMegaMenu === 'operations' ? null : 'operations')}
                  className={`flex items-center gap-1 whitespace-nowrap shrink-0 px-3 py-2 text-[13px] font-medium transition-all rounded-[4px] border ${
                    activeMegaMenu === 'operations' || ['/live-fleet', '/urban-map', '/vehicle-tracking'].includes(location.pathname)
                      ? 'bg-white text-[#111111] font-semibold border-[#D5D5CF] shadow-xs'
                      : 'text-[#555550] hover:text-[#111111] hover:bg-[#F2F2EC] border-transparent'
                  }`}
                  aria-expanded={activeMegaMenu === 'operations'}
                >
                  <span>Operations</span>
                  <ChevronDown
                    className={`h-3 w-3 text-[#8C8C85] transition-transform duration-150 ${
                      activeMegaMenu === 'operations' ? 'rotate-180 text-[#111111]' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Intelligence Mega Menu Trigger */}
              <div
                className="relative shrink-0"
                onMouseEnter={() => setActiveMegaMenu('intelligence')}
              >
                <button
                  type="button"
                  onClick={() => setActiveMegaMenu(activeMegaMenu === 'intelligence' ? null : 'intelligence')}
                  className={`flex items-center gap-1 whitespace-nowrap shrink-0 px-3 py-2 text-[13px] font-medium transition-all rounded-[4px] border ${
                    activeMegaMenu === 'intelligence' || ['/bigdata-pipeline', '/traffic-analytics', '/road-intelligence', '/incident-center', '/reports'].includes(location.pathname)
                      ? 'bg-white text-[#111111] font-semibold border-[#D5D5CF] shadow-xs'
                      : 'text-[#555550] hover:text-[#111111] hover:bg-[#F2F2EC] border-transparent'
                  }`}
                  aria-expanded={activeMegaMenu === 'intelligence'}
                >
                  <span>Intelligence</span>
                  <ChevronDown
                    className={`h-3 w-3 text-[#8C8C85] transition-transform duration-150 ${
                      activeMegaMenu === 'intelligence' ? 'rotate-180 text-[#111111]' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Mobility Mega Menu Trigger */}
              <div
                className="relative shrink-0"
                onMouseEnter={() => setActiveMegaMenu('mobility')}
              >
                <button
                  type="button"
                  onClick={() => setActiveMegaMenu(activeMegaMenu === 'mobility' ? null : 'mobility')}
                  className={`flex items-center gap-1 whitespace-nowrap shrink-0 px-3 py-2 text-[13px] font-medium transition-all rounded-[4px] border ${
                    activeMegaMenu === 'mobility' || location.pathname === '/journey-planner'
                      ? 'bg-white text-[#111111] font-semibold border-[#D5D5CF] shadow-xs'
                      : 'text-[#555550] hover:text-[#111111] hover:bg-[#F2F2EC] border-transparent'
                  }`}
                  aria-expanded={activeMegaMenu === 'mobility'}
                >
                  <span>Mobility</span>
                  <ChevronDown
                    className={`h-3 w-3 text-[#8C8C85] transition-transform duration-150 ${
                      activeMegaMenu === 'mobility' ? 'rotate-180 text-[#111111]' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Direct Architecture Link */}
              <Link
                to="/architecture"
                className={`whitespace-nowrap shrink-0 px-3 py-2 text-[13px] font-medium transition-all rounded-[4px] border ${
                  location.pathname === '/architecture'
                    ? 'bg-white text-[#111111] font-semibold border-[#D5D5CF] shadow-xs'
                    : 'text-[#555550] hover:text-[#111111] hover:bg-[#F2F2EC] border-transparent'
                }`}
              >
                Architecture
              </Link>

              {/* Direct About Link */}
              <Link
                to="/about"
                className={`whitespace-nowrap shrink-0 px-3 py-2 text-[13px] font-medium transition-all rounded-[4px] border ${
                  location.pathname === '/about'
                    ? 'bg-white text-[#111111] font-semibold border-[#D5D5CF] shadow-xs'
                    : 'text-[#555550] hover:text-[#111111] hover:bg-[#F2F2EC] border-transparent'
                }`}
              >
                About
              </Link>
            </nav>
          </div>

          {/* Right Section: Location Pill, Search, Incidents & User Profile (zero overlaps!) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Dynamic Location Switcher Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsLocationDropdownOpen(!isLocationDropdownOpen)
                  setIsUserMenuOpen(false)
                  setActiveMegaMenu(null)
                }}
                className="flex items-center gap-1.5 border border-[#E5E5DF] bg-[#FFFFFF] px-2.5 py-1.5 text-[11.5px] font-medium text-[#111111] transition-all hover:border-[#111111] shadow-xs"
                title="Click to switch active operating corridor"
              >
                <MapPin className="h-3.5 w-3.5 text-[#E05238] shrink-0" />
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-[11.5px] font-semibold text-[#111111] line-clamp-1 max-w-[120px]">
                    {currentLocation.city}
                  </span>
                  <span className="text-[9.5px] text-[#666662] font-mono line-clamp-1 max-w-[120px]">
                    {currentLocation.district}
                  </span>
                </div>
                <ChevronDown
                  className={`h-3 w-3 text-[#8C8C85] transition-transform duration-150 ${
                    isLocationDropdownOpen ? 'rotate-180 text-[#111111]' : ''
                  }`}
                />
              </button>

              {/* Location Selector Dropdown */}
              {isLocationDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-76 border border-[#D5D5CF] bg-[#FFFFFF] p-3 shadow-2xl z-50 animate-in fade-in duration-150">
                  <div className="px-2.5 py-1.5 mb-2 border-b border-[#E5E5DF]">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#666662]">
                      Switch Operating Zone
                    </span>
                    <p className="text-[10.5px] text-[#8C8C85]">
                      Personalized for {user.name}
                    </p>
                  </div>

                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {locations.map((loc) => {
                      const isSelected = loc.id === currentLocation.id
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => {
                            switchLocation(loc.id)
                            setIsLocationDropdownOpen(false)
                          }}
                          className={`w-full flex items-center justify-between p-2 text-left transition-all border ${
                            isSelected
                              ? 'bg-[#F7F7F4] text-[#111111] font-medium border-[#D5D5CF]'
                              : 'hover:bg-[#FBFBFA] border-transparent text-[#2E2E2C]'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[12px] font-semibold text-[#111111] line-clamp-1">
                                {loc.city}
                              </span>
                              {isSelected && (
                                <Check className="h-3 w-3 text-[#E05238] shrink-0" />
                              )}
                            </div>
                            <span className="text-[10.5px] text-[#666662] line-clamp-1">
                              {loc.corridor}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 bg-[#F4F4F0] text-[#111111] border border-[#E5E5DF]">
                              {loc.active_vehicles} probes
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Search Palette Trigger (⌘K) */}
            <button
              type="button"
              onClick={onSearchClick}
              className="hidden xl:inline-flex items-center gap-2 border border-[#E5E5DF] bg-[#FFFFFF] px-2.5 py-1.5 text-[11.5px] text-[#666662] transition-all hover:text-[#111111] hover:border-[#111111] shadow-xs"
              aria-label="Search modules"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
              <kbd className="border border-[#E5E5DF] bg-[#F4F4F0] px-1 py-0.2 font-mono text-[9.5px] text-[#666662]">
                ⌘K
              </kbd>
            </button>

            {/* Live Real System Notifications (Only Notification Bell in App) */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen)
                  setIsUserMenuOpen(false)
                  setIsLocationDropdownOpen(false)
                  setActiveMegaMenu(null)
                }}
                className={`relative flex h-9 w-9 items-center justify-center border transition-all shadow-xs ${
                  isNotificationsOpen
                    ? 'border-[#111111] bg-[#111111] text-white'
                    : 'border-[#E5E5DF] bg-[#FFFFFF] text-[#666662] hover:text-[#111111] hover:border-[#111111]'
                }`}
                title="System notifications (Live Corridor Alerts)"
                aria-label="Toggle notifications"
              >
                <Bell className="h-4 w-4" />
                {notifAlerts.filter((a) => !a.is_read).length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center bg-[#E05238] px-1 font-mono text-[9px] font-bold text-white">
                    {notifAlerts.filter((a) => !a.is_read).length}
                  </span>
                )}
              </button>

              {/* Speakeasy Live Alerts Dropdown Popover */}
              {isNotificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] border border-[#D5D5CF] bg-[#FFFFFF] p-4 shadow-2xl z-50 animate-in fade-in duration-150">
                  <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
                  <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
                  <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
                  <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

                  {/* Top Header */}
                  <div className="flex items-center justify-between border-b border-[#E5E5DF] pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-none bg-[#E05238] animate-pulse" />
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                        System Alerts · TN Corridor
                      </span>
                    </div>
                    {notifAlerts.filter((a) => !a.is_read).length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setNotifAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })))
                          apiService.markAllAlertsRead()
                        }}
                        className="inline-flex items-center gap-1 font-mono text-[10px] text-[#666662] hover:text-[#111111] uppercase tracking-wider"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>Mark read</span>
                      </button>
                    )}
                  </div>

                  {/* Alerts List */}
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {notifAlerts.length === 0 ? (
                      <div className="py-6 text-center text-[12px] text-[#666662] font-mono">
                        No active alerts in queue
                      </div>
                    ) : (
                      notifAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-2.5 border transition-all ${
                            !alert.is_read
                              ? 'bg-[#FDF8F7] border-[#E05238]/30'
                              : 'bg-[#F9F9F6] border-[#EBEBE6]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`font-mono text-[9px] font-bold uppercase px-1.5 py-0.2 ${
                                alert.severity?.toUpperCase() === 'CRITICAL'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : alert.severity?.toUpperCase() === 'HIGH'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-blue-100 text-blue-800 border border-blue-300'
                              }`}
                            >
                              {alert.severity}
                            </span>
                            <span className="font-mono text-[10px] text-[#888880]">
                              {alert.timestamp || 'Just now'}
                            </span>
                          </div>

                          <div className="text-[12px] font-bold text-[#111111] leading-tight mb-1">
                            {alert.title || alert.type || 'Detection Event'}
                          </div>
                          <div className="text-[11px] text-[#666662] leading-tight font-mono mb-2">
                            {alert.location || 'GST Road (NH 45) · Chengalpattu'}
                          </div>

                          <div className="flex items-center justify-between pt-1.5 border-t border-[#EBEBE6] text-[10px] font-mono">
                            <span className="text-[#888880]">
                              {alert.bus_id || alert.busId || 'BUS-104'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {!alert.acknowledged && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNotifAlerts((prev) =>
                                      prev.map((a) =>
                                        a.id === alert.id ? { ...a, acknowledged: true, is_read: true } : a
                                      )
                                    )
                                    apiService.acknowledgeAlert(alert.id)
                                  }}
                                  className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                                >
                                  Ack
                                </button>
                              )}
                              {!alert.is_read && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNotifAlerts((prev) =>
                                      prev.map((a) =>
                                        a.id === alert.id ? { ...a, is_read: true } : a
                                      )
                                    )
                                    apiService.markAlertRead(alert.id)
                                  }}
                                  className="px-1.5 py-0.5 bg-white text-[#666662] border border-[#D5D5CF] hover:text-[#111111]"
                                >
                                  Dismiss
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer Link */}
                  <div className="pt-3 mt-3 border-t border-[#E5E5DF] text-center">
                    <Link
                      to="/incident-center"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#111111] hover:text-[#E05238] uppercase tracking-wider transition-colors"
                    >
                      <span>View Full Incident Queue</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Live System Time without blinking dot */}
            <div className="hidden xl:flex items-center gap-1.5 border border-[#E5E5DF] bg-[#FFFFFF] px-2.5 py-1.5 text-[11px] font-mono font-semibold text-[#111111] shadow-xs">
              <span>{currentTime || '21:30:00'}</span>
            </div>

            {/* User Profile Pill & Menu or Sign In / Sign Up buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(!isUserMenuOpen)
                    setIsLocationDropdownOpen(false)
                    setActiveMegaMenu(null)
                  }}
                  className="flex items-center gap-2 border border-[#E5E5DF] bg-[#FFFFFF] p-1.5 pr-2.5 text-left transition-all hover:border-[#111111] shadow-xs"
                  aria-label="User profile menu"
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center text-white font-bold text-[11px] ${
                      user?.account_type === 'USER'
                        ? 'bg-gradient-to-tr from-[#3B82F6] to-[#1D4ED8]'
                        : 'bg-gradient-to-tr from-[#FF6B4A] to-[#E05238]'
                    }`}
                  >
                    {user?.name ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('') : 'YV'}
                  </div>
                  <div className="hidden md:flex flex-col leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-bold text-[#111111] line-clamp-1 max-w-[110px]">
                        {user.name}
                      </span>
                      <span
                        className={`text-[8.5px] font-mono px-1 py-0.2 font-bold uppercase ${
                          user?.account_type === 'USER'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {user?.account_type === 'USER' ? 'User' : 'Admin'}
                      </span>
                    </div>
                    <span className="text-[9.5px] text-[#666662] line-clamp-1 font-mono max-w-[120px]">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-3 w-3 text-[#8C8C85] transition-transform duration-150 ${
                      isUserMenuOpen ? 'rotate-180 text-[#111111]' : ''
                    }`}
                  />
                </button>

                {/* User Profile Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 border border-[#D5D5CF] bg-[#FFFFFF] p-3 shadow-2xl z-50 animate-in fade-in duration-150">
                    <div className="p-2 border-b border-[#E5E5DF] mb-2">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className={`flex h-8 w-8 items-center justify-center text-white font-bold text-xs ${
                            user?.account_type === 'USER' ? 'bg-[#3B82F6]' : 'bg-[#111111]'
                          }`}
                        >
                          {user?.name ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('') : 'YV'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12.5px] font-bold text-[#111111] truncate">{user.name}</p>
                          <p className="text-[10.5px] text-[#666662] truncate font-mono">{user.email}</p>
                        </div>
                      </div>
                      <span
                        className={`inline-block text-[9.5px] font-mono px-2 py-0.5 font-semibold ${
                          user?.account_type === 'USER'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {user?.account_type === 'USER' ? 'Citizen Commuter · Active' : 'Municipal Authority · Active'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-2.5 py-2 text-[12px] font-medium text-[#111111] hover:bg-[#F7F7F4] transition-colors"
                      >
                        <User className="h-4 w-4 text-[#E05238]" />
                        <span>{user?.account_type === 'USER' ? 'My Commuter Profile' : 'My Officer Profile'}</span>
                      </Link>

                      <Link
                        to="/command-center"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-2.5 py-2 text-[12px] font-medium text-[#111111] hover:bg-[#F7F7F4] transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-indigo-500" />
                        <span>Command Center Hub</span>
                      </Link>

                      <Link
                        to="/live-fleet"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-2.5 py-2 text-[12px] font-medium text-[#111111] hover:bg-[#F7F7F4] transition-colors"
                      >
                        <Bus className="h-4 w-4 text-blue-500" />
                        <span>Live Fleet Telemetry</span>
                      </Link>
                    </div>

                    {/* Dark / Light Mode Toggle in User Section */}
                    <div className="pt-2 mt-2 border-t border-[#E5E5DF]">
                      <div className="flex items-center justify-between px-2.5 py-2 text-[11.5px] font-mono bg-[#F7F7F4] border border-[#E5E5DF] rounded-[3px]">
                        <div className="flex items-center gap-2 text-[#444440]">
                          {theme === 'dark' ? (
                            <Moon className="h-3.5 w-3.5 text-indigo-500" />
                          ) : (
                            <Sun className="h-3.5 w-3.5 text-amber-500" />
                          )}
                          <span className="font-semibold text-[#111111]">
                            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={toggleTheme}
                          className="px-2 py-0.5 rounded-[2px] bg-white border border-[#D5D5CF] hover:border-[#111111] text-[10px] font-bold text-[#111111] transition-all shadow-2xs"
                        >
                          Switch
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-[#E5E5DF]">
                      <button
                        type="button"
                        onClick={() => {
                          logout()
                          setIsUserMenuOpen(false)
                          navigate('/login')
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-[12px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Log Out & Exit Session</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-3 py-2 text-[13px] font-medium text-[#555550] hover:text-[#111111] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/about"
                  className="hidden md:inline-flex items-center justify-center px-4 py-2 border border-[#D5D5CF] bg-white text-[12.5px] font-medium text-[#111111] hover:bg-[#F2F2EC] transition-colors rounded-[4px] shadow-xs"
                >
                  Talk to us
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-[12.5px] font-medium bg-[#111111] hover:bg-black text-white rounded-[4px] transition-all shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex h-9 w-9 items-center justify-center border border-[#E5E5DF] bg-[#FFFFFF] text-[#111111]"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Speakeasy-Style Mega Menu Dropdown Panel */}
        {activeMegaMenu && (
          <div
            className="hidden lg:block absolute left-4 sm:left-20 lg:left-32 top-[76px] w-[660px] max-w-[95vw] bg-[#FFFFFF] text-[#111111] border border-[#D5D5CF] p-5 shadow-2xl z-50 animate-page-in"
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            {/* Outer panel corner notch markers */}
            <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
            <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
            <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
            <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

            {(() => {
              const group = MEGA_MENU_GROUPS.find((g) => g.id === activeMegaMenu)
              if (!group) return null
              return (
                <div className="space-y-4">
                  {/* Top Eyebrow Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5E5DF]">
                    <span className="font-mono text-[11px] font-medium tracking-[0.06em] text-[#666662] uppercase">
                      {group.eyebrow}
                    </span>
                    <span className="font-mono text-[10px] text-[#8C8C85] tracking-wider uppercase">
                      4 Modules Operational
                    </span>
                  </div>

                  {/* Speakeasy Connected Architectural 2x2 Grid */}
                  <div className="relative border border-[#D5D5CF] bg-[#FFFFFF]">
                    {/* Grid notch markers */}
                    <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
                    <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
                    <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
                    <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />
                    <div className="speakeasy-notch-marker -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" />

                    <div className="grid grid-cols-2">
                      {group.items.map((item, index) => {
                        const isActive = location.pathname === item.to
                        const isLeft = index % 2 === 0
                        const isTop = index < 2
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setActiveMegaMenu(null)}
                            className={`p-4 flex flex-col group select-none transition-colors ${
                              isLeft ? 'border-r border-[#D5D5CF]' : ''
                            } ${isTop ? 'border-b border-[#D5D5CF]' : ''} ${
                              isActive
                                ? 'bg-orange-50/30'
                                : 'hover:bg-[#F7F7F4]'
                            }`}
                          >
                            {/* Tag row with 7px square indicator */}
                            <p className="flex items-center gap-1.5 font-mono text-[10px] font-medium tracking-[0.08em] uppercase text-[#666662] group-hover:text-[#111111] transition-colors mb-1">
                              <span className="w-[7px] h-[7px] shrink-0 bg-[#E05238]" />
                              {item.tag.replace('■ ', '')}
                            </p>

                            {/* Title */}
                            <p className="text-[14px] font-semibold tracking-tight text-[#111111] group-hover:text-[#E05238] transition-colors">
                              {item.title}
                            </p>

                            {/* Subtext */}
                            <p className="text-[12px] text-[#666662] leading-snug mt-1 line-clamp-2">
                              {item.desc}
                            </p>
                          </Link>
                        )
                      })}
                    </div>
                  </div>

                  {/* Bottom Action Pills Row with Dashed Border */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-dashed border-[#D5D5CF]">
                    {group.pills.map((pill) => (
                      <Link
                        key={pill.label}
                        to={pill.to}
                        onClick={() => setActiveMegaMenu(null)}
                        className="rounded-full border border-[#D5D5CF] px-3.5 py-1 font-mono text-[10.5px] tracking-[0.03em] uppercase text-[#444440] hover:border-[#111111] hover:bg-[#F2F2EC] hover:text-[#111111] transition-all"
                      >
                        {pill.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E5E5DF] bg-[#FFFFFF] p-5 space-y-4 shadow-xl">
            <div className="flex flex-col space-y-2 font-medium">
              <Link
                to="/command-center"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 text-[14px] text-[#111111] font-bold border-b border-[#F0F0ED]"
              >
                Command Center
              </Link>
              <Link
                to="/live-fleet"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 text-[14px] text-[#111111] border-b border-[#F0F0ED]"
              >
                Live Fleet
              </Link>
              <Link
                to="/urban-map"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 text-[14px] text-[#111111] border-b border-[#F0F0ED]"
              >
                Urban GIS Map
              </Link>
              <Link
                to="/road-intelligence"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 text-[14px] text-[#111111] border-b border-[#F0F0ED]"
              >
                Road AI
              </Link>
              <Link
                to="/bigdata-pipeline"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 text-[14px] text-[#111111] border-b border-[#F0F0ED]"
              >
                Big Data Pipeline
              </Link>
              <Link
                to="/architecture"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 text-[14px] text-[#111111] border-b border-[#F0F0ED]"
              >
                Architecture
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 text-[14px] text-[#111111]"
              >
                About Platform
              </Link>
            </div>

            {/* Mobile Theme Toggle */}
            <div className="pt-2 border-t border-[#E5E5DF] flex items-center justify-between">
              <span className="text-xs font-mono text-[#666662]">Current Theme</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="px-3 py-1 rounded-[3px] border border-[#D5D5CF] text-xs font-mono font-semibold"
              >
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>

            {/* Mobile Auth actions */}
            <div className="pt-2 border-t border-[#E5E5DF] flex gap-3">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    setIsMobileMenuOpen(false)
                    navigate('/login')
                  }}
                  className="w-full py-2 bg-rose-50 text-rose-600 font-semibold text-xs border border-rose-200"
                >
                  Log Out
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-1/2 py-2 text-center border border-[#D5D5CF] text-xs font-semibold"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-1/2 py-2 text-center bg-[#111111] text-white text-xs font-semibold"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  )
}

export default MegaNavbar
