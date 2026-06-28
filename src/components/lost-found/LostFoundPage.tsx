'use client'

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties, type FormEvent, type ReactNode, type RefObject } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Copy,
  Eye,
  FilePlus2,
  Grid2X2,
  List,
  MapPin,
  Search,
  Send,
  ShieldCheck,
  Siren,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import {
  catColorLabels,
  sampleLostFoundReports,
  type CatColor,
  type LostFoundReport,
  type ReportType,
  type UrgencyLevel,
} from '@/lib/reports'
import { useLocalStorageState } from '@/hooks/use-local-storage-state'

type StatusFilter = 'active' | 'resolved' | 'all'
type UrgencyFilter = 'all' | UrgencyLevel
type ViewMode = 'cards' | 'map'
type SortMode = 'urgent' | 'newest' | 'oldest'

type FormState = {
  type: ReportType
  catName: string
  color: CatColor
  description: string
  location: string
  date: string
  urgency: UrgencyLevel
  contactName: string
  contactMethod: string
  photoDataUrl: string
  consent: boolean
}

const initialForm: FormState = {
  type: 'lost',
  catName: '',
  color: 'orange',
  description: '',
  location: '',
  date: new Date().toISOString().slice(0, 10),
  urgency: 'normal',
  contactName: '',
  contactMethod: '',
  photoDataUrl: '',
  consent: false,
}

const colorStyles: Record<CatColor, CSSProperties> = {
  orange: { backgroundColor: '#f97316' },
  black: { backgroundColor: '#252833' },
  white: { backgroundColor: '#fff', border: '1px solid #ded9d2' },
  gray: { backgroundColor: '#92919a' },
  brown: { backgroundColor: '#a86632' },
  tabby: { backgroundColor: '#c7772e' },
  calico: { background: 'linear-gradient(135deg, #ff8b50 0 33%, #fff 33% 66%, #252833 66%)' },
  tuxedo: { background: 'linear-gradient(135deg, #252833 0 52%, #fff 52%)', border: '1px solid #ded9d2' },
  other: { backgroundColor: '#73717a' },
}

function newId(prefix: string) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`)
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(parsed)
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read this image.'))
    reader.onload = () => {
      const image = new window.Image()
      image.onerror = () => reject(new Error('Could not prepare this image.'))
      image.onload = () => {
        const maxSide = 1400
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(image.width * scale))
        canvas.height = Math.max(1, Math.round(image.height * scale))
        const context = canvas.getContext('2d')
        if (!context) return reject(new Error('Could not prepare this image.'))
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/webp', 0.82))
      }
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'urgent' | 'lost' | 'found' | 'verified' | 'review' | 'neutral' | 'resolved' }) {
  const tones = {
    urgent: 'bg-wm-danger-soft text-wm-danger',
    lost: 'bg-wm-orange-wash text-wm-action',
    found: 'bg-wm-ink text-white',
    verified: 'bg-wm-ink/6 text-wm-ink',
    review: 'bg-[#f8f1cf] text-[#795d00]',
    neutral: 'bg-wm-ink/5 text-wm-muted',
    resolved: 'bg-[#e8f5ed] text-[#17613a]',
  }
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black ${tones[tone]}`}>{children}</span>
}

