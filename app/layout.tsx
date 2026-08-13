import type { Metadata } from 'next'
import { Syne, DM_Sans, DM_Mono, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

/* next/font downloads these at build time and serves them from this origin.
   There is no runtime request to Google Fonts. */

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['300', '400', '500'],
  display: 'swap',
})

const cg = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cg',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Vantis Build — Verified Progress Record',
  description:
    'An independently produced, evidence-backed record of what has physically been built on a construction site as of a date. Demonstration build.',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} ${dmMono.variable} ${cg.variable}`}
    >
      <body className="bg-background text-off-white font-sans antialiased">{children}</body>
    </html>
  )
}
