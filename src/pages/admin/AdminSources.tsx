import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, FormEvent, MouseEvent } from 'react'
import {
  Archive,
  ArrowUpRight,
  BookOpen,
  CircleAlert,
  FileText,
  Globe,
  Landmark,
  MessageSquareQuote,
  Newspaper,
  Pencil,
  Plus,
  Search,
  Video,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { sourceService } from '../../services/api'
import { useNotifications } from '../../hooks/useNotifications'
import { Dropdown } from '../../components/UX/Dropdown'
import { TypeChips } from '../../components/UX/TypeChips'
import { countryNameOf, REGION_COLORS, REGION_LABELS, regionOfCode } from '../../utils/afrique'
import './AdminSources.css'

// Bibliothèque de référence : l'équipe ajoute et corrige les sources (ouvrages, archives,
// musées, témoignages…) qui fondent les contenus, chacune avec sa note de fiabilité.

interface Source {
  _id: string
  type: string
  title: string
  author?: string
  publisher?: string
  year?: number
  url?: string
  language?: string
  reliability?: number
  description?: string
  keywords?: string[]
  relatedTopics?: string[]
  relatedCountries?: Array<{ _id?: string; id?: string; nameFr?: string } | string>
}

const emptyForm = {
  type: 'website',
  title: '',
  author: '',
  publisher: '',
  year: '',
  url: '',
  language: 'fr',
  reliability: 3,
  description: '',
  keywords: '',
  relatedTopics: '',
}
type SourceForm = typeof emptyForm
type FormErrors = Partial<Record<'title' | 'year' | 'url', string>>

const TYPE_META: Record<string, { label: string; plural: string; icon: LucideIcon }> = {
  book: { label: 'Livre', plural: 'Livres', icon: BookOpen },
  article: { label: 'Article', plural: 'Articles', icon: Newspaper },
  document: { label: 'Document', plural: 'Documents', icon: FileText },
  archive: { label: 'Archive', plural: 'Archives', icon: Archive },
  museum: { label: 'Musée', plural: 'Musées', icon: Landmark },
  testimony: { label: 'Témoignage', plural: 'Témoignages', icon: MessageSquareQuote },
  video: { label: 'Audio/vidéo', plural: 'Audio et vidéo', icon: Video },
  website: { label: 'Site', plural: 'Sites', icon: Globe },
}
const TYPE_KEYS = Object.keys(TYPE_META)
const TYPES = [{ key: 'tous', label: 'Toutes' }, ...TYPE_KEYS.map((key) => ({ key, label: TYPE_META[key].plural }))]

const RELIABILITY_LABELS: Record<number, string> = {
  1: 'faible',
  2: 'à vérifier',
  3: 'contextualisée',
  4: 'solide',
  5: 'officielle',
}
const RELIABILITY_FILTERS = ['4 et plus : très fiables', '3 et plus : contextualisées', '2 et moins : à vérifier']

const LANGUAGES: Array<[string, string]> = [
  ['fr', 'Français'],
  ['en', 'Anglais'],
  ['pt', 'Portugais'],
  ['ar', 'Arabe'],
  ['sw', 'Swahili'],
  ['es', 'Espagnol'],
  ['de', 'Allemand'],
]

const CURRENT_YEAR = new Date().getFullYear()

const codesOf = (source: Source) =>
  (source.relatedCountries || [])
    .map((country) => (typeof country === 'string' ? country : country.id || ''))
    .filter((code) => /^[a-z]{2}$/i.test(code))
    .map((code) => code.toUpperCase())

const joinMeta = (...parts: Array<string | number | undefined | null | false>) => parts.filter(Boolean).join(' · ')

const validate = (form: SourceForm): FormErrors => {
  const errors: FormErrors = {}
  if (!form.title.trim()) errors.title = 'Le titre est obligatoire.'
  const year = form.year.trim()
  if (year && (!/^-?\d{1,4}$/.test(year) || Number(year) > CURRENT_YEAR + 1)) {
    errors.year = `Année attendue en chiffres, jusqu’à ${CURRENT_YEAR + 1} (négative avant notre ère).`
  }
  const url = form.url.trim()
  if (url) {
    try {
      const parsed = new URL(url)
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('protocole')
    } catch {
      errors.url = 'Adresse complète attendue, commençant par https://'
    }
  }
  return errors
}

/** Note de fiabilité en cinq points, lue « fiabilité 4 sur 5 » par les lecteurs d'écran. */
const Reliability = ({ value }: { value: number }) => (
  <span className="mas-fiabilite" title={`Fiabilité ${value} sur 5 : ${RELIABILITY_LABELS[value] || ''}`}>
    <span className="mas-points" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((point) => (
        <span key={point} className={point <= value ? 'is-plein' : undefined} />
      ))}
    </span>
    <span className="sr-only">Fiabilité {value} sur 5</span>
  </span>
)

