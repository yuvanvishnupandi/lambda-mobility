import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Check,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react'
import { useUser } from '../context/UserContext'

export const Login: React.FC = () => {
  const { login, isLoading } = useUser()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const location = useLocation()
  const from = (location.state as any)?.from || '/command-center'

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!email.trim()) {
      setErrorMsg('Please enter your account email address.')
      return
    }

    try {
      const res = await login(email.trim(), password)
      if (res.success) {
        setSuccessMsg('Authentication successful! Initializing operating plane...')
        setTimeout(() => {
          navigate(from)
        }, 500)
      } else {
        setErrorMsg(res.message || 'Invalid credentials. Please verify your email and password.')
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error. Please check your credentials.')
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
              style={{ height: '36px', maxHeight: '36px', width: 'auto', maxWidth: '180px', objectFit: 'contain', imageRendering: '-webkit-optimize-contrast' }}
            />
            <span className="hidden sm:inline-block font-mono text-[10.5px] uppercase tracking-widest text-[#666662] font-semibold border-l border-[#E5E5DF] pl-3">
              AI Mobility Control Plane
            </span>
          </Link>

          <div className="flex items-center gap-4 text-xs font-mono">
            <Link
              to="/signup"
              className="font-bold text-[#111111] hover:text-[#E05238] uppercase tracking-wider transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Two-Column Speakeasy Auth Layout */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-12 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Editorial Headline + Live Probe Mac Session Terminal */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#E05238]">
                <span>■</span> Real-Time Transit Governance
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[54px] font-normal text-[#111111] leading-[1.08] tracking-tight">
                Every transit probe,<br />governed.
              </h1>
            </div>

            {/* Speakeasy Mac Terminal Session Box */}
            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 shadow-sm">
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-[#E5E5DF] pb-3 mb-4 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider text-[#111111]">
                    PROBE SESSION
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 uppercase tracking-wider">
                  LIVE
                </span>
              </div>

              {/* Session Status */}
              <div className="space-y-3 font-mono text-[12px] leading-relaxed">
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50/60 p-2.5 border border-emerald-200">
                  <Check className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                  <span>Connected to Lambda Mobility OS · TLS 1.3</span>
                </div>
                <p className="text-[#666662] text-[11px] pl-1">
                  248 active corridor probes · 12 Kafka topics · 6 Spark ML pipelines · corridor governed
                </p>

                {/* Session Action Prompt */}
                <div className="bg-[#FBFBFA] border border-[#E5E5DF] p-3 text-[#111111] space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#8C8C85] tracking-wider">
                    Incoming Telemetry Event
                  </div>
                  <div className="font-sans text-[13px] font-medium text-[#111111]">
                    Handle kinematic anomaly on route #508A — evaluate velocity gradient & classify via Spark Random Forest.
                  </div>
                </div>

                {/* Terminal Actions Stream */}
                <div className="space-y-2 pt-2 border-t border-[#E5E5DF] text-[11.5px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#111111]">Connect sensor-stream Kafka topic</span>
                    <span className="bg-emerald-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                      GRANTED
                    </span>
                  </div>
                  <div className="text-[#8C8C85] pl-2">
                    401 → OAuth via Okta · chengalpattu@tn.gov.in
                  </div>
                  <div className="text-[#666662] pl-2">
                    $ get_telemetry PROBE-4892 --corridor GST-ARTERIAL
                  </div>
                  <div className="text-[#666662] pl-2">
                    $ classify_hazard pothole_severity_pci 0.88 --model SparkRF_v2
                  </div>
                  <div className="text-[#666662] pl-2">
                    $ void_alert 0 duplicates --window 60s
                  </div>
                  <div className="text-emerald-700 pl-2 font-semibold">
                    ✓ Post briefing to #chengalpattu-dispatch (Response: 200 OK)
                  </div>
                </div>

                {/* Bottom Terminal Footnote */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E5E5DF] text-[10px] text-[#8C8C85]">
                  <span>task: probe-telemetry-4892</span>
                  <span>session cost: 0.00ms latency</span>
                </div>
              </div>
            </div>

            {/* Bottom Terminal Sublinks */}
            <div className="flex items-center gap-6 font-mono text-[11px] text-[#8C8C85] uppercase tracking-wider">
              <Link to="/specs" className="hover:text-[#111111] transition-colors">SPECS</Link>
              <Link to="/architecture" className="hover:text-[#111111] transition-colors">ARCHITECTURE</Link>
              <Link to="/about" className="hover:text-[#111111] transition-colors">DOCUMENTATION</Link>
            </div>
          </div>

          {/* Right Column: Speakeasy Brand Auth Lockup */}
          <div className="lg:col-span-5">
            <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-8 sm:p-10 shadow-lg">
              
              {/* Brand Header */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src="/lambda-navbar-logo.png"
                    alt="Lambda"
                    className="h-10 w-auto max-h-11 object-contain"
                    style={{
                      height: '42px',
                      maxHeight: '42px',
                      width: 'auto',
                      objectFit: 'contain',
                      imageRendering: '-webkit-optimize-contrast',
                    }}
                  />
                </div>
                <h2 className="text-[17px] font-semibold text-[#111111] leading-snug">
                  Securely scale AI transit usage across your organization.
                </h2>
                <p className="text-xs text-[#666662] leading-relaxed">
                  Control plane to govern Probes, Spatial GIS and Spark ML Classifiers.
                </p>
              </div>

              {/* Four Speakeasy Category Pills */}
              <div className="grid grid-cols-4 gap-1.5 mb-7 font-mono text-[9px] font-bold text-center tracking-wider text-[#666662]">
                <div className="border border-[#E5E5DF] bg-[#FBFBFA] py-1.5 uppercase">OBSERVE</div>
                <div className="border border-[#E5E5DF] bg-[#FBFBFA] py-1.5 uppercase">SECURE</div>
                <div className="border border-[#E5E5DF] bg-[#FBFBFA] py-1.5 uppercase">CONNECT</div>
                <div className="border border-[#E5E5DF] bg-[#FBFBFA] py-1.5 uppercase">DISTRIBUTE</div>
              </div>

              {/* Status messages */}
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
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[10px] font-mono uppercase text-[#8C8C85]">Officer Authentication</span>
                  <span className="text-[10px] font-mono text-[#8C8C85]">Secure Portal</span>
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#666662] mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    className="w-full px-3.5 py-2.5 border border-[#D5D5CF] bg-[#FFFFFF] text-sm text-[#111111] placeholder:text-[#8C8C85] focus:border-[#111111] focus:outline-none transition-colors font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#666662]">
                      Password
                    </label>
                    <span className="text-[10px] font-mono text-[#8C8C85]">
                      TLS encrypted
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full px-3.5 py-2.5 pr-10 border border-[#D5D5CF] bg-[#FFFFFF] text-sm text-[#111111] placeholder:text-[#8C8C85] focus:border-[#111111] focus:outline-none transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8C8C85] hover:text-[#111111]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Primary Black Log In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 bg-[#111111] hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'AUTHENTICATING…' : 'LOG IN'}
                  {!isLoading && <ArrowRight className="h-3.5 w-3.5" />}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-6 text-center text-xs text-[#666662]">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-[#111111] underline hover:text-[#E05238] transition-colors"
                >
                  Sign up
                </Link>
              </div>

              {/* Legal Disclaimer matching Speakeasy */}
              <p className="mt-6 text-[10px] text-center text-[#8C8C85] leading-relaxed">
                By continuing, you agree to Lambda's{' '}
                <Link to="/about" className="underline hover:text-[#111111]">Terms of Service</Link> and{' '}
                <Link to="/about" className="underline hover:text-[#111111]">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Clean minimal auth footer matching https://app.getgram.ai/ */}
      <footer className="w-full py-6 border-t border-[#E5E5DF] bg-[#FBFBFA] text-center text-xs text-[#8C8C85]">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Lambda AI Mobility Control Plane. All rights reserved.</p>
          <div className="flex items-center gap-6 text-[11px] font-mono">
            <Link to="/about" className="hover:text-[#111111] transition-colors">Terms of Service</Link>
            <span>·</span>
            <Link to="/about" className="hover:text-[#111111] transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link to="/about" className="hover:text-[#111111] transition-colors">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Login