function Button({ children, variant = 'secondary', onClick, type = 'button', disabled = false }: { children: ReactNode; variant?: 'primary' | 'secondary' | 'ghost'; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean }) {
  const styles = {
    primary: 'bg-wm-action text-white hover:bg-wm-action-hover',
    secondary: 'border border-wm-line bg-white text-wm-ink hover:border-wm-action/35 hover:bg-wm-orange-wash',
    ghost: 'text-wm-muted hover:bg-wm-orange-wash hover:text-wm-ink',
  }
  return <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-wm-action/18 disabled:cursor-not-allowed disabled:opacity-45 ${styles[variant]}`}>{children}</button>
}

function useModalFocusTrap(
  dialogRef: RefObject<HTMLElement | null>,
  initialFocusRef: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    initialFocusRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dialogRef, initialFocusRef, onClose])
}

function LostFoundModal({ report, onClose, onMarkResolved, onNotice }: { report: LostFoundReport; onClose: () => void; onMarkResolved: () => void; onNotice: (message: string) => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const imageSrc = report.photoDataUrl || report.photoSrc

  useModalFocusTrap(dialogRef, closeButtonRef, onClose)

  const requestContact = () => {
    onNotice(`A safe contact request for ${report.contactName} is ready. A production backend should deliver it without exposing personal contact details.`)
  }
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/lost-found#${report.id}`)
      onNotice('Report link copied.')
    } catch {
      onNotice('Copy was unavailable in this browser.')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-wm-ink/78 p-3 backdrop-blur-sm" role="presentation" onMouseDown={onClose}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="report-dialog-title" className="flex max-h-[94dvh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-wm-line px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-2"><Badge tone={report.type === 'lost' ? 'lost' : 'found'}>{report.type === 'lost' ? 'Missing cat' : 'Found cat'}</Badge>{report.urgency === 'urgent' ? <Badge tone="urgent"><AlertTriangle className="h-3 w-3" /> Urgent</Badge> : null}{report.reviewStatus === 'verified' ? <Badge tone="verified"><ShieldCheck className="h-3 w-3" /> Verified details</Badge> : <Badge tone="review">Awaiting review</Badge>}</div>
          <button ref={closeButtonRef} type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl text-wm-muted hover:bg-wm-orange-wash hover:text-wm-ink" aria-label="Close report details"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid min-h-0 overflow-y-auto lg:grid-cols-[1.05fr_0.95fr] wm-scrollbar">
          <div className="relative flex min-h-[280px] items-center justify-center bg-[#f4f1ec] p-4 sm:min-h-[440px]">
            {imageSrc ? report.photoDataUrl ? <img src={imageSrc} alt={report.catName ? `${report.catName} report image` : 'Cat report image'} className="max-h-[58dvh] w-full object-contain" /> : <Image src={imageSrc} alt={report.catName ? `${report.catName} report image` : 'Cat report image'} width={1100} height={900} className="max-h-[58dvh] w-full object-contain" sizes="(max-width: 1024px) 100vw, 55vw" /> : <div className="grid h-52 w-52 place-items-center rounded-full border border-dashed border-wm-line bg-white text-wm-muted"><Eye className="h-8 w-8" /></div>}
          </div>
          <div className="p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-wm-muted">Last updated {formatDate(report.date)}</p>
            <h2 id="report-dialog-title" className="mt-2 text-3xl font-black tracking-[-0.06em] text-wm-ink">{report.catName || `${catColorLabels[report.color]} cat`}</h2>
            <p className="mt-3 text-sm leading-relaxed text-wm-muted">{report.description}</p>
            <div className="mt-5 grid gap-3 rounded-2xl border border-wm-line bg-wm-orange-wash p-4">
              <div className="flex items-start gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-wm-action" /><div><p className="text-xs font-black uppercase tracking-[0.12em] text-wm-muted">Approximate area</p><p className="mt-1 text-sm font-extrabold text-wm-ink">{report.location}</p><p className="mt-1 text-xs leading-relaxed text-wm-muted">Exact pin and private addresses are intentionally not shown on public reports.</p></div></div>
              <div className="flex items-center gap-2 border-t border-wm-action/12 pt-3"><span className="h-4 w-4 rounded-full" style={colorStyles[report.color]} /><span className="text-sm font-bold text-wm-ink">{catColorLabels[report.color]}</span></div>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2"><Button variant="primary" onClick={requestContact}><Send className="h-4 w-4" /> Safe contact request</Button><Button onClick={copyLink}><Copy className="h-4 w-4" /> Copy report link</Button>{report.status === 'active' ? <Button onClick={onMarkResolved}><Check className="h-4 w-4" /> Mark resolved</Button> : <span className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#e8f5ed] px-3.5 py-2 text-sm font-extrabold text-[#17613a]">Resolved</span>}<Link href="/add-sighting" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-wm-line bg-white px-3.5 py-2 text-sm font-extrabold text-wm-ink hover:border-wm-action/35 hover:bg-wm-orange-wash"><MapPin className="h-4 w-4" /> Add a sighting</Link></div>
            <p className="mt-4 text-xs leading-relaxed text-wm-muted">This prototype does not send requests or verify reports. Production use needs moderated, permission-based messages and an audited status workflow.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

function ReportForm({ initialType, onClose, onAdd, onNotice }: { initialType: ReportType; onClose: () => void; onAdd: (report: LostFoundReport) => void; onNotice: (message: string) => void }) {
  const [form, setForm] = useState<FormState>({ ...initialForm, type: initialType })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLFormElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useModalFocusTrap(dialogRef, closeButtonRef, onClose)

  const patch = (next: Partial<FormState>) => setForm((current) => ({ ...current, ...next }))
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (!form.description.trim() || form.description.trim().length < 20) nextErrors.description = 'Add at least 20 characters: appearance, behaviour, and a distinguishing detail.'
    if (!form.location.trim()) nextErrors.location = 'Add an approximate area or recognizable landmark.'
    if (!form.contactName.trim()) nextErrors.contactName = 'Add a name for the protected contact request.'
    if (!form.contactMethod.trim()) nextErrors.contactMethod = 'Add a private contact method for the moderator workflow.'
    if (!form.consent) nextErrors.consent = 'Confirm that the report uses an approximate area and factual information.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const report: LostFoundReport = {
      id: newId('lf'),
      type: form.type,
      catName: form.catName.trim() || undefined,
      color: form.color,
      description: form.description.trim(),
      location: form.location.trim(),
      date: form.date,
      urgency: form.urgency,
      contactName: form.contactName.trim(),
      contactMethod: form.contactMethod.trim(),
      photoDataUrl: form.photoDataUrl || undefined,
      status: 'active',
      reviewStatus: 'review',
      visibility: 'approximate',
      createdAt: 'Just now',
    }
    onAdd(report)
    onNotice('Report saved on this device and marked “awaiting review.” A real release needs a moderated backend before publishing.')
    onClose()
  }
  const photoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setErrors((current) => ({ ...current, photo: 'Choose an image file.' })); return }
    setProcessing(true)
    try { patch({ photoDataUrl: await compressImage(file) }); setErrors((current) => ({ ...current, photo: '' })) } catch (error) { setErrors((current) => ({ ...current, photo: error instanceof Error ? error.message : 'Could not process this image.' })) } finally { setProcessing(false) }
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-wm-ink/72 p-3 backdrop-blur-sm" role="presentation" onMouseDown={onClose}>
      <form ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="create-report-title" onSubmit={submit} onMouseDown={(event) => event.stopPropagation()} className="mx-auto my-4 w-full max-w-3xl rounded-[28px] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[28px] border-b border-wm-line bg-white px-4 py-3 sm:px-5"><div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-wm-muted">Protected report</p><h2 id="create-report-title" className="mt-0.5 text-lg font-black text-wm-ink">Create a Lost & Found report</h2></div><button ref={closeButtonRef} type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl text-wm-muted hover:bg-wm-orange-wash hover:text-wm-ink" aria-label="Close form"><X className="h-5 w-5" /></button></div>
        <div className="grid gap-5 p-4 sm:p-5">
          <div className="rounded-2xl border border-wm-action/18 bg-wm-orange-wash p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-wm-action" /><div><p className="text-sm font-black text-wm-ink">Public reports show approximate areas only.</p><p className="mt-1 text-xs leading-relaxed text-wm-muted">Do not include a home address, private access point, or a person’s identity in the description or uploaded photo.</p></div></div></div>
          <fieldset><legend className="text-sm font-black text-wm-ink">Report type</legend><div className="mt-2 grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => patch({ type: 'lost' })} className={`rounded-xl border p-3 text-left ${form.type === 'lost' ? 'border-wm-action bg-wm-orange-wash text-wm-action' : 'border-wm-line bg-white text-wm-muted'}`}><span className="block text-sm font-black">Missing cat</span><span className="mt-0.5 block text-xs font-bold opacity-80">Need help locating a cat.</span></button><button type="button" onClick={() => patch({ type: 'found' })} className={`rounded-xl border p-3 text-left ${form.type === 'found' ? 'border-wm-ink bg-wm-ink text-white' : 'border-wm-line bg-white text-wm-muted'}`}><span className="block text-sm font-black">Found cat</span><span className="mt-0.5 block text-xs font-bold opacity-80">Help identify an owner or caregiver.</span></button></div></fieldset>
          <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-black text-wm-ink">Cat name <span className="text-xs font-bold text-wm-muted">Optional</span><input value={form.catName} onChange={(event) => patch({ catName: event.target.value })} placeholder="Example: Mochi" className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink" /></label><label className="grid gap-1.5 text-sm font-black text-wm-ink">Date seen / last seen<input type="date" value={form.date} onChange={(event) => patch({ date: event.target.value })} className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink" /></label></div>
          <fieldset><legend className="text-sm font-black text-wm-ink">Color / coat</legend><div className="mt-2 flex flex-wrap gap-2">{(Object.keys(catColorLabels) as CatColor[]).map((color) => <button key={color} type="button" onClick={() => patch({ color })} className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black ${form.color === color ? 'border-wm-action bg-wm-orange-wash text-wm-action' : 'border-wm-line bg-white text-wm-muted hover:border-wm-action/30'}`}><span className="h-3 w-3 rounded-full" style={colorStyles[color]} />{catColorLabels[color]}</button>)}</div></fieldset>
          <label className="grid gap-1.5 text-sm font-black text-wm-ink">Description <span className="text-xs font-bold text-wm-muted">Required</span><textarea value={form.description} onChange={(event) => patch({ description: event.target.value })} maxLength={1000} placeholder="Include visible markings, collar, behaviour, and what happened. Keep addresses and private details out." className="min-h-28 rounded-xl border border-wm-line bg-white px-3 py-2.5 text-sm font-medium text-wm-ink" />{errors.description ? <span className="text-xs font-bold text-wm-danger">{errors.description}</span> : <span className="text-xs font-bold text-wm-muted">{form.description.length}/1000</span>}</label>
          <label className="grid gap-1.5 text-sm font-black text-wm-ink">Approximate area <span className="text-xs font-bold text-wm-muted">Required</span><input value={form.location} onChange={(event) => patch({ location: event.target.value })} placeholder="Example: North side of Riverside Garden" className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink" />{errors.location ? <span className="text-xs font-bold text-wm-danger">{errors.location}</span> : <span className="text-xs font-bold text-wm-muted">Use a landmark, area, or barangay—not a home address.</span>}</label>
          <fieldset><legend className="text-sm font-black text-wm-ink">Urgency</legend><div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={() => patch({ urgency: 'normal' })} className={`rounded-xl px-3.5 py-2 text-sm font-black ${form.urgency === 'normal' ? 'bg-wm-ink text-white' : 'border border-wm-line bg-white text-wm-muted'}`}>Normal</button><button type="button" onClick={() => patch({ urgency: 'urgent' })} className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-black ${form.urgency === 'urgent' ? 'bg-wm-danger text-white' : 'border border-wm-line bg-white text-wm-muted'}`}><AlertTriangle className="h-4 w-4" /> Urgent</button></div></fieldset>
          <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-black text-wm-ink">Contact name <span className="text-xs font-bold text-wm-muted">Private</span><input value={form.contactName} onChange={(event) => patch({ contactName: event.target.value })} placeholder="First name or rescue group" className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink" />{errors.contactName ? <span className="text-xs font-bold text-wm-danger">{errors.contactName}</span> : null}</label><label className="grid gap-1.5 text-sm font-black text-wm-ink">Contact method <span className="text-xs font-bold text-wm-muted">Private</span><input value={form.contactMethod} onChange={(event) => patch({ contactMethod: event.target.value })} placeholder="Email, phone, or channel" className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink" />{errors.contactMethod ? <span className="text-xs font-bold text-wm-danger">{errors.contactMethod}</span> : null}</label></div>
          <div><input ref={inputRef} type="file" accept="image/*" onChange={photoChange} className="sr-only" /><div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-wm-line bg-[#fcfbfa] p-4">{form.photoDataUrl ? <img src={form.photoDataUrl} alt="Report preview" className="h-20 w-20 rounded-xl object-cover" /> : <div className="grid h-20 w-20 place-items-center rounded-xl bg-wm-orange-wash text-wm-action"><Eye className="h-5 w-5" /></div>}<div className="min-w-0 flex-1"><p className="text-sm font-black text-wm-ink">Photo <span className="text-xs font-bold text-wm-muted">Optional</span></p><p className="mt-0.5 text-xs leading-relaxed text-wm-muted">Images are resized in this browser before they are stored.</p>{errors.photo ? <p className="mt-1 text-xs font-bold text-wm-danger">{errors.photo}</p> : null}</div><Button onClick={() => inputRef.current?.click()}>{processing ? 'Processing…' : 'Choose photo'}</Button>{form.photoDataUrl ? <Button variant="ghost" onClick={() => patch({ photoDataUrl: '' })}>Remove</Button> : null}</div></div>
          <label className="flex items-start gap-3 rounded-2xl border border-wm-line bg-[#fcfbfa] p-4"><input type="checkbox" checked={form.consent} onChange={(event) => patch({ consent: event.target.checked })} className="mt-0.5 h-4 w-4 rounded border-wm-line accent-wm-action" /><span><span className="block text-sm font-black text-wm-ink">I confirm this report is factual and uses an approximate area.</span><span className="mt-1 block text-xs leading-relaxed text-wm-muted">Public reports need moderation, safe messaging, and status review before they can be trusted.</span>{errors.consent ? <span className="mt-1 block text-xs font-bold text-wm-danger">{errors.consent}</span> : null}</span></label>
          <div className="flex flex-wrap justify-end gap-2 border-t border-wm-line pt-4"><Button onClick={onClose}>Cancel</Button><Button type="submit" variant="primary"><FilePlus2 className="h-4 w-4" /> Save protected report</Button></div>
        </div>
      </form>
    </div>
  )
}

