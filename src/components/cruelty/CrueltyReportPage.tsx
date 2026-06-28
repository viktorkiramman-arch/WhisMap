'use client'

import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  EyeOff,
  FileWarning,
  MapPin,
  ShieldCheck,
  Siren,
  X,
} from 'lucide-react'
import { useLocalStorageState } from '@/hooks/use-local-storage-state'
import { crueltyCategoryLabels, type CrueltyCategory, type CrueltyReport } from '@/lib/reports'

type ReportDraft = {
  category: CrueltyCategory | ''
  severity: CrueltyReport['severity']
  description: string
  approximateLocation: string
  dateObserved: string
  photoDataUrl: string
  contactMethod: string
  consent: boolean
}

const emptyDraft: ReportDraft = {
  category: '',
  severity: 'medium',
  description: '',
  approximateLocation: '',
  dateObserved: new Date().toISOString().slice(0, 10),
  photoDataUrl: '',
  contactMethod: '',
  consent: false,
}

function Button({ children, variant = 'secondary', type = 'button', onClick, disabled = false }: { children: ReactNode; variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; type?: 'button' | 'submit'; onClick?: () => void; disabled?: boolean }) {
  const style = {
    primary: 'bg-wm-action text-white hover:bg-wm-action-hover',
    secondary: 'border border-wm-line bg-white text-wm-ink hover:border-wm-action/35 hover:bg-wm-orange-wash',
    danger: 'bg-wm-danger text-white hover:brightness-95',
    ghost: 'text-wm-muted hover:bg-wm-orange-wash hover:text-wm-ink',
  }
  return <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-wm-action/18 disabled:cursor-not-allowed disabled:opacity-50 ${style[variant]}`}>{children}</button>
}

function compressImage(file: File) {
  return new Promise<string>((resolve, reject) => {
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

export default function CrueltyReportPage() {
  const [draft, setDraft, hydrated] = useLocalStorageState<ReportDraft>('whismap-concern-draft-v5', emptyDraft)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState('')
  const [processing, setProcessing] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const patch = (next: Partial<ReportDraft>) => {
    setDraft((current) => ({ ...current, ...next }))
    Object.keys(next).forEach((key) => {
      if (errors[key]) setErrors((current) => ({ ...current, [key]: '' }))
    })
  }

  const photoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors((current) => ({ ...current, photo: 'Choose an image file.' }))
      return
    }
    setProcessing(true)
    try {
      patch({ photoDataUrl: await compressImage(file) })
      setNotice('Photo prepared and kept in this browser draft.')
    } catch (error) {
      setErrors((current) => ({ ...current, photo: error instanceof Error ? error.message : 'Could not prepare this image.' }))
    } finally {
      setProcessing(false)
    }
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!draft.category) next.category = 'Choose the type of concern.'
    if (draft.description.trim().length < 20) next.description = 'Add at least 20 characters describing what you observed.'
    if (draft.approximateLocation.trim().length < 3) next.approximateLocation = 'Use a broad public area or landmark, not a private address.'
    if (!draft.consent) next.consent = 'Confirm that this is a factual, approximate-area record.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validate()) return
    setNotice('Prepared report saved on this device only. This frontend does not notify authorities, moderators, or emergency services.')
  }

  return (
    <div className="pb-10">
      <section className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="grid gap-4 rounded-[28px] border border-wm-danger/20 bg-wm-danger-soft p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
          <div className="flex items-start gap-3"><Siren className="mt-0.5 h-5 w-5 shrink-0 text-wm-danger" /><div><p className="text-sm font-black text-wm-ink">For immediate danger, contact local emergency or veterinary services first.</p><p className="mt-1 max-w-3xl text-xs leading-relaxed text-wm-muted">This is a frontend prototype. It does not dispatch help, contact authorities, send messages, or monitor incoming reports.</p></div></div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black text-wm-danger"><AlertTriangle className="h-3.5 w-3.5" /> Not an emergency service</span>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-4 px-4 pt-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form onSubmit={submit} noValidate className="rounded-[28px] border border-wm-line bg-white shadow-[0_12px_30px_rgba(35,39,48,0.06)]">
          <div className="border-b border-wm-line px-5 py-5 sm:px-6"><span className="wm-kicker">Protected concern record / local draft</span><h1 className="mt-3 text-[clamp(2.15rem,4vw,4.2rem)] font-black leading-[0.9] tracking-[-0.075em] text-wm-ink">Document a concern without oversharing.</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-wm-muted">Keep the location broad, write only what you observed, and avoid publishing personal names, private addresses, or identifying details about people.</p></div>
          <div className="grid gap-5 p-5 sm:p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-black text-wm-ink">Concern type<select value={draft.category} onChange={(event) => patch({ category: event.target.value as CrueltyCategory })} className="min-h-11 px-3 text-sm font-bold"><option value="">Choose a category</option>{(Object.keys(crueltyCategoryLabels) as CrueltyCategory[]).map((category) => <option key={category} value={category}>{crueltyCategoryLabels[category]}</option>)}</select>{errors.category ? <span className="text-xs font-bold text-wm-danger">{errors.category}</span> : null}</label>
              <label className="grid gap-1.5 text-sm font-black text-wm-ink">Approximate area<input value={draft.approximateLocation} onChange={(event) => patch({ approximateLocation: event.target.value })} placeholder="Public landmark or broad area" className="min-h-11 px-3 text-sm font-bold" />{errors.approximateLocation ? <span className="text-xs font-bold text-wm-danger">{errors.approximateLocation}</span> : <span className="text-xs font-bold text-wm-muted">Do not add a private home address.</span>}</label>
            </div>

            <fieldset><legend className="text-sm font-black text-wm-ink">Severity</legend><p className="mt-1 text-xs leading-relaxed text-wm-muted">Severity organizes your local notes. It does not trigger an alert in this prototype.</p><div className="mt-3 flex flex-wrap gap-2">{(['low', 'medium', 'high', 'critical'] as const).map((severity) => <button key={severity} type="button" onClick={() => patch({ severity })} aria-pressed={draft.severity === severity} className={`rounded-xl px-3.5 py-2 text-sm font-black ${draft.severity === severity ? severity === 'critical' ? 'bg-wm-danger text-white' : 'bg-wm-ink text-white' : 'border border-wm-line bg-white text-wm-muted hover:border-wm-action/35 hover:bg-wm-orange-wash'}`}>{severity === 'critical' ? 'Critical — use emergency help' : severity[0].toUpperCase() + severity.slice(1)}</button>)}</div></fieldset>

            <label className="grid gap-1.5 text-sm font-black text-wm-ink">What did you observe?<textarea value={draft.description} onChange={(event) => patch({ description: event.target.value })} rows={6} placeholder="Describe observable facts: condition of the cat, timing, surroundings, and why you are concerned. Do not identify people unless required by the official reporting route you use." className="min-h-[152px] resize-y px-3 py-3 text-sm font-bold" />{errors.description ? <span className="text-xs font-bold text-wm-danger">{errors.description}</span> : <span className="text-xs font-bold text-wm-muted">Observation record only; this interface does not make a diagnosis or investigate a person.</span>}</label>

            <div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-black text-wm-ink">Date observed<input type="date" value={draft.dateObserved} onChange={(event) => patch({ dateObserved: event.target.value })} className="min-h-11 px-3 text-sm font-bold" /></label><label className="grid gap-1.5 text-sm font-black text-wm-ink">Private contact note <span className="text-xs font-bold text-wm-muted">Optional, local only</span><input value={draft.contactMethod} onChange={(event) => patch({ contactMethod: event.target.value })} placeholder="Your preferred follow-up method" className="min-h-11 px-3 text-sm font-bold" /></label></div>

            <input ref={photoInputRef} type="file" accept="image/*" onChange={photoChange} className="sr-only" />
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-wm-line bg-[#fcfbfa] p-4">
              {draft.photoDataUrl ? <img src={draft.photoDataUrl} alt="Concern record preview" className="h-20 w-20 rounded-xl object-cover" /> : <span className="grid h-20 w-20 place-items-center rounded-xl bg-wm-orange-wash text-wm-action"><Camera className="h-5 w-5" /></span>}
              <div className="min-w-0 flex-1"><p className="text-sm font-black text-wm-ink">Optional photo</p><p className="mt-1 text-xs leading-relaxed text-wm-muted">Images are resized in this browser and stay in this local draft. Do not upload images containing people or private identifiers unless you have a lawful official reporting path.</p>{errors.photo ? <p className="mt-1 text-xs font-bold text-wm-danger">{errors.photo}</p> : null}</div>
              <Button onClick={() => photoInputRef.current?.click()}>{processing ? 'Preparing…' : 'Choose photo'}</Button>{draft.photoDataUrl ? <Button variant="ghost" onClick={() => patch({ photoDataUrl: '' })}>Remove</Button> : null}
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-wm-line bg-[#fcfbfa] p-4"><input type="checkbox" checked={draft.consent} onChange={(event) => patch({ consent: event.target.checked })} className="mt-0.5 h-4 w-4 rounded border-wm-line accent-wm-action" /><span><span className="block text-sm font-black text-wm-ink">I am recording factual observations and an approximate area.</span><span className="mt-1 block text-xs leading-relaxed text-wm-muted">I understand this local prototype does not submit, send, review, or escalate this report.</span>{errors.consent ? <span className="mt-1 block text-xs font-bold text-wm-danger">{errors.consent}</span> : null}</span></label>

            <div className="flex flex-wrap justify-end gap-2 border-t border-wm-line pt-4"><Button onClick={() => { setDraft(emptyDraft); setErrors({}); setNotice('Local concern draft cleared.') }}>Clear local draft</Button><Button type="submit" variant="primary"><FileWarning className="h-4 w-4" /> Save prepared record</Button></div>
          </div>
        </form>

        <aside className="grid content-start gap-4">
          {notice ? <div role="status" className="flex items-start gap-3 rounded-2xl border border-wm-sage/20 bg-wm-sage-soft p-4"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-wm-sage" /><p className="text-sm leading-relaxed text-wm-ink">{notice}</p><button type="button" onClick={() => setNotice('')} className="ml-auto text-wm-muted hover:text-wm-ink" aria-label="Dismiss notice"><X className="h-4 w-4" /></button></div> : null}
          <section className="rounded-[24px] bg-wm-ink p-5 text-white"><ShieldCheck className="h-5 w-5 text-wm-orange" /><p className="mt-4 text-sm font-black">Keep public and private information separate.</p><ul className="mt-3 grid gap-2 text-xs leading-relaxed text-white/70"><li className="flex gap-2"><EyeOff className="mt-0.5 h-3.5 w-3.5 shrink-0 text-wm-orange" />Use an approximate area in public views.</li><li className="flex gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-wm-orange" />Do not expose homes, hiding places, or feeding routes.</li><li className="flex gap-2"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-wm-orange" />Do not rely on an app instead of immediate emergency help.</li></ul></section>
          <section className="rounded-[24px] border border-wm-line bg-white p-5"><p className="text-sm font-black text-wm-ink">Production requirements</p><p className="mt-2 text-xs leading-relaxed text-wm-muted">A real reporting system needs authenticated roles, consent records, encrypted storage, moderation queues, secure escalation routes, retention limits, and local legal guidance.</p></section>
          {!hydrated ? <div className="rounded-2xl border border-wm-line bg-white p-4 text-xs font-bold text-wm-muted">Loading your local draft…</div> : null}
        </aside>
      </section>
    </div>
  )
}
