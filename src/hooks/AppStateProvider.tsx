import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AppStateContext } from '@/hooks/appStateContext'
import { useAuth } from '@/hooks/useAuth'
import {
  fetchAppStateFromSupabase,
  remoteHasUserData,
  saveAppStateToSupabase,
} from '@/lib/supabase/sync'
import {
  clearLegacyLocalAppState,
  createDebouncedPersist,
  readLegacyLocalAppStateOnce,
  type DebouncedPersistHandle,
} from '@/storage/loadSave'
import { createDefaultState } from '@/storage/schema'
import type { AppStateV1 } from '@/types'

function logPersistError(context: string, e: unknown): void {
  if (e && typeof e === 'object' && 'message' in e) {
    const err = e as { message: string; code?: string; details?: string; hint?: string }
    console.error(context, {
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint,
    })
    return
  }
  console.error(context, e)
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { session, initialized } = useAuth()

  const latestUserIdRef = useRef<string | null>(null)
  useEffect(() => {
    latestUserIdRef.current = session?.user.id ?? null
  }, [session?.user.id])

  const debouncedRef = useRef<DebouncedPersistHandle | null>(null)

  useEffect(() => {
    const deb = createDebouncedPersist({
      persist: async (next) => {
        const uid = latestUserIdRef.current
        if (!uid) return
        try {
          await saveAppStateToSupabase(uid, next)
        } catch (e) {
          logPersistError('Failed to save app state to Supabase', e)
        }
      },
    })
    debouncedRef.current = deb
    return () => {
      void deb.flush()
      deb.cancel()
      debouncedRef.current = null
    }
  }, [])

  const [state, setStateInternal] = useState<AppStateV1 | null>(null)

  useEffect(() => {
    if (!initialized) return
    let cancelled = false
    void (async () => {
      const uid = session?.user?.id
      if (!uid) {
        if (!cancelled) setStateInternal(createDefaultState())
        return
      }

      try {
        const remote = await fetchAppStateFromSupabase(uid)
        let nextState = remote

        if (!remoteHasUserData(remote)) {
          const legacy = readLegacyLocalAppStateOnce()
          if (legacy && remoteHasUserData(legacy)) {
            try {
              await saveAppStateToSupabase(uid, legacy)
              nextState = legacy
              clearLegacyLocalAppState()
            } catch (e) {
              logPersistError('Failed to migrate legacy browser data to Supabase', e)
              nextState = legacy
            }
          }
        } else {
          clearLegacyLocalAppState()
        }

        if (!cancelled) setStateInternal(nextState)
      } catch (e) {
        logPersistError('Failed to load app state from Supabase', e)
        if (!cancelled) setStateInternal(createDefaultState())
      }
    })()
    return () => {
      cancelled = true
    }
  }, [initialized, session?.user?.id])

  useEffect(() => {
    debouncedRef.current?.cancel()
  }, [session?.user?.id])

  const setState = useCallback((updater: (prev: AppStateV1) => AppStateV1) => {
    setStateInternal((prev) => {
      if (!prev) return prev
      const next = updater(prev)
      debouncedRef.current?.schedule(next)
      return next
    })
  }, [])

  const replaceState = useCallback((next: AppStateV1) => {
    debouncedRef.current?.cancel()
    const stamped: AppStateV1 = { ...next, updatedAt: new Date().toISOString() }
    setStateInternal(stamped)
    const uid = latestUserIdRef.current
    if (uid) void saveAppStateToSupabase(uid, stamped).catch((e) => logPersistError('replaceState → Supabase save failed', e))
  }, [])

  const flushPersist = useCallback(async () => {
    await debouncedRef.current?.flush()
  }, [])

  useEffect(() => {
    const onUnload = () => {
      void debouncedRef.current?.flush()
    }
    window.addEventListener('beforeunload', onUnload)
    return () => {
      window.removeEventListener('beforeunload', onUnload)
      void debouncedRef.current?.flush()
    }
  }, [])

  if (!initialized || state === null) {
    return (
      <div className="fo-app-loading">
        <p style={{ margin: 0 }}>Loading…</p>
      </div>
    )
  }

  return (
    <AppStateContext.Provider value={{ state, setState, replaceState, flushPersist }}>
      {children}
    </AppStateContext.Provider>
  )
}
