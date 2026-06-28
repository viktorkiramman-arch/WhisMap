'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Check,
  ChevronRight,
  CircleAlert,
  List,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react'
import { colonies, statusLabels, type Colony, type ColonyStatus } from '@/lib/data'

type ViewMode = 'map' | 'list'

const statuses: ColonyStatus[] = ['fed', 'urgent', 'verified', 'review']

const statusStyles: Record<ColonyStatus, { marker: string; badge: string }> = {
  fed: { marker: '#b84412', badge: 'bg-wm-orange-wash text-wm-action' },
  urgent: { marker: '#a83f22', badge: 'bg-wm-danger-soft text-wm-danger' },
  verified: { marker: '#252833', badge: 'bg-wm-ink/6 text-wm-ink' },
  review: { marker: '#85828a', badge: 'bg-wm-ink/5 text-wm-muted' },
}

function MapMarker({ colony, selected, onSelect }: { colony: Colony; selected: boolean; onSelect: () => void }) {
  const tone = statusStyles[colony.status]
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`absolute grid h-10 w-10 place-items-center rounded-full border-4 border-white text-white shadow-lg transition hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-wm-action/20 ${selected ? 'scale-110 ring-4 ring-wm-action/25' : ''}`}
      style={{ left: `${colony.x}%`, top: `${colony.y}%`, backgroundColor: tone.marker }}
      aria-label={`Open approximate details for ${colony.name}`}
    >
      <MapPin className="h-4 w-4" />
    </button>
  )
}

