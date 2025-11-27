export type ChartConfig = {
  id: string
  title: string
  description?: string
  queryModule: string
  viz: 'line' | 'bar' | 'area' | 'table' | 'stat'
  options?: Record<string, any>
  defaultTimeRange?: { from: string; to: string }
  refreshSec?: number
  section?: string
  order?: number
  colSpan?: number
}

export type Dashboard = { id: string; title: string; description?: string; charts: ChartConfig[] }
export type Manifest = { dashboards: Dashboard[] }
