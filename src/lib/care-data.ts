import { withBasePath } from './site-paths'

export type CatProfile = {
  id: string
  name: string
  ageLabel: string
  careType: 'Indoor' | 'Community' | 'Foster'
  photoSrc?: string
  note?: string
}

export type Observation = {
  id: string
  catId: string
  date: string
  appetite: 'Expected' | 'Lower than usual' | 'Not observed'
  energy: 'Typical' | 'Quieter than usual' | 'More active'
  note: string
}

export type MealEntry = {
  id: string
  catId: string
  time: string
  meal: string
  amount: string
  complete: boolean
}

export type LitterEntry = {
  id: string
  catId: string
  box: string
  status: 'Cleaned' | 'Observed' | 'Refilled'
  time: string
}

export type BehaviourEntry = {
  id: string
  catId: string
  mood: 'Calm' | 'Playful' | 'Hiding' | 'Vocal' | 'Other'
  context: string
  note: string
  time: string
}

export type CareTask = {
  id: string
  catId?: string
  title: string
  period: 'Morning' | 'Afternoon' | 'Evening' | 'Weekly'
  complete: boolean
}

export type SupplyItem = {
  id: string
  name: string
  quantity: number
  unit: string
  minimum: number
  expires?: string
}

export type TimelineEntry = {
  id: string
  catId: string
  date: string
  title: string
  note: string
  type: 'Care' | 'Health' | 'Memory' | 'Milestone'
}

export type CareState = {
  cats: CatProfile[]
  selectedCatId: string
  observations: Observation[]
  meals: MealEntry[]
  litter: LitterEntry[]
  behaviour: BehaviourEntry[]
  tasks: CareTask[]
  supplies: SupplyItem[]
  timeline: TimelineEntry[]
  sitterMode: boolean
  sitterStart: string
  sitterEnd: string
  sitterNote: string
  emergencySteps: string[]
}

export const careSeed: CareState = {
  cats: [
    {
      id: 'mochi',
      name: 'Mochi',
      ageLabel: '2 years',
      careType: 'Indoor',
      photoSrc: withBasePath('/cats/mochi-orange-tabby.png'),
      note: 'Blue collar at home. Likes a quiet room after meals.',
    },
    {
      id: 'nori',
      name: 'Nori',
      ageLabel: '4 years',
      careType: 'Indoor',
      photoSrc: withBasePath('/cats/tuxedo-bus-stop.png'),
      note: 'Separate meals from Mochi and leave water in the kitchen.',
    },
    {
      id: 'biscuit',
      name: 'Biscuit',
      ageLabel: 'Community care',
      careType: 'Community',
      photoSrc: withBasePath('/cats/biscuit-tabby-kitten.png'),
      note: 'Observe from a distance; do not publish the feeding location.',
    },
  ],
  selectedCatId: 'mochi',
  observations: [
    {
      id: 'obs-1',
      catId: 'mochi',
      date: 'Today',
      appetite: 'Expected',
      energy: 'Typical',
      note: 'Ate breakfast and rested by the window.',
    },
  ],
  meals: [
    { id: 'meal-1', catId: 'mochi', time: 'Morning', meal: 'Wet food', amount: 'Custom portion', complete: true },
    { id: 'meal-2', catId: 'mochi', time: 'Evening', meal: 'Wet food', amount: 'Custom portion', complete: false },
  ],
  litter: [
    { id: 'litter-1', catId: 'mochi', box: 'Main box', status: 'Cleaned', time: 'Today, 08:00' },
  ],
  behaviour: [
    { id: 'behaviour-1', catId: 'mochi', mood: 'Calm', context: 'After breakfast', note: 'Sat at the window as usual.', time: 'Today, 08:15' },
  ],
  tasks: [
    { id: 'task-1', catId: 'mochi', title: 'Morning food', period: 'Morning', complete: true },
    { id: 'task-2', catId: 'mochi', title: 'Fresh water', period: 'Morning', complete: true },
    { id: 'task-3', catId: 'mochi', title: 'Litter check', period: 'Afternoon', complete: false },
    { id: 'task-4', catId: 'mochi', title: 'Play / quiet time', period: 'Evening', complete: false },
    { id: 'task-5', catId: 'nori', title: 'Separate evening meal', period: 'Evening', complete: false },
  ],
  supplies: [
    { id: 'supply-1', name: 'Wet food', quantity: 8, unit: 'pouches', minimum: 6 },
    { id: 'supply-2', name: 'Dry food', quantity: 2, unit: 'bags', minimum: 2 },
    { id: 'supply-3', name: 'Litter', quantity: 3, unit: 'bags', minimum: 2 },
    { id: 'supply-4', name: 'Cleaning bags', quantity: 14, unit: 'pieces', minimum: 10 },
  ],
  timeline: [
    { id: 'time-1', catId: 'mochi', date: 'Today', title: 'Routine check-in', note: 'Food, water, and observation recorded.', type: 'Care' },
    { id: 'time-2', catId: 'mochi', date: 'May 24', title: 'Health record review', note: 'Add or verify veterinarian notes here.', type: 'Health' },
    { id: 'time-3', catId: 'biscuit', date: 'Apr 08', title: 'Community care note', note: 'Joined the protected care list.', type: 'Milestone' },
  ],
  sitterMode: false,
  sitterStart: '',
  sitterEnd: '',
  sitterNote: 'Use each cat’s profile notes. Contact the owner before changing food, medication, or the care routine.',
  emergencySteps: [],
}

export const emergencyChecklist = [
  'Search safe indoor hiding places first.',
  'Prepare a clear recent photo and distinguishing details.',
  'Tell trusted neighbours and ask them not to chase the cat.',
  'Create a protected Lost & Found report with an approximate area.',
]
