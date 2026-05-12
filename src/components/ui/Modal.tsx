import { useEffect, useRef, type ReactNode } from 'react'
import './Modal.css'

export type ModalProps = {
  open: boolean
  title: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
}

export function Modal({ open, title, children, footer, onClose }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const prevActive = useRef<Element | null>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return

    if (open) {
      prevActive.current = document.activeElement
      if (!el.open) el.showModal()
    } else if (el.open) {
      el.close()
    }
  }, [open])

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return

    const onCancel = (e: Event) => {
      e.preventDefault()
      onClose()
    }

    el.addEventListener('cancel', onCancel)
    return () => el.removeEventListener('cancel', onCancel)
  }, [onClose])

  useEffect(() => {
    if (!open) {
      const node = prevActive.current
      if (node instanceof HTMLElement) {
        queueMicrotask(() => node.focus())
      }
    }
  }, [open])

  return (
    <dialog ref={dialogRef} className="fo-modal" aria-labelledby="fo-modal-title">
      <div className="fo-modal__surface">
        <header className="fo-modal__header">
          <h2 id="fo-modal-title" className="fo-modal__title">
            {title}
          </h2>
          <button type="button" className="fo-modal__close" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </header>
        <div className="fo-modal__body">{children}</div>
        {footer ? <footer className="fo-modal__footer">{footer}</footer> : null}
      </div>
    </dialog>
  )
}
