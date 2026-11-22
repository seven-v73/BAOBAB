import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Bookmark, LogOut } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { Input } from '../components/Input/Input'
import { EmptyState } from '../components/UX/EmptyState'
import { SessionsPanel } from '../components/Account/SessionsPanel'
import { RubriqueSection } from '../components/UX/RubriqueSection'
import { TypeChips } from '../components/UX/TypeChips'
import { useParamState } from '../hooks/useParamState'
import { useNotifications } from '../hooks/useNotifications'
import { authService, bookmarkService, contributionService, userService } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { contributionTypes } from '../data/contributionTypes'
import { fetchLists, joinMeta } from '../utils'
import './Rubriques.css'
import './Dashboard.css'

// Mon espace (clean.md, maquettes Figma « Mon espace / … ») : enregistrés, contributions, profil.

type Tab = 'enregistres' | 'contributions' | 'profil'
type Group = 'recits' | 'pays' | 'reperes'
type Status = 'relecture' | 'publiee' | 'revoir'

const TABS = [
  { key: 'enregistres', label: 'Enregistrés' },
  { key: 'contributions', label: 'Contributions' },
  { key: 'profil', label: 'Profil' },
] as const

const GROUPS = [
  { key: 'tout', label: 'Tout' },
  { key: 'recits', label: 'Récits' },
  { key: 'pays', label: 'Pays' },
  { key: 'reperes', label: 'Repères' },
] as const

const STATUSES = [
  { key: 'toutes', label: 'Toutes' },
  { key: 'relecture', label: 'En relecture' },
  { key: 'publiee', label: 'Publiées' },
  { key: 'revoir', label: 'À revoir' },
] as const

const STATUS_OF: Record<string, Status> = { proposed: 'relecture', 'in-review': 'relecture', approved: 'publiee', rejected: 'revoir' }
const STATUS_LABEL: Record<Status, string> = { relecture: 'En relecture', publiee: 'Publiée', revoir: 'À revoir' }
const TYPE_LABEL = Object.fromEntries(contributionTypes.map((t) => [t.value, t.label]))

// Chaque type de favori : son libellé, sa rubrique et son adresse. Les quiz (en pause) sont ignorés.
const ITEM_VIEW: Record<string, { label: string; group: Group; to: (item: any, id: string) => string }> = {
  story: { label: 'Récit', group: 'recits', to: (_, id) => `/stories/${id}` },
  blog: { label: 'Article', group: 'recits', to: (_, id) => `/blog/${id}` },
  collection: { label: 'Dossier', group: 'recits', to: (_, id) => `/collections/${id}` },
  country: { label: 'Pays', group: 'pays', to: (item) => `/country/${String(item.id).toLowerCase()}` },
  figure: { label: 'Personnalité', group: 'reperes', to: (_, id) => `/figures/${id}` },
  event: { label: 'Date', group: 'reperes', to: (_, id) => `/timeline/${id}` },
  proverb: { label: 'Proverbe', group: 'reperes', to: (_, id) => `/proverbs/${id}` },
}

const toSaved = (bookmark: any) => {
  const view = ITEM_VIEW[bookmark.itemType]
  const item = bookmark.item
  if (!view || !item) return null
  const firstImage = item.images?.[0]
  return {
    id: bookmark._id as string,
    group: view.group,
    label: view.label,
    title: (item.nameFr || item.name || item.title || `« ${item.text} »`) as string,
    image: (item.coverImage || item.image || firstImage?.url || firstImage) as string | undefined,
    place: item.region || item.countryName || item.birthPlace?.location || item.location?.region,
    to: view.to(item, bookmark.itemId),
    date: bookmark.createdAt as string,
  }
}

const shortDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
const countBy = <K extends string>(keys: K[]) =>
  keys.reduce<Partial<Record<K, number>>>((acc, key) => ({ ...acc, [key]: (acc[key] ?? 0) + 1 }), {})
const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

