type CacheEntry<T> = { value: T; expiresAt: number }
const store = new Map<string, CacheEntry<any>>()

export function getCache<T>(key: string): T | null {
  const e = store.get(key)
  if (!e) return null
  if (Date.now() > e.expiresAt) { store.delete(key); return null }
  return e.value as T
}

export function setCache<T>(key: string, value: T, ttlSec: number) {
  const expiresAt = Date.now() + Math.max(ttlSec, 1) * 1000
  store.set(key, { value, expiresAt })
}

export function clearAll() {
  store.clear()
}
