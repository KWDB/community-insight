import { supabase } from '../lib/supabaseClient'
import { timeFilter } from '../lib/time'
import { sumByKeys } from '../lib/queryUtils'

export async function query({ range }: { range: { from: Date, to: Date } }) {
  const { gte, lte } = timeFilter('timestamp', range)
  
  // 增加分页逻辑，防止数据量大时被静默截断
  let allData: any[] = []
  let fromIndex = 0
  const pageSize = 1000
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase
      .from('github_clones')
      .select('clone_count')
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

  // 聚合 clone_count 的总和
  const total = sumByKeys(allData, ['clone_count'])
  
  return { stat: { value: total, label: `GitHub 指定时间段克隆量` } }
}