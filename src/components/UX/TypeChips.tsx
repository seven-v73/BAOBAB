import './TypeChips.css'

interface TypeChipsProps<T extends string> {
  label: string
  options: ReadonlyArray<{ key: T; label: string }>
  /** Compteur affiché après le libellé ; une clé absente n'affiche rien */
  counts: Partial<Record<T, number>>
  active: T
  onChange: (key: T) => void
  /** « tabs » : barre d'onglets soulignée (fiche pays) au lieu de pastilles */
  variant?: 'chips' | 'tabs'
}

/** Choix d'une vue avec compteur : pastilles (maquette « Puce/Région ») ou onglets. */
export const TypeChips = <T extends string>({ label, options, counts, active, onChange, variant = 'chips' }: TypeChipsProps<T>) => (
  <div className={`mbr-chips mbr-chips--${variant}`} role="group" aria-label={label}>
    {options.map(({ key, label: optionLabel }) => (
      <button key={key} type="button" className="mbr-chip" aria-pressed={active === key} onClick={() => onChange(key)}>
        {optionLabel} {counts[key] !== undefined && <span>{counts[key]}</span>}
      </button>
    ))}
  </div>
)
