import { useAdresseLisible } from '../hooks/useAdresseLisible'
import { lienContenu } from '../utils/liens'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { Lecture, LectureCard, LectureEmpty, LectureSkeleton } from '../components/Lecture/Lecture'
import { collectionService } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useNotifications } from '../hooks/useNotifications'
import { useSeo } from '../seo/useSeo'
import { joinMeta } from '../utils'
import { findCountryCodes, formatHistoricalDate, placeOf } from '../utils/afrique'

// Dossier : une suite d'étapes (dates, personnalités, histoires, articles, pays) dans le
// gabarit de lecture de la refonte.

interface CollectionItem {
  type: string
  itemId: any
  order: number
  notes?: string
}

interface Collection {
  slug?: string
  _id: string
  title: string
  description?: string
  shortDescription?: string
  coverImage?: string
  theme?: string[]
  tags?: string[]
  estimatedTime?: number
  items: CollectionItem[]
  curator?: { name?: string }
}

const TYPE_LABELS: Record<string, string> = {
  country: 'Pays',
  blog: 'Article',
  event: 'Date',
  figure: 'Personnalité',
  story: 'Histoire',
}

const linkOf = (item: CollectionItem) => {
  const target = item.itemId
  if (!target) return null
  switch (item.type) {
    case 'country':
      return `/country/${String(target.id || target._id).toLowerCase()}`
    case 'blog':
      return lienContenu('blog', target)
    case 'event':
      return lienContenu('timeline', target)
    case 'figure':
      return lienContenu('figures', target)
    case 'story':
      return lienContenu('stories', target)
    default:
      return null
  }
}

const titleOf = (item: CollectionItem) => {
  const target = item.itemId
  if (!target) return 'Contenu retiré'
  return target.nameFr || target.name || target.title || 'Sans titre'
}

const back = { to: '/recits?type=dossiers', label: 'Retour aux dossiers' }

export const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated } = useAuthStore()
  const { success, error: showError } = useNotifications()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState(false)

  useAdresseLisible('collections', collection)
  useSeo(collection ? { path: lienContenu('collections', collection), title: collection.title, description: collection.shortDescription || collection.description, image: collection.coverImage } : null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    collectionService
      .getById(id)
      .then((response) => !cancelled && setCollection(response.data))
      .catch(() => !cancelled && setCollection(null))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <LectureSkeleton />
  if (!collection) {
    return (
      <LectureEmpty back={back}>
        <h1>Ce dossier est introuvable</h1>
        <p>Il a peut-être été retiré ou déplacé.</p>
      </LectureEmpty>
    )
  }

  const items = [...(collection.items || [])].sort((a, b) => a.order - b.order)
  const place = placeOf(findCountryCodes(collection.tags, collection.title, collection.shortDescription, items.map(titleOf)))

  const complete = async () => {
    if (!isAuthenticated) {
      showError('Connectez-vous pour garder ce dossier dans votre parcours.')
      return
    }
    try {
      await collectionService.complete(collection._id)
      setDone(true)
      success('Dossier ajouté à votre parcours.')
    } catch (err) {
      showError((err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Enregistrement impossible pour le moment.')
    }
  }

  return (
    <Lecture
      back={back}
      kicker={joinMeta('Dossier', collection.theme?.[0], collection.estimatedTime && `${collection.estimatedTime} min`)}
      title={collection.title}
      lead={collection.shortDescription || undefined}
      byline={{ name: collection.curator?.name, detail: `${items.length} étape${items.length > 1 ? 's' : ''}` }}
      bookmark={{ itemType: 'collection', itemId: collection._id }}
      shareUrl={lienContenu('collections', collection)}
      image={collection.coverImage ? { src: collection.coverImage } : undefined}
      place={place.codes.length ? place : undefined}
      toc={[
        ...(collection.description ? [{ id: 'presentation', label: 'Présentation' }] : []),
        { id: 'etapes', label: 'Les étapes' },
      ]}
      tocLabel="Dans ce dossier"
      currentRecitId={`collection-${collection._id}`}
      aside={
        collection.theme && collection.theme.length > 0 ? (
          <LectureCard kicker="Thèmes">
            <ul className="mrl-tags">
              {collection.theme.map((theme) => (
                <li key={theme}>{theme}</li>
              ))}
            </ul>
          </LectureCard>
        ) : undefined
      }
    >
      {collection.description && (
        <section id="presentation">
          {collection.description
            .split(/\n+/)
            .filter(Boolean)
            .map((text, index) => (
              <p key={index}>{text}</p>
            ))}
        </section>
      )}

      <section id="etapes">
        <h2>Les étapes</h2>
        <ol className="mrl-steps">
          {items.map((item, index) => {
            const to = linkOf(item)
            const date = item.type === 'event' ? formatHistoricalDate(item.itemId?.date) : ''
            const content = (
              <>
                <span className="mrd-num">{index + 1}</span>
                <span className="mrl-step-text">
                  <span className="mrd-kicker">{joinMeta(TYPE_LABELS[item.type] || 'Contenu', date)}</span>
                  <strong>{titleOf(item)}</strong>
                  {(item.notes || item.itemId?.shortDescription) && <span>{item.notes || item.itemId?.shortDescription}</span>}
                </span>
                {to && <ArrowRight size={18} strokeWidth={1.6} aria-hidden="true" />}
              </>
            )
            return (
              <li key={index}>
                {to ? (
                  <Link to={to} className="mrl-step">
                    {content}
                  </Link>
                ) : (
                  <div className="mrl-step">{content}</div>
                )}
              </li>
            )
          })}
        </ol>
      </section>

      <section className="mrd-fact">
        <p className="mrd-kicker">Fin du dossier</p>
        <p>Vous avez parcouru toutes les étapes ? Gardez ce dossier dans votre parcours.</p>
        <button type="button" className="mbr-button" onClick={complete} disabled={done}>
          {done ? (
            <>
              <Check size={18} aria-hidden="true" /> Dans votre parcours
            </>
          ) : (
            'J’ai parcouru ce dossier'
          )}
        </button>
      </section>
    </Lecture>
  )
}
