import Link from 'next/link'
import { AlertTriangle, HeartPulse, MapPin, ShieldCheck } from 'lucide-react'
import WhisMapLogo from '@/components/brand/WhisMapLogo'

const productLinks = [
  { href: '/map', label: 'Protected care map' },
  { href: '/lost-found', label: 'Lost & Found' },
  { href: '/care', label: 'My cats' },
]
const safetyLinks = [
  { href: '/add-sighting', label: 'Add a sighting' },
  { href: '/report-cruelty', label: 'Report a concern' },
  { href: '/about', label: 'Safety approach' },
]

export default function Footer() {
  return (
    <footer className="relative z-10 mt-12 border-t border-wm-line bg-white">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-9 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.35fr_0.7fr_0.7fr_1fr] lg:gap-10">
        <div><WhisMapLogo /><p className="mt-3 max-w-sm text-sm leading-relaxed text-wm-muted">A clearer, safer way to coordinate community cat care and keep private household records useful.</p><div className="mt-4 flex flex-wrap gap-2"><span className="wm-footer-chip"><ShieldCheck className="h-3.5 w-3.5" /> Approximate by default</span><span className="wm-footer-chip"><HeartPulse className="h-3.5 w-3.5" /> Care-first tools</span></div></div>
        <div><p className="wm-footer-heading">Product</p><div className="mt-3 grid gap-2">{productLinks.map((link) => <Link key={link.href} href={link.href} className="wm-footer-link">{link.label}</Link>)}</div></div>
        <div><p className="wm-footer-heading">Safety</p><div className="mt-3 grid gap-2">{safetyLinks.map((link) => <Link key={link.href} href={link.href} className="wm-footer-link">{link.label}</Link>)}</div></div>
        <div className="wm-footer-cta"><MapPin className="h-5 w-5 text-wm-action" /><p className="mt-3 text-sm font-black text-wm-ink">Start with an approximate area.</p><p className="mt-1 text-xs leading-relaxed text-wm-muted">Public location cards should never expose private homes, feeding schedules, or a cat’s exact hiding place.</p><Link href="/map" className="mt-4 inline-flex items-center gap-2 text-xs font-black text-wm-action hover:underline">Open map <MapPin className="h-3.5 w-3.5" /></Link></div>
      </div>
      <div className="border-t border-wm-line"><div className="mx-auto flex max-w-[1440px] flex-col gap-1 px-4 py-4 text-xs text-wm-muted sm:flex-row sm:items-center sm:justify-between sm:px-6"><span>© 2026 WhisMap prototype.</span><span className="inline-flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Prototype UI: moderation, accounts, and secure contact delivery require a backend.</span></div></div>
    </footer>
  )
}
