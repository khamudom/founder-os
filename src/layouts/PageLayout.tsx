import type { ReactNode } from 'react'
import { HeaderMenuDrawer } from '@/components/HeaderMenuDrawer'
import { PrimaryNav } from '@/components/PrimaryNav'
import './PageLayout.css'

export type PageLayoutProps = {
  title?: string
  children: ReactNode
  /** Omits app navigation and account controls (sign-in–only shell). */
  authShell?: boolean
}

export function PageLayout({ title, children, authShell = false }: PageLayoutProps) {
  return (
    <div className="fo-shell">
      <header className={`fo-shell__header${authShell ? ' fo-shell__header--auth' : ''}`}>
        <div className="fo-container fo-shell__header-inner">
          <div className="fo-shell__brand">
            <span className="fo-shell__name">Founder OS</span>
          </div>
          <div className="fo-shell__header-actions">
            {authShell ? null : (
              <nav className="fo-shell__nav fo-shell__nav--desktop" aria-label="Primary">
                <PrimaryNav />
              </nav>
            )}
            <HeaderMenuDrawer showPrimaryNav={!authShell} showAccount={!authShell} />
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
