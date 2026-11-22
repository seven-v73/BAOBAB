import { useAdresseLisible } from '../hooks/useAdresseLisible'
import { lienContenu } from '../utils/liens'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Lecture, LectureCard, LectureEmpty, LectureSkeleton } from '../components/Lecture/Lecture'
import { figureService } from '../services/api'
import { useSeo } from '../seo/useSeo'
import { joinMeta } from '../utils'
import { findCountryCodes, formatHistoricalDate, formatLifespan, placeOf } from '../utils/afrique'
import { PERSONNALITES } from '../data/reperesContent'

// Fiche d'une personnalité (Repères) dans le gabarit de lecture de la refonte.

interface Figure {
  slug?: string
  _id: string
  name: string
  nameNative?: string
  birthDate?: string
  deathDate?: string
  birthPlace?: { location?: string }
  deathPlace?: { location?: string }
  role?: string[]
  biography?: string
  shortBiography?: string
  achievements?: Array<string | { title?: string; description?: string }>
  quotes?: Array<{ text: string; context?: string; source?: string }>
  legacy?: string
  culturalImpact?: string
  image?: string
  tags?: string[]
  relatedEvents?: Array<{ _id: string; title: string; date: string }>
  relatedCountries?: Array<{ nameFr?: string } | string>
  sources?: Array<{ type?: string; title?: string; url?: string; author?: string; year?: number }>
  verified?: boolean
}

const ROLE_LABELS: Record<string, string> = {
  'Roi/Reine': 'Souveraineté',
  Guerrier: 'Résistance et défense',
  Diplomate: 'Diplomatie et politique',
  Commerçant: 'Commerce',
  Innovateur: 'Innovation',
  Savant: 'Savoirs',
  Artiste: 'Arts',
}

const back = { to: '/reperes?type=personnalites', label: 'Retour aux repères' }
const paragraphs = (text = '') => text.split(/\n+/).map((p) => p.trim()).filter(Boolean)
const normalize = (value = '') => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '')

