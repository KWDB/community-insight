import { supabase } from '../lib/supabaseClient'
import { timeFilter } from '../lib/time'
import { normalizeSeries } from '../lib/queryUtils'

export async function query({ range }: { range: { from: Date, to: Date } }) {
  const { gte, lte } = timeFilter('date', range)
  const { data, error } = await supabase.rpc('get_gitee_operations_by_date', {
    p_start_time: gte,
    p_end_time: lte
  })
  if (error) throw error
  const series = normalizeSeries(data)
  return { series }
}
