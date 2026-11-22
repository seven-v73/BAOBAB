import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { usePlatformName } from '../hooks/usePlatformName'
import { useAuthStore } from '../stores/authStore'
import { useNotifications } from '../hooks/useNotifications'
import { userService } from '../services/api'
import './Login.css'

// Inscription d'après la maquette Figma « Inscription / Desktop 1440 » et « Mobile 390 ».
// Même squelette que la connexion (classes .mcl partagées) ; photo Tiébélé.

const getSafeRedirect = (value: string | null) => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard'
  if (value === '/login' || value === '/register') return '/dashboard'
  return value
}

export const Register = () => {
  const platformName = usePlatformName()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [role, setRole] = useState<'user' | 'admin'>('user')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()

  const { user: currentUser, isAuthenticated, register } = useAuthStore()
  const navigate = useNavigate()
  const { success, error: showError } = useNotifications()

  const redirectTo = useMemo(() => getSafeRedirect(searchParams.get('redirect')), [searchParams])
  const isAdminMode = isAuthenticated && currentUser?.role === 'admin'

  if (isAuthenticated && !isAdminMode) {
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    const trimmedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()

    if (!trimmedName || !normalizedEmail || !password) {
      setError('Renseignez votre nom, votre email et votre mot de passe.')
      return
    }

    if (password.length < 12) {
      setError('Choisissez un mot de passe d’au moins 12 caractères.')
      return
    }

    if (!/[A-ZÀ-Ý]/.test(password) || !/[a-zà-ÿ]/.test(password) || !/\d/.test(password)) {
      setError('Ajoutez au moins une majuscule, une minuscule et un chiffre.')
      return
    }

    setLoading(true)

    try {
      if (isAdminMode) {
        await userService.create({ name: trimmedName, email: normalizedEmail, password, role })
        success(`Compte ${role === 'admin' ? 'administrateur' : 'utilisateur'} créé.`)
        setName('')
        setEmail('')
        setPassword('')
      } else {
        await register(normalizedEmail, password, trimmedName)
        success(`Bienvenue sur ${platformName}.`)
        // Retour à la page d'origine (ex. « Écrire un texte ») plutôt qu'au tableau de bord
        navigate(redirectTo, { replace: true })
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Inscription impossible pour le moment.'
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
            <h1>Rejoindre MonBaobab</h1>
            <p>
              Déjà membre ? <Link to="/login">Se connecter</Link>
            </p>
          </div>

          <form className="mcl-champs" onSubmit={handleSubmit}>
            {error && (
              <p className="mcl-erreur" role="alert">
                {error}
              </p>
            )}
            <div className="mcl-champ">
              <label htmlFor="mcl-name">Nom complet</label>
              <input
                id="mcl-name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Awa Traoré"
              />
            </div>
            <div className="mcl-champ">
              <label htmlFor="mcl-register-email">E-mail</label>
              <input
                id="mcl-register-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="prenom@exemple.com"
              />
            </div>
            <div className="mcl-champ">
              <label htmlFor="mcl-register-password">Mot de passe</label>
              <div className="mcl-zone">
                <input
                  id="mcl-register-password"
                  type={passwordVisible ? 'text' : 'password'}
                  autoComplete="new-password"
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
              <p className="mcl-note">12 caractères minimum, dont une majuscule, une minuscule et un chiffre.</p>
            </div>
            {isAdminMode && (
              <div className="mcl-champ">
                <label htmlFor="mcl-role">Rôle du compte</label>
                <div className="mcl-zone">
                  <select
                    id="mcl-role"
                    value={role}
                    onChange={(event) => setRole(event.target.value as 'user' | 'admin')}
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>
            )}
            <button className="mcl-btn" type="submit" disabled={loading}>
              {loading ? 'Création…' : 'Créer mon compte'} <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <p className="mcl-note">
              En créant un compte, vous acceptez les conditions d’utilisation et la politique de confidentialité.
            </p>
          </form>
        </div>

        <footer className="mcl-pied">© 2026 {platformName} · Mentions légales · Confidentialité</footer>
      </main>

      <aside className="mcl-photo mcl-photo--tiebele">
        <p className="mcl-eyebrow">Tiébélé, Burkina Faso</p>
        <h2>Enregistrez, suivez, partagez la mémoire du continent.</h2>
        <ul className="mcl-avantages">
          <li>Vos récits enregistrés</li>
          <li>Vos contributions suivies</li>
          <li>Gratuit</li>
        </ul>
        <p className="mcl-credit">Photo : Alexander Leisser, CC BY-SA 4.0, Wikimedia Commons</p>
      </aside>
    </div>
  )
}
