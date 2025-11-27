import { supabase } from '../lib/supabaseClient'
import { timeFilter } from '../lib/time'
import { sumByKeys } from '../lib/queryUtils'

export async function query({ range }: { range: { from: Date, to: Date } }) {
  const { gte, lte } = timeFilter('date', range)
  const { data, error } = await supabase.rpc('calculate_github_release_download_increment', { p_time_from: gte, p_time_to: lte })
  if (error) throw error
  const total = sumByKeys(data, ['docker_downloads'])
  return { stat: { value: total, label: `GitHub 指定时间段下载量` } }
}
