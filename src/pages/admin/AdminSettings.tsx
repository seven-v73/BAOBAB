import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, Bell, CheckCircle2, Eye, Globe, Info, Plus, RotateCcw, Save, Trash2, Users, Wrench } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { useNotifications } from '../../hooks/useNotifications'
import { MediaUpload } from '../../components/Community/MediaUpload'
import './AdminSettings.css'

// Paramètres de la plateforme : un document unique côté serveur (GET/PUT /api/settings).
// Les groupes se modifient librement ; une seule barre enregistre ce qui a changé.

type Reglages = NonNullable<ReturnType<typeof useSettingsStore.getState>['settings']>
type Membre = Reglages['team'][number]
type GroupeId = 'identite' | 'equipe' | 'notifications' | 'maintenance'

const DEFAUTS: Reglages = {
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
      profileUrl: '',
    },
    {
      name: 'Blanchard Kouassi',
      role: 'Référent Digital et Créateur de Contenu',
      nationality: 'Côte d’Ivoire',
      flag: 'https://flagcdn.com/w80/ci.png',
      image: '/Equipe/Blanchard%20Kouassi.jpeg',
      focus: 'center 35%',
      profileUrl: '',
    },
    {
      name: 'Dieudonné Dara',
      role: 'Développeur Fullstack et Designer',
      nationality: 'Mali',
      flag: 'https://flagcdn.com/w80/ml.png',
      image: '/Equipe/Dieudonn%C3%A9%20Dara.jpeg',
      focus: 'center 34%',
      profileUrl: '',
    },
  ],
}

