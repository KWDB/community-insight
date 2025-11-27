import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import type { Dashboard, Manifest } from './types'

const chartsDir = path.join(process.cwd(), 'charts')

export function loadManifest(): Manifest {
  const dashboards: Dashboard[] = []
  // 简化：单一仪表盘，自动加载目录下所有 yaml 为图表
  const files = fs.existsSync(chartsDir) ? fs.readdirSync(chartsDir).filter(f => f.endsWith('.yaml')) : []
  const charts = files.map(f => ({ ...YAML.parse(fs.readFileSync(path.join(chartsDir, f), 'utf-8')) }))
  dashboards.push({ id: 'community', title: 'KWDB 社区仪表盘', description: '实时查询 KWDB 社区相关指标', charts })
  return { dashboards }
}
