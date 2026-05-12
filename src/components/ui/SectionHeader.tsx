import type { ReactNode } from 'react'
import './SectionHeader.css'

export type SectionHeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
}

export function SectionHeader({ title, description, actions }: SectionHeaderProps) {
  return (
    <div className="fo-section-header">
      <div className="fo-section-header__text">
        <h2 className="fo-section-header__title">{title}</h2>
        {description ? <p className="fo-section-header__desc">{description}</p> : null}
      </div>
      {actions ? <div className="fo-section-header__actions">{actions}</div> : null}
    </div>
  )
}
