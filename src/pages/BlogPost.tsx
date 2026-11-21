import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FileText, Flag, PenLine, PlayCircle } from 'lucide-react'
import { Lecture, LectureEmpty, LectureSkeleton } from '../components/Lecture/Lecture'
import { ArticleBody, ReferenceList, parseArticle, readingMinutes, type ArticleReference } from '../components/Article/ArticleBody'
import { PDFViewer } from '../components/MediaViewer/PDFViewer'
import { VideoViewer } from '../components/MediaViewer/VideoViewer'
import { blogService } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useSeo } from '../seo/useSeo'
import { joinMeta } from '../utils'
import { findCountryCodes, placeOf } from '../utils/afrique'

// Article ou témoignage du carnet, dans le gabarit de lecture de la refonte (maquette « Récit »).

interface BlogImage {
  url: string
  caption?: string
}

interface BlogPDF {
  url: string
  title: string
  description?: string
}

interface BlogVideo {
  url: string
  title: string
  description?: string
  thumbnail?: string
  type?: 'youtube' | 'vimeo' | 'direct'
}

export interface BlogPost {
  _id: string
  title: string
  content: string
  excerpt?: string
  author: string
  authorId?: string
  image?: string
  images?: BlogImage[]
  pdfs?: BlogPDF[]
  videos?: BlogVideo[]
  category?: string
  country?: string
  tags?: string[]
  kind?: 'savoir' | 'temoignage'
  status?: 'draft' | 'pending' | 'published' | 'rejected'
  reviewNote?: string
  references?: ArticleReference[]
  createdAt: string
  updatedAt?: string
}

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '')

const statusLabels: Record<string, string> = {
  draft: 'Brouillon : visible par vous seulement.',
  pending: 'En relecture : pas encore publié.',
  rejected: 'À revoir : non publié.',
}

const back = { to: '/recits', label: 'Retour aux récits' }

