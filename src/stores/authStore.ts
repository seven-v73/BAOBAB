import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/api'

interface User {
  id: string
  email: string
  name: string
  role?: 'user' | 'admin'
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setRefreshToken: (refreshToken: string | null) => void
  fetchMe: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        set({ loading: true, error: null })
        try {
          const response = await authService.login(email, password)
          const { token, refreshToken, user } = response.data
          
          set({ 
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              avatar: user.avatar,
            },
            token,
            refreshToken,
            isAuthenticated: true,
            loading: false,
          })
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Erreur de connexion'
          set({ error: errorMessage, loading: false, isAuthenticated: false })
          throw new Error(errorMessage)
        }
      },
      
      register: async (email: string, password: string, name: string) => {
        set({ loading: true, error: null })
        try {
          const response = await authService.register(email, password, name)
          const { token, refreshToken, user } = response.data
          
          set({ 
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role || 'user',
            },
            token,
            refreshToken,
            isAuthenticated: true,
            loading: false,
          })
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Erreur d\'inscription'
          set({ error: errorMessage, loading: false, isAuthenticated: false })
          throw new Error(errorMessage)
        }
      },
      
      logout: async () => {
        const { refreshToken } = get()
        
        // Appeler l'API de logout pour révoquer le refresh token
        if (refreshToken) {
          try {
            await authService.logout(refreshToken)
          } catch (error) {
            // Ignorer les erreurs de logout (le token peut déjà être expiré)
            console.error('Erreur lors de la déconnexion:', error)
          }
        }
        
        set({ 
          user: null, 
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        })
      },
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      
      fetchMe: async () => {
        const { token } = get()
        if (!token) return
        
        try {
          const response = await authService.getMe()
          set({ user: response.data, isAuthenticated: true })
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false })
        }
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
)

