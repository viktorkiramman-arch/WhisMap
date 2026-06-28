'use client'

import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BookHeart,
  CalendarClock,
  Cat,
  Check,
  ChevronRight,
  ClipboardCheck,
  Copy,
  Droplets,
  ExternalLink,
  HeartPulse,
  ListChecks,
  Package,
  PawPrint,
  Plus,
  ShieldCheck,
  Siren,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
  Utensils,
} from 'lucide-react'
import { careSeed, emergencyChecklist, type CareState, type CatProfile, type TimelineEntry } from '@/lib/care-data'
import { useLocalStorageState } from '@/hooks/use-local-storage-state'

type ToolId =
  | 'overview'
  | 'health'
  | 'nutrition'
  | 'litter'
  | 'behaviour'
  | 'sitter'
  | 'routine'
  | 'household'
  | 'inventory'
  | 'emergency'
  | 'timeline'

type Tool = {
  id: ToolId
  label: string
  description: string
  icon: LucideIcon
}

const tools: Tool[] = [
  { id: 'overview', label: 'Today', description: 'A calm care overview', icon: Sparkles },
  { id: 'health', label: 'Health', description: 'Observation-only records', icon: HeartPulse },
  { id: 'nutrition', label: 'Feeding', description: 'Custom meal rhythm', icon: Utensils },
  { id: 'litter', label: 'Litter', description: 'Clean and observation log', icon: Droplets },
  { id: 'behaviour', label: 'Behaviour', description: 'Contextual notes', icon: BookHeart },
  { id: 'sitter', label: 'Sitter', description: 'Temporary handoff plan', icon: ShieldCheck },
  { id: 'routine', label: 'Routine', description: 'Repeatable tasks', icon: ListChecks },
  { id: 'household', label: 'Household', description: 'Multi-cat profiles', icon: Users },
  { id: 'inventory', label: 'Supplies', description: 'Stock and low items', icon: Package },
  { id: 'emergency', label: 'Emergency', description: 'Lost cat first steps', icon: Siren },
  { id: 'timeline', label: 'Timeline', description: 'Care and memories', icon: CalendarClock },
]

const fallbackImage = '/cats/mochi-orange-tabby.png'

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return `${prefix}-${crypto.randomUUID()}`
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function updateCatState(state: CareState, selectedCatId: string): CareState {
  return { ...state, selectedCatId }
}

function copyToClipboard(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) return navigator.clipboard.writeText(text)
  return Promise.reject(new Error('Clipboard unavailable'))
}

