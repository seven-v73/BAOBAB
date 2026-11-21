import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ficheService } from '../../services/api'
import { listFrom } from '../../utils'
import './FichesPubliees.css'

// Fiches publiées de la base de connaissances (server/data/afrique), affichées là où elles éclairent
// une page : fiche pays, rubriques. Rien ne s'affiche tant qu'aucune fiche n'est publiée.

export interface FichePublique {
  ficheId: string
  type: string
  pays: string
  titre: string
  description: string
  periode?: string
  contenu?: Record<string, unknown>
}

export const FICHE_TYPE_LABELS: Record<string, string> = {
  pays: 'Pays',
  langue: 'Langue',
  peuple: 'Peuple',
  site: 'Lieu',
  tradition: 'Tradition',
  personnalite: 'Personnalité',
  evenement: 'Date',
  oeuvre: 'Œuvre',
  proverbe: 'Proverbe',
}

export const useFichesPubliees = (params: { pays?: string; type?: string; q?: string; limit?: number }, actif = true) => {
  const [fiches, setFiches] = useState<FichePublique[]>([])
  const key = JSON.stringify(params)
  useEffect(() => {
    if (!actif) return
    let cancelled = false
    ficheService
      .getAll(JSON.parse(key))
      .then((response) => !cancelled && setFiches(listFrom(response.data, 'fiches')))
      .catch(() => !cancelled && setFiches([]))
    return () => {
      cancelled = true
    }
  }, [key, actif])
  return fiches
}

const extrait = (text = '', max = 150) => (text.length > max ? `${text.slice(0, text.lastIndexOf(' ', max))}…` : text)

/** Grille de fiches publiées (cartes cliquables vers /fiche/:id) */
export const FichesGrille = ({ fiches }: { fiches: FichePublique[] }) => (
  <ul className="mfi-grille">
    {fiches.map((fiche) => (
      <li key={fiche.ficheId}>
        <Link to={`/fiche/${fiche.ficheId}`} className="mfi-carte">
          <span className="mfi-kicker">
            {[FICHE_TYPE_LABELS[fiche.type], fiche.periode].filter(Boolean).join(' · ')}
          </span>
          <strong>{fiche.titre}</strong>
          {fiche.description && <span className="mfi-texte">{extrait(fiche.description)}</span>}
          <ArrowRight className="mfi-fleche" size={18} strokeWidth={1.6} aria-hidden="true" />
        </Link>
      </li>
    ))}
  </ul>
)

/** Bloc titré de fiches publiées d'un pays, pour un ou plusieurs types ; absent s'il n'y en a aucune */
export const FichesPubliees = ({ pays, type, titre, sousTitre, limit = 12 }: { pays: string; type: string; titre: string; sousTitre?: string; limit?: number }) => {
  const fiches = useFichesPubliees({ pays: pays.toUpperCase(), type, limit })
  if (!fiches.length) return null
  return (
    <section className="mbp-block">
      <header>
        <h2>{titre}</h2>
        {sousTitre && <p>{sousTitre}</p>}
      </header>
      <FichesGrille fiches={fiches} />
    </section>
  )
}
