import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { Dropdown } from '../components/UX/Dropdown'
import { TypeChips } from '../components/UX/TypeChips'
import { useParamState } from '../hooks/useParamState'
import { DATES, PERSONNALITES, PROVERBES } from '../data/reperesContent'
import './Reperes.css'

// Repères d'après la maquette Figma « Repères / Desktop 1440 » et « Mobile 390 ».
// Rassemble la chronologie, les personnalités et les proverbes (clean.md).

type RepereType = 'tout' | 'dates' | 'personnalites' | 'proverbes'

const TYPES = [
  { key: 'tout', label: 'Tout' },
  { key: 'dates', label: 'Dates' },
  { key: 'personnalites', label: 'Personnalités' },
  { key: 'proverbes', label: 'Proverbes' },
] as const

export const Reperes = () => {
  const [type, setType] = useParamState<RepereType>('type', 'tout')
  const [pays, setPays] = useState('')
  const [epoque, setEpoque] = useState('')

  const paysOptions = useMemo(
    () => [...new Set([...DATES, ...PERSONNALITES].map((item) => item.pays))].sort(),
    [],
  )
  const epoqueOptions = useMemo(() => [...new Set(DATES.map((item) => item.epoque))], [])

  const dates = DATES.filter((d) => (type === 'tout' || type === 'dates') && (!pays || d.pays === pays) && (!epoque || d.epoque === epoque))
  const personnalites = PERSONNALITES.filter((p) => (type === 'tout' || type === 'personnalites') && (!pays || p.pays === pays))
  const proverbes = PROVERBES.filter(() => type === 'tout' || type === 'proverbes')

  const counts = {
    tout: DATES.length + PERSONNALITES.length + PROVERBES.length,
    dates: DATES.length,
    personnalites: PERSONNALITES.length,
    proverbes: PROVERBES.length,
  }

  return (
    <Layout fullWidth>
      <div className="mrp">
        <header className="mrp-intro">
          <h1>Des repères pour s’orienter</h1>
          <p>Dates charnières, personnalités et proverbes : de quoi poser un contexte, situer une époque, comprendre un mot. Chaque entrée renvoie à sa source.</p>
        </header>

        <div className="mrp-filters">
          <TypeChips label="Type de repère" options={TYPES} counts={counts} active={type} onChange={setType} />
          <div className="mrp-refine">
            <Dropdown label="Pays" allLabel="Pays : tous" value={pays} options={paysOptions} onChange={setPays} />
            <Dropdown label="Époque" allLabel="Époque : toutes" value={epoque} options={epoqueOptions} onChange={setEpoque} />
          </div>
        </div>

        {dates.length > 0 && (
          <section className="mrp-dates">
            <header className="mrp-head mrp-head--clair">
              <div>
                <h2>Dates</h2>
                <p>Cinq dates pour poser le récit du continent.</p>
              </div>
              <Link to="/reperes?type=dates" className="mrp-more">
                Toutes les dates <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </header>

            {/* Desktop : frise horizontale. Mobile : frise verticale dans la carte. */}
            <ol className="mrp-frise">
              {dates.map((date) => (
                <li key={date.id}>
                  <span className="mrp-point" style={{ background: date.couleur }} aria-hidden="true" />
                  <span className="mrp-date-card">
                    <strong>{date.annee}</strong>
                    <span className="mrp-date-titre">{date.titre}</span>
                    <span className="mrp-date-pays">
                      <i style={{ background: date.couleur }} />
                      {date.pays}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {personnalites.length > 0 && (
          <section className="mrp-section">
            <header className="mrp-head">
              <div>
                <h2>Personnalités</h2>
                <p>Celles et ceux qui font encore récit.</p>
              </div>
              <Link to="/reperes?type=personnalites" className="mrp-more">
                Toutes les personnalités <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </header>
            <ul className="mrp-figures">
              {personnalites.map((personnalite) => (
                <li key={personnalite.id}>
                  <div className="mrp-figure">
                    <img src={personnalite.portrait} alt={personnalite.nom} width={261} height={240} loading="lazy" />
                    <div>
                      <p className="mrp-kicker">{personnalite.dates}</p>
                      <h3>{personnalite.nom}</h3>
                      <p className="mrp-figure-role">{personnalite.role}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {proverbes.length > 0 && (
          <section className="mrp-section mrp-section--last">
            <header className="mrp-head">
              <div>
                <h2>Proverbes</h2>
                <p>La sagesse du continent, transmise en une phrase.</p>
              </div>
              <Link to="/reperes?type=proverbes" className="mrp-more">
                Tous les proverbes <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </header>
            <ul className="mrp-proverbes">
              {proverbes.map((proverbe) => (
                <li key={proverbe.id} className={proverbe.sombre ? 'mrp-proverbe--sombre' : undefined}>
                  <blockquote>
                    <span className="mrp-guillemet" aria-hidden="true">
                      «
                    </span>
                    {proverbe.citation}»
                  </blockquote>
                  <p className="mrp-kicker">{proverbe.origine}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {dates.length + personnalites.length + proverbes.length === 0 && (
          <p className="mrp-empty">Aucun repère ne correspond pour l’instant.</p>
        )}
      </div>
    </Layout>
  )
}
