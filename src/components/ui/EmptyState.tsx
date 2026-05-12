import type { ReactNode } from 'react'
import './EmptyState.css'

export type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="fo-empty">
      <p className="fo-empty__title">{title}</p>
      {description ? <p className="fo-empty__desc">{description}</p> : null}
      {action ? <div className="fo-empty__action">{action}</div> : null}
    </div>
  )
}