function ColonyCard({ colony, selected, onSelect }: { colony: Colony; selected: boolean; onSelect: () => void }) {
  const tone = statusStyles[colony.status]
  return (
    <button type="button" onClick={onSelect} className={`w-full rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-wm-action/18 ${selected ? 'border-wm-action/30 bg-wm-orange-wash' : 'border-wm-line bg-white hover:border-wm-action/30 hover:bg-[#fcfbfa]'}`}>
      <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-black text-wm-ink">{colony.name}</p><p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-wm-muted"><MapPin className="h-3.5 w-3.5 text-wm-action" /> Approx. {colony.distance} km away</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${tone.badge}`}>{statusLabels[colony.status]}</span></div><p className="mt-3 line-clamp-2 text-xs leading-relaxed text-wm-muted">{colony.note}</p><div className="mt-3 flex items-center justify-between border-t border-wm-line pt-3 text-xs font-bold text-wm-muted"><span>{colony.cats} cats · {colony.lastFed}</span><ChevronRight className="h-4 w-4 text-wm-action" /></div>
    </button>
  )
}

export default function MapWorkspace() {
  const [radius, setRadius] = useState(4)
  const [search, setSearch] = useState('')
  const [activeStatuses, setActiveStatuses] = useState<ColonyStatus[]>(statuses)
  const [selectedId, setSelectedId] = useState<string | null>(colonies[0]?.id ?? null)
  const [view, setView] = useState<ViewMode>('map')
  const [centerMessage, setCenterMessage] = useState('Showing a protected approximate area.')

  const matching = useMemo(() => {
    const query = search.trim().toLowerCase()
    return colonies.filter((colony) => {
      const matchesRadius = colony.distance <= radius
      const matchesStatus = activeStatuses.includes(colony.status)
      const matchesSearch = !query || [colony.name, colony.note, statusLabels[colony.status]].join(' ').toLowerCase().includes(query)
      return matchesRadius && matchesStatus && matchesSearch
    })
  }, [activeStatuses, radius, search])

  const selected = matching.find((colony) => colony.id === selectedId) ?? matching[0] ?? null
  const toggleStatus = (status: ColonyStatus) => setActiveStatuses((current) => current.includes(status) ? current.filter((item) => item !== status) : [...current, status])

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_355px]">
      <section className="overflow-hidden rounded-[28px] border border-wm-line bg-white shadow-[0_12px_30px_rgba(35,39,48,0.06)]">
        <div className="flex flex-col gap-3 border-b border-wm-line p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div><p className="text-sm font-black text-wm-ink">Nearby care zones</p><p className="mt-1 text-xs leading-relaxed text-wm-muted">{centerMessage} Exact coordinates are never included in public cards.</p></div>
          <div className="inline-flex w-fit rounded-xl border border-wm-line bg-[#fcfbfa] p-1"><button type="button" onClick={() => setView('map')} className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-black ${view === 'map' ? 'bg-wm-ink text-white' : 'text-wm-muted hover:bg-white'}`}><MapIcon className="h-3.5 w-3.5" /> Map</button><button type="button" onClick={() => setView('list')} className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-black ${view === 'list' ? 'bg-wm-ink text-white' : 'text-wm-muted hover:bg-white'}`}><List className="h-3.5 w-3.5" /> List</button></div>
        </div>

        {view === 'map' ? <div className="wm-map-grid relative min-h-[560px] overflow-hidden p-4 sm:p-6">
          <div className="absolute left-6 top-6 rounded-2xl border border-wm-line bg-white/94 p-3 shadow-sm backdrop-blur-sm"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-wm-action" /><p className="text-sm font-black text-wm-ink">Public view</p></div><p className="mt-1 max-w-[230px] text-xs leading-relaxed text-wm-muted">Pins show care zones, not a cat’s exact hiding place or a feeder’s routine.</p></div>
          <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-wm-action/50 bg-wm-orange/10" aria-hidden="true" />
          <div className="absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white bg-wm-ink text-white shadow-lg" aria-hidden="true"><LocateFixed className="h-4 w-4" /></div>
          {matching.map((colony) => <MapMarker key={colony.id} colony={colony} selected={selected?.id === colony.id} onSelect={() => setSelectedId(colony.id)} />)}
          <div className="absolute bottom-5 left-5 right-5 max-w-xl rounded-2xl border border-wm-line bg-white/94 p-3 shadow-sm backdrop-blur-sm"><div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-wm-muted">{statuses.map((status) => <span key={status} className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: statusStyles[status].marker }} />{statusLabels[status]}</span>)}</div></div>
        </div> : <div className="grid gap-3 p-4 sm:p-5">{matching.length ? matching.map((colony) => <ColonyCard key={colony.id} colony={colony} selected={selected?.id === colony.id} onSelect={() => setSelectedId(colony.id)} />) : <EmptyMapState />}</div>}

        {view === 'map' && selected ? <div className="border-t border-wm-line bg-white p-4 sm:p-5"><div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${statusStyles[selected.status].badge}`}>{statusLabels[selected.status]}</span><span className="text-xs font-bold text-wm-muted">Approx. {selected.distance} km · {selected.cats} cats</span></div><h2 className="mt-2 text-xl font-black tracking-[-0.045em] text-wm-ink">{selected.name}</h2><p className="mt-1 max-w-2xl text-sm leading-relaxed text-wm-muted">{selected.note}</p></div><div className="flex flex-wrap gap-2"><Link href={`/colony/${selected.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-wm-action px-3.5 py-2 text-sm font-extrabold text-white hover:bg-wm-action-hover"><ShieldCheck className="h-4 w-4" /> Protected details</Link><Link href="/add-sighting" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-wm-line bg-white px-3.5 py-2 text-sm font-extrabold text-wm-ink hover:border-wm-action/35 hover:bg-wm-orange-wash"><MapPin className="h-4 w-4" /> Add sighting</Link></div></div></div> : null}
      </section>

      <aside className="grid gap-4 xl:sticky xl:top-24 xl:self-start">
        <section className="rounded-[24px] border border-wm-line bg-white p-4 shadow-[0_10px_24px_rgba(35,39,48,0.05)]"><div className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-wm-action" /><p className="text-sm font-black text-wm-ink">Find care zones</p></div><label className="relative mt-4 block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-wm-muted" /><span className="sr-only">Search care zones</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search area or status" className="min-h-11 w-full rounded-xl border border-wm-line bg-white pl-10 pr-3 text-sm font-bold text-wm-ink placeholder:text-wm-muted" /></label><div className="mt-4"><div className="flex items-baseline justify-between"><label htmlFor="radius" className="text-xs font-black text-wm-muted">Care radius</label><span className="text-sm font-black text-wm-action">{radius} km</span></div><input id="radius" type="range" min="1" max="10" value={radius} onChange={(event) => setRadius(Number(event.target.value))} className="wm-care-range mt-2 w-full" /><p className="mt-1 text-xs leading-relaxed text-wm-muted">Filters public, approximate zones in this prototype.</p></div><fieldset className="mt-4"><legend className="text-xs font-black text-wm-muted">Show</legend><div className="mt-2 flex flex-wrap gap-2">{statuses.map((status) => <button key={status} type="button" onClick={() => toggleStatus(status)} aria-pressed={activeStatuses.includes(status)} className={`rounded-full px-2.5 py-1.5 text-[10px] font-black transition ${activeStatuses.includes(status) ? statusStyles[status].badge : 'bg-wm-ink/5 text-wm-muted line-through'}`}>{statusLabels[status]}</button>)}</div></fieldset><button type="button" onClick={() => setCenterMessage('Centered on your saved approximate area. No device location was requested.')} className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-wm-line bg-white px-3 text-sm font-extrabold text-wm-ink hover:border-wm-action/35 hover:bg-wm-orange-wash"><LocateFixed className="h-4 w-4" /> Use approximate area</button></section>

        <section className="rounded-[24px] bg-wm-ink p-5 text-white"><div className="flex items-start gap-3"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-wm-orange" /><div><p className="text-sm font-black">Safety choices are visible.</p><p className="mt-1 text-xs leading-relaxed text-white/68">A real map should add moderation, privacy radius controls, secure permissions, and a screen-reader-friendly list alternative.</p></div></div></section>
      </aside>
    </div>
  )
}

function EmptyMapState() {
  return <div className="rounded-2xl border border-dashed border-wm-line p-8 text-center"><Search className="mx-auto h-6 w-6 text-wm-action" /><p className="mt-3 text-sm font-black text-wm-ink">No care zones match this filter.</p><p className="mt-1 text-xs leading-relaxed text-wm-muted">Try a wider radius or show more status types.</p></div>
}
