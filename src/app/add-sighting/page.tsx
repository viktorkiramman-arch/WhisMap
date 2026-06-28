import AddSightingForm from '@/components/sighting/AddSightingForm'
import PageIntro from '@/components/layout/PageIntro'

export const metadata = { title: 'Add Sighting' }

export default function AddSightingPage() {
  return (
    <div className="pb-10">
      <PageIntro
        eyebrow="Protected report / 02"
        title="Add a sighting without oversharing."
        description="Submit the useful facts: approximate area, cat count, urgency, and an optional photo. The public view stays protected until reviewed."
        detail="Keep the location broad and the description factual."
      />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6"><AddSightingForm /></div>
    </div>
  )
}
