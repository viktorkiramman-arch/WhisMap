'use client'

import { useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode, type RefObject } from 'react'
import { AlertTriangle, Camera, Check, ChevronLeft, ChevronRight, MapPin, ShieldCheck, Upload } from 'lucide-react'
import { useLocalStorageState } from '@/hooks/use-local-storage-state'

type SightingDraft = {
  area: string
  catCount: string
  urgency: 'Normal' | 'Needs feeding' | 'Injury or illness' | 'Kittens present' | 'Location danger'
  notes: string
  photoDataUrl: string
  consent: boolean
}

type SavedSighting = SightingDraft & {
  id: string
  createdAt: string
}

const initialDraft: SightingDraft = { area: '', catCount: '', urgency: 'Normal', notes: '', photoDataUrl: '', consent: false }
const labels = ['Area', 'Details', 'Photo', 'Review'] as const

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return `${prefix}-${crypto.randomUUID()}`
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read this image.'))
    reader.onload = () => {
      const image = new window.Image()
      image.onerror = () => reject(new Error('Could not prepare this image.'))
      image.onload = () => {
        const scale = Math.min(1, 1400 / Math.max(image.width, image.height))
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

function Button({ children, variant = 'secondary', onClick, type = 'button', disabled = false }: { children: ReactNode; variant?: 'primary' | 'secondary'; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean }) {
  return <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-wm-action/18 disabled:cursor-not-allowed disabled:opacity-45 ${variant === 'primary' ? 'bg-wm-action text-white hover:bg-wm-action-hover' : 'border border-wm-line bg-white text-wm-ink hover:border-wm-action/35 hover:bg-wm-orange-wash'}`}>{children}</button>
}

export default function AddSightingForm() {
  const [draft, setDraft, hydrated] = useLocalStorageState<SightingDraft>('whismap-sighting-draft-v5', initialDraft)
  const [savedSightings, setSavedSightings] = useLocalStorageState<SavedSighting[]>('whismap-sighting-history-v5', [])
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const uploadRef = useRef<HTMLInputElement>(null)

  const completion = useMemo(() => [Boolean(draft.area.trim()), Boolean(draft.catCount), true, draft.consent], [draft])
  const patch = (next: Partial<SightingDraft>) => setDraft((current) => ({ ...current, ...next }))
  const canContinue = () => completion[step] ?? false

  const next = () => {
    if (!canContinue()) {
      setError(step === 0 ? 'Add an approximate area before continuing.' : step === 1 ? 'Add the estimated cat count before continuing.' : 'Confirm the safety statement before submitting.')
      return
    }
    setError('')
    setStep((current) => Math.min(current + 1, labels.length - 1))
  }

  const handlePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Choose a JPG, PNG, WebP, or another image file.'); return }
    setUploading(true)
    setError('')
    try { patch({ photoDataUrl: await compressImage(file) }) } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not prepare this image.') } finally { setUploading(false) }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!draft.consent) { setError('Confirm the safety statement before submitting.'); return }
    setSavedSightings((current) => [{ ...draft, id: createId('sighting'), createdAt: new Date().toISOString() }, ...current])
    setSubmitted(true)
    setDraft(initialDraft)
  }

  if (submitted) {
    return <section className="rounded-[28px] border border-wm-sage/22 bg-wm-sage-soft p-6 sm:p-8"><div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-wm-sage"><Check className="h-5 w-5" /></span><div><span className="text-[10px] font-black uppercase tracking-[0.14em] text-wm-sage">Local record saved</span><h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-wm-ink">Sighting saved on this device.</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-wm-muted">This frontend prototype does not notify helpers, publish a report, or send a moderation request. A real release needs a secure moderated queue, location protection, and private contact handling.</p><div className="mt-5"><Button variant="primary" onClick={() => { setSubmitted(false); setStep(0) }}>Create another sighting</Button></div></div></div></section>
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-24 lg:self-start"><section className="rounded-[24px] border border-wm-line bg-white p-4 shadow-[0_10px_24px_rgba(35,39,48,0.05)]"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-wm-muted">Protected three-minute flow</p><h2 className="mt-1 text-xl font-black tracking-[-0.045em] text-wm-ink">Add a sighting</h2><ol className="mt-5 grid gap-2">{labels.map((label, index) => <li key={label} className="flex items-center gap-3"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-black ${index === step ? 'border-wm-action bg-wm-action text-white' : index < step ? 'border-wm-action/25 bg-wm-orange-wash text-wm-action' : 'border-wm-line text-wm-muted'}`}>{index < step ? <Check className="h-4 w-4" /> : index + 1}</span><span className={`text-sm font-extrabold ${index === step ? 'text-wm-ink' : 'text-wm-muted'}`}>{label}</span></li>)}</ol><div className="mt-5 rounded-2xl bg-wm-orange-wash p-3"><div className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-wm-action" /><p className="text-xs leading-relaxed text-wm-muted">Your unfinished draft is stored in this browser while you complete it.</p></div></div><p className="mt-3 text-xs text-wm-muted">{hydrated ? 'Draft storage is ready.' : 'Loading saved draft…'}</p><div className="mt-4 rounded-2xl border border-wm-line bg-[#fcfbfa] p-3"><p className="text-xs font-black text-wm-ink">Local records</p><p className="mt-1 text-xs leading-relaxed text-wm-muted">{savedSightings.length} prepared sighting{savedSightings.length === 1 ? '' : 's'} saved in this browser. They are not public or sent anywhere.</p></div></section></aside>
      <form onSubmit={submit} className="rounded-[28px] border border-wm-line bg-white p-5 shadow-[0_10px_24px_rgba(35,39,48,0.05)] sm:p-6">
        {error ? <div role="alert" className="mb-4 rounded-xl border border-wm-danger/22 bg-wm-danger-soft px-3.5 py-3 text-sm font-bold text-wm-danger">{error}</div> : null}
        {step === 0 ? <LocationStep area={draft.area} onChange={(area) => patch({ area })} /> : null}
        {step === 1 ? <DetailsStep count={draft.catCount} urgency={draft.urgency} notes={draft.notes} onChange={patch} /> : null}
        {step === 2 ? <PhotoStep photo={draft.photoDataUrl} uploadRef={uploadRef} uploading={uploading} onPhoto={handlePhoto} onRemove={() => patch({ photoDataUrl: '' })} /> : null}
        {step === 3 ? <ReviewStep draft={draft} onConsent={(consent) => patch({ consent })} /> : null}
        <div className="mt-7 flex flex-wrap justify-between gap-2 border-t border-wm-line pt-4">{step > 0 ? <Button onClick={() => { setError(''); setStep((current) => current - 1) }}><ChevronLeft className="h-4 w-4" /> Back</Button> : <span />}{step < labels.length - 1 ? <Button variant="primary" onClick={next}>Continue <ChevronRight className="h-4 w-4" /></Button> : <Button type="submit" variant="primary"><Check className="h-4 w-4" /> Save protected record</Button>}</div>
      </form>
    </div>
  )
}

