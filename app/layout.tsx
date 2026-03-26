import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

export const metadata: Metadata = {
  title: {
    default: 'Birdies4Good | Play Golf. Win Big. Give Back.',
    template: '%s | Birdies4Good'
  },
  description: 'Join a community of golfers making an impact. Subscribe for monthly prize draws, track your scores, and support charities that matter.',
  keywords: ['golf', 'charity', 'subscription', 'prize draw', 'golf scores', 'giving back'],
  openGraph: {
    title: 'Birdies4Good | Play Golf. Win Big. Give Back.',
    description: 'Join a community of golfers making an impact. Subscribe for monthly prize draws, track your scores, and support charities that matter.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        {children}
        <Toaster richColors position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}
