import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { BookmarkButton } from '../components/BookmarkButton/BookmarkButton'
import { ShareButton } from '../components/ShareButton/ShareButton'
import { getStory, RECITS } from '../data/recitsContent'
import { MARK_PATH, MARK_VIEWBOX } from '../data/brandMark'
import './RecitDetail.css'

// Page de lecture d'un récit d'après la maquette Figma « Récit / Desktop 1440 ».

export const RecitDetail = () => {
  const { id } = useParams<{ id: string }>()
  const story = getStory(id)

  // L'entrée active du sommaire suit la section visible à l'écran
  const [activeId, setActiveId] = useState('')
  useEffect(() => {
    if (!story) return
    setActiveId(story.sections[0]?.id ?? '')
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-96px 0px -55% 0px' },
    )
    const ids = [...story.sections.map((section) => section.id), 'sources']
    ids.forEach((sectionId) => {
      const element = document.getElementById(sectionId)
      if (element) observer.observe(element)
    })
    return () => observer.disconnect()
  }, [story])

  if (!story) {
    return (
      <Layout fullWidth>
        <div className="mrd">
          <p className="mrd-empty">
            Ce récit n’existe pas encore. <Link to="/recits">Revenir à la liste</Link>
          </p>
        </div>
      </Layout>
    )
  }

  const toc = [
    ...story.sections.map((section) => ({ id: section.id, label: section.title || 'Introduction' })),
    { id: 'sources', label: 'Sources' },
  ]
  const others = RECITS.filter((recit) => recit.id !== story.id)

  return (
    <Layout fullWidth>
      <div className="mrd">
        <header className="mrd-head">
          <Link to="/recits" className="mrd-back">
            <ArrowLeft size={16} strokeWidth={1.6} aria-hidden="true" /> Retour aux récits
          </Link>
          <p className="mrd-kicker">{story.meta}</p>
          <h1>{story.title}</h1>
          <p className="mrd-lead">{story.chapeau}</p>
          <div className="mrd-sign">
            <div className="mrd-author">
              <span className="mrd-author-mark" aria-hidden="true">
                <svg viewBox={MARK_VIEWBOX}>
                  <path d={MARK_PATH} fill="currentColor" />
                </svg>
              </span>
              <span className="mrd-author-text">
                <strong>{story.author}</strong>
                <span>{story.date}</span>
              </span>
            </div>
            <div className="mrd-actions">
              <BookmarkButton itemType="story" itemId={story.id} iconOnly className="mrd-round" />
              <ShareButton url={`/recit/${story.id}`} title={story.title} iconOnly className="mrd-round-wrap" />
            </div>
          </div>
        </header>

        <figure className="mrd-figure">
          <img src={story.image} alt={story.caption} width={1200} height={560} />
          {/* Sur mobile, le retour et les actions se posent sur la photo (maquette Mobile 390) */}
          <div className="mrd-figure-bar">
            <Link to="/recits" className="mrd-round" aria-label="Retour aux récits">
              <ArrowLeft size={20} strokeWidth={1.6} aria-hidden="true" />
            </Link>
            <div className="mrd-photo-actions">
              <BookmarkButton itemType="story" itemId={story.id} iconOnly className="mrd-round" />
              <ShareButton url={`/recit/${story.id}`} title={story.title} iconOnly className="mrd-round-wrap" />
            </div>
          </div>
          <figcaption>{story.caption}</figcaption>
        </figure>

        <div className="mrd-body">
          <article className="mrd-text">
            {story.sections.map((section) => (
              <section key={section.id} id={section.id}>
                {section.title && <h2>{section.title}</h2>}
                {section.blocks.map((block, index) =>
                  block.kind === 'quote' ? (
                    <blockquote key={index} className="mrd-quote">
                      <p>{block.text}</p>
                    </blockquote>
                  ) : block.kind === 'fact' ? (
                    <aside key={index} className="mrd-fact">
                      <p className="mrd-kicker">Le saviez-vous</p>
                      <p>{block.text}</p>
                    </aside>
                  ) : (
                    <p key={index}>{block.text}</p>
                  ),
                )}
              </section>
            ))}
            <section id="sources" className="mrd-sources">
              <ul>
                {story.sources.map((source, index) => (
                  <li key={source.label}>
                    <span className="mrd-num">{index + 1}</span>
                    <span className="mrd-source-text">
                      <p className="mrd-kicker">{source.type}</p>
                      <p>{source.label}</p>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </article>

          <aside className="mrd-aside">
            <nav className="mrd-toc" aria-label="Dans ce récit">
              <p className="mrd-kicker">Dans ce récit</p>
              {toc.map((item) => (
                <a key={item.id} href={`#${item.id}`} className={item.id === activeId ? 'is-active' : undefined}>
                  <i aria-hidden="true" />
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mrd-country">
              <p className="mrd-kicker">Pays lié</p>
              <h2>{story.country.name}</h2>
              <p>{story.country.text}</p>
              <Link to={`/country/${story.country.code}`} className="mrd-country-link">
                Voir la fiche pays <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>

        <section className="mrd-next">
          <h2>À lire ensuite</h2>
          <ul>
            {others.map((recit) => (
              <li key={recit.id}>
                <Link to={recit.to} className="mrd-next-card">
                  <span className="mrd-next-media" style={{ backgroundImage: `url(${recit.image})` }} aria-hidden="true" />
                  <span className="mrd-next-body">
                    <span className="mrd-kicker">{recit.meta}</span>
                    <h3>{recit.title}</h3>
                    <p>{recit.excerpt}</p>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Layout>
  )
}
