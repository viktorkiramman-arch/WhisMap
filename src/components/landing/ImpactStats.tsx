import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react'

const signals = [
  { value: '3', label: 'primary user journeys', detail: 'Map, emergency reporting, and private care records.' },
  { value: '0', label: 'exact pins in public cards', detail: 'Approximate areas are the default public view.' },
  { value: '10', label: 'connected care tools', detail: 'All tied to individual cat profiles on this device.' },
]

export default function ImpactStats() {
  return (
    <section className="pb-14 pt-6 sm:pb-20 sm:pt-10">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <article className="rounded-[28px] bg-wm-ink p-6 text-white sm:p-8"><span className="text-[10px] font-black uppercase tracking-[0.15em] text-wm-orange">Product safety model</span><h2 className="mt-4 max-w-lg text-4xl font-black leading-[0.92] tracking-[-0.07em]">Care becomes safer when the interface makes safe defaults visible.</h2><p className="mt-4 max-w-lg text-sm leading-relaxed text-white/68">The prototype shows the intended rules in the UI. A production build still needs account permissions, secure contact requests, moderation, and server-side audit logs.</p><Link href="/about" className="mt-6 inline-flex items-center gap-2 text-sm font-black text-wm-orange hover:underline">Read the safety approach <ArrowUpRight className="h-4 w-4" /></Link></article>
          <div className="grid gap-px overflow-hidden rounded-[28px] border border-wm-line bg-wm-line sm:grid-cols-3">{signals.map((signal) => <article key={signal.label} className="flex min-h-[220px] flex-col bg-white p-6 transition hover:bg-wm-orange-wash"><strong className="text-5xl font-black tracking-[-0.08em] text-wm-ink">{signal.value}</strong><p className="mt-8 text-sm font-black text-wm-ink">{signal.label}</p><p className="mt-1 text-xs leading-relaxed text-wm-muted">{signal.detail}</p></article>)}</div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="flex items-start gap-3 rounded-2xl border border-wm-line bg-white p-4"><ShieldCheck className="mt-0.5 h-5 w-5 text-wm-action" /><div><p className="text-sm font-black text-wm-ink">Privacy-forward copy</p><p className="mt-1 text-xs leading-relaxed text-wm-muted">Prompts explain why approximate areas and safe handoffs matter.</p></div></div><div className="flex items-start gap-3 rounded-2xl border border-wm-line bg-white p-4"><LockKeyhole className="mt-0.5 h-5 w-5 text-wm-action" /><div><p className="text-sm font-black text-wm-ink">Private care workspace</p><p className="mt-1 text-xs leading-relaxed text-wm-muted">Personal cat data is stored locally in this frontend prototype.</p></div></div><div className="flex items-start gap-3 rounded-2xl border border-wm-line bg-white p-4"><CheckCircle2 className="mt-0.5 h-5 w-5 text-wm-action" /><div><p className="text-sm font-black text-wm-ink">Clear prototype limits</p><p className="mt-1 text-xs leading-relaxed text-wm-muted">Where a backend is required, the interface says so instead of implying it exists.</p></div></div></div>
      </div>
    </section>
  )
}
