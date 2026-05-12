import { migrate } from '@/storage/migrate'
import { STORAGE_KEY } from '@/storage/schema'
import type { AppStateV1 } from '@/types'

/** One-time read of pre–cloud-sync browser data (`founder-os.app.v1`). Does not remove the key. */
export function readLegacyLocalAppStateOnce(): AppStateV1 | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return migrate(parsed)
  } catch {
    return null
  }
}

export function clearLegacyLocalAppState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore quota / private mode */
  }
}

const DEBOUNCE_MS = 400

/** Debounced persistence to Supabase (or other async backends). */
export type DebouncedPersistHandle = {
  schedule: (state: AppStateV1) => void
  flush: () => Promise<void>
  cancel: () => void
}

export function createDebouncedPersist(options: {
  debounceMs?: number
  persist: (state: AppStateV1) => void | Promise<void>
}): DebouncedPersistHandle {
  const debounceMs = options.debounceMs ?? DEBOUNCE_MS
  let timer: ReturnType<typeof setTimeout> | undefined
  let last: AppStateV1 | undefined

  const flush = async () => {
    if (timer) {
      clearTimeout(timer)
      timer = undefined
    }
    if (last) {
      const snapshot = last
      last = undefined
      await options.persist(snapshot)
    }
  }

  const schedule = (state: AppStateV1) => {
    last = state
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      void flush()
    }, debounceMs)
  }

  const cancel = () => {
    if (timer) clearTimeout(timer)
    timer = undefined
    last = undefined
  }

  return { schedule, flush, cancel }
}
