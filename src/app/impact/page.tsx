import PageIntro from '@/components/layout/PageIntro'
import { CheckCircle2, Database, LockKeyhole, MapPinned, ShieldCheck, Users } from 'lucide-react'

const signals = [
  { icon: MapPinned, title: 'Coverage', description: 'A production dashboard should show verified care windows, stale check-ins, and response time by approximate area—not a public activity feed.' },
  { icon: ShieldCheck, title: 'Safety', description: 'Measure moderation outcomes, protected location decisions, and report review status without exposing the people or cats involved.' },
  { icon: Users, title: 'Coordination', description: 'Track completed handoffs, volunteer capacity, and duplicate-report resolution with role-aware permissions.' },
  { icon: Database, title: 'Data quality', description: 'Flag unreviewed reports, expired lost-cat posts, missing contact consent, and low-confidence locations for moderation.' },
]

export default function ImpactPage() {
  return (
    <div className="pb-10">
      <PageIntro eyebrow="Impact / trustworthy signals" title="Show what is verified, not what is loud." description="This frontend replaces fictional impact counters with a clear model for the operational signals WhisMap should earn after a moderated backend is connected." detail="All numbers should have a source, review status, and time window." />
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6"><div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]"><article className="rounded-[28px] bg-wm-ink p-6 text-white sm:p-8"><span className="text-[10px] font-black uppercase tracking-[0.15em] text-wm-orange">Prototype disclosure</span><h2 className="mt-4 text-4xl font-black leading-[0.92] tracking-[-0.07em]">No invented outcomes.</h2><p className="mt-4 max-w-lg text-sm leading-relaxed text-white/68">V5 avoids presenting sample data as real community impact. Connect analytics only after consent, data minimization, and report-moderation rules are in place.</p><div className="mt-6 flex items-start gap-3 rounded-2xl bg-white/8 p-4"><LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-wm-orange" /><p className="text-xs leading-relaxed text-white/72">Location, health, and contact data need strict access rules. Public dashboards should use aggregated, delayed, non-identifying data.</p></div></article><div className="grid gap-px overflow-hidden rounded-[28px] border border-wm-line bg-wm-line sm:grid-cols-2">{signals.map((signal) => { const Icon = signal.icon; return <article key={signal.title} className="bg-white p-6 transition hover:bg-wm-orange-wash"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-wm-ink/5 text-wm-ink"><Icon className="h-5 w-5" /></span><h3 className="mt-9 text-xl font-black tracking-[-0.045em] text-wm-ink">{signal.title}</h3><p className="mt-2 text-sm leading-relaxed text-wm-muted">{signal.description}</p></article> })}</div></div><div className="mt-4 flex items-start gap-3 rounded-2xl border border-wm-sage/20 bg-wm-sage-soft p-4"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-wm-sage" /><p className="text-sm leading-relaxed text-wm-muted"><strong className="text-wm-ink">Ready for real metrics:</strong> define the metric owner, data source, review cadence, retention period, and privacy risk before displaying any number.</p></div></section>
    </div>
  )
}
