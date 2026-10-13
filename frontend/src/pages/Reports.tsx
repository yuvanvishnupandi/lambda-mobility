import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import {
  FileText,
  Download,
  CalendarDays,
  TrendingUp,
  AlertTriangle,
  Activity,
  Archive,
  ShieldCheck,
  Route as RouteIcon,
  Cpu,
} from 'lucide-react'
import { apiService } from '../services/api'
import HeaderActions from '../components/HeaderActions'
import { PageHeader } from '../components/common/PageHeader'
import { SectionHeader } from '../components/common/SectionHeader'
import { StatusBadge } from '../components/common/StatusBadge'

const ARCHIVE = [
  { title: 'Daily intelligence report', date: '7 September 2026', type: 'Daily brief' },
  { title: 'Weekly corridor congestion & delay summary', date: '1–7 September 2026', type: 'Weekly' },
  { title: 'Pavement maintenance priority ranking', date: '5 September 2026', type: 'Civil works' },
  { title: 'Incident investigation evidence dossier', date: '4 September 2026', type: 'Enforcement' },
  { title: 'AI performance & sensor uptime audit', date: 'August 2026', type: 'Monthly' },
]

const BRIEF = [
  {
    icon: Activity,
    tone: 'text-brand-500',
    title: 'Traffic patterns & flow density',
    body: (
      <>
        Congestion increased by <strong className="text-amber-600">12%</strong> along the GST Road (NH 45) corridor
        between 08:00 and 10:00. Peak density was recorded at{' '}
        <strong className="text-brand-600">09:15</strong> with roughly{' '}
        <strong className="text-brand-600">8,500 vehicles per hour</strong>. Route 500A carried the largest delay,
        averaging <strong className="text-rose-600">14 minutes</strong>.
      </>
    ),
  },
  {
    icon: AlertTriangle,
    tone: 'text-amber-500',
    title: 'Road surface & infrastructure integrity',
    body: (
      <>
        <strong className="text-amber-600">24 road segments</strong> now need civil maintenance based on repeated
        optical detections. Critical work is queued for{' '}
        <strong className="text-rose-600">GST Road sectors 5–8 (Potheri ↔ Maraimalai Nagar)</strong> (18 potholes flagged),{' '}
        <strong className="text-rose-600">Vandalur Crescent Junction</strong> (14 hazards) and{' '}
        <strong className="text-amber-600">Guduvanchery Flyover approaches</strong> (12 hazards).
      </>
    ),
  },
  {
    icon: TrendingUp,
    tone: 'text-emerald-500',
    title: 'Pedestrian safety & crossings',
    body: (
      <>
        <strong className="text-emerald-600">Seven vulnerable road user events</strong> were detected in school
        zones during the morning drop-off window, all logged with a mean confidence of{' '}
        <strong className="text-emerald-600">93.2%</strong>. No collisions were reported across instrumented routes.
      </>
    ),
  },
  {
    icon: Cpu,
    tone: 'text-iris-500',
    title: 'Fleet telemetry & inference uptime',
    body: (
      <>
        <strong className="text-brand-600">236 of 248 vehicles</strong> streamed with on-vehicle inference active.
        Total detections today: <strong className="text-brand-600">12,846 events</strong>, with camera feed
        availability sustained at <strong className="text-emerald-600">98.2%</strong>.
      </>
    ),
  },
  {
    icon: ShieldCheck,
    tone: 'text-rose-500',
    title: 'Critical incident summary',
    body: (
      <>
        <strong className="text-rose-600">One hit-and-run</strong> was recorded on GST Road (NH 45) at 14:32. The plate was
        resolved as <strong className="u-num text-brand-600">TN 19 AZ 4821</strong> at{' '}
        <strong className="text-emerald-600">96.4% confidence</strong> and the dossier was assigned to traffic
        enforcement.
      </>
    ),
  },
]

