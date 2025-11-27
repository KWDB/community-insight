'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="header">
      <div className="brand">
        <div className="brand-badge">KW</div>
        <h1 className="title">KWDB Community Insight</h1>
      </div>

      {/* Desktop Nav */}
      <div className="nav desktop-nav">
        <Link href="/" className="btn" style={{ textDecoration: 'none' }}>首页</Link>
        <Link href="/dashboards/community" className="btn" style={{ textDecoration: 'none' }}>社区仪表盘</Link>
        <ThemeToggle />
      </div>

      {/* Mobile Menu Button */}
      <button 
        className="icon-btn mobile-menu-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "关闭菜单" : "打开菜单"}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Nav Dropdown */}
      {isOpen && (
        <div className="mobile-nav">
          <Link 
            href="/" 
            className="mobile-nav-item" 
            onClick={() => setIsOpen(false)}
          >
            首页
          </Link>
          <Link 
            href="/dashboards/community" 
            className="mobile-nav-item" 
            onClick={() => setIsOpen(false)}
          >
            社区仪表盘
          </Link>
          <div className="mobile-nav-item" style={{ justifyContent: 'space-between' }}>
            <span>切换主题</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  )
}
