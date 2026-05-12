import type { InputHTMLAttributes } from 'react'
import './Checkbox.css'

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
  hint?: string
}

export function Checkbox({ id, label, hint, className = '', disabled, ...rest }: CheckboxProps) {
  const inputId = id ?? rest.name ?? label.replace(/\s+/g, '-').toLowerCase()

  return (
    <div className={`fo-checkbox ${className}`.trim()}>
      <input type="checkbox" id={inputId} className="fo-checkbox__input" disabled={disabled} {...rest} />
      <label htmlFor={inputId} className="fo-checkbox__label">
        <span className="fo-checkbox__box" aria-hidden="true" />
        <span className="fo-checkbox__text">
          <span>{label}</span>
          {hint ? <span className="fo-checkbox__hint">{hint}</span> : null}
        </span>
      </label>
    </div>
  )
}
