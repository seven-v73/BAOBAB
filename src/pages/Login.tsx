import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react'
import { usePlatformName } from '../hooks/usePlatformName'
import { Layout } from '../components/Layout/Layout'
import { Input } from '../components/Input/Input'
import { Button } from '../components/Button/Button'
import { useAuthStore } from '../stores/authStore'
import { useNotifications } from '../hooks/useNotifications'
import { useSettingsStore } from '../stores/settingsStore'
import './Auth.css'

const getSafeRedirect = (value: string | null) => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard'
  if (value === '/login' || value === '/register') return '/dashboard'
  return value
}

export const Login = () => {
  const platformName = usePlatformName()
  const contactEmail = useSettingsStore((state) => state.settings?.contactEmail) || 'contact@monbaobab.com'
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(() => searchParams.get('email') || '')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [useBackup, setUseBackup] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [error, setError] = useState('')

  const { isAuthenticated, login, verify2FA, cancel2FA, pending2FA, loading } = useAuthStore()
  const navigate = useNavigate()
  const { success } = useNotifications()
  const codeRef = useRef<HTMLInputElement>(null)

  const redirectTo = useMemo(() => getSafeRedirect(searchParams.get('redirect')), [searchParams])
  const expired = searchParams.get('expired') === '1'

  useEffect(() => {
    if (pending2FA) codeRef.current?.focus()
  }, [pending2FA, useBackup])

  if (isAuthenticated) return <Navigate to={redirectTo} replace />

  const done = () => {
    success(`Bienvenue sur ${platformName} !`)
    navigate(redirectTo, { replace: true })
  }

  const detectCaps = (event: KeyboardEvent<HTMLInputElement>) => setCapsLock(event.getModifierState?.('CapsLock') ?? false)

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !password) {
      setError('Renseignez votre adresse e-mail et votre mot de passe.')
      return
    }
    try {
      const result = await login(normalizedEmail, password)
      if (result === 'ok') done()
      else setPassword('') // étape 2FA : le mot de passe n'est plus nécessaire en mémoire
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleCode = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    const clean = code.replace(/\s/g, '')
    if (useBackup ? clean.length !== 8 : !/^\d{6}$/.test(clean)) {
      setError(useBackup ? 'Le code de secours comporte 8 caractères.' : 'Saisissez les 6 chiffres affichés par votre application.')
      return
    }
    try {
      await verify2FA(clean, useBackup)
      done()
    } catch (err) {
      setError((err as Error).message)
      setCode('')
    }
  }

  return (
    <Layout>
      <div className="auth-page">
        <div className="auth-card-enhanced">
          <div className="auth-story-panel">
            <div className="auth-logo">
              <img src="/LogoFiles/Fichier%207.svg" alt={platformName} />
            </div>
            <div className="auth-story-content">
              <h2>Bienvenue sur {platformName}</h2>
              <p>Un espace où les idées prennent racine, où les savoirs se partagent et où les communautés grandissent ensemble.</p>
              <span className="auth-tagline">Apprendre. Partager. Construire. Grandir.</span>
            </div>
          </div>

          <div className="auth-form-panel">
            {expired && !pending2FA && (
              <p className="auth-notice" role="status">
                Votre session a expiré. Reconnectez-vous : vous reviendrez à la page où vous étiez.
              </p>
            )}

            {!pending2FA ? (
              <>
                <div className="auth-header">
                  <p className="auth-eyebrow">Connexion</p>
                  <h1>Heureux de vous revoir</h1>
                  <p className="auth-subtitle">
                    Connectez-vous à votre espace <strong>{platformName}</strong>
                  </p>
                </div>

                <form onSubmit={handleLogin} className="auth-form" noValidate>
                  <div className="auth-field">
                    <Input
                      type="email"
                      label="Adresse e-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="vous@exemple.com"
                      autoComplete="username"
                      inputMode="email"
                      autoFocus={!email}
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
                      onKeyUp={detectCaps}
                      onKeyDown={detectCaps}
                      required
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      autoFocus={Boolean(email)}
                      variant="filled"
                      size="medium"
                      fullWidth
                    />
                    {capsLock && <p className="auth-hint">La touche Verr. Maj est activée.</p>}
                  </div>

                  <div className="auth-options">
                    {/* Pas encore de réinitialisation automatique côté API : on oriente vers l'équipe */}
                    <a href={`mailto:${contactEmail}?subject=${encodeURIComponent('Mot de passe oublié')}`} className="auth-forgot-link">
                      Mot de passe oublié ?
                    </a>
                  </div>

                  {error && (
                    <div className="auth-error" role="alert">
                      {error}
                    </div>
                  )}

                  <Button type="submit" variant="primary" size="large" fullWidth loading={loading} className="auth-button">
                    {loading ? 'Connexion…' : 'Se connecter'}
                  </Button>
                </form>

                <p className="auth-link">
                  Pas encore de compte ? <Link to={`/register${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}>Créer un compte</Link>
                </p>
              </>
            ) : (
              <>
                <div className="auth-header">
                  <p className="auth-eyebrow">
                    <ShieldCheck size={14} aria-hidden={true} /> Double authentification
                  </p>
                  <h1>{useBackup ? 'Code de secours' : 'Code de vérification'}</h1>
                  <p className="auth-subtitle">
                    {useBackup
                      ? 'Saisissez l’un des codes de secours (8 caractères) obtenus lors de l’activation.'
                      : <>Ouvrez votre application d’authentification et saisissez le code à 6 chiffres pour <strong>{pending2FA.email}</strong>.</>}
                  </p>
                </div>

                <form onSubmit={handleCode} className="auth-form" noValidate>
                  <div className="auth-field">
                    <label htmlFor="auth-code" className="sr-only">
                      {useBackup ? 'Code de secours' : 'Code à 6 chiffres'}
                    </label>
                    <input
                      ref={codeRef}
                      id="auth-code"
                      className="auth-code-input"
                      value={code}
                      onChange={(e) => setCode(useBackup ? e.target.value.toUpperCase().slice(0, 8) : e.target.value.replace(/\D/g, '').slice(0, 6))}
                      inputMode={useBackup ? 'text' : 'numeric'}
                      autoComplete="one-time-code"
                      placeholder={useBackup ? 'XXXXXXXX' : '000000'}
                      maxLength={useBackup ? 8 : 6}
                      aria-describedby="auth-code-help"
                    />
                    <p id="auth-code-help" className="auth-hint">
                      Le code change toutes les 30 secondes.
                    </p>
                  </div>

                  {error && (
                    <div className="auth-error" role="alert">
                      {error}
                    </div>
                  )}

                  <Button type="submit" variant="primary" size="large" fullWidth loading={loading} className="auth-button">
                    {loading ? 'Vérification…' : 'Valider'}
                  </Button>
                </form>

                <div className="auth-2fa-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-small"
                    onClick={() => {
                      setUseBackup((value) => !value)
                      setCode('')
                      setError('')
                    }}
                  >
                    <KeyRound size={16} aria-hidden={true} /> {useBackup ? 'Utiliser l’application' : 'Utiliser un code de secours'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-small"
                    onClick={() => {
                      cancel2FA()
                      setCode('')
                      setError('')
                    }}
                  >
                    <ArrowLeft size={16} aria-hidden={true} /> Changer de compte
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