export const AdminSources = () => {
  const [sources, setSources] = useState<Source[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('tous')
  const [reliability, setReliability] = useState('')
  const [query, setQuery] = useState('')
  const { success, error } = useNotifications()
  const opener = useRef<HTMLElement | null>(null)
  const titleInput = useRef<HTMLInputElement>(null)

  const fetchSources = useCallback(async () => {
    try {
      setLoading(true)
      const response = await sourceService.getAll({ limit: 100 })
      setSources(response.data.sources || [])
    } catch (fetchError) {
      console.error('Erreur sources admin:', fetchError)
      error('Impossible de charger les sources')
    } finally {
      setLoading(false)
    }
  }, [error])

  useEffect(() => {
    fetchSources()
  }, [fetchSources])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId('')
    setErrors({})
  }

  const closePanel = useCallback(() => {
    setPanelOpen(false)
    setForm(emptyForm)
    setEditingId('')
    setErrors({})
    opener.current?.focus()
  }, [])

  // Échap ferme le panneau ; le titre reçoit le focus à l'ouverture
  useEffect(() => {
    if (!panelOpen) return
    titleInput.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) closePanel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [panelOpen, closePanel])

  const openNew = (event: MouseEvent<HTMLElement>) => {
    opener.current = event.currentTarget
    resetForm()
    setPanelOpen(true)
  }

  const editSource = (source: Source, event: MouseEvent<HTMLElement>) => {
    opener.current = event.currentTarget
    setErrors({})
    setEditingId(source._id)
    setForm({
      type: source.type || 'website',
      title: source.title || '',
      author: source.author || '',
      publisher: source.publisher || '',
      year: source.year ? String(source.year) : '',
      url: source.url || '',
      language: source.language || 'fr',
      reliability: source.reliability || 3,
      description: source.description || '',
      keywords: source.keywords?.join(', ') || '',
      relatedTopics: source.relatedTopics?.join(', ') || '',
    })
    setPanelOpen(true)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const found = validate(form)
    setErrors(found)
    const firstError = (['title', 'year', 'url'] as const).find((key) => found[key])
    if (firstError) {
      document.getElementById(`mas-${firstError}`)?.focus()
      return
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      url: form.url.trim(),
      year: form.year.trim() ? Number(form.year) : null,
      reliability: Number(form.reliability),
      keywords: form.keywords.split(',').map((item) => item.trim()).filter(Boolean),
      relatedTopics: form.relatedTopics.split(',').map((item) => item.trim()).filter(Boolean),
    }

    setSaving(true)
    try {
      if (editingId) {
        await sourceService.update(editingId, payload)
        success('Source mise à jour')
      } else {
        await sourceService.create(payload)
        success('Source ajoutée')
      }
      closePanel()
      fetchSources()
    } catch (submitError) {
      console.error('Erreur sauvegarde source:', submitError)
      error('Impossible de sauvegarder la source')
    } finally {
      setSaving(false)
    }
  }

  const set = <K extends keyof SourceForm>(key: K, value: SourceForm[K]) => setForm((current) => ({ ...current, [key]: value }))

  // Filtres : la fiabilité et la recherche s'appliquent avant les compteurs par type
  const scoped = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sources.filter((source) => {
      const note = source.reliability || 3
      if (reliability.startsWith('4') && note < 4) return false
      if (reliability.startsWith('3') && note < 3) return false
      if (reliability.startsWith('2') && note > 2) return false
      if (!q) return true
      const haystack = [source.title, source.author, source.publisher, source.description, source.year, ...(source.keywords || [])]
        .concat(codesOf(source).map(countryNameOf))
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [sources, reliability, query])

  const visible = type === 'tous' ? scoped : scoped.filter((source) => source.type === type)
  const counts = Object.fromEntries(TYPES.map(({ key }) => [key, key === 'tous' ? scoped.length : scoped.filter((s) => s.type === key).length]))

  const stats = useMemo(
    () => ({
      reliable: sources.filter((source) => (source.reliability || 3) >= 4).length,
      countries: new Set(sources.flatMap(codesOf)).size,
      types: new Set(sources.map((source) => source.type)).size,
    }),
    [sources],
  )

  const filtersActive = type !== 'tous' || reliability !== '' || query.trim() !== ''
  const languageOptions = LANGUAGES.some(([code]) => code === form.language) ? LANGUAGES : [...LANGUAGES, [form.language, form.language] as [string, string]]

  const fieldError = (key: keyof FormErrors) =>
    errors[key] ? (
      <span className="mas-erreur" id={`mas-${key}-erreur`}>
        <CircleAlert size={14} aria-hidden="true" /> {errors[key]}
      </span>
    ) : null
  const errorProps = (key: keyof FormErrors) => ({
    id: `mas-${key}`,
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `mas-${key}-erreur` : undefined,
  })

  return (
    <div className="mas">
      <header className="mas-head">
        <div className="mas-intro">
          <p>Ouvrages, archives, musées et témoignages qui fondent les contenus. Chaque source porte une note de fiabilité de 1 à 5, affichée sur la page publique Sources.</p>
          <button type="button" className="btn btn-primary" onClick={openNew}>
            <Plus size={18} aria-hidden="true" /> Ajouter une source
          </button>
        </div>
        <dl className="mas-stats">
          <div>
            <dt>Sources</dt>
            <dd>{sources.length}</dd>
          </div>
          <div>
            <dt>Très fiables (4–5)</dt>
            <dd>{stats.reliable}</dd>
          </div>
          <div>
            <dt>Pays couverts</dt>
            <dd>{stats.countries}</dd>
          </div>
          <div>
            <dt>Types</dt>
            <dd>
              {stats.types}
              <span> sur {TYPE_KEYS.length}</span>
            </dd>
          </div>
        </dl>
      </header>

      <div className="mas-filtres">
        <div className="mas-types">
          <TypeChips label="Type de source" options={TYPES} counts={counts} active={type} onChange={setType} />
        </div>
        <div className="mas-affiner">
          <Dropdown label="Fiabilité" allLabel="Fiabilité : toutes" value={reliability} options={RELIABILITY_FILTERS} onChange={setReliability} />
          <label className="mas-recherche">
            <Search size={16} aria-hidden="true" />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Titre, auteur, pays…" aria-label="Rechercher une source" />
          </label>
        </div>
      </div>

      <p className="mas-compte" aria-live="polite">
        {loading ? 'Chargement des sources…' : `${visible.length} source${visible.length > 1 ? 's' : ''}${filtersActive ? ` sur ${sources.length}` : ''}`}
      </p>

      {!loading && visible.length === 0 ? (
        <div className="mas-vide">
          <p>{sources.length === 0 ? 'La bibliothèque est vide pour le moment.' : 'Aucune source ne correspond à ces filtres.'}</p>
          {sources.length === 0 ? (
            <button type="button" className="btn btn-outline btn-small" onClick={openNew}>
              <Plus size={16} aria-hidden="true" /> Ajouter la première source
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={() => {
                setType('tous')
                setReliability('')
                setQuery('')
              }}
            >
              Effacer les filtres
            </button>
          )}
        </div>
      ) : (
        <ul className="mas-liste" aria-busy={loading || undefined}>
          {visible.map((source) => {
            const meta = TYPE_META[source.type] || { label: source.type, plural: source.type, icon: FileText }
            const Icon = meta.icon
            const codes = codesOf(source)
            const note = source.reliability || 3
            return (
              <li key={source._id} className="mas-ligne">
                <button type="button" className="mas-ligne-main" onClick={(event) => editSource(source, event)}>
                  <span className="mas-icone" aria-hidden="true">
                    <Icon size={20} strokeWidth={1.7} />
                  </span>
                  <span className="mas-ligne-texte">
                    <span className="mas-kicker">{meta.label}</span>
                    <strong>{source.title}</strong>
                    {joinMeta(source.author, source.publisher !== source.author && source.publisher, source.year) && (
                      <span className="mas-meta">{joinMeta(source.author, source.publisher !== source.author && source.publisher, source.year)}</span>
                    )}
                  </span>
                </button>
                <div className="mas-ligne-infos">
                  <Reliability value={note} />
                  <ul className="mas-pays" aria-label="Pays liés">
                    {codes.length === 0 ? (
                      <li className="mas-pays--continent">Tout le continent</li>
                    ) : (
                      <>
                        {codes.slice(0, 4).map((code) => {
                          const region = regionOfCode(code)
                          return (
                            <li key={code} style={{ '--mas-region': region ? REGION_COLORS[region] : 'var(--brand-sauge)' } as CSSProperties} title={region ? REGION_LABELS[region] : undefined}>
                              {countryNameOf(code) || code}
                            </li>
                          )
                        })}
                        {codes.length > 4 && (
                          <li className="mas-pays--plus" title={codes.slice(4).map((code) => countryNameOf(code) || code).join(', ')}>
                            +{codes.length - 4}
                          </li>
                        )}
                      </>
                    )}
                  </ul>
                </div>
                <div className="mas-ligne-actions">
                  {source.url && (
                    <a className="mas-action" href={source.url} target="_blank" rel="noopener noreferrer nofollow" aria-label={`Ouvrir « ${source.title} » (nouvel onglet)`} title="Ouvrir la source">
                      <ArrowUpRight size={18} aria-hidden="true" />
                    </a>
                  )}
                  <button type="button" className="mas-action" onClick={(event) => editSource(source, event)} aria-label={`Modifier « ${source.title} »`} title="Modifier">
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {panelOpen && (
        <div className="mas-voile" onClick={closePanel}>
          <form
            className="mas-panneau"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mas-panneau-titre"
            noValidate
            onSubmit={handleSubmit}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mas-panneau-tete">
              <div>
                <p className="mas-kicker">{editingId ? 'Modification' : 'Nouvelle source'}</p>
                <h3 id="mas-panneau-titre">{editingId ? form.title || 'Source sans titre' : 'Ajouter une source'}</h3>
              </div>
              <button type="button" className="mas-action" onClick={closePanel} aria-label="Fermer le panneau">
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="mas-panneau-corps">
              <div className="mas-groupe" role="group" aria-labelledby="mas-g-id">
                <h4 id="mas-g-id">Identification</h4>
                <label className="mas-champ mas-champ--large">
                  <span>
                    Titre <em>(obligatoire)</em>
                  </span>
                  <input ref={titleInput} required value={form.title} onChange={(event) => set('title', event.target.value)} {...errorProps('title')} />
                  {fieldError('title')}
                </label>
                <label className="mas-champ">
                  <span>Type</span>
                  <select value={form.type} onChange={(event) => set('type', event.target.value)}>
                    {TYPE_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {TYPE_META[key].label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mas-champ">
                  <span>Langue</span>
                  <select value={form.language} onChange={(event) => set('language', event.target.value)}>
                    {languageOptions.map(([code, label]) => (
                      <option key={code} value={code}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mas-champ">
                  <span>Auteur</span>
                  <input value={form.author} onChange={(event) => set('author', event.target.value)} />
                </label>
                <label className="mas-champ">
                  <span>Éditeur ou institution</span>
                  <input value={form.publisher} onChange={(event) => set('publisher', event.target.value)} />
                </label>
                <label className="mas-champ">
                  <span>Année</span>
                  <input inputMode="numeric" value={form.year} onChange={(event) => set('year', event.target.value)} placeholder="1960" {...errorProps('year')} />
                  {fieldError('year')}
                </label>
                <label className="mas-champ mas-champ--large">
                  <span>Adresse (URL)</span>
                  <input type="url" inputMode="url" value={form.url} onChange={(event) => set('url', event.target.value)} placeholder="https://" {...errorProps('url')} />
                  {fieldError('url')}
                </label>
              </div>

              <div className="mas-groupe" role="group" aria-labelledby="mas-g-fiab">
                <h4 id="mas-g-fiab">Fiabilité</h4>
                <div className="mas-notes">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label key={value} className="mas-note">
                      <input type="radio" name="reliability" value={value} checked={Number(form.reliability) === value} onChange={() => set('reliability', value)} />
                      <span>
                        <strong>{value}</strong> {RELIABILITY_LABELS[value]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mas-groupe" role="group" aria-labelledby="mas-g-contenu">
                <h4 id="mas-g-contenu">Contenu</h4>
                <label className="mas-champ mas-champ--large">
                  <span>Description</span>
                  <textarea rows={4} value={form.description} onChange={(event) => set('description', event.target.value)} />
                </label>
                <label className="mas-champ mas-champ--large">
                  <span>Mots-clés</span>
                  <input value={form.keywords} onChange={(event) => set('keywords', event.target.value)} aria-describedby="mas-aide-mots" />
                  <small id="mas-aide-mots">Séparés par des virgules.</small>
                </label>
                <label className="mas-champ mas-champ--large">
                  <span>Thèmes liés</span>
                  <input value={form.relatedTopics} onChange={(event) => set('relatedTopics', event.target.value)} aria-describedby="mas-aide-themes" />
                  <small id="mas-aide-themes">Séparés par des virgules.</small>
                </label>
              </div>
            </div>

            <div className="mas-panneau-actions">
              <button type="button" className="btn btn-ghost" onClick={closePanel} disabled={saving}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