function SmallButton({
  children,
  variant = 'secondary',
  onClick,
  type = 'button',
  disabled = false,
}: {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  const styles = {
    primary: 'bg-wm-action text-white hover:bg-wm-action-hover',
    secondary: 'border border-wm-line bg-white text-wm-ink hover:border-wm-action/40 hover:bg-wm-orange-wash',
    danger: 'border border-wm-danger/25 bg-wm-danger-soft text-wm-danger hover:bg-wm-danger hover:text-white',
    ghost: 'text-wm-muted hover:bg-wm-orange-wash hover:text-wm-ink',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-wm-action/18 disabled:cursor-not-allowed disabled:opacity-45 ${styles[variant]}`}
    >
      {children}
    </button>
  )
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[22px] border border-wm-line bg-white shadow-[0_10px_26px_rgba(35,39,48,0.05)] ${className}`}>{children}</section>
}

function ToolHeader({ icon: Icon, title, description, hint }: { icon: LucideIcon; title: string; description: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-3 border-b border-wm-line px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-wm-orange-wash text-wm-action">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-black tracking-[-0.04em] text-wm-ink">{title}</h2>
          <p className="mt-0.5 max-w-2xl text-sm leading-relaxed text-wm-muted">{description}</p>
        </div>
      </div>
      {hint ? <span className="w-fit rounded-full bg-wm-ink/5 px-2.5 py-1 text-[11px] font-bold text-wm-muted">{hint}</span> : null}
    </div>
  )
}

function SummaryMetric({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="min-w-0 rounded-2xl border border-wm-line bg-white px-3 py-3.5">
      <p className={`truncate text-xl font-black tracking-[-0.05em] ${accent ? 'text-wm-action' : 'text-wm-ink'}`}>{value}</p>
      <p className="mt-0.5 text-[11px] font-bold leading-snug text-wm-muted">{label}</p>
    </div>
  )
}

export default function CareHub() {
  const [state, setState, hydrated] = useLocalStorageState<CareState>('whismap-care-v5', careSeed)
  const [activeTool, setActiveTool] = useState<ToolId>('overview')
  const [notice, setNotice] = useState('')

  const selectedCat = state.cats.find((cat) => cat.id === state.selectedCatId) ?? state.cats[0]
  const selectedCatId = selectedCat?.id ?? ''
  const catTasks = state.tasks.filter((task) => !task.catId || task.catId === selectedCatId)
  const incompleteTasks = catTasks.filter((task) => !task.complete)
  const lowStock = state.supplies.filter((item) => item.quantity <= item.minimum)
  const currentMeals = state.meals.filter((meal) => meal.catId === selectedCatId)
  const currentObservations = state.observations.filter((observation) => observation.catId === selectedCatId)
  const currentBehaviour = state.behaviour.filter((entry) => entry.catId === selectedCatId)
  const currentTimeline = state.timeline.filter((entry) => entry.catId === selectedCatId)

  const progress = catTasks.length ? Math.round(((catTasks.length - incompleteTasks.length) / catTasks.length) * 100) : 0
  const readiness = useMemo(() => {
    const parts = [incompleteTasks.length === 0, lowStock.length === 0, state.sitterMode]
    return parts.filter(Boolean).length
  }, [incompleteTasks.length, lowStock.length, state.sitterMode])

  const mutate = (updater: (current: CareState) => CareState) => setState((current) => updater(current))

  const selectCat = (id: string) => {
    mutate((current) => updateCatState(current, id))
    setNotice('')
  }

  const addTimeline = (entry: Omit<TimelineEntry, 'id'>) => {
    mutate((current) => ({ ...current, timeline: [{ ...entry, id: createId('timeline') }, ...current.timeline] }))
  }

  const renderTool = () => {
    if (!selectedCat) {
      return <EmptyCats onAdd={() => setActiveTool('household')} />
    }

    switch (activeTool) {
      case 'overview':
        return (
          <OverviewTool
            cat={selectedCat}
            tasks={catTasks}
            progress={progress}
            lowStock={lowStock.length}
            observationCount={currentObservations.length}
            mealCount={currentMeals.filter((meal) => meal.complete).length}
            onOpenTool={setActiveTool}
            onToggleTask={(taskId) => mutate((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === taskId ? { ...task, complete: !task.complete } : task) }))}
          />
        )
      case 'health':
        return (
          <HealthTool
            cat={selectedCat}
            observations={currentObservations}
            onSave={(entry) => {
              mutate((current) => ({ ...current, observations: [{ ...entry, id: createId('obs'), catId: selectedCat.id, date: 'Today' }, ...current.observations] }))
              addTimeline({ catId: selectedCat.id, date: 'Today', title: 'Health observation added', note: entry.note || `${entry.appetite}; ${entry.energy}.`, type: 'Health' })
              setNotice('Health observation saved on this device.')
            }}
            onDelete={(id) => mutate((current) => ({ ...current, observations: current.observations.filter((entry) => entry.id !== id) }))}
          />
        )
      case 'nutrition':
        return (
          <NutritionTool
            cat={selectedCat}
            meals={currentMeals}
            onToggle={(id) => mutate((current) => ({ ...current, meals: current.meals.map((meal) => meal.id === id ? { ...meal, complete: !meal.complete } : meal) }))}
            onAdd={(entry) => {
              mutate((current) => ({ ...current, meals: [...current.meals, { ...entry, id: createId('meal'), catId: selectedCat.id, complete: false }] }))
              setNotice('Meal added to this cat’s plan.')
            }}
          />
        )
      case 'litter':
        return (
          <LitterTool
            cat={selectedCat}
            entries={state.litter.filter((entry) => entry.catId === selectedCat.id)}
            onAdd={(entry) => {
              mutate((current) => ({ ...current, litter: [{ ...entry, id: createId('litter'), catId: selectedCat.id, time: 'Today, now' }, ...current.litter] }))
              addTimeline({ catId: selectedCat.id, date: 'Today', title: `Litter: ${entry.status}`, note: `${entry.box} logged.`, type: 'Care' })
            }}
          />
        )
      case 'behaviour':
        return (
          <BehaviourTool
            cat={selectedCat}
            entries={currentBehaviour}
            onAdd={(entry) => {
              mutate((current) => ({ ...current, behaviour: [{ ...entry, id: createId('behaviour'), catId: selectedCat.id, time: 'Today, now' }, ...current.behaviour] }))
              addTimeline({ catId: selectedCat.id, date: 'Today', title: `Behaviour: ${entry.mood}`, note: entry.note || entry.context, type: 'Care' })
            }}
          />
        )
      case 'sitter':
        return (
          <SitterTool
            cat={selectedCat}
            state={state}
            tasks={catTasks}
            onUpdate={(patch) => mutate((current) => ({ ...current, ...patch }))}
            onCopy={async (text) => {
              try {
                await copyToClipboard(text)
                setNotice('Sitter handoff copied.')
              } catch {
                setNotice('Copy was unavailable in this browser. Select the handoff text manually.')
              }
            }}
          />
        )
      case 'routine':
        return (
          <RoutineTool
            cat={selectedCat}
            tasks={catTasks}
            onToggle={(taskId) => mutate((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === taskId ? { ...task, complete: !task.complete } : task) }))}
            onAdd={(title, period) => mutate((current) => ({ ...current, tasks: [...current.tasks, { id: createId('task'), catId: selectedCat.id, title, period, complete: false }] }))}
          />
        )
      case 'household':
        return (
          <HouseholdTool
            cats={state.cats}
            selectedId={selectedCat.id}
            onSelect={selectCat}
            onAdd={(cat) => mutate((current) => ({ ...current, cats: [...current.cats, cat], selectedCatId: cat.id }))}
            onRemove={(id) => mutate((current) => {
              const remaining = current.cats.filter((cat) => cat.id !== id)
              return {
                ...current,
                cats: remaining,
                selectedCatId: remaining[0]?.id ?? '',
                observations: current.observations.filter((entry) => entry.catId !== id),
                meals: current.meals.filter((entry) => entry.catId !== id),
                litter: current.litter.filter((entry) => entry.catId !== id),
                behaviour: current.behaviour.filter((entry) => entry.catId !== id),
                timeline: current.timeline.filter((entry) => entry.catId !== id),
                tasks: current.tasks.filter((entry) => entry.catId !== id),
              }
            })}
          />
        )
      case 'inventory':
        return (
          <InventoryTool
            supplies={state.supplies}
            onChangeQuantity={(id, diff) => mutate((current) => ({ ...current, supplies: current.supplies.map((item) => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + diff) } : item) }))}
            onAdd={(item) => mutate((current) => ({ ...current, supplies: [...current.supplies, { ...item, id: createId('supply') }] }))}
          />
        )
      case 'emergency':
        return (
          <EmergencyTool
            completed={state.emergencySteps}
            onToggle={(label) => mutate((current) => ({ ...current, emergencySteps: current.emergencySteps.includes(label) ? current.emergencySteps.filter((item) => item !== label) : [...current.emergencySteps, label] }))}
          />
        )
      case 'timeline':
        return (
          <TimelineTool
            cat={selectedCat}
            entries={currentTimeline}
            onAdd={(entry) => addTimeline({ ...entry, catId: selectedCat.id })}
            onDelete={(id) => mutate((current) => ({ ...current, timeline: current.timeline.filter((entry) => entry.id !== id) }))}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="pb-10">
      <section className="px-4 pb-5 pt-6 sm:px-6 sm:pt-8">
        <div className="wm-page-intro mx-auto max-w-[1440px] overflow-hidden px-5 py-6 sm:px-7 sm:py-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="wm-kicker">My cats / private care workspace</span>
              <h1 className="mt-3 max-w-4xl text-[clamp(2.65rem,5.3vw,5.6rem)] font-black leading-[0.86] tracking-[-0.08em] text-wm-ink">
                One calm place for each cat’s care.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-wm-muted sm:text-base">
                Track observations, routines, supplies, sitter handoffs, and memories. This prototype saves care records only in this browser.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-wm-orange-wash px-3 py-2 text-xs font-extrabold text-wm-action"><ShieldCheck className="h-3.5 w-3.5" /> Private by default</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-wm-ink/5 px-3 py-2 text-xs font-extrabold text-wm-muted"><Check className="h-3.5 w-3.5" /> {hydrated ? 'Saved on this device' : 'Loading care workspace'}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 sm:px-6">
        {notice ? (
          <div role="status" className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-wm-action/20 bg-wm-orange-wash px-4 py-3 text-sm font-bold text-wm-action">
            <span>{notice}</span>
            <button type="button" className="rounded-lg px-2 py-1 text-xs font-black hover:bg-white/70" onClick={() => setNotice('')}>Dismiss</button>
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-24 xl:self-start">
            <Card className="overflow-hidden">
              <div className="border-b border-wm-line bg-wm-ink px-4 py-4 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/58">Selected cat</p>
                <label className="mt-2 block">
                  <span className="sr-only">Select cat</span>
                  <select
                    value={selectedCatId}
                    onChange={(event) => selectCat(event.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm font-black text-white outline-none focus:ring-4 focus:ring-white/15"
                  >
                    {state.cats.map((cat) => <option key={cat.id} value={cat.id} className="text-wm-ink">{cat.name} · {cat.careType}</option>)}
                  </select>
                </label>
                {selectedCat ? <p className="mt-2 text-xs leading-relaxed text-white/62">{selectedCat.ageLabel} · {selectedCat.note || 'No note yet.'}</p> : null}
              </div>

              <nav aria-label="Cat care tools" className="grid gap-1 p-2">
                {tools.map((tool) => {
                  const Icon = tool.icon
                  const active = activeTool === tool.id
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => { setActiveTool(tool.id); setNotice('') }}
                      className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-wm-action/15 ${active ? 'bg-wm-orange-wash text-wm-action' : 'text-wm-muted hover:bg-wm-ink/4 hover:text-wm-ink'}`}
                    >
                      <Icon className="h-4.5 w-4.5 shrink-0" />
                      <span className="min-w-0"><span className="block text-sm font-extrabold">{tool.label}</span><span className="block truncate text-[10px] font-bold opacity-75">{tool.description}</span></span>
                    </button>
                  )
                })}
              </nav>
            </Card>

            <div className="mt-3 rounded-[20px] border border-wm-line bg-wm-ink px-4 py-4 text-white">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-wm-orange" /><p className="text-sm font-black">Care data is private.</p></div>
              <p className="mt-2 text-xs leading-relaxed text-white/65">This frontend demo keeps records in local browser storage. A real account, sharing controls, and encrypted sync need a backend.</p>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="mb-4 grid gap-3 sm:grid-cols-4">
              <SummaryMetric value={`${progress}%`} label="Today’s routine complete" accent />
              <SummaryMetric value={`${currentMeals.filter((meal) => meal.complete).length}/${currentMeals.length || 0}`} label="Meals recorded" />
              <SummaryMetric value={`${lowStock.length}`} label="Low supply items" />
              <SummaryMetric value={`${readiness}/3`} label="Care readiness signals" />
            </div>
            {renderTool()}
          </main>
        </div>
      </section>
    </div>
  )
}

function EmptyCats({ onAdd }: { onAdd: () => void }) {
  return (
    <Card className="p-8 text-center">
      <Cat className="mx-auto h-8 w-8 text-wm-action" />
      <h2 className="mt-3 text-2xl font-black text-wm-ink">Add a cat profile to begin.</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-wm-muted">Health, feeding, behaviour, and timeline entries stay tied to an individual cat.</p>
      <div className="mt-5"><SmallButton onClick={onAdd} variant="primary"><Plus className="h-4 w-4" /> Add cat profile</SmallButton></div>
    </Card>
  )
}

function OverviewTool({
  cat,
  tasks,
  progress,
  lowStock,
  observationCount,
  mealCount,
  onOpenTool,
  onToggleTask,
}: {
  cat: CatProfile
  tasks: CareState['tasks']
  progress: number
  lowStock: number
  observationCount: number
  mealCount: number
  onOpenTool: (tool: ToolId) => void
  onToggleTask: (id: string) => void
}) {
  const nextTask = tasks.find((task) => !task.complete)
  return (
    <div className="grid gap-4">
      <Card className="overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-5 sm:p-6">
            <span className="wm-kicker">Today with {cat.name}</span>
            <h2 className="mt-2 text-3xl font-black leading-[0.94] tracking-[-0.065em] text-wm-ink">Keep care visible, not overwhelming.</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-wm-muted">Complete only what happened, write factual observations, and leave a handoff-ready note for the next person.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <SmallButton variant="primary" onClick={() => onOpenTool('routine')}><ClipboardCheck className="h-4 w-4" /> Open routine</SmallButton>
              <SmallButton onClick={() => onOpenTool('health')}><HeartPulse className="h-4 w-4" /> Add observation</SmallButton>
            </div>
          </div>
          <div className="relative min-h-[200px] overflow-hidden bg-wm-ink p-5 text-white">
            <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full border-[22px] border-wm-orange" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/58">Next task</p>
                <p className="mt-2 text-2xl font-black tracking-[-0.05em]">{nextTask?.title ?? 'Routine complete'}</p>
                <p className="mt-1 text-xs text-white/65">{nextTask ? `${nextTask.period} · tick it only when complete` : 'No remaining tasks for this cat.'}</p>
              </div>
              <div className="mt-6"><div className="h-2 overflow-hidden rounded-full bg-white/16"><div className="h-full rounded-full bg-wm-orange" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-xs font-bold text-white/66">{progress}% of today’s routine recorded</p></div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <ToolHeader icon={ListChecks} title="Today’s routine" description="Small actions with clear ownership." hint={`${tasks.filter((task) => task.complete).length}/${tasks.length} complete`} />
          <div className="p-3">
            {tasks.length ? tasks.map((task) => (
              <button key={task.id} type="button" onClick={() => onToggleTask(task.id)} className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-wm-orange-wash">
                <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${task.complete ? 'border-wm-action bg-wm-action text-white' : 'border-wm-line bg-white text-transparent'}`}><Check className="h-3.5 w-3.5" /></span>
                <span className="min-w-0 flex-1"><span className={`block text-sm font-extrabold ${task.complete ? 'text-wm-muted line-through' : 'text-wm-ink'}`}>{task.title}</span><span className="text-[11px] font-bold text-wm-muted">{task.period}</span></span>
                <ChevronRight className="h-4 w-4 text-wm-muted2" />
              </button>
            )) : <p className="p-3 text-sm text-wm-muted">No routine tasks yet.</p>}
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="p-5"><div className="flex items-start gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-wm-orange-wash text-wm-action"><Activity className="h-4.5 w-4.5" /></span><div><p className="text-sm font-black text-wm-ink">{observationCount ? `${observationCount} observation${observationCount === 1 ? '' : 's'} logged` : 'No observation yet'}</p><p className="mt-1 text-xs leading-relaxed text-wm-muted">Record what you see. WhisMap does not diagnose.</p><button type="button" onClick={() => onOpenTool('health')} className="mt-3 text-xs font-black text-wm-action hover:underline">Open health tracker</button></div></div></Card>
          <Card className="p-5"><div className="flex items-start gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-wm-ink/5 text-wm-ink"><Package className="h-4.5 w-4.5" /></span><div><p className="text-sm font-black text-wm-ink">{lowStock ? `${lowStock} item${lowStock === 1 ? '' : 's'} at low stock` : 'Supplies look covered'}</p><p className="mt-1 text-xs leading-relaxed text-wm-muted">Keep thresholds editable for each household.</p><button type="button" onClick={() => onOpenTool('inventory')} className="mt-3 text-xs font-black text-wm-action hover:underline">Open supplies</button></div></div></Card>
          <Card className="p-5"><div className="flex items-start gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-wm-ink text-white"><Utensils className="h-4.5 w-4.5" /></span><div><p className="text-sm font-black text-wm-ink">{mealCount} meals confirmed</p><p className="mt-1 text-xs leading-relaxed text-wm-muted">Use the plan as a record, not a diet prescription.</p><button type="button" onClick={() => onOpenTool('nutrition')} className="mt-3 text-xs font-black text-wm-action hover:underline">Open feeding plan</button></div></div></Card>
        </div>
      </div>
    </div>
  )
}

function HealthTool({ cat, observations, onSave, onDelete }: {
  cat: CatProfile
  observations: CareState['observations']
  onSave: (entry: Omit<CareState['observations'][number], 'id' | 'catId' | 'date'>) => void
  onDelete: (id: string) => void
}) {
  const [appetite, setAppetite] = useState<CareState['observations'][number]['appetite']>('Expected')
  const [energy, setEnergy] = useState<CareState['observations'][number]['energy']>('Typical')
  const [note, setNote] = useState('')
  const save = (event: FormEvent) => {
    event.preventDefault()
    onSave({ appetite, energy, note: note.trim() })
    setNote('')
  }
  return (
    <Card>
      <ToolHeader icon={HeartPulse} title={`${cat.name}’s health observations`} description="Track visible changes only. Contact a qualified veterinarian or rescue team when you are concerned." hint="Not medical advice" />
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[0.92fr_1.08fr]">
        <form onSubmit={save} className="rounded-2xl bg-wm-orange-wash p-4">
          <p className="text-sm font-black text-wm-ink">Log an observation</p>
          <div className="mt-3 grid gap-3">
            <label className="grid gap-1.5 text-xs font-black text-wm-muted">Appetite<select value={appetite} onChange={(event) => setAppetite(event.target.value as typeof appetite)} className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink"><option>Expected</option><option>Lower than usual</option><option>Not observed</option></select></label>
            <label className="grid gap-1.5 text-xs font-black text-wm-muted">Energy / movement<select value={energy} onChange={(event) => setEnergy(event.target.value as typeof energy)} className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink"><option>Typical</option><option>Quieter than usual</option><option>More active</option></select></label>
            <label className="grid gap-1.5 text-xs font-black text-wm-muted">Factual note<textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={280} placeholder="Example: Ate slowly, then returned to the usual sleeping spot." className="min-h-24 rounded-xl border border-wm-line bg-white px-3 py-2.5 text-sm font-medium text-wm-ink" /></label>
          </div>
          <div className="mt-4"><SmallButton type="submit" variant="primary"><Plus className="h-4 w-4" /> Save observation</SmallButton></div>
        </form>
        <div className="rounded-2xl border border-wm-line">
          <div className="flex items-center justify-between border-b border-wm-line px-4 py-3"><p className="text-sm font-black text-wm-ink">Recent observations</p><span className="text-xs font-bold text-wm-muted">{observations.length} total</span></div>
          <div className="max-h-[360px] overflow-y-auto p-2 wm-scrollbar">
            {observations.length ? observations.map((entry) => <div key={entry.id} className="group flex gap-3 rounded-xl p-3 hover:bg-wm-ink/4"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-wm-action" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-extrabold text-wm-ink">{entry.appetite} · {entry.energy}</p><span className="text-[11px] font-bold text-wm-muted">{entry.date}</span></div><p className="mt-1 text-sm leading-relaxed text-wm-muted">{entry.note || 'No extra note.'}</p></div><button type="button" onClick={() => onDelete(entry.id)} className="hidden h-8 w-8 shrink-0 place-items-center rounded-lg text-wm-muted hover:bg-wm-danger-soft hover:text-wm-danger group-hover:grid" aria-label="Delete observation"><Trash2 className="h-4 w-4" /></button></div>) : <p className="p-4 text-sm text-wm-muted">No observations for {cat.name} yet.</p>}
          </div>
        </div>
      </div>
    </Card>
  )
}

function NutritionTool({ cat, meals, onToggle, onAdd }: {
  cat: CatProfile
  meals: CareState['meals']
  onToggle: (id: string) => void
  onAdd: (entry: Omit<CareState['meals'][number], 'id' | 'catId' | 'complete'>) => void
}) {
  const [meal, setMeal] = useState('Wet food')
  const [amount, setAmount] = useState('Custom portion')
  const [time, setTime] = useState('Evening')
  const add = (event: FormEvent) => {
    event.preventDefault()
    onAdd({ meal: meal.trim() || 'Meal', amount: amount.trim() || 'Custom portion', time })
  }
  return (
    <Card>
      <ToolHeader icon={Utensils} title={`${cat.name}’s feeding plan`} description="Use amounts set by the caregiver or veterinary team. WhisMap records a custom plan; it does not calculate a diet." hint="Custom plan" />
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-2">
          {meals.length ? meals.map((entry) => <button key={entry.id} type="button" onClick={() => onToggle(entry.id)} className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${entry.complete ? 'border-wm-action/20 bg-wm-orange-wash' : 'border-wm-line bg-white hover:border-wm-action/30'}`}><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${entry.complete ? 'border-wm-action bg-wm-action text-white' : 'border-wm-line text-transparent'}`}><Check className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-black text-wm-ink">{entry.time} · {entry.meal}</span><span className="mt-0.5 block text-xs font-bold text-wm-muted">{entry.amount}</span></span><span className="text-[11px] font-black text-wm-action">{entry.complete ? 'Recorded' : 'Mark done'}</span></button>) : <p className="rounded-2xl border border-dashed border-wm-line p-5 text-sm text-wm-muted">No meals have been added for {cat.name}.</p>}
        </div>
        <form onSubmit={add} className="rounded-2xl bg-wm-ink p-4 text-white">
          <p className="text-sm font-black">Add a planned meal</p>
          <div className="mt-3 grid gap-3">
            <label className="grid gap-1.5 text-xs font-black text-white/65">Time<select value={time} onChange={(event) => setTime(event.target.value)} className="min-h-11 rounded-xl border border-white/14 bg-white/10 px-3 text-sm font-bold text-white"><option className="text-wm-ink">Morning</option><option className="text-wm-ink">Afternoon</option><option className="text-wm-ink">Evening</option></select></label>
            <label className="grid gap-1.5 text-xs font-black text-white/65">Meal<input value={meal} onChange={(event) => setMeal(event.target.value)} className="min-h-11 rounded-xl border border-white/14 bg-white/10 px-3 text-sm font-bold text-white placeholder:text-white/35" /></label>
            <label className="grid gap-1.5 text-xs font-black text-white/65">Portion / instruction<input value={amount} onChange={(event) => setAmount(event.target.value)} className="min-h-11 rounded-xl border border-white/14 bg-white/10 px-3 text-sm font-bold text-white placeholder:text-white/35" /></label>
          </div>
          <button type="submit" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-extrabold text-wm-ink hover:bg-wm-orange-wash"><Plus className="h-4 w-4" /> Add to plan</button>
        </form>
      </div>
    </Card>
  )
}

function LitterTool({ cat, entries, onAdd }: {
  cat: CatProfile
  entries: CareState['litter']
  onAdd: (entry: Omit<CareState['litter'][number], 'id' | 'catId' | 'time'>) => void
}) {
  const [box, setBox] = useState('Main box')
  const [status, setStatus] = useState<CareState['litter'][number]['status']>('Cleaned')
  const add = () => onAdd({ box, status })
  return (
    <Card>
      <ToolHeader icon={Droplets} title={`${cat.name}’s litter log`} description="Record cleaning and simple observations. Do not use this tool to diagnose health conditions." hint="Shared boxes can be uncertain" />
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-2xl bg-wm-orange-wash p-4"><p className="text-sm font-black text-wm-ink">Quick log</p><label className="mt-3 grid gap-1.5 text-xs font-black text-wm-muted">Box / area<input value={box} onChange={(event) => setBox(event.target.value)} className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink" /></label><label className="mt-3 grid gap-1.5 text-xs font-black text-wm-muted">Action<select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink"><option>Cleaned</option><option>Observed</option><option>Refilled</option></select></label><div className="mt-4"><SmallButton variant="primary" onClick={add}><Check className="h-4 w-4" /> Save log</SmallButton></div></div>
        <div className="rounded-2xl border border-wm-line p-2"><div className="border-b border-wm-line px-3 py-2"><p className="text-sm font-black text-wm-ink">Recent litter entries</p></div><div className="max-h-[300px] overflow-y-auto wm-scrollbar">{entries.length ? entries.map((entry) => <div key={entry.id} className="flex items-start gap-3 p-3"><span className="mt-1 grid h-7 w-7 place-items-center rounded-lg bg-wm-ink/5 text-wm-ink"><Droplets className="h-3.5 w-3.5" /></span><div><p className="text-sm font-extrabold text-wm-ink">{entry.status} · {entry.box}</p><p className="mt-0.5 text-xs text-wm-muted">{entry.time}</p></div></div>) : <p className="p-4 text-sm text-wm-muted">No litter entries for {cat.name} yet.</p>}</div></div>
      </div>
    </Card>
  )
}

function BehaviourTool({ cat, entries, onAdd }: {
  cat: CatProfile
  entries: CareState['behaviour']
  onAdd: (entry: Omit<CareState['behaviour'][number], 'id' | 'catId' | 'time'>) => void
}) {
  const [mood, setMood] = useState<CareState['behaviour'][number]['mood']>('Calm')
  const [context, setContext] = useState('')
  const [note, setNote] = useState('')
  const submit = (event: FormEvent) => { event.preventDefault(); onAdd({ mood, context: context.trim() || 'No context added', note: note.trim() }); setContext(''); setNote('') }
  return (
    <Card>
      <ToolHeader icon={BookHeart} title={`${cat.name}’s behaviour journal`} description="Notes are more useful with context: visitors, another pet, a move, a routine change, or a time of day." hint="Observation, not diagnosis" />
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={submit} className="rounded-2xl bg-wm-orange-wash p-4"><p className="text-sm font-black text-wm-ink">Add a short note</p><div className="mt-3 grid gap-3"><label className="grid gap-1.5 text-xs font-black text-wm-muted">Mood<select value={mood} onChange={(event) => setMood(event.target.value as typeof mood)} className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink"><option>Calm</option><option>Playful</option><option>Hiding</option><option>Vocal</option><option>Other</option></select></label><label className="grid gap-1.5 text-xs font-black text-wm-muted">Context<input value={context} onChange={(event) => setContext(event.target.value)} placeholder="Example: visitors arrived" className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink" /></label><label className="grid gap-1.5 text-xs font-black text-wm-muted">Note<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="What did you observe?" className="min-h-24 rounded-xl border border-wm-line bg-white px-3 py-2.5 text-sm font-medium text-wm-ink" /></label></div><div className="mt-4"><SmallButton type="submit" variant="primary"><Plus className="h-4 w-4" /> Add note</SmallButton></div></form>
        <div className="rounded-2xl border border-wm-line p-2"><div className="border-b border-wm-line px-3 py-2"><p className="text-sm font-black text-wm-ink">Recent notes</p></div><div className="max-h-[340px] overflow-y-auto wm-scrollbar">{entries.length ? entries.map((entry) => <article key={entry.id} className="p-3"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-wm-orange-wash px-2 py-1 text-[10px] font-black text-wm-action">{entry.mood}</span><span className="text-xs font-bold text-wm-muted">{entry.time}</span></div><p className="mt-2 text-sm font-extrabold text-wm-ink">{entry.context}</p><p className="mt-1 text-sm leading-relaxed text-wm-muted">{entry.note || 'No additional note.'}</p></article>) : <p className="p-4 text-sm text-wm-muted">No behaviour notes for {cat.name} yet.</p>}</div></div>
      </div>
    </Card>
  )
}

function SitterTool({ cat, state, tasks, onUpdate, onCopy }: {
  cat: CatProfile
  state: CareState
  tasks: CareState['tasks']
  onUpdate: (patch: Partial<CareState>) => void
  onCopy: (text: string) => void
}) {
  const handoff = [
    `WhisMap sitter handoff for ${cat.name}`,
    `Care window: ${state.sitterStart || 'Not set'} to ${state.sitterEnd || 'Not set'}`,
    `Profile note: ${cat.note || 'No extra note.'}`,
    `Open tasks: ${tasks.filter((task) => !task.complete).map((task) => task.title).join(', ') || 'None'}`,
    `Care note: ${state.sitterNote || 'None'}`,
    'Emergency: contact the owner before changing food, medication, or routines. Use Lost & Found only for missing-cat incidents.',
  ].join('\n')
  return (
    <Card>
      <ToolHeader icon={ShieldCheck} title="Cat sitter mode" description="Create a limited, clear care handoff. This frontend view does not grant account access or send messages." hint="Temporary plan" />
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-2xl bg-wm-ink p-4 text-white"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-black">Sitter mode</p><p className="mt-1 text-xs leading-relaxed text-white/65">Make the plan visible only while someone else is caring for {cat.name}.</p></div><button type="button" role="switch" aria-checked={state.sitterMode} onClick={() => onUpdate({ sitterMode: !state.sitterMode })} className={`relative h-7 w-12 rounded-full transition ${state.sitterMode ? 'bg-wm-orange' : 'bg-white/20'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${state.sitterMode ? 'left-6' : 'left-1'}`} /></button></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="grid gap-1.5 text-xs font-black text-white/65">Start<input type="date" value={state.sitterStart} onChange={(event) => onUpdate({ sitterStart: event.target.value })} className="min-h-10 rounded-xl border border-white/15 bg-white/10 px-3 text-sm font-bold text-white" /></label><label className="grid gap-1.5 text-xs font-black text-white/65">End<input type="date" value={state.sitterEnd} onChange={(event) => onUpdate({ sitterEnd: event.target.value })} className="min-h-10 rounded-xl border border-white/15 bg-white/10 px-3 text-sm font-bold text-white" /></label></div></div>
        <div className="rounded-2xl border border-wm-line p-4"><label className="grid gap-1.5 text-xs font-black text-wm-muted">Handoff note<textarea value={state.sitterNote} onChange={(event) => onUpdate({ sitterNote: event.target.value })} className="min-h-28 rounded-xl border border-wm-line bg-white px-3 py-2.5 text-sm font-medium text-wm-ink" /></label><div className="mt-4 flex flex-wrap gap-2"><SmallButton variant="primary" onClick={() => onCopy(handoff)}><Copy className="h-4 w-4" /> Copy handoff</SmallButton><Link href="/lost-found" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-wm-line bg-white px-3.5 py-2 text-sm font-extrabold text-wm-ink hover:border-wm-action/40 hover:bg-wm-orange-wash"><Siren className="h-4 w-4" /> Lost cat help</Link></div><p className="mt-3 text-xs leading-relaxed text-wm-muted">For real handoff access, add expiring, permission-based sharing on a backend.</p></div>
      </div>
    </Card>
  )
}

function RoutineTool({ cat, tasks, onToggle, onAdd }: {
  cat: CatProfile
  tasks: CareState['tasks']
  onToggle: (id: string) => void
  onAdd: (title: string, period: CareState['tasks'][number]['period']) => void
}) {
  const [title, setTitle] = useState('')
  const [period, setPeriod] = useState<CareState['tasks'][number]['period']>('Morning')
  const submit = (event: FormEvent) => { event.preventDefault(); if (!title.trim()) return; onAdd(title.trim(), period); setTitle('') }
  return (
    <Card>
      <ToolHeader icon={ListChecks} title={`${cat.name}’s routine`} description="Use small, repeatable tasks. Completion history stays with this cat’s local browser record." hint={`${tasks.filter((task) => task.complete).length}/${tasks.length} complete`} />
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-2">{tasks.length ? tasks.map((task) => <button key={task.id} type="button" onClick={() => onToggle(task.id)} className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition ${task.complete ? 'border-wm-action/20 bg-wm-orange-wash' : 'border-wm-line bg-white hover:border-wm-action/30'}`}><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${task.complete ? 'border-wm-action bg-wm-action text-white' : 'border-wm-line text-transparent'}`}><Check className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className={`block text-sm font-black ${task.complete ? 'text-wm-muted line-through' : 'text-wm-ink'}`}>{task.title}</span><span className="mt-0.5 block text-xs font-bold text-wm-muted">{task.period}</span></span></button>) : <p className="rounded-2xl border border-dashed border-wm-line p-5 text-sm text-wm-muted">No tasks for {cat.name} yet.</p>}</div>
        <form onSubmit={submit} className="rounded-2xl bg-wm-orange-wash p-4"><p className="text-sm font-black text-wm-ink">Add a routine task</p><label className="mt-3 grid gap-1.5 text-xs font-black text-wm-muted">Task<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Example: Brush fur" className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink" /></label><label className="mt-3 grid gap-1.5 text-xs font-black text-wm-muted">When<select value={period} onChange={(event) => setPeriod(event.target.value as typeof period)} className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink"><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Weekly</option></select></label><div className="mt-4"><SmallButton type="submit" variant="primary"><Plus className="h-4 w-4" /> Add task</SmallButton></div></form>
      </div>
    </Card>
  )
}

function HouseholdTool({ cats, selectedId, onSelect, onAdd, onRemove }: {
  cats: CatProfile[]
  selectedId: string
  onSelect: (id: string) => void
  onAdd: (cat: CatProfile) => void
  onRemove: (id: string) => void
}) {
  const [name, setName] = useState('')
  const [ageLabel, setAgeLabel] = useState('')
  const [careType, setCareType] = useState<CatProfile['careType']>('Indoor')
  const [note, setNote] = useState('')
  const submit = (event: FormEvent) => { event.preventDefault(); if (!name.trim()) return; onAdd({ id: createId('cat'), name: name.trim(), ageLabel: ageLabel.trim() || 'Age not set', careType, note: note.trim() }); setName(''); setAgeLabel(''); setNote('') }
  return (
    <Card>
      <ToolHeader icon={Users} title="Multi-cat household" description="Keep individual care records separate, then manage shared supplies and sitter instructions at the household level." hint={`${cats.length} profiles`} />
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-2">{cats.map((cat) => <div key={cat.id} className={`flex items-center gap-3 rounded-2xl border p-3 ${cat.id === selectedId ? 'border-wm-action/25 bg-wm-orange-wash' : 'border-wm-line bg-white'}`}><div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-wm-ink/6">{cat.photoSrc ? <Image src={cat.photoSrc} alt="" fill sizes="48px" className="object-cover" /> : <Cat className="absolute inset-0 m-auto h-5 w-5 text-wm-muted" />}</div><button type="button" onClick={() => onSelect(cat.id)} className="min-w-0 flex-1 text-left"><span className="block truncate text-sm font-black text-wm-ink">{cat.name}</span><span className="mt-0.5 block truncate text-xs font-bold text-wm-muted">{cat.careType} · {cat.ageLabel}</span></button><button type="button" onClick={() => onRemove(cat.id)} disabled={cats.length === 1} className="grid h-9 w-9 place-items-center rounded-lg text-wm-muted hover:bg-wm-danger-soft hover:text-wm-danger disabled:opacity-30" aria-label={`Remove ${cat.name}`}><Trash2 className="h-4 w-4" /></button></div>)}</div>
        <form onSubmit={submit} className="rounded-2xl bg-wm-ink p-4 text-white"><p className="text-sm font-black">Add cat profile</p><div className="mt-3 grid gap-3"><label className="grid gap-1.5 text-xs font-black text-white/65">Name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Cat name" className="min-h-11 rounded-xl border border-white/14 bg-white/10 px-3 text-sm font-bold text-white placeholder:text-white/35" /></label><div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1.5 text-xs font-black text-white/65">Age / detail<input value={ageLabel} onChange={(event) => setAgeLabel(event.target.value)} placeholder="Example: 3 years" className="min-h-11 rounded-xl border border-white/14 bg-white/10 px-3 text-sm font-bold text-white placeholder:text-white/35" /></label><label className="grid gap-1.5 text-xs font-black text-white/65">Care type<select value={careType} onChange={(event) => setCareType(event.target.value as typeof careType)} className="min-h-11 rounded-xl border border-white/14 bg-white/10 px-3 text-sm font-bold text-white"><option className="text-wm-ink">Indoor</option><option className="text-wm-ink">Community</option><option className="text-wm-ink">Foster</option></select></label></div><label className="grid gap-1.5 text-xs font-black text-white/65">Care note<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Food, routine, or safety note" className="min-h-20 rounded-xl border border-white/14 bg-white/10 px-3 py-2.5 text-sm font-medium text-white placeholder:text-white/35" /></label></div><button type="submit" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-extrabold text-wm-ink hover:bg-wm-orange-wash"><Plus className="h-4 w-4" /> Add profile</button></form>
      </div>
    </Card>
  )
}

function InventoryTool({ supplies, onChangeQuantity, onAdd }: {
  supplies: CareState['supplies']
  onChangeQuantity: (id: string, diff: number) => void
  onAdd: (item: Omit<CareState['supplies'][number], 'id'>) => void
}) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [minimum, setMinimum] = useState('1')
  const [unit, setUnit] = useState('items')
  const submit = (event: FormEvent) => { event.preventDefault(); if (!name.trim()) return; onAdd({ name: name.trim(), quantity: Math.max(0, Number(quantity) || 0), minimum: Math.max(0, Number(minimum) || 0), unit: unit.trim() || 'items' }); setName('') }
  return (
    <Card>
      <ToolHeader icon={Package} title="Cat supply inventory" description="Set household thresholds, then use the shopping list before something runs out. Quantities are editable estimates." hint={`${supplies.filter((item) => item.quantity <= item.minimum).length} low`} />
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-2">{supplies.map((item) => { const low = item.quantity <= item.minimum; return <div key={item.id} className={`flex items-center gap-3 rounded-2xl border p-3 ${low ? 'border-wm-danger/25 bg-wm-danger-soft/40' : 'border-wm-line bg-white'}`}><span className={`grid h-9 w-9 place-items-center rounded-xl ${low ? 'bg-wm-danger-soft text-wm-danger' : 'bg-wm-orange-wash text-wm-action'}`}><Package className="h-4.5 w-4.5" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-wm-ink">{item.name}</p><p className={`mt-0.5 text-xs font-bold ${low ? 'text-wm-danger' : 'text-wm-muted'}`}>{item.quantity} {item.unit} · low at {item.minimum}</p></div><div className="flex items-center gap-1"><button type="button" onClick={() => onChangeQuantity(item.id, -1)} className="grid h-8 w-8 place-items-center rounded-lg border border-wm-line bg-white text-wm-ink hover:bg-wm-orange-wash" aria-label={`Reduce ${item.name}`}>&minus;</button><button type="button" onClick={() => onChangeQuantity(item.id, 1)} className="grid h-8 w-8 place-items-center rounded-lg bg-wm-ink text-white hover:bg-wm-action" aria-label={`Add ${item.name}`}>+</button></div></div> })}</div>
        <form onSubmit={submit} className="rounded-2xl bg-wm-orange-wash p-4"><p className="text-sm font-black text-wm-ink">Add supply</p><div className="mt-3 grid gap-3"><label className="grid gap-1.5 text-xs font-black text-wm-muted">Item<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Example: Medication" className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink" /></label><div className="grid grid-cols-3 gap-2"><label className="grid gap-1.5 text-xs font-black text-wm-muted">Qty<input type="number" min="0" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink" /></label><label className="grid gap-1.5 text-xs font-black text-wm-muted">Unit<input value={unit} onChange={(event) => setUnit(event.target.value)} className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink" /></label><label className="grid gap-1.5 text-xs font-black text-wm-muted">Low at<input type="number" min="0" value={minimum} onChange={(event) => setMinimum(event.target.value)} className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink" /></label></div></div><div className="mt-4"><SmallButton type="submit" variant="primary"><Plus className="h-4 w-4" /> Add supply</SmallButton></div></form>
      </div>
    </Card>
  )
}

