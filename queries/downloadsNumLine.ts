import { supabase } from '../lib/supabaseClient'
import { timeFilter } from '../lib/time'
import { normalizeSeries } from '../lib/queryUtils'

export async function query({ range }: { range: { from: Date, to: Date } }) {
  const { gte, lte } = timeFilter('date', range)
  const { data, error } = await supabase.rpc('get_repository_downloads_line', {
    p_repository: 'kwdb/kwdb',
    p_start_date: gte,
    p_end_date: lte
  })
  if (error) throw error
  const series = normalizeSeries(data)
  return { series }
}
