import React from 'react'
import { loadManifest } from '@/lib/serverManifest'
import DashboardClient from '@/components/DashboardClient'

export default function HomePage() {
  const manifest = loadManifest()
  const dashboard = manifest.dashboards.find(d => d.id === 'community') || manifest.dashboards[0]
  
  if (!dashboard) {
    return <div className="card">未找到该仪表盘</div>
  }
  
  return <DashboardClient dashboard={dashboard} />
}
