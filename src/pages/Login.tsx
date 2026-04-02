import { useState } from 'react'
import { usePlatformName } from '../hooks/usePlatformName'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Input } from '../components/Input/Input'
import { Button } from '../components/Button/Button'
import { useAuthStore } from '../stores/authStore'
import { useNotifications } from '../hooks/useNotifications'
import { LogIn, Mail, Lock } from 'lucide-react'
import './Auth.css'

export const Login = () => {
  const platformName = usePlatformName()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const { success, error: showError } = useNotifications()

  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      success(`Connexion réussie ! Bienvenue sur ${platformName} !`)
      navigate(redirectTo)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erreur de connexion. Vérifiez vos identifiants.'
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
          <div className="auth-header">
            <div className="auth-icon-wrapper">
              <LogIn size={32} />
            </div>
            <h1>Connexion</h1>
            <p className="auth-subtitle">
              Accédez à votre espace {platformName} et explorez l'Afrique
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <Mail size={20} className="input-icon" />
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
            
            <div className="input-group">
              <Lock size={20} className="input-icon" />
              <Input
                type="password"
                label="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            
            {error && <div className="auth-error">{error}</div>}
            
            <Button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
          
          <p className="auth-link">
            Pas encore de compte ? <Link to="/register">Inscrivez-vous</Link>
          </p>
        </Card>
      </div>
    </Layout>
  )
}
