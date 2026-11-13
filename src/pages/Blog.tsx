import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Feather, PenLine, Search, ShieldCheck } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { readingMinutes } from '../components/Article/ArticleBody'
import { blogService } from '../services/api'
import type { BlogPost } from './BlogPost'
import './Blog.css'

type KindFilter = 'all' | 'savoir' | 'temoignage'

const formatDate = (value: string) => new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

const Meta = ({ post }: { post: BlogPost }) => (
  <p className="bl-meta">
    <span>{post.author}</span>
    <span>
      <BookOpen size={14} aria-hidden={true} /> {readingMinutes(post.content)} min
    </span>
    {post.kind === 'temoignage' ? (
      <span className="bl-badge bl-badge--testimony">
        <Feather size={13} aria-hidden={true} /> Témoignage
      </span>
    ) : (post.references?.length ?? 0) > 0 ? (
      <span className="bl-badge">
        <ShieldCheck size={13} aria-hidden={true} /> {post.references!.length} source{post.references!.length > 1 ? 's' : ''}
      </span>
    ) : null}
  </p>
)

export const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [kind, setKind] = useState<KindFilter>('all')
  const [category, setCategory] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    blogService
      .getAll({ published: true })
      .then((response) => setPosts(response.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => [...new Set(posts.map((post) => post.category).filter(Boolean))] as string[], [posts])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter(
      (post) =>
        (kind === 'all' || (post.kind || 'savoir') === kind) &&
        (!category || post.category === category) &&
        (!q || `${post.title} ${post.excerpt} ${post.tags?.join(' ')} ${post.author}`.toLowerCase().includes(q)),
    )
  }, [posts, kind, category, query])

  const isFiltered = kind !== 'all' || Boolean(category) || Boolean(query.trim())
  const [featured, ...rest] = filtered

  return (
    <Layout fullWidth>
      <div className="bl">
        {/* ---------- En-tête ---------- */}
        <header className="bl-head container">
          <div>
            <p className="eyebrow">Carnet de savoirs</p>
            <h1>Lire, comprendre, transmettre</h1>
            <p className="bl-head__lead">
              Des articles documentés et sourcés, et des témoignages de celles et ceux qui vivent les cultures dont ils parlent.
            </p>
          </div>
          <Link to="/blog/ecrire" className="btn btn-large">
            <PenLine size={18} aria-hidden={true} /> Écrire un texte
          </Link>
        </header>

        {/* ---------- Filtres ---------- */}
        <div className="bl-filters container">
          <div className="bl-kinds" role="tablist" aria-label="Type de texte">
            {(
              [
                ['all', 'Tout'],
                ['savoir', 'Articles documentés'],
                ['temoignage', 'Témoignages'],
              ] as Array<[KindFilter, string]>
            ).map(([value, label]) => (
              <button key={value} type="button" role="tab" aria-selected={kind === value} className={kind === value ? 'is-active' : ''} onClick={() => setKind(value)}>
                {label}
              </button>
            ))}
          </div>
          <div className="bl-filters__right">
            <label className="bl-search">
              <Search size={16} aria-hidden={true} />
              <span className="sr-only">Rechercher un texte</span>
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher" />
            </label>
            <label className="sr-only" htmlFor="bl-category">
              Thème
            </label>
            <select id="bl-category" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">Tous les thèmes</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="container">
          {loading ? (
            <div className="bl-grid" aria-busy="true">
              <div className="mb-skeleton bl-skeleton-feature" />
              {[0, 1, 2].map((i) => (
                <div key={i} className="mb-skeleton" style={{ height: 340 }} />
              ))}
            </div>
          ) : error ? (
            <div className="mb-state">
              <h3>Le carnet est momentanément indisponible</h3>
              <p>Réessayez dans quelques instants.</p>
              <button type="button" className="btn" onClick={() => window.location.reload()}>
                Réessayer
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="mb-state">
              <h3>{posts.length === 0 ? 'Aucun texte publié pour le moment' : 'Aucun texte ne correspond'}</h3>
              <p>{posts.length === 0 ? 'Soyez la première personne à transmettre un savoir.' : 'Essayez un autre thème ou un autre mot.'}</p>
              {isFiltered ? (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setKind('all')
                    setCategory('')
                    setQuery('')
                  }}
                >
                  Effacer les filtres
                </button>
              ) : (
                <Link to="/blog/ecrire" className="btn">
                  Écrire un texte
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* ---------- À la une ---------- */}
              {featured && (
                <Link to={`/blog/${featured._id}`} className="bl-feature">
                  <div className="bl-feature__media">{featured.image && <img src={featured.image} alt="" />}</div>
                  <div className="bl-feature__body">
                    <p className="bl-kicker">
                      {isFiltered ? featured.category : 'À la une'} · {formatDate(featured.createdAt)}
                    </p>
                    <h2>{featured.title}</h2>
                    {featured.excerpt && <p className="bl-feature__excerpt">{featured.excerpt}</p>}
                    <Meta post={featured} />
                    <span className="link-arrow">
                      Lire le texte <ArrowRight size={16} aria-hidden={true} />
                    </span>
                  </div>
                </Link>
              )}

              {rest.length > 0 && (
                <div className="bl-grid">
                  {rest.map((post) => (
                    <Link key={post._id} to={`/blog/${post._id}`} className="bl-card">
                      <div className="bl-card__media">{post.image && <img src={post.image} alt="" loading="lazy" />}</div>
                      <div className="bl-card__body">
                        <p className="bl-kicker">{post.category}</p>
                        <h3>{post.title}</h3>
                        {post.excerpt && <p className="bl-card__excerpt">{post.excerpt}</p>}
                        <Meta post={post} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ---------- Transmettre ---------- */}
        <section className="bl-invite" aria-labelledby="bl-invite-title">
          <div className="container bl-invite__inner">
            <div>
              <p className="eyebrow">À vous la plume</p>
              <h2 id="bl-invite-title">Vous avez un savoir ou une expérience à transmettre ?</h2>
              <p>
                Une recette de famille, l’histoire d’un lieu, un savoir-faire, un souvenir : chaque texte est relu par l’équipe avant
                publication, pour qu’il soit à la fois fidèle à votre voix et juste dans ses faits.
              </p>
            </div>
            <ol className="bl-steps">
              <li>
                <strong>Choisissez</strong> un article documenté ou un témoignage
              </li>
              <li>
                <strong>Écrivez</strong> avec l’aperçu en direct, citez vos sources
              </li>
              <li>
                <strong>Soumettez</strong> : nous relisons et vous répondons
              </li>
            </ol>
            <Link to="/blog/ecrire" className="btn btn-large">
              <PenLine size={18} aria-hidden={true} /> Commencer à écrire
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  )
}
