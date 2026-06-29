import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import Navbar from '@/components/nav/Navbar'
import Footer from '@/components/Footer'
import FallingCats from '@/components/background/FallingCats'
import { withBasePath } from '@/lib/site-paths'

export const metadata: Metadata = {
  title: { default: 'WhisMap', template: '%s | WhisMap' },
  description: 'A privacy-first space for community cat care, protected lost-cat reporting, and personal cat routines.',
  icons: { icon: withBasePath('/favicon.svg') },
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="relative flex min-h-screen flex-col overflow-x-hidden antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-xl focus:bg-wm-ink focus:px-4 focus:py-2 focus:text-sm focus:font-black focus:text-white">Skip to content</a>
        <FallingCats />
        <Navbar />
        <main id="main" className="relative z-10 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
