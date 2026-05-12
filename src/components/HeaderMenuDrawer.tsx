import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { HeaderAuth } from '@/components/HeaderAuth'
import { PrimaryNav } from '@/components/PrimaryNav'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/Button'
import './HeaderMenuDrawer.css'

function IconMenu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M4 7h16M4 12h16M4 17h16"
      />
    </svg>
  )
}

export type HeaderMenuDrawerProps = {
  /** Primary routes (hidden in drawer at larger breakpoints). */
  showPrimaryNav?: boolean
  /** When false (e.g. minimal auth shell), the drawer only lists appearance (theme). */
  showAccount?: boolean
}

export function HeaderMenuDrawer({ showPrimaryNav = true, showAccount = true }: HeaderMenuDrawerProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const prevActive = useRef<Element | null>(null)

  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  useEffect(() => {
    if (open) {
      prevActive.current = document.activeElement
      queueMicrotask(() => closeRef.current?.focus())
    } else {
      const node = prevActive.current
      if (node instanceof HTMLElement) queueMicrotask(() => node.focus())
    }
  }, [open])

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="fo-header-menu-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <IconMenu />
      </Button>
      {open
        ? createPortal(
            <div className="fo-header-drawer-root">
              <button
                type="button"
                className="fo-header-drawer-backdrop"
                aria-label="Close menu"
                onClick={close}
              />
              <div
                id={panelId}
                className="fo-header-drawer-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
              >
                <header className="fo-header-drawer__head">
                  <h2 id={titleId} className="fo-header-drawer__title">
                    Menu
                  </h2>
                  <button
                    ref={closeRef}
                    type="button"
                    className="fo-header-drawer__close"
                    aria-label="Close menu"
                    onClick={close}
                  >
                    ×
                  </button>
                </header>
                <div className="fo-header-drawer__body fo-stack">
                  {showPrimaryNav ? (
                    <nav className="fo-header-drawer__nav" aria-label="Primary">
                      <PrimaryNav onNavigate={close} />
                    </nav>
                  ) : null}
                  <div className="fo-header-drawer__row">
                    <span className="fo-header-drawer__label">Theme</span>
                    <ThemeToggle />
                  </div>
                  {showAccount ? (
                    <HeaderAuth drawer onDrawerClose={close} />
                  ) : null}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  )
}
