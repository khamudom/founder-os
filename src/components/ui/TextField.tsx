import type { InputHTMLAttributes, ReactNode } from 'react'
import './TextField.css'

export type TextFieldProps = {
  id: string
  label: string
  hint?: string
  error?: string
  leading?: ReactNode
  trailing?: ReactNode
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>

export function TextField({
  id,
  label,
  hint,
  error,
  leading,
  trailing,
  className = '',
  ...rest
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`fo-field ${className}`.trim()}>
      <label className="fo-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="fo-field__control">
        {leading ? <span className="fo-field__slot">{leading}</span> : null}
        <input
          id={id}
          className="fo-field__input"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {trailing ? <span className="fo-field__slot">{trailing}</span> : null}
      </div>
      {hint ? (
        <p id={hintId} className="fo-field__hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="fo-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
