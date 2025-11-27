import { supabase } from '../lib/supabaseClient'
import { timeFilter } from '../lib/time'
import { sumByKeys } from '../lib/queryUtils'

export async function query({ range }: { range: { from: Date, to: Date } }) {
  const { gte, lte } = timeFilter('date', range)
  const { data, error } = await supabase.rpc('get_gitee_activities_count', { 
    p_repositories: ['kwdb/kwdb','kwdb/kwdb-mcp-server','kwdb/kw-vendor','kwdb/kw-cdeps','kwdb/kw-third_party','kwdb/docs','kwdb/community','kwdb/sampledb','kwdb/kwdb-tsbs'], 
    p_operations: ['SSH PULL','HTTP PULL','DOWNLOAD ZIP','HTTP ACCESS'], 
    p_start_time: gte, 
    p_end_time: lte })
  if (error) throw error
  const total = sumByKeys(data, ['gitee_count'])
  return { stat: { value: total, label: `Gitee 指定时间段克隆量` } }
}
