'use client'
import React, { useEffect, useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type { ChartConfig } from '../lib/types'
import { useTimeRange } from '../lib/time'
import { QUERIES } from '../queries'
import { getCache, setCache } from '../lib/dataCache'

export default function ChartRenderer({ chart, refreshSignal = 0 }: { chart: ChartConfig, refreshSignal?: number }) {
  const { range } = useTimeRange()
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const option = useMemo(() => {
    const series = (data?.series ?? []) as any[]
    const xKey = chart.options?.xKey || 'date'
    const yKey = chart.options?.yKey || 'value'
    const colors = ['#3b82f6', '#93c5fd', '#1d4ed8']
    const ds = series.length > 0 ? decimate(series, 4000) : []
    return {
      color: colors,
      grid: { left: 40, right: 20, top: 20, bottom: 40, containLabel: true },
      tooltip: { trigger: 'axis' },
      toolbox: { feature: { dataZoom: {}, restore: {}, saveAsImage: {} } },
      dataZoom: [{ type: 'inside' }, { type: 'slider' }],
      xAxis: { type: 'category', data: ds.map((d: any) => d[xKey]), axisLabel: { interval: 'auto', color: '#4b5563' } },
      yAxis: { type: 'value', axisLabel: { color: '#4b5563' } },
      series: [{ type: chart.viz === 'bar' ? 'bar' : 'line', data: ds.map((d: any) => d[yKey]), smooth: true, lineStyle: { width: 2 } }],
      animation: true
    }
  }, [chart, data])

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

  if (loading) return <div className="skeleton" />
  if (error) return <div style={{ color: 'crimson' }}>错误：{error}</div>
  const isEmpty = !data || (chart.viz === 'stat' ? !data.stat : (!data.series && !data.rows))
  if (isEmpty) return <div className="muted">暂无数据</div>
  if (chart.viz === 'stat') return <Stat data={data} options={chart.options} />
  if (chart.viz === 'table') return <Table rows={data.rows} />
  return <ReactECharts option={option} style={{ height: 280 }} />
}

function Table({ rows }: { rows: any[] }) {
  if (!rows?.length) return <div className="muted">暂无数据</div>
  const columns = Object.keys(rows[0])
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {columns.map(c => <th key={c} style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 6 }}>{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {columns.map(c => <td key={c} style={{ borderBottom: '1px solid #f5f5f5', padding: 6 }}>{String(r[c])}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Stat({ data, options }: { data: any, options?: Record<string, any> }) {
  const value = Number(data?.stat?.value ?? 0)
  const label = data?.stat?.label ?? '指标'
  const decimals = Number(options?.decimals ?? 0)
  const suffix = options?.suffix ?? ''
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
  return (
    <div className="card stat" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
