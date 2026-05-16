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
  team: Array<{
    name: string
    role: string
    nationality: string
    flag: string
    image: string
    focus: string
  }>
}

interface SettingsState {
  settings: PlatformSettings | null
  loading: boolean
  error: string | null
  fetchSettings: () => Promise<void>
  updateSettings: (updates: Partial<PlatformSettings>) => Promise<void>
}

const defaultSettings: PlatformSettings = {
  platformName: 'MonBaobab',
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
  team: [
    {
      name: 'Victoire Sawadogo',
      role: 'IT Support',
      nationality: 'Burkina Faso',
      flag: 'https://flagcdn.com/w80/bf.png',
      image: '/Equipe/Victoire%20SAWADOGO.jpeg',
      focus: 'center 38%',
    },
    {
      name: 'Blanchard Kouassi',
      role: 'Référent Digital et Créateur de Contenu',
      nationality: 'Côte d’Ivoire',
      flag: 'https://flagcdn.com/w80/ci.png',
      image: '/Equipe/Blanchard%20Kouassi.jpeg',
      focus: 'center 35%',
    },
    {
      name: 'Dieudonné Dara',
      role: 'Développeur Fullstack et Designer',
      nationality: 'Mali',
      flag: 'https://flagcdn.com/w80/ml.png',
      image: '/Equipe/Dieudonn%C3%A9%20Dara.jpeg',
      focus: 'center 34%',
    },
  ],
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
            team: Array.isArray(response.data.team) && response.data.team.length > 0
              ? response.data.team.map((member: any) => ({
                name: member.name || '',
                role: member.role || '',
                nationality: member.nationality || '',
                flag: member.flag || '',
                image: member.image || '',
                focus: member.focus || 'center 35%',
              }))
              : defaultSettings.team,
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
