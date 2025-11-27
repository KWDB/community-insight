import { supabase } from '../lib/supabaseClient'
import { timeFilter } from '../lib/time'
import { sumByKeys } from '../lib/queryUtils'

// 查询下载总量指标（Stat）：优先使用后端 RPC；否则回退为视图聚合求和
export async function query({ range }: { range: { from: Date, to: Date } }) {
  const { data, error } = await supabase
    .from('download_statistics')
    .select('github_releases')
    .order('stat_time', { ascending: false })
    .limit(1)
  if (error) throw error
  const total = sumByKeys(data, ['github_releases'])
  return { stat: { value: total, label: 'Github 总下载量' } }
}
