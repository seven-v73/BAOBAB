import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { Dropdown } from '../components/UX/Dropdown'
import { TypeChips } from '../components/UX/TypeChips'
import { useParamState } from '../hooks/useParamState'
import { DOSSIERS, RECITS, type RecitCard } from '../data/recitsContent'
import { joinMeta } from '../utils'
import './Recits.css'

// Récits d'après la maquette Figma « Récits / Desktop 1440 » et « Mobile 390 ».
// Le contenu affiché est exactement celui de la maquette : les contributions
// de la base arriveront quand les pages de détail existeront.

const TYPES = [
  { key: 'tous', label: 'Tous' },
  { key: 'articles', label: 'Articles' },
  { key: 'temoignages', label: 'Témoignages' },
  { key: 'dossiers', label: 'Dossiers' },
] as const

export const Recits = () => {
  const [query, setQuery] = useState('')
  const [pays, setPays] = useState('')
  const [theme, setTheme] = useState('')
  const [type, setType] = useParamState<(typeof TYPES)[number]['key']>('type', 'tous')

  const paysOptions = useMemo(
    () => [...new Set([...RECITS, ...DOSSIERS].map((r) => r.pays).filter((name): name is string => Boolean(name)))].sort(),
    [],
  )
  const themeOptions = useMemo(
    () => [...new Set([...RECITS, ...DOSSIERS].map((r) => r.theme).filter((name): name is string => Boolean(name)))].sort(),
    [],
  )

  const keep = (recit: RecitCard) =>
    (type === 'tous' || recit.type === type) &&
    (!pays || recit.pays === pays) &&
    (!theme || recit.theme === theme) &&
    (!query.trim() || `${recit.title} ${recit.excerpt}`.toLowerCase().includes(query.trim().toLowerCase()))

  const visible = RECITS.filter(keep)
  const visibleDossiers = DOSSIERS.filter(keep)
  const counts = {
    tous: RECITS.length + DOSSIERS.length,
    articles: RECITS.filter((r) => r.type === 'articles').length,
    temoignages: RECITS.filter((r) => r.type === 'temoignages').length,
    dossiers: DOSSIERS.length,
  }
  const [feature, ...rest] = visible

  return (
    <Layout fullWidth>
      <div className="mrc">
        <header className="mrc-intro">
          <h1>Des histoires qui créent des liens</h1>
          <p>Articles, témoignages et dossiers pour comprendre les lieux, les voix et les héritages du continent.</p>
        </header>

        {feature ? (
          <Link to={feature.to} className="mrc-feature">
            {feature.image && (
              <img className="mrc-feature-media" src={feature.image} alt={feature.title} width={680} height={440} />
            )}
            <div className="mrc-feature-body">
              <p className="mrc-kicker">{feature.meta}</p>
              <h2>{feature.title}</h2>
              {feature.excerpt && <p className="mrc-feature-text">{feature.excerpt}</p>}
              {feature.pays && <p className="mrc-meta">{joinMeta(feature.pays, feature.theme)}</p>}
              <span className="mrc-btn">
                Lire le récit <ArrowRight size={18} aria-hidden="true" />
              </span>
            </div>
          </Link>
        ) : (
          visibleDossiers.length === 0 && <p className="mrc-empty">Aucun récit ne correspond pour l’instant.</p>
        )}

        <div className="mrc-filters">
          <TypeChips label="Type de récit" options={TYPES} counts={counts} active={type} onChange={setType} />
          <div className="mrc-refine">
            <Dropdown label="Pays" allLabel="Pays : tous" value={pays} options={paysOptions} onChange={setPays} />
            <Dropdown label="Thème" allLabel="Thème : tous" value={theme} options={themeOptions} onChange={setTheme} />
            <label className="mrc-search">
              <Search size={16} strokeWidth={1.6} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un récit"
                aria-label="Rechercher un récit"
              />
            </label>
          </div>
        </div>

        {rest.length > 0 && (
          <ul className="mrc-grid">
            {rest.map((recit) => (
              <li key={recit.id}>
                <Link to={recit.to} className="mrc-card">
                  {recit.image && <div className="mrc-card-media" style={{ backgroundImage: `url(${recit.image})` }} aria-hidden="true" />}
                  <div className="mrc-card-body">
                    <p className="mrc-kicker">{recit.meta}</p>
                    <h3>{recit.title}</h3>
                    {recit.excerpt && <p className="mrc-card-text">{recit.excerpt}</p>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {visibleDossiers.length > 0 && (
          <section className="mrc-dossiers">
            <header className="mrc-dossiers-head">
              <div>
                <h2>Dossiers</h2>
                <p>Des récits rassemblés autour d’un même sujet.</p>
              </div>
              <Link to="/recits?type=dossiers" className="mrc-more">
                Tous les dossiers <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </header>
            <ul className="mrc-dossiers-list">
              {visibleDossiers.map((dossier) => (
                <li key={dossier.id}>
                  <Link to={dossier.to} className="mrc-dossier">
                    {dossier.image && <img className="mrc-dossier-img" src={dossier.image} alt="" loading="lazy" />}
                    <div className="mrc-dossier-body">
                      <p className="mrc-kicker">{dossier.meta}</p>
                      <h3>{dossier.title}</h3>
                      <span className="mrc-dossier-link">
                        Ouvrir le dossier <ArrowRight size={16} aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Layout>
  )
}