function ReportCard({ report, onOpen, compact = false }: { report: LostFoundReport; onOpen: () => void; compact?: boolean }) {
  const imageSrc = report.photoDataUrl || report.photoSrc
  return (
    <article className={`group overflow-hidden rounded-[22px] border border-wm-line bg-white shadow-[0_10px_24px_rgba(35,39,48,0.04)] transition hover:-translate-y-0.5 hover:border-wm-action/28 hover:shadow-[0_14px_30px_rgba(35,39,48,0.09)] ${compact ? 'flex flex-col sm:flex-row' : ''}`}>
      <button type="button" onClick={onOpen} className={`relative block shrink-0 overflow-hidden bg-[#f5f1ed] text-left ${compact ? 'h-48 w-full sm:h-auto sm:w-48' : 'h-52 w-full'}`} aria-label={`Open ${report.catName || 'cat'} report`}>
        {imageSrc ? report.photoDataUrl ? <img src={imageSrc} alt={report.catName ? `${report.catName} report image` : 'Cat report image'} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /> : <Image src={imageSrc} alt={report.catName ? `${report.catName} report image` : 'Cat report image'} fill sizes="(max-width: 768px) 100vw, 420px" className="object-cover transition duration-300 group-hover:scale-[1.03]" /> : <div className="grid h-full w-full place-items-center text-wm-muted"><Eye className="h-7 w-7" /></div>}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5"><Badge tone={report.type === 'lost' ? 'lost' : 'found'}>{report.type === 'lost' ? 'Lost' : 'Found'}</Badge>{report.urgency === 'urgent' ? <Badge tone="urgent"><AlertTriangle className="h-3 w-3" /> Urgent</Badge> : null}</div>
      </button>
      <div className="flex min-w-0 flex-1 flex-col p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><h2 className="truncate text-lg font-black tracking-[-0.04em] text-wm-ink">{report.catName || `${catColorLabels[report.color]} cat`}</h2><p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-wm-muted"><MapPin className="h-3.5 w-3.5 text-wm-action" /> <span className="truncate">{report.location}</span></p></div>{report.status === 'resolved' ? <Badge tone="resolved">Resolved</Badge> : report.reviewStatus === 'verified' ? <Badge tone="verified"><ShieldCheck className="h-3 w-3" /> Verified</Badge> : <Badge tone="review">Review</Badge>}</div><p className="mt-3 line-clamp-2 text-sm leading-relaxed text-wm-muted">{report.description}</p><div className="mt-4 flex items-center justify-between gap-3 border-t border-wm-line pt-3"><span className="inline-flex items-center gap-2 text-xs font-bold text-wm-muted"><span className="h-3 w-3 rounded-full" style={colorStyles[report.color]} />{formatDate(report.date)}</span><button type="button" onClick={onOpen} className="inline-flex items-center gap-1 text-xs font-black text-wm-action hover:underline">Details <ChevronRight className="h-3.5 w-3.5" /></button></div></div>
    </article>
  )
}

