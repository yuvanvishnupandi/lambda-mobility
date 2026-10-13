import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Check,
  Shield,
  Layers,
  Cpu
} from 'lucide-react'
import { useUser } from '../context/UserContext'

export const Signup: React.FC = () => {
  const { register, locations, isLoading } = useUser()
  const navigate = useNavigate()

  const [accountType, setAccountType] = useState<'ADMIN' | 'USER'>('ADMIN')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [department, setDepartment] = useState('Smart Mobility & Municipal Operations')
  const [phone, setPhone] = useState('')
  const [selectedLocationId, setSelectedLocationId] = useState('LOC-CGL')
  const [agreedToTerms, setAgreedToTerms] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!firstName.trim()) {
      setErrorMsg('Please enter your first name.')
      return
    }
    if (!lastName.trim()) {
      setErrorMsg('Please enter your last name.')
      return
    }
    if (!email.trim()) {
      setErrorMsg('Please enter a valid email address.')
      return
    }
    if (!password) {
      setErrorMsg('Please enter a password.')
      return
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.')
      return
    }
    if (!agreedToTerms) {
      setErrorMsg('Please accept the Terms of Service and Privacy Notice to proceed.')
      return
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`
    const loc = locations.find((l) => l.id === selectedLocationId) || locations[0]

    try {
      const res = await register({
        name: fullName,
        email: email.trim(),
        password,
        account_type: accountType,
        role: accountType === 'ADMIN' ? 'Chief Urban Intelligence Officer' : 'Citizen Commuter',
        department: department.trim() || (accountType === 'ADMIN' ? 'Chengalpattu District Transit Administration' : 'Public Transit Passenger'),
        phone: phone.trim() || '+91 98400 00000',
        city: loc.city,
        district: loc.district,
        corridor: loc.corridor
      })

      if (res.success) {
        setSuccessMsg(`Welcome, ${fullName}! Account created and authenticated. Redirecting...`)
        setTimeout(() => {
          if (accountType === 'ADMIN') {
            navigate('/command-center')
          } else {
            navigate('/journey-planner')
          }
        }, 600)
      } else {
        setErrorMsg(res.message || 'Registration failed. Please check your details.')
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Server error creating account. Please retry.')
    }
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#111111] flex flex-col font-sans selection:bg-[#E05238]/20 selection:text-[#111111]">
      {/* Top rainbow gradient micro-bar matching Speakeasy */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF6B4A] via-[#E05238] to-[#6366F1]" />

      {/* Speakeasy-style Minimal Header */}
      <header className="w-full border-b border-[#E5E5DF] bg-[#FBFBFA] px-6 lg:px-12 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/lambda-navbar-logo.png"
              alt="Lambda"
              className="h-8 sm:h-9 w-auto max-h-9 object-contain"
              style={{
                height: '36px',
                maxHeight: '36px',
                width: 'auto',
                maxWidth: '180px',
                objectFit: 'contain',
                imageRendering: '-webkit-optimize-contrast'
              }}
            />
            <span className="hidden sm:inline-block font-mono text-[10.5px] uppercase tracking-widest text-[#666662] font-semibold border-l border-[#E5E5DF] pl-3">
              AI Mobility Control Plane
            </span>
          </Link>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-[#666662]">Already registered?</span>
            <Link
              to="/login"
              className="font-bold text-[#111111] hover:text-[#E05238] uppercase tracking-wider transition-colors underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Two-Column Expansive Speakeasy Layout (Wide max-w-7xl) */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-12 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left Column: Editorial Headline + Live Architecture Spec Inspector */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#E05238]">
                <span>■</span> Municipal Infrastructure Onboarding
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[52px] font-normal text-[#111111] leading-[1.08] tracking-tight">
                Scale urban mobility<br />across your corridor.
              </h1>
              <p className="text-sm text-[#666662] leading-relaxed max-w-lg">
                Join Tamil Nadu's smart transit deployment. Access high-frequency vehicle telemetry, Spark ML classifiers, and geo-governed corridor control.
              </p>
            </div>

            {/* Speakeasy Live Probe Session Card */}
            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E5E5DF] pb-3 mb-4 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider text-[#111111]">
                    CORRIDOR TELEMETRY ENGINE
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 uppercase tracking-wider">
                  ACTIVE
                </span>
              </div>

              <div className="space-y-3 font-mono text-[12px] leading-relaxed">
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50/60 p-2.5 border border-emerald-200">
                  <Check className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                  <span>248 On-Vehicle Probes Transmitting Live Telemetry</span>
                </div>
                <p className="text-[#666662] text-[11px] pl-1">
                  Kafka topics partitioned · HDFS cold storage · Spark ML random forest 97.4% accuracy
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 text-[11.5px]">
                  <div className="border border-[#E5E5DF] p-2.5 bg-[#FBFBFA]">
                    <div className="text-[10px] text-[#8C8C85] uppercase">Sub-second Latency</div>
                    <div className="font-bold text-[#111111]">0.84ms Pipeline</div>
                  </div>
                  <div className="border border-[#E5E5DF] p-2.5 bg-[#FBFBFA]">
                    <div className="text-[10px] text-[#8C8C85] uppercase">Corridor Coverage</div>
                    <div className="font-bold text-[#111111]">GST Road NH 45</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Three Pillar Cards */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="border border-[#E5E5DF] bg-[#FFFFFF] p-3">
                <Shield className="h-4 w-4 text-[#E05238] mb-1.5" />
                <p className="font-bold text-[#111111]">Role-Governed</p>
                <p className="text-[11px] text-[#777770] mt-0.5 leading-tight">Admin & citizen authorization tiers.</p>
              </div>
              <div className="border border-[#E5E5DF] bg-[#FFFFFF] p-3">
                <Layers className="h-4 w-4 text-[#2563EB] mb-1.5" />
                <p className="font-bold text-[#111111]">Spatial GIS</p>
                <p className="text-[11px] text-[#777770] mt-0.5 leading-tight">Real-time hazard and bus coordinates.</p>
              </div>
              <div className="border border-[#E5E5DF] bg-[#FFFFFF] p-3">
                <Cpu className="h-4 w-4 text-[#2F7C4E] mb-1.5" />
                <p className="font-bold text-[#111111]">ML Hazard AI</p>
                <p className="text-[11px] text-[#777770] mt-0.5 leading-tight">Pothole severity classification.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Wide Enterprise Registration Card */}
          <div className="lg:col-span-6">
            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-8 sm:p-10 shadow-lg">

              {/* Brand Header */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src="/lambda-navbar-logo.png"
                    alt="Lambda"
                    className="h-10 w-auto max-h-11 object-contain"
                    style={{
                      height: '40px',
                      maxHeight: '40px',
                      width: 'auto',
                      objectFit: 'contain',
                      imageRendering: '-webkit-optimize-contrast'
                    }}
                  />
                </div>
                <h2 className="text-[20px] font-serif font-normal text-[#111111]">
                  Create your Lambda Account
                </h2>
                <p className="text-xs text-[#666662] leading-relaxed">
                  Enter your operational credentials to initialize your control plane or commuter journey profile.
                </p>
              </div>

              {/* Account Type Selector (Admin vs Commuter) */}
              <div className="mb-6 space-y-1.5">
                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#666662]">
                  Select Account Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountType('ADMIN')
                      setDepartment('Smart Mobility & Municipal Operations')
                    }}
                    className={`p-3 text-left border transition-all ${
                      accountType === 'ADMIN'
                        ? 'border-[#111111] bg-[#F7F7F4] shadow-xs'
                        : 'border-[#E5E5DF] bg-[#FFFFFF] hover:border-[#D5D5CF]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-[#111111]">Municipal Admin</span>
                      {accountType === 'ADMIN' && (
                        <span className="h-2 w-2 rounded-full bg-[#E05238]" />
                      )}
                    </div>
                    <p className="text-[10.5px] text-[#666662] leading-tight">
                      Command Center & ML pipelines
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAccountType('USER')
                      setDepartment('Public Commuter Network')
                    }}
                    className={`p-3 text-left border transition-all ${
                      accountType === 'USER'
                        ? 'border-[#111111] bg-[#F7F7F4] shadow-xs'
                        : 'border-[#E5E5DF] bg-[#FFFFFF] hover:border-[#D5D5CF]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-[#111111]">Citizen Commuter</span>
                      {accountType === 'USER' && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="text-[10.5px] text-[#666662] leading-tight">
                      Journey planning & bus live map
                    </p>
                  </button>
                </div>
              </div>

              {/* Status Messages */}
              {errorMsg && (
                <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#666662] mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      required
                      className="w-full px-3.5 py-2.5 border border-[#D5D5CF] bg-[#FFFFFF] text-sm text-[#111111] placeholder:text-[#8C8C85] focus:border-[#111111] focus:outline-none transition-colors font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#666662] mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Vishnu"
                      required
                      className="w-full px-3.5 py-2.5 border border-[#D5D5CF] bg-[#FFFFFF] text-sm text-[#111111] placeholder:text-[#8C8C85] focus:border-[#111111] focus:outline-none transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#666662] mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@chengalpattu.tn.gov.in"
                    required
                    className="w-full px-3.5 py-2.5 border border-[#D5D5CF] bg-[#FFFFFF] text-sm text-[#111111] placeholder:text-[#8C8C85] focus:border-[#111111] focus:outline-none transition-colors font-mono"
                  />
                </div>

                {/* Department / Agency & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#666662] mb-1">
                      Agency / Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Operations Command"
                      className="w-full px-3.5 py-2.5 border border-[#D5D5CF] bg-[#FFFFFF] text-sm text-[#111111] placeholder:text-[#8C8C85] focus:border-[#111111] focus:outline-none transition-colors font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#666662] mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98400 12345"
                      className="w-full px-3.5 py-2.5 border border-[#D5D5CF] bg-[#FFFFFF] text-sm text-[#111111] placeholder:text-[#8C8C85] focus:border-[#111111] focus:outline-none transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#666662] mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full px-3.5 py-2.5 pr-9 border border-[#D5D5CF] bg-[#FFFFFF] text-sm text-[#111111] placeholder:text-[#8C8C85] focus:border-[#111111] focus:outline-none transition-colors font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#8C8C85] hover:text-[#111111]"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#666662] mb-1">
                      Confirm Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-3.5 py-2.5 border border-[#D5D5CF] bg-[#FFFFFF] text-sm text-[#111111] placeholder:text-[#8C8C85] focus:border-[#111111] focus:outline-none transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Primary Operating Corridor / District Zone */}
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#666662] mb-1">
                    Operating City & Corridor Zone
                  </label>
                  <select
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#D5D5CF] bg-[#FFFFFF] text-sm text-[#111111] focus:border-[#111111] focus:outline-none font-mono"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.city} — {loc.corridor} ({loc.district})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Terms & Privacy checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#666662] select-none leading-snug">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 border-[#D5D5CF] text-[#111111] focus:ring-0 rounded-none"
                    />
                    <span>
                      I agree to Lambda's{' '}
                      <Link to="/about" className="underline font-semibold text-[#111111] hover:text-[#E05238]">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/about" className="underline font-semibold text-[#111111] hover:text-[#E05238]">
                        Privacy Policy
                      </Link>.
                    </span>
                  </label>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-3 py-3 bg-[#111111] hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'PROVISIONING ACCOUNT…' : 'CREATE ACCOUNT & ENTER'}
                  {!isLoading && <ArrowRight className="h-3.5 w-3.5" />}
                </button>
              </form>

              {/* Already have an account link */}
              <div className="mt-6 text-center text-xs text-[#666662]">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-[#111111] underline hover:text-[#E05238] transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Clean minimal auth footer matching Speakeasy */}
      <footer className="w-full py-6 border-t border-[#E5E5DF] bg-[#FBFBFA] text-center text-xs text-[#8C8C85]">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Lambda AI Mobility Control Plane. All rights reserved.</p>
          <div className="flex items-center gap-6 text-[11px] font-mono">
            <Link to="/about" className="hover:text-[#111111] transition-colors">Terms of Service</Link>
            <span>·</span>
            <Link to="/about" className="hover:text-[#111111] transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Signup
