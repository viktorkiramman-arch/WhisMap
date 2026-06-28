export type ColonyStatus = 'fed' | 'urgent' | 'verified' | 'review'

export interface Colony {
  id: string
  name: string
  distance: number
  status: ColonyStatus
  cats: number
  lastFed: string
  note: string
  x: number
  y: number
}

export const colonies: Colony[] = [
  { id: 'riverside', name: 'Riverside Garden Colony', distance: 1.4, status: 'fed', cats: 9, lastFed: 'Fed 45 min ago', x: 46, y: 42, note: 'Stable group near the community garden. Water bowl needs a refill.' },
  { id: 'old-market', name: 'Old Market Alley', distance: 2.6, status: 'urgent', cats: 6, lastFed: 'Needs check today', x: 62, y: 34, note: 'One limping adult reported. Exact pin restricted to trusted feeders.' },
  { id: 'library', name: 'Library Courtyard', distance: 3.8, status: 'verified', cats: 11, lastFed: 'Fed yesterday', x: 38, y: 59, note: 'Verified caretaker assigned. Regular evening feeding.' },
  { id: 'station', name: 'South Station Steps', distance: 5.9, status: 'review', cats: 4, lastFed: 'Unverified sighting', x: 71, y: 58, note: 'New report awaiting moderator review. Public location is approximate.' },
  { id: 'school', name: 'North School Wall', distance: 7.7, status: 'verified', cats: 14, lastFed: 'Fed 2 days ago', x: 29, y: 30, note: 'Large colony. TNR follow-up needed for two adults.' },
  { id: 'harbor', name: 'Harbor Storage Row', distance: 9.3, status: 'fed', cats: 5, lastFed: 'Fed this morning', x: 78, y: 23, note: 'Protected industrial area. Access details hidden.' },
]

export const statusLabels: Record<ColonyStatus, string> = {
  fed: 'Recently fed',
  urgent: 'Urgent',
  verified: 'Verified',
  review: 'Under review',
}

export const statusColors: Record<ColonyStatus, string> = {
  fed: 'bg-[#fff0e8] text-[#c85424]',
  urgent: 'bg-[#fff0eb] text-[#a83f22]',
  verified: 'bg-[#f2f3f5] text-[#252833]',
  review: 'bg-wm-ink/8 text-wm-muted',
}

export interface ActivityItem {
  action: string
  detail: string
  time: string
}

export const sampleActivities: ActivityItem[] = [
  { action: 'Mara marked this colony as fed.', detail: 'Dry food and clean water.', time: 'Jun 22, 5:18 PM' },
  { action: 'Jules added a care note.', detail: 'One tabby stayed near the back wall.', time: 'Jun 21, 6:03 PM' },
  { action: 'Moderator updated visibility.', detail: 'Exact location restricted to trusted feeders.', time: 'Jun 20, 11:42 AM' },
]