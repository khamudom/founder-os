import type { ReactNode, SelectHTMLAttributes } from 'react'
import './Select.css'

export type SelectProps = {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'>

export function Select({
  id,
  label,
  hint,
  error,
  children,
  className = '',
  ...rest
}: SelectProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`fo-select-field ${className}`.trim()}>
      <label className="fo-select-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="fo-select-field__wrap">
        <select
          id={id}
          className="fo-select-field__select"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        >
          {children}
        </select>
      </div>
      {hint ? (
        <p id={hintId} className="fo-select-field__hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="fo-select-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
