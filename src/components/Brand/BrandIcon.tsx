/**
 * Icônes de la charte MonBaobab (dossier public/brand/icons, issues de public/Icons).
 * - duo   : vert profond #174123 + vert sauge #77a162 (fonds clairs)
 * - mono  : noir (impression, contrastes forts)
 * - white : blanc (fonds verts / sombres)
 */
export type BrandIconName =
  | 'mail'
  | 'globe'
  | 'like'
  | 'upload'
  | 'search'
  | 'share'
  | 'trash'
  | 'history'
  | 'translate'
  | 'user'
  | 'phone'
  | 'heart'
  | 'download'
  | 'apps'
  | 'image'

interface BrandIconProps {
  name: BrandIconName
  tone?: 'duo' | 'mono' | 'white'
  size?: number
  /** Texte alternatif : laisser vide quand l'icône est décorative (libellé déjà présent) */
  label?: string
  className?: string
}

export const BrandIcon = ({ name, tone = 'duo', size = 22, label, className }: BrandIconProps) => (
  <img
    src={`/brand/icons/${name}-${tone}.svg`}
    width={size}
    height={size}
    alt={label || ''}
    aria-hidden={label ? undefined : true}
    className={`brand-icon${className ? ` ${className}` : ''}`}
    style={{ objectFit: 'contain' }}
    draggable={false}
  />
)
