import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Layout } from '../Layout/Layout'
import { BookmarkButton } from '../BookmarkButton/BookmarkButton'
import { ShareButton } from '../ShareButton/ShareButton'
import { MARK_PATH, MARK_VIEWBOX } from '../../data/brandMark'
import { getCountryDiscoveryDefault } from '../../data/countryDiscoveryDefaults'
import { useRecits, type RecitItem } from '../../hooks/useRubriques'
import { countryNameOf, REGION_COLORS, REGION_LABELS, type Place } from '../../utils/afrique'
import '../../pages/Rubriques.css'
import '../../pages/RecitDetail.css'
import './Lecture.css'

// Gabarit de lecture unique du site, celui de la maquette Figma « Récit / Desktop 1440 » :
// article, histoire, dossier, date et personnalité s'affichent tous ainsi.

type BookmarkType = 'event' | 'figure' | 'collection' | 'story' | 'proverb' | 'blog' | 'country'

export interface LectureProps {
  back: { to: string; label: string }
  kicker: string
  title: string
  lead?: string
  /** Signature : la rédaction par défaut */
  byline?: { name?: string; detail?: string }
  bookmark?: { itemType: BookmarkType; itemId: string }
  shareUrl: string
  image?: { src: string; caption?: string }
  /** Pays et région du contenu : carte « Pays lié » et suggestions de lecture */
  place?: Place
  /** Sommaire (ancres présentes dans le corps) */
  toc?: Array<{ id: string; label: string }>
  tocLabel?: string
  /** Bandeau au-dessus du titre (statut de relecture…) */
  notice?: ReactNode
  /** Cartes supplémentaires de la colonne (avant « Pays lié ») */
  aside?: ReactNode
  /** Identifiant du contenu dans les listes de Récits, pour ne pas le suggérer à lui-même */
  currentRecitId?: string
  children: ReactNode
}

/** Une suggestion de la même région, puis les autres régions : on lit d'un bout à l'autre du continent */
const pickNext = (items: RecitItem[], currentId: string | undefined, place?: Place) => {
  const pool = items.filter((item) => item.id !== currentId && item.kind !== 'dossiers')
  const same = pool.filter((item) => place?.region && item.region === place.region)
  const elsewhere = pool.filter((item) => item.region && item.region !== place?.region)
  const picks: RecitItem[] = []
  const seenRegions = new Set<string>()
  if (same[0]) picks.push(same[0])
  for (const item of [...elsewhere.filter((i) => i.image), ...elsewhere]) {
    if (picks.length >= 3) break
    if (!picks.includes(item) && !seenRegions.has(item.region!)) {
      picks.push(item)
      seenRegions.add(item.region!)
    }
  }
  return picks
}

export const LectureEmpty = ({ back, children }: { back: { to: string; label: string }; children: ReactNode }) => (
  <Layout fullWidth>
    <div className="mrd">
      <div className="mrd-empty">
        {children}
        <p>
          <Link to={back.to}>{back.label}</Link>
        </p>
      </div>
    </div>
  </Layout>
)

export const LectureSkeleton = () => (
  <Layout fullWidth>
    <div className="mrd" role="status" aria-live="polite">
      <span className="sr-only">Chargement…</span>
      <div className="mrd-head">
        <div className="mrl-skeleton" style={{ height: 14, width: 140 }} />
        <div className="mrl-skeleton" style={{ height: 56, width: '80%' }} />
        <div className="mrl-skeleton" style={{ height: 20, width: '60%' }} />
      </div>
    </div>
  </Layout>
)

