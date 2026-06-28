import Link from 'next/link'
import { ArrowUpRight, ClipboardCheck, MapPinned, ShieldCheck, type LucideIcon } from 'lucide-react'

const journeys: Array<{ number: string; title: string; text: string; href: string; action: string; icon: LucideIcon }> = [
  { number: '01', title: 'Community map', text: 'Browse approximate care zones, use filters, and open protected details only when the next action needs them.', href: '/map', action: 'Explore map', icon: MapPinned },
  { number: '02', title: 'Lost & Found', text: 'Search active reports, create a protected report, and keep public locations and contact details safer.', href: '/lost-found', action: 'Open Lost & Found', icon: ShieldCheck },
  { number: '03', title: 'My cats', text: 'Keep routines, observations, supplies, sitter instructions, and memories attached to individual cat profiles.', href: '/care', action: 'Open cat care', icon: ClipboardCheck },
]

export default function HowItWorks() {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-end"><div><span className="wm-kicker">Three clear places to start</span><h2 className="mt-3 max-w-xl text-4xl font-black leading-[0.92] tracking-[-0.07em] text-wm-ink sm:text-5xl">Useful care beats a noisy feed.</h2></div><p className="max-w-2xl text-sm leading-relaxed text-wm-muted sm:text-base">WhisMap separates public community work from personal care records so users can act without accidentally exposing sensitive locations or private contact details.</p></div>
        <div className="mt-7 grid gap-px overflow-hidden rounded-[28px] border border-wm-line bg-wm-line lg:grid-cols-3">{journeys.map((journey) => { const Icon = journey.icon; return <article key={journey.title} className="group flex min-h-[290px] flex-col bg-white p-6 transition hover:bg-wm-orange-wash sm:p-7"><div className="flex items-start justify-between"><span className="text-3xl font-black tracking-[-0.06em] text-wm-action">{journey.number}</span><span className="grid h-10 w-10 place-items-center rounded-2xl bg-wm-ink/5 text-wm-ink transition group-hover:bg-wm-ink group-hover:text-white"><Icon className="h-5 w-5" /></span></div><h3 className="mt-11 text-2xl font-black tracking-[-0.05em] text-wm-ink">{journey.title}</h3><p className="mt-2 max-w-md text-sm leading-relaxed text-wm-muted">{journey.text}</p><Link href={journey.href} className="mt-auto inline-flex items-center gap-1.5 pt-7 text-sm font-black text-wm-action hover:underline">{journey.action} <ArrowUpRight className="h-4 w-4" /></Link></article>})}</div>
      </div>
    </section>
  )
}
