import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import './AppNavLink.css'

export type AppNavLinkProps = {
  to: string
  children: ReactNode
  end?: boolean
}

export function AppNavLink({ to, children, end }: AppNavLinkProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `fo-nav-link ${isActive ? 'fo-nav-link--active' : ''}`.trim()
      }
    >
      {children}
    </NavLink>
  )
}
