import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Bold, BookOpen, Check, Eye, Feather, Heading2, Italic, List, Plus, Quote, Send, ShieldCheck, Trash2, Save, PenLine } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { ArticleBody, ReferenceList, plainText, readingMinutes, type ArticleReference } from '../components/Article/ArticleBody'
import { blogService } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useNotifications } from '../hooks/useNotifications'
import { allAfricanCountries } from '../data/allAfricanCountries'
import type { BlogPost } from './BlogPost'
import './BlogPost.css'
import './BlogWrite.css'

type Kind = 'savoir' | 'temoignage'

interface Draft {
  kind: Kind
  title: string
  excerpt: string
  category: string
  country: string
  image: string
  content: string
  references: ArticleReference[]
}

const MIN_LENGTH = 600
const DRAFT_KEY = 'mb-blog-draft'
const categories = ['Culture', 'Histoire', 'Société', 'Arts', 'Cuisine', 'Langues', 'Géographie', 'Économie', 'Politique', 'Autre']
const emptyDraft: Draft = { kind: 'savoir', title: '', excerpt: '', category: 'Culture', country: '', image: '', content: '', references: [] }
const emptyReference: ArticleReference = { title: '', author: '', publisher: '', year: null, url: '' }

const statusInfo: Record<string, { label: string; tone: string }> = {
  draft: { label: 'Brouillon', tone: 'neutral' },
  pending: { label: 'En relecture', tone: 'info' },
  published: { label: 'Publié', tone: 'success' },
  rejected: { label: 'À revoir', tone: 'warning' },
}

const sortedCountries = [...allAfricanCountries].sort((a, b) => a.nameFr.localeCompare(b.nameFr, 'fr'))

