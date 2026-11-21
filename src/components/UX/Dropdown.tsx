import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import './Dropdown.css'

interface DropdownProps {
  /** Nom du filtre, affiché devant la valeur (« Pays : Mali ») */
  label: string
  /** Valeur sélectionnée ; chaîne vide = l'option « toutes / tous » */
  value: string
  /** Libellé de l'option par défaut (« Pays : tous ») */
  allLabel: string
  options: string[]
  onChange: (value: string) => void
}

/** Liste déroulante pilule de la charte (filtres des pages Récits et Repères).
 * Fermée, elle reprend la pilule blanche de la maquette ; ouverte, un menu
 * détaché liste les options avec l'active cochée. */
export const Dropdown = ({ label, value, allLabel, options, onChange }: DropdownProps) => {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  // Fermeture au clic dehors et à Échap
  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const choose = (option: string) => {
    onChange(option)
    setOpen(false)
  }

  const items = [{ value: '', label: allLabel }, ...options.map((option) => ({ value: option, label: `${label} : ${option}` }))]

  return (
    <div className="ux-dd" ref={root} data-open={open || undefined}>
      <button
        type="button"
        className="ux-dd-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((state) => !state)}
      >
        {value ? `${label} : ${value}` : allLabel}
        <ChevronDown size={16} strokeWidth={1.6} aria-hidden="true" />
      </button>
      {open && (
        <ul className="ux-dd-menu" role="listbox" aria-label={label}>
          {items.map((item) => (
            <li key={item.value} role="none">
              <button
                type="button"
                role="option"
                aria-selected={value === item.value}
                className={`ux-dd-option${value === item.value ? ' is-selected' : ''}`}
                onClick={() => choose(item.value)}
              >
                {item.label}
                {value === item.value && <Check size={16} strokeWidth={1.8} aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
