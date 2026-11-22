import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react'
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
  const [code, setCode] = useState('')
  const [useBackup, setUseBackup] = useState(false)
  const [searchParams] = useSearchParams()

  const { isAuthenticated, login, verify2FA, cancel2FA, pending2FA } = useAuthStore()
  const navigate = useNavigate()
  const { success, error: showError } = useNotifications()
  const codeRef = useRef<HTMLInputElement>(null)

  const redirectTo = useMemo(() => getSafeRedirect(searchParams.get('redirect')), [searchParams])
  const expired = searchParams.get('expired') === '1'

  useEffect(() => {
    if (pending2FA) codeRef.current?.focus()
  }, [pending2FA, useBackup])

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  const done = () => {
    success(`Bienvenue sur ${platformName}.`)
    navigate(redirectTo, { replace: true })
  }

  // Deuxième étape quand la double authentification est activée sur le compte
  const handleCode = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    const clean = code.replace(/\s/g, '')
    if (useBackup ? clean.length !== 8 : !/^\d{6}$/.test(clean)) {
      setError(useBackup ? 'Le code de secours comporte 8 caractères.' : 'Saisissez les 6 chiffres affichés par votre application.')
      return
    }
    setLoading(true)
    try {
      await verify2FA(clean, useBackup)
      done()
    } catch (err) {
      setError((err as Error).message)
      setCode('')
    } finally {
      setLoading(false)
    }
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
      const result = await login(normalizedEmail, password)
      if (result === 'ok') done()
      else setPassword('') // étape 2FA : le mot de passe n'est plus nécessaire en mémoire
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
          {pending2FA ? (
            <>
          <div className="mcl-titre">
            <h1>
              <ShieldCheck size={28} strokeWidth={1.6} aria-hidden="true" /> {useBackup ? 'Code de secours' : 'Code de vérification'}
            </h1>
            <p>
              {useBackup
                ? 'Saisissez l’un des codes de secours (8 caractères) obtenus lors de l’activation.'
                : <>Saisissez le code à 6 chiffres de votre application d’authentification pour <strong>{pending2FA?.email}</strong>.</>}
            </p>
          </div>

          <form className="mcl-champs" onSubmit={handleCode} noValidate>
            {error && (
              <p className="mcl-erreur" role="alert">
                {error}
              </p>
            )}
            <div className="mcl-champ">
              <label htmlFor="mcl-code">{useBackup ? 'Code de secours' : 'Code à 6 chiffres'}</label>
              <input
                ref={codeRef}
                id="mcl-code"
                value={code}
                onChange={(event) => setCode(useBackup ? event.target.value.toUpperCase().slice(0, 8) : event.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode={useBackup ? 'text' : 'numeric'}
                autoComplete="one-time-code"
                placeholder={useBackup ? 'XXXXXXXX' : '000000'}
                maxLength={useBackup ? 8 : 6}
              />
            </div>
            <button className="mcl-btn" type="submit" disabled={loading}>
              {loading ? 'Vérification…' : 'Valider'} <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <p className="mcl-note">
              <button type="button" className="mcl-oublie" onClick={() => { setUseBackup((value) => !value); setCode(''); setError('') }}>
                <KeyRound size={14} aria-hidden="true" /> {useBackup ? 'Utiliser l’application' : 'Utiliser un code de secours'}
              </button>
              {' · '}
              <button type="button" className="mcl-oublie" onClick={() => { cancel2FA(); setCode(''); setError('') }}>
                Changer de compte
              </button>
            </p>
          </form>
            </>
          ) : (
            <>
          <div className="mcl-titre">
            <h1>Heureux de vous revoir</h1>
            <p>
              Pas encore de compte ? <Link to="/register">Créer un compte</Link>
            </p>
          </div>

          <form className="mcl-champs" onSubmit={handleSubmit}>
            {expired && (
              <p className="mcl-note" role="status">
                Votre session a expiré. Reconnectez-vous : vous reviendrez à la page où vous étiez.
              </p>
            )}
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
            </>
          )}
        </div>

        <footer className="mcl-pied">
          © 2026 {platformName} · Mentions légales · Confidentialité
        </footer>
      </main>

      <aside className="mcl-photo">
        <p className="mcl-eyebrow">Tisserandes, Burkina Faso</p>
        <h2>Un compte pour garder le fil de vos lectures.</h2>
        <ul className="mcl-avantages">
          <li>Vos récits enregistrés</li>
          <li>Vos contributions suivies</li>
          <li>Gratuit</li>
        </ul>
        <p className="mcl-credit">Photo : Btwien, CC BY-SA 4.0, Wikimedia Commons</p>
      </aside>
    </div>
  )
}