export const BlogWrite = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { success, error: notifyError } = useNotifications()
  const [draft, setDraft] = useState<Draft>(() => {
    if (id) return emptyDraft
    try {
      return { ...emptyDraft, ...JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}') }
    } catch {
      return emptyDraft
    }
  })
  const [mine, setMine] = useState<BlogPost[]>([])
  const [view, setView] = useState<'write' | 'preview'>('write')
  const [saving, setSaving] = useState<'draft' | 'pending' | null>(null)
  const [loadedStatus, setLoadedStatus] = useState<string | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(Boolean(id))
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /* ---------- chargement ---------- */
  const refreshMine = () =>
    blogService
      .getMine()
      .then((response) => setMine(response.data))
      .catch(() => undefined)

  useEffect(() => {
    refreshMine()
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    blogService
      .getById(id)
      .then(({ data }) => {
        setDraft({
          kind: data.kind || 'savoir',
          title: data.title || '',
          excerpt: data.excerpt || '',
          category: data.category || 'Culture',
          country: data.country || '',
          image: data.image || '',
          content: data.content || '',
          references: data.references?.length ? data.references : [],
        })
        setLoadedStatus(data.status || null)
        setReviewNote(data.reviewNote || '')
      })
      .catch(() => notifyError('Ce texte est introuvable ou ne vous appartient pas.'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Sauvegarde automatique locale du nouveau texte (rien n'est perdu si la connexion coupe)
  useEffect(() => {
    if (id) return
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
      } catch {
        // stockage indisponible
      }
    }, 500)
    return () => window.clearTimeout(timer)
  }, [draft, id])

  /* ---------- édition ---------- */
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setFormError('')
    setDraft((current) => ({ ...current, [key]: value }))
  }

  /** Insère une syntaxe autour de la sélection, ou en début de ligne */
  const format = (kind: 'h2' | 'quote' | 'list' | 'bold' | 'italic') => {
    const el = textareaRef.current
    if (!el) return
    const { selectionStart: start, selectionEnd: end, value } = el
    const selected = value.slice(start, end)
    let insert = ''
    if (kind === 'bold') insert = `**${selected || 'texte important'}**`
    else if (kind === 'italic') insert = `*${selected || 'mot en langue d’origine'}*`
    else {
      const prefix = kind === 'h2' ? '## ' : kind === 'quote' ? '> ' : '- '
      const body = (selected || (kind === 'h2' ? 'Titre de la partie' : kind === 'quote' ? 'Une phrase à mettre en avant' : 'Élément')).split('\n').map((line) => prefix + line).join('\n')
      const before = value.slice(0, start)
      insert = `${before && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : ''}${body}\n\n`
    }
    const next = value.slice(0, start) + insert + value.slice(end)
    set('content', next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + insert.length, start + insert.length)
    })
  }

  const insertCitation = (n: number) => {
    const el = textareaRef.current
    if (!el) return
    const pos = el.selectionEnd
    set('content', `${draft.content.slice(0, pos)}[${n}]${draft.content.slice(pos)}`)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(pos + String(n).length + 2, pos + String(n).length + 2)
    })
  }

  const updateReference = (index: number, patch: Partial<ArticleReference>) =>
    set(
      'references',
      draft.references.map((ref, i) => (i === index ? { ...ref, ...patch } : ref)),
    )

  /* ---------- contrôles ---------- */
  const length = plainText(draft.content).length
  const words = plainText(draft.content).split(' ').filter(Boolean).length
  const validReferences = draft.references.filter((ref) => ref.title.trim())
  const checks = useMemo(
    () => [
      { ok: draft.title.trim().length >= 3, label: 'Un titre' },
      { ok: length >= MIN_LENGTH, label: `Au moins ${MIN_LENGTH} caractères (${Math.min(length, MIN_LENGTH)}/${MIN_LENGTH})` },
      ...(draft.kind === 'savoir' ? [{ ok: validReferences.length > 0, label: 'Au moins une source' }] : []),
      ...(draft.kind === 'savoir' && validReferences.length > 0 ? [{ ok: /\[\d+\]/.test(draft.content), label: 'Les sources sont appelées dans le texte, ex. [1] (conseillé)', optional: true }] : []),
    ],
    [draft, length, validReferences.length],
  )
  const canSubmit = checks.filter((check) => !('optional' in check)).every((check) => check.ok)
  const isLocked = loadedStatus === 'published'

  const save = async (status: 'draft' | 'pending', event?: FormEvent) => {
    event?.preventDefault()
    setFormError('')
    if (status === 'pending' && !canSubmit) {
      setFormError('Il manque encore quelques éléments avant de soumettre : voir la liste à droite.')
      return
    }
    if (draft.title.trim().length < 3) {
      setFormError('Donnez au moins un titre à votre brouillon.')
      return
    }
    if (draft.content.trim().length < 10) {
      setFormError('Écrivez au moins quelques mots avant d’enregistrer.')
      return
    }
    setSaving(status)
    const payload = {
      ...draft,
      references: validReferences.map((ref) => ({ ...ref, year: ref.year ? Number(ref.year) : null })),
      status,
    }
    try {
      const response = id ? await blogService.update(id, payload) : await blogService.create(payload)
      if (!id) {
        try {
          localStorage.removeItem(DRAFT_KEY)
        } catch {
          // ignoré
        }
      }
      await refreshMine()
      if (status === 'pending') {
        success('Merci. Votre texte est envoyé en relecture, nous vous répondrons ici.')
        navigate(`/blog/${response.data._id}`)
      } else {
        success('Brouillon enregistré.')
        if (!id) navigate(`/blog/ecrire/${response.data._id}`, { replace: true })
        else setLoadedStatus('draft')
      }
    } catch (err) {
      const apiError = (err as { response?: { data?: { error?: string; errors?: Array<{ msg?: string; message?: string }> } } }).response?.data
      setFormError(apiError?.error || apiError?.errors?.[0]?.msg || apiError?.errors?.[0]?.message || 'L’enregistrement a échoué. Vérifiez votre connexion et réessayez.')
    } finally {
      setSaving(null)
    }
  }

  const removeText = async (post: BlogPost) => {
    if (!window.confirm(`Supprimer définitivement « ${post.title} » ?`)) return
    try {
      await blogService.delete(post._id)
      await refreshMine()
      if (post._id === id) navigate('/blog/ecrire', { replace: true })
      success('Texte supprimé.')
    } catch {
      notifyError('Suppression impossible.')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="mb-page-loader">
          <div className="mb-skeleton" style={{ height: 40, width: '40%' }} />
          <div className="mb-skeleton" style={{ height: 420 }} />
        </div>
      </Layout>
    )
  }

  return (
    <Layout fullWidth>
      <div className="bw">
        <header className="bw-head container">
          <div>
            <p className="eyebrow">Carnet de savoirs</p>
            <h1>{id ? 'Modifier mon texte' : 'Transmettre un savoir ou une expérience'}</h1>
            <p>
              Bonjour {user?.name?.split(' ')[0] || ''} ! Écrivez à votre rythme : votre brouillon est enregistré automatiquement sur cet appareil.
              Chaque texte est relu par l’équipe avant publication.
            </p>
          </div>
          {id && (
            <Link to="/blog/ecrire" className="btn btn-outline">
              <PenLine size={18} aria-hidden={true} /> Nouveau texte
            </Link>
          )}
        </header>

        {reviewNote && loadedStatus === 'rejected' && (
          <div className="container">
            <div className="bw-review" role="status">
              <strong>Retour de la relecture</strong>
              <p>{reviewNote}</p>
              <span>Modifiez votre texte puis soumettez-le à nouveau.</span>
            </div>
          </div>
        )}

        {isLocked && (
          <div className="container">
            <div className="bw-review bw-review--ok" role="status">
              <strong>Ce texte est publié.</strong>
              <p>
                Pour le modifier, écrivez à l’équipe : nous mettrons à jour la version en ligne. <Link to={`/blog/${id}`}>Voir le texte publié</Link>
              </p>
            </div>
          </div>
        )}

        <div className="container bw-layout">
          {/* ---------- Formulaire ---------- */}
          <form className="bw-form" onSubmit={(event) => save('pending', event)} aria-describedby="bw-checks">
            <fieldset className="bw-kind" disabled={isLocked}>
              <legend>Quel type de texte ?</legend>
              <label className={draft.kind === 'savoir' ? 'is-active' : ''}>
                <input type="radio" name="kind" value="savoir" checked={draft.kind === 'savoir'} onChange={() => set('kind', 'savoir')} />
                <ShieldCheck size={22} aria-hidden={true} />
                <strong>Partager un savoir</strong>
                <span>Histoire, technique, tradition, lieu… appuyé sur des sources que vous citez.</span>
              </label>
              <label className={draft.kind === 'temoignage' ? 'is-active' : ''}>
                <input type="radio" name="kind" value="temoignage" checked={draft.kind === 'temoignage'} onChange={() => set('kind', 'temoignage')} />
                <Feather size={22} aria-hidden={true} />
                <strong>Raconter une expérience</strong>
                <span>Un souvenir, une pratique familiale, un voyage : votre voix, présentée comme un témoignage.</span>
              </label>
            </fieldset>

            <fieldset className="bw-fields" disabled={isLocked}>
              <label className="bw-field bw-field--title">
                <span>Titre</span>
                <input type="text" value={draft.title} maxLength={200} onChange={(event) => set('title', event.target.value)} placeholder="Un titre clair et évocateur" required />
              </label>

              <label className="bw-field">
                <span>
                  Chapeau <small>(facultatif : 2 ou 3 phrases qui donnent envie de lire)</small>
                </span>
                <textarea rows={2} maxLength={400} value={draft.excerpt} onChange={(event) => set('excerpt', event.target.value)} />
              </label>

              <div className="bw-row">
                <label className="bw-field">
                  <span>Thème</span>
                  <select value={draft.category} onChange={(event) => set('category', event.target.value)}>
                    {categories.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="bw-field">
                  <span>Pays concerné</span>
                  <select value={draft.country} onChange={(event) => set('country', event.target.value)}>
                    <option value="">Plusieurs / aucun en particulier</option>
                    {sortedCountries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.nameFr}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="bw-field">
                <span>
                  Image d’illustration <small>(facultatif : lien vers une image dont vous avez les droits)</small>
                </span>
                <input type="url" value={draft.image} onChange={(event) => set('image', event.target.value)} placeholder="https://…" />
              </label>
            </fieldset>

            {/* Éditeur */}
            <div className="bw-editor">
              <div className="bw-editor__bar">
                <div className="bw-tabs" role="tablist">
                  <button type="button" role="tab" aria-selected={view === 'write'} className={view === 'write' ? 'is-active' : ''} onClick={() => setView('write')}>
                    <PenLine size={16} aria-hidden={true} /> Écrire
                  </button>
                  <button type="button" role="tab" aria-selected={view === 'preview'} className={view === 'preview' ? 'is-active' : ''} onClick={() => setView('preview')}>
                    <Eye size={16} aria-hidden={true} /> Aperçu
                  </button>
                </div>
                {view === 'write' && !isLocked && (
                  <div className="bw-format" aria-label="Mise en forme">
                    <button type="button" onClick={() => format('h2')} title="Titre de partie" aria-label="Titre de partie">
                      <Heading2 size={18} aria-hidden={true} />
                    </button>
                    <button type="button" onClick={() => format('bold')} title="Gras" aria-label="Gras">
                      <Bold size={18} aria-hidden={true} />
                    </button>
                    <button type="button" onClick={() => format('italic')} title="Italique" aria-label="Italique">
                      <Italic size={18} aria-hidden={true} />
                    </button>
                    <button type="button" onClick={() => format('quote')} title="Citation en exergue" aria-label="Citation en exergue">
                      <Quote size={18} aria-hidden={true} />
                    </button>
                    <button type="button" onClick={() => format('list')} title="Liste" aria-label="Liste">
                      <List size={18} aria-hidden={true} />
                    </button>
                  </div>
                )}
              </div>

              {view === 'write' ? (
                <textarea
                  ref={textareaRef}
                  className="bw-textarea"
                  value={draft.content}
                  onChange={(event) => set('content', event.target.value)}
                  disabled={isLocked}
                  aria-label="Texte"
                  placeholder={
                    draft.kind === 'savoir'
                      ? 'Commencez par ce qui a éveillé votre curiosité…\n\nSéparez les paragraphes par une ligne vide. Citez vos sources avec [1], [2]…'
                      : 'Racontez : où, quand, avec qui ? Qu’avez-vous vu, appris, ressenti ?\n\nSéparez les paragraphes par une ligne vide.'
                  }
                />
              ) : (
                <div className="bw-preview bp bp--paper bp--size-1 bp--serif">
                  <div className="bp-title">
                    <p className="bp-title__kicker">
                      {draft.category} · {draft.kind === 'temoignage' ? 'Témoignage' : 'Article documenté'}
                    </p>
                    <h1>{draft.title || 'Votre titre'}</h1>
                    {draft.excerpt && <p className="bp-title__lead">{draft.excerpt}</p>}
                    <p className="bp-title__byline">
                      <span>
                        Par <strong>{user?.name}</strong>
                      </span>
                      <span>
                        <BookOpen size={15} aria-hidden={true} /> {readingMinutes(draft.content || ' ')} min de lecture
                      </span>
                    </p>
                  </div>
                  <div className="bp-text bw-preview__text">
                    {draft.content.trim() ? <ArticleBody content={draft.content} references={validReferences} /> : <p className="bw-empty">L’aperçu de votre texte s’affichera ici.</p>}
                    {validReferences.length > 0 && (
                      <section className="bp-refs">
                        <h2>Références</h2>
                        <ReferenceList references={validReferences} />
                      </section>
                    )}
                  </div>
                </div>
              )}
              <p className="bw-count">
                {words} mot{words > 1 ? 's' : ''} · environ {readingMinutes(draft.content || ' ')} min de lecture
              </p>
            </div>

            {/* Sources */}
            <fieldset className="bw-refs" disabled={isLocked}>
              <legend>
                Sources {draft.kind === 'savoir' ? <em>(au moins une)</em> : <small>(facultatif pour un témoignage)</small>}
              </legend>
              <p className="bw-help">
                Livre, article, site d’une institution (musée, université, UNESCO…), archive ou entretien. Appelez-les dans le texte avec leur numéro.
              </p>
              {draft.references.map((ref, index) => (
                <div key={index} className="bw-ref">
                  <span className="bw-ref__num">{index + 1}</span>
                  <div className="bw-ref__fields">
                    <input type="text" placeholder="Titre de l’ouvrage, de l’article ou de la page *" value={ref.title} onChange={(event) => updateReference(index, { title: event.target.value })} aria-label={`Source ${index + 1} : titre`} />
                    <div className="bw-row bw-row--3">
                      <input type="text" placeholder="Auteur·e" value={ref.author || ''} onChange={(event) => updateReference(index, { author: event.target.value })} aria-label={`Source ${index + 1} : auteur`} />
                      <input type="text" placeholder="Éditeur, revue ou site" value={ref.publisher || ''} onChange={(event) => updateReference(index, { publisher: event.target.value })} aria-label={`Source ${index + 1} : éditeur`} />
                      <input type="number" placeholder="Année" min={1000} max={2100} value={ref.year ?? ''} onChange={(event) => updateReference(index, { year: event.target.value ? Number(event.target.value) : null })} aria-label={`Source ${index + 1} : année`} />
                    </div>
                    <input type="url" placeholder="Lien (https://…)" value={ref.url || ''} onChange={(event) => updateReference(index, { url: event.target.value })} aria-label={`Source ${index + 1} : lien`} />
                  </div>
                  <div className="bw-ref__actions">
                    <button type="button" className="btn btn-ghost btn-small" onClick={() => insertCitation(index + 1)} title="Insérer l’appel de note à l’endroit du curseur">
                      [{index + 1}]
                    </button>
                    <button type="button" className="btn btn-ghost btn-small" onClick={() => set('references', draft.references.filter((_, i) => i !== index))} aria-label={`Retirer la source ${index + 1}`}>
                      <Trash2 size={16} aria-hidden={true} />
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-outline" onClick={() => set('references', [...draft.references, { ...emptyReference }])}>
                <Plus size={18} aria-hidden={true} /> Ajouter une source
              </button>
            </fieldset>

            {formError && (
              <p className="bw-error" role="alert">
                {formError}
              </p>
            )}

            {!isLocked && (
              <div className="bw-actions">
                <button type="button" className="btn btn-outline btn-large" onClick={() => save('draft')} disabled={saving !== null}>
                  <Save size={18} aria-hidden={true} /> {saving === 'draft' ? 'Enregistrement…' : 'Enregistrer le brouillon'}
                </button>
                <button type="submit" className="btn btn-large" disabled={saving !== null}>
                  <Send size={18} aria-hidden={true} /> {saving === 'pending' ? 'Envoi…' : 'Soumettre à la relecture'}
                </button>
              </div>
            )}
          </form>

          {/* ---------- Colonne d'aide ---------- */}
          <aside className="bw-side">
            <section className="bw-card" id="bw-checks" aria-live="polite">
              <h2>Avant de soumettre</h2>
              <ul className="bw-checks">
                {checks.map((check) => (
                  <li key={check.label} className={check.ok ? 'is-ok' : 'optional' in check ? 'is-optional' : ''}>
                    <span aria-hidden="true">{check.ok ? <Check size={14} /> : '•'}</span>
                    {check.label}
                    <span className="sr-only">{check.ok ? ' : fait' : ' : à faire'}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bw-card">
              <h2>Mise en forme</h2>
              <dl className="bw-syntax">
                <div>
                  <dt>## Titre</dt>
                  <dd>une partie</dd>
                </div>
                <div>
                  <dt>&gt; Phrase</dt>
                  <dd>citation en exergue</dd>
                </div>
                <div>
                  <dt>- Élément</dt>
                  <dd>liste</dd>
                </div>
                <div>
                  <dt>*mot*</dt>
                  <dd>italique</dd>
                </div>
                <div>
                  <dt>[1]</dt>
                  <dd>renvoi à la source n°1</dd>
                </div>
              </dl>
            </section>

            <section className="bw-card">
              <h2>Notre charte</h2>
              <ul className="bw-charter">
                <li>Écrivez avec vos mots : pas de copier-coller d’autres sites.</li>
                <li>Distinguez ce que vous savez de source sûre et ce que vous avez vécu.</li>
                <li>Parlez des cultures avec respect, sans généraliser à « l’Afrique ».</li>
                <li>N’utilisez que des images dont vous avez les droits.</li>
                <li>Pour un témoignage, évitez de nommer des personnes sans leur accord.</li>
              </ul>
            </section>

            {mine.length > 0 && (
              <section className="bw-card">
                <h2>Mes textes</h2>
                <ul className="bw-mine">
                  {mine.map((post) => {
                    const info = statusInfo[post.status || 'published']
                    return (
                      <li key={post._id} className={post._id === id ? 'is-current' : ''}>
                        <Link to={post.status === 'published' ? `/blog/${post._id}` : `/blog/ecrire/${post._id}`}>{post.title}</Link>
                        <span className={`bw-status bw-status--${info.tone}`}>{info.label}</span>
                        {post.status !== 'published' && (
                          <button type="button" className="bw-mine__delete" onClick={() => removeText(post)} aria-label={`Supprimer ${post.title}`}>
                            <Trash2 size={14} aria-hidden={true} />
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </div>
    </Layout>
  )
}