function PrivacyMap({ reports, onOpen }: { reports: LostFoundReport[]; onOpen: (report: LostFoundReport) => void }) {
  return (
    <div className="wm-map-grid relative min-h-[500px] overflow-hidden rounded-[24px] border border-wm-line p-4 sm:p-6">
      <div className="absolute left-5 top-5 max-w-xs rounded-2xl border border-wm-line bg-white/94 p-4 shadow-sm backdrop-blur-sm"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-wm-action" /><p className="text-sm font-black text-wm-ink">Illustrative privacy map</p></div><p className="mt-1 text-xs leading-relaxed text-wm-muted">Markers represent approximate public areas only. A production map needs safe geocoding and restricted exact coordinates.</p></div>
      {reports.map((report, index) => {
        const x = 19 + ((index * 29) % 68)
        const y = 28 + ((index * 23) % 55)
        const urgent = report.urgency === 'urgent'
        return <button key={report.id} type="button" onClick={() => onOpen(report)} className="absolute grid h-10 w-10 place-items-center rounded-full border-4 border-white text-white shadow-lg transition hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-wm-action/25" style={{ left: `${x}%`, top: `${y}%`, backgroundColor: urgent ? '#a83f22' : report.type === 'lost' ? '#b84412' : '#252833' }} aria-label={`Open approximate location for ${report.catName || 'cat report'}`}><MapPin className="h-4 w-4" /></button>
      })}
      <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2 rounded-2xl border border-wm-line bg-white/94 p-3 text-xs font-bold text-wm-muted shadow-sm backdrop-blur-sm"><span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-wm-action" /> Missing</span><span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-wm-ink" /> Found</span><span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-wm-danger" /> Urgent</span></div>
    </div>
  )
}

