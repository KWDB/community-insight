import { supabase } from '../lib/supabaseClient'

export async function fetchLatestDownloadTime(): Promise<{ ts?: string }> {
  const { data, error } = await supabase.rpc('get_latest_download_stat_time')
  if (error) throw error
  if (Array.isArray(data)) return { ts: data[0] as string }
  if (typeof data === 'string') return { ts: data }
  if (typeof data === 'object' && data !== null && 'ts' in data) return { ts: (data as any).ts as string }
  return { ts: undefined }
}
