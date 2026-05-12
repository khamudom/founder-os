import type { MouseEventHandler } from 'react'
import { AppNavLink } from '@/components/ui/AppNavLink'

export type PrimaryNavProps = {
  onNavigate?: () => void
}

export function PrimaryNav({ onNavigate }: PrimaryNavProps) {
  const wrapClick: MouseEventHandler<HTMLAnchorElement> | undefined = onNavigate
    ? () => onNavigate()
    : undefined

  return (
    <>
      <AppNavLink to="/" onClick={wrapClick}>
        Dashboard
      </AppNavLink>
      <AppNavLink to="/duties" onClick={wrapClick}>
        Duties
      </AppNavLink>
      <AppNavLink to="/investors" onClick={wrapClick}>
        Investors
      </AppNavLink>
      <AppNavLink to="/events" onClick={wrapClick}>
        Events
      </AppNavLink>
      <AppNavLink to="/weekly-update" onClick={wrapClick}>
        Weekly update
      </AppNavLink>
      <AppNavLink to="/settings" onClick={wrapClick}>
        Settings
      </AppNavLink>
    </>
  )
}
