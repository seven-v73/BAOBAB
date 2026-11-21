import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Ban, CheckCircle2, MapPin, Search, ShieldCheck, Trash2, UserPlus, Users, X } from 'lucide-react'
import { userService } from '../../services/api'
import { useNotifications } from '../../hooks/useNotifications'
import { useConfirmDialog } from '../../components/UX/ConfirmDialog'
import { TypeChips } from '../../components/UX/TypeChips'
import { useAuthStore } from '../../stores/authStore'
import './AdminUsers.css'

// Membres de la plateforme : chiffres, filtres en pastilles, liste dense ; chaque ligne ouvre un
// panneau (informations, rôle, accès, suppression). L'interface empêche un administrateur de se
// rétrograder, de se désactiver ou de supprimer son propre compte.

interface UserData {
  _id: string
  name: string
  email: string
  role: 'user' | 'admin'
  isActive: boolean
  createdAt: string
  updatedAt?: string
  phone?: string
  avatar?: string
  address?: { street?: string; city?: string; zipCode?: string; country?: string }
}

type RoleFiltre = 'all' | 'user' | 'admin'
type StatutFiltre = 'tous' | 'actifs' | 'inactifs'

const ROLES: ReadonlyArray<{ key: RoleFiltre; label: string }> = [
  { key: 'all', label: 'Tous' },
  { key: 'user', label: 'Membres' },
  { key: 'admin', label: 'Administrateurs' },
]

const STATUTS: ReadonlyArray<{ key: StatutFiltre; label: string }> = [
  { key: 'tous', label: 'Tous statuts' },
  { key: 'actifs', label: 'Actifs' },
  { key: 'inactifs', label: 'Désactivés' },
]

// Le serveur pagine par 20 par défaut : on charge une page large pour filtrer et compter sur place
const LIMITE = 1000

const initiales = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?'

const dateCourte = (value?: string) =>
  value ? new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

const lieuDe = (user: UserData) => [user.address?.city, user.address?.country].filter(Boolean).join(', ')

