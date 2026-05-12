import { migrate } from '@/storage/migrate'
import { STORAGE_KEY, createDefaultState } from '@/storage/schema'
import type { AppStateV1 } from '@/types'

export function loadAppState(): AppStateV1 {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultState()
    const parsed: unknown = JSON.parse(raw)
    return migrate(parsed)
  } catch {
    return createDefaultState()
  }
}

export function saveAppState(state: AppStateV1): void {
  const next: AppStateV1 = {
    ...state,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

const DEBOUNCE_MS = 400

/** Debounced persist hook used when cloud sync should run after local save. */
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
