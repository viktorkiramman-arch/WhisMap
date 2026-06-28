import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, HeartPulse, MapPin, ShieldCheck, Siren } from 'lucide-react'

export default function Hero() {
  return (
    <section className="px-4 pb-8 pt-4 sm:px-6 sm:pb-12">
      <div className="wm-home-stage mx-auto max-w-[1440px] overflow-hidden">
        <div className="grid min-h-[650px] grid-cols-1 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="relative min-h-[380px] overflow-hidden bg-[#eee9e2] lg:min-h-0">
            <Image
              src="/cats/mochi-orange-tabby.png"
              alt="An orange tabby cat looking upward"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 51vw"
              className="object-cover object-[52%_46%] saturate-[0.92]"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-wm-orange/28 via-transparent to-wm-ink/18" />
            <div className="absolute left-5 top-5 rounded-full border border-white/60 bg-white/84 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-wm-ink shadow-sm backdrop-blur-sm sm:left-7 sm:top-7">
              WhisMap / community care
            </div>
            <div className="absolute bottom-5 left-5 right-5 grid gap-2 sm:bottom-7 sm:left-7 sm:right-7 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/55 bg-white/84 p-3.5 shadow-sm backdrop-blur-md"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-wm-muted">Public reporting</p><p className="mt-1 text-sm font-black text-wm-ink">Approximate areas by default</p></div>
              <div className="rounded-2xl border border-white/55 bg-white/84 p-3.5 shadow-sm backdrop-blur-md"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-wm-muted">Private care</p><p className="mt-1 text-sm font-black text-wm-ink">Stored on this device</p></div>
            </div>
          </div>

          <div className="relative flex min-h-[460px] flex-col justify-between overflow-hidden bg-wm-ink px-6 py-7 text-white sm:px-9 sm:py-9 lg:min-h-0 lg:px-12 lg:py-12">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[28px] border-wm-orange/95" />
            <div className="absolute bottom-[-8rem] right-16 h-56 w-56 rounded-full border border-white/14" />
            <div className="relative"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/58">Cat care, clearly connected</p><h1 className="mt-5 max-w-xl text-[clamp(3.4rem,6.2vw,6.3rem)] font-black leading-[0.86] tracking-[-0.085em] text-white">Find, protect, and coordinate cat care.</h1><p className="mt-6 max-w-md text-sm leading-relaxed text-white/72 sm:text-base">WhisMap brings together a protected community map, safer lost-cat reporting, and private tools for everyday care.</p></div>
            <div className="relative mt-8"><div className="flex flex-wrap gap-2.5"><Link href="/map" className="wm-hero-primary">Find care zones <ArrowUpRight className="h-4 w-4" /></Link><Link href="/lost-found" className="wm-hero-secondary">Lost & Found</Link><Link href="/care" className="wm-hero-secondary">My cats</Link></div><div className="mt-5 grid gap-2 text-xs font-bold text-white/72 sm:grid-cols-3"><span className="inline-flex items-start gap-1.5"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-wm-orange" /> Approximate locations</span><span className="inline-flex items-start gap-1.5"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-wm-orange" /> Private handoffs</span><span className="inline-flex items-start gap-1.5"><HeartPulse className="mt-0.5 h-3.5 w-3.5 shrink-0 text-wm-orange" /> Care history</span></div></div>
          </div>
        </div>
        <div className="grid border-t border-white/15 bg-wm-ink px-5 py-4 text-white sm:grid-cols-3 sm:px-9 lg:px-12"><Link href="/map" className="group flex items-center gap-3 border-b border-white/12 py-3 sm:border-b-0 sm:border-r sm:py-0"><span className="grid h-8 w-8 place-items-center rounded-full bg-wm-orange text-sm font-black text-wm-ink">01</span><span className="min-w-0"><span className="block text-xs font-black">Find care zones</span><span className="mt-0.5 block text-[11px] text-white/62">Browse public activity safely.</span></span><ArrowUpRight className="ml-auto h-4 w-4 text-white/48 transition group-hover:text-wm-orange" /></Link><Link href="/lost-found" className="group flex items-center gap-3 border-b border-white/12 py-3 sm:border-b-0 sm:border-r sm:px-7 sm:py-0"><span className="grid h-8 w-8 place-items-center rounded-full bg-wm-orange text-sm font-black text-wm-ink">02</span><span className="min-w-0"><span className="block text-xs font-black">Report a cat</span><span className="mt-0.5 block text-[11px] text-white/62">Use a calmer emergency flow.</span></span><Siren className="ml-auto h-4 w-4 text-white/48 transition group-hover:text-wm-orange" /></Link><Link href="/care" className="group flex items-center gap-3 pt-3 sm:px-7 sm:pt-0"><span className="grid h-8 w-8 place-items-center rounded-full bg-wm-orange text-sm font-black text-wm-ink">03</span><span className="min-w-0"><span className="block text-xs font-black">Manage my cats</span><span className="mt-0.5 block text-[11px] text-white/62">Keep records useful and private.</span></span><HeartPulse className="ml-auto h-4 w-4 text-white/48 transition group-hover:text-wm-orange" /></Link></div>
      </div>
    </section>
  )
}
