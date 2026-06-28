import type { Metadata } from 'next'
import CareHub from '@/components/care/CareHub'

export const metadata: Metadata = {
  title: 'Direct Cat Care',
  description: 'Information, practical planning tools, and privacy-first care insights for community cats.',
}

export default function CarePage() {
  return <CareHub />
}
