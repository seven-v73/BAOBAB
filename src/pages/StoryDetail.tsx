import { useAdresseLisible } from '../hooks/useAdresseLisible'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Lecture, LectureEmpty, LectureSkeleton } from '../components/Lecture/Lecture'
import { storyService } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useNotifications } from '../hooks/useNotifications'
import { useSeo } from '../seo/useSeo'
import { joinMeta } from '../utils'
import { findCountryCodes, placeOf } from '../utils/afrique'
import { lienContenu } from '../utils/liens'

// Histoire (épopée, biographie, documentaire) dans le gabarit de lecture de la refonte :
// tous les chapitres à la suite, sommaire des chapitres dans la colonne.

interface Chapter {
  title: string
  content: string
  images?: Array<{ url: string; caption?: string }>
  audio?: string
  order: number
}

interface Story {
  slug?: string
  _id: string
  title: string
  subtitle?: string
  coverImage?: string
  description?: string
  chapters?: Chapter[]
  readingTime?: number
  category?: string
  tags?: string[]
  author?: string
}

const paragraphs = (text = '') => text.split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean)
const back = { to: '/recits?type=histoires', label: 'Retour aux récits' }

export const StoryDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated } = useAuthStore()
  const { success, error: showError } = useNotifications()
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState(false)

  useAdresseLisible('stories', story)
  useSeo(
    story
      ? { path: lienContenu('stories', story), title: story.subtitle ? `${story.title} : ${story.subtitle}` : story.title, description: story.description, image: story.coverImage, type: 'article' }
      : null,
  )

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    storyService
      .getById(id)
      .then((response) => !cancelled && setStory(response.data))
      .catch(() => !cancelled && setStory(null))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <LectureSkeleton />
  if (!story) {
    return (
      <LectureEmpty back={back}>
        <h1>Ce récit est introuvable</h1>
        <p>Il a peut-être été retiré ou déplacé.</p>
      </LectureEmpty>
    )
  }

  const chapters = [...(story.chapters || [])].sort((a, b) => a.order - b.order)
  const place = placeOf(findCountryCodes(story.tags, story.title, story.subtitle))

  const complete = async () => {
    if (!isAuthenticated) {
      showError('Connectez-vous pour garder ce récit dans votre parcours.')
      return
    }
    try {
      await storyService.complete(story._id)
      setDone(true)
      success('Récit ajouté à votre parcours.')
    } catch (err) {
      showError((err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Enregistrement impossible pour le moment.')
    }
  }

  return (
    <Lecture
      back={back}
      kicker={joinMeta(story.category, place.region ? place.regionLabel : '', story.readingTime && `${story.readingTime} min`)}
      title={story.title}
      lead={story.subtitle || story.description}
      byline={{ name: story.author && story.author !== 'MonBaobab Team' ? story.author : undefined, detail: `${chapters.length} chapitre${chapters.length > 1 ? 's' : ''}` }}
      bookmark={{ itemType: 'story', itemId: story._id }}
      shareUrl={lienContenu('stories', story)}
      image={story.coverImage ? { src: story.coverImage } : undefined}
      place={place}
      toc={chapters.map((chapter, index) => ({ id: `chapitre-${index + 1}`, label: chapter.title || `Chapitre ${index + 1}` }))}
      tocLabel="Chapitres"
      currentRecitId={`story-${story._id}`}
    >
      {story.subtitle && story.description && (
        <section>
          <p>{story.description}</p>
        </section>
      )}

      {chapters.map((chapter, index) => (
        <section key={index} id={`chapitre-${index + 1}`}>
          <p className="mrd-kicker">Chapitre {index + 1}</p>
          <h2>{chapter.title}</h2>
          {paragraphs(chapter.content).map((text, i) => (
            <p key={i}>{text}</p>
          ))}
          {chapter.images?.filter((image) => image.url).map((image) => (
            <figure key={image.url} className="mrd-figure mrl-inline-figure">
              <img src={image.url} alt={image.caption || ''} loading="lazy" />
              {image.caption && <figcaption>{image.caption}</figcaption>}
            </figure>
          ))}
          {chapter.audio && <audio controls preload="none" src={chapter.audio} className="mrl-audio" />}
        </section>
      ))}

      <section className="mrd-fact">
        <p className="mrd-kicker">Fin du récit</p>
        <p>Gardez la trace de vos lectures dans votre espace, et retrouvez-les d’un appareil à l’autre.</p>
        <button type="button" className="mbr-button" onClick={complete} disabled={done}>
          {done ? (
            <>
              <Check size={18} aria-hidden="true" /> Dans votre parcours
            </>
          ) : (
            'J’ai lu ce récit'
          )}
        </button>
      </section>
    </Lecture>
  )
}
