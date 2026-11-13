import { useId, useState } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import './Input.css'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  variant?: 'default' | 'filled' | 'outline'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  clearable?: boolean
  onClear?: () => void
}

export const Input = ({
  label,
  error,
  hint,
  icon,
  iconPosition = 'left',
  variant = 'default',
  size = 'medium',
  fullWidth = true,
  clearable = false,
  onClear,
  className = '',
  id,
  name,
  type = 'text',
  value,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  required = false,
  placeholder,
  autoComplete,
  ...props
}: InputProps) => {
  const generatedId = useId()
  const inputId = id || generatedId
  const inputName = name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type
  const hasValue = value !== undefined && value !== '' && value !== null
  const hasError = !!error
  const hasIcon = !!icon

  const handleClear = () => {
    if (onClear) {
      onClear()
    } else if (onChange) {
      const event = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>
      onChange(event)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    if (onFocus) {
      onFocus(e)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    if (onBlur) {
      onBlur(e)
    }
  }

  return (
    <div className={`input-group ${fullWidth ? 'input-full-width' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required" aria-hidden="true">*</span>}
        </label>
      )}

      <div 
        className={`
          input-wrapper
          ${hasError ? 'input-wrapper-error' : ''}
          ${isFocused ? 'input-wrapper-focused' : ''}
          ${disabled ? 'input-wrapper-disabled' : ''}
          ${hasValue ? 'input-wrapper-filled' : ''}
          ${variant === 'filled' ? 'input-wrapper-filled-variant' : ''}
          ${variant === 'outline' ? 'input-wrapper-outline' : ''}
          input-wrapper-${size}
          ${hasIcon ? `input-wrapper-icon-${iconPosition}` : ''}
        `}
      >
        {hasIcon && iconPosition === 'left' && (
          <span className="input-icon input-icon-left" aria-hidden="true">
            {icon}
          </span>
        )}

        <input
          id={inputId}
          name={inputName}
          type={inputType}
          className="input-element"
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />

        {isPassword && !disabled && (
          <button
            type="button"
            className="input-password-toggle"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            tabIndex={-1}
          >
            <span 
              className={showPassword ? 'icon-eye-off' : 'icon-eye'} 
              aria-hidden="true"
            />
          </button>
        )}

        {clearable && hasValue && !disabled && (
          <button
            type="button"
            className="input-clear"
            onClick={handleClear}
            aria-label="Effacer"
            tabIndex={-1}
          >
            <span className="icon-x" aria-hidden="true" />
          </button>
        )}

        {hasIcon && iconPosition === 'right' && !isPassword && (
          <span className="input-icon input-icon-right" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      {hint && !hasError && (
        <span id={`${inputId}-hint`} className="input-hint">
          {hint}
        </span>
      )}

      {hasError && (
        <span id={`${inputId}-error`} className="input-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}