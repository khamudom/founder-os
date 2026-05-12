import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext, type AuthContextValue } from '@/hooks/authContext'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured()
  const [session, setSession] = useState<Session | null>(null)
  const [initialized, setInitialized] = useState(() => !configured)

  useEffect(() => {
    if (!configured) return

    const supabase = getSupabase()

    let cancelled = false
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      setSession(data.session ?? null)
      setInitialized(true)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      cancelled = true
      data.subscription.unsubscribe()
    }
  }, [configured])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      initialized,
      configured,
      signInWithPassword: async (email, password) => {
        if (!configured) return { error: 'Supabase is not configured.' }
        const { error } = await getSupabase().auth.signInWithPassword({ email, password })
        return { error: error?.message ?? null }
      },
      signUpWithPassword: async (email, password) => {
        if (!configured) return { error: 'Supabase is not configured.' }
        const { error } = await getSupabase().auth.signUp({ email, password })
        return { error: error?.message ?? null }
      },
      signInWithGoogle: async () => {
        if (!configured) return { error: 'Supabase is not configured.' }
        const redirectTo = `${window.location.origin}${window.location.pathname || '/'}`
        const { error } = await getSupabase().auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
          },
        })
        return { error: error?.message ?? null }
      },
      signOut: async () => {
        if (!configured) return
        await getSupabase().auth.signOut()
      },
    }),
    [session, initialized, configured],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
