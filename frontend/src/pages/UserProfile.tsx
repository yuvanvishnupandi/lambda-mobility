import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Shield,
  Building,
  MapPin,
  Save,
  CheckCircle2,
  RefreshCw,
  Compass,
  Bell,
  KeyRound,
  Globe,
  Check,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { useUser, UserProfile as UserProfileType } from '../context/UserContext'

export const UserProfile: React.FC = () => {
  const { user, locations, currentLocation, switchLocation, updateProfile, logout, isLoading, theme, toggleTheme } = useUser()
  const navigate = useNavigate()

  const [formData, setFormData] = useState<UserProfileType>({ ...user })
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTransitToggle = (mode: string) => {
    setFormData((prev) => {
      const current = prev.preferred_transit || []
      const updated = current.includes(mode)
        ? current.filter((m) => m !== mode)
        : [...current, mode]
      return { ...prev, preferred_transit: updated }
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveStatus({ type: null, message: '' })

    const res = await updateProfile(formData)
    setIsSaving(false)

    if (res.success) {
      setSaveStatus({
        type: 'success',
        message: 'Profile configuration updated and saved to Lambda database successfully.'
      })
      setTimeout(() => setSaveStatus({ type: null, message: '' }), 4000)
    } else {
      setSaveStatus({
        type: 'error',
        message: res.message || 'Error updating profile details.'
      })
    }
  }

  const transitOptions = [
    'Suburban Rail (Southern Railway)',
    'MTC Express (Route 500A / 118)',
    'Metro Feeder',
    'GST Arterial Rapid Bus',
    'Tech Campus EV Shuttle (Cybervale)',
    'Feeder Micro-Mobility'
  ]

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-6 animate-page-in">
        {/* Top Header Card — Speakeasy Box */}
        <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 shadow-xs">
          <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center bg-[#111111] text-white font-mono font-bold text-xl border border-[#D5D5CF]">
                {formData.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'YV'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">{formData.name}</h1>
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${
                    formData.account_type === 'USER'
                      ? 'border-blue-300 bg-blue-50 text-blue-700'
                      : 'border-amber-300 bg-amber-50 text-amber-800'
                  }`}>
                    {formData.account_type === 'USER' ? 'Verified Commuter' : 'Verified Admin Officer'}
                  </span>
                </div>
                <p className="text-xs text-[#666662] font-mono mt-1 font-medium">{formData.role}</p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#888880] mt-2 font-mono">
                  <span className="flex items-center gap-1">
                    <Building className="h-3 w-3 text-[#111111]" />
                    {formData.department || 'Chengalpattu Transit Command'}
                  </span>
                  <span className="text-[#D5D5CF]">·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-[#E05238]" />
                    {currentLocation.city} · {currentLocation.district} (NH 45)
                  </span>
                </div>
              </div>
            </div>

            {/* Account Credentials Badge */}
            <div className="border border-[#D5D5CF] bg-[#F9F9F6] p-3 text-xs font-mono space-y-1 min-w-[260px]">
              <div className="flex items-center justify-between border-b border-[#EBEBE6] pb-1.5 mb-1 text-[10px] uppercase font-bold text-[#111111]">
                <span className="flex items-center gap-1">
                  <KeyRound className="h-3 w-3 text-[#E05238]" />
                  Session Identifier
                </span>
                <span className="text-emerald-700 font-bold">ONLINE</span>
              </div>
              <div className="text-[11px]">User ID: <span className="font-bold text-[#111111]">{formData.email}</span></div>
              <div className="text-[11px]">Clearance: <span className="font-bold text-[#2563EB]">Level 4 Municipal Command</span></div>
              <div className="text-[10px] text-[#888880] pt-0.5">Database: users_db.json (Persisted)</div>
            </div>
          </div>
        </div>

        {/* Status Notification Message */}
        {saveStatus.type && (
          <div
            className={`flex items-center gap-2 p-3 text-xs font-mono border ${
              saveStatus.type === 'success'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'border-rose-300 bg-rose-50 text-rose-800'
            }`}
          >
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{saveStatus.message}</span>
          </div>
        )}

        {/* Operating Zone Localization Card — Speakeasy Box */}
        <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs space-y-4">
          <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
          <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

          <div className="flex items-center justify-between border-b border-[#EBEBE6] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#111111]" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                  Operating Zone Localization · Tamil Nadu Transit Mesh
                </h2>
              </div>
              <p className="text-[11px] text-[#666662] mt-0.5 font-sans">
                Select your active municipality corridor. Real-time telemetry, WebSocket feeds, and GIS map layers sync immediately.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 border border-[#D5D5CF] bg-[#F9F9F6] text-[#111111] font-bold uppercase">
              Current: {currentLocation.city}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5 pt-1">
            {locations.map((loc) => {
              const isActive = loc.id === currentLocation.id
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => switchLocation(loc.id)}
                  className={`relative p-3 text-left transition-all border font-mono ${
                    isActive
                      ? 'border-[#111111] bg-[#F7F7F4] shadow-xs'
                      : 'border-[#E5E5DF] bg-[#FFFFFF] hover:border-[#111111] hover:bg-[#FBFBFA]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#888880] font-bold">{loc.id}</span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 bg-[#E05238] inline-block" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-[#111111] truncate">{loc.city}</div>
                  <div className="text-[10px] text-[#666662] truncate mt-0.5">{loc.corridor}</div>
                  <div className="mt-2.5 pt-1.5 border-t border-[#EBEBE6] flex items-center justify-between text-[10px]">
                    <span className="text-[#888880]">{loc.active_vehicles} Probes</span>
                    <span className="text-emerald-700 font-bold">{loc.congestion_level}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Profile Form — Speakeasy Grid */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left 2 Columns: Personal & Operational Parameters */}
            <div className="lg:col-span-2 space-y-6">
              {/* Box 1: Personal & Official Details */}
              <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs space-y-4">
                <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
                <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
                <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
                <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

                <div className="flex items-center gap-2 border-b border-[#EBEBE6] pb-3">
                  <User className="h-4 w-4 text-[#111111]" />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                    Operator Official Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 font-mono text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-[#444440] uppercase mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full border border-[#D5D5CF] bg-[#FFFFFF] px-3 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#444440] uppercase mb-1">
                      Email Address (Login ID)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full border border-[#D5D5CF] bg-[#FFFFFF] px-3 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#444440] uppercase mb-1">
                      Official Role Title
                    </label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className="w-full border border-[#D5D5CF] bg-[#FFFFFF] px-3 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#444440] uppercase mb-1">
                      Department / Agency
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full border border-[#D5D5CF] bg-[#FFFFFF] px-3 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#444440] uppercase mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-[#D5D5CF] bg-[#FFFFFF] px-3 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#444440] uppercase mb-1">
                      Primary Assigned District
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full border border-[#D5D5CF] bg-[#FFFFFF] px-3 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Box 2: Corridor & Transit Preferences */}
              <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs space-y-4">
                <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
                <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
                <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
                <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

                <div className="flex items-center gap-2 border-b border-[#EBEBE6] pb-3">
                  <Compass className="h-4 w-4 text-[#111111]" />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                    Corridor & Multimodal Preferences
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 font-mono text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-[#444440] uppercase mb-1">
                      Default Origin / Home Hub
                    </label>
                    <input
                      type="text"
                      name="home_hub"
                      value={formData.home_hub}
                      onChange={handleChange}
                      placeholder="e.g. Tambaram Central Interchange"
                      className="w-full border border-[#D5D5CF] bg-[#FFFFFF] px-3 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#444440] uppercase mb-1">
                      Default Destination / Work Hub
                    </label>
                    <input
                      type="text"
                      name="work_hub"
                      value={formData.work_hub}
                      onChange={handleChange}
                      placeholder="e.g. Cybervale Technology Park"
                      className="w-full border border-[#D5D5CF] bg-[#FFFFFF] px-3 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-[#444440] mb-2">
                    Included Transit Modes (AI Journey Engine)
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 font-mono text-xs">
                    {transitOptions.map((mode) => {
                      const isSelected = (formData.preferred_transit || []).includes(mode)
                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => handleTransitToggle(mode)}
                          className={`flex items-center gap-2 p-2.5 text-left transition-all border ${
                            isSelected
                              ? 'border-[#111111] bg-[#F7F7F4] font-bold text-[#111111]'
                              : 'border-[#E5E5DF] bg-[#FFFFFF] text-[#666662] hover:border-[#111111]'
                          }`}
                        >
                          <div
                            className={`flex h-3.5 w-3.5 items-center justify-center border ${
                              isSelected ? 'bg-[#111111] border-[#111111] text-white' : 'border-[#D5D5CF] bg-[#FFFFFF]'
                            }`}
                          >
                            {isSelected && <Check className="h-2.5 w-2.5" />}
                          </div>
                          <span className="text-[11px]">{mode}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Settings & Account Clearance */}
            <div className="space-y-6">
              {/* Box 3: Alert Thresholds & Appearance */}
              <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs space-y-4">
                <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
                <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
                <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
                <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

                <div className="flex items-center gap-2 border-b border-[#EBEBE6] pb-3">
                  <Bell className="h-4 w-4 text-[#111111]" />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                    Operational Controls
                  </h2>
                </div>

                <div className="font-mono text-xs space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#444440] uppercase mb-1">
                      Incident Sensitivity
                    </label>
                    <select
                      name="alert_level"
                      value={formData.alert_level}
                      onChange={handleChange}
                      className="w-full border border-[#D5D5CF] bg-[#FFFFFF] px-3 py-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-none transition-colors"
                    >
                      <option value="CRITICAL_AND_HIGH">Critical & High Incidents Only</option>
                      <option value="ALL_ALERTS">All Alerts (Full Telemetry Stream)</option>
                      <option value="ANOMALY_ALERTS">Big Data ML Anomalies Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#444440] uppercase mb-1">
                      Interface Theme Mode
                    </label>
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between border border-[#D5D5CF] bg-[#F9F9F6] px-3 py-2 text-xs font-mono font-semibold text-[#111111] hover:border-[#111111] transition-all"
                    >
                      <span className="flex items-center gap-2">
                        {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-blue-600" />}
                        <span>{theme === 'dark' ? 'Dark Console' : 'Light Architectural'}</span>
                      </span>
                      <span className="text-[10px] text-[#888880] uppercase">Toggle</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Box 4: Security Clearance & Database Status */}
              <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 shadow-xs space-y-3">
                <div className="speakeasy-notch-marker -top-[4px] -left-[4px]" />
                <div className="speakeasy-notch-marker -top-[4px] -right-[4px]" />
                <div className="speakeasy-notch-marker -bottom-[4px] -left-[4px]" />
                <div className="speakeasy-notch-marker -bottom-[4px] -right-[4px]" />

                <div className="flex items-center gap-2 border-b border-[#EBEBE6] pb-2">
                  <Shield className="h-4 w-4 text-[#111111]" />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
                    Clearance & Persistence
                  </h2>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2 bg-[#F9F9F6] border border-[#EBEBE6] flex items-center justify-between">
                    <span className="text-[#777770]">Account Tier:</span>
                    <span className="font-bold text-[#111111]">
                      {formData.account_type === 'USER' ? 'Citizen Commuter (USER)' : 'Municipal Authority (ADMIN)'}
                    </span>
                  </div>
                  <div className="p-2 bg-[#F9F9F6] border border-[#EBEBE6] flex items-center justify-between">
                    <span className="text-[#777770]">Telemetry Auth:</span>
                    <span className="font-bold text-emerald-700">
                      {formData.account_type === 'USER' ? 'Level 1: Route & Transit Feeds' : 'Level 4: Full Municipal Command'}
                    </span>
                  </div>
                  <div className="p-2 bg-[#F9F9F6] border border-[#EBEBE6] flex items-center justify-between">
                    <span className="text-[#777770]">Database Sync:</span>
                    <span className="font-bold text-emerald-700">users_db.json (Active)</span>
                  </div>
                  <div className="p-2 bg-[#F9F9F6] border border-[#EBEBE6] flex items-center justify-between">
                    <span className="text-[#777770]">Serving Port:</span>
                    <span className="font-bold text-[#2563EB]">127.0.0.1:8000 Live</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1 font-mono">
                <button
                  type="submit"
                  disabled={isSaving || isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[#111111] hover:bg-black text-white px-4 py-3 text-xs font-bold uppercase tracking-wider shadow-xs transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>Save Profile & Zone Changes</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                  className="w-full flex items-center justify-center gap-2 border border-[#D5D5CF] bg-[#FFFFFF] hover:bg-[#FBFBFA] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-700 transition-all shadow-2xs"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out & Exit Session</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default UserProfile
