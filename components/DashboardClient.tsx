'use client'
import React, { useState } from 'react'
import { clearAll } from '../lib/dataCache'
import { RefreshCw, Star, TrendingUp, BarChart3 } from 'lucide-react'
import { TimeRangeProvider } from '../lib/time'
import TimeRangePicker from './TimeRangePicker'
import ChartRenderer from './ChartRenderer'
import LatestUpdate from './LatestUpdate'
import GiteeLatestUpdate from './GiteeLatestUpdate'

import { ICON_MAP } from './ChartRenderer'

export default function DashboardClient({ dashboard }: { dashboard: { id: string; title: string; description?: string; charts: any[] } }) {
  const [refreshSignal, setRefreshSignal] = useState<number>(0)
  const chartsWithDefaults = dashboard.charts.map((c: any) => ({
    ...c,
    section: c.section ?? (c.viz === 'stat' ? 'period_downloads' : 'trends'),
    order: c.order ?? 0,
    colSpan: c.colSpan ?? 1
  }))
  const groups = groupBy(chartsWithDefaults, 'section')
  return (
    <TimeRangeProvider>
      <div className="subheader">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h2 className="title" style={{ fontSize: '1.125rem' }}>{dashboard.title}</h2>
          <span className="badge">实时</span>
        </div>
        <div className="actions">
          <TimeRangePicker />
          <button className="icon-btn" aria-label="刷新全部" onClick={() => { clearAll(); setRefreshSignal(v => v + 1) }}>
            <RefreshCw size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="meta-list">
        <LatestUpdate refreshSignal={refreshSignal} />
        <GiteeLatestUpdate refreshSignal={refreshSignal} />
      </div>

      {Object.entries(groups)
        .sort(([nameA], [nameB]) => {
          const SECTION_ORDER = ['total_downloads', 'period_downloads', 'trends']
          const indexA = SECTION_ORDER.indexOf(nameA)
          const indexB = SECTION_ORDER.indexOf(nameB)
          return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
        })
        .map(([name, list]) => (
        <div key={name}>
          <div className="section-title">{sectionIcon(name)} {sectionTitle(name)}</div>
          <div className="grid">
            {list.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)).map((chart: any) => (
              <div className="card" key={chart.id} style={{ gridColumn: `span ${chart.colSpan}` }}>
                {chart.viz !== 'stat' && (
                  <h3 style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {chart.icon && ICON_MAP[chart.icon] && React.createElement(ICON_MAP[chart.icon], { size: 18 })}
                    {chart.title}
                  </h3>
                )}
                <ChartRenderer chart={chart} refreshSignal={refreshSignal} />
              </div>
            ))}
          </div>
          <div className="divider" />
        </div>
      ))}
    </TimeRangeProvider>
  )
}

function groupBy(arr: any[], key: string) {
  return arr.reduce((acc: Record<string, any[]>, item) => {
    const k = item[key] ?? 'default'
    acc[k] = acc[k] || []
    acc[k].push(item)
    return acc
  }, {})
}

function sectionTitle(name: string) {
  if (name === 'total_downloads') return '总下载量'
  if (name === 'period_downloads') return '指定时间段下载量'
  if (name === 'trends') return '趋势与分布'
  return name
}

function sectionIcon(name: string) {
  if (name === 'total_downloads' || name === 'period_downloads') return <Star size={16} aria-hidden="true" />
  if (name === 'trends') return <TrendingUp size={16} aria-hidden="true" />
  return <BarChart3 size={16} aria-hidden="true" />
}
