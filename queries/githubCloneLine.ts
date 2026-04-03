import { supabase } from '../lib/supabaseClient'
import { timeFilter } from '../lib/time'
import { normalizeSeries } from '../lib/queryUtils'

export async function query({ range }: { range: { from: Date, to: Date } }) {
  const { gte, lte } = timeFilter('timestamp', range)
  
  // Supabase 前端 API 原生不支持 GROUP BY
  // 为了不依赖后端新增 RPC，这里我们将指定时间范围内的原始明细拉取到前端，在前端进行按天聚合
  const { data, error } = await supabase
    .from('github_clones')
    .select('timestamp, clone_count')
    .eq('repo_name', 'KWDB/KWDB')
    .gte('timestamp', gte)
    .lt('timestamp', lte)

  if (error) throw error

  // 在前端进行按天 (YYYY-MM-DD) 分组聚合 SUM(clone_count)
  const dailyMap: Record<string, number> = {}
  
  if (data) {
    for (const row of data) {
      if (!row.timestamp) continue
      // 将 ISO 字符串截取前 10 位作为日期 (YYYY-MM-DD)
      const date = row.timestamp.split('T')[0]
      const count = Number(row.clone_count) || 0
      
      if (!dailyMap[date]) {
        dailyMap[date] = 0
      }
      dailyMap[date] += count
    }
  }

  // 将 Map 转换为数组格式供 normalizeSeries 消费
  const aggregatedRows = Object.entries(dailyMap).map(([date, count]) => ({
    date,
    count
  }))

  // 使用现有的 normalizeSeries 确保数据按照时间正序排列
  const series = normalizeSeries(aggregatedRows)
  
  return { series }
}