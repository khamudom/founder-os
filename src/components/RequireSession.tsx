import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function RequireSession({ children }: { children: ReactNode }) {
  const { session, configured } = useAuth()
  const location = useLocation()

  if (!configured) {
    return children
  }

  if (!session) {
    const from = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to="/sign-in" replace state={{ from }} />
  }

  return children
}
