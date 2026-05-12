import type { HTMLAttributes, ReactNode } from 'react'
import './Card.css'

export type CardProps = {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
} & HTMLAttributes<HTMLDivElement>

export function Card({
  children,
  padding = 'md',
  interactive,
  className = '',
  ...rest
}: CardProps) {
  const classes = [
    'fo-card',
    `fo-card--p-${padding}`,
    interactive ? 'fo-card--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  )
}