function EmergencyTool({ completed, onToggle }: { completed: string[]; onToggle: (label: string) => void }) {
  return (
    <div className="grid gap-4">
      <Card className="overflow-hidden bg-wm-ink text-white">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-5 sm:p-6"><span className="text-[10px] font-black uppercase tracking-[0.15em] text-wm-orange">Missing-cat first response</span><h2 className="mt-3 text-3xl font-black leading-[0.94] tracking-[-0.06em]">Start calm. Protect the cat and your own safety.</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-white/68">This toolkit helps organize immediate actions. For an injured animal or danger to people, contact appropriate local emergency or veterinary services.</p><div className="mt-5 flex flex-wrap gap-2"><Link href="/lost-found" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-extrabold text-wm-ink hover:bg-wm-orange-wash"><ExternalLink className="h-4 w-4" /> Open Lost & Found</Link><Link href="/report-cruelty" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/18 px-3.5 py-2 text-sm font-extrabold text-white hover:bg-white/10"><AlertTriangle className="h-4 w-4" /> Report a concern</Link></div></div><div className="relative min-h-[220px] overflow-hidden bg-wm-orange p-5 text-wm-ink"><div className="absolute -right-12 -bottom-16 h-56 w-56 rounded-full border-[28px] border-white/40" /><div className="relative"><p className="text-[10px] font-black uppercase tracking-[0.15em] text-wm-ink/60">What public reports protect</p><p className="mt-3 text-2xl font-black tracking-[-0.05em]">Approximate areas, safe contact requests, and factual updates.</p></div></div>
        </div>
      </Card>
      <Card><ToolHeader icon={Siren} title="First-hour checklist" description="Complete only the actions that are appropriate for the situation." hint={`${completed.length}/${emergencyChecklist.length} complete`} /><div className="grid gap-2 p-4 sm:p-5">{emergencyChecklist.map((item) => { const done = completed.includes(item); return <button key={item} type="button" onClick={() => onToggle(item)} className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${done ? 'border-wm-action/25 bg-wm-orange-wash' : 'border-wm-line bg-white hover:border-wm-action/30'}`}><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${done ? 'border-wm-action bg-wm-action text-white' : 'border-wm-line text-transparent'}`}><Check className="h-3.5 w-3.5" /></span><span className={`text-sm font-extrabold leading-relaxed ${done ? 'text-wm-muted line-through' : 'text-wm-ink'}`}>{item}</span></button> })}</div></Card>
    </div>
  )
}