export const Lecture = ({
  back,
  kicker,
  title,
  lead,
  byline,
  bookmark,
  shareUrl,
  image,
  place,
  toc = [],
  tocLabel = 'Dans cette page',
  notice,
  aside,
  currentRecitId,
  children,
}: LectureProps) => {
  const { items } = useRecits()
  const [activeId, setActiveId] = useState(toc[0]?.id ?? '')

  // L'entrée active du sommaire suit la section visible à l'écran
  const tocKey = toc.map((item) => item.id).join('|')
  useEffect(() => {
    const ids = tocKey ? tocKey.split('|') : []
    if (!ids.length) return
    setActiveId(ids[0])
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-96px 0px -55% 0px' },
    )
    ids.forEach((id) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })
    return () => observer.disconnect()
  }, [tocKey])

  const code = place?.codes[0]
  const country = code
    ? {
        code: code.toLowerCase(),
        name: countryNameOf(code),
        text: getCountryDiscoveryDefault(code)?.oneSentenceSummary || (place?.region ? REGION_LABELS[place.region] : ''),
      }
    : null
  const next = pickNext(items, currentRecitId, place)
  const regionStyle = (region: Place['region']) => ({ '--mrc-region': region ? REGION_COLORS[region] : 'var(--brand-sauge)' }) as CSSProperties

  const actions = (
    <>
      {bookmark && <BookmarkButton itemType={bookmark.itemType} itemId={bookmark.itemId} iconOnly className="mrd-round" />}
      <ShareButton url={shareUrl} title={title} iconOnly className="mrd-round-wrap" />
    </>
  )

  return (
    <Layout fullWidth>
      <div className="mrd">
        <header className="mrd-head">
          <Link to={back.to} className="mrd-back">
            <ArrowLeft size={16} strokeWidth={1.6} aria-hidden="true" /> {back.label}
          </Link>
          {notice}
          <p className="mrd-kicker">{kicker}</p>
          <h1>{title}</h1>
          {lead && <p className="mrd-lead">{lead}</p>}
          <div className="mrd-sign">
            <div className="mrd-author">
              <span className="mrd-author-mark" aria-hidden="true">
                <svg viewBox={MARK_VIEWBOX}>
                  <path d={MARK_PATH} fill="currentColor" />
                </svg>
              </span>
              <span className="mrd-author-text">
                <strong>{byline?.name || 'La rédaction MonBaobab'}</strong>
                {byline?.detail && <span>{byline.detail}</span>}
              </span>
            </div>
            <div className="mrd-actions">{actions}</div>
          </div>
        </header>

        {image?.src && (
          <figure className="mrd-figure">
            <img src={image.src} alt={image.caption || ''} width={1200} height={560} />
            <div className="mrd-figure-bar">
              <Link to={back.to} className="mrd-round" aria-label={back.label}>
                <ArrowLeft size={20} strokeWidth={1.6} aria-hidden="true" />
              </Link>
              <div className="mrd-photo-actions">{actions}</div>
            </div>
            {image.caption && <figcaption>{image.caption}</figcaption>}
          </figure>
        )}

        <div className={`mrd-body${image?.src ? '' : ' mrd-body--sans-image'}`}>
          <article className="mrd-text">{children}</article>

          <aside className="mrd-aside">
            {toc.length > 1 && (
              <nav className="mrd-toc" aria-label={tocLabel}>
                <p className="mrd-kicker">{tocLabel}</p>
                {toc.map((item) => (
                  <a key={item.id} href={`#${item.id}`} className={item.id === activeId ? 'is-active' : undefined}>
                    <i aria-hidden="true" />
                    {item.label}
                  </a>
                ))}
              </nav>
            )}
            {aside}
            {country?.name && (
              <div className="mrd-country">
                <p className="mrd-kicker">Pays lié</p>
                <h2>{country.name}</h2>
                {country.text && <p>{country.text}</p>}
                <Link to={`/country/${country.code}`} className="mrd-country-link">
                  Voir la fiche pays <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" />
                </Link>
              </div>
            )}
          </aside>
        </div>

        {next.length > 0 && (
          <section className="mrd-next">
            <h2>À lire ensuite, d’une région à l’autre</h2>
            <ul>
              {next.map((recit) => (
                <li key={recit.id}>
                  <Link to={recit.to} className="mrd-next-card" style={regionStyle(recit.region)}>
                    {recit.image ? (
                      <span className="mrd-next-media" style={{ backgroundImage: `url(${recit.image})` }} aria-hidden="true" />
                    ) : (
                      <span className="mrd-next-media mrl-motif" aria-hidden="true" />
                    )}
                    <span className="mrd-next-body">
                      <span className="mrd-kicker">{recit.regionLabel}</span>
                      <h3>{recit.title}</h3>
                      <p>{recit.excerpt}</p>
                    </span>
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

/** Carte de colonne au style de « Pays lié », en version claire */
export const LectureCard = ({ kicker, title, children }: { kicker: string; title?: string; children: ReactNode }) => (
  <div className="mrl-card">
    <p className="mrd-kicker">{kicker}</p>
    {title && <h2>{title}</h2>}
    {children}
  </div>
)
