import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import './Input.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = ({ label, error, className = '', id, name, ...props }: InputProps) => {
  const generatedId = useId()
  const inputId = id || generatedId
  const inputName = name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="input-group">
      {label && <label htmlFor={inputId} className="input-label">{label}</label>}
      <input
        id={inputId}
        name={inputName}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  )
}

