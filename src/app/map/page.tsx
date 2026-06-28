import PageIntro from '@/components/layout/PageIntro'
import MapWorkspace from '@/components/map/MapWorkspace'

export const metadata = {
  title: 'Protected Care Map',
  description: 'Browse approximate community cat care zones with privacy-first map and list views.',
}

export default function MapPage() {
  return (
    <div className="pb-10">
      <PageIntro
        eyebrow="Community map / approximate by default"
        title="Find care zones, not vulnerable cats."
        description="Browse recent care activity by approximate area. Search, filter, and use the list view when a map is not the best way to plan your next action."
        detail="Public pins never reveal a feeder’s routine or a cat’s exact hiding place."
      />
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6"><MapWorkspace /></section>
    </div>
  )
}
