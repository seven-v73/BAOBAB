import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { usePlatformName } from '../hooks/usePlatformName'
import { useAuthStore } from '../stores/authStore'
import { useNotifications } from '../hooks/useNotifications'
import './Login.css'

// Connexion d'après la maquette Figma « Connexion / Desktop 1440 » et « Mobile 390 ».
// Page autonome : mini en-tête logo + retour, photo légendée à droite.

const getSafeRedirect = (value: string | null) => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard'
  if (value === '/login' || value === '/register') return '/dashboard'
  return value
}

export const Login = () => {
  const platformName = usePlatformName()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()

  const { isAuthenticated, login } = useAuthStore()
  const navigate = useNavigate()
  const { success, error: showError } = useNotifications()

  const redirectTo = useMemo(() => getSafeRedirect(searchParams.get('redirect')), [searchParams])

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      setError('Renseignez votre email et votre mot de passe.')
      return
    }

    setLoading(true)

    try {
      await login(normalizedEmail, password)
      success(`Bienvenue sur ${platformName}.`)
      navigate(redirectTo, { replace: true })
    } catch (err: any) {
      const errorMessage = err.message || 'Connexion impossible. Vérifiez vos identifiants.'
      setError(errorMessage)
      showError(errorMessage)
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
            <h1>Heureux de vous revoir</h1>
            <p>
              Pas encore de compte ? <Link to="/register">Créer un compte</Link>
            </p>
          </div>

          <form className="mcl-champs" onSubmit={handleSubmit}>
            {error && (
              <p className="mcl-erreur" role="alert">
                {error}
              </p>
            )}
            <div className="mcl-champ">
              <label htmlFor="mcl-email">E-mail</label>
              <input
                id="mcl-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="prenom@exemple.com"
              />
            </div>
            <div className="mcl-champ">
              <div className="mcl-labels">
                <label htmlFor="mcl-password">Mot de passe</label>
                <Link to="/mot-de-passe-oublie" className="mcl-oublie">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="mcl-zone">
                <input
                  id="mcl-password"
                  type={passwordVisible ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="mcl-afficher"
                  aria-label={passwordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  aria-pressed={passwordVisible}
                  onClick={() => setPasswordVisible((visible) => !visible)}
                >
                  {passwordVisible ? <EyeOff size={20} strokeWidth={1.6} /> : <Eye size={20} strokeWidth={1.6} />}
                </button>
              </div>
            </div>
            <button className="mcl-btn" type="submit" disabled={loading}>
              {loading ? 'Connexion…' : 'Se connecter'} <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <p className="mcl-note">
              Votre compte sert à garder vos lectures et à suivre vos contributions. Rien n’est partagé sans votre
              accord.
            </p>
          </form>
        </div>

        <footer className="mcl-pied">
          © 2026 {platformName} · Mentions légales · Confidentialité
        </footer>
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
