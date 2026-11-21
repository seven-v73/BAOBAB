import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowUpRight, CheckCircle2, Eye, RotateCcw, Search, ShieldAlert, XCircle } from 'lucide-react'
import { ficheService } from '../../services/api'
import { useNotifications } from '../../hooks/useNotifications'
import { Dropdown } from '../../components/UX/Dropdown'
import { TypeChips } from '../../components/UX/TypeChips'
import { countryNameOf } from '../../utils/afrique'
import '../Rubriques.css'
import './AdminFiches.css'

// Relecture de la base de connaissances (server/data/afrique) : l'équipe valide, publie ou retire
// chaque fiche collectée. Un contenu sensible ne se publie qu'avec une note de validation.

interface Source {
  id: string
  titre: string
  institution?: string
  url: string
  type?: string
  licence?: string
}

interface Fiche {
  _id: string
  ficheId: string
  type: string
  pays: string
  titre: string
  description: string
  periode?: string
  sensible?: boolean
  statut: string
  verification?: { etat?: string; note?: string; le?: string }
  sources: Source[]
  miseAJourDisponible?: boolean
  contenu?: Record<string, unknown>
}

const TYPES = [
  { key: 'tous', label: 'Tout' },
  { key: 'site', label: 'Sites' },
  { key: 'tradition', label: 'Traditions' },
  { key: 'personnalite', label: 'Personnalités' },
  { key: 'evenement', label: 'Événements' },
  { key: 'langue', label: 'Langues' },
  { key: 'peuple', label: 'Peuples' },
  { key: 'oeuvre', label: 'Œuvres' },
  { key: 'proverbe', label: 'Proverbes' },
  { key: 'pays', label: 'Pays' },
] as const

const STATUTS = [
  { key: 'en_revue', label: 'En revue' },
  { key: 'valide_expert', label: 'Validées' },
  { key: 'publie', label: 'Publiées' },
  { key: 'retire', label: 'Retirées' },
  { key: 'tous', label: 'Toutes' },
] as const

const STATUT_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  en_revue: 'En revue',
  valide_expert: 'Validée',
  publie: 'Publiée',
  retire: 'Retirée',
}

const TYPE_LABELS: Record<string, string> = {
  pays: 'Pays',
  langue: 'Langue',
  peuple: 'Peuple',
  site: 'Site',
  tradition: 'Tradition',
  personnalite: 'Personnalité',
  evenement: 'Événement',
  oeuvre: 'Œuvre',
  proverbe: 'Proverbe',
}

const VERIF_LABELS: Record<string, string> = {
  a_verifier: 'Pas encore contrôlée',
  verifie: 'Contrôlée contre ses sources',
  corrige: 'Corrigée au contrôle',
}

// Champs détaillés à afficher sous la description (le reste est dans le contenu brut)
const DETAILS: Array<[string, string]> = [
  ['nom_local', 'Nom local'],
  ['categorie', 'Catégorie'],
  ['communautes', 'Communautés'],
  ['regions', 'Régions'],
  ['langues', 'Langues'],
  ['famille', 'Famille'],
  ['glottocode', 'Glottocode'],
  ['statut_linguistique', 'Statut'],
  ['date_affichee', 'Date'],
  ['naissance', 'Naissance'],
  ['deces', 'Décès'],
  ['roles', 'Rôles'],
  ['institution', 'Institution'],
  ['texte_original', 'Texte original'],
  ['traduction', 'Traduction'],
  ['publication', 'Publication'],
  ['note_sensibilite', 'Sensibilité'],
]

const afficher = (value: unknown): string => {
  if (value == null || value === '') return ''
  if (Array.isArray(value)) return value.map(afficher).filter(Boolean).join(', ')
  if (typeof value === 'object') return Object.values(value as Record<string, unknown>).map(afficher).filter(Boolean).join(', ')
  return String(value)
}

