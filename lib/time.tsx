'use client'
import React, { createContext, useContext, useMemo, useState } from 'react'
import dayjs from 'dayjs'

export type TimeRange = { from: Date, to: Date, preset?: string }

const TimeRangeContext = createContext<{range: TimeRange, setRange: (r: TimeRange) => void} | null>(null)

export function TimeRangeProvider({ children }: { children: React.ReactNode }) {
  const [range, setRange] = useState<TimeRange>(() => resolveRange('now-30d'))
  const value = useMemo(() => ({ range, setRange }), [range])
  return <TimeRangeContext.Provider value={value}>{children}</TimeRangeContext.Provider>
}

const DEFAULT_CTX = { range: resolveRange('now-30d'), setRange: () => {} }
export function useTimeRange() {
  const ctx = useContext(TimeRangeContext)
  return ctx ?? DEFAULT_CTX
}

// 接收 Grafana 风格的 preset，计算具体时间范围
export function resolveRange(preset: string): TimeRange {
  const to = dayjs()
  const m = /^now-(\d+)([smhdw])$/.exec(preset)
  if (m) {
    const n = parseInt(m[1], 10)
    const u = m[2] === 's' ? 'second' : m[2] === 'm' ? 'minute' : m[2] === 'h' ? 'hour' : m[2] === 'd' ? 'day' : 'week'
    const from = to.subtract(n, u)
    return { from: from.toDate(), to: to.toDate(), preset }
  }
  const from = to.subtract(1, 'day')
  return { from: from.toDate(), to: to.toDate(), preset }
}

// 生成列的时间过滤边界（gte/lte）
export function timeFilter(column: string, range: TimeRange) {
  return { column, gte: range.from.toISOString(), lte: range.to.toISOString() }
}

// 语义兼容函数名（供查询模块使用）
export const __timeFilter = timeFilter
