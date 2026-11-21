import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react'
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Image as ImageIcon,
  Landmark,
  Link2,
  MapPin,
  MessageSquareQuote,
  Mic,
  PencilLine,
  Search,
  Sprout,
  Trash2,
  X,
  XCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { contributionService } from '../../services/api'
import { useNotifications } from '../../hooks/useNotifications'
import { TypeChips } from '../../components/UX/TypeChips'
import { REGION_COLORS, REGION_LABELS, countryNameOf, findCountryCodes, regionOfCode } from '../../utils/afrique'
import './AdminContributions.css'

// Relecture des propositions envoyées depuis la page Contribuer : l'équipe met en vérification,
// valide ou rejette chaque contribution. La note de relecture est transmise au membre.

interface Contribution {
  _id: string
  type: string
  title: string
  content: string
  country?: { id?: string; nameFr?: string } | string | null
  countryName?: string
  language?: string
  period?: string
  location?: string
  tags?: string[]
  status: string
  visibility: string
  sourceUrl?: string
  mediaUrl?: string
  submittedBy?: { name: string }
  reviewNote?: string
  reviewedBy?: { name: string } | null
  reviewedAt?: string | null
  createdAt: string
}

type StatusKey = 'proposed' | 'in-review' | 'approved' | 'rejected' | 'all'

const STATUTS: ReadonlyArray<{ key: StatusKey; label: string }> = [
  { key: 'proposed', label: 'Proposées' },
  { key: 'in-review', label: 'En vérification' },
  { key: 'approved', label: 'Validées' },
  { key: 'rejected', label: 'Rejetées' },
  { key: 'all', label: 'Toutes' },
]

const STATUT_LABELS: Record<string, string> = {
  proposed: 'Proposée',
  'in-review': 'En vérification',
  approved: 'Validée',
  rejected: 'Rejetée',
}

// Mêmes types et pictogrammes que la page Contribuer ; « photo » partage la carte « Lieu ou photo »
const TYPES: ReadonlyArray<{ key: string; label: string; icon: LucideIcon }> = [
  { key: 'family-memory', label: 'Récit ou mémoire', icon: BookOpen },
  { key: 'proverb', label: 'Proverbe', icon: MessageSquareQuote },
  { key: 'oral-tradition', label: 'Tradition orale', icon: Mic },
  { key: 'source', label: 'Source', icon: Landmark },
  { key: 'place', label: 'Lieu ou photo', icon: MapPin },
  { key: 'correction', label: 'Correction', icon: PencilLine },
]

const typeKeyOf = (type: string) => (type === 'photo' ? 'place' : type)
const typeOf = (type: string) => TYPES.find((t) => t.key === typeKeyOf(type)) ?? { key: type, label: type, icon: Sprout }

// Le formulaire compose le contenu en blocs : texte, « Traduction et sens : », « Origine : », « Précisions : »
const decouper = (content: string) => {
  const parts = { texte: [] as string[], traduction: '', origine: '', precisions: '' }
  for (const bloc of content.split(/\n{2,}/)) {
    const m = bloc.match(/^(Traduction et sens|Origine|Précisions)\s*:\s*([\s\S]*)$/)
    if (!m) parts.texte.push(bloc)
    else if (m[1] === 'Traduction et sens') parts.traduction = m[2].trim()
    else if (m[1] === 'Origine') parts.origine = m[2].trim()
    else parts.precisions = m[2].trim()
  }
  return { ...parts, texte: parts.texte.join('\n\n').trim() }
}

const extrait = (content: string) => {
  const texte = decouper(content).texte.replace(/\s+/g, ' ')
  return texte.length > 160 ? `${texte.slice(0, 157).trimEnd()}…` : texte
}

const lieuOf = (c: Contribution) => {
  const code = (typeof c.country === 'object' && c.country?.id) || findCountryCodes(c.countryName)[0] || ''
  const region = regionOfCode(code)
  const pays = c.countryName || (typeof c.country === 'object' && c.country?.nameFr) || countryNameOf(code)
  return { pays: pays || 'Tout le continent', region }
}

