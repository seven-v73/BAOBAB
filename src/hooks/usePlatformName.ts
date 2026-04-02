import { useEffect } from 'react'
import { useSettingsStore } from '../stores/settingsStore'

/**
 * Hook personnalisé pour obtenir le nom de la plateforme
 * Charge automatiquement les paramètres si nécessaire
 */
export const usePlatformName = () => {
  const { settings, fetchSettings } = useSettingsStore()

  useEffect(() => {
    if (!settings) {
      fetchSettings()
    }
  }, [settings, fetchSettings])

  return settings?.platformName || 'BAOBAB'
}

