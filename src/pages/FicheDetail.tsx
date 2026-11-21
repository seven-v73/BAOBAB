import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Lecture, LectureCard, LectureEmpty, LectureSkeleton } from '../components/Lecture/Lecture'
import { FICHE_TYPE_LABELS } from '../components/Fiches/FichesPubliees'
import { ficheService } from '../services/api'
import { useSeo } from '../seo/useSeo'
import { joinMeta } from '../utils'
import { countryNameOf, placeOf } from '../utils/afrique'

// Page publique d'une fiche de la base de connaissances (publiée par l'équipe), au gabarit de lecture.

interface Source {
  id: string
  titre: string
  institution?: string
  auteur?: string
  annee?: string | number
  url: string
  type?: string
  licence?: string
}

interface Fiche {
  ficheId: string
  type: string
  pays: string
  titre: string
  description: string
  periode?: string
  sources: Source[]
  verification?: { etat?: string; le?: string }
  contenu?: Record<string, unknown>
}

// Détails affichés selon le type de fiche (libellé, clé dans le contenu collecté)
const DETAILS: Array<[string, string]> = [
  ['Nom local', 'nom_local'],
  ['Date', 'date_affichee'],
  ['Catégorie', 'categorie'],
  ['Communautés', 'communautes'],
  ['Régions', 'regions'],
  ['Langues', 'langues'],
  ['Famille', 'famille'],
  ['Statut', 'statut_linguistique'],
  ['Écritures', 'ecritures'],
  ['Naissance', 'naissance'],
  ['Décès', 'deces'],
  ['Rôles', 'roles'],
  ['Domaines', 'domaines'],
  ['Matériaux', 'materiaux'],
  ['Conservé par', 'institution'],
  ['Langue', 'langue'],
  ['Texte original', 'texte_original'],
  ['Traduction', 'traduction'],
  ['Sens', 'sens'],
  ['Publication', 'publication'],
]

const texte = (value: unknown): string => {
  if (value == null || value === '') return ''
  if (Array.isArray(value)) return value.map(texte).filter(Boolean).join(', ')
  if (typeof value === 'object') return Object.values(value as Record<string, unknown>).map(texte).filter(Boolean).join(', ')
  return String(value)
}

const back = { to: '/reperes', label: 'Retour aux repères' }

export const FicheDetail = () => {
  const { ficheId = '' } = useParams<{ ficheId: string }>()
  const [fiche, setFiche] = useState<Fiche | null>(null)
  const [loading, setLoading] = useState(true)

  useSeo(fiche ? { title: fiche.titre, description: fiche.description } : null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ficheService
      .getById(ficheId)
      .then((response) => !cancelled && setFiche(response.data))
      .catch(() => !cancelled && setFiche(null))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [ficheId])

  if (loading) return <LectureSkeleton />
  if (!fiche) {
    return (
      <LectureEmpty back={back}>
        <h1>Cette fiche n’est pas disponible</h1>
        <p>Elle n’existe pas ou n’a pas encore été publiée par l’équipe.</p>
      </LectureEmpty>
    )
  }

  const contenu = fiche.contenu || {}
  const image = contenu.image as { url?: string; auteur?: string; licence?: string } | undefined
  const details = DETAILS.map(([libelle, cle]) => [libelle, texte(contenu[cle])]).filter(([, valeur]) => valeur)
  const place = placeOf([fiche.pays])
  const paragraphes = fiche.description.split(/\n+/).filter(Boolean)

  return (
    <Lecture
      back={{ to: `/country/${fiche.pays.toLowerCase()}`, label: `Retour à la fiche ${countryNameOf(fiche.pays) || fiche.pays}` }}
      kicker={joinMeta(FICHE_TYPE_LABELS[fiche.type], countryNameOf(fiche.pays), fiche.type !== 'evenement' && fiche.periode)}
      title={fiche.titre}
      byline={{ detail: joinMeta('Fiche relue par l’équipe', fiche.verification?.etat === 'verifie' && 'contrôlée contre ses sources') }}
      shareUrl={`/fiche/${fiche.ficheId}`}
      image={image?.url ? { src: image.url, caption: joinMeta(image.auteur, image.licence) } : undefined}
      place={place}
      toc={[{ id: 'presentation', label: 'Présentation' }, { id: 'sources', label: 'Sources' }]}
      tocLabel="Dans cette fiche"
      aside={
        details.length > 0 ? (
          <LectureCard kicker="Repères">
            <dl className="mrl-facts">
              {details.map(([libelle, valeur]) => (
                <div key={libelle} style={{ display: 'contents' }}>
                  <dt>{libelle}</dt>
                  <dd>{valeur}</dd>
                </div>
              ))}
            </dl>
          </LectureCard>
        ) : undefined
      }
    >
      <section id="presentation">
        {paragraphes.map((p, index) => (
          <p key={index}>{p}</p>
        ))}
      </section>

      <section id="sources" className="mrd-sources">
        <ul>
          {fiche.sources.map((source, index) => (
            <li key={source.id || index}>
              <span className="mrd-num">{index + 1}</span>
              <span className="mrd-source-text">
                <p className="mrd-kicker">{joinMeta(source.institution || source.type, source.annee && String(source.annee))}</p>
                <p>
                  <a href={source.url} target="_blank" rel="noopener noreferrer nofollow">
                    {source.titre}
                  </a>
                  {source.licence ? ` · ${source.licence}` : ''}
                </p>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </Lecture>
  )
}
