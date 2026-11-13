import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Monitor, Smartphone, Tablet } from 'lucide-react'
import { authService } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'
import { useNotifications } from '../../hooks/useNotifications'
import './SessionsPanel.css'

interface Session {
  id: string
  startedAt: string
  lastUsedAt: string
  ipAddress?: string
  userAgent?: string
  current: boolean
}

/** Lecture simple de l'agent utilisateur : appareil + navigateur, sans bibliothèque. */
const describe = (ua = '') => {
  const device = /iPad|Tablet/i.test(ua) ? 'tablet' : /Mobi|Android|iPhone/i.test(ua) ? 'phone' : 'desktop'
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Navigateur'
  const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad|iOS/.test(ua) ? 'iOS' : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : ''
  return { device, label: [browser, os].filter(Boolean).join(' · ') }
}

const relative = (date: string) => {
  const minutes = Math.round((Date.now() - new Date(date).getTime()) / 60000)
  if (minutes < 2) return 'à l’instant'
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  const days = Math.round(hours / 24)
  return days === 1 ? 'hier' : `il y a ${days} jours`
}

const icons = { phone: Smartphone, tablet: Tablet, desktop: Monitor }

export const SessionsPanel = () => {
  const [sessions, setSessions] = useState<Session[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const logoutAll = useAuthStore((state) => state.logoutAll)
  const { success, error } = useNotifications()
  const navigate = useNavigate()

  const load = () =>
    authService
      .getSessions()
      .then(({ data }) => setSessions(data))
      .catch(() => setSessions([]))

  useEffect(() => {
    load()
  }, [])

  const revoke = async (session: Session) => {
    setBusy(session.id)
    try {
      await authService.revokeSession(session.id)
      success('Appareil déconnecté.')
      await load()
    } catch {
      error('Impossible de déconnecter cet appareil.')
    } finally {
      setBusy(null)
    }
  }

  const revokeAll = async () => {
    if (!window.confirm('Déconnecter tous vos appareils, y compris celui-ci ?')) return
    setBusy('all')
    try {
      await logoutAll()
      success('Tous vos appareils ont été déconnectés.')
      navigate('/login', { replace: true })
    } catch {
      error('Action impossible pour le moment.')
      setBusy(null)
    }
  }

  return (
    <section className="sp" aria-labelledby="sp-title">
      <header className="sp__head">
        <div>
          <h3 id="sp-title">Appareils connectés</h3>
          <p>Vous restez connecté·e 30 jours sur chaque appareil, tant que vous l’utilisez.</p>
        </div>
      </header>

      {sessions === null ? (
        <div className="mb-skeleton" style={{ height: 120 }} />
      ) : sessions.length === 0 ? (
        <p className="sp__empty">Aucune session active.</p>
      ) : (
        <ul className="sp__list">
          {sessions.map((session) => {
            const info = describe(session.userAgent)
            const Icon = icons[info.device as keyof typeof icons]
            return (
              <li key={session.id} className={session.current ? 'is-current' : ''}>
                <span className="sp__icon">
                  <Icon size={20} aria-hidden={true} />
                </span>
                <span className="sp__info">
                  <strong>
                    {info.label}
                    {session.current && <span className="sp__badge">Cet appareil</span>}
                  </strong>
                  <small>
                    Actif {relative(session.lastUsedAt)} · connecté depuis le {new Date(session.startedAt).toLocaleDateString('fr-FR')}
                  </small>
                </span>
                {!session.current && (
                  <button type="button" className="btn btn-ghost btn-small" disabled={busy === session.id} onClick={() => revoke(session)}>
                    Déconnecter
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <button type="button" className="btn btn-outline sp__all" onClick={revokeAll} disabled={busy === 'all'}>
        <LogOut size={18} aria-hidden={true} /> Déconnecter tous mes appareils
      </button>
    </section>
  )
}