const messageErreur = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { error?: string; message?: string } } }).response?.data?.error ||
  (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
  fallback

const normaliser = (texte: string) => texte.trim().toLocaleLowerCase('fr').normalize('NFD').replace(/[̀-ͯ]/g, '')

export const AdminUsers = () => {
  const moi = useAuthStore((state) => state.user)
  const [users, setUsers] = useState<UserData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFiltre>('all')
  const [statutFilter, setStatutFilter] = useState<StatutFiltre>('tous')
  const [ouvertId, setOuvertId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', phone: '' })
  const [enCours, setEnCours] = useState(false)
  const [suppression, setSuppression] = useState(false)
  const [nomSaisi, setNomSaisi] = useState('')
  const { success, error: showError } = useNotifications()
  const { confirm, Dialog } = useConfirmDialog()

  const panneauRef = useRef<HTMLElement | null>(null)
  const fermerRef = useRef<HTMLButtonElement | null>(null)
  const declencheurRef = useRef<HTMLElement | null>(null)
  const dialogueActif = useRef(false)

  const fetchUsers = useCallback(async () => {
    try {
      const response = await userService.getAll({ limit: LIMITE })
      const liste: UserData[] = response.data.users || response.data || []
      setUsers(liste)
      setTotal(response.data.pagination?.total ?? liste.length)
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error)
      showError('Chargement des membres impossible.')
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const ouvert = users.find((user) => user._id === ouvertId) ?? null
  const estMoi = !!ouvert && !!moi && (ouvert._id === moi.id || ouvert._id === moi._id)

  // ---------- Chiffres et filtres (sur les comptes chargés) ----------
  const chiffres = useMemo(() => {
    const maintenant = new Date()
    return {
      total: users.length,
      admins: users.filter((u) => u.role === 'admin').length,
      actifs: users.filter((u) => u.isActive).length,
      inactifs: users.filter((u) => !u.isActive).length,
      ceMois: users.filter((u) => {
        const d = new Date(u.createdAt)
        return d.getFullYear() === maintenant.getFullYear() && d.getMonth() === maintenant.getMonth()
      }).length,
    }
  }, [users])

  const parStatut = useMemo(
    () => users.filter((u) => statutFilter === 'tous' || (statutFilter === 'actifs' ? u.isActive : !u.isActive)),
    [users, statutFilter],
  )
  const parRole = useMemo(() => users.filter((u) => roleFilter === 'all' || u.role === roleFilter), [users, roleFilter])

  const recherche = normaliser(searchTerm)
  const correspond = useCallback(
    (u: UserData) => !recherche || normaliser(u.name).includes(recherche) || normaliser(u.email).includes(recherche),
    [recherche],
  )

  const visibles = useMemo(
    () => parStatut.filter((u) => (roleFilter === 'all' || u.role === roleFilter) && correspond(u)),
    [parStatut, roleFilter, correspond],
  )

  const comptesRoles = useMemo(() => {
    const base = parStatut.filter(correspond)
    return { all: base.length, user: base.filter((u) => u.role === 'user').length, admin: base.filter((u) => u.role === 'admin').length }
  }, [parStatut, correspond])

  const comptesStatuts = useMemo(() => {
    const base = parRole.filter(correspond)
    return { tous: base.length, actifs: base.filter((u) => u.isActive).length, inactifs: base.filter((u) => !u.isActive).length }
  }, [parRole, correspond])

  // ---------- Panneau ----------
  const ouvrir = (user: UserData, declencheur: HTMLElement) => {
    declencheurRef.current = declencheur
    setOuvertId(user._id)
    setFormData({ name: user.name, phone: user.phone || '' })
    setSuppression(false)
    setNomSaisi('')
  }

  const fermer = useCallback(() => {
    setOuvertId(null)
    setSuppression(false)
    setNomSaisi('')
    window.setTimeout(() => declencheurRef.current?.focus(), 0)
  }, [])

  const panneauOuvert = ouvertId !== null
  useEffect(() => {
    if (!panneauOuvert) return
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    fermerRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (dialogueActif.current) return
      if (event.key === 'Escape') {
        event.preventDefault()
        fermer()
        return
      }
      // Garde le focus dans le panneau
      if (event.key === 'Tab' && panneauRef.current) {
        const focusables = panneauRef.current.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])',
        )
        if (focusables.length === 0) return
        const premier = focusables[0]
        const dernier = focusables[focusables.length - 1]
        if (event.shiftKey && document.activeElement === premier) {
          event.preventDefault()
          dernier.focus()
        } else if (!event.shiftKey && document.activeElement === dernier) {
          event.preventDefault()
          premier.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [panneauOuvert, fermer])

  const demander = async (options: Parameters<typeof confirm>[0]) => {
    dialogueActif.current = true
    try {
      return await confirm(options)
    } finally {
      // Laisse passer l'Échap qui a fermé la confirmation avant de réarmer le panneau
      window.setTimeout(() => {
        dialogueActif.current = false
      }, 0)
    }
  }

  // ---------- Actions ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ouvert) return
    setEnCours(true)
    try {
      await userService.update(ouvert._id, { name: formData.name.trim(), phone: formData.phone.trim() })
      success('Informations du membre enregistrées.')
      await fetchUsers()
    } catch (error) {
      showError(messageErreur(error, 'Enregistrement impossible.'))
    } finally {
      setEnCours(false)
    }
  }

  const changerRole = async (role: 'user' | 'admin') => {
    if (!ouvert || ouvert.role === role) return
    if (estMoi && role !== 'admin') return
    const accepted = await demander(
      role === 'admin'
        ? {
            title: `Nommer ${ouvert.name} administrateur ?`,
            message: 'Ce compte aura accès à toute l’administration : contenus, fiches, membres et paramètres.',
            confirmLabel: 'Nommer administrateur',
          }
        : {
            title: `Retirer les droits d’administration de ${ouvert.name} ?`,
            message: 'Le compte redevient un compte membre et perd l’accès à l’administration.',
            confirmLabel: 'Retirer les droits',
            tone: 'danger',
          },
    )
    if (!accepted) return
    setEnCours(true)
    try {
      await userService.update(ouvert._id, { role })
      success(role === 'admin' ? `${ouvert.name} est administrateur.` : `${ouvert.name} est de nouveau membre.`)
      await fetchUsers()
    } catch (error) {
      showError(messageErreur(error, 'Changement de rôle impossible.'))
    } finally {
      setEnCours(false)
    }
  }

  const handleToggleActive = async (user: UserData) => {
    if (estMoi && user.isActive) return
    const accepted = await demander(
      user.isActive
        ? {
            title: `Désactiver le compte de ${user.name} ?`,
            message: 'La personne ne pourra plus se connecter jusqu’à réactivation. Ses contenus restent en place.',
            confirmLabel: 'Désactiver',
            tone: 'danger',
          }
        : {
            title: `Réactiver le compte de ${user.name} ?`,
            message: 'La personne pourra de nouveau se connecter.',
            confirmLabel: 'Réactiver',
            tone: 'success',
          },
    )
    if (!accepted) return
    setEnCours(true)
    try {
      await userService.update(user._id, { isActive: !user.isActive })
      success(user.isActive ? `Compte de ${user.name} désactivé.` : `Compte de ${user.name} réactivé.`)
      await fetchUsers()
    } catch {
      showError('Modification de l’accès impossible.')
    } finally {
      setEnCours(false)
    }
  }

  const handleDelete = async (user: UserData) => {
    if (estMoi || nomSaisi.trim() !== user.name.trim()) return
    setEnCours(true)
    try {
      await userService.delete(user._id)
      success(`Compte de ${user.name} supprimé.`)
      setSuppression(false)
      setNomSaisi('')
      await fetchUsers()
    } catch (error) {
      showError(messageErreur(error, 'Suppression impossible.'))
    } finally {
      setEnCours(false)
    }
  }

  const modifie = !!ouvert && (formData.name.trim() !== ouvert.name || formData.phone.trim() !== (ouvert.phone || ''))

  return (
    <div className="mme">
      <header className="mme-head">
        <dl className="mme-stats">
          <div>
            <dt>Comptes</dt>
            <dd>{chiffres.total}</dd>
          </div>
          <div>
            <dt>Administrateurs</dt>
            <dd>{chiffres.admins}</dd>
          </div>
          <div>
            <dt>Actifs</dt>
            <dd>{chiffres.actifs}</dd>
          </div>
          <div>
            <dt>Désactivés</dt>
            <dd>{chiffres.inactifs}</dd>
          </div>
          <div>
            <dt>Inscrits ce mois</dt>
            <dd>{chiffres.ceMois}</dd>
          </div>
        </dl>
        <Link to="/register" className="btn btn-primary btn-small mme-creer">
          <UserPlus size={16} aria-hidden="true" /> Créer un compte
        </Link>
      </header>

      <div className="mme-filtres">
        <TypeChips label="Rôle" options={ROLES} counts={comptesRoles} active={roleFilter} onChange={setRoleFilter} />
        <TypeChips label="Statut" options={STATUTS} counts={comptesStatuts} active={statutFilter} onChange={setStatutFilter} />
        <label className="mme-recherche">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nom ou e-mail"
            aria-label="Rechercher un membre par nom ou e-mail"
          />
        </label>
      </div>

      <p className="mme-compte" aria-live="polite">
        {loading ? 'Chargement des membres…' : `${visibles.length} compte(s)`}
        {!loading && total > users.length && ` · ${users.length} plus récents chargés sur ${total}`}
      </p>

      {!loading && visibles.length === 0 ? (
        <div className="mme-vide">
          <Users size={28} aria-hidden="true" />
          <p>{users.length === 0 ? 'Aucun compte pour l’instant.' : 'Aucun compte ne correspond à ces filtres.'}</p>
        </div>
      ) : (
        <ul className="mme-liste">
          {visibles.map((user) => {
            const lieu = lieuDe(user)
            const cestMoi = !!moi && (user._id === moi.id || user._id === moi._id)
            return (
              <li key={user._id}>
                <button
                  type="button"
                  className={`mme-ligne${user.isActive ? '' : ' is-inactif'}`}
                  aria-haspopup="dialog"
                  onClick={(e) => ouvrir(user, e.currentTarget)}
                >
                  <span className={`mme-avatar mme-avatar--${user.role}`} aria-hidden="true">
                    {initiales(user.name)}
                  </span>
                  <span className="mme-identite">
                    <strong>
                      {user.name}
                      {cestMoi && <span className="mme-moi"> (vous)</span>}
                    </strong>
                    <span className="mme-email">{user.email}</span>
                  </span>
                  <span className="mme-badges">
                    <span className={`mme-badge mme-badge--${user.role}`}>{user.role === 'admin' ? 'Administrateur' : 'Membre'}</span>
                    <span className={`mme-badge ${user.isActive ? 'mme-badge--actif' : 'mme-badge--inactif'}`}>
                      {user.isActive ? 'Actif' : 'Désactivé'}
                    </span>
                  </span>
                  <span className="mme-lieu">
                    {lieu && (
                      <>
                        <MapPin size={14} aria-hidden="true" /> {lieu}
                      </>
                    )}
                  </span>
                  <span className="mme-date">
                    <span className="sr-only">Inscrit le </span>
                    {dateCourte(user.createdAt)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {ouvert && (
        <div className="mme-voile" onClick={fermer}>
          <aside
            ref={panneauRef}
            className="mme-panneau"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mme-panneau-titre"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mme-panneau-head">
              <span className={`mme-avatar mme-avatar--grand mme-avatar--${ouvert.role}`} aria-hidden="true">
                {initiales(ouvert.name)}
              </span>
              <div className="mme-panneau-titre">
                <h3 id="mme-panneau-titre">{ouvert.name}</h3>
                <p>{ouvert.email}</p>
                <span className="mme-badges">
                  <span className={`mme-badge mme-badge--${ouvert.role}`}>{ouvert.role === 'admin' ? 'Administrateur' : 'Membre'}</span>
                  <span className={`mme-badge ${ouvert.isActive ? 'mme-badge--actif' : 'mme-badge--inactif'}`}>
                    {ouvert.isActive ? 'Actif' : 'Désactivé'}
                  </span>
                  {estMoi && <span className="mme-badge">Votre compte</span>}
                </span>
              </div>
              <button ref={fermerRef} type="button" className="mme-fermer" onClick={fermer} aria-label="Fermer le panneau">
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <section className="mme-bloc" aria-labelledby="mme-infos">
              <h4 id="mme-infos">Informations</h4>
              <dl className="mme-details">
                <div>
                  <dt>Inscription</dt>
                  <dd>{dateCourte(ouvert.createdAt)}</dd>
                </div>
                {ouvert.updatedAt && (
                  <div>
                    <dt>Dernière modification</dt>
                    <dd>{dateCourte(ouvert.updatedAt)}</dd>
                  </div>
                )}
                {lieuDe(ouvert) && (
                  <div>
                    <dt>Lieu</dt>
                    <dd>{lieuDe(ouvert)}</dd>
                  </div>
                )}
              </dl>
              <form onSubmit={handleSubmit} className="mme-form">
                <div className="form-group">
                  <label htmlFor="mme-nom">Nom</label>
                  <input
                    id="mme-nom"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    autoComplete="off"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="mme-tel">Téléphone</label>
                  <input
                    id="mme-tel"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <p className="mme-aide">L’e-mail sert d’identifiant de connexion : il ne se modifie pas ici.</p>
                <button type="submit" className="btn btn-outline btn-small" disabled={enCours || !modifie || !formData.name.trim()}>
                  Enregistrer
                </button>
              </form>
            </section>

            <section className="mme-bloc" aria-labelledby="mme-role">
              <h4 id="mme-role">Rôle</h4>
              <div className="mme-segment" role="group" aria-labelledby="mme-role">
                <button
                  type="button"
                  aria-pressed={ouvert.role === 'user'}
                  disabled={enCours || estMoi}
                  onClick={() => changerRole('user')}
                >
                  Membre
                </button>
                <button type="button" aria-pressed={ouvert.role === 'admin'} disabled={enCours} onClick={() => changerRole('admin')}>
                  <ShieldCheck size={16} aria-hidden="true" /> Administrateur
                </button>
              </div>
              {estMoi && <p className="mme-aide">Vous ne pouvez pas retirer vos propres droits d’administration.</p>}
            </section>

            <section className="mme-bloc" aria-labelledby="mme-acces">
              <h4 id="mme-acces">Accès</h4>
              <p className="mme-aide">
                {ouvert.isActive ? 'Le compte peut se connecter.' : 'Le compte ne peut plus se connecter.'}
              </p>
              <button
                type="button"
                className={`btn btn-small ${ouvert.isActive ? 'btn-danger' : 'btn-primary'}`}
                disabled={enCours || (estMoi && ouvert.isActive)}
                onClick={() => handleToggleActive(ouvert)}
              >
                {ouvert.isActive ? <Ban size={16} aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />}
                {ouvert.isActive ? 'Désactiver le compte' : 'Réactiver le compte'}
              </button>
              {estMoi && <p className="mme-aide">Vous ne pouvez pas désactiver votre propre compte.</p>}
            </section>

            <section className="mme-bloc mme-bloc--danger" aria-labelledby="mme-suppr">
              <h4 id="mme-suppr">Supprimer le compte</h4>
              <p className="mme-aide">
                Le compte est fermé et ne peut plus se connecter. Le serveur conserve la fiche du membre (désactivée) et son historique.
              </p>
              {estMoi ? (
                <p className="mme-aide">Vous ne pouvez pas supprimer votre propre compte.</p>
              ) : !suppression ? (
                <button type="button" className="btn btn-danger btn-small" disabled={enCours} onClick={() => setSuppression(true)}>
                  <Trash2 size={16} aria-hidden="true" /> Supprimer…
                </button>
              ) : (
                <div className="mme-suppr">
                  <div className="form-group">
                    <label htmlFor="mme-confirm-nom">
                      Pour confirmer, saisissez le nom du membre : <strong>{ouvert.name}</strong>
                    </label>
                    <input
                      id="mme-confirm-nom"
                      value={nomSaisi}
                      onChange={(e) => setNomSaisi(e.target.value)}
                      autoComplete="off"
                      autoFocus
                    />
                  </div>
                  <div className="mme-actions">
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      disabled={enCours || nomSaisi.trim() !== ouvert.name.trim()}
                      onClick={() => handleDelete(ouvert)}
                    >
                      <Trash2 size={16} aria-hidden="true" /> Confirmer la suppression
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-small"
                      onClick={() => {
                        setSuppression(false)
                        setNomSaisi('')
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </section>
          </aside>
        </div>
      )}
      {Dialog}
    </div>
  )
}
