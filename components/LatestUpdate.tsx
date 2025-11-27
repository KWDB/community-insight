'use client'
import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { fetchLatestDownloadTime } from '../queries/latestDownloadTime'

export default function LatestUpdate({ refreshSignal = 0 }: { refreshSignal?: number }) {
  const [ts, setTs] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    fetchLatestDownloadTime()
      .then(res => {
        setTs(res.ts ?? null)
        setLoading(false)
      })
      .catch(err => {
        setError(err?.message || '无法获取最新时间')
        setLoading(false)
      })
  }

  useEffect(() => {
    load()
    const timer = setInterval(load, 60_000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (refreshSignal > 0) load()
  }, [refreshSignal])

  const formatted = ts ? dayjs(ts).format('YYYY-MM-DD HH:mm:ss') : '-'

  return (
    <div className="meta-item">
      <span className="meta-title">下载量数据最后更新时间</span>
      {loading ? (
        <span className="muted">加载中...</span>
      ) : error ? (
        <span style={{ color: 'crimson' }}>错误：{error}</span>
      ) : (
        <span className="meta-value">{formatted}</span>
      )}
    </div>
  )
}
