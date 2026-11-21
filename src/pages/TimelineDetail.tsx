import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Lecture, LectureCard, LectureEmpty, LectureSkeleton } from '../components/Lecture/Lecture'
import { progressService, timelineService } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useSeo } from '../seo/useSeo'
import { joinMeta } from '../utils'
import { findCountryCodes, formatHistoricalDate, placeOf } from '../utils/afrique'

// Fiche d'une date de la chronologie (Repères) dans le gabarit de lecture de la refonte.

interface TimelineEvent {
  _id: string
  title: string
  description?: string
  shortDescription?: string
  date: string
  endDate?: string | null
  period?: string
  location?: { region?: string; country?: { nameFr?: string; id?: string } | null }
  category?: string[]
  tags?: string[]
  sources?: Array<{ type?: string; title?: string; url?: string; author?: string; year?: number }>
  images?: string[]
  relatedEvents?: Array<{ _id: string; title: string; date: string; shortDescription?: string }>
  relatedFigures?: Array<{ _id: string; name: string; shortBiography?: string }>
  verified?: boolean
}

const back = { to: '/reperes?type=dates', label: 'Retour aux repères' }
const paragraphs = (text = '') => text.split(/\n+/).map((p) => p.trim()).filter(Boolean)

export const TimelineDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated } = useAuthStore()
  const [event, setEvent] = useState<TimelineEvent | null>(null)
  const [loading, setLoading] = useState(true)

  useSeo(event ? { title: `${event.title} (${formatHistoricalDate(event.date)})`, description: event.shortDescription || event.description, image: event.images?.[0] } : null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    timelineService
      .getById(id)
      .then((response) => !cancelled && setEvent(response.data))
      .catch(() => !cancelled && setEvent(null))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id])

  // Lecture comptée dans la progression du membre
  useEffect(() => {
    if (event && isAuthenticated && id) {
      progressService.recordActivity({ activityType: 'read-event', itemType: 'event', itemId: id }).catch(() => undefined)
    }
  }, [event, isAuthenticated, id])

  if (loading) return <LectureSkeleton />
  if (!event) {
    return (
      <LectureEmpty back={back}>
        <h1>Cette date est introuvable</h1>
        <p>Elle a peut-être été retirée ou déplacée.</p>
      </LectureEmpty>
    )
  }

  const place = placeOf(
    findCountryCodes(event.location?.country?.nameFr, event.location?.region, event.title, event.tags),
    /afrique/i.test(event.location?.region || '') ? 'Tout le continent' : 'Afrique et monde',
  )
  const when = event.endDate ? `${formatHistoricalDate(event.date)} – ${formatHistoricalDate(event.endDate)}` : formatHistoricalDate(event.date)
  const sources = (event.sources || []).filter((source) => source.title)
  const related = [...(event.relatedEvents || []).map((e) => ({ to: `/timeline/${e._id}`, kicker: formatHistoricalDate(e.date), title: e.title, text: e.shortDescription })), ...(event.relatedFigures || []).map((f) => ({ to: `/figures/${f._id}`, kicker: 'Personnalité', title: f.name, text: f.shortBiography }))]

  return (
    <Lecture
      back={back}
      kicker={joinMeta(when, event.period && event.period !== 'Autre' ? event.period : '', place.pays)}
      title={event.title}
      lead={event.shortDescription && event.shortDescription !== event.description ? event.shortDescription : undefined}
      byline={{ detail: event.verified ? 'Fiche relue par l’équipe' : undefined }}
      bookmark={{ itemType: 'event', itemId: event._id }}
      shareUrl={`/timeline/${event._id}`}
      image={event.images?.[0] ? { src: event.images[0] } : undefined}
      place={place.codes.length ? place : undefined}
      toc={[
        { id: 'recit', label: 'Ce qui s’est passé' },
        ...(related.length ? [{ id: 'liens', label: 'Pour aller plus loin' }] : []),
        ...(sources.length ? [{ id: 'sources', label: 'Sources' }] : []),
      ]}
      tocLabel="Dans cette fiche"
      aside={
        <LectureCard kicker="Repère">
          <dl className="mrl-facts">
            <dt>Date</dt>
            <dd>{when}</dd>
            {event.period && event.period !== 'Autre' && (
              <>
                <dt>Époque</dt>
                <dd>{event.period}</dd>
              </>
            )}
            <dt>Lieu</dt>
            <dd>{event.location?.region || place.pays}</dd>
          </dl>
          {event.category && event.category.length > 0 && (
            <ul className="mrl-tags">
              {event.category.map((category) => (
                <li key={category}>{category}</li>
              ))}
            </ul>
          )}
        </LectureCard>
      }
    >
      <section id="recit">
        {paragraphs(event.description || event.shortDescription).map((text, index) => (
          <p key={index}>{text}</p>
        ))}
      </section>

      {related.length > 0 && (
        <section id="liens">
          <h2>Pour aller plus loin</h2>
          <ul className="mrl-steps">
            {related.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="mrl-step">
                  <span className="mrl-step-text">
                    <span className="mrd-kicker">{item.kicker}</span>
                    <strong>{item.title}</strong>
                    {item.text && <span>{item.text}</span>}
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
