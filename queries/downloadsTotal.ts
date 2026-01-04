import { supabase } from '../lib/supabaseClient'
import dayjs from 'dayjs'

// 查询下载总量指标（Stat）：自动获取并显示所选日期范围内最新日期（精确到年月日）对应的total数值
export async function query({ range }: { range: { from: Date, to: Date } }) {
  const { data, error } = await supabase
    .from('download_statistics')
    .select('total, stat_time')
    .gte('stat_time', range.from.toISOString())
    .lte('stat_time', range.to.toISOString())
    .order('stat_time', { ascending: false })
    .limit(1)

  if (error) throw error

  // 如果查询结果为空，返回明确的空值提示
  if (!data || data.length === 0) {
    return { stat: null }
  }

  const latest = data[0]

  return { 
    stat: { 
      value: latest.total, 
      label: '总下载量',
      date: dayjs(latest.stat_time).format('YYYY-MM-DD')
    } 
  }
}