function TimelineTool({ cat, entries, onAdd, onDelete }: {
  cat: CatProfile
  entries: TimelineEntry[]
  onAdd: (entry: Omit<TimelineEntry, 'id' | 'catId'>) => void
  onDelete: (id: string) => void
}) {
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [type, setType] = useState<TimelineEntry['type']>('Memory')
  const submit = (event: FormEvent) => { event.preventDefault(); if (!title.trim()) return; onAdd({ date: 'Today', title: title.trim(), note: note.trim(), type }); setTitle(''); setNote('') }
  return (
    <Card>
      <ToolHeader icon={CalendarClock} title={`${cat.name}’s life timeline`} description="Keep milestones, care records, and memories together. Use filters when a timeline becomes longer in a real account." hint={`${entries.length} events`} />
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative pl-6 before:absolute before:bottom-3 before:left-2 before:top-3 before:w-px before:bg-wm-line">{entries.length ? entries.map((entry) => <article key={entry.id} className="group relative mb-4 rounded-2xl border border-wm-line bg-white p-4"><span className="absolute -left-[1.47rem] top-5 h-3 w-3 rounded-full border-2 border-white bg-wm-action shadow-sm" /><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="rounded-full bg-wm-orange-wash px-2 py-1 text-[10px] font-black text-wm-action">{entry.type}</span><span className="text-xs font-bold text-wm-muted">{entry.date}</span></div><button type="button" onClick={() => onDelete(entry.id)} className="hidden rounded-lg p-1.5 text-wm-muted hover:bg-wm-danger-soft hover:text-wm-danger group-hover:block" aria-label={`Delete ${entry.title}`}><Trash2 className="h-4 w-4" /></button></div><h3 className="mt-2 text-sm font-black text-wm-ink">{entry.title}</h3><p className="mt-1 text-sm leading-relaxed text-wm-muted">{entry.note || 'No note added.'}</p></article>) : <p className="rounded-2xl border border-dashed border-wm-line p-5 text-sm text-wm-muted">No timeline items for {cat.name} yet.</p>}</div>
        <form onSubmit={submit} className="h-fit rounded-2xl bg-wm-orange-wash p-4"><p className="text-sm font-black text-wm-ink">Add timeline event</p><div className="mt-3 grid gap-3"><label className="grid gap-1.5 text-xs font-black text-wm-muted">Type<select value={type} onChange={(event) => setType(event.target.value as typeof type)} className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink"><option>Memory</option><option>Care</option><option>Health</option><option>Milestone</option></select></label><label className="grid gap-1.5 text-xs font-black text-wm-muted">Title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Example: Adoption day" className="min-h-11 rounded-xl border border-wm-line bg-white px-3 text-sm font-bold text-wm-ink" /></label><label className="grid gap-1.5 text-xs font-black text-wm-muted">Note<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Keep a useful detail or memory" className="min-h-24 rounded-xl border border-wm-line bg-white px-3 py-2.5 text-sm font-medium text-wm-ink" /></label></div><div className="mt-4"><SmallButton type="submit" variant="primary"><Plus className="h-4 w-4" /> Add event</SmallButton></div></form>
      </div>
    </Card>
  )
}
