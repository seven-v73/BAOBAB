import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Input } from '../components/Input/Input'
import { Button } from '../components/Button/Button'
import { useAuthStore } from '../stores/authStore'
import { userService } from '../services/api'
import { useNotifications } from '../hooks/useNotifications'
import { usePlatformName } from '../hooks/usePlatformName'
import { UserPlus, Shield, User, Mail, Lock, UserCircle } from 'lucide-react'
import './Auth.css'

export const Register = () => {
  const platformName = usePlatformName()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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

  useEffect(() => {
    // Si admin mode mais pas connecté, rediriger vers login
    if (searchParams.get('admin') === 'true' && !isAuthenticated) {
      navigate('/login?redirect=/register?admin=true')
    }
  }, [isAuthenticated, searchParams, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!name.trim() || !email.trim() || !password) {
      setError('Tous les champs sont requis')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
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
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        })
        success(`Compte ${role === 'admin' ? 'administrateur' : 'utilisateur'} créé avec succès !`)
        // Réinitialiser le formulaire
        setName('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setRole('user')
      } else {
        // Inscription normale
        await register(email, password, name)
        success(`Inscription réussie ! Bienvenue sur ${platformName} !`)
        navigate('/dashboard')
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erreur lors de l\'inscription'
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
              {isAdminMode ? <Shield size={32} /> : <UserPlus size={32} />}
            </div>
            <h1>{isAdminMode ? 'Créer un Compte' : 'Inscription'}</h1>
            <p className="auth-subtitle">
              {isAdminMode 
                ? 'Créez un nouveau compte utilisateur ou administrateur'
                : `Rejoignez la communauté ${platformName} et découvrez l'Afrique`
              }
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <UserCircle size={20} className="input-icon" />
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

            {isAdminMode && (
              <div className="input-group">
                <Shield size={20} className="input-icon" />
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
                      <User size={20} />
                      <span>Utilisateur</span>
                      <p>Accès standard : Blog, Boutique, Panier</p>
                      <div className="role-permissions">
                        <span>✓ Lecture</span>
                        <span>✓ Achat</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`role-option ${role === 'admin' ? 'active' : ''}`}
                      onClick={() => setRole('admin')}
                    >
                      <Shield size={20} />
                      <span>Administrateur</span>
                      <p>Accès complet : Gestion du contenu</p>
                      <div className="role-permissions">
                        <span>✓ Tout</span>
                        <span>✓ CRUD</span>
                      </div>
                    </button>
                  </div>
                  <p className="role-hint">
                    ⚠️ Seuls les administrateurs peuvent créer des comptes avec des rôles spécifiques
                  </p>
                </div>
              </div>
            )}
            
            <div className="input-group">
              <Lock size={20} className="input-icon" />
              <Input
                type="password"
                label="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div className="input-group">
              <Lock size={20} className="input-icon" />
              <Input
                type="password"
                label="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
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
              Déjà un compte ? <Link to="/login">Connectez-vous</Link>
            </p>
          )}

          {isAdminMode && (
            <div className="auth-admin-actions">
              <Link to="/admin" className="back-to-admin">
                ← Retour au dashboard admin
              </Link>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}
