'use client'
import { X, Copy, Check } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type { ChartConfig } from '../lib/types'
import { useTimeRange } from '../lib/time'
import dayjs from 'dayjs'
import { QUERIES } from '../queries'
import { getCache, setCache } from '../lib/dataCache'

export default function ChartRenderer({ chart, refreshSignal = 0 }: { chart: ChartConfig, refreshSignal?: number }) {
  const { range } = useTimeRange()
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const isMobile = useIsMobile()
  const [modalOpen, setModalOpen] = useState(false)

  const option = useMemo(() => {
    const series = (data?.series ?? []) as any[]
    const xKey = chart.options?.xKey || 'date'
    const yKey = chart.options?.yKey || 'value'
    const colors = ['#3b82f6', '#93c5fd', '#1d4ed8']
    const ds = series.length > 0 ? decimate(series, 4000) : []
    return {
      color: colors,
      grid: { 
        left: isMobile ? 0 : 40, 
        right: isMobile ? 10 : 20, 
        top: 20, 
        bottom: 40, 
        containLabel: true 
      },
      tooltip: { trigger: 'axis', confine: true },
      toolbox: { 
        show: !isMobile,
        feature: { dataZoom: {}, restore: {}, saveAsImage: {} } 
      },
      dataZoom: [
        { type: 'inside', zoomLock: false }, 
        { type: 'slider', height: isMobile ? 20 : 30 }
      ],
      xAxis: { 
        type: 'category', 
        data: ds.map((d: any) => d[xKey]), 
        axisLabel: { 
          interval: 'auto', 
          color: '#4b5563', 
          fontSize: isMobile ? 10 : 12,
          hideOverlap: true
        } 
      },
      yAxis: { 
        type: 'value', 
        axisLabel: { 
          color: '#4b5563', 
          fontSize: isMobile ? 10 : 12 
        } 
      },
      series: [{ type: chart.viz === 'bar' ? 'bar' : 'line', data: ds.map((d: any) => d[yKey]), smooth: true, lineStyle: { width: 2 } }],
      animation: true
    }
  }, [chart, data, isMobile])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    // 动态加载查询模块并执行
    const loader = QUERIES[chart.queryModule]
    if (!loader) {
      setError(`未找到查询模块: ${chart.queryModule}`)
      setLoading(false)
      return
    }
    const key = `${chart.id}:${chart.queryModule}:${range.from.toISOString()}:${range.to.toISOString()}`
    const cached = getCache<any>(key)
    if (cached) { setData(cached); setLoading(false); return }
    loader().then(mod => mod.query({ range })).then(res => {
      if (!cancelled) { setData(res); setLoading(false); setCache(key, res, chart.refreshSec ?? 60) }
    }).catch(err => {
      if (!cancelled) { setError(err?.message || '查询失败'); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [chart.id, chart.queryModule, chart.refreshSec, range, refreshSignal])

  const chartRef = React.useRef<any>(null)

  useEffect(() => {
    const inst = chartRef.current?.getEchartsInstance()
    if (!inst) return
    const resizeObserver = new ResizeObserver(() => {
      inst.resize()
    })
    const container = chartRef.current?.ele
    if (container) resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  if (loading) return <div className="skeleton" />
  if (error) return <div style={{ color: 'crimson' }}>错误：{error}</div>
  const isEmpty = !data || (chart.viz === 'stat' ? !data.stat : (!data.series && !data.rows))
  if (isEmpty) return <div className="muted">暂无数据</div>
  if (chart.viz === 'stat') {
    return (
      <>
        <Stat data={data} options={chart.options} onClick={() => setModalOpen(true)} />
        <StatDetailModal 
          open={modalOpen} 
          onClose={() => setModalOpen(false)} 
          title={chart.title} 
          data={data}
          description={chart.description}
          range={range}
        />
      </>
    )
  }
  if (chart.viz === 'table') return <Table rows={data.rows} />
  return <ReactECharts ref={chartRef} option={option} style={{ height: 280, width: '100%' }} autoResize={false} />
}

function StatDetailModal({ open, onClose, title, data, description, range }: { open: boolean, onClose: () => void, title: string, data: any, description?: string, range: { from: Date, to: Date } }) {
  const [copied, setCopied] = useState(false)
  
  // Parse description with time range
  const parsedDescription = useMemo(() => {
    if (!description) return null
    return description
      .replace(/\$from/g, dayjs(range.from).format('YYYY-MM-DD'))
      .replace(/\$to/g, dayjs(range.to).format('YYYY-MM-DD'))
  }, [description, range])

  if (!open) return null

  const value = Number(data?.stat?.value ?? 0)
  const label = data?.stat?.label ?? '指标'
  const formatted = value.toLocaleString()

  const handleCopy = () => {
    const text = `${title}：${formatted}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="share-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="share-modal" role="dialog" aria-modal="true">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="title" style={{ fontSize: '1.125rem', marginBottom: 0 }}>{title}</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleCopy} className="icon-btn" aria-label="复制">
              {copied ? <Check size={20} color="green" /> : <Copy size={20} />}
            </button>
            <button onClick={onClose} className="icon-btn" aria-label="关闭">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="stat-value-large">
            {formatted}
            <div className="muted" style={{ fontSize: 14, fontWeight: 400 }}>{label}</div>
          </div>
          {parsedDescription && (
             <div className="stat-description">
               {parsedDescription}
             </div>
          )}
        </div>
      </div>
    </>
  )
}

function Table({ rows }: { rows: any[] }) {
  if (!rows?.length) return <div className="muted">暂无数据</div>
  const columns = Object.keys(rows[0])
  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 'max-content' }}>
        <thead>
          <tr>
            {columns.map(c => <th key={c} style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 6, whiteSpace: 'nowrap' }}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {columns.map(c => <td key={c} style={{ borderBottom: '1px solid #f5f5f5', padding: 6, whiteSpace: 'nowrap' }}>{String(r[c])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Stat({ data, options, onClick }: { data: any, options?: Record<string, any>, onClick?: () => void }) {
  const value = Number(data?.stat?.value ?? 0)
  const label = data?.stat?.label ?? '指标'
  const decimals = Number(options?.decimals ?? 0)
  const suffix = options?.suffix ?? ''
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
  return (
    <div className="card stat" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--brand-accent)' }}>{formatted}{suffix}</div>
      <div className="muted" style={{ fontSize: 12 }}>{label}</div>
    </div>
  )
}

function decimate(arr: any[], max: number) {
  const a = Array.isArray(arr) ? arr : []
  if (a.length <= max) return a
  const step = Math.ceil(a.length / max)
  const out = [] as any[]
  for (let i = 0; i < a.length; i += step) out.push(a[i])
  return out
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}
