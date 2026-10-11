import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { sourceService } from '../../services/api'
import { useNotifications } from '../../hooks/useNotifications'
import './AdminSources.css'

interface Source {
  _id: string
  type: string
  title: string
  author?: string
  publisher?: string
  year?: number
  url?: string
  language?: string
  reliability?: number
  description?: string
  keywords?: string[]
}

const emptyForm = {
  type: 'website',
  title: '',
  author: '',
  publisher: '',
  year: '',
  url: '',
  language: 'fr',
  reliability: 3,
  description: '',
  keywords: '',
  relatedTopics: '',
}

export const AdminSources = () => {
  const [sources, setSources] = useState<Source[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [loading, setLoading] = useState(true)
  const { success, error } = useNotifications()

  const fetchSources = async () => {
    try {
      setLoading(true)
      const response = await sourceService.getAll({ limit: 100 })
      setSources(response.data.sources || [])
    } catch (fetchError) {
      console.error('Erreur sources admin:', fetchError)
      error('Impossible de charger les sources')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSources()
  }, [])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId('')
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const payload = {
      ...form,
      year: form.year ? Number(form.year) : null,
      reliability: Number(form.reliability),
      keywords: form.keywords.split(',').map((item) => item.trim()).filter(Boolean),
      relatedTopics: form.relatedTopics.split(',').map((item) => item.trim()).filter(Boolean),
    }

    try {
      if (editingId) {
        await sourceService.update(editingId, payload)
        success('Source mise à jour')
      } else {
        await sourceService.create(payload)
        success('Source ajoutée')
      }
      resetForm()
      fetchSources()
    } catch (submitError) {
      console.error('Erreur sauvegarde source:', submitError)
      error('Impossible de sauvegarder la source')
    }
  }

  const editSource = (source: Source) => {
    setEditingId(source._id)
    setForm({
      type: source.type || 'website',
      title: source.title || '',
      author: source.author || '',
      publisher: source.publisher || '',
      year: source.year ? String(source.year) : '',
      url: source.url || '',
      language: source.language || 'fr',
      reliability: source.reliability || 3,
      description: source.description || '',
      keywords: source.keywords?.join(', ') || '',
      relatedTopics: '',
    })
  }

  return (
    <div className="admin-sources">
      <form className="admin-source-form" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Modifier une source' : 'Ajouter une source'}</h2>
        <div className="admin-source-grid">
          <label>Type
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
              <option value="book">Livre</option>
              <option value="article">Article</option>
              <option value="document">Document</option>
              <option value="archive">Archive</option>
              <option value="testimony">Témoignage</option>
              <option value="museum">Musée</option>
              <option value="video">Audio/vidéo</option>
              <option value="website">Site</option>
            </select>
          </label>
          <label>Titre
            <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </label>
          <label>Auteur
            <input value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} />
          </label>
          <label>Éditeur
            <input value={form.publisher} onChange={(event) => setForm({ ...form, publisher: event.target.value })} />
          </label>
          <label>Année
            <input value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} />
          </label>
          <label>Fiabilité
            <select value={form.reliability} onChange={(event) => setForm({ ...form, reliability: Number(event.target.value) })}>
              <option value={1}>1 - faible</option>
              <option value={2}>2 - à vérifier</option>
              <option value={3}>3 - contextualisée</option>
              <option value={4}>4 - solide</option>
              <option value={5}>5 - officielle</option>
            </select>
          </label>
        </div>
        <label>URL
          <input value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} />
        </label>
        <label>Description
          <textarea rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </label>
        <label>Mots-clés
          <input value={form.keywords} onChange={(event) => setForm({ ...form, keywords: event.target.value })} />
        </label>
        <div className="admin-source-actions">
          <button type="submit">{editingId ? 'Mettre à jour' : 'Ajouter'}</button>
          {editingId && <button type="button" onClick={resetForm}>Annuler</button>}
        </div>
      </form>

      <div className="admin-source-list">
        <h2>Bibliothèque ({sources.length})</h2>
        {loading ? <p>Chargement...</p> : sources.map((source) => (
          <article key={source._id}>
            <span>{source.type} · fiabilité {source.reliability || 3}/5</span>
            <h3>{source.title}</h3>
            <p>{source.description}</p>
            <button type="button" onClick={() => editSource(source)}>Modifier</button>
          </article>
        ))}
      </div>
    </div>
  )
}
