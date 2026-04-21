import { supabase } from '../lib/supabaseClient'
import { sumByKeys } from '../lib/queryUtils'

export async function query({ range }: { range: { from: Date, to: Date } }) {
  const { data, error } = await supabase
    .from('download_statistics')
    .select('github_releases')
    .gte('stat_time', range.from.toISOString())
    .lte('stat_time', range.to.toISOString())
    .order('stat_time', { ascending: false })
    .limit(1)
    
  if (error) throw error
  const total = sumByKeys(data, ['github_releases'])
  return { stat: { value: total, label: 'Github 总下载量' } }
}