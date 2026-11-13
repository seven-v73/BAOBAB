import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { usePlatformName } from '../../hooks/usePlatformName'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import './Auth.css'

export const Login = () => {
  const platformName = usePlatformName()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError('Email ou mot de passe incorrect. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <Card className="auth-card">
        {/* En-tête avec icône */}
        <div className="auth-header">
          <div className="auth-icon">
            <span className="icon-login" aria-hidden="true" />
          </div>
          <h1>Entrer</h1>
          <p className="auth-subtitle">
            Retrouvez votre espace <strong>{platformName}</strong> et reprenez le fil.
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="votre@email.com"
            autoComplete="email"
          />

          <Input
            type="password"
            label="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            autoComplete="current-password"
          />

          {/* Lien mot de passe oublié */}
          <div className="auth-forgot">
            <Link to="/auth/forgot-password">Mot de passe oublié ?</Link>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <Button 
            type="submit" 
            variant="primary" 
            size="large" 
            disabled={loading}
            className="auth-submit-btn"
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Ouverture...
              </>
            ) : (
              'Entrer'
            )}
          </Button>
        </form>

        {/* Lien d'inscription */}
        <p className="auth-link">
          Pas encore membre ? <Link to="/auth/register">Rejoindre</Link>
        </p>

        {/* Séparateur décoratif */}
        <div className="auth-divider">
          <span>ou</span>
        </div>

        {/* Boutons sociaux (optionnel) */}
        <div className="auth-social">
          <button type="button" className="social-btn google">
            <span className="icon-google" aria-hidden="true" />
            Continuer avec Google
          </button>
        </div>
      </Card>
    </div>
  )
}