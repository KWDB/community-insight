import './globals.css'
import React from 'react'
import ThemeToggle from '../components/ThemeToggle'
import Link from 'next/link'
import Footer from '../components/Footer'

export const metadata = {
  title: 'KWDB Community Insight',
  description: 'KWDB 社区指标仪表盘'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="container">
          <header className="header">
            <div className="brand">
              <div className="brand-badge">KW</div>
              <h1 className="title">KWDB Community Insight</h1>
            </div>
            <div className="nav">
              <Link href="/" className="btn" style={{ textDecoration: 'none' }}>首页</Link>
              <Link href="/dashboards/community" className="btn" style={{ textDecoration: 'none' }}>社区仪表盘</Link>
              <ThemeToggle />
            </div>
          </header>
          {children}
          <Footer />
        </div>
      </body>
    </html>
  )
}
