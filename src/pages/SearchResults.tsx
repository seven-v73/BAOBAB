import { useEffect, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { TypeChips } from '../components/UX/TypeChips'
import { searchService } from '../services/api'
import { joinMeta } from '../utils'
import { findCountryCodes, formatHistoricalDate, placeOf, REGION_COLORS, type Place } from '../utils/afrique'
import './Rubriques.css'
import './SearchResults.css'

// Recherche, regroupée selon les rubriques de la refonte : Pays, Récits, Repères, Sources.
// Boutique, cercles et quiz sont en pause : leurs résultats ne sont pas proposés.

interface Hit {
  key: string
  kind: string
  title: string
  text?: string
  to: string
  place: Place
}

const GROUPS = [
  { key: 'tout', label: 'Tout' },
  { key: 'pays', label: 'Pays' },
  { key: 'recits', label: 'Récits' },
  { key: 'reperes', label: 'Repères' },
  { key: 'sources', label: 'Sources' },
] as const
type GroupKey = (typeof GROUPS)[number]['key']

const toHits = (data: any): Record<Exclude<GroupKey, 'tout'>, Hit[]> => {
  const list = (key: string) => (Array.isArray(data?.[key]) ? data[key] : [])
  return {
    pays: list('countries').map((c: any) => ({
      key: `country-${c.id}`,
      kind: 'Pays',
      title: c.nameFr || c.name,
      text: joinMeta(c.capital, c.region || c.subregion),
      to: `/country/${String(c.id).toLowerCase()}`,
      place: placeOf([String(c.id).toUpperCase()]),
    })),
    recits: [
      ...list('blogs').map((b: any) => ({
        key: `blog-${b._id}`,
        kind: b.kind === 'temoignage' ? 'Témoignage' : 'Article',
        title: b.title,
        text: b.excerpt,
        to: `/blog/${b._id}`,
        place: placeOf([...new Set([b.country && String(b.country).toUpperCase(), ...findCountryCodes(b.title, b.tags)].filter(Boolean) as string[])]),
      })),
      ...list('stories').map((s: any) => ({
        key: `story-${s._id}`,
        kind: 'Histoire',
        title: s.title,
        text: s.subtitle || s.description,
        to: `/stories/${s._id}`,
        place: placeOf(findCountryCodes(s.tags, s.title)),
      })),
      ...list('collections').map((c: any) => ({
        key: `collection-${c._id}`,
        kind: 'Dossier',
        title: c.title,
        text: c.shortDescription,
        to: `/collections/${c._id}`,
        place: placeOf(findCountryCodes(c.tags, c.title)),
      })),
    ],
    reperes: [
      ...list('events').map((e: any) => ({
        key: `event-${e._id}`,
        kind: joinMeta('Date', formatHistoricalDate(e.date)),
        title: e.title,
        text: e.shortDescription,
        to: `/timeline/${e._id}`,
        place: placeOf(findCountryCodes(e.location?.region, e.title)),
      })),
      ...list('figures').map((f: any) => ({
        key: `figure-${f._id}`,
        kind: 'Personnalité',
        title: f.name,
        text: f.shortBiography,
        to: `/figures/${f._id}`,
        place: placeOf(findCountryCodes(f.birthPlace?.location, f.shortBiography)),
      })),
      ...list('proverbs').map((p: any) => ({
        key: `proverb-${p._id}`,
        kind: joinMeta('Proverbe', p.language && p.language.toLowerCase()),
        title: `« ${p.text} »`,
        to: '/reperes?type=proverbes',
        place: placeOf(findCountryCodes(p.countryName)),
      })),
    ],
    sources: list('sources').map((s: any) => ({
      key: `source-${s._id}`,
      kind: joinMeta('Source', s.reliability && `fiabilité ${s.reliability}/5`),
      title: s.title,
      text: joinMeta(s.author, s.publisher, s.year),
      to: '/sources',
      place: placeOf([]),
    })),
  }
}

export const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [draft, setDraft] = useState(query)
  const [group, setGroup] = useState<GroupKey>('tout')
  const [hits, setHits] = useState<ReturnType<typeof toHits> | null>(null)
  const [status, setStatus] = useState<'idle' | 'chargement' | 'pret' | 'erreur'>('idle')

  useEffect(() => setDraft(query), [query])

  useEffect(() => {
    if (!query.trim()) {
      setHits(null)
      setStatus('idle')
      return
    }
    let cancelled = false
    setStatus('chargement')
    searchService
      .search({ q: query, limit: 12 })
      .then((response) => {
        if (cancelled) return
        setHits(toHits(response.data))
        setStatus('pret')
      })
      .catch(() => !cancelled && setStatus('erreur'))
    return () => {
      cancelled = true
    }
  }, [query])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const next = draft.trim()
    if (next) setSearchParams({ q: next })
  }

  const counts: Partial<Record<GroupKey, number>> = hits
    ? ({ tout: hits.pays.length + hits.recits.length + hits.reperes.length + hits.sources.length, pays: hits.pays.length, recits: hits.recits.length, reperes: hits.reperes.length, sources: hits.sources.length } as Record<GroupKey, number>)
    : {}
  const sections = hits
    ? (GROUPS.filter((g) => g.key !== 'tout' && (group === 'tout' || group === g.key)) as Array<{ key: Exclude<GroupKey, 'tout'>; label: string }>).filter((g) => hits[g.key].length > 0)
    : []

  return (
    <Layout fullWidth>
      <div className="mse">
        <header className="mse-intro">
          <h1>{query ? <>Résultats pour « {query} »</> : 'Rechercher sur MonBaobab'}</h1>
          <form className="mse-form" onSubmit={submit} role="search">
            <Search size={18} strokeWidth={1.6} aria-hidden="true" />
            <input type="search" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Un pays, une personnalité, un proverbe…" aria-label="Rechercher" />
            <button type="submit" className="mbr-button">
              Rechercher
            </button>
          </form>
        </header>

        {hits && (counts.tout ?? 0) > 0 && (
          <div className="mse-filters">
            <TypeChips label="Rubrique" options={GROUPS} counts={counts} active={group} onChange={setGroup} />
          </div>
        )}

        {status === 'chargement' && <p className="mse-state">Recherche en cours…</p>}
        {status === 'erreur' && <p className="mse-state">La recherche n’a pas abouti. Vérifiez votre connexion, puis réessayez.</p>}
        {status === 'pret' && counts.tout === 0 && (
          <p className="mse-state">
            Aucun résultat pour « {query} ». Essayez un nom de pays, une personnalité ou un thème, ou <Link to="/contribute">proposez un contenu</Link>.
          </p>
        )}

        {sections.map((section) => (
          <section key={section.key} className="mse-section">
            <h2>
              {section.label} <span>{hits![section.key].length}</span>
            </h2>
            <ul className="mse-grid">
              {hits![section.key].map((hit) => (
                <li key={hit.key}>
                  <Link to={hit.to} className="mse-card" style={{ '--mse-region': hit.place.region ? REGION_COLORS[hit.place.region] : 'var(--brand-sauge)' } as CSSProperties}>
                    <span className="mse-kicker">{hit.kind}</span>
                    <strong>{hit.title}</strong>
                    {hit.text && <span className="mse-text">{hit.text}</span>}
                    <span className="mse-place">
                      <i aria-hidden="true" />
                      {hit.place.pays}
                    </span>
                    <ArrowRight className="mse-arrow" size={18} strokeWidth={1.6} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Layout>
  )
}
