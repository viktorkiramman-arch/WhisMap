'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AlertTriangle, MapPin, Menu, Plus, X } from 'lucide-react'
import WhisMapLogo from '@/components/brand/WhisMapLogo'

const links = [
  { href: '/map', label: 'Find cats' },
  { href: '/lost-found', label: 'Lost & Found' },
  { href: '/care', label: 'My cats' },
  { href: '/about', label: 'Approach' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', open)
    return () => document.body.classList.remove('overflow-hidden')
  }, [open])


  return (
    <header className="sticky top-0 z-50 px-4 pt-3 sm:px-6">
      <nav className="wm-nav-shell mx-auto flex min-h-[66px] max-w-[1440px] items-center justify-between gap-3 px-3.5 sm:px-5" aria-label="Main navigation">
        <Link href="/" className="shrink-0" aria-label="WhisMap home"><WhisMapLogo /></Link>
        <div className="hidden min-w-0 items-center justify-center gap-0.5 lg:flex" aria-label="Primary links">
          {links.map((link) => {
            const active = pathname.startsWith(link.href)
            return <Link key={link.href} href={link.href} className={`wm-nav-link ${active ? 'wm-nav-link-active' : ''}`}>{link.label}</Link>
          })}
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/report-cruelty" className="wm-nav-alert"><AlertTriangle className="h-3.5 w-3.5" /> Report concern</Link>
          <Link href="/add-sighting" className="wm-nav-action"><Plus className="h-3.5 w-3.5" /> Add sighting</Link>
        </div>
        <button type="button" onClick={() => setOpen((current) => !current)} className="grid h-10 w-10 place-items-center rounded-xl border border-wm-line bg-white text-wm-ink lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </nav>
      {open ? <div className="wm-mobile-menu mx-auto mt-2 max-w-[1440px] p-2 lg:hidden"><div className="grid gap-1">{links.map((link) => { const active = pathname.startsWith(link.href); return <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={`flex min-h-11 items-center rounded-xl px-3.5 text-sm font-extrabold ${active ? 'bg-wm-action text-white' : 'text-wm-ink hover:bg-wm-orange-wash'}`}>{link.label}</Link> })}</div><div className="mt-2 grid gap-2 border-t border-wm-line pt-2"><Link href="/add-sighting" onClick={() => setOpen(false)} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-wm-action px-3.5 text-sm font-extrabold text-white"><MapPin className="h-4 w-4" /> Add a sighting</Link><Link href="/report-cruelty" onClick={() => setOpen(false)} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-wm-danger/20 bg-wm-danger-soft px-3.5 text-sm font-extrabold text-wm-danger"><AlertTriangle className="h-4 w-4" /> Report a concern</Link></div></div> : null}
    </header>
  )
}
