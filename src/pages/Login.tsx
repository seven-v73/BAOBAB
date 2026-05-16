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
  const [showPassword, setShowPassword] = useState(false)
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
        <Card className="auth-card-enhanced">
          <div className="auth-story-panel" aria-hidden="true">
            <span className="auth-kicker">MonBaobab</span>
            <h2>Votre espace culturel, vos repères, vos favoris.</h2>
            <p>Connectez-vous pour retrouver vos contenus, vos commandes et vos communautés sans perdre le fil.</p>
            <div className="auth-proof-list">
              <span>Collections sauvegardées</span>
              <span>Parcours personnel</span>
              <span>Communautés privées</span>
            </div>
          </div>

          <div className="auth-header">
            <p className="auth-eyebrow">Accès membre</p>
            <h1>Bon retour</h1>
            <p className="auth-subtitle">
              Entrez dans votre espace {platformName}.
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
              />
            </div>
            
            <div className="auth-field auth-password-field">
              <Input
                type={showPassword ? 'text' : 'password'}
                label="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-visibility-toggle"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            
            {error && <div className="auth-error">{error}</div>}
            
            <Button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
          
          <p className="auth-link">
            Nouveau sur {platformName} ? <Link to="/register">Créer un compte</Link>
          </p>
        </Card>
      </div>
    </Layout>
  )
}
