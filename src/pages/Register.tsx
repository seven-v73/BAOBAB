import { useMemo, useState, useEffect } from 'react'
import { useNavigate, Link, Navigate, useSearchParams } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Input } from '../components/Input/Input'
import { Button } from '../components/Button/Button'
import { useAuthStore } from '../stores/authStore'
import { userService } from '../services/api'
import { useNotifications } from '../hooks/useNotifications'
import { usePlatformName } from '../hooks/usePlatformName'
import './Auth.css'

export const Register = () => {
  const platformName = usePlatformName()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<'user' | 'admin'>('user')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  
  const { user: currentUser, isAuthenticated } = useAuthStore()
  const register = useAuthStore((state) => state.register)
  const navigate = useNavigate()
  const { success, error: showError } = useNotifications()

  // Vérifier si c'est un admin qui crée un compte
  const isAdminCreating = isAuthenticated && currentUser?.role === 'admin'
  const isAdminMode = searchParams.get('admin') === 'true' || isAdminCreating
  const hasMinLength = password.length >= 12
  const hasUppercase = /[A-ZÀ-Ý]/.test(password)
  const hasLowercase = /[a-zà-ÿ]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{}|;:',.<>?]/.test(password)
  const passwordScore = useMemo(() => {
    let score = 0
    if (password.length >= 12) score += 1
    if (/[A-ZÀ-Ý]/.test(password)) score += 1
    if (/[a-zà-ÿ]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[!@#$%^&*()_+\-=[\]{}|;:',.<>?]/.test(password)) score += 1
    return score
  }, [password])

  const passwordLabel = ['Trop court', 'À renforcer', 'Correct', 'Solide', 'Très solide'][Math.max(0, passwordScore - 1)] || 'Trop court'

  useEffect(() => {
    // Si admin mode mais pas connecté, rediriger vers login
    if (searchParams.get('admin') === 'true' && !isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent('/register?admin=true')}`)
    }
  }, [isAuthenticated, searchParams, navigate])

  if (isAuthenticated && !isAdminMode) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const trimmedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()

    // Validation
    if (!trimmedName || !normalizedEmail || !password) {
      setError('Renseignez votre nom, votre email et votre mot de passe.')
      return
    }

    if (password.length < 12) {
      setError('Choisissez un mot de passe d’au moins 12 caractères.')
      return
    }

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      setError('Ajoutez au moins une majuscule, une minuscule, un chiffre et un caractère spécial.')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)

    try {
      if (isAdminMode && isAuthenticated) {
        // Admin crée un compte via l'API users
        await userService.create({
          name: trimmedName,
          email: normalizedEmail,
          password,
          role,
        })
        success(`Compte ${role === 'admin' ? 'administrateur' : 'utilisateur'} créé.`)
        // Réinitialiser le formulaire
        setName('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setRole('user')
      } else {
        // Inscription normale
        await register(normalizedEmail, password, trimmedName)
        success(`Bienvenue sur ${platformName}.`)
        navigate('/dashboard', { replace: true })
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
    <Layout>
      <div className="auth-page">
        <Card className="auth-card-enhanced">
          <div className="auth-story-panel" aria-hidden="true">
            <span className="auth-kicker">MonBaobab</span>
            <h2>{isAdminMode ? 'Créer un accès clair, sans détour.' : 'Un compte pour garder le fil.'}</h2>
            <p>
              {isAdminMode
                ? 'Choisissez le bon rôle et créez un profil prêt à utiliser.'
                : 'Sauvegardez vos lectures, retrouvez vos pays favoris et participez aux communautés.'}
            </p>
            <div className="auth-proof-list">
              <span>Favoris</span>
              <span>Commandes</span>
              <span>Communautés</span>
            </div>
          </div>

          <div className="auth-header">
            <p className="auth-eyebrow">{isAdminMode ? 'Administration' : 'Nouveau compte'}</p>
            <h1>{isAdminMode ? 'Créer un compte' : 'Rejoindre MonBaobab'}</h1>
            <p className="auth-subtitle">
              {isAdminMode 
                ? 'Ajoutez un utilisateur avec le bon niveau d’accès.'
                : `Préparez votre espace personnel sur ${platformName}.`
              }
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <Input
                type="text"
                label="Nom complet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Votre nom"
                autoComplete="name"
              />
            </div>
            
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

            {isAdminMode && (
              <div className="auth-field">
                <div className="form-group">
                  <label className="input-label">
                    Rôle du compte
                    <span className="role-badge">Admin uniquement</span>
                  </label>
                  <div className="role-selector">
                    <button
                      type="button"
                      className={`role-option ${role === 'user' ? 'active' : ''}`}
                      onClick={() => setRole('user')}
                    >
                      <span>Utilisateur</span>
                      <p>Lecture, achats et participation aux espaces communautaires.</p>
                      <div className="role-permissions">
                        <span>Lecture</span>
                        <span>Achat</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`role-option ${role === 'admin' ? 'active' : ''}`}
                      onClick={() => setRole('admin')}
                    >
                      <span>Administrateur</span>
                      <p>Gestion du contenu, des produits et des paramètres.</p>
                      <div className="role-permissions">
                        <span>Gestion</span>
                        <span>Paramètres</span>
                      </div>
                    </button>
                  </div>
                  <p className="role-hint">
                    Seuls les administrateurs peuvent créer des comptes avec des rôles spécifiques.
                  </p>
                </div>
              </div>
            )}
            
            <div className="auth-field auth-password-field">
              <Input
                type={showPassword ? 'text' : 'password'}
                label="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-visibility-toggle"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
              {password && (
                <div className="password-meter" data-score={passwordScore}>
                  <span />
                  <small>{passwordLabel}</small>
                </div>
              )}
              <div className="password-rules" aria-live="polite">
                <span className={hasMinLength ? 'valid' : ''}>12 caractères</span>
                <span className={hasUppercase ? 'valid' : ''}>Majuscule</span>
                <span className={hasLowercase ? 'valid' : ''}>Minuscule</span>
                <span className={hasNumber ? 'valid' : ''}>Chiffre</span>
                <span className={hasSpecialChar ? 'valid' : ''}>Caractère spécial</span>
              </div>
            </div>

            <div className="auth-field">
              <Input
                type={showPassword ? 'text' : 'password'}
                label="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={12}
                maxLength={128}
              />
            </div>
            
            {error && <div className="auth-error">{error}</div>}
            
            <Button type="submit" disabled={loading} className="auth-button">
              {loading 
                ? (isAdminMode ? 'Création...' : 'Inscription...') 
                : (isAdminMode ? 'Créer le compte' : 'S\'inscrire')
              }
            </Button>
          </form>
          
          {!isAdminMode && (
            <p className="auth-link">
              Déjà membre ? <Link to="/login">Se connecter</Link>
            </p>
          )}

          {isAdminMode && (
            <div className="auth-admin-actions">
              <Link to="/admin" className="back-to-admin">
                Retour au dashboard admin
              </Link>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}