export const HistoricalFigureDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [figure, setFigure] = useState<Figure | null>(null)
  const [loading, setLoading] = useState(true)

  useAdresseLisible('figures', figure)
  useSeo(
    figure
      ? { path: lienContenu('figures', figure),
          title: figure.name,
          description: figure.shortBiography || figure.biography,
          image: figure.image,
          type: 'profile',
          jsonLd: { '@type': 'Person', name: figure.name, alternateName: figure.nameNative || undefined, description: (figure.shortBiography || '').slice(0, 300) },
        }
      : null,
  )

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    figureService
      .getById(id)
      .then((response) => !cancelled && setFigure(response.data))
      .catch(() => !cancelled && setFigure(null))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <LectureSkeleton />
  if (!figure) {
    return (
      <LectureEmpty back={back}>
        <h1>Cette personnalité est introuvable</h1>
        <p>Sa fiche a peut-être été retirée ou déplacée.</p>
      </LectureEmpty>
    )
  }

  const place = placeOf(
    findCountryCodes(
      figure.birthPlace?.location,
      (figure.relatedCountries || []).map((c) => (typeof c === 'string' ? c : c.nameFr || '')),
      figure.shortBiography,
    ),
  )
  const portrait = figure.image || PERSONNALITES.find((p) => normalize(p.nom) === normalize(figure.name))?.portrait
  const achievements = (figure.achievements || []).map((a) => (typeof a === 'string' ? a : a.title || a.description || '')).filter(Boolean)
  const quotes = (figure.quotes || []).filter((q) => q.text)
  const sources = (figure.sources || []).filter((s) => s.title)
  const roles = (figure.role || []).map((role) => ROLE_LABELS[role] || role)
  const lifespan = formatLifespan(figure.birthDate, figure.deathDate)

  const toc = [
    { id: 'biographie', label: 'Biographie' },
    ...(achievements.length ? [{ id: 'realisations', label: 'Réalisations' }] : []),
    ...(quotes.length ? [{ id: 'paroles', label: 'Paroles' }] : []),
    ...(figure.legacy || figure.culturalImpact ? [{ id: 'heritage', label: 'Héritage' }] : []),
    ...(figure.relatedEvents?.length ? [{ id: 'dates', label: 'Dates liées' }] : []),
    ...(sources.length ? [{ id: 'sources', label: 'Sources' }] : []),
  ]

  return (
    <Lecture
      back={back}
      kicker={joinMeta('Personnalité', lifespan, place.pays)}
      title={figure.name}
      lead={figure.shortBiography}
      byline={{ name: figure.nameNative && figure.nameNative !== figure.name ? figure.nameNative : undefined, detail: figure.verified ? 'Fiche relue par l’équipe' : undefined }}
      bookmark={{ itemType: 'figure', itemId: figure._id }}
      shareUrl={lienContenu('figures', figure)}
      image={portrait ? { src: portrait, caption: figure.name } : undefined}
      place={place.codes.length ? place : undefined}
      toc={toc}
      tocLabel="Dans cette fiche"
      aside={
        <LectureCard kicker="Repères">
          <dl className="mrl-facts">
            {figure.birthDate && (
              <>
                <dt>Naissance</dt>
                <dd>{joinMeta(formatHistoricalDate(figure.birthDate), figure.birthPlace?.location)}</dd>
              </>
            )}
            {figure.deathDate && (
              <>
                <dt>Décès</dt>
                <dd>{joinMeta(formatHistoricalDate(figure.deathDate), figure.deathPlace?.location)}</dd>
              </>
            )}
          </dl>
          {roles.length > 0 && (
            <ul className="mrl-tags">
              {roles.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          )}
        </LectureCard>
      }
    >
      <section id="biographie">
        {paragraphs(figure.biography || figure.shortBiography).map((text, index) => (
          <p key={index}>{text}</p>
        ))}
      </section>

      {achievements.length > 0 && (
        <section id="realisations">
          <h2>Réalisations</h2>
          <ul className="mrl-list">
            {achievements.map((achievement) => (
              <li key={achievement}>{achievement}</li>
            ))}
          </ul>
        </section>
      )}

      {quotes.length > 0 && (
        <section id="paroles">
          <h2>Paroles</h2>
          {quotes.map((quote, index) => (
            <blockquote key={index} className="mrd-quote">
              <p>{quote.text}</p>
            </blockquote>
          ))}
        </section>
      )}

      {(figure.legacy || figure.culturalImpact) && (
        <section id="heritage" className="mrd-fact">
          <p className="mrd-kicker">Héritage</p>
          {[figure.legacy, figure.culturalImpact].filter(Boolean).map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </section>
      )}

      {figure.relatedEvents && figure.relatedEvents.length > 0 && (
        <section id="dates">
          <h2>Dates liées</h2>
          <ul className="mrl-steps">
            {figure.relatedEvents.map((event) => (
              <li key={event._id}>
                <Link to={lienContenu('timeline', event)} className="mrl-step">
                  <span className="mrl-step-text">
                    <span className="mrd-kicker">{formatHistoricalDate(event.date)}</span>
                    <strong>{event.title}</strong>
                  </span>
                  <ArrowRight size={18} strokeWidth={1.6} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {sources.length > 0 && (
        <section id="sources" className="mrd-sources">
          <ul>
            {sources.map((source, index) => (
              <li key={index}>
                <span className="mrd-num">{index + 1}</span>
                <span className="mrd-source-text">
                  <p className="mrd-kicker">{joinMeta(source.type, source.year && String(source.year))}</p>
                  <p>
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noopener noreferrer nofollow">
                        {source.title}
                      </a>
                    ) : (
                      source.title
                    )}
                    {source.author && ` — ${source.author}`}
                  </p>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Lecture>
  )
}
