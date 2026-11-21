import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { usePlatformName } from '../hooks/usePlatformName'
import api from '../services/api'
import './Login.css'

// Mot de passe oublié d'après la maquette Figma « Mot de passe oublié / Desktop 1440 »
// et « Mobile 390 ». Même squelette que la connexion (classes .mcl partagées).

export const ForgotPassword = () => {
  const platformName = usePlatformName()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  // POST /auth/forgot-password : la route serveur reste à créer. Le message de
  // confirmation est volontairement neutre (on ne révèle pas si le compte existe).
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() })
    } catch {
      // Endpoint absent ou erreur : même réponse neutre pour ne rien révéler.
    } finally {
      setLoading(false)
      setSent(true)
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

          {sent ? (
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