export const AdminFiches = () => {
  const { success, error } = useNotifications()
  const [stats, setStats] = useState<{ pays: Record<string, Record<string, number>>; statuts: Record<string, number>; miseAJourDisponible: number } | null>(null)
  const [fiches, setFiches] = useState<Fiche[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pays, setPays] = useState('')
  const [type, setType] = useState<(typeof TYPES)[number]['key']>('tous')
  const [statut, setStatut] = useState<(typeof STATUTS)[number]['key']>('en_revue')
  const [sensible, setSensible] = useState(false)
  const [query, setQuery] = useState('')
  const [ouverte, setOuverte] = useState<Fiche | null>(null)
  const [note, setNote] = useState('')
  const [enCours, setEnCours] = useState(false)

  const paysOptions = useMemo(
    () => Object.keys(stats?.pays || {}).map((code) => `${countryNameOf(code) || code} (${code})`).sort((a, b) => a.localeCompare(b, 'fr')),
    [stats],
  )
  const codePays = pays.match(/\(([A-Z]{2})\)$/)?.[1]

  const charger = useCallback(async () => {
    try {
      const { data } = await ficheService.getAdmin({
        page,
        limit: 30,
        pays: codePays,
        type: type === 'tous' ? undefined : type,
        statut: statut === 'tous' ? undefined : statut,
        sensible: sensible ? 'true' : undefined,
        q: query.trim() || undefined,
      })
      setFiches(data.fiches)
      setTotal(data.pagination.total)
    } catch {
      error('Chargement des fiches impossible.')
    }
  }, [page, codePays, type, statut, sensible, query, error])

  useEffect(() => {
    ficheService.getStats().then(({ data }) => setStats(data)).catch(() => undefined)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(charger, 250)
    return () => window.clearTimeout(timer)
  }, [charger])

  const ouvrir = async (fiche: Fiche) => {
    setNote('')
    try {
      const { data } = await ficheService.getById(fiche.ficheId)
      setOuverte(data)
    } catch {
      setOuverte(fiche)
    }
  }

  const decider = async (nouveau: string) => {
    if (!ouverte) return
    setEnCours(true)
    try {
      await ficheService.setStatut(ouverte.ficheId, nouveau, note)
      success(`« ${ouverte.titre} » : ${STATUT_LABELS[nouveau].toLowerCase()}.`)
      setOuverte(null)
      charger()
      ficheService.getStats().then(({ data }) => setStats(data)).catch(() => undefined)
    } catch (err) {
      error((err as { response?: { data?: { message?: string; error?: string } } }).response?.data?.message || 'Décision non enregistrée.')
    } finally {
      setEnCours(false)
    }
  }

  const s = stats?.statuts || {}
  const totalFiches = Object.values(s).reduce((a, b) => a + b, 0)

  return (
    <div className="maf">
      <header className="maf-head">
        <div>
          <p>Fiches sourcées collectées pour chaque pays. Relisez, validez puis publiez : seules les fiches publiées sont visibles sur le site.</p>
        </div>
        <dl className="maf-stats">
          <div>
            <dt>Fiches</dt>
            <dd>{totalFiches}</dd>
          </div>
          <div>
            <dt>En revue</dt>
            <dd>{s.en_revue || 0}</dd>
          </div>
          <div>
            <dt>Validées</dt>
            <dd>{s.valide_expert || 0}</dd>
          </div>
          <div>
            <dt>Publiées</dt>
            <dd>{s.publie || 0}</dd>
          </div>
          <div>
            <dt>Pays</dt>
            <dd>{Object.keys(stats?.pays || {}).length}</dd>
          </div>
        </dl>
      </header>

      {stats && stats.miseAJourDisponible > 0 && (
        <p className="maf-alerte">
          <AlertTriangle size={18} aria-hidden="true" /> {stats.miseAJourDisponible} fiche(s) validée(s) ont une nouvelle version collectée à relire.
        </p>
      )}

      <div className="maf-filtres">
        <TypeChips label="Statut" options={STATUTS} counts={{}} active={statut} onChange={(key) => { setStatut(key); setPage(1) }} />
        <div className="maf-filtres-droite">
          <Dropdown label="Pays" allLabel="Pays : tous" value={pays} options={paysOptions} onChange={(value) => { setPays(value); setPage(1) }} />
          <label className="maf-case">
            <input type="checkbox" checked={sensible} onChange={(event) => { setSensible(event.target.checked); setPage(1) }} /> Sensibles
          </label>
          <label className="maf-recherche">
            <Search size={16} aria-hidden="true" />
            <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Rechercher" aria-label="Rechercher une fiche" />
          </label>
        </div>
      </div>
      <div className="maf-types">
        <TypeChips label="Type" options={TYPES} counts={{}} active={type} onChange={(key) => { setType(key); setPage(1) }} />
      </div>

      <p className="maf-compte">{total} fiche(s)</p>
      <ul className="maf-liste">
        {fiches.map((fiche) => (
          <li key={fiche._id}>
            <button type="button" className="maf-ligne" onClick={() => ouvrir(fiche)}>
              <span className="maf-ligne-texte">
                <span className="maf-kicker">
                  {TYPE_LABELS[fiche.type] || fiche.type} · {countryNameOf(fiche.pays) || fiche.pays}
                  {fiche.periode ? ` · ${fiche.periode}` : ''}
                </span>
                <strong>{fiche.titre}</strong>
              </span>
              <span className="maf-badges">
                {fiche.sensible && (
                  <span className="maf-badge maf-badge--sensible">
                    <ShieldAlert size={14} aria-hidden="true" /> Sensible
                  </span>
                )}
                {fiche.miseAJourDisponible && <span className="maf-badge maf-badge--maj">Nouvelle version</span>}
                {fiche.verification?.etat === 'verifie' && (
                  <span className="maf-badge">
                    <CheckCircle2 size={14} aria-hidden="true" /> Contrôlée
                  </span>
                )}
                <span className={`maf-badge maf-badge--${fiche.statut}`}>{STATUT_LABELS[fiche.statut]}</span>
                <span className="maf-sources">{fiche.sources.length} source(s)</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {total > 30 && (
        <div className="maf-pages">
          <button type="button" className="btn btn-outline btn-small" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Précédentes
          </button>
          <span>
            Page {page} sur {Math.ceil(total / 30)}
          </span>
          <button type="button" className="btn btn-outline btn-small" disabled={page >= Math.ceil(total / 30)} onClick={() => setPage((p) => p + 1)}>
            Suivantes
          </button>
        </div>
      )}

      {ouverte && (
        <div className="maf-voile" role="dialog" aria-modal="true" aria-label={ouverte.titre} onClick={() => setOuverte(null)}>
          <article className="maf-fiche" onClick={(event) => event.stopPropagation()}>
            <p className="maf-kicker">
              {TYPE_LABELS[ouverte.type] || ouverte.type} · {countryNameOf(ouverte.pays) || ouverte.pays} · {ouverte.ficheId}
            </p>
            <h3>{ouverte.titre}</h3>
            <p className="maf-statut">
              {STATUT_LABELS[ouverte.statut]} · {VERIF_LABELS[ouverte.verification?.etat || 'a_verifier'] || ouverte.verification?.etat}
              {ouverte.verification?.note ? ` : ${ouverte.verification.note}` : ''}
            </p>
            {ouverte.sensible && (
              <p className="maf-alerte">
                <ShieldAlert size={18} aria-hidden="true" /> Contenu sensible : à faire valider par la communauté ou une institution partenaire avant publication.
              </p>
            )}
            <p className="maf-description">{ouverte.description}</p>
            <dl className="maf-details">
              {DETAILS.map(([cle, libelle]) => {
                const valeur = afficher(ouverte.contenu?.[cle])
                return valeur ? (
                  <div key={cle}>
                    <dt>{libelle}</dt>
                    <dd>{valeur}</dd>
                  </div>
                ) : null
              })}
            </dl>
            <h4>Sources</h4>
            <ol className="maf-sources-liste">
              {ouverte.sources.map((source) => (
                <li key={source.id}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer nofollow">
                    {source.titre} <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                  <span>{[source.institution, source.type, source.licence].filter(Boolean).join(' · ')}</span>
                </li>
              ))}
            </ol>
            <label className="maf-note">
              Note de décision {ouverte.sensible && <em>(obligatoire pour publier : qui a validé ?)</em>}
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Ex. : relue avec le conservateur du musée national, dates confirmées." />
            </label>
            <div className="maf-actions">
              <button type="button" className="btn btn-outline" disabled={enCours} onClick={() => decider('valide_expert')}>
                <CheckCircle2 size={16} aria-hidden="true" /> Valider
              </button>
              <button type="button" className="btn btn-primary" disabled={enCours} onClick={() => decider('publie')}>
                <Eye size={16} aria-hidden="true" /> Publier
              </button>
              <button type="button" className="btn btn-danger" disabled={enCours} onClick={() => decider('retire')}>
                <XCircle size={16} aria-hidden="true" /> Retirer
              </button>
              {ouverte.statut !== 'en_revue' && (
                <button type="button" className="btn btn-ghost" disabled={enCours} onClick={() => decider('en_revue')}>
                  <RotateCcw size={16} aria-hidden="true" /> Remettre en revue
                </button>
              )}
              <button type="button" className="btn btn-ghost" onClick={() => setOuverte(null)}>
                Fermer
              </button>
            </div>
          </article>
        </div>
      )}
    </div>
  )
}
