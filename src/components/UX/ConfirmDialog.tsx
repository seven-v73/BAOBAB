import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import './ConfirmDialog.css'

type DialogTone = 'default' | 'danger' | 'success'

interface BaseDialogOptions {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: DialogTone
}

interface TextDialogOptions extends BaseDialogOptions {
  placeholder?: string
  defaultValue?: string
  required?: boolean
}

type DialogState =
  | null
  | {
      kind: 'confirm'
      options: BaseDialogOptions
      resolve: (value: boolean) => void
    }
  | {
      kind: 'text'
      options: TextDialogOptions
      value: string
      resolve: (value: string | null) => void
    }

const toneIcon = {
  default: Info,
  danger: AlertTriangle,
  success: CheckCircle,
}

export const useConfirmDialog = () => {
  const [dialog, setDialog] = useState<DialogState>(null)
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!dialog) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => confirmButtonRef.current?.focus(), 40)

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (dialog.kind === 'confirm') dialog.resolve(false)
        if (dialog.kind === 'text') dialog.resolve(null)
        setDialog(null)
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [dialog])

  const confirm = useCallback((options: BaseDialogOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        kind: 'confirm',
        options: {
          cancelLabel: 'Annuler',
          confirmLabel: 'Confirmer',
          tone: 'default',
          ...options,
        },
        resolve,
      })
    })
  }, [])

  const requestText = useCallback((options: TextDialogOptions) => {
    return new Promise<string | null>((resolve) => {
      setDialog({
        kind: 'text',
        value: options.defaultValue || '',
        options: {
          cancelLabel: 'Annuler',
          confirmLabel: 'Continuer',
          tone: 'default',
          ...options,
        },
        resolve,
      })
    })
  }, [])

  const close = (value: boolean | string | null) => {
    if (!dialog) return
    if (dialog.kind === 'confirm') dialog.resolve(Boolean(value))
    if (dialog.kind === 'text') dialog.resolve(typeof value === 'string' ? value : null)
    setDialog(null)
  }

  const Dialog = dialog ? (() => {
    const tone = dialog.options.tone || 'default'
    const Icon = toneIcon[tone]
    const textValue = dialog.kind === 'text' ? dialog.value : ''
    const isTextInvalid = dialog.kind === 'text' && dialog.options.required && !textValue.trim()

    return (
      <div className="ux-dialog-backdrop" role="presentation" onMouseDown={() => close(dialog.kind === 'confirm' ? false : null)}>
        <section
          className={`ux-dialog ux-dialog-${tone}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ux-dialog-title"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="ux-dialog-icon" aria-hidden="true">
            <Icon size={22} />
          </div>
          <button className="ux-dialog-close" onClick={() => close(dialog.kind === 'confirm' ? false : null)} aria-label="Fermer">
            <X size={18} />
          </button>
          <div className="ux-dialog-body">
            <h2 id="ux-dialog-title">{dialog.options.title}</h2>
            {dialog.options.message && <p>{dialog.options.message}</p>}
            {dialog.kind === 'text' && (
              <textarea
                className="ux-dialog-textarea"
                value={dialog.value}
                placeholder={dialog.options.placeholder}
                rows={4}
                onChange={(event) => setDialog({ ...dialog, value: event.target.value })}
              />
            )}
          </div>
          <div className="ux-dialog-actions">
            <button className="btn btn-outline" onClick={() => close(dialog.kind === 'confirm' ? false : null)}>
              {dialog.options.cancelLabel}
            </button>
            <button
              ref={confirmButtonRef}
              className={`btn ${tone === 'danger' ? 'btn-outline ux-dialog-danger-action' : 'btn-primary'}`}
              disabled={isTextInvalid}
              onClick={() => close(dialog.kind === 'text' ? textValue : true)}
            >
              {dialog.options.confirmLabel}
            </button>
          </div>
        </section>
      </div>
    )
  })() : null

  return { confirm, requestText, Dialog }
}