function LocationStep({ area, onChange }: { area: string; onChange: (value: string) => void }) {
  return <section><span className="wm-kicker">Step 1 / approximate area</span><h2 className="mt-2 text-3xl font-black tracking-[-0.06em] text-wm-ink">Where did you see the cat or colony?</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-wm-muted">Use a broad landmark, street section, or neighbourhood. Exact feeding areas, private homes, and hiding places should not be public.</p><div className="wm-map-grid relative mt-5 min-h-[230px] overflow-hidden rounded-[22px] border border-wm-line"><div className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-dashed border-wm-action bg-wm-orange/15"><MapPin className="h-5 w-5 text-wm-action" /></div><div className="absolute bottom-4 left-4 max-w-xs rounded-xl border border-wm-line bg-white/92 p-3 text-xs font-bold text-wm-muted shadow-sm backdrop-blur-sm">Illustrative privacy radius. Your final report would show a generalized area, not this exact point.</div></div><label className="mt-5 grid gap-1.5 text-sm font-black text-wm-ink">Approximate area<input value={area} onChange={(event) => onChange(event.target.value)} placeholder="Example: North side of Riverside Garden" className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink" /></label><p className="mt-2 text-xs leading-relaxed text-wm-muted">Good: “near the east park entrance.” Avoid: “behind my house at 12 Example Street.”</p></section>
}

function DetailsStep({ count, urgency, notes, onChange }: { count: string; urgency: SightingDraft['urgency']; notes: string; onChange: (patch: Partial<SightingDraft>) => void }) {
  const options: SightingDraft['urgency'][] = ['Normal', 'Needs feeding', 'Injury or illness', 'Kittens present', 'Location danger']
  return <section><span className="wm-kicker">Step 2 / useful facts</span><h2 className="mt-2 text-3xl font-black tracking-[-0.06em] text-wm-ink">What should helpers know?</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-wm-muted">Keep the report factual. Describe what you observed, not assumptions about a person or a cat’s medical condition.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-black text-wm-ink">Estimated cat count<input type="number" min="1" max="99" value={count} onChange={(event) => onChange({ catCount: event.target.value })} placeholder="1" className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink" /></label><label className="grid gap-1.5 text-sm font-black text-wm-ink">Care signal<select value={urgency} onChange={(event) => onChange({ urgency: event.target.value as SightingDraft['urgency'] })} className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink">{options.map((option) => <option key={option}>{option}</option>)}</select></label></div><label className="mt-4 grid gap-1.5 text-sm font-black text-wm-ink">Helpful notes <span className="text-xs font-bold text-wm-muted">Optional</span><textarea value={notes} onChange={(event) => onChange({ notes: event.target.value })} maxLength={700} placeholder="Behaviour, visible condition, weather shelter, or an immediate safety concern." className="min-h-32 rounded-xl border border-wm-line bg-white px-3 py-2.5 text-sm font-medium text-wm-ink" /></label><p className="mt-2 text-xs font-bold text-wm-muted">{notes.length}/700 · For immediate danger to people or animals, use appropriate local emergency or veterinary services.</p></section>
}

function PhotoStep({ photo, uploadRef, uploading, onPhoto, onRemove }: { photo: string; uploadRef: RefObject<HTMLInputElement | null>; uploading: boolean; onPhoto: (event: ChangeEvent<HTMLInputElement>) => void; onRemove: () => void }) {
  return <section><span className="wm-kicker">Step 3 / photo</span><h2 className="mt-2 text-3xl font-black tracking-[-0.06em] text-wm-ink">Add a photo when it helps.</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-wm-muted">A clear face, coat markings, collar, or the visible environment can help. Avoid uploading faces, license plates, private property, or anything that identifies someone without consent.</p><input ref={uploadRef} type="file" accept="image/*" className="sr-only" onChange={onPhoto} />{photo ? <div className="mt-5 overflow-hidden rounded-[22px] border border-wm-line bg-[#f4f1ec]"><img src={photo} alt="Sighting preview" className="max-h-[420px] w-full object-contain" /><div className="flex items-center justify-between gap-3 border-t border-wm-line bg-white p-3"><p className="text-xs font-bold text-wm-muted">Preview prepared as a compressed WebP image.</p><Button onClick={onRemove}>Remove</Button></div></div> : <button type="button" onClick={() => uploadRef.current?.click()} className="mt-5 grid min-h-[240px] w-full place-items-center rounded-[22px] border-2 border-dashed border-wm-line bg-[#fcfbfa] p-5 text-center transition hover:border-wm-action/40 hover:bg-wm-orange-wash"><span><Upload className="mx-auto h-7 w-7 text-wm-action" /><span className="mt-3 block text-sm font-black text-wm-ink">{uploading ? 'Processing image…' : 'Choose a photo'}</span><span className="mt-1 block text-xs font-bold text-wm-muted">JPG, PNG, WebP and other browser-supported image files</span></span></button>}</section>
}

function ReviewStep({ draft, onConsent }: { draft: SightingDraft; onConsent: (value: boolean) => void }) {
  return <section><span className="wm-kicker">Step 4 / review</span><h2 className="mt-2 text-3xl font-black tracking-[-0.06em] text-wm-ink">Check the public-safe version.</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-wm-muted">A real system would send the report to moderation, remove exact location details, and notify only appropriate helpers.</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-wm-line bg-[#fcfbfa] p-4"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-wm-muted">Area</p><p className="mt-1 text-sm font-black text-wm-ink">{draft.area || '—'}</p></div><div className="rounded-2xl border border-wm-line bg-[#fcfbfa] p-4"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-wm-muted">Cats</p><p className="mt-1 text-sm font-black text-wm-ink">{draft.catCount || '—'}</p></div><div className="rounded-2xl border border-wm-line bg-[#fcfbfa] p-4"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-wm-muted">Care signal</p><p className="mt-1 text-sm font-black text-wm-ink">{draft.urgency}</p></div></div>{draft.notes ? <div className="mt-3 rounded-2xl border border-wm-line bg-white p-4"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-wm-muted">Notes</p><p className="mt-1 text-sm leading-relaxed text-wm-ink">{draft.notes}</p></div> : null}<label className="mt-5 flex items-start gap-3 rounded-2xl border border-wm-line bg-wm-orange-wash p-4"><input type="checkbox" checked={draft.consent} onChange={(event) => onConsent(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-wm-line accent-wm-action" /><span><span className="block text-sm font-black text-wm-ink">I used an approximate area and factual observations.</span><span className="mt-1 block text-xs leading-relaxed text-wm-muted">I understand that a real report needs moderator review before any public or helper-facing action.</span></span></label></section>
}
