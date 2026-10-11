import { useMemo, useState } from 'react'
import { usePlatformName } from '../hooks/usePlatformName'
import { useNavigate, Link, Navigate, useSearchParams } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Input } from '../components/Input/Input'
import { Button } from '../components/Button/Button'
import { useAuthStore } from '../stores/authStore'
import { useNotifications } from '../hooks/useNotifications'
import './Auth.css'

const getSafeRedirect = (value: string | null) => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard'
  if (value === '/login' || value === '/register') return '/dashboard'
  return value
}

export const Login = () => {
  const platformName = usePlatformName()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
    <Layout>
      <div className="auth-page">
        <div className="auth-card-enhanced">
          
          {/* Panneau Gauche : Motif pur + Logo + Titre centré */}
          <div className="auth-story-panel">
            <div className="auth-logo">
              <img src="/LogoFiles/Fichier%207.svg" alt={platformName} />
            </div>
            
            <div className="auth-story-content">
              <h2>Bienvenue sur {platformName}</h2>
              <p>
                Un espace où les idées prennent racine, où 
                les savoirs se partagent et où les communautés grandissent ensemble.
              </p>
              <span className="auth-tagline">
                Apprendre. Partager. Construire. Grandir.
              </span>

            </div>
          </div>

          {/* Panneau Droit (Formulaire) */}
          <div className="auth-form-panel">
            <div className="auth-header">
              <p className="auth-eyebrow">Connexion</p>
              <h1>Heureux de vous revoir</h1>
              <p className="auth-subtitle">
                Connectez-vous à votre espace <strong>{platformName}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <Input
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.com"
                  autoComplete="email"
                  variant="filled"
                  size="medium"
                  fullWidth
                />
              </div>

              <div className="auth-field auth-password-field">
                <Input
                  type="password"
                  label="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  variant="filled"
                  size="medium"
                  fullWidth
                />
              </div>

              <div className="auth-options">
                <Link to="/forgot-password" className="auth-forgot-link">
                  Mot de passe oublié ?
                </Link>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <Button
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                loading={loading}
                className="auth-button"
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </form>

            <p className="auth-link">
              Pas encore de compte ? <Link to="/register">Créer un compte</Link>
            </p>
          </div>

        </div>
      </div>
    </Layout>
  )
}