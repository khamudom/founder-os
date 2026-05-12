import { NavLink } from 'react-router-dom'
import type { MouseEventHandler, ReactNode } from 'react'
import './AppNavLink.css'

export type AppNavLinkProps = {
  to: string
  children: ReactNode
  end?: boolean
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

export function AppNavLink({ to, children, end, onClick }: AppNavLinkProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `fo-nav-link ${isActive ? 'fo-nav-link--active' : ''}`.trim()
      }
    >
      {children}
    </NavLink>
  )
}
