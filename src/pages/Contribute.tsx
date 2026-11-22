import { useEffect, useMemo, useState } from 'react'
import type { ComponentType, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Landmark, MapPin, MessageSquareQuote, Mic, PencilLine, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { Dropdown } from '../components/UX/Dropdown'
import { contributionService, countryService } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useNotifications } from '../hooks/useNotifications'
import './Contribute.css'

// Contribuer d'après la maquette Figma « Contribuer / Desktop 1440 » et « Mobile 390 ».
// L'envoi passe par contributionService : les champs de la maquette composent le contenu.

type IconType = ComponentType<{ size?: number; strokeWidth?: number }>

interface TypeCarte {
  value: string
  label: string
  hint: string
  icon: LucideIcon
}

/* Les six cartes de la maquette, reliées aux types de la base */
const TYPES: TypeCarte[] = [
  { value: 'family-memory', label: 'Récit ou mémoire', hint: 'Un récit transmis dans votre famille ou votre communauté.', icon: BookOpen },
  { value: 'proverb', label: 'Proverbe', hint: 'Le dicton, sa langue, son sens et son pays.', icon: MessageSquareQuote },
  { value: 'oral-tradition', label: 'Tradition orale', hint: 'Conte, chant ou formule transmis à l’oral.', icon: Mic },
  { value: 'source', label: 'Source', hint: 'Livre, archive, musée ou lien fiable.', icon: Landmark },
  { value: 'place', label: 'Lieu ou photo', hint: 'Un site à situer, une photo avec son contexte.', icon: MapPin },
  { value: 'correction', label: 'Correction', hint: 'Signaler une erreur ou préciser un point.', icon: PencilLine },
]

const ORIGINES = [
  { value: 'famille', label: 'Transmis dans ma famille' },
  { value: 'livre', label: 'Livre ou archive' },
  { value: 'lien', label: 'Lien web' },
  { value: 'autre', label: 'Autre' },
]

const LANGUES = ['Français', 'Arabe', 'Bambara', 'Dioula', 'Mooré', 'Peul', 'Wolof', 'Swahili', 'Autre']

const ETAPES = [
  { id: 'mcf-type', label: 'Type' },
  { id: 'mcf-contenu', label: 'Contenu' },
  { id: 'mcf-origine', label: 'Origine' },
  { id: 'mcf-envoi', label: 'Envoi' },
]

const CHARTES = [
  'Citez votre source, ou dites d’où vient ce que vous transmettez.',
  'Respectez les personnes et les nuances locales.',
  'Évitez les clichés et les affirmations invérifiables.',
  'Chaque contribution est relue avant publication.',
]

const ENSUITE = [
  { titre: 'Envoi', texte: 'Votre proposition entre dans la file de vérification.' },
  { titre: 'Relecture', texte: 'L’équipe vérifie les sources et le contexte avant tout.' },
  { titre: 'Publication', texte: 'La contribution rejoint sa page, signée de votre pseudo.' },
]

