import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, FileText, Flag, List, PenLine, PlayCircle, Type, X } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { ArticleBody, ReferenceList, parseArticle, readingMinutes, type ArticleReference } from '../components/Article/ArticleBody'
import { PDFViewer } from '../components/MediaViewer/PDFViewer'
import { VideoViewer } from '../components/MediaViewer/VideoViewer'
import { ShareButton } from '../components/ShareButton/ShareButton'
import { BookmarkButton } from '../components/BookmarkButton/BookmarkButton'
import { blogService } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useSeo } from '../seo/useSeo'
import './BlogPost.css'

interface BlogImage {
  url: string
  caption?: string
  order?: number
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
  tags?: string[]
  kind?: 'savoir' | 'temoignage'
  status?: 'draft' | 'pending' | 'published' | 'rejected'
  reviewNote?: string
  references?: ArticleReference[]
  views?: number
  createdAt: string
  updatedAt?: string
}

type ReaderTheme = 'paper' | 'white' | 'night'
interface ReaderPrefs {
  size: 0 | 1 | 2
  theme: ReaderTheme
  font: 'serif' | 'sans'
}

const PREFS_KEY = 'mb-reader'
const defaultPrefs: ReaderPrefs = { size: 1, theme: 'paper', font: 'serif' }

const loadPrefs = (): ReaderPrefs => {
  try {
    return { ...defaultPrefs, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }
  } catch {
    return defaultPrefs
  }
}

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

const statusLabels: Record<string, string> = {
  draft: 'Brouillon — visible par vous seul·e',
  pending: 'En relecture — pas encore publié',
  rejected: 'À revoir — non publié',
}

