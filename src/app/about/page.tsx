import PageIntro from '@/components/layout/PageIntro'
import { AlertTriangle, EyeOff, LockKeyhole, ShieldCheck, Users } from 'lucide-react'

const rules = [
  { icon: EyeOff, title: 'Approximate locations are the default', desc: 'Public views should use landmarks, generalized areas, or a privacy radius—not a home address, hidden den, or feeder routine.' },
  { icon: LockKeyhole, title: 'Private data stays separate', desc: 'Household health notes, sitter instructions, and private contact methods should never be mixed into community browsing.' },
  { icon: ShieldCheck, title: 'Reports need moderation', desc: 'Lost-cat, sighting, and cruelty reports need review states, expiry rules, abuse controls, and a clear meaning for “verified.”' },
  { icon: Users, title: 'Permissions should be explicit', desc: 'Caregivers, sitters, moderators, and public visitors need different access—not one open view for everyone.' },
]

export default function AboutPage() {
  return (
    <div className="pb-10">
      <PageIntro eyebrow="WhisMap approach / safety is a product feature" title="Care coordination, not public exposure." description="WhisMap is designed around the practical needs of community caregivers and cat owners while making the safer choice easier to understand and use." detail="The interface explains both what it does and what a real backend still needs." />
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6"><div className="grid gap-4 lg:grid-cols-[0.86fr_1.14fr]"><article className="rounded-[28px] bg-wm-ink p-6 text-white sm:p-8"><span className="text-[10px] font-black uppercase tracking-[0.15em] text-wm-orange">Safety promise</span><h2 className="mt-4 text-4xl font-black leading-[0.92] tracking-[-0.07em]">The map should protect first.</h2><p className="mt-4 max-w-lg text-sm leading-relaxed text-white/68">People should not need to understand hidden policy rules to avoid publishing sensitive locations or personal details. The safer default should be visible in the copy, controls, and review flow.</p><div className="mt-6 flex items-start gap-3 rounded-2xl bg-white/8 p-4"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-wm-orange" /><p className="text-xs leading-relaxed text-white/72">This frontend prototype does not moderate, verify, send messages, or protect data on a server. It shows the intended user experience and boundaries.</p></div></article><div className="grid gap-px overflow-hidden rounded-[28px] border border-wm-line bg-wm-line sm:grid-cols-2">{rules.map((rule) => { const Icon = rule.icon; return <article key={rule.title} className="bg-white p-6 transition hover:bg-wm-orange-wash"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-wm-orange-wash text-wm-action"><Icon className="h-5 w-5" /></span><h3 className="mt-8 text-xl font-black tracking-[-0.045em] text-wm-ink">{rule.title}</h3><p className="mt-2 text-sm leading-relaxed text-wm-muted">{rule.desc}</p></article> })}</div></div></section>
    </div>
  )
}
