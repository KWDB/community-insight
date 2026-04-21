import { supabase } from '../lib/supabaseClient'
import { timeFilter } from '../lib/time'
import { normalizeSeries } from '../lib/queryUtils'

export async function query({ range }: { range: { from: Date, to: Date } }) {
  const { gte, lte } = timeFilter('timestamp', range)
  
  // Supabase 前端 API 原生不支持 GROUP BY
  // 增加分页逻辑，防止大量数据被默认 limit(1000) 截断
  let allData: any[] = []
  let fromIndex = 0
  const pageSize = 1000
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase
      .from('github_clones')
      .select('timestamp, clone_count')
      .eq('repo_name', 'KWDB/KWDB')
      .gte('timestamp', gte)
      .lt('timestamp', lte)
      .range(fromIndex, fromIndex + pageSize - 1)

    if (error) throw error

    if (data && data.length > 0) {
      allData = allData.concat(data)
      fromIndex += pageSize
      if (data.length < pageSize) {
        hasMore = false
      }
    } else {
      hasMore = false
    }
  }

  // 在前端进行按天 (YYYY-MM-DD) 分组聚合 SUM(clone_count)
  const dailyMap: Record<string, number> = {}
  
  if (allData.length > 0) {
    for (const row of allData) {
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

  const series = normalizeSeries(aggregatedRows)
  
  return { series }
}