import Image from 'next/image'

export type WhisMapLogoProps = {
  compact?: boolean
  invert?: boolean
  className?: string
}

/**
 * Brand mark based on the supplied WhisMap logo. The pin asset is the original
 * logo cropped only to remove surrounding whitespace so it can work in the UI.
 */
export default function WhisMapLogo({
  compact = false,
  invert = false,
  className = '',
}: WhisMapLogoProps) {
  const textColor = invert ? 'text-white' : 'text-wm-ink'

  return (
    <span className={`inline-flex min-w-0 items-center gap-2.5 ${className}`}>
      <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-white ring-1 ring-black/5">
        <Image
          src="/brand/whismap-pin.png"
          alt=""
          fill
          priority
          className="object-contain p-0.5"
          sizes="40px"
        />
      </span>
      {!compact && (
        <span className={`whitespace-nowrap text-[1.35rem] font-black tracking-[-0.075em] ${textColor}`}>
          Whis<span className="text-wm-amber">Map</span>
        </span>
      )}
    </span>
  )
}
