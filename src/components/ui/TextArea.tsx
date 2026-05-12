import type { TextareaHTMLAttributes } from 'react'
import './TextArea.css'

export type TextAreaProps = {
  id: string
  label: string
  hint?: string
  error?: string
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'>

export function TextArea({
  id,
  label,
  hint,
  error,
  className = '',
  ...rest
}: TextAreaProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`fo-textarea-field ${className}`.trim()}>
      <label className="fo-textarea-field__label" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        className="fo-textarea-field__input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {hint ? (
        <p id={hintId} className="fo-textarea-field__hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="fo-textarea-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
