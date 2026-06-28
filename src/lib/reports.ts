export type CatColor = 'orange' | 'black' | 'white' | 'gray' | 'brown' | 'tabby' | 'calico' | 'tuxedo' | 'other'

export const catColorLabels: Record<CatColor, string> = {
  orange: 'Orange / ginger',
  black: 'Black',
  white: 'White',
  gray: 'Gray',
  brown: 'Brown',
  tabby: 'Tabby',
  calico: 'Calico',
  tuxedo: 'Tuxedo',
  other: 'Other',
}

export type ReportType = 'lost' | 'found'
export type UrgencyLevel = 'normal' | 'urgent'

export interface LostFoundReport {
  id: string
  type: ReportType
  catName?: string
  color: CatColor
  description: string
  location: string
  date: string
  photoSrc?: string
  photoDataUrl?: string
  contactName: string
  contactMethod: string
  status: 'active' | 'resolved'
  urgency: UrgencyLevel
  reviewStatus: 'review' | 'verified'
  visibility: 'approximate' | 'private'
  createdAt: string
}

/**
 * Fictional UI seed content. Personal contact fields intentionally point to a
 * protected request flow rather than real people, emails, or phone numbers.
 */
export const sampleLostFoundReports: LostFoundReport[] = [
  {
    id: 'lf-001',
    type: 'lost',
    catName: 'Mochi',
    color: 'orange',
    description: 'Orange tabby with a small left-ear notch and a blue collar. Friendly with familiar voices. Last seen near the public garden entrance.',
    location: 'Riverside Garden area',
    date: '2026-06-22',
    photoSrc: '/cats/mochi-orange-tabby.png',
    contactName: 'Report owner',
    contactMethod: 'Protected contact request',
    status: 'active',
    urgency: 'urgent',
    reviewStatus: 'verified',
    visibility: 'approximate',
    createdAt: 'Demo record',
  },
  {
    id: 'lf-002',
    type: 'found',
    color: 'tuxedo',
    description: 'Black-and-white cat observed near a public transit area. Appears well-fed and cautious around strangers. No public contact details are shown.',
    location: 'South Station area',
    date: '2026-06-21',
    photoSrc: '/cats/tuxedo-bus-stop.png',
    contactName: 'Report owner',
    contactMethod: 'Protected contact request',
    status: 'active',
    urgency: 'normal',
    reviewStatus: 'verified',
    visibility: 'approximate',
    createdAt: 'Demo record',
  },
  {
    id: 'lf-003',
    type: 'lost',
    catName: 'Shadow',
    color: 'black',
    description: 'Black short-haired cat with green eyes. Shy around strangers and last seen near a library courtyard. Keep distance and report a clear sighting.',
    location: 'Library Courtyard area',
    date: '2026-06-20',
    photoSrc: '/cats/shadow-black-cat.png',
    contactName: 'Report owner',
    contactMethod: 'Protected contact request',
    status: 'active',
    urgency: 'normal',
    reviewStatus: 'review',
    visibility: 'approximate',
    createdAt: 'Demo record',
  },
  {
    id: 'lf-004',
    type: 'found',
    color: 'calico',
    description: 'Young adult calico observed under parked vehicles during rain. The public record uses a broad area and does not identify the person who reported it.',
    location: 'Old Market area',
    date: '2026-06-19',
    photoSrc: '/cats/calico-rain.png',
    contactName: 'Report owner',
    contactMethod: 'Protected contact request',
    status: 'active',
    urgency: 'normal',
    reviewStatus: 'review',
    visibility: 'approximate',
    createdAt: 'Demo record',
  },
  {
    id: 'lf-005',
    type: 'lost',
    catName: 'Biscuit',
    color: 'tabby',
    description: 'Brown tabby with white paws and a pink nose. This report is kept for outcome context and is marked resolved in the local demo data.',
    location: 'North School area',
    date: '2026-06-18',
    photoSrc: '/cats/biscuit-tabby-kitten.png',
    contactName: 'Report owner',
    contactMethod: 'Protected contact request',
    status: 'resolved',
    urgency: 'normal',
    reviewStatus: 'verified',
    visibility: 'approximate',
    createdAt: 'Demo record',
  },
]

export type CrueltyCategory =
  | 'neglect'
  | 'physical-harm'
  | 'abandonment'
  | 'poisoning'
  | 'trapping'
  | 'breeding-farm'
  | 'other'

export interface CrueltyReport {
  id: string
  category: CrueltyCategory
  description: string
  approximateLocation: string
  observedAt: string
  photoDataUrl?: string
  contactMethod?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export const crueltyCategoryLabels: Record<CrueltyCategory, string> = {
  neglect: 'Neglect: no visible food, water, or shelter',
  'physical-harm': 'Physical harm or violence',
  abandonment: 'Abandonment',
  poisoning: 'Suspected poisoning',
  trapping: 'Unsafe or illegal trapping',
  'breeding-farm': 'Suspected breeding or hoarding concern',
  other: 'Other concern',
}
