'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

// 配置
const AUTH_STORAGE_KEY = 'kwdb_insight_auth'
// 简单的硬编码密码 (实际项目中建议通过环境变量或后端验证)
// 这里为了演示静态部署，使用简单的哈希校验或明文对比
// 注意：这种方式在前端源码中是可见的，仅用于防君子不防小人
const ACCESS_PASSWORD = process.env.NEXT_PUBLIC_ACCESS_PASSWORD || 'kwdb2025' 

interface AuthContextType {
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
  loading: true
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查本地存储的登录状态
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
    if (storedAuth === 'true') {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = (password: string) => {
    if (password === ACCESS_PASSWORD) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true')
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

// 登录页面组件
export function LoginPage() {
  const { login } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (login(password)) {
      setError(false)
    } else {
      setError(true)
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      padding: '1rem',
      background: 'var(--bg)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '24rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="brand-badge" style={{ width: '3rem', height: '3rem', fontSize: '1.25rem', margin: '0 auto 1rem' }}>KW</div>
          <h2 className="title" style={{ fontSize: '1.5rem' }}>访问验证</h2>
          <p className="muted" style={{ marginTop: '0.5rem' }}>请输入访问密码以继续</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              placeholder="输入密码"
              className="btn"
              style={{ 
                width: '100%', 
                textAlign: 'center', 
                fontSize: '1.125rem', 
                letterSpacing: '0.2rem',
                borderColor: error ? 'crimson' : undefined,
                cursor: 'text'
              }}
              autoFocus
            />
            {error && <div style={{ color: 'crimson', fontSize: '0.875rem', marginTop: '0.5rem' }}>密码错误</div>}
          </div>
          
          <button 
            type="submit" 
            className="btn" 
            style={{ 
              background: 'var(--brand-primary)', 
              color: '#fff', 
              border: 'none',
              fontWeight: 600 
            }}
          >
            进入系统
          </button>
        </form>
      </div>
    </div>
  )
}

// 保护路由的高阶组件或包装器
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'grid', placeItems: 'center' }}>
        <div className="skeleton" style={{ width: '200px', height: '100px' }} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <>{children}</>
}
