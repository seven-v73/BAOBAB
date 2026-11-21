import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { usePlatformName } from '../hooks/usePlatformName'
import api from '../services/api'
import { useSettingsStore } from '../stores/settingsStore'
import './Login.css'

// Mot de passe oublié d'après la maquette Figma « Mot de passe oublié / Desktop 1440 »
// et « Mobile 390 ». Même squelette que la connexion (classes .mcl partagées).

export const ForgotPassword = () => {
  const platformName = usePlatformName()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  // Le service d'envoi n'est pas encore en place côté serveur : on oriente vers le contact plutôt
  // que d'annoncer un e-mail qui ne partira jamais.
  const [unavailable, setUnavailable] = useState(false)
  const contactEmail = useSettingsStore((state) => state.settings?.contactEmail) || 'contact@monbaobab.com'

  // POST /auth/forgot-password : la route serveur reste à créer. Le message de
  // confirmation est volontairement neutre (on ne révèle pas si le compte existe).
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() })
      setSent(true)
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status
      // Route absente (404/501) : service pas encore disponible. Autre erreur : réponse neutre.
      if (status === 404 || status === 501) setUnavailable(true)
      else setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mcl">
      <main className="mcl-formulaire">
        <header className="mcl-haut">
          <Link to="/" className="mcl-logo" aria-label={`${platformName}, retour à l'accueil`}>
            <img src="/Logo/Fichier%203.svg" alt="" width="144" height="48" />
          </Link>
          <Link to="/" className="mcl-retour">
            <ArrowLeft size={16} strokeWidth={1.6} aria-hidden="true" /> Retour au site
          </Link>
        </header>

        <div className="mcl-contenu">
          <div className="mcl-titre">
            <h1>Mot de passe oublié</h1>
            <p className="mcl-desc">
              Indiquez votre e-mail : nous vous envoyons un lien pour choisir un nouveau mot de passe.
            </p>
          </div>

          {unavailable ? (
            <div className="mcl-succes">
              <p>
                La réinitialisation en ligne arrive bientôt. En attendant, écrivez-nous à{' '}
                <a href={`mailto:${contactEmail}`}>{contactEmail}</a> depuis l’adresse de votre compte : nous vous
                aidons à retrouver l’accès.
              </p>
              <Link to="/login" className="mcl-lien-retour">
                <ArrowLeft size={16} strokeWidth={1.6} aria-hidden="true" /> Retour à la connexion
              </Link>
            </div>
          ) : sent ? (
            <div className="mcl-succes">
              <p>
                C’est envoyé ! Si un compte existe pour cette adresse, tu recevras un lien pour choisir un nouveau
                mot de passe sous quelques minutes.
              </p>
              <Link to="/login" className="mcl-lien-retour">
                <ArrowLeft size={16} strokeWidth={1.6} aria-hidden="true" /> Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <form className="mcl-champs" onSubmit={handleSubmit}>
                <div className="mcl-champ">
                  <label htmlFor="mcl-email-oublie">E-mail</label>
                  <input
                    id="mcl-email-oublie"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="prenom@exemple.com"
                  />
                </div>
                <button className="mcl-btn" type="submit" disabled={loading}>
                  {loading ? 'Envoi…' : 'Recevoir le lien'} <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" />
                </button>
              </form>
              <Link to="/login" className="mcl-lien-retour">
                <ArrowLeft size={16} strokeWidth={1.6} aria-hidden="true" /> Retour à la connexion
              </Link>
            </>
          )}
        </div>

        <footer className="mcl-pied">© 2026 {platformName} · Mentions légales · Confidentialité</footer>
      </main>

      <aside className="mcl-photo">
        <p className="mcl-eyebrow">Faso Dan Fani, Burkina Faso</p>
        <h2>Un compte pour garder le fil de vos lectures.</h2>
        <ul className="mcl-avantages">
          <li>Vos récits enregistrés</li>
          <li>Vos contributions suivies</li>
          <li>Gratuit</li>
        </ul>
      </aside>
    </div>
  )
}
