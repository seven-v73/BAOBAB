import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark', // Par défaut, mode sombre
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark'
          // Appliquer le thème au document
          document.documentElement.setAttribute('data-theme', newTheme)
          return { theme: newTheme }
        })
      },
      setTheme: (theme: Theme) => {
        document.documentElement.setAttribute('data-theme', theme)
        set({ theme })
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Appliquer le thème au chargement
        if (state) {
          document.documentElement.setAttribute('data-theme', state.theme)
        }
      },
    }
  )
)

