import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

export type ButtonProps = {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [
    'fo-btn',
    `fo-btn--${variant}`,
    `fo-btn--${size}`,
    fullWidth ? 'fo-btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <button type={type} className={classes} {...rest} />
}