export const BlogPostPage = () => {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((state) => state.user)
  const contactEmail = useSettingsStore((state) => state.settings?.contactEmail) || 'contact@monbaobab.com'
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<'notfound' | 'unavailable' | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [lightbox, setLightbox] = useState<BlogImage | null>(null)
  const [pdf, setPdf] = useState<BlogPDF | null>(null)
  const [video, setVideo] = useState<BlogVideo | null>(null)

  useSeo(
    post
      ? {
          title: post.title,
          description: post.excerpt || post.content,
          image: post.image,
          type: 'article',
          noindex: post.status !== undefined && post.status !== 'published',
          jsonLd: {
            '@type': 'Article',
            headline: post.title.slice(0, 110),
            description: (post.excerpt || '').slice(0, 300),
            image: post.image ? [post.image.startsWith('http') ? post.image : `https://monbaobab.com${post.image}`] : undefined,
            datePublished: post.createdAt,
            dateModified: post.updatedAt,
            author: { '@type': post.authorId && post.author !== 'Rédaction MonBaobab' ? 'Person' : 'Organization', name: post.author },
            inLanguage: 'fr',
            citation: post.references?.map((ref) => ref.url || ref.title),
          },
        }
      : null,
  )

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    blogService
      .getById(id)
      .then((response) => !cancelled && setPost(response.data))
      .catch((err: { response?: { status?: number } }) => {
        if (cancelled) return
        setPost(null)
        // 404 : le texte n'existe pas (ou n'est pas publié). Sinon : réseau, surcharge… on propose de réessayer
        setLoadError(err.response?.status === 404 ? 'notfound' : 'unavailable')
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id, attempt])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightbox(null)
        setPdf(null)
        setVideo(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const headings = useMemo(
    () => (post ? (parseArticle(post.content).filter((block) => block.type === 'h2') as Array<{ type: 'h2'; text: string; id: string }>) : []),
    [post],
  )

  if (loading) return <LectureSkeleton />
  if (loadError === 'unavailable') {
    return (
      <LectureEmpty back={back}>
        <h1>Article momentanément indisponible</h1>
        <p>La connexion a échoué. Vérifiez votre réseau, puis réessayez.</p>
        <button type="button" className="mbr-button" onClick={() => setAttempt((n) => n + 1)}>
          Réessayer
        </button>
      </LectureEmpty>
    )
  }
  if (!post) {
    return (
      <LectureEmpty back={back}>
        <h1>Article introuvable</h1>
        <p>Ce texte n’existe pas ou n’est pas encore publié.</p>
      </LectureEmpty>
    )
  }

  const references = post.references || []
  const isTestimony = post.kind === 'temoignage'
  const isMine = Boolean(user && post.authorId && (user._id || user.id) === post.authorId)
  const place = placeOf([...new Set([post.country && post.country.toUpperCase(), ...findCountryCodes(post.title, post.tags)].filter(Boolean) as string[])])
  const images = (post.images || []).filter((image) => image?.url)
  const pdfs = (post.pdfs || []).filter((item) => item?.url)
  const videos = (post.videos || []).filter((item) => item?.url)
  const hasMedia = images.length + pdfs.length + videos.length > 0

  const toc = [
    ...headings.map((heading) => ({ id: heading.id, label: heading.text })),
    ...(hasMedia ? [{ id: 'documents', label: 'Documents' }] : []),
    ...(references.length ? [{ id: 'references', label: 'Sources' }] : []),
  ]

  return (
    <>
      <Lecture
        back={back}
        kicker={joinMeta(post.category, isTestimony ? 'Témoignage' : 'Article documenté', place.codes.length ? place.pays : '', `${readingMinutes(post.content)} min`)}
        title={post.title}
        lead={post.excerpt}
        byline={{ name: post.author, detail: joinMeta(`Publié le ${formatDate(post.createdAt)}`, references.length > 0 && !isTestimony && `${references.length} source${references.length > 1 ? 's' : ''}`) }}
        bookmark={{ itemType: 'blog', itemId: post._id }}
        shareUrl={`/blog/${post._id}`}
        image={post.image ? { src: post.image } : undefined}
        place={place.codes.length ? place : undefined}
        toc={toc}
        tocLabel={isTestimony ? 'Dans ce témoignage' : 'Dans cet article'}
        currentRecitId={`blog-${post._id}`}
        notice={
          post.status && post.status !== 'published' ? (
            <div className="mrl-notice" role="status">
              <strong>{statusLabels[post.status]}</strong>
              {post.reviewNote && <span>Note de relecture : {post.reviewNote}</span>}
              {isMine && (
                <Link to={`/blog/ecrire/${post._id}`} className="mrd-country-link">
                  <PenLine size={16} aria-hidden="true" /> Modifier
                </Link>
              )}
            </div>
          ) : undefined
        }
      >
        {isTestimony && (
          <aside className="mrd-fact">
            <p className="mrd-kicker">Témoignage</p>
            <p>Ce texte rapporte l’expérience et le point de vue de son auteur ou de son autrice.</p>
          </aside>
        )}

        <ArticleBody content={post.content} references={references} dropCap={false} />

        {hasMedia && (
          <section id="documents">
            <h2>Documents</h2>
            <ul className="mrl-media">
              {images.map((image) => (
                <li key={image.url}>
                  <button type="button" onClick={() => setLightbox(image)}>
                    <img src={image.url} alt="" loading="lazy" />
                    {image.caption || 'Agrandir l’image'}
                  </button>
                </li>
              ))}
              {videos.map((item) => (
                <li key={item.url}>
                  <button type="button" onClick={() => setVideo(item)}>
                    <PlayCircle size={22} aria-hidden="true" /> {item.title}
                  </button>
                </li>
              ))}
              {pdfs.map((item) => (
                <li key={item.url}>
                  <button type="button" onClick={() => setPdf(item)}>
                    <FileText size={22} aria-hidden="true" /> {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {references.length > 0 && (
          <section id="references">
            <h2>Sources</h2>
            <ReferenceList references={references} />
          </section>
        )}

        <section className="mrd-fact">
          <p className="mrd-kicker">Votre regard compte</p>
          <p>
            Une erreur, une précision ?{' '}
            <a href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Signalement : ${post.title}`)}`}>
              <Flag size={14} aria-hidden="true" /> Signalez-la
            </a>
            . Un savoir à transmettre ? <Link to="/blog/ecrire">Écrivez à votre tour</Link>.
          </p>
        </section>
      </Lecture>

      {lightbox && (
        <div className="mrl-modal" role="dialog" aria-modal="true" aria-label="Image agrandie" onClick={() => setLightbox(null)}>
          <img src={lightbox.url} alt={lightbox.caption || ''} />
        </div>
      )}
      {pdf && (
        <div className="mrl-modal" role="dialog" aria-modal="true" onClick={() => setPdf(null)}>
          <div onClick={(event) => event.stopPropagation()}>
            <PDFViewer url={pdf.url} title={pdf.title} description={pdf.description} onClose={() => setPdf(null)} />
          </div>
        </div>
      )}
      {video && (
        <div className="mrl-modal" role="dialog" aria-modal="true" onClick={() => setVideo(null)}>
          <div onClick={(event) => event.stopPropagation()}>
            <VideoViewer url={video.url} title={video.title} description={video.description} type={video.type} thumbnail={video.thumbnail} onClose={() => setVideo(null)} />
          </div>
        </div>
      )}
    </>
  )
}