export default function LostFoundPage() {
  const [reports, setReports, hydrated] = useLocalStorageState<LostFoundReport[]>('whismap-lost-found-v5', sampleLostFoundReports)
  const [type, setType] = useState<'all' | ReportType>('all')
  const [status, setStatus] = useState<StatusFilter>('active')
  const [urgency, setUrgency] = useState<UrgencyFilter>('all')
  const [sort, setSort] = useState<SortMode>('urgent')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [selected, setSelected] = useState<LostFoundReport | null>(null)
  const [createType, setCreateType] = useState<ReportType | null>(null)
  const [notice, setNotice] = useState('')

  const visibleReports = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    return reports
      .filter((report) => type === 'all' || report.type === type)
      .filter((report) => status === 'all' || report.status === status)
      .filter((report) => urgency === 'all' || report.urgency === urgency)
      .filter((report) => !normalized || [report.catName, report.description, report.location, catColorLabels[report.color]].filter(Boolean).join(' ').toLowerCase().includes(normalized))
      .sort((a, b) => {
        if (sort === 'urgent') {
          if (a.urgency !== b.urgency) return a.urgency === 'urgent' ? -1 : 1
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        }
        return sort === 'newest' ? new Date(b.date).getTime() - new Date(a.date).getTime() : new Date(a.date).getTime() - new Date(b.date).getTime()
      })
  }, [reports, search, sort, status, type, urgency])

  const updateReport = (id: string, update: Partial<LostFoundReport>) => {
    setReports((current) => current.map((report) => report.id === id ? { ...report, ...update } : report))
    setSelected((current) => current?.id === id ? { ...current, ...update } : current)
  }

  return (
    <div className="pb-10">
      <section className="px-4 pb-5 pt-6 sm:px-6 sm:pt-8">
        <div className="wm-page-intro mx-auto grid max-w-[1440px] gap-5 overflow-hidden px-5 py-6 sm:px-7 sm:py-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div><span className="wm-kicker">Lost & Found / safe public reporting</span><h1 className="mt-3 max-w-4xl text-[clamp(2.65rem,5.3vw,5.6rem)] font-black leading-[0.86] tracking-[-0.08em] text-wm-ink">Find the right next step, fast.</h1><p className="mt-4 max-w-2xl text-sm leading-relaxed text-wm-muted sm:text-base">Search active reports, add an approximate-area report, or record a sighting. Personal contact details and exact locations should stay protected.</p></div><div className="flex flex-wrap gap-2 lg:justify-end"><Button variant="primary" onClick={() => setCreateType('lost')}><FilePlus2 className="h-4 w-4" /> Report missing cat</Button><Button onClick={() => setCreateType('found')}><MapPin className="h-4 w-4" /> Report found cat</Button></div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 sm:px-6">
        {notice ? <div role="status" className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-wm-action/18 bg-wm-orange-wash px-4 py-3 text-sm font-bold text-wm-action"><span>{notice}</span><button type="button" onClick={() => setNotice('')} className="rounded-lg px-2 py-1 text-xs font-black hover:bg-white/70">Dismiss</button></div> : null}
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-4">
            <section className="rounded-[22px] border border-wm-line bg-white p-4 shadow-[0_10px_26px_rgba(35,39,48,0.05)]"><div className="flex flex-col gap-3 lg:flex-row lg:items-center"><label className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-wm-muted" /><span className="sr-only">Search reports</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, colour, area, or marking" className="min-h-11 w-full rounded-xl border border-wm-line bg-white pl-10 pr-3 text-sm font-bold text-wm-ink placeholder:text-wm-muted" /></label><div className="flex flex-wrap gap-2"><div className="inline-flex rounded-xl border border-wm-line bg-[#fcfbfa] p-1" aria-label="View mode"><button type="button" onClick={() => setViewMode('cards')} className={`grid h-9 w-9 place-items-center rounded-lg ${viewMode === 'cards' ? 'bg-wm-ink text-white' : 'text-wm-muted hover:bg-white'}`} aria-label="Card view"><Grid2X2 className="h-4 w-4" /></button><button type="button" onClick={() => setViewMode('map')} className={`grid h-9 w-9 place-items-center rounded-lg ${viewMode === 'map' ? 'bg-wm-ink text-white' : 'text-wm-muted hover:bg-white'}`} aria-label="Map view"><MapPin className="h-4 w-4" /></button></div><select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink"><option value="urgent">Urgent first</option><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></div></div><div className="mt-3 flex flex-wrap gap-2"><span className="inline-flex items-center gap-1.5 px-1 text-xs font-black text-wm-muted"><SlidersHorizontal className="h-3.5 w-3.5" /> Filters</span>{(['all', 'lost', 'found'] as const).map((value) => <button key={value} type="button" onClick={() => setType(value)} className={`rounded-full px-3 py-1.5 text-xs font-black ${type === value ? 'bg-wm-action text-white' : 'bg-wm-ink/5 text-wm-muted hover:bg-wm-orange-wash'}`}>{value === 'all' ? 'All reports' : value === 'lost' ? 'Missing' : 'Found'}</button>)}{(['active', 'resolved', 'all'] as const).map((value) => <button key={value} type="button" onClick={() => setStatus(value)} className={`rounded-full px-3 py-1.5 text-xs font-black ${status === value ? 'bg-wm-ink text-white' : 'bg-wm-ink/5 text-wm-muted hover:bg-wm-orange-wash'}`}>{value === 'all' ? 'Any status' : value === 'active' ? 'Active' : 'Resolved'}</button>)}<button type="button" onClick={() => setUrgency((current) => current === 'urgent' ? 'all' : 'urgent')} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${urgency === 'urgent' ? 'bg-wm-danger text-white' : 'bg-wm-danger-soft text-wm-danger hover:bg-wm-danger hover:text-white'}`}><AlertTriangle className="h-3.5 w-3.5" /> Urgent only</button></div></section>

            <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-bold text-wm-muted">{visibleReports.length} report{visibleReports.length === 1 ? '' : 's'} shown {hydrated ? 'from this device' : ''}</p><p className="text-xs font-bold text-wm-muted">Public areas are deliberately approximate.</p></div>

            {viewMode === 'cards' ? visibleReports.length ? <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{visibleReports.map((report) => <ReportCard key={report.id} report={report} onOpen={() => setSelected(report)} />)}</div> : <EmptyState onCreate={() => setCreateType('lost')} /> : <PrivacyMap reports={visibleReports} onOpen={setSelected} />}
          </div>

          <aside className="grid gap-4 xl:sticky xl:top-24 xl:self-start">
            <section className="rounded-[22px] bg-wm-ink p-5 text-white"><div className="flex items-center gap-2"><Siren className="h-5 w-5 text-wm-orange" /><p className="text-sm font-black">Missing-cat emergency basics</p></div><ol className="mt-4 grid gap-3">{['Check safe indoor hiding places first.', 'Use a clear recent photo and factual details.', 'Ask neighbours not to chase a scared cat.', 'Report the approximate area, not a home address.'].map((step, index) => <li key={step} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-black text-wm-orange">{index + 1}</span><span className="text-xs leading-relaxed text-white/72">{step}</span></li>)}</ol><Link href="/care" className="mt-5 inline-flex items-center gap-2 text-xs font-black text-wm-orange hover:underline">Open full emergency toolkit <ChevronRight className="h-3.5 w-3.5" /></Link></section>
            <section className="rounded-[22px] border border-wm-line bg-white p-5"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-wm-action" /><div><p className="text-sm font-black text-wm-ink">Avoid scams and oversharing.</p><p className="mt-1 text-xs leading-relaxed text-wm-muted">Do not send money or disclose a private address before independently verifying a match. A production contact flow should keep phone numbers and emails private.</p></div></div></section>
          </aside>
        </div>
      </section>

      {selected ? <LostFoundModal report={selected} onClose={() => setSelected(null)} onMarkResolved={() => { updateReport(selected.id, { status: 'resolved' }); setNotice('Report marked resolved on this device.') }} onNotice={setNotice} /> : null}
      {createType ? <ReportForm initialType={createType} onClose={() => setCreateType(null)} onAdd={(report) => setReports((current) => [report, ...current])} onNotice={setNotice} /> : null}
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return <div className="rounded-[24px] border border-dashed border-wm-line bg-white p-10 text-center"><Search className="mx-auto h-7 w-7 text-wm-action" /><h2 className="mt-3 text-xl font-black text-wm-ink">No reports match these filters.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-wm-muted">Clear a filter, try a broader search term, or create a protected report with only factual details.</p><div className="mt-5"><Button variant="primary" onClick={onCreate}><FilePlus2 className="h-4 w-4" /> Create report</Button></div></div>
}
