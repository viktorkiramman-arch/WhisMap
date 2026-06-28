'use client'

import { usePathname } from 'next/navigation'
import type { CSSProperties } from 'react'
import { Cat, Heart, PawPrint, Sparkles } from 'lucide-react'

type Kind = 'cat' | 'paw' | 'heart' | 'sparkle'

type Item = { id: number; kind: Kind; left: string; delay: string; duration: string; size: number; drift: string; turn: string }

const items: Item[] = [
  { id: 1, kind: 'cat', left: '3%', delay: '-4s', duration: '20s', size: 28, drift: '42px', turn: '32deg' },
  { id: 2, kind: 'paw', left: '11%', delay: '-13s', duration: '24s', size: 20, drift: '-34px', turn: '-26deg' },
  { id: 3, kind: 'sparkle', left: '18%', delay: '-7s', duration: '22s', size: 18, drift: '28px', turn: '38deg' },
  { id: 4, kind: 'cat', left: '29%', delay: '-17s', duration: '26s', size: 24, drift: '-46px', turn: '-34deg' },
  { id: 5, kind: 'heart', left: '42%', delay: '-2s', duration: '21s', size: 16, drift: '35px', turn: '26deg' },
  { id: 6, kind: 'paw', left: '55%', delay: '-10s', duration: '25s', size: 22, drift: '-30px', turn: '-22deg' },
  { id: 7, kind: 'cat', left: '69%', delay: '-14s', duration: '24s', size: 28, drift: '40px', turn: '42deg' },
  { id: 8, kind: 'sparkle', left: '82%', delay: '-5s', duration: '22s', size: 19, drift: '-23px', turn: '-20deg' },
  { id: 9, kind: 'paw', left: '91%', delay: '-19s', duration: '27s', size: 20, drift: '31px', turn: '28deg' },
]

const iconByKind = { cat: Cat, paw: PawPrint, heart: Heart, sparkle: Sparkles }

export default function FallingCats() {
  const pathname = usePathname()
  const quiet = ['/map', '/care', '/lost-found', '/add-sighting', '/report-cruelty'].some((path) => pathname.startsWith(path))
  return (
    <div className="wm-falling-layer" data-density={quiet ? 'quiet' : 'full'} aria-hidden="true">
      {items.map((item) => {
        const Icon = iconByKind[item.kind]
        const style = { left: item.left, animationDelay: item.delay, animationDuration: item.duration, '--wm-fall-drift': item.drift, '--wm-fall-turn': item.turn } as CSSProperties
        return <span key={item.id} className="wm-falling-item" style={style}><Icon size={item.size} strokeWidth={1.8} /></span>
      })}
    </div>
  )
}
