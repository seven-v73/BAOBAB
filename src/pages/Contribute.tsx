import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { contributionService, countryService } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useNotifications } from '../hooks/useNotifications'
import './Contribute.css'

const contributionTypes = [
  { value: 'proverb', label: 'Proverbe', hint: 'Texte, langue, contexte, pays.' },
  { value: 'correction', label: 'Correction', hint: 'Signaler une précision ou erreur.' },
  { value: 'source', label: 'Source', hint: 'Livre, archive, musée, lien fiable.' },
  { value: 'photo', label: 'Photo', hint: 'Image culturelle avec contexte.' },
  { value: 'family-memory', label: 'Mémoire familiale', hint: 'Récit transmis dans une famille.' },
  { value: 'place', label: 'Lieu culturel', hint: 'Site, musée, village, espace de mémoire.' },
  { value: 'oral-tradition', label: 'Tradition orale', hint: 'Conte, chant, formule, témoignage.' },
]

export const Contribute = () => {
  const { isAuthenticated } = useAuthStore()
  const { success, error } = useNotifications()
  const navigate = useNavigate()
  const [countries, setCountries] = useState<Array<{ id: string; nameFr: string }>>([])
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    type: 'source',
    title: '',
    content: '',
    country: '',
    language: '',
    period: '',
    location: '',
    sourceUrl: '',
    mediaUrl: '',
    tags: '',
    visibility: 'public',
  })

  useEffect(() => {
    countryService.getAll()
      .then((response) => {
        const items = response.data.countries || response.data || []
        setCountries(Array.isArray(items) ? items : [])
      })
      .catch(() => setCountries([]))
  }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent('/contribute')}`)
      return
    }

    try {
      setSubmitting(true)
      await contributionService.create(form)
      success('Contribution envoyée pour vérification')
      setForm({
        type: 'source',
        title: '',
        content: '',
        country: '',
        language: '',
        period: '',
        location: '',
        sourceUrl: '',
        mediaUrl: '',
        tags: '',
        visibility: 'public',
      })
    } catch (submitError) {
      console.error('Erreur contribution:', submitError)
      error('Impossible d’envoyer la contribution')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedType = contributionTypes.find((item) => item.value === form.type)

  return (
    <Layout>
      <main className="contribute-page">
        <section className="contribute-hero">
          <p>Transmission communautaire</p>
          <h1>Proposer un savoir, une source ou une mémoire.</h1>
          <span>
            Chaque contribution passe par une vérification avant d’être intégrée. MonBaobab garde
            la nuance entre source officielle, tradition orale, témoignage et correction.
          </span>
        </section>

        <section className="contribute-shell">
          <aside className="contribute-guidelines">
            <h2>Charte courte</h2>
            <ul>
              <li>Préciser le pays, la langue ou le contexte quand c’est possible.</li>
              <li>Ajouter une source ou expliquer l’origine du témoignage.</li>
              <li>Respecter les personnes, les peuples et les nuances locales.</li>
              <li>Éviter les clichés et les affirmations impossibles à vérifier.</li>
            </ul>
            <Link to="/sources">Voir la bibliothèque</Link>
          </aside>

          <form className="contribute-form" onSubmit={handleSubmit}>
            <div className="contribute-type-grid">
              {contributionTypes.map((item) => (
                <button
                  type="button"
                  key={item.value}
                  className={form.type === item.value ? 'active' : ''}
                  onClick={() => setForm((current) => ({ ...current, type: item.value }))}
                >
                  <strong>{item.label}</strong>
                  <small>{item.hint}</small>
                </button>
              ))}
            </div>

            <label>
              Titre
              <input
                required
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder={`${selectedType?.label || 'Contribution'} à vérifier`}
              />
            </label>

            <label>
              Contenu et contexte
              <textarea
                required
                rows={8}
                value={form.content}
                onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                placeholder="Expliquez ce que vous transmettez, d’où cela vient, qui l’utilise, dans quel contexte..."
              />
            </label>

            <div className="contribute-fields">
              <label>
                Pays lié
                <select
                  value={form.country}
                  onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}
                >
                  <option value="">Non précisé</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>{country.nameFr}</option>
                  ))}
                </select>
              </label>
              <label>
                Langue
                <input
                  value={form.language}
                  onChange={(event) => setForm((current) => ({ ...current, language: event.target.value }))}
                  placeholder="Wolof, bambara, swahili..."
                />
              </label>
              <label>
                Période
                <input
                  value={form.period}
                  onChange={(event) => setForm((current) => ({ ...current, period: event.target.value }))}
                  placeholder="Ancien, contemporain, années 1960..."
                />
              </label>
              <label>
                Lieu
                <input
                  value={form.location}
                  onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                  placeholder="Ville, région, village, site..."
                />
              </label>
            </div>

            <div className="contribute-fields">
              <label>
                Lien source
                <input
                  type="url"
                  value={form.sourceUrl}
                  onChange={(event) => setForm((current) => ({ ...current, sourceUrl: event.target.value }))}
                  placeholder="https://..."
                />
              </label>
              <label>
                Média
                <input
                  type="url"
                  value={form.mediaUrl}
                  onChange={(event) => setForm((current) => ({ ...current, mediaUrl: event.target.value }))}
                  placeholder="Image, audio ou vidéo"
                />
              </label>
            </div>

            <label>
              Mots-clés
              <input
                value={form.tags}
                onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                placeholder="oralité, textile, famille, archive..."
              />
            </label>

            <label>
              Visibilité souhaitée
              <select
                value={form.visibility}
                onChange={(event) => setForm((current) => ({ ...current, visibility: event.target.value }))}
              >
                <option value="public">Publique après validation</option>
                <option value="private">Privée pour modération interne</option>
              </select>
            </label>

            <button className="contribute-submit" type="submit" disabled={submitting}>
              {submitting ? 'Envoi...' : isAuthenticated ? 'Envoyer pour vérification' : 'Se connecter pour envoyer'}
            </button>
          </form>
        </section>
      </main>
    </Layout>
  )
}