export const Dashboard = () => {
  const { user, setUser, logout } = useAuthStore()
  const { success, error } = useNotifications()
  const navigate = useNavigate()
  const [tab, setTab] = useParamState<Tab>('onglet', 'enregistres')
  const [group, setGroup] = useState<Group | 'tout'>('tout')
  const [status, setStatus] = useState<Status | 'toutes'>('toutes')
  const [saved, setSaved] = useState<NonNullable<ReturnType<typeof toSaved>>[]>([])
  const [contributions, setContributions] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState({ name: '', city: '', country: '' })
  const [passwords, setPasswords] = useState({ current: '', next: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetchLists([
        [bookmarkService.getAll({ limit: 100 }), 'data'],
        [contributionService.getAll({ mine: 'true', limit: 100 }), 'contributions'],
      ]),
      userService.getProfile().then((r) => r.data).catch(() => null),
    ]).then(([[bookmarks, mine], me]) => {
      if (cancelled) return
      setSaved(bookmarks.map(toSaved).filter((item): item is NonNullable<typeof item> => item !== null))
      setContributions(mine.map((c) => ({ ...c, state: STATUS_OF[c.status] ?? 'relecture' })))
      setProfile(me)
      setForm({ name: me?.name ?? user?.name ?? '', city: me?.address?.city ?? '', country: me?.address?.country ?? '' })
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [user?.name])

  const groupCounts = useMemo(() => ({ tout: saved.length, ...countBy(saved.map((s) => s.group)) }), [saved])
  const statusCounts = useMemo(
    () => ({ toutes: contributions.length, ...countBy(contributions.map((c) => c.state as Status)) }),
    [contributions]
  )
  const shownSaved = group === 'tout' ? saved : saved.filter((s) => s.group === group)
  const shownContributions = status === 'toutes' ? contributions : contributions.filter((c) => c.state === status)

  const removeSaved = async (id: string) => {
    try {
      await bookmarkService.delete(id)
      setSaved((list) => list.filter((s) => s.id !== id))
    } catch {
      error('Impossible de retirer cet élément.')
    }
  }

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault()
    if (!user?._id) return
    try {
      await userService.update(user._id, { name: form.name, address: { ...profile?.address, city: form.city, country: form.country } })
      setUser({ ...user, name: form.name })
      success('Profil enregistré.')
    } catch {
      error('Le profil n’a pas pu être enregistré.')
    }
  }

  const changePassword = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await authService.changePassword(passwords.current, passwords.next)
      setPasswords({ current: '', next: '' })
      success('Mot de passe modifié.')
    } catch (err) {
      const data = (err as { response?: { data?: { error?: string; details?: Array<{ message?: string }>; errors?: Array<{ msg?: string }> } } }).response?.data
      error(data?.details?.[0]?.message || data?.errors?.[0]?.msg || data?.error || 'Modification impossible. Vérifiez votre mot de passe actuel.')
    }
  }

  const signOut = async () => {
    await logout()
    navigate('/')
  }

  const since = profile?.createdAt && new Date(profile.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <Layout>
      <div className="mbr mbd">
        <header className="mbd-profile">
          {user?.avatar ? (
            <img className="mbd-avatar" src={user.avatar} alt="" />
          ) : (
            <span className="mbd-avatar" aria-hidden="true">{initials(form.name || user?.name)}</span>
          )}
          <div className="mbd-who">
            <p className="mbr-meta">Mon espace</p>
            <h1>{form.name || user?.name}</h1>
            <p>{joinMeta(since && `Membre depuis ${since}`, form.city, form.country)}</p>
          </div>
          <div className="mbd-head-actions">
            <Link to="/contribute" className="mbr-button">
              Proposer un contenu <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/blog/ecrire" className="mbr-button mbr-button--ghost">
              Écrire un article
            </Link>
          </div>
        </header>

        <TypeChips
          label="Rubriques de Mon espace"
          options={TABS}
          counts={{ enregistres: saved.length, contributions: contributions.length }}
          active={tab}
          onChange={setTab}
          variant="tabs"
        />

        {loading && <p className="mbr-empty">Chargement de votre espace…</p>}

        {!loading && tab === 'enregistres' && (
          <div className="mbd-columns">
            <div className="mbd-main">
              {saved.length === 0 ? (
                <EmptyState
                  title="Rien d’enregistré pour l’instant"
                  description="Touchez le signet sur un récit, un pays ou une personnalité pour le retrouver ici."
                  action={
                    <div className="mbd-actions">
                      <Link to="/map" className="mbr-button">Explorer la carte</Link>
                      <Link to="/recits" className="mbr-button mbr-button--ghost">Lire les récits</Link>
                    </div>
                  }
                />
              ) : (
                <>
                  <TypeChips label="Type d’élément" options={GROUPS} counts={groupCounts} active={group} onChange={setGroup} />
                  <ul className="mbr-list">
                    {shownSaved.map((item) => (
                      <li key={item.id} className="mbd-row">
                        <Link to={item.to} className="mbd-thumb" aria-hidden="true" tabIndex={-1}>
                          {item.image ? <img src={item.image} alt="" loading="lazy" /> : <span>{item.label === 'Proverbe' ? '«' : item.title[0]}</span>}
                        </Link>
                        <div className="mbd-row-body">
                          <p className="mbr-meta">{item.label}</p>
                          <h3><Link to={item.to}>{item.title}</Link></h3>
                          {item.place && <p>{item.place}</p>}
                        </div>
                        <span className="mbd-date">{shortDate(item.date)}</span>
                        <button type="button" className="mbd-unsave" onClick={() => removeSaved(item.id)} aria-label={`Retirer ${item.title}`}>
                          <Bookmark size={20} fill="currentColor" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <ContributeAside />
          </div>
        )}

        {!loading && tab === 'contributions' && (
          <div className="mbd-columns">
            <div className="mbd-main">
              {contributions.length === 0 ? (
                <EmptyState
                  title="Aucune proposition pour l’instant"
                  description="Un récit, un proverbe ou une source : chaque proposition est relue par l’équipe, et vous suivez son avancée ici."
                  action={<Link to="/contribute" className="mbr-button">Contribuer</Link>}
                />
              ) : (
                <>
                  <TypeChips label="Statut" options={STATUSES} counts={statusCounts} active={status} onChange={setStatus} />
                  <ul className="mbr-list">
                    {shownContributions.map((c) => (
                      <li key={c._id} className="mbd-row mbd-row--contribution">
                        <div className="mbd-row-body">
                          <p className="mbr-meta">{joinMeta(TYPE_LABEL[c.type] ?? c.type, c.countryName)}</p>
                          <h3>{c.title}</h3>
                          <p>{joinMeta(`Envoyée le ${shortDate(c.createdAt)}`, c.reviewedAt && `relue le ${shortDate(c.reviewedAt)}`)}</p>
                          {c.reviewNote && (
                            <div className="mbd-note">
                              <p className="mbr-meta">Note de l’équipe</p>
                              <p>{c.reviewNote}</p>
                            </div>
                          )}
                        </div>
                        <span className={`mbd-status mbd-status--${c.state}`}>{STATUS_LABEL[c.state as Status]}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <ContributeAside />
          </div>
        )}

        {!loading && tab === 'profil' && (
          <div className="mbd-columns">
            <RubriqueSection id="mbd-infos" title="Informations" subtitle="Votre nom et votre ville apparaissent sous vos contributions publiées.">
              <form className="mbd-form" onSubmit={saveProfile}>
                <Input label="Nom affiché" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} />
                <Input label="E-mail" value={profile?.email ?? user?.email ?? ''} disabled hint="L’e-mail ne se modifie pas ici." />
                <Input label="Ville" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <Input label="Pays" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                <button type="submit" className="mbr-button">Enregistrer les modifications</button>
              </form>
            </RubriqueSection>
            <aside className="mbd-side">
              <form className="mbr-aside mbd-form" onSubmit={changePassword}>
                <h2>Mot de passe</h2>
                <Input label="Mot de passe actuel" type="password" autoComplete="current-password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} required />
                <Input label="Nouveau mot de passe" type="password" autoComplete="new-password" hint="12 caractères minimum." value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} required minLength={12} maxLength={128} />
                <button type="submit" className="mbr-button mbr-button--ghost">Modifier le mot de passe</button>
              </form>
              <button type="button" className="mbd-signout" onClick={signOut}>
                <LogOut size={18} aria-hidden="true" /> Se déconnecter
              </button>
            </aside>
          </div>
        )}
        {!loading && tab === 'profil' && (
          <RubriqueSection id="mbd-sessions" title="Appareils connectés" subtitle="Déconnectez un appareil que vous ne reconnaissez pas.">
            <SessionsPanel />
          </RubriqueSection>
        )}
      </div>
    </Layout>
  )
}

const ContributeAside = () => (
  <aside className="mbd-side">
    <div className="mbr-aside">
      <h2>Un récit, un proverbe, une source ?</h2>
      <p>Chaque proposition est relue par l’équipe avant publication. Vous suivez son avancée ici.</p>
      <Link to="/contribute" className="mbr-button">
        Contribuer <ArrowRight size={18} aria-hidden="true" />
      </Link>
      <Link to="/blog/ecrire" className="mbr-button mbr-button--ghost">
        Écrire un article
      </Link>
    </div>
  </aside>
)
