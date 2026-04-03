import { supabase } from '../lib/supabaseClient'
import { timeFilter } from '../lib/time'
import { sumByKeys } from '../lib/queryUtils'

export async function query({ range }: { range: { from: Date, to: Date } }) {
  const { gte, lte } = timeFilter('timestamp', range)
  
  // 参考提供的 SQL：
  // SELECT SUM(clone_count) as total_clones_in_period FROM github_clones 
  // WHERE repo_name = 'KWDB/KWDB' AND timestamp >= gte AND timestamp < lte;
  
  const { data, error } = await supabase
    .from('github_clones')
    .select('clone_count')
    .eq('repo_name', 'KWDB/KWDB')
    .gte('timestamp', gte)
    .lt('timestamp', lte) // SQL 中使用的是 < lte

  if (error) throw error

  // 聚合 clone_count 的总和
  const total = sumByKeys(data, ['clone_count'])
  
  return { stat: { value: total, label: `GitHub 指定时间段克隆量` } }
}