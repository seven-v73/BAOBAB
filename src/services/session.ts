import axios from 'axios'

/*
 * Session côté navigateur
 * - Le jeton d'accès (15 min) reste en mémoire : jamais dans localStorage, donc hors de portée d'un script injecté.
 * - Le refresh token vit dans un cookie httpOnly posé par l'API : le navigateur l'envoie tout seul à /api/auth.
 * - Le jeton est renouvelé ~1 min avant son expiration : l'utilisateur ne voit jamais d'erreur 401.
 * - Un seul renouvellement à la fois, même avec plusieurs onglets (verrou Web Locks + promesse partagée).
 * - Les onglets se tiennent au courant des connexions / déconnexions (BroadcastChannel).
 */

const API_URL = import.meta.env.VITE_API_URL || '/api'
const LEGACY_STORAGE_KEY = 'auth-storage'

export interface SessionUser {
  id: string
  _id?: string
  name: string
  email: string
  role?: 'user' | 'admin'
  avatar?: string
}

export interface SessionPayload {
  token: string
  user: SessionUser
}

// Client dédié (sans intercepteurs) pour les appels de session
export const sessionApi = axios.create({ baseURL: API_URL, withCredentials: true, headers: { 'Content-Type': 'application/json' } })

let accessToken: string | null = null
let expiresAt = 0
let refreshTimer: number | undefined
let inflight: Promise<SessionPayload | null> | null = null

type Listener = (payload: SessionPayload | null, reason?: 'expired' | 'logout' | 'refresh' | 'login') => void
const listeners = new Set<Listener>()
export const onSessionChange = (listener: Listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const emit: Listener = (payload, reason) => listeners.forEach((listener) => listener(payload, reason))

const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('mb-auth') : null

const decodeExpiry = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp === 'number' ? payload.exp * 1000 : 0
  } catch {
    return 0
  }
}

export const getAccessToken = () => accessToken

/** Le jeton expire-t-il dans moins de `marginMs` ? */
export const isAccessTokenExpiring = (marginMs = 30_000) => !accessToken || Date.now() > expiresAt - marginMs

const scheduleRefresh = () => {
  window.clearTimeout(refreshTimer)
  if (!accessToken) return
  const delay = Math.max(5_000, expiresAt - Date.now() - 60_000)
  refreshTimer = window.setTimeout(() => {
    refreshSession().catch(() => undefined)
  }, delay)
}

/** Enregistre une session ouverte (connexion, inscription, 2FA, changement de mot de passe). */
export const applySession = (payload: SessionPayload, reason: 'login' | 'refresh' = 'login', broadcast = true) => {
  accessToken = payload.token
  expiresAt = decodeExpiry(payload.token) || Date.now() + 14 * 60_000
  scheduleRefresh()
  emit(payload, reason)
  if (broadcast && reason === 'login') channel?.postMessage({ type: 'login' })
}

export const clearSession = (reason: 'expired' | 'logout' = 'logout', broadcast = true) => {
  const hadSession = Boolean(accessToken)
  accessToken = null
  expiresAt = 0
  window.clearTimeout(refreshTimer)
  emit(null, reason)
  if (broadcast && (hadSession || reason === 'logout')) channel?.postMessage({ type: 'logout' })
}

/** Ancienne version : refresh token stocké dans localStorage. Récupéré une seule fois pour migrer sans déconnecter. */
const takeLegacyRefreshToken = (): string | null => {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const legacy = parsed?.state?.refreshToken
    if (legacy || parsed?.state?.token) {
      // On retire immédiatement les jetons du stockage : seul le profil (non sensible) y reste
      delete parsed.state.refreshToken
      delete parsed.state.token
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(parsed))
    }
    return typeof legacy === 'string' ? legacy : null
  } catch {
    return null
  }
}

// Lu dès le chargement du module, avant que le store ne réécrive son stockage
let legacyRefreshToken: string | null = typeof localStorage !== 'undefined' ? takeLegacyRefreshToken() : null
export const hasLegacySession = () => Boolean(legacyRefreshToken)

const doRefresh = async (): Promise<SessionPayload | null> => {
  const legacy = legacyRefreshToken
  legacyRefreshToken = null
  try {
    const { data } = await sessionApi.post<SessionPayload>('/auth/refresh', legacy ? { refreshToken: legacy } : {})
    applySession(data, 'refresh')
    return data
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status
    if (status === 401 || status === 403) {
      clearSession('expired', false)
      return null
    }
    // Réseau coupé, serveur indisponible : on ne déconnecte pas, on réessaiera
    throw error
  }
}

/**
 * Renouvelle la session. Les appels simultanés partagent la même requête ;
 * entre onglets, le verrou Web Locks évite deux rotations concurrentes.
 */
export const refreshSession = (): Promise<SessionPayload | null> => {
  if (inflight) return inflight
  const run = (): Promise<SessionPayload | null> => doRefresh()
  const locks = typeof navigator !== 'undefined' && 'locks' in navigator ? navigator.locks : null
  // request() renvoie la promesse du rappel une fois résolue (le typage DOM l'emballe une fois de trop)
  const locked = locks ? (locks.request('mb-auth-refresh', run) as unknown as Promise<SessionPayload | null>) : run()
  const pending: Promise<SessionPayload | null> = locked.finally(() => {
    inflight = null
  })
  inflight = pending
  return pending
}

/** Déconnexion de cet appareil (fonctionne même si le jeton d'accès a expiré). */
export const endSession = async () => {
  try {
    await sessionApi.post('/auth/logout')
  } catch {
    // Hors ligne : la session locale est quand même fermée ; le cookie expirera de lui-même
  }
  clearSession('logout')
}

// Synchronisation entre onglets
channel?.addEventListener('message', (event: MessageEvent<{ type: string }>) => {
  if (event.data?.type === 'logout') clearSession('logout', false)
  if (event.data?.type === 'login') refreshSession().catch(() => undefined)
})

// Retour sur l'onglet après une veille : renouveler si besoin
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && accessToken && isAccessTokenExpiring(90_000)) {
      refreshSession().catch(() => undefined)
    }
  })
}
