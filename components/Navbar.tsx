'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Share2, Copy, Check, Sun, Moon } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import ThemeToggle, { useTheme } from './ThemeToggle'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [url, setUrl] = useState('')
  const { dark, toggle } = useTheme()

  const openShare = () => {
    setUrl(window.location.href)
    setShowShare(true)
    setIsOpen(false)
  }

  return (
    <>
      <header className="header">
        <div className="brand">
          <div className="brand-badge">KW</div>
          <h1 className="title">KWDB Community Insight</h1>
        </div>

        {/* Desktop Nav */}
        <div className="nav desktop-nav">
          <Link href="/" className="btn" style={{ textDecoration: 'none' }}>首页</Link>
          <Link href="/dashboards/community" className="btn" style={{ textDecoration: 'none' }}>社区仪表盘</Link>
          <button onClick={openShare} className="icon-btn" aria-label="分享">
            <Share2 size={16} aria-hidden="true" />
          </button>
          <ThemeToggle dark={dark} toggle={toggle} />
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
            <button 
              className="mobile-nav-item" 
              onClick={openShare}
              style={{ width: '100%', background: 'transparent', border: 'none', fontSize: 'inherit', fontFamily: 'inherit', cursor: 'pointer', justifyContent: 'space-between' }}
            >
              <span>分享页面</span>
              <Share2 size={16} />
            </button>
            <button 
              className="mobile-nav-item" 
              onClick={toggle}
              style={{ width: '100%', background: 'transparent', border: 'none', fontSize: 'inherit', fontFamily: 'inherit', cursor: 'pointer', justifyContent: 'space-between' }}
            >
              <span>切换主题</span>
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        )}
      </header>

      <ShareModal open={showShare} onClose={() => setShowShare(false)} url={url} />
    </>
  )
}

function ShareModal({ open, onClose, url }: { open: boolean, onClose: () => void, url: string }) {
  const [copied, setCopied] = useState(false)
  
  if (!open) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="share-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="share-modal" role="dialog" aria-modal="true">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="title" style={{ fontSize: '1.125rem', marginBottom: 0 }}>分享此页面</h3>
          <button onClick={onClose} className="icon-btn" aria-label="关闭">
            <X size={20} />
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: '#fff', borderRadius: '0.5rem', border: '1px solid #eee' }}>
             <QRCodeCanvas value={url} size={200} />
          </div>
          
          <div style={{ width: '100%', position: 'relative' }}>
            <input 
              type="text" 
              value={url} 
              readOnly 
              className="btn" 
              style={{ width: '100%', paddingRight: '2.5rem', cursor: 'text', userSelect: 'all' }} 
            />
            <button 
              onClick={handleCopy}
              className="icon-btn"
              style={{ position: 'absolute', right: '0.25rem', top: '0.25rem', height: '2rem', width: '2rem', border: 'none', background: 'transparent' }}
              aria-label="复制链接"
            >
              {copied ? <Check size={16} color="green" /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
