'use client'
import React from 'react'
import Link from 'next/link'
import { TimeRangeProvider } from '../lib/time'
import TimeRangePicker from './TimeRangePicker'

export default function HomeClient({ manifest }: { manifest: { dashboards: { id: string; title: string; description?: string }[] } }) {
  return (
    <TimeRangeProvider>
      <div className="subheader">
        <span className="muted">选择时间范围以查看所有仪表盘</span>
        <TimeRangePicker />
      </div>
      <div className="grid">
        {manifest.dashboards.map(d => (
          <div key={d.id} className="card">
            <h3 className="title" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{d.title}</h3>
            <p className="muted" style={{ marginBottom: '0.75rem' }}>{d.description}</p>
            <Link href={`/dashboards/${d.id}`}>进入仪表盘 →</Link>
          </div>
        ))}
      </div>
    </TimeRangeProvider>
  )
}
