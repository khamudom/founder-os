import type { HTMLAttributes, ReactNode } from 'react'
import './Badge.css'

type Tone = 'neutral' | 'info' | 'success' | 'warning'

export type BadgeProps = {
  children: ReactNode
  tone?: Tone
} & HTMLAttributes<HTMLSpanElement>

export function Badge({ children, tone = 'neutral', className = '', ...rest }: BadgeProps) {
  return (
    <span className={`fo-badge fo-badge--${tone} ${className}`.trim()} {...rest}>
      {children}
    </span>
  )
}