export const Contribute = () => {
  const { isAuthenticated } = useAuthStore()
  const { success, error } = useNotifications()
  const navigate = useNavigate()
  const [countries, setCountries] = useState<Array<{ id: string; nameFr: string }>>([])
  const [submitting, setSubmitting] = useState(false)
  const [etape, setEtape] = useState('mcf-type')
  const [form, setForm] = useState({ type: 'proverb', content: '', country: '', language: '' })
  const [traduction, setTraduction] = useState('')
  const [origine, setOrigine] = useState('famille')
  const [precisement, setPrecisement] = useState('')

  useEffect(() => {
    countryService
      .getAll()
      .then((response) => {
        const items = response.data.countries || response.data || []
        setCountries(Array.isArray(items) ? items : [])
      })
      .catch(() => setCountries([]))
  }, [])

  // L'étape active suit la section visible à l'écran
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setEtape(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -55% 0px' },
    )
    ETAPES.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })
    return () => observer.disconnect()
  }, [])

  const paysOptions = useMemo(() => countries.map((country) => country.nameFr).sort(), [countries])
  const typeChoisi = TYPES.find((type) => type.value === form.type)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent('/contribute')}`)
      return
    }

    // Compose le contenu envoyé à la base à partir des champs de la maquette
    const pays = paysOptions.includes(form.country) ? form.country : ''
    const blocs = [
      form.content.trim(),
      traduction.trim() && `Traduction et sens : ${traduction.trim()}`,
      `Origine : ${ORIGINES.find((option) => option.value === origine)?.label}`,
      precisement.trim() && `Précisions : ${precisement.trim()}`,
    ].filter(Boolean)
    const countryId = countries.find((country) => country.nameFr === pays)?.id ?? ''

    try {
      setSubmitting(true)
      await contributionService.create({
        type: form.type,
        title: `${typeChoisi?.label ?? 'Contribution'} · ${pays || 'pays à préciser'}`,
        content: blocs.join('\n\n'),
        country: countryId,
        language: form.language,
        sourceUrl: origine === 'lien' && precisement.trim() ? precisement.trim() : '',
        visibility: 'public',
      })
      success('Contribution envoyée pour vérification')
      setForm({ type: form.type, content: '', country: '', language: '' })
      setTraduction('')
      setPrecisement('')
    } catch (submitError) {
      console.error('Erreur contribution:', submitError)
      error('Impossible d’envoyer la contribution')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout fullWidth>
      <div className="mcf">
        <header className="mcf-intro">
          <h1>Faites vivre la mémoire, à votre tour</h1>
          <p>
            Un proverbe de grand-mère, une source oubliée, une précision : chaque contribution est vérifiée par
            l’équipe avant de rejoindre sa page.
          </p>
        </header>

        <div className="mcf-body">
          <nav className="mcf-steps" aria-label="Étapes de la contribution">
            {ETAPES.map((step, index) => (
              <a key={step.id} href={`#${step.id}`} className={etape === step.id ? 'is-active' : undefined}>
                <span className="mcf-step-num">{index + 1}</span>
                {step.label}
              </a>
            ))}
          </nav>

          <form className="mcf-fields" onSubmit={handleSubmit}>
            <section id="mcf-type" className="mcf-groupe">
              <h2>De quoi voulez-vous parler ?</h2>
              <div className="mcf-types">
                {TYPES.map((type) => {
                  const actif = form.type === type.value
                  const Icone = type.icon as IconType
                  return (
                    <button
                      type="button"
                      key={type.value}
                      className={actif ? 'is-active' : undefined}
                      aria-pressed={actif}
                      onClick={() => setForm((current) => ({ ...current, type: type.value }))}
                    >
                      <span className="mcf-type-haut">
                        <Icone size={22} strokeWidth={1.8} aria-hidden="true" />
                        {actif && (
                          <span className="mcf-coche" aria-hidden="true">
                            <svg viewBox="0 0 14 14" width="14" height="14">
                              <path d="M3 7.5 6 10.5 11 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                          </span>
                        )}
                      </span>
                      <strong>{type.label}</strong>
                      <small>{type.hint}</small>
                    </button>
                  )
                })}
              </div>
            </section>

            <section id="mcf-contenu" className="mcf-groupe">
              <h2>Le contenu</h2>
              <div className="mcf-champ">
                <label htmlFor="mcf-texte">Texte de la contribution</label>
                <textarea
                  id="mcf-texte"
                  required
                  value={form.content}
                  onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                  placeholder="« Le proverbe, le récit ou la précision à transmettre… »"
                />
              </div>
              <div className="mcf-champ">
                <label htmlFor="mcf-traduction">Traduction et sens</label>
                <textarea
                  id="mcf-traduction"
                  value={traduction}
                  onChange={(event) => setTraduction(event.target.value)}
                  placeholder="Ce que ça veut dire, dans quel contexte on le dit…"
                />
              </div>
              <div className="mcf-ligne">
                <div className="mcf-champ">
                  <span className="mcf-label" id="mcf-pays-label">
                    Pays
                  </span>
                  <Dropdown
                    label="Pays"
                    allLabel="Choisir un pays"
                    value={form.country}
                    options={paysOptions}
                    onChange={(value) => setForm((current) => ({ ...current, country: value }))}
                  />
                </div>
                <div className="mcf-champ">
                  <span className="mcf-label" id="mcf-langue-label">
                    Langue
                  </span>
                  <Dropdown
                    label="Langue"
                    allLabel="Choisir une langue"
                    value={form.language}
                    options={LANGUES}
                    onChange={(value) => setForm((current) => ({ ...current, language: value }))}
                  />
                </div>
              </div>
            </section>

            <section id="mcf-origine" className="mcf-groupe">
              <h2>D’où vient ce savoir ?</h2>
              <div className="mcf-options" role="radiogroup" aria-label="Origine">
                {ORIGINES.map((option) => {
                  const actif = origine === option.value
                  return (
                    <button
                      type="button"
                      key={option.value}
                      role="radio"
                      aria-checked={actif}
                      className={actif ? 'is-active' : undefined}
                      onClick={() => setOrigine(option.value)}
                    >
                      {actif && (
                        <span className="mcf-coche" aria-hidden="true">
                          <svg viewBox="0 0 14 14" width="14" height="14">
                            <path d="M3 7.5 6 10.5 11 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          </svg>
                        </span>
                      )}
                      {option.label}
                    </button>
                  )
                })}
              </div>
              <div className="mcf-champ">
                <label htmlFor="mcf-precisez">Précisez</label>
                <textarea
                  id="mcf-precisez"
                  value={precisement}
                  onChange={(event) => setPrecisement(event.target.value)}
                  placeholder="Le nom du livre, le lien web, la personne qui vous l’a transmis…"
                />
                <p className="mcf-aide">Plus vous en dites sur l’origine, plus la vérification est rapide.</p>
              </div>
            </section>

            <section id="mcf-envoi" className="mcf-envoi">
              <button type="submit" className="mcf-btn" disabled={submitting}>
                {submitting ? 'Envoi…' : isAuthenticated ? 'Envoyer ma proposition' : 'Se connecter pour envoyer'}
              </button>
              <p className="mcf-note">
                Votre proposition est relue par l’équipe avant publication.
              </p>
            </section>
          </form>

          <aside className="mcf-side">
            <section className="mcf-ensuite mcf-ecrire">
              <h2>Un texte plus long ?</h2>
              <p>
                <span>
                  Article documenté ou témoignage : l’éditeur vous guide (sources, aperçu, relecture par l’équipe avant publication dans Récits).
                </span>
              </p>
              <Link to="/blog/ecrire" className="mcf-ecrire-lien">
                Écrire un article <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
              </Link>
            </section>
            <section className="mcf-charte">
              <h2>La charte courte</h2>
              {CHARTES.map((regle) => (
                <p key={regle}>{regle}</p>
              ))}
            </section>
            <section className="mcf-ensuite">
              <h2>Et ensuite ?</h2>
              {ENSUITE.map((step, index) => (
                <p key={step.titre}>
                  <span className="mcf-num">{index + 1}</span>
                  <span>
                    <strong>{step.titre}</strong>
                    {step.texte}
                  </span>
                </p>
              ))}
            </section>
          </aside>
        </div>
      </div>
    </Layout>
  )
}
