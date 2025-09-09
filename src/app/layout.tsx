import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Recommendation Letter Assistant',
  description: 'AI-powered recommendation letter writing assistant for Bangladeshi teachers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {children}
      </body>
    </html>
  )
}