import { useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { Dropdown } from '../components/UX/Dropdown'
import { TypeChips } from '../components/UX/TypeChips'
import { useParamState } from '../hooks/useParamState'
import { useReperes, type DateItem, type FigureItem } from '../hooks/useRubriques'
import { initialsOf, interleaveByRegion, REGION_COLORS, REGION_LABELS, REGION_ORDER, type Region } from '../utils/afrique'
import type { Place } from '../utils/afrique'
import './Reperes.css'

// Repères d'après la maquette Figma « Repères / Desktop 1440 » et « Mobile 390 », alimentés par la
// base : chronologie, personnalités et proverbes. Lecture pluriculturelle : filtre par région,
// sélections qui parcourent les régions, pays et langue d'origine affichés.

type RepereType = 'tout' | 'dates' | 'personnalites' | 'proverbes'

const TYPES = [
  { key: 'tout', label: 'Tout' },
  { key: 'dates', label: 'Dates' },
  { key: 'personnalites', label: 'Personnalités' },
  { key: 'proverbes', label: 'Proverbes' },
] as const

const REGIONS = [{ key: 'partout', label: 'Tout le continent' }, ...REGION_ORDER.map((key) => ({ key, label: REGION_LABELS[key] }))] as const
type RegionKey = 'partout' | Region

const EPOQUES = ['Préhistoire', 'Antiquité', 'Moyen-Âge', 'Période Moderne', 'Époque Contemporaine']
const FRISE = 5
const PROVERBES_PAGE = 12

const regionColor = (region: Region | null) => (region ? REGION_COLORS[region] : 'var(--brand-sauge)')
const regionStyle = (region: Region | null) => ({ '--mrp-region': regionColor(region) }) as CSSProperties

const chunk = <T,>(items: T[], size: number) => Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, i * size + size))

/** Lien quand le repère a sa fiche, simple bloc sinon (contenu de la maquette) */
const MaybeLink = ({ to, className, style, children }: { to?: string; className: string; style?: CSSProperties; children: ReactNode }) =>
  to ? (
    <Link to={to} className={className} style={style}>
      {children}
    </Link>
  ) : (
    <div className={className} style={style}>
      {children}
    </div>
  )

const PlaceLine = ({ item, className }: { item: Place; className: string }) => (
  <span className={className}>
    <i aria-hidden="true" />
    {item.pays}
  </span>
)

const Portrait = ({ figure }: { figure: FigureItem }) =>
  figure.portrait ? (
    <img src={figure.portrait} alt="" width={261} height={240} loading="lazy" />
  ) : (
    <span className="mrp-monogramme" aria-hidden="true">
      {initialsOf(figure.nom)}
    </span>
  )

/** Sélection qui parcourt les régions, remise dans l'ordre chronologique */
const parcours = (dates: DateItem[], count: number) =>
  interleaveByRegion(dates, (date) => date.region)
    .slice(0, count)
    .sort((a, b) => (a.year ?? 0) - (b.year ?? 0))

export const Reperes = () => {
  const { dates: allDates, figures: allFigures, proverbs: allProverbs, proverbeDuJour, status } = useReperes()
  const [type, setType] = useParamState<RepereType>('type', 'tout')
  const [region, setRegion] = useParamState<RegionKey>('region', 'partout')
  const [pays, setPays] = useState('')
  const [epoque, setEpoque] = useState('')
  const [proverbesShown, setProverbesShown] = useState(PROVERBES_PAGE)

  const paysOptions = useMemo(
    () =>
      [...new Set([...allDates, ...allFigures, ...allProverbs].flatMap((item) => item.pays.split(', ')))]
        .filter((name) => name && !['Tout le continent', 'Afrique et monde'].includes(name))
        .sort((a, b) => a.localeCompare(b, 'fr')),
    [allDates, allFigures, allProverbs],
  )
  const epoqueOptions = useMemo(() => EPOQUES.filter((name) => allDates.some((date) => date.epoque === name)), [allDates])

  const inPlace = (item: Place) => (region === 'partout' || item.region === region) && (!pays || item.pays.split(', ').includes(pays))
  const dates = allDates.filter((date) => inPlace(date) && (!epoque || date.epoque === epoque))
  const figures = allFigures.filter(inPlace)
  const proverbs = allProverbs.filter(inPlace)

  const counts = { tout: dates.length + figures.length + proverbs.length, dates: dates.length, personnalites: figures.length, proverbes: proverbs.length }
  const regionCounts = Object.fromEntries(
    REGIONS.map(({ key }) => {
      const inRegion = (item: Place) => key === 'partout' || item.region === key
      const total =
        (type === 'tout' || type === 'dates' ? allDates.filter(inRegion).length : 0) +
        (type === 'tout' || type === 'personnalites' ? allFigures.filter(inRegion).length : 0) +
        (type === 'tout' || type === 'proverbes' ? allProverbs.filter(inRegion).length : 0)
      return [key, total]
    }),
  ) as Record<RegionKey, number>

  const showDates = (type === 'tout' || type === 'dates') && dates.length > 0
  const showFigures = (type === 'tout' || type === 'personnalites') && figures.length > 0
  const showProverbs = (type === 'tout' || type === 'proverbes') && proverbs.length > 0

  // Vue « Tout » : un aperçu qui traverse les régions ; vue dédiée : tout, frise par lignes de cinq
  const datesShown = type === 'dates' ? dates : parcours(dates, FRISE)
  const figuresShown = type === 'personnalites' ? interleaveByRegion(figures, (f) => f.region) : interleaveByRegion(figures, (f) => f.region).slice(0, 4)
  // Le proverbe du jour (le même pour tous, toute la journée) ouvre la liste quand il entre dans les filtres
  const duJour = proverbeDuJour && inPlace(proverbeDuJour) ? proverbeDuJour : null
  const proverbsAll = [
    ...(duJour ? [duJour] : []),
    ...interleaveByRegion(proverbs, (p) => p.region).filter((p) => !duJour || (p.id !== duJour.id && p.citation !== duJour.citation)),
  ]
  const proverbsShown = type === 'proverbes' ? proverbsAll.slice(0, proverbesShown) : proverbsAll.slice(0, 3)

  const first = datesShown[0]
  const last = datesShown[datesShown.length - 1]
  const datesSubtitle =
    datesShown.length > 1 && first.year !== null
      ? `${datesShown.length} dates, de ${first.annee} à ${last.annee}${type === 'tout' ? ', d’une région à l’autre' : ''}.`
      : 'Des dates pour poser le récit du continent.'

  return (
    <Layout fullWidth>
      <div className="mrp">
        <header className="mrp-intro">
          <h1>Des repères pour s’orienter</h1>
          <p>
            Dates charnières, personnalités et proverbes, du Maghreb au Cap et de Dakar à Zanzibar : de quoi poser un contexte, situer une
            époque, entendre une langue.
          </p>
        </header>

        <div className="mrp-filters">
          <TypeChips label="Type de repère" options={TYPES} counts={counts} active={type} onChange={setType} />
          <div className="mrp-refine">
            <Dropdown label="Pays" allLabel="Pays : tous" value={pays} options={paysOptions} onChange={setPays} />
            <Dropdown label="Époque" allLabel="Époque : toutes" value={epoque} options={epoqueOptions} onChange={setEpoque} />
          </div>
        </div>
        <div className="mrp-regions">
          <TypeChips label="Région" options={REGIONS} counts={regionCounts} active={region} onChange={setRegion} />
        </div>

        {status === 'hors-ligne' && <p className="mrp-empty">La base n’est pas joignable pour le moment : voici une sélection de la rédaction.</p>}

        {showDates && (
          <section className="mrp-dates">
            <header className="mrp-head mrp-head--clair">
              <div>
                <h2>Dates</h2>
                <p>{datesSubtitle}</p>
              </div>
              {type !== 'dates' && (
                <Link to="/reperes?type=dates" className="mrp-more">
                  Toutes les dates <ArrowRight size={16} aria-hidden="true" />
                </Link>
              )}
            </header>

            {/* Desktop : frises horizontales de cinq dates. Mobile : frise verticale dans la carte. */}
            {chunk(datesShown, FRISE).map((row, index) => (
              <ol className="mrp-frise" key={index}>
                {row.map((date) => (
                  <li key={date.id} style={regionStyle(date.region)}>
                    <span className="mrp-point" aria-hidden="true" />
                    <MaybeLink to={date.to} className="mrp-date-card">
                      <strong>{date.annee}</strong>
                      <span className="mrp-date-titre">{date.titre}</span>
                      <PlaceLine item={date} className="mrp-date-pays" />
                    </MaybeLink>
                  </li>
                ))}
              </ol>
            ))}
          </section>
        )}

        {showFigures && (
          <section className="mrp-section">
            <header className="mrp-head">
              <div>
                <h2>Personnalités</h2>
                <p>Celles et ceux qui font encore récit, dans toutes les régions du continent.</p>
              </div>
              {type !== 'personnalites' && (
                <Link to="/reperes?type=personnalites" className="mrp-more">
                  Toutes les personnalités <ArrowRight size={16} aria-hidden="true" />
                </Link>
              )}
            </header>
            <ul className="mrp-figures">
              {figuresShown.map((figure) => (
                <li key={figure.id}>
                  <MaybeLink to={figure.to} className="mrp-figure" style={regionStyle(figure.region)}>
                    <Portrait figure={figure} />
                    <div>
                      <p className="mrp-kicker">{figure.dates}</p>
                      <h3>{figure.nom}</h3>
                      <p className="mrp-figure-role">{figure.role}</p>
                      <PlaceLine item={figure} className="mrp-lieu" />
                    </div>
                  </MaybeLink>
                </li>
              ))}
            </ul>
          </section>
        )}

        {showProverbs && (
          <section className="mrp-section mrp-section--last">
            <header className="mrp-head">
              <div>
                <h2>Proverbes</h2>
                <p>La sagesse du continent, transmise en une phrase et en {new Set(proverbs.map((p) => p.langue).filter(Boolean)).size || 'plusieurs'} langues.</p>
              </div>
              {type !== 'proverbes' && (
                <Link to="/reperes?type=proverbes" className="mrp-more">
                  Tous les proverbes <ArrowRight size={16} aria-hidden="true" />
                </Link>
              )}
            </header>
            <ul className="mrp-proverbes">
              {proverbsShown.map((proverbe, index) => (
                <li key={proverbe.id} className={index === 0 ? 'mrp-proverbe--sombre' : undefined} style={regionStyle(proverbe.region)}>
                  <blockquote>
                    <span className="mrp-guillemet" aria-hidden="true">
                      «
                    </span>
                    {proverbe.citation}»
                  </blockquote>
                  <p className="mrp-kicker">{duJour && proverbe.id === duJour.id ? `Proverbe du jour · ${proverbe.origine}` : proverbe.origine}</p>
                </li>
              ))}
            </ul>
            {type === 'proverbes' && proverbsAll.length > proverbesShown && (
              <div className="mrp-plus">
                <button type="button" className="mbr-button mbr-button--ghost" onClick={() => setProverbesShown((count) => count + PROVERBES_PAGE)}>
                  Voir plus de proverbes ({proverbsAll.length - proverbesShown})
                </button>
              </div>
            )}
          </section>
        )}

        {!showDates && !showFigures && !showProverbs && (
          <p className="mrp-empty">
            Aucun repère ne correspond pour l’instant. <Link to="/contribute">Proposer un repère pour cette région</Link>
          </p>
        )}
      </div>
    </Layout>
  )
}
