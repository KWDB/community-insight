'use client'
import React, { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { resolveRange, useTimeRange } from '../lib/time'
import { CalendarDays } from 'lucide-react'

const PRESETS = [
  // { value: 'now-5m', label: '近5分钟' },
  // { value: 'now-15m', label: '近15分钟' },
  // { value: 'now-1h', label: '近1小时' },
  // { value: 'now-6h', label: '近6小时' },
  { value: 'now-24h', label: '近24小时' },
  { value: 'now-7d', label: '近7天' },
  { value: 'now-30d', label: '近30天' },
  { value: 'now-90d', label: '近3个月' },
  { value: 'now-180d', label: '近6个月' },
  { value: 'now-365d', label: '近1年' },
  { value: 'now-730d', label: '近2年' },
]

export default function TimeRangePicker() {
  const { range, setRange } = useTimeRange()
  const [open, setOpen] = useState(false)
  const [absFrom, setAbsFrom] = useState<string>('')
  const [absTo, setAbsTo] = useState<string>('')
  const label = useMemo(() => {
    const p = PRESETS.find(p => p.value === range.preset)
    if (p) return p.label
    const f = range.from.toLocaleString()
    const t = range.to.toLocaleString()
    return `${f} ~ ${t}`
  }, [range])

  const detailed = useMemo(() => {
    const f = dayjs(range.from).format('YYYY-MM-DD HH:mm')
    const t = dayjs(range.to).format('YYYY-MM-DD HH:mm')
    return `${label} · ${f} ~ ${t}`
  }, [label, range])

  const applyPreset = (v: string) => {
    setRange(resolveRange(v))
    setOpen(false)
  }

  const applyAbsolute = () => {
    if (!absFrom || !absTo) return
    const from = new Date(absFrom)
    const to = new Date(absTo)
    if (isNaN(from.getTime()) || isNaN(to.getTime())) return
    setRange({ from, to, preset: 'custom' })
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} className="btn pill btn-range" aria-label="时间范围">
        <CalendarDays size={16} aria-hidden="true" />
        <span suppressHydrationWarning>{detailed}</span>
      </button>
      {open && (
        <>
          <div className="backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="panel">
            <div className="range-picker-grid">
              <div>
                <div className="muted" style={{ fontSize: '0.75rem', marginBottom: '0.375rem' }}>快速选择</div>
                <div style={{ display: 'grid', gap: '0.375rem' }}>
                  {PRESETS.map(p => (
                    <button key={p.value} onClick={() => applyPreset(p.value)} className="btn pill" style={{ background: range.preset === p.value ? 'rgba(59,130,246,0.12)' : 'var(--card-bg)' }}>{p.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="muted" style={{ fontSize: '0.75rem', marginBottom: '0.375rem' }}>自定义范围</div>
                <div style={{ display: 'grid', gap: '0.375rem' }}>
                  <input type="datetime-local" value={absFrom} onChange={e => setAbsFrom(e.target.value)} className="btn" style={{ padding: '0.375rem 0.625rem' }} />
                  <input type="datetime-local" value={absTo} onChange={e => setAbsTo(e.target.value)} className="btn" style={{ padding: '0.375rem 0.625rem' }} />
                  <button onClick={applyAbsolute} className="btn" style={{ background: 'var(--brand-neutral)', color: '#fff' }}>应用</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
