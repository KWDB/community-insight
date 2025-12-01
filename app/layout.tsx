import './globals.css'
import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { AuthProvider, ProtectedRoute } from '../components/Auth'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata = {
  title: 'KWDB Community Insight',
  description: 'KWDB 社区指标和趋势展示',
  metadataBase: new URL('https://kwdb.github.io/community-insight'),
  icons: {
    icon: '/community-insight/favicon.svg',
    shortcut: '/community-insight/favicon.svg',
    apple: '/community-insight/favicon.svg'
  },
  manifest: '/community-insight/manifest.json'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>
          <ProtectedRoute>
            <div className="container">
              <Navbar />
              {children}
              <Footer />
            </div>
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  )
}
