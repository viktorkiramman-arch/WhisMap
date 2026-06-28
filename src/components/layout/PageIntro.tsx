import type { ReactNode } from 'react'

type PageIntroProps = {
  eyebrow: string
  title: string
  description: string
  detail?: string
  children?: ReactNode
}

export default function PageIntro({ eyebrow, title, description, detail, children }: PageIntroProps) {
  return (
    <section className="px-4 pb-7 pt-7 sm:px-6 sm:pt-9">
      <div className="wm-page-intro mx-auto grid max-w-[1400px] gap-6 px-5 py-6 sm:px-7 sm:py-8 lg:grid-cols-[1fr_0.38fr] lg:items-end">
        <div>
          <span className="wm-kicker">{eyebrow}</span>
          <h1 className="mt-3 max-w-4xl text-[clamp(2.6rem,5vw,5.6rem)] font-black leading-[0.88] tracking-[-0.08em] text-wm-ink">{title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-wm-muted sm:text-base">{description}</p>
        </div>
        <div className="grid gap-3 lg:justify-items-end">
          {detail && <p className="max-w-xs text-sm leading-relaxed text-wm-muted lg:text-right">{detail}</p>}
          {children}
        </div>
      </div>
    </section>
  )
}
