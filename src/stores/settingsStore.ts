import { create } from 'zustand'
import { settingsService } from '../services/api'

interface PlatformSettings {
  platformName: string
  contactEmail: string
  description: string
  notifications: {
    email: boolean
    newUsers: boolean
    newOrders: boolean
    newPosts: boolean
  }
  maintenance: {
    enabled: boolean
    message: string
  }
  social: {
    facebook: string
    twitter: string
    instagram: string
    linkedin: string
  }
}

interface SettingsState {
  settings: PlatformSettings | null
  loading: boolean
  error: string | null
  fetchSettings: () => Promise<void>
  updateSettings: (updates: Partial<PlatformSettings>) => Promise<void>
}

const defaultSettings: PlatformSettings = {
  platformName: 'BAOBAB',
  contactEmail: 'contact@baobab.com',
  description: 'Plateforme dédiée à la promotion de la culture africaine',
  notifications: {
    email: true,
    newUsers: true,
    newOrders: false,
    newPosts: true,
  },
  maintenance: {
    enabled: false,
    message: 'Le site est en maintenance. Nous reviendrons bientôt.',
  },
  social: {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
  },
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null })
    try {
      const response = await settingsService.getSettings()
      if (response.data) {
        set({
          settings: {
            platformName: response.data.platformName || defaultSettings.platformName,
            contactEmail: response.data.contactEmail || defaultSettings.contactEmail,
            description: response.data.description || defaultSettings.description,
            notifications: {
              email: response.data.notifications?.email ?? defaultSettings.notifications.email,
              newUsers: response.data.notifications?.newUsers ?? defaultSettings.notifications.newUsers,
              newOrders: response.data.notifications?.newOrders ?? defaultSettings.notifications.newOrders,
              newPosts: response.data.notifications?.newPosts ?? defaultSettings.notifications.newPosts,
            },
            maintenance: {
              enabled: response.data.maintenance?.enabled ?? defaultSettings.maintenance.enabled,
              message: response.data.maintenance?.message || defaultSettings.maintenance.message,
            },
            social: {
              facebook: response.data.social?.facebook || defaultSettings.social.facebook,
              twitter: response.data.social?.twitter || defaultSettings.social.twitter,
              instagram: response.data.social?.instagram || defaultSettings.social.instagram,
              linkedin: response.data.social?.linkedin || defaultSettings.social.linkedin,
            },
          },
          loading: false,
        })
      } else {
        set({ settings: defaultSettings, loading: false })
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des paramètres:', error)
      // En cas d'erreur, utiliser les valeurs par défaut
      set({ settings: defaultSettings, loading: false, error: error.message })
    }
  },

  updateSettings: async (updates: Partial<PlatformSettings>) => {
    const currentSettings = get().settings || defaultSettings
    const newSettings = { ...currentSettings, ...updates }
    
    set({ loading: true, error: null })
    try {
      await settingsService.updateSettings(updates)
      set({ settings: newSettings, loading: false })
    } catch (error: any) {
      set({ loading: false, error: error.response?.data?.error || error.message })
      throw error
    }
  },
}))

