import React from 'react'
import { loadManifest } from '@/lib/serverManifest'
import DashboardClient from '@/components/DashboardClient'

export default function DashboardPage({ params }: { params: { id: string } }) {
  const manifest = loadManifest()
  const dashboard = manifest.dashboards.find(d => d.id === params.id)
  if (!dashboard) return <div className="card">未找到该仪表盘</div>
  return <DashboardClient dashboard={dashboard} />
}
