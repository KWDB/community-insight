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
  metadataBase: new URL('https://community.kbase.cc'),
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg'
  },
  manifest: '/manifest.json'
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
