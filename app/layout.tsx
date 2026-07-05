import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Haul The Above — Checkout',
  description: 'Secure checkout for Haul The Above trailer rentals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
