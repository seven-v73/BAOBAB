import type { ReactNode, Ref } from 'react'
import { AFRICA_PATH, AFRICA_VIEWBOX } from '../../data/africaOutline'
import './AfricaRelief.css'

interface AfricaReliefProps {
  /** Identifiant unique : sert au masque des courbes de niveau */
  id: string
  className?: string
  viewBox?: string
  svgRef?: Ref<SVGSVGElement>
  /** Repères, étiquettes… dessinés par-dessus le relief, dans les unités du viewBox */
  children?: ReactNode
}

/** L'Afrique de la maquette : vert forêt, courbes de niveau, contour sauge (accueil et Explorer). */
export const AfricaRelief = ({ id, className = '', viewBox = AFRICA_VIEWBOX, svgRef, children }: AfricaReliefProps) => (
  <svg ref={svgRef} viewBox={viewBox} className={`africa-relief ${className}`} preserveAspectRatio="xMidYMid meet">
    <defs>
      <clipPath id={`${id}-clip`}>
        <path d={AFRICA_PATH} />
      </clipPath>
    </defs>
    <path d={AFRICA_PATH} className="africa-relief-fill" data-motion="africa-fill" />
    <image
      href="/Motifs/Fichier%2062.svg"
      x="-200"
      y="-40"
      width="1100"
      height="700"
      clipPath={`url(#${id}-clip)`}
      opacity="0.14"
      aria-hidden="true"
    />
    <path d={AFRICA_PATH} className="africa-relief-line" data-motion="africa-line" />
    {children}
  </svg>
)
