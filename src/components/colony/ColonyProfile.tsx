'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Clock3, EyeOff, LockKeyhole, MapPin, ShieldCheck, Users } from 'lucide-react'
import type { Colony } from '@/lib/data'
import { statusColors, statusLabels } from '@/lib/data'
import { useLocalStorageState } from '@/hooks/use-local-storage-state'

function formatLocalTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date)
}

export default function ColonyProfile({ colony }: { colony: Colony }) {
  const [localCheckIn, setLocalCheckIn, hydrated] = useLocalStorageState<string>(`whismap-colony-checkin-${colony.id}`, '')
  const [notice, setNotice] = useState('')

  const saveCheckIn = () => {
    const value = new Date().toISOString()
    setLocalCheckIn(value)
    setNotice('Local check-in saved on this device. It does not update a public map or contact other caregivers.')
  }

  return (
    <div className="grid gap-4">
      <header className="wm-page-intro grid gap-5 px-5 py-6 sm:px-7 sm:py-8 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-end">
        <div><span className="wm-kicker">Protected care zone / public profile</span><h1 className="mt-3 text-[clamp(2.7rem,5vw,5.4rem)] font-black leading-[0.88] tracking-[-0.08em] text-wm-ink">{colony.name}</h1><p className="mt-4 max-w-2xl text-sm leading-relaxed text-wm-muted">This public profile gives enough context to coordinate safely. Exact feeding points, routes, caregiver identities, and vulnerable cat locations are intentionally not shown.</p></div>
        <div className="rounded-[22px] border border-wm-line bg-wm-orange-wash p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-wm-action" /><div><p className="text-sm font-black text-wm-ink">Approximate by default</p><p className="mt-1 text-xs leading-relaxed text-wm-muted">The distance and map pin are illustrative public-area data in this prototype.</p></div></div></div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_350px]">
        <section className="overflow-hidden rounded-[28px] border border-wm-line bg-white shadow-[0_12px_30px_rgba(35,39,48,0.06)]">
          <div className="wm-map-grid relative min-h-[250px] overflow-hidden p-5 sm:min-h-[310px] sm:p-7"><div className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-8 border-white bg-wm-action text-white shadow-xl"><MapPin className="h-7 w-7" /></div><div className="absolute left-1/2 top-1/2 h-[185px] w-[185px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-wm-action/45 bg-wm-orange/10" /><div className="relative z-10 max-w-[260px] rounded-2xl border border-wm-line bg-white/94 p-4 shadow-sm backdrop-blur-sm"><p className="text-sm font-black text-wm-ink">General care area</p><p className="mt-1 text-xs leading-relaxed text-wm-muted">Map placement is intentionally generalized. Never use this card to locate a cat, feeder, or private property.</p></div></div>
          <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-start sm:p-6"><div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${statusColors[colony.status]}`}>{statusLabels[colony.status]}</span><span className="text-xs font-bold text-wm-muted">Approx. {colony.distance} km away</span></div><p className="mt-4 text-sm leading-relaxed text-wm-muted">{colony.note}</p></div><div className="grid grid-cols-2 gap-2 sm:w-[206px]"><div className="rounded-2xl border border-wm-line bg-[#fcfbfa] p-3"><p className="text-lg font-black text-wm-ink">{colony.cats}</p><p className="mt-0.5 text-[10px] font-bold leading-snug text-wm-muted">Sample count</p></div><div className="rounded-2xl border border-wm-line bg-[#fcfbfa] p-3"><p className="text-lg font-black text-wm-ink">Public</p><p className="mt-0.5 text-[10px] font-bold leading-snug text-wm-muted">Visibility level</p></div></div></div>
        </section>

        <aside className="grid content-start gap-4">
          {notice ? <div role="status" className="flex items-start gap-3 rounded-2xl border border-wm-sage/20 bg-wm-sage-soft p-4"><Check className="mt-0.5 h-5 w-5 shrink-0 text-wm-sage" /><p className="text-sm leading-relaxed text-wm-ink">{notice}</p></div> : null}
          <section className="rounded-[24px] border border-wm-line bg-white p-5 shadow-[0_10px_24px_rgba(35,39,48,0.05)]"><p className="text-sm font-black text-wm-ink">Local field note</p><p className="mt-1 text-xs leading-relaxed text-wm-muted">Track your own visit without changing shared data.</p>{localCheckIn ? <p className="mt-4 flex items-center gap-2 rounded-xl bg-wm-sage-soft px-3 py-2 text-xs font-bold text-wm-sage"><Clock3 className="h-3.5 w-3.5" /> Saved locally {formatLocalTime(localCheckIn)}</p> : <p className="mt-4 text-xs font-bold text-wm-muted">No local check-in yet.</p>}<button type="button" onClick={saveCheckIn} className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-wm-action px-3 text-sm font-extrabold text-white hover:bg-wm-action-hover"><Check className="h-4 w-4" /> Save local check-in</button>{!hydrated ? <p className="mt-2 text-xs font-bold text-wm-muted">Loading local record…</p> : null}</section>
          <section className="rounded-[24px] bg-wm-ink p-5 text-white"><LockKeyhole className="h-5 w-5 text-wm-orange" /><p className="mt-4 text-sm font-black">Protected details need roles.</p><p className="mt-2 text-xs leading-relaxed text-white/70">A production system should use authenticated caregiver roles, moderation, audit logs, and permission boundaries before showing any sensitive care detail.</p><button type="button" onClick={() => setNotice('Trusted access is intentionally unavailable in this frontend-only prototype.')} className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-extrabold text-white hover:bg-white/15"><ShieldCheck className="h-4 w-4 text-wm-orange" /> Request trusted access</button></section>
        </aside>
      </div>

      <section className="grid gap-4 md:grid-cols-3"><article className="rounded-[24px] border border-wm-line bg-white p-5"><EyeOff className="h-5 w-5 text-wm-action" /><h2 className="mt-6 text-lg font-black text-wm-ink">What stays hidden</h2><p className="mt-2 text-sm leading-relaxed text-wm-muted">Exact pins, household addresses, regular feeding times, and individual feeder details.</p></article><article className="rounded-[24px] border border-wm-line bg-white p-5"><Users className="h-5 w-5 text-wm-action" /><h2 className="mt-6 text-lg font-black text-wm-ink">What public users can do</h2><p className="mt-2 text-sm leading-relaxed text-wm-muted">Add a protected sighting, browse approximate zones, and keep observations factual.</p></article><article className="rounded-[24px] border border-wm-line bg-white p-5"><ShieldCheck className="h-5 w-5 text-wm-action" /><h2 className="mt-6 text-lg font-black text-wm-ink">What production needs</h2><p className="mt-2 text-sm leading-relaxed text-wm-muted">Authenticated roles, review queues, consent records, and rules for when private details can be accessed.</p></article></section>

      <div className="flex flex-wrap gap-2"><Link href="/add-sighting" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-wm-action px-4 py-2 text-sm font-extrabold text-white hover:bg-wm-action-hover"><MapPin className="h-4 w-4" /> Add protected sighting</Link><Link href="/map" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-wm-line bg-white px-4 py-2 text-sm font-extrabold text-wm-ink hover:border-wm-action/35 hover:bg-wm-orange-wash"><ArrowLeft className="h-4 w-4" /> Back to map</Link></div>
    </div>
  )
}