const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })
const ilYa = (date: string) => {
  const secondes = (new Date(date).getTime() - Date.now()) / 1000
  const paliers: Array<[number, Intl.RelativeTimeFormatUnit]> = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.35, 'week'],
    [12, 'month'],
    [Infinity, 'year'],
  ]
  let valeur = secondes
  for (const [taille, unite] of paliers) {
    if (Math.abs(valeur) < taille) return rtf.format(Math.round(valeur), unite)
    valeur /= taille
  }
  return ''
}

const dateLongue = (date: string) => new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

const lienSur = (url?: string) => (url && /^https?:\/\//i.test(url) ? url : '')

const EMPTY_TEXTS: Record<StatusKey, { titre: string; texte: string }> = {
  proposed: { titre: 'Rien n’attend de relecture', texte: 'Toutes les propositions ont été lues. Les prochaines contributions des membres arriveront ici.' },
  'in-review': { titre: 'Aucune vérification en cours', texte: 'Les contributions mises en vérification apparaîtront ici le temps de les recouper.' },
  approved: { titre: 'Aucune contribution validée', texte: 'Les savoirs validés par l’équipe se retrouveront ici.' },
  rejected: { titre: 'Aucune contribution rejetée', texte: 'Rien n’a été écarté pour le moment.' },
  all: { titre: 'Aucune contribution pour l’instant', texte: 'Les proverbes, récits et sources proposés depuis la page Contribuer arriveront ici.' },
}

export const AdminContributions = () => {
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [status, setStatus] = useState<StatusKey>('proposed')
  const [type, setType] = useState('tous')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState<Partial<Record<StatusKey, number>>>({})
  const [ouverte, setOuverte] = useState<Contribution | null>(null)
  const [note, setNote] = useState('')
  const [enCours, setEnCours] = useState(false)
  const [confirmerSuppression, setConfirmerSuppression] = useState(false)
  const { success, error } = useNotifications()
  const panneauRef = useRef<HTMLElement>(null)
  const fermerRef = useRef<HTMLButtonElement>(null)
  const retourFocus = useRef<HTMLElement | null>(null)

  const fetchContributions = useCallback(async () => {
    try {
      setLoading(true)
      const response = await contributionService.getAll({ status, limit: 100 })
      setContributions(response.data.contributions || [])
    } catch (fetchError) {
      console.error('Erreur contributions admin:', fetchError)
      error('Impossible de charger les contributions')
    } finally {
      setLoading(false)
    }
  }, [status, error])

  // Compteurs par statut : une requête légère par statut, lue dans la pagination
  const fetchCounts = useCallback(async () => {
    const resultats = await Promise.allSettled(STATUTS.map(({ key }) => contributionService.getAll({ status: key, limit: 1 })))
    const next: Partial<Record<StatusKey, number>> = {}
    resultats.forEach((resultat, index) => {
      if (resultat.status === 'fulfilled') next[STATUTS[index].key] = resultat.value.data?.pagination?.total ?? 0
    })
    setCounts(next)
  }, [])

  useEffect(() => {
    fetchContributions()
  }, [fetchContributions])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  const fermer = useCallback(() => {
    setOuverte(null)
    setConfirmerSuppression(false)
    window.setTimeout(() => retourFocus.current?.focus(), 0)
  }, [])

  const ouvrir = (contribution: Contribution, origine: HTMLElement) => {
    retourFocus.current = origine
    setNote(contribution.reviewNote || '')
    setConfirmerSuppression(false)
    setOuverte(contribution)
  }

  useEffect(() => {
    if (!ouverte) return
    fermerRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') fermer()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [ouverte, fermer])

  // Garde le focus dans le panneau ouvert
  const pieger = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab' || !panneauRef.current) return
    const focusables = panneauRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea, input')
    if (!focusables.length) return
    const premier = focusables[0]
    const dernier = focusables[focusables.length - 1]
    if (event.shiftKey && document.activeElement === premier) {
      event.preventDefault()
      dernier.focus()
    } else if (!event.shiftKey && document.activeElement === dernier) {
      event.preventDefault()
      premier.focus()
    }
  }

  const changeStatus = async (id: string, nextStatus: string) => {
    if (nextStatus === 'rejected' && !note.trim()) {
      error('Expliquez au membre pourquoi sa contribution est rejetée.')
      return
    }
    try {
      setEnCours(true)
      await contributionService.updateStatus(id, { status: nextStatus, reviewNote: note.trim() })
      success(`Contribution ${STATUT_LABELS[nextStatus]?.toLowerCase() || 'modérée'}`)
      fermer()
      fetchContributions()
      fetchCounts()
    } catch (statusError) {
      console.error('Erreur modération:', statusError)
      error('Impossible de modifier le statut')
    } finally {
      setEnCours(false)
    }
  }

  const supprimer = async (id: string) => {
    try {
      setEnCours(true)
      await contributionService.delete(id)
      success('Contribution supprimée')
      fermer()
      fetchContributions()
      fetchCounts()
    } catch (deleteError) {
      console.error('Erreur suppression contribution:', deleteError)
      error('Impossible de supprimer la contribution')
    } finally {
      setEnCours(false)
    }
  }

  const typeCounts = useMemo(() => {
    const next: Record<string, number> = { tous: contributions.length }
    for (const c of contributions) next[typeKeyOf(c.type)] = (next[typeKeyOf(c.type)] || 0) + 1
    return next
  }, [contributions])

  // Dans « Proposées », la plus ancienne d'abord : elle attend depuis le plus longtemps
  const visibles = useMemo(() => {
    const q = query.trim().toLowerCase()
    const liste = contributions.filter((c) => {
      if (type !== 'tous' && typeKeyOf(c.type) !== type) return false
      if (!q) return true
      return [c.title, c.content, c.countryName, c.language, c.submittedBy?.name].some((v) => v?.toLowerCase().includes(q))
    })
    const sens = status === 'proposed' ? 1 : -1
    return [...liste].sort((a, b) => sens * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()))
  }, [contributions, type, query, status])

  const plusAncienne = status === 'proposed' && visibles[0] ? visibles[0].createdAt : ''

  const ouverteParts = ouverte ? decouper(ouverte.content) : null
  const ouverteLieu = ouverte ? lieuOf(ouverte) : null
  const OuverteIcone = ouverte ? typeOf(ouverte.type).icon : Sprout
  const vide = EMPTY_TEXTS[status]

  return (
    <div className="mco">
      <header className="mco-head">
        <p>
          Propositions envoyées par les membres depuis la page Contribuer. Chaque décision est accompagnée d’une note,
          que le membre retrouve dans son espace.
        </p>
        <dl className="mco-stats">
          <div className="is-due">
            <dt>À relire</dt>
            <dd>{counts.proposed ?? '–'}</dd>
          </div>
          <div>
            <dt>En vérification</dt>
            <dd>{counts['in-review'] ?? '–'}</dd>
          </div>
          <div>
            <dt>Validées</dt>
            <dd>{counts.approved ?? '–'}</dd>
          </div>
          <div>
            <dt>Au total</dt>
            <dd>{counts.all ?? '–'}</dd>
          </div>
        </dl>
      </header>

      <div className="mco-filtres">
        <TypeChips label="Statut" options={STATUTS} counts={counts} active={status} onChange={(key) => setStatus(key)} />
        <label className="mco-recherche">
          <Search size={16} aria-hidden="true" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher" aria-label="Rechercher une contribution" />
        </label>
      </div>

      <div className="mco-types">
        <div className="mbr-chips" role="group" aria-label="Type de contribution">
          <button type="button" className="mbr-chip" aria-pressed={type === 'tous'} onClick={() => setType('tous')}>
            Tous les types <span>{typeCounts.tous}</span>
          </button>
          {TYPES.map(({ key, label, icon: Icone }) => (
            <button key={key} type="button" className="mbr-chip" aria-pressed={type === key} onClick={() => setType(key)}>
              <Icone size={16} strokeWidth={1.8} aria-hidden="true" /> {label} <span>{typeCounts[key] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mco-compte" aria-live="polite">
        {loading
          ? 'Chargement…'
          : `${visibles.length} contribution${visibles.length > 1 ? 's' : ''}${plusAncienne ? ` · la plus ancienne attend depuis ${dateLongue(plusAncienne)}` : ''}`}
      </p>

      {!loading && visibles.length === 0 ? (
        <section className="mco-vide">
          <span className="mco-vide-picto" aria-hidden="true">
            <Sprout size={28} strokeWidth={1.6} />
          </span>
          <h3>{type !== 'tous' || query ? 'Rien pour ce filtre' : vide.titre}</h3>
          <p>{type !== 'tous' || query ? 'Essayez un autre type ou une autre recherche.' : vide.texte}</p>
          {(type !== 'tous' || query) && (
            <button type="button" className="btn btn-outline btn-small" onClick={() => { setType('tous'); setQuery('') }}>
              Effacer les filtres
            </button>
          )}
        </section>
      ) : (
        <ul className="mco-liste" aria-busy={loading}>
          {visibles.map((contribution) => {
            const { label, icon: Icone } = typeOf(contribution.type)
            const lieu = lieuOf(contribution)
            const pastille = { '--mco-region': lieu.region ? REGION_COLORS[lieu.region] : 'var(--brand-trait-fort)' } as CSSProperties
            return (
              <li key={contribution._id}>
                <button type="button" className="mco-ligne" onClick={(event) => ouvrir(contribution, event.currentTarget)}>
                  <span className="mco-picto" aria-hidden="true">
                    <Icone size={20} strokeWidth={1.8} />
                  </span>
                  <span className="mco-ligne-texte">
                    <span className="mco-kicker">
                      {label}
                      {contribution.language ? ` ${contribution.type === 'proverb' ? contribution.language.toLowerCase() : `· ${contribution.language}`}` : ''}
                    </span>
                    <strong>{contribution.title}</strong>
                    <span className="mco-extrait">{extrait(contribution.content)}</span>
                    <span className="mco-meta">
                      <span className="mco-lieu" style={pastille}>
                        {lieu.pays}
                      </span>
                      <span>{contribution.submittedBy?.name || 'Membre'}</span>
                      <time dateTime={contribution.createdAt} title={dateLongue(contribution.createdAt)}>
                        {ilYa(contribution.createdAt)}
                      </time>
                    </span>
                  </span>
                  <span className="mco-badges">
                    {status === 'all' && <span className={`mco-badge mco-badge--${contribution.status}`}>{STATUT_LABELS[contribution.status] || contribution.status}</span>}
                    {lienSur(contribution.sourceUrl) ? (
                      <span className="mco-badge mco-badge--source">
                        <Link2 size={14} aria-hidden="true" /> Source
                      </span>
                    ) : (
                      <span className="mco-sans-source">Sans lien source</span>
                    )}
                    {contribution.mediaUrl && (
                      <span className="mco-badge">
                        <ImageIcon size={14} aria-hidden="true" /> Média
                      </span>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {ouverte && ouverteParts && ouverteLieu && (
        <div className="mco-voile" onClick={fermer}>
          <aside
            ref={panneauRef}
            className="mco-panneau"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mco-panneau-titre"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={pieger}
          >
            <div className="mco-panneau-haut">
              <p className="mco-kicker">
                <OuverteIcone size={16} strokeWidth={1.8} aria-hidden="true" /> {typeOf(ouverte.type).label} · {STATUT_LABELS[ouverte.status] || ouverte.status}
              </p>
              <button ref={fermerRef} type="button" className="mco-fermer" onClick={fermer} aria-label="Fermer le panneau">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <h3 id="mco-panneau-titre">{ouverte.title}</h3>
            <p className="mco-auteur">
              Proposée par <strong>{ouverte.submittedBy?.name || 'un membre'}</strong> le {dateLongue(ouverte.createdAt)}
              {ouverte.visibility === 'private' ? ' · privée' : ''}
            </p>

            <section className="mco-carte">
              <h4>Contenu</h4>
              <p className="mco-texte">{ouverteParts.texte || ouverte.content}</p>
              {ouverteParts.traduction && (
                <>
                  <h4>Traduction et sens</h4>
                  <p className="mco-texte">{ouverteParts.traduction}</p>
                </>
              )}
            </section>

            <dl className="mco-details">
              <div>
                <dt>Pays</dt>
                <dd>
                  <span className="mco-lieu" style={{ '--mco-region': ouverteLieu.region ? REGION_COLORS[ouverteLieu.region] : 'var(--brand-trait-fort)' } as CSSProperties}>
                    {ouverteLieu.pays}
                    {ouverteLieu.region ? ` · ${REGION_LABELS[ouverteLieu.region]}` : ''}
                  </span>
                </dd>
              </div>
              {ouverte.language && (
                <div>
                  <dt>Langue</dt>
                  <dd>{ouverte.language}</dd>
                </div>
              )}
              {ouverte.period && (
                <div>
                  <dt>Période</dt>
                  <dd>{ouverte.period}</dd>
                </div>
              )}
              {ouverte.location && (
                <div>
                  <dt>Lieu</dt>
                  <dd>{ouverte.location}</dd>
                </div>
              )}
              {ouverteParts.origine && (
                <div>
                  <dt>Origine</dt>
                  <dd>{ouverteParts.origine}</dd>
                </div>
              )}
              {ouverteParts.precisions && !lienSur(ouverteParts.precisions) && (
                <div>
                  <dt>Précisions</dt>
                  <dd>{ouverteParts.precisions}</dd>
                </div>
              )}
              {ouverte.tags && ouverte.tags.length > 0 && (
                <div>
                  <dt>Mots-clés</dt>
                  <dd>{ouverte.tags.join(', ')}</dd>
                </div>
              )}
              <div>
                <dt>Source</dt>
                <dd>
                  {lienSur(ouverte.sourceUrl) ? (
                    <a href={ouverte.sourceUrl} target="_blank" rel="noopener noreferrer nofollow">
                      {(ouverte.sourceUrl || '').replace(/^https?:\/\/(www\.)?/i, '').slice(0, 60)} <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  ) : (
                    ouverte.sourceUrl || 'Aucun lien : à recouper avant validation.'
                  )}
                </dd>
              </div>
              {ouverte.mediaUrl && (
                <div>
                  <dt>Média</dt>
                  <dd>
                    {lienSur(ouverte.mediaUrl) ? (
                      <a href={ouverte.mediaUrl} target="_blank" rel="noopener noreferrer nofollow">
                        Ouvrir le média <ArrowUpRight size={14} aria-hidden="true" />
                      </a>
                    ) : (
                      ouverte.mediaUrl
                    )}
                  </dd>
                </div>
              )}
            </dl>

            {(ouverte.reviewNote || ouverte.reviewedAt) && (
              <section className="mco-historique">
                <h4>Dernière relecture</h4>
                <p>
                  {STATUT_LABELS[ouverte.status] || ouverte.status}
                  {ouverte.reviewedBy?.name ? ` par ${ouverte.reviewedBy.name}` : ''}
                  {ouverte.reviewedAt ? ` le ${dateLongue(ouverte.reviewedAt)}` : ''}
                </p>
                {ouverte.reviewNote && <blockquote>{ouverte.reviewNote}</blockquote>}
              </section>
            )}

            <label className="mco-note">
              Note de relecture <em>(envoyée au membre, obligatoire pour rejeter)</em>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Ex. : merci, le proverbe est validé ; pourriez-vous préciser la région d’origine ?"
              />
            </label>

            <div className="mco-actions">
              {ouverte.status !== 'in-review' && (
                <button type="button" className="btn btn-outline btn-small" disabled={enCours} onClick={() => changeStatus(ouverte._id, 'in-review')}>
                  <Search size={16} aria-hidden="true" /> Mettre en vérification
                </button>
              )}
              {ouverte.status !== 'approved' && (
                <button type="button" className="btn btn-primary btn-small" disabled={enCours} onClick={() => changeStatus(ouverte._id, 'approved')}>
                  <CheckCircle2 size={16} aria-hidden="true" /> Valider
                </button>
              )}
              {ouverte.status !== 'rejected' && (
                <button
                  type="button"
                  className="btn btn-danger btn-small"
                  disabled={enCours || !note.trim()}
                  title={note.trim() ? undefined : 'Ajoutez une note pour expliquer le rejet'}
                  onClick={() => changeStatus(ouverte._id, 'rejected')}
                >
                  <XCircle size={16} aria-hidden="true" /> Rejeter
                </button>
              )}
            </div>

            <div className="mco-suppression">
              {confirmerSuppression ? (
                <>
                  <span>Supprimer définitivement cette contribution ?</span>
                  <button type="button" className="btn btn-danger btn-small" disabled={enCours} onClick={() => supprimer(ouverte._id)}>
                    Oui, supprimer
                  </button>
                  <button type="button" className="btn btn-ghost btn-small" onClick={() => setConfirmerSuppression(false)}>
                    Annuler
                  </button>
                </>
              ) : (
                <button type="button" className="btn btn-ghost btn-small" onClick={() => setConfirmerSuppression(true)}>
                  <Trash2 size={16} aria-hidden="true" /> Supprimer (doublon, spam)
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
