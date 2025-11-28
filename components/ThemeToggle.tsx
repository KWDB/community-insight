'use client'
import React, { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function useTheme() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = saved ? saved === 'dark' : prefers
    setDark(initial)
    if (initial) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return { dark, toggle }
}

export default function ThemeToggle({ dark, toggle }: { dark?: boolean, toggle?: () => void }) {
  // Backwards compatibility or standalone usage support (though we plan to control it)
  // If props are provided, use them. If not, use internal hook (but this would cause sync issues if used alongside controlled instances)
  // Ideally, we just make this a controlled component or only use the hook.
  // For safety in this refactor, let's make it flexible but prefer props.
  
  const hook = useTheme()
  const isDark = dark ?? hook.dark
  const onToggle = toggle ?? hook.toggle

  // If controlled, we don't want the hook's effect to run unnecessarily if we could avoid it, 
  // but hook rules say we must call it. 
  // Actually, if we use it controlled in Navbar, we shouldn't use <ThemeToggle /> without props in Navbar.
  // We'll update Navbar to pass props.
  
  return (
    <button onClick={onToggle} aria-label="切换主题" className="icon-btn">
      {isDark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
    </button>
  )
}
