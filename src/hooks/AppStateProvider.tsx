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
  createDebouncedPersist,
  loadAppState,
  saveAppState,
  type DebouncedPersistHandle,
} from '@/storage/loadSave'
import type { AppStateV1 } from '@/types'

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
        saveAppState(next)
        const uid = latestUserIdRef.current
        if (uid) await saveAppStateToSupabase(uid, next)
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
      if (uid) {
        try {
          const remote = await fetchAppStateFromSupabase(uid)
          const local = loadAppState()
          const chosen = remoteHasUserData(remote) ? remote : local
          if (cancelled) return
          setStateInternal(chosen)
          if (!remoteHasUserData(remote)) {
            await saveAppStateToSupabase(uid, chosen)
          }
        } catch (e) {
          console.error(e)
          if (!cancelled) setStateInternal(loadAppState())
        }
      } else {
        setStateInternal(loadAppState())
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
    saveAppState(stamped)
    const uid = latestUserIdRef.current
    if (uid) void saveAppStateToSupabase(uid, stamped).catch(console.error)
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