const GROUPES: Array<{ id: GroupeId; label: string; icon: LucideIcon }> = [
  { id: 'identite', label: 'Identité', icon: Globe },
  { id: 'equipe', label: 'Équipe', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
]

const NOTIFICATIONS: Array<{ cle: keyof Reglages['notifications']; label: string; aide: string }> = [
  { cle: 'email', label: 'Notifications par e-mail', aide: 'Recevoir les alertes de l’administration par e-mail.' },
  { cle: 'newUsers', label: 'Nouveaux membres', aide: 'Être prévenu à chaque inscription.' },
  { cle: 'newOrders', label: 'Nouvelles commandes', aide: 'Être prévenu à chaque commande passée.' },
  { cle: 'newPosts', label: 'Nouveaux messages', aide: 'Être prévenu des messages publiés par les membres.' },
]

const CADRAGES = [
  { value: '20%', label: 'Visage haut' },
  { value: '30%', label: 'Haut du portrait' },
  { value: '35%', label: 'Portrait naturel' },
  { value: '45%', label: 'Centré' },
  { value: '60%', label: 'Plus bas' },
]

const MEMBRE_VIDE: Membre = { name: '', role: '', nationality: '', flag: '', image: '', focus: 'center 35%', profileUrl: '' }

const EMAIL_VALIDE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const memes = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

const sectionId = (id: GroupeId) => `mpa-${id}`

export const AdminSettings = () => {
  const { showError, success } = useNotifications()
  const { settings, loading, fetchSettings, updateSettings: updateStoreSettings } = useSettingsStore()
  const [saving, setSaving] = useState(false)
  // Brouillon : null tant que rien n'a été touché, sinon la version en cours d'édition
  const [draft, setDraft] = useState<Reglages | null>(null)
  const [actif, setActif] = useState<GroupeId>('identite')
  const [retour, setRetour] = useState<{ type: 'succes' | 'erreur'; message: string } | null>(null)
  const [tentative, setTentative] = useState(false)
  const groupesRef = useRef<Partial<Record<GroupeId, HTMLElement | null>>>({})

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const base = settings ?? DEFAUTS
  const valeurs = draft ?? base

  const modifier = useCallback(
    (maj: (courant: Reglages) => Reglages) => {
      setRetour((r) => (r?.type === 'succes' ? null : r))
      setDraft((prev) => maj(prev ?? base))
    },
    [base],
  )

  // Groupes modifiés par rapport à la version enregistrée
  const modifies = useMemo(() => {
    const result: Record<GroupeId, boolean> = { identite: false, equipe: false, notifications: false, maintenance: false }
    if (!draft) return result
    result.identite =
      draft.platformName !== base.platformName || draft.contactEmail !== base.contactEmail || draft.description !== base.description
    result.equipe = !memes(draft.team, base.team)
    result.notifications = !memes(draft.notifications, base.notifications)
    result.maintenance = !memes(draft.maintenance, base.maintenance)
    return result
  }, [draft, base])

  const groupesModifies = GROUPES.filter((g) => modifies[g.id])
  const dirty = groupesModifies.length > 0

  const erreurs = {
    platformName: valeurs.platformName.trim() ? '' : 'Indiquez un nom : il remplace le nom par défaut partout sur le site.',
    contactEmail: EMAIL_VALIDE.test(valeurs.contactEmail.trim()) ? '' : 'Saisissez une adresse e-mail valide, par exemple contact@monbaobab.com.',
  }
  const invalide = Boolean(erreurs.platformName || erreurs.contactEmail)

  // Prévenir avant de quitter la page avec des modifications en cours
  useEffect(() => {
    if (!dirty) return
    const avertir = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', avertir)
    return () => window.removeEventListener('beforeunload', avertir)
  }, [dirty])

  // Le message de succès s'efface de lui-même
  useEffect(() => {
    if (retour?.type !== 'succes') return
    const timer = window.setTimeout(() => setRetour(null), 4000)
    return () => window.clearTimeout(timer)
  }, [retour])

  // Sommaire : pastille sur le groupe visible
  const pret = Boolean(settings) || !loading
  useEffect(() => {
    if (!pret || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setActif(visible.target.getAttribute('data-groupe') as GroupeId)
      },
      { rootMargin: '-20% 0px -65% 0px' },
    )
    Object.values(groupesRef.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [pret])

  const allerA = (id: GroupeId) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    const el = groupesRef.current[id]
    if (!el) return
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'start' })
    el.querySelector<HTMLElement>('h3')?.focus({ preventScroll: true })
    setActif(id)
  }

  const annuler = () => {
    setDraft(null)
    setTentative(false)
    setRetour(null)
  }

  const enregistrer = async (event?: React.FormEvent) => {
    event?.preventDefault()
    if (!draft || !dirty || saving) return
    setTentative(true)
    if (invalide) {
      setRetour({ type: 'erreur', message: 'Vérifiez les champs signalés dans Identité.' })
      groupesRef.current.identite?.scrollIntoView({ block: 'start' })
      return
    }

    const updates: Parameters<typeof updateStoreSettings>[0] = {}
    if (modifies.identite) {
      updates.platformName = draft.platformName
      updates.contactEmail = draft.contactEmail
      updates.description = draft.description
    }
    if (modifies.notifications) updates.notifications = draft.notifications
    if (modifies.maintenance) updates.maintenance = draft.maintenance
    if (modifies.equipe) updates.team = draft.team.filter((member) => member.name.trim())

    try {
      setSaving(true)
      setRetour(null)
      await updateStoreSettings(updates)
      // Recharger les paramètres pour s'assurer que tout est synchronisé
      await fetchSettings()
      const liste = groupesModifies.map((g) => g.label).join(', ')
      setDraft(null)
      setTentative(false)
      setRetour({ type: 'succes', message: `Modifications enregistrées : ${liste}.` })
      success('Paramètres enregistrés avec succès')
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erreur lors de l’enregistrement'
      showError(message)
      setRetour({ type: 'erreur', message })
    } finally {
      setSaving(false)
    }
  }

  // Équipe
  const updateTeamMember = (index: number, field: keyof Membre, value: string) => {
    modifier((courant) => ({
      ...courant,
      team: courant.team.map((member, i) => (i === index ? { ...member, [field]: value } : member)),
    }))
  }

  const updateTeamFocus = (index: number, verticalFocus: string) => {
    updateTeamMember(index, 'focus', `center ${verticalFocus}`)
  }

  const addTeamMember = () => {
    modifier((courant) => ({ ...courant, team: [...courant.team, { ...MEMBRE_VIDE }] }))
  }

  const removeTeamMember = (index: number) => {
    modifier((courant) => ({ ...courant, team: courant.team.filter((_, itemIndex) => itemIndex !== index) }))
  }

  if (loading && !settings) {
    return (
      <div className="mpa">
        <p className="mpa-chargement" role="status">
          Chargement des paramètres…
        </p>
      </div>
    )
  }

  const montrerErreur = (champ: keyof typeof erreurs) => (tentative || valeurs[champ] !== base[champ]) && erreurs[champ]
  const nom = valeurs.platformName.trim() || 'MonBaobab'
  const annee = new Date().getFullYear()
  const sansNom = valeurs.team.filter((m) => !m.name.trim()).length

  return (
    <form className="mpa" onSubmit={enregistrer} noValidate>
      <div className="mpa-grille">
        <nav className="mpa-sommaire" aria-label="Groupes de paramètres">
          <p className="mpa-sommaire-titre">Sur cette page</p>
          <ul>
            {GROUPES.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <a
                  href={`#${sectionId(id)}`}
                  className={actif === id ? 'is-actif' : undefined}
                  aria-current={actif === id ? 'true' : undefined}
                  onClick={allerA(id)}
                >
                  <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                  <span>{label}</span>
                  {modifies[id] && (
                    <span className="mpa-point" title="Modifié, non enregistré">
                      <span className="sr-only">(modifié)</span>
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
          <p className="mpa-sommaire-note">Les réglages s’appliquent à tout le site dès l’enregistrement.</p>
        </nav>

        <div className="mpa-groupes">
          {/* ---------- Identité ---------- */}
          <section
            id={sectionId('identite')}
            data-groupe="identite"
            ref={(el) => {
              groupesRef.current.identite = el
            }}
            className="mpa-groupe mpa-groupe--identite"
            aria-labelledby="mpa-t-identite"
          >
            <div className="mpa-groupe-corps">
              <header className="mpa-groupe-tete">
                <span className="mpa-picto" aria-hidden="true">
                  <Globe size={20} strokeWidth={1.8} />
                </span>
                <div>
                  <h3 id="mpa-t-identite" tabIndex={-1}>
                    Identité de la plateforme
                  </h3>
                  <p>Le nom et le contact que voient les visiteurs, dans la barre du haut, le pied de page et les pages d’aide.</p>
                </div>
              </header>

              <div className="mpa-champ">
                <label htmlFor="mpa-nom">Nom de la plateforme</label>
                <input
                  id="mpa-nom"
                  value={valeurs.platformName}
                  onChange={(e) => modifier((c) => ({ ...c, platformName: e.target.value }))}
                  aria-describedby={`mpa-nom-aide${montrerErreur('platformName') ? ' mpa-nom-err' : ''}`}
                  aria-invalid={montrerErreur('platformName') ? true : undefined}
                  required
                />
                <p id="mpa-nom-aide" className="mpa-aide">
                  Repris dans le logo (texte alternatif), le pied de page, les pages de connexion et l’administration.
                </p>
                {montrerErreur('platformName') && (
                  <p id="mpa-nom-err" className="mpa-erreur">
                    <AlertTriangle size={14} aria-hidden="true" /> {erreurs.platformName}
                  </p>
                )}
              </div>

              <div className="mpa-champ">
                <label htmlFor="mpa-email">E-mail de contact</label>
                <input
                  id="mpa-email"
                  type="email"
                  value={valeurs.contactEmail}
                  onChange={(e) => modifier((c) => ({ ...c, contactEmail: e.target.value }))}
                  autoComplete="email"
                  aria-describedby={`mpa-email-aide${montrerErreur('contactEmail') ? ' mpa-email-err' : ''}`}
                  aria-invalid={montrerErreur('contactEmail') ? true : undefined}
                  required
                />
                <p id="mpa-email-aide" className="mpa-aide">
                  Lien « Contact » du pied de page, aide au mot de passe oublié et signalement d’un article.
                </p>
                {montrerErreur('contactEmail') && (
                  <p id="mpa-email-err" className="mpa-erreur">
                    <AlertTriangle size={14} aria-hidden="true" /> {erreurs.contactEmail}
                  </p>
                )}
              </div>

              <div className="mpa-champ">
                <div className="mpa-champ-ligne">
                  <label htmlFor="mpa-description">Description</label>
                  <span className="mpa-compteur" aria-hidden="true">
                    {valeurs.description.length} caractères
                  </span>
                </div>
                <textarea
                  id="mpa-description"
                  name="description"
                  value={valeurs.description}
                  onChange={(e) => modifier((c) => ({ ...c, description: e.target.value }))}
                  rows={3}
                  aria-describedby="mpa-description-aide"
                />
                <p id="mpa-description-aide" className="mpa-aide">
                  Une phrase qui présente la plateforme. Elle est enregistrée mais n’est pas encore affichée sur le site public.
                </p>
              </div>
            </div>

            <aside className="mpa-apercu" aria-labelledby="mpa-apercu-titre">
              <p id="mpa-apercu-titre" className="mpa-apercu-titre">
                <Eye size={15} aria-hidden="true" /> Aperçu, pied de page
              </p>
              <div className="mpa-pied" aria-hidden="true">
                <img src="/Logo/Fichier%207.svg" alt="" width="96" height="32" />
                <p className="mpa-pied-accroche">L’Afrique à découvrir autrement.</p>
                <div className="mpa-pied-colonne">
                  <span className="mpa-pied-rubrique">MonBaobab</span>
                  <span>À propos</span>
                  <span>Manifeste</span>
                  <span className="mpa-pied-contact" title={valeurs.contactEmail}>
                    Contact
                    <small>{valeurs.contactEmail || 'aucune adresse'}</small>
                  </span>
                </div>
                <p className="mpa-pied-bas">
                  © {annee} {nom}. Une plateforme culturelle pour explorer, comprendre et transmettre.
                </p>
              </div>
              <div className="mpa-apercu-description">
                <span className="mpa-apercu-label">Description</span>
                <p>{valeurs.description.trim() || 'Aucune description.'}</p>
                <span className="mpa-etiquette">Pas encore affichée sur le site</span>
              </div>
            </aside>
          </section>

          {/* ---------- Équipe ---------- */}
          <section
            id={sectionId('equipe')}
            data-groupe="equipe"
            ref={(el) => {
              groupesRef.current.equipe = el
            }}
            className="mpa-groupe"
            aria-labelledby="mpa-t-equipe"
          >
            <header className="mpa-groupe-tete">
              <span className="mpa-picto" aria-hidden="true">
                <Users size={20} strokeWidth={1.8} />
              </span>
              <div>
                <h3 id="mpa-t-equipe" tabIndex={-1}>
                  Équipe
                </h3>
                <p>Les personnes présentées sur l’accueil, dans « Les personnes derrière MonBaobab », dans cet ordre.</p>
              </div>
              <button type="button" className="btn btn-outline btn-small mpa-ajouter" onClick={addTeamMember}>
                <Plus size={16} aria-hidden="true" /> Ajouter un membre
              </button>
            </header>

            {valeurs.team.length === 0 && <p className="mpa-vide">Aucun membre : la rubrique Équipe est masquée sur l’accueil.</p>}

            <ul className="mpa-equipe">
              {valeurs.team.map((member, index) => {
                const p = `mpa-m${index}`
                return (
                  <li key={index} className="mpa-membre">
                    <div className="mpa-membre-tete">
                      <div className="mpa-portrait">
                        {member.image ? (
                          <img src={member.image} alt="" style={{ objectPosition: member.focus || 'center 35%' }} />
                        ) : (
                          <span>Photo</span>
                        )}
                        {member.flag && <img src={member.flag} alt="" className="mpa-drapeau" />}
                      </div>
                      <div className="mpa-membre-id">
                        <strong>{member.name.trim() || 'Nouveau membre'}</strong>
                        <span>{[member.role, member.nationality].filter(Boolean).join(' · ') || 'Poste et pays à préciser'}</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-small mpa-retirer"
                        onClick={() => removeTeamMember(index)}
                        aria-label={`Retirer ${member.name || 'ce membre'}`}
                        title="Retirer"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>

                    <div className="mpa-membre-champs">
                      <div className="mpa-champ">
                        <label htmlFor={`${p}-nom`}>Nom</label>
                        <input
                          id={`${p}-nom`}
                          value={member.name}
                          onChange={(event) => updateTeamMember(index, 'name', event.target.value)}
                          placeholder="Nom complet"
                        />
                      </div>
                      <div className="mpa-champ">
                        <label htmlFor={`${p}-poste`}>Poste</label>
                        <input
                          id={`${p}-poste`}
                          value={member.role}
                          onChange={(event) => updateTeamMember(index, 'role', event.target.value)}
                          placeholder="Poste ou responsabilité"
                        />
                      </div>
                      <div className="mpa-champ">
                        <label htmlFor={`${p}-pays`}>Nationalité</label>
                        <input
                          id={`${p}-pays`}
                          value={member.nationality}
                          onChange={(event) => updateTeamMember(index, 'nationality', event.target.value)}
                          placeholder="Pays"
                        />
                      </div>
                      <div className="mpa-champ">
                        <label htmlFor={`${p}-drapeau`}>Drapeau</label>
                        <input
                          id={`${p}-drapeau`}
                          value={member.flag}
                          onChange={(event) => updateTeamMember(index, 'flag', event.target.value)}
                          placeholder="https://flagcdn.com/w80/bf.png"
                          aria-describedby={`${p}-drapeau-aide`}
                        />
                        <p id={`${p}-drapeau-aide`} className="mpa-aide">
                          Adresse d’une petite image du drapeau.
                        </p>
                      </div>
                      <div className="mpa-champ mpa-champ--large">
                        <label htmlFor={`${p}-profil`}>Lien du profil</label>
                        <input
                          id={`${p}-profil`}
                          value={member.profileUrl || ''}
                          onChange={(event) => updateTeamMember(index, 'profileUrl', event.target.value)}
                          placeholder="https://github.com/…, https://linkedin.com/in/… ou portfolio"
                        />
                      </div>
                      <div className="mpa-champ mpa-champ--large mpa-photo">
                        <MediaUpload
                          type="image"
                          value={member.image}
                          label="Photo"
                          onChange={(url) => updateTeamMember(index, 'image', url)}
                          onRemove={() => updateTeamMember(index, 'image', '')}
                        />
                      </div>
                      <div className="mpa-champ">
                        <label htmlFor={`${p}-image`}>Chemin ou URL de la photo</label>
                        <input
                          id={`${p}-image`}
                          value={member.image}
                          onChange={(event) => updateTeamMember(index, 'image', event.target.value)}
                          placeholder="/Equipe/photo.jpeg ou URL"
                        />
                      </div>
                      <div className="mpa-champ">
                        <label htmlFor={`${p}-cadrage`}>Cadrage vertical</label>
                        <select
                          id={`${p}-cadrage`}
                          value={(member.focus || 'center 35%').replace('center ', '')}
                          onChange={(event) => updateTeamFocus(index, event.target.value)}
                          aria-describedby={`${p}-cadrage-aide`}
                        >
                          {CADRAGES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <p id={`${p}-cadrage-aide`} className="mpa-aide">
                          Partie du portrait gardée visible dans la vignette.
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
            {sansNom > 0 && (
              <p className="mpa-note">
                <Info size={16} aria-hidden="true" /> Un membre sans nom n’est pas enregistré.
              </p>
            )}
          </section>

          {/* ---------- Notifications ---------- */}
          <section
            id={sectionId('notifications')}
            data-groupe="notifications"
            ref={(el) => {
              groupesRef.current.notifications = el
            }}
            className="mpa-groupe"
            aria-labelledby="mpa-t-notifications"
          >
            <header className="mpa-groupe-tete">
              <span className="mpa-picto" aria-hidden="true">
                <Bell size={20} strokeWidth={1.8} />
              </span>
              <div>
                <h3 id="mpa-t-notifications" tabIndex={-1}>
                  Notifications
                </h3>
                <p>Les événements dont l’équipe d’administration souhaite être avertie.</p>
              </div>
            </header>
            <ul className="mpa-bascules">
              {NOTIFICATIONS.map(({ cle, label, aide }) => (
                <li key={cle}>
                  <label className="mpa-bascule" htmlFor={`mpa-notif-${cle}`}>
                    <span className="mpa-bascule-texte">
                      <strong>{label}</strong>
                      <span id={`mpa-notif-${cle}-aide`}>{aide}</span>
                    </span>
                    <input
                      id={`mpa-notif-${cle}`}
                      type="checkbox"
                      role="switch"
                      checked={valeurs.notifications[cle]}
                      aria-describedby={`mpa-notif-${cle}-aide`}
                      onChange={(e) =>
                        modifier((c) => ({ ...c, notifications: { ...c.notifications, [cle]: e.target.checked } }))
                      }
                    />
                  </label>
                </li>
              ))}
            </ul>
            <p className="mpa-note">
              <Info size={16} aria-hidden="true" /> Ces préférences sont enregistrées, mais aucun envoi ne s’en sert encore.
            </p>
          </section>

          {/* ---------- Maintenance ---------- */}
          <section
            id={sectionId('maintenance')}
            data-groupe="maintenance"
            ref={(el) => {
              groupesRef.current.maintenance = el
            }}
            className="mpa-groupe"
            aria-labelledby="mpa-t-maintenance"
          >
            <header className="mpa-groupe-tete">
              <span className="mpa-picto" aria-hidden="true">
                <Wrench size={20} strokeWidth={1.8} />
              </span>
              <div>
                <h3 id="mpa-t-maintenance" tabIndex={-1}>
                  Maintenance
                </h3>
                <p>Le message à présenter aux visiteurs pendant une intervention sur le site.</p>
              </div>
            </header>
            <ul className="mpa-bascules">
              <li>
                <label className="mpa-bascule" htmlFor="mpa-maintenance">
                  <span className="mpa-bascule-texte">
                    <strong>Mode maintenance</strong>
                    <span id="mpa-maintenance-aide">{valeurs.maintenance.enabled ? 'Activé.' : 'Désactivé.'}</span>
                  </span>
                  <input
                    id="mpa-maintenance"
                    type="checkbox"
                    role="switch"
                    checked={valeurs.maintenance.enabled}
                    aria-describedby="mpa-maintenance-aide"
                    onChange={(e) => modifier((c) => ({ ...c, maintenance: { ...c.maintenance, enabled: e.target.checked } }))}
                  />
                </label>
              </li>
            </ul>
            <div className="mpa-champ">
              <label htmlFor="mpa-maintenance-message">Message de maintenance</label>
              <textarea
                id="mpa-maintenance-message"
                value={valeurs.maintenance.message}
                onChange={(e) => modifier((c) => ({ ...c, maintenance: { ...c.maintenance, message: e.target.value } }))}
                rows={3}
                aria-describedby="mpa-maintenance-message-aide"
              />
              <p id="mpa-maintenance-message-aide" className="mpa-aide">
                Court et rassurant : ce qui se passe et quand revenir.
              </p>
            </div>
            <p className="mpa-note mpa-note--attention">
              <AlertTriangle size={16} aria-hidden="true" /> Le site public ne lit pas encore ce réglage : l’activer ne ferme pas le site.
            </p>
          </section>
        </div>
      </div>

      {/* ---------- Barre d'enregistrement ---------- */}
      <div className="mpa-barre-zone" aria-live="polite">
        {(dirty || retour) && (
          <div className={`mpa-barre${retour?.type === 'erreur' ? ' is-erreur' : ''}${!dirty && retour?.type === 'succes' ? ' is-succes' : ''}`}>
            {dirty ? (
              <p className="mpa-barre-etat">
                {retour?.type === 'erreur' ? (
                  <AlertTriangle size={18} aria-hidden="true" />
                ) : (
                  <span className="mpa-barre-point" aria-hidden="true" />
                )}
                <span>
                  <strong>{retour?.type === 'erreur' ? 'Enregistrement impossible' : 'Modifications non enregistrées'}</strong>
                  <small>
                    {retour?.type === 'erreur' ? retour.message : groupesModifies.map((g) => g.label).join(', ')}
                  </small>
                </span>
              </p>
            ) : (
              <p className="mpa-barre-etat">
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>
                  <strong>{retour?.message}</strong>
                </span>
              </p>
            )}
            {dirty && (
              <div className="mpa-barre-actions">
                <button type="button" className="btn btn-ghost btn-small" onClick={annuler} disabled={saving}>
                  <RotateCcw size={16} aria-hidden="true" /> Annuler
                </button>
                <button type="submit" className="btn btn-primary btn-small" disabled={saving}>
                  <Save size={16} aria-hidden="true" /> {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </form>
  )
}
