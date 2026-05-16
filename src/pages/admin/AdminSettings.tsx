import { useState, useEffect } from 'react'
import { Card } from '../../components/Card/Card'
import { Button } from '../../components/Button/Button'
import { Input } from '../../components/Input/Input'
import { Save, Bell, Shield, Globe, Plus, Trash2, Users } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { useNotifications } from '../../hooks/useNotifications'
import './AdminSettings.css'

export const AdminSettings = () => {
  const { showError, success } = useNotifications()
  const { settings, loading, fetchSettings, updateSettings: updateStoreSettings } = useSettingsStore()
  const [saving, setSaving] = useState(false)
  const [localSettings, setLocalSettings] = useState({
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
  })

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await updateStoreSettings({
        platformName: localSettings.platformName,
        contactEmail: localSettings.contactEmail,
        description: localSettings.description,
      })
      // Recharger les paramètres pour s'assurer que tout est synchronisé
      await fetchSettings()
      success('Paramètres généraux enregistrés avec succès')
    } catch (err: any) {
      showError(err.response?.data?.error || 'Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      setSaving(true)
      await updateStoreSettings({
        notifications: localSettings.notifications,
      })
      // Recharger les paramètres pour s'assurer que tout est synchronisé
      await fetchSettings()
      success('Paramètres de notifications enregistrés avec succès')
    } catch (err: any) {
      showError(err.response?.data?.error || 'Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveMaintenance = async () => {
    try {
      setSaving(true)
      await updateStoreSettings({
        maintenance: localSettings.maintenance,
      })
      // Recharger les paramètres pour s'assurer que tout est synchronisé
      await fetchSettings()
      success('Paramètres de maintenance enregistrés avec succès')
    } catch (err: any) {
      showError(err.response?.data?.error || 'Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveTeam = async () => {
    try {
      setSaving(true)
      await updateStoreSettings({
        team: localSettings.team.filter((member) => member.name.trim()),
      })
      await fetchSettings()
      success('Équipe enregistrée avec succès')
    } catch (err: any) {
      showError(err.response?.data?.error || 'Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  const updateTeamMember = (index: number, field: keyof typeof localSettings.team[number], value: string) => {
    const updatedTeam = [...localSettings.team]
    updatedTeam[index] = { ...updatedTeam[index], [field]: value }
    setLocalSettings({ ...localSettings, team: updatedTeam })
  }

  const addTeamMember = () => {
    setLocalSettings({
      ...localSettings,
      team: [
        ...localSettings.team,
        {
          name: '',
          role: '',
          nationality: '',
          flag: '',
          image: '',
          focus: 'center 35%',
        },
      ],
    })
  }

  const removeTeamMember = (index: number) => {
    setLocalSettings({
      ...localSettings,
      team: localSettings.team.filter((_, itemIndex) => itemIndex !== index),
    })
  }

  if (loading) {
    return (
      <div className="admin-settings">
        <div className="admin-loading">Chargement des paramètres...</div>
      </div>
    )
  }

  return (
    <div className="admin-settings">
      <div className="admin-section-header">
        <div>
          <h2>Paramètres</h2>
          <p>Configurez les paramètres de la plateforme</p>
        </div>
      </div>

      <div className="settings-sections">
        <Card className="settings-card">
          <div className="settings-header">
            <Globe size={24} />
            <h3>Paramètres Généraux</h3>
          </div>
          <form className="settings-form" onSubmit={handleSaveGeneral}>
            <div className="form-group">
              <label htmlFor="platform-name" className="input-label">Nom de la plateforme</label>
              <Input
                id="platform-name"
                value={localSettings.platformName}
                onChange={(e) => setLocalSettings({ ...localSettings, platformName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-email" className="input-label">Email de contact</label>
              <Input
                id="contact-email"
                type="email"
                value={localSettings.contactEmail}
                onChange={(e) => setLocalSettings({ ...localSettings, contactEmail: e.target.value })}
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="settings-description" className="input-label">Description</label>
              <textarea
                id="settings-description"
                name="description"
                className="form-textarea"
                value={localSettings.description}
                onChange={(e) => setLocalSettings({ ...localSettings, description: e.target.value })}
                rows={3}
              />
            </div>
            <Button type="submit" disabled={saving}>
              <Save size={20} />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </form>
        </Card>

        <Card className="settings-card">
          <div className="settings-header">
            <Bell size={24} />
            <h3>Notifications</h3>
          </div>
          <div className="settings-options">
            <label htmlFor="notif-email" className="settings-option">
              <input
                id="notif-email"
                type="checkbox"
                checked={localSettings.notifications.email}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    notifications: { ...localSettings.notifications, email: e.target.checked },
                  })
                }
              />
              <span>Notifications par email</span>
            </label>
            <label htmlFor="notif-users" className="settings-option">
              <input
                id="notif-users"
                type="checkbox"
                checked={localSettings.notifications.newUsers}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    notifications: { ...localSettings.notifications, newUsers: e.target.checked },
                  })
                }
              />
              <span>Notifications de nouveaux utilisateurs</span>
            </label>
            <label htmlFor="notif-orders" className="settings-option">
              <input
                id="notif-orders"
                type="checkbox"
                checked={localSettings.notifications.newOrders}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    notifications: { ...localSettings.notifications, newOrders: e.target.checked },
                  })
                }
              />
              <span>Notifications de nouvelles commandes</span>
            </label>
            <label htmlFor="notif-posts" className="settings-option">
              <input
                id="notif-posts"
                type="checkbox"
                checked={localSettings.notifications.newPosts}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    notifications: { ...localSettings.notifications, newPosts: e.target.checked },
                  })
                }
              />
              <span>Notifications de nouveaux posts</span>
            </label>
          </div>
          <Button onClick={handleSaveNotifications} disabled={saving} style={{ marginTop: '1rem' }}>
            <Save size={20} />
            {saving ? 'Enregistrement...' : 'Enregistrer les notifications'}
          </Button>
        </Card>

        <Card className="settings-card">
          <div className="settings-header">
            <Shield size={24} />
            <h3>Maintenance</h3>
          </div>
          <div className="settings-options">
            <label htmlFor="maintenance-enabled" className="settings-option">
              <input
                id="maintenance-enabled"
                type="checkbox"
                checked={localSettings.maintenance.enabled}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    maintenance: { ...localSettings.maintenance, enabled: e.target.checked },
                  })
                }
              />
              <span>Activer le mode maintenance</span>
            </label>
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label htmlFor="maintenance-message" className="input-label">Message de maintenance</label>
            <textarea
              id="maintenance-message"
              className="form-textarea"
              value={localSettings.maintenance.message}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  maintenance: { ...localSettings.maintenance, message: e.target.value },
                })
              }
              rows={3}
            />
          </div>
          <Button onClick={handleSaveMaintenance} disabled={saving} style={{ marginTop: '1rem' }}>
            <Save size={20} />
            {saving ? 'Enregistrement...' : 'Enregistrer la maintenance'}
          </Button>
        </Card>

        <Card className="settings-card">
          <div className="settings-header settings-header-split">
            <div>
              <Users size={24} />
              <h3>Équipe MonBaobab</h3>
            </div>
            <Button type="button" variant="outline" size="small" onClick={addTeamMember}>
              <Plus size={16} />
              Ajouter
            </Button>
          </div>

          <div className="team-settings-list">
            {localSettings.team.map((member, index) => (
              <div key={`${member.name}-${index}`} className="team-settings-item">
                <div className="team-settings-preview">
                  {member.image ? (
                    <img src={member.image} alt="" style={{ objectPosition: member.focus || 'center 35%' }} />
                  ) : (
                    <div className="team-settings-placeholder">Photo</div>
                  )}
                  {member.flag && <img src={member.flag} alt="" className="team-settings-flag" />}
                </div>

                <div className="team-settings-fields">
                  <div className="form-row">
                    <Input
                      label="Nom"
                      value={member.name}
                      onChange={(event) => updateTeamMember(index, 'name', event.target.value)}
                      placeholder="Nom complet"
                    />
                    <Input
                      label="Poste"
                      value={member.role}
                      onChange={(event) => updateTeamMember(index, 'role', event.target.value)}
                      placeholder="Poste ou responsabilité"
                    />
                  </div>
                  <div className="form-row">
                    <Input
                      label="Nationalité"
                      value={member.nationality}
                      onChange={(event) => updateTeamMember(index, 'nationality', event.target.value)}
                      placeholder="Pays"
                    />
                    <Input
                      label="Drapeau"
                      value={member.flag}
                      onChange={(event) => updateTeamMember(index, 'flag', event.target.value)}
                      placeholder="https://flagcdn.com/w80/bf.png"
                    />
                  </div>
                  <div className="form-row">
                    <Input
                      label="Photo"
                      value={member.image}
                      onChange={(event) => updateTeamMember(index, 'image', event.target.value)}
                      placeholder="/Equipe/photo.jpeg ou URL"
                    />
                    <Input
                      label="Cadrage image"
                      value={member.focus || ''}
                      onChange={(event) => updateTeamMember(index, 'focus', event.target.value)}
                      placeholder="center 35%"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="team-settings-remove"
                  onClick={() => removeTeamMember(index)}
                  aria-label={`Retirer ${member.name || 'ce membre'}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <Button onClick={handleSaveTeam} disabled={saving} style={{ marginTop: '1rem' }}>
            <Save size={20} />
            {saving ? 'Enregistrement...' : 'Enregistrer l’équipe'}
          </Button>
        </Card>
      </div>
    </div>
  )
}
