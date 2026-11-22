import { lienContenu } from '../../utils/liens'
import { useEffect, useState } from 'react'
import { Check, ExternalLink, Feather, ShieldCheck, Undo2 } from 'lucide-react'
import { blogService } from '../../services/api'
import { useNotifications } from '../../hooks/useNotifications'
import './ModerationQueue.css'

interface PendingPost {
  _id: string
  title: string
  author: string
  kind?: 'savoir' | 'temoignage'
  category?: string
  excerpt?: string
  content: string
  references?: Array<{ title: string; url?: string }>
  createdAt: string
  updatedAt?: string
}

/** File de relecture des textes proposés par les membres (administration). */
export const ModerationQueue = ({ onChange }: { onChange?: () => void }) => {
  const [pending, setPending] = useState<PendingPost[]>([])
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const { success, error } = useNotifications()

  const load = () =>
    blogService
      .getAll({ status: 'pending' })
      .then((response) => setPending(response.data))
      .catch(() => setPending([]))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const decide = async (post: PendingPost, decision: 'approve' | 'reject') => {
    const note = notes[post._id]?.trim() || ''
    if (decision === 'reject' && !note) {
      error('Expliquez à l’auteur ce qu’il faut revoir : la note lui sera affichée.')
      return
    }
    setBusy(post._id)
    try {
      await blogService.review(post._id, decision, note)
      success(decision === 'approve' ? `« ${post.title} » est publié.` : 'Le texte a été renvoyé à son auteur avec votre note.')
      await load()
      onChange?.()
    } catch {
      error('Action impossible, réessayez.')
    } finally {
      setBusy(null)
    }
  }

  if (loading) return null

  return (
    <section className="mq" aria-labelledby="mq-title">
      <header className="mq__head">
        <h3 id="mq-title">À relire</h3>
        <span className="mq__count">{pending.length}</span>
      </header>

      {pending.length === 0 ? (
        <p className="mq__empty">Aucun texte en attente. Les propositions des membres apparaîtront ici.</p>
      ) : (
        <ul className="mq__list">
          {pending.map((post) => {
            const words = post.content.split(/\s+/).length
            return (
              <li key={post._id} className="mq__item">
                <div className="mq__info">
                  <p className="mq__meta">
                    {post.kind === 'temoignage' ? (
                      <span className="mq__kind mq__kind--testimony">
                        <Feather size={13} aria-hidden={true} /> Témoignage
                      </span>
                    ) : (
                      <span className="mq__kind">
                        <ShieldCheck size={13} aria-hidden={true} /> Savoir · {post.references?.length || 0} source(s)
                      </span>
                    )}
                    <span>{post.category}</span>
                    <span>{words} mots</span>
                    <span>{new Date(post.updatedAt || post.createdAt).toLocaleDateString('fr-FR')}</span>
                  </p>
                  <strong className="mq__title">{post.title}</strong>
                  <span className="mq__author">par {post.author}</span>
                  {post.excerpt && <p className="mq__excerpt">{post.excerpt}</p>}
                  <a href={lienContenu('blog', post)} target="_blank" rel="noopener noreferrer" className="mq__open">
                    Lire le texte complet <ExternalLink size={14} aria-hidden={true} />
                  </a>
                </div>
                <div className="mq__actions">
                  <label className="sr-only" htmlFor={`note-${post._id}`}>
                    Note pour l’auteur
                  </label>
                  <textarea
                    id={`note-${post._id}`}
                    rows={3}
                    placeholder="Note pour l’auteur (obligatoire pour renvoyer, facultative pour publier)"
                    value={notes[post._id] || ''}
                    onChange={(event) => setNotes((current) => ({ ...current, [post._id]: event.target.value }))}
                  />
                  <div className="mq__buttons">
                    <button type="button" className="btn btn-outline btn-small" disabled={busy === post._id} onClick={() => decide(post, 'reject')}>
                      <Undo2 size={16} aria-hidden={true} /> Renvoyer
                    </button>
                    <button type="button" className="btn btn-small" disabled={busy === post._id} onClick={() => decide(post, 'approve')}>
                      <Check size={16} aria-hidden={true} /> Publier
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