export const BlogPostPage = () => {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((state) => state.user)
  const contactEmail = useSettingsStore((state) => state.settings?.contactEmail) || 'contact@monbaobab.com'
  const [post, setPost] = useState<BlogPost | null>(null)
  const [others, setOthers] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<'notfound' | 'unavailable' | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [prefs, setPrefs] = useState<ReaderPrefs>(loadPrefs)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)
  const [activeHeading, setActiveHeading] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<BlogImage | null>(null)
  const [pdf, setPdf] = useState<BlogPDF | null>(null)
  const [video, setVideo] = useState<BlogVideo | null>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const articleRef = useRef<HTMLElement>(null)

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

  /* ---------- données ---------- */
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
        // 404 : le texte n'existe pas (ou n'est pas publié). Sinon : réseau, surcharge… → on propose de réessayer
        setLoadError(err.response?.status === 404 ? 'notfound' : 'unavailable')
      })
      .finally(() => !cancelled && setLoading(false))
    blogService
      .getAll()
      .then((response) => !cancelled && setOthers((response.data as BlogPost[]).filter((item) => item._id !== id)))
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [id, attempt])

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
    } catch {
      // stockage indisponible (navigation privée) : préférences pour cette visite seulement
    }
  }, [prefs])

  const headings = useMemo(
    () => (post ? parseArticle(post.content).filter((block) => block.type === 'h2') as Array<{ type: 'h2'; text: string; id: string }> : []),
    [post],
  )

  /* ---------- progression, sommaire actif, apparitions ---------- */
  useEffect(() => {
    if (!post) return
    let frame = 0
    const update = () => {
      frame = 0
      const article = articleRef.current
      if (!article) return
      const rect = article.getBoundingClientRect()
      const total = rect.height - window.innerHeight * 0.6
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(total, 1)))
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`
      let current: string | null = null
      for (const heading of headings) {
        const el = document.getElementById(heading.id)
        if (el && el.getBoundingClientRect().top < 160) current = heading.id
      }
      setActiveHeading(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    // Apparition douce des passages (opacité + léger glissement : aucun décalage de mise en page)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const targets = articleRef.current?.querySelectorAll<HTMLElement>('[data-reveal]') || []
    let observer: IntersectionObserver | null = null
    if (!reduce && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed')
              observer?.unobserve(entry.target)
            }
          }),
        { rootMargin: '0px 0px -8% 0px' },
      )
      targets.forEach((el) => {
        // Ce qui est déjà visible au chargement s'affiche immédiatement
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-revealed')
        else observer!.observe(el)
      })
    } else {
      targets.forEach((el) => el.classList.add('is-revealed'))
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
      observer?.disconnect()
    }
  }, [post, headings])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSettingsOpen(false)
        setTocOpen(false)
        setLightbox(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* ---------- états ---------- */
  if (loading) {
    return (
      <Layout fullWidth>
        <div className="bp-skeleton" role="status" aria-live="polite">
          <span className="sr-only">Chargement de l’article…</span>
          <div className="mb-skeleton" style={{ height: 14, width: 120, margin: '0 auto' }} />
          <div className="mb-skeleton" style={{ height: 48, width: '80%', margin: '20px auto 0' }} />
          <div className="mb-skeleton" style={{ height: 18, width: '60%', margin: '16px auto 0' }} />
          <div className="mb-skeleton" style={{ height: 360, marginTop: 40 }} />
        </div>
      </Layout>
    )
  }

  if (!post && loadError === 'unavailable') {
    return (
      <Layout>
        <div className="mb-state" style={{ marginTop: 'var(--space-6)' }} role="alert">
          <h1 style={{ fontSize: 'var(--text-2xl)' }}>Article momentanément indisponible</h1>
          <p>La connexion a été interrompue ou le service est très sollicité. Votre lecture vous attend.</p>
          <button type="button" className="btn" onClick={() => setAttempt((n) => n + 1)}>
            Réessayer
          </button>
        </div>
      </Layout>
    )
  }

  if (!post) {
    return (
      <Layout>
        <div className="mb-state" style={{ marginTop: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 'var(--text-2xl)' }}>Article introuvable</h1>
          <p>Ce texte n’existe pas, n’est pas encore publié ou a été retiré.</p>
          <Link to="/blog" className="btn">
            Retour au carnet
          </Link>
        </div>
      </Layout>
    )
  }

  const references = post.references || []
  const minutes = readingMinutes(post.content)
  const isTestimony = post.kind === 'temoignage'
  const isMine = Boolean(user && post.authorId && (user._id || user.id) === post.authorId)
  const next = others.slice(0, 2)
  const images = (post.images || []).filter((image) => image?.url)
  const pdfs = (post.pdfs || []).filter((item) => item?.url)
  const videos = (post.videos || []).filter((item) => item?.url)

  return (
    <Layout fullWidth>
      <div className="bp-progress" aria-hidden="true">
        <div ref={progressRef} />
      </div>

      <div className={`bp bp--${prefs.theme} bp--size-${prefs.size} bp--${prefs.font}`}>
        {post.status && post.status !== 'published' && (
          <div className="bp-status" role="status">
            <strong>{statusLabels[post.status]}</strong>
            {post.reviewNote && <span>Note de relecture : {post.reviewNote}</span>}
            {isMine && (
              <Link to={`/blog/ecrire/${post._id}`} className="btn btn-small">
                <PenLine size={16} aria-hidden={true} /> Modifier
              </Link>
            )}
          </div>
        )}

        {/* ---------- Barre d'outils de lecture ---------- */}
        <div className="bp-tools">
          <Link to="/blog" className="bp-tools__back">
            <ArrowLeft size={18} aria-hidden={true} /> Carnet
          </Link>
          <div className="bp-tools__actions">
            {headings.length > 1 && (
              <button type="button" className="bp-tool" onClick={() => setTocOpen((open) => !open)} aria-expanded={tocOpen} aria-label="Sommaire">
                <List size={18} aria-hidden={true} />
              </button>
            )}
            <div className="bp-settings">
              <button
                type="button"
                className="bp-tool"
                onClick={() => setSettingsOpen((open) => !open)}
                aria-expanded={settingsOpen}
                aria-label="Réglages de lecture"
              >
                <Type size={18} aria-hidden={true} />
              </button>
              {settingsOpen && (
                <div className="bp-settings__panel" role="dialog" aria-label="Réglages de lecture">
                  <fieldset>
                    <legend>Taille du texte</legend>
                    <div className="bp-seg">
                      {([0, 1, 2] as const).map((size) => (
                        <button
                          key={size}
                          type="button"
                          className={prefs.size === size ? 'is-active' : ''}
                          aria-pressed={prefs.size === size}
                          onClick={() => setPrefs((p) => ({ ...p, size }))}
                          style={{ fontSize: `${0.85 + size * 0.15}rem` }}
                        >
                          A
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset>
                    <legend>Ambiance</legend>
                    <div className="bp-seg">
                      {(
                        [
                          ['paper', 'Papier'],
                          ['white', 'Blanc'],
                          ['night', 'Nuit'],
                        ] as Array<[ReaderTheme, string]>
                      ).map(([theme, label]) => (
                        <button
                          key={theme}
                          type="button"
                          className={`bp-swatch bp-swatch--${theme}${prefs.theme === theme ? ' is-active' : ''}`}
                          aria-pressed={prefs.theme === theme}
                          onClick={() => setPrefs((p) => ({ ...p, theme }))}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset>
                    <legend>Police</legend>
                    <div className="bp-seg">
                      <button type="button" className={prefs.font === 'serif' ? 'is-active' : ''} aria-pressed={prefs.font === 'serif'} onClick={() => setPrefs((p) => ({ ...p, font: 'serif' }))} style={{ fontFamily: 'var(--font-serif)' }}>
                        Livre
                      </button>
                      <button type="button" className={prefs.font === 'sans' ? 'is-active' : ''} aria-pressed={prefs.font === 'sans'} onClick={() => setPrefs((p) => ({ ...p, font: 'sans' }))}>
                        Écran
                      </button>
                    </div>
                  </fieldset>
                </div>
              )}
            </div>
            <BookmarkButton itemType="blog" itemId={post._id} />
            <ShareButton url={`https://monbaobab.com/blog/${post._id}`} title={post.title} description={post.excerpt} />
          </div>
        </div>

        {/* ---------- Page de titre ---------- */}
        <header className="bp-title">
          <p className="bp-title__kicker">
            {post.category}
            <span aria-hidden="true"> · </span>
            {isTestimony ? 'Témoignage' : 'Article documenté'}
          </p>
          <h1>{post.title}</h1>
          {post.excerpt && <p className="bp-title__lead">{post.excerpt}</p>}
          <p className="bp-title__byline">
            <span>
              Par <strong>{post.author}</strong>
            </span>
            <span>{formatDate(post.createdAt)}</span>
            <span>
              <BookOpen size={15} aria-hidden={true} /> {minutes} min de lecture
            </span>
            {!isTestimony && references.length > 0 && (
              <a href="#references">
                {references.length} source{references.length > 1 ? 's' : ''}
              </a>
            )}
          </p>
          <div className="bp-ornament" aria-hidden="true">
            ❧
          </div>
        </header>

        {post.image && (
          <figure className="bp-plate">
            <img src={post.image} alt="" />
          </figure>
        )}

        {/* ---------- Sommaire ---------- */}
        {headings.length > 1 && (
          <nav className={`bp-toc${tocOpen ? ' is-open' : ''}`} aria-label="Sommaire">
            <div className="bp-toc__head">
              <strong>Sommaire</strong>
              <button type="button" className="bp-tool bp-toc__close" onClick={() => setTocOpen(false)} aria-label="Fermer le sommaire">
                <X size={18} aria-hidden={true} />
              </button>
            </div>
            <ol>
              {headings.map((heading) => (
                <li key={heading.id}>
                  <a href={`#${heading.id}`} className={activeHeading === heading.id ? 'is-active' : ''} onClick={() => setTocOpen(false)}>
                    {heading.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* ---------- Texte ---------- */}
        <article ref={articleRef} className="bp-text">
          {isTestimony && (
            <p className="bp-notice">
              Ce texte est un <strong>témoignage</strong> : il rapporte l’expérience et le point de vue de son auteur·e.
            </p>
          )}
          <ArticleBody content={post.content} references={references} />

          {(images.length > 0 || pdfs.length > 0 || videos.length > 0) && (
            <section className="bp-media" aria-label="Documents">
              {images.length > 0 && (
                <div className="bp-media__gallery">
                  {images.map((image) => (
                    <button key={image.url} type="button" onClick={() => setLightbox(image)}>
                      <img src={image.url} alt={image.caption || ''} loading="lazy" />
                      {image.caption && <span>{image.caption}</span>}
                    </button>
                  ))}
                </div>
              )}
              {(pdfs.length > 0 || videos.length > 0) && (
                <ul className="bp-media__files">
                  {videos.map((item) => (
                    <li key={item.url}>
                      <button type="button" onClick={() => setVideo(item)}>
                        <PlayCircle size={20} aria-hidden={true} /> {item.title}
                      </button>
                    </li>
                  ))}
                  {pdfs.map((item) => (
                    <li key={item.url}>
                      <button type="button" onClick={() => setPdf(item)}>
                        <FileText size={20} aria-hidden={true} /> {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <div className="bp-end" aria-hidden="true">
            <span>❦</span>
          </div>

          {references.length > 0 && (
            <section id="references" className="bp-refs" aria-labelledby="references-title">
              <h2 id="references-title">Références</h2>
              <ReferenceList references={references} />
            </section>
          )}

          <aside className="bp-author">
            <div className="bp-author__avatar" aria-hidden="true">
              {post.author.charAt(0)}
            </div>
            <div>
              <p className="bp-author__label">{isTestimony ? 'Témoignage de' : 'Écrit par'}</p>
              <p className="bp-author__name">{post.author}</p>
              {post.updatedAt && post.updatedAt !== post.createdAt && <p className="bp-author__date">Mis à jour le {formatDate(post.updatedAt)}</p>}
            </div>
          </aside>

          <div className="bp-feedback">
            <a href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Signalement : ${post.title}`)}`}>
              <Flag size={16} aria-hidden={true} /> Signaler une erreur
            </a>
            <Link to="/blog/ecrire">
              <PenLine size={16} aria-hidden={true} /> Transmettre à votre tour
            </Link>
          </div>
        </article>

        {/* ---------- À lire ensuite ---------- */}
        {next.length > 0 && (
          <nav className="bp-next" aria-label="À lire ensuite">
            <h2>À lire ensuite</h2>
            <div className="bp-next__grid">
              {next.map((item) => (
                <Link key={item._id} to={`/blog/${item._id}`} className="bp-next__item">
                  {item.image && <img src={item.image} alt="" loading="lazy" />}
                  <span>
                    <small>{item.category}</small>
                    <strong>{item.title}</strong>
                  </span>
                  <ArrowRight size={18} aria-hidden={true} />
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>

      {/* ---------- Visionneuses ---------- */}
      {lightbox && (
        <div className="bp-modal" role="dialog" aria-modal="true" onClick={() => setLightbox(null)}>
          <figure onClick={(event) => event.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.caption || ''} />
            {lightbox.caption && <figcaption>{lightbox.caption}</figcaption>}
            <button type="button" className="btn btn-outline" onClick={() => setLightbox(null)}>
              Fermer
            </button>
          </figure>
        </div>
      )}
      {pdf && (
        <div className="bp-modal" role="dialog" aria-modal="true" onClick={() => setPdf(null)}>
          <div className="bp-modal__box" onClick={(event) => event.stopPropagation()}>
            <PDFViewer url={pdf.url} title={pdf.title} description={pdf.description} onClose={() => setPdf(null)} />
          </div>
        </div>
      )}
      {video && (
        <div className="bp-modal" role="dialog" aria-modal="true" onClick={() => setVideo(null)}>
          <div className="bp-modal__box" onClick={(event) => event.stopPropagation()}>
            <VideoViewer url={video.url} title={video.title} description={video.description} type={video.type} thumbnail={video.thumbnail} onClose={() => setVideo(null)} />
          </div>
        </div>
      )}
    </Layout>
  )
}
