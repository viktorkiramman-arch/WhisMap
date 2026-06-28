import { colonies } from '@/lib/data'
import { notFound } from 'next/navigation'
import ColonyProfile from '@/components/colony/ColonyProfile'

export async function generateStaticParams() {
  return colonies.map((c) => ({ id: c.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const colony = colonies.find((c) => c.id === id)
  if (!colony) return { title: 'Colony Not Found' }
  return {
    title: `${colony.name} — WhisMap`,
    description: `Colony profile for ${colony.name}. ${colony.note}`,
  }
}

export default async function ColonyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const colony = colonies.find((c) => c.id === id)

  if (!colony) {
    notFound()
  }

  return (
    <div className="px-4 pb-10 pt-7 sm:px-6 sm:pt-9">
      <div className="mx-auto max-w-[1400px]">
        <ColonyProfile colony={colony} />
      </div>
    </div>
  )
}