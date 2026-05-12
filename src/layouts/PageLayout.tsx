import type { ReactNode } from 'react'
import { HeaderAuth } from '@/components/HeaderAuth'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AppNavLink } from '@/components/ui/AppNavLink'
import './PageLayout.css'

export type PageLayoutProps = {
  title?: string
  children: ReactNode
}

export function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <div className="fo-shell">
      <header className="fo-shell__header">
        <div className="fo-container fo-shell__header-inner">
          <div className="fo-shell__brand">
            <span className="fo-shell__logo" aria-hidden="true" />
            <div className="fo-shell__brand-text">
              <span className="fo-shell__name">Founder OS</span>
              <span className="fo-shell__tag">Personal accountability</span>
            </div>
          </div>
          <div className="fo-shell__header-actions">
            <nav className="fo-shell__nav" aria-label="Primary">
              <AppNavLink to="/">Dashboard</AppNavLink>
              <AppNavLink to="/duties">Duties</AppNavLink>
              <AppNavLink to="/investors">Investors</AppNavLink>
              <AppNavLink to="/events">Events</AppNavLink>
              <AppNavLink to="/weekly-update">Weekly update</AppNavLink>
              <AppNavLink to="/settings">Settings</AppNavLink>
            </nav>
            <ThemeToggle />
            <HeaderAuth />
          </div>
        </div>
      </header>

      <main className="fo-shell__main">
        <div className="fo-container fo-stack">
          {title ? (
            <header className="fo-page-title">
              <h1>{title}</h1>
            </header>
          ) : null}
          {children}
        </div>
      </main>
    </div>
  )
}
