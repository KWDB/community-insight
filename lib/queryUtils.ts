/**
 * Line point structure normalized for chart rendering
 */
export type LinePoint = { date: string; count: number }

/**
 * Normalize arbitrary rows into `{date, count}` series for line/area/bar charts
 * - xKey: the time field name in rows, defaults to 'date'
 * - yKeys: candidate numeric fields for y value, defaults to ['download_count','count']
 */
export function normalizeSeries(
  rows: any[],
  opts: { xKey?: string; yKeys?: string[] } = {}
): LinePoint[] {
  const xKey = opts.xKey ?? 'date'
  const yKeys = opts.yKeys ?? ['download_count', 'count']
  const arr = Array.isArray(rows) ? rows : []
  return arr
    .map((r: any) => ({
      date: r?.[xKey],
      count: Number(yKeys.find(k => r?.[k] != null) ? r?.[yKeys.find(k => r?.[k] != null) as string] : 0) || 0
    }))
    .filter(p => !!p.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

/**
 * Extract a numeric value from an RPC result payload
 * - Supports object or array payloads; when array, uses the first element
 */
export function extractFromRpc<T extends Record<string, any>>(data: T | T[], key: string): number {
  const src = Array.isArray(data) ? (data[0] ?? {}) : (data ?? {})
  return Number(src?.[key] ?? 0) || 0
}

/**
 * Sum across rows by first available key from the provided list
 * - For each row, takes the first matching key present and adds its numeric value
 */
export function sumByKeys(rows: any[], keys: string[]): number {
  const arr = Array.isArray(rows) ? rows : []
  return arr.reduce((sum: number, row: any) => {
    const k = keys.find(key => row?.[key] != null)
    const v = Number(k ? row?.[k!] : 0) || 0
    return sum + v
  }, 0)
}

/**
 * @deprecated Use `normalizeSeries(rows, { xKey: 'date', yKeys: ['download_count','count'] })` instead
 */
export function normalizeLine(rows: any[]): LinePoint[] {
  return normalizeSeries(rows)
}

/**
 * @deprecated Use `extractFromRpc(data, 'total')` instead
 */
export function extractTotalFromRpc(data: any): number {
  return extractFromRpc(data, 'total')
}

/**
 * @deprecated Use `sumByKeys(rows, ['total','count'])` instead
 */
export function sumTotalFromRows(rows: any[]): number {
  return sumByKeys(rows, ['total', 'count'])
}

/**
 * @deprecated Use `sumByKeys(rows, ['docker_downloads'])` instead
 */
export function sumDockerDownloads(rows: any[]): number {
  return sumByKeys(rows, ['docker_downloads'])
}
