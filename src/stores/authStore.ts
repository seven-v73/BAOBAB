import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/api'
import { applySession, clearSession, endSession, hasLegacySession, onSessionChange, refreshSession, type SessionPayload, type SessionUser } from '../services/session'

/*
 * État d'authentification
 * - Seul le profil (nom, rôle…) est mémorisé dans le navigateur, pour afficher l'interface connectée
 *   immédiatement ; aucun jeton n'y est stocké (voir services/session.ts).
 * - `status` : 'checking' pendant la vérification de la session au démarrage — les routes protégées
 *   attendent au lieu de renvoyer vers la page de connexion.
 */

export type User = SessionUser

type Status = 'idle' | 'checking' | 'ready'

interface PendingTwoFactor {
  challengeToken: string
  email: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  status: Status
  loading: boolean
  error: string | null
  pending2FA: PendingTwoFactor | null
  sessionExpired: boolean
  /** Déconnexion volontaire : les pages protégées renvoient vers l'accueil, pas vers la connexion */
  loggedOut: boolean
  init: () => Promise<void>
  login: (email: string, password: string) => Promise<'ok' | '2fa'>
  verify2FA: (code: string, useBackupCode?: boolean) => Promise<void>
  cancel2FA: () => void
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  applySessionPayload: (payload: SessionPayload) => void
  setUser: (user: User | null) => void
  fetchMe: () => Promise<void>
  clearError: () => void
}

const normalizeUser = (user: Partial<User> & { _id?: string }): User => ({
  id: String(user.id || user._id),
  _id: String(user._id || user.id),
  name: user.name || '',
  email: user.email || '',
  role: user.role || 'user',
  avatar: user.avatar || '',
})

interface ApiError {
  response?: { status?: number; data?: { error?: string; message?: string; details?: Array<{ message?: string }>; errors?: Array<{ msg?: string }> } }
  message?: string
}

const errorMessage = (error: unknown, fallback: string) => {
  const err = error as ApiError
  if (!err.response) return 'Connexion au serveur impossible. Vérifiez votre réseau et réessayez.'
  if (err.response.status === 429) return err.response.data?.error || 'Trop de tentatives. Patientez quelques minutes avant de réessayer.'
  const data = err.response.data
  return data?.details?.[0]?.message || data?.errors?.[0]?.msg || data?.error || data?.message || fallback
}

let initialized = false

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      status: 'idle',
      loading: false,
      error: null,
      pending2FA: null,
      sessionExpired: false,
      loggedOut: false,

      /** Au démarrage : rétablit la session à partir du cookie (sans redemander le mot de passe). */
      init: async () => {
        if (initialized) return
        initialized = true

        onSessionChange((payload, reason) => {
          if (payload) {
            set({ user: normalizeUser(payload.user), isAuthenticated: true, sessionExpired: false, loggedOut: false })
          } else if (get().isAuthenticated) {
            set({ user: null, isAuthenticated: false, sessionExpired: reason === 'expired', loggedOut: reason === 'logout' })
          }
        })

        // Profil mémorisé (ou ancienne session à migrer) : on vérifie la session en arrière-plan
        if (!get().isAuthenticated && !hasLegacySession()) {
          set({ status: 'ready' })
          return
        }

        set({ status: 'checking' })
        try {
          const session = await refreshSession()
          if (!session) set({ user: null, isAuthenticated: false })
        } catch {
          // Hors ligne : on garde le profil, les appels protégés réessaieront
        } finally {
          set({ status: 'ready' })
        }
      },

      login: async (email, password) => {
        set({ loading: true, error: null, sessionExpired: false })
        try {
          const { data } = await authService.login(email, password)
          if (data.requires2FA) {
            set({ pending2FA: { challengeToken: data.challengeToken, email }, loading: false })
            return '2fa'
          }
          applySession(data)
          set({ loading: false, status: 'ready' })
          return 'ok'
        } catch (error) {
          const message = errorMessage(error, 'Connexion impossible')
          set({ error: message, loading: false })
          throw new Error(message)
        }
      },

      verify2FA: async (code, useBackupCode = false) => {
        const pending = get().pending2FA
        if (!pending) throw new Error('Demande de connexion expirée')
        set({ loading: true, error: null })
        try {
          const clean = code.replace(/\s/g, '')
          const { data } = await authService.verify2FA(pending.challengeToken, useBackupCode ? { backupCode: clean } : { token: clean })
          applySession(data)
          set({ loading: false, pending2FA: null, status: 'ready' })
        } catch (error) {
          const status = (error as ApiError).response?.status
          const message = errorMessage(error, 'Code incorrect')
          // Défi expiré : retour à l'étape du mot de passe
          set({ error: message, loading: false, ...(status === 401 && /expiré/i.test(message) ? { pending2FA: null } : {}) })
          throw new Error(message)
        }
      },

      cancel2FA: () => set({ pending2FA: null, error: null }),

      register: async (email, password, name) => {
        set({ loading: true, error: null })
        try {
          const { data } = await authService.register(email, password, name)
          applySession(data)
          set({ loading: false, status: 'ready' })
        } catch (error) {
          const message = errorMessage(error, 'Inscription impossible')
          set({ error: message, loading: false })
          throw new Error(message)
        }
      },

      logout: async () => {
        set({ loggedOut: true })
        await endSession()
        set({ user: null, isAuthenticated: false, error: null, pending2FA: null, sessionExpired: false, loggedOut: true })
      },

      logoutAll: async () => {
        set({ loggedOut: true })
        try {
          await authService.logoutAll()
        } finally {
          clearSession('logout')
          set({ user: null, isAuthenticated: false, sessionExpired: false })
        }
      },

      applySessionPayload: (payload) => applySession(payload),

      setUser: (user) => set({ user: user ? normalizeUser(user) : null, isAuthenticated: Boolean(user) }),

      fetchMe: async () => {
        if (!get().isAuthenticated) return
        try {
          const { data } = await authService.getMe()
          set({ user: normalizeUser(data) })
        } catch {
          // Erreur réseau ou session expirée : géré par l'intercepteur et l'écouteur de session
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      // Uniquement le profil : jamais de jeton dans le stockage du navigateur
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
)