export default function Reports() {
  const [liveInsights, setLiveInsights] = useState<string[]>([])

  useEffect(() => {
    apiService.getAIInsights().then(insights => {
      if (insights && insights.length > 0) setLiveInsights(insights)
    })
  }, [])

  return (
    <DashboardLayout>
      <PageHeader
        title="Reports"
        eyebrow="Briefings · evidence & exports"
        icon={FileText}
        live={{ label: 'Daily briefing ready', tone: 'emerald' }}
        subtitle="Automated civic summaries, pavement audits and safety analytics for the region"
        actions={<HeaderActions />}
      />

      <div className="flex-1 space-y-4 overflow-auto p-4 sm:p-5">
        {/* ── Action bar ────────────────────────────────────────────── */}
        <section className="u-panel flex flex-wrap items-center justify-between gap-4 p-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <button className="u-btn u-btn-primary u-btn-sm">
              <Download className="h-3.5 w-3.5" />
              Download intelligence PDF
            </button>
            <button className="u-btn u-btn-outline u-btn-sm">
              <Download className="h-3.5 w-3.5" />
              Export CSV dataset
            </button>
            <button className="u-btn u-btn-outline u-btn-sm">
              <FileText className="h-3.5 w-3.5" />
              Generate custom dossier
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button className="u-btn u-btn-ghost u-btn-sm">
              <CalendarDays className="h-3.5 w-3.5" />
              Schedule automated briefing
            </button>
            <button className="u-btn u-btn-ghost u-btn-sm">
              <RouteIcon className="h-3.5 w-3.5" />
              Dispatch to municipal leadership
            </button>
          </div>
        </section>

        {/* ── Daily brief ───────────────────────────────────────────── */}
        <section className="u-panel overflow-hidden">
          <span className="u-hair" aria-hidden="true" />

          <div className="u-panel-head">
            <div>
              <p className="u-overline">City intelligence brief · 08 Sep 2026 · 06:00–15:30</p>
              <h2 className="u-h2 mt-1.5">What changed in the network today</h2>
            </div>
            <span className="u-chip u-chip-mint">
              <span className="live-dot" />
              Live synthesis
            </span>
          </div>

          {liveInsights.length > 0 && (
            <div className="border-b border-line bg-brand-50/40 px-4 py-3.5 sm:px-5">
              <p className="u-overline mb-2">Correlated insights from live telemetry</p>
              <ul className="space-y-1.5">
                {liveInsights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-ink-secondary">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ol className="divide-y divide-line/70">
            {BRIEF.map(item => (
              <li key={item.title} className="group flex gap-4 px-4 py-4 transition-colors hover:bg-surface-3/40 sm:px-5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-2">
                  <item.icon className={`h-4 w-4 ${item.tone}`} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[13.5px] font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1.5 max-w-3xl text-[12.5px] leading-relaxed text-ink-secondary">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Archive ───────────────────────────────────────────────── */}
        <section className="u-panel overflow-hidden">
          <span className="u-hair" aria-hidden="true" />

          <div className="u-panel-head">
            <SectionHeader
              eyebrow="Archive"
              title="Historical briefings and audits"
              className="!gap-0"
            />
            <span className="u-chip u-chip-slate">Past 30 days</span>
          </div>

          <div className="u-scroll-x">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-surface-1/60">
                <tr>
                  <th className="u-th">Document</th>
                  <th className="u-th">Period</th>
                  <th className="u-th">Type</th>
                  <th className="u-th text-right">Export</th>
                </tr>
              </thead>
              <tbody>
                {ARCHIVE.map(report => (
                  <tr key={report.title} className="u-row group">
                    <td className="u-td">
                      <span className="flex items-center gap-2.5">
                        <FileText className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
                        <span className="font-medium text-ink">{report.title}</span>
                      </span>
                    </td>
                    <td className="u-td u-num text-ink-muted">{report.date}</td>
                    <td className="u-td">
                      <StatusBadge status={report.type} tone="slate" dot={false} size="sm" />
                    </td>
                    <td className="u-td text-right">
                      <button
                        className="inline-flex items-center gap-1 text-[11.5px] font-medium text-brand-600 opacity-0 transition-opacity duration-200 hover:text-brand-500 group-hover:opacity-100"
                        aria-label={`Download ${report.title}`}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2 border-t border-line px-4 py-2.5">
            <Archive className="h-3.5 w-3.5 text-ink-faint" />
            <span className="text-[11.5px] text-ink-muted">
              Signed briefs are retained for 24 months and can be re-issued on request.
            </span>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
