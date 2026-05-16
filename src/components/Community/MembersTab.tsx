import { useState, useEffect } from 'react'
import { Users, Shield, UserCheck, UserX, Ban, Unlock, Crown, Settings, X, Mail } from 'lucide-react'
import { communityService } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'
import { useNotifications } from '../../hooks/useNotifications'
import { useConfirmDialog } from '../UX/ConfirmDialog'
import './MembersTab.css'

interface Member {
  _id: string
  user: {
    _id: string
    name: string
    avatar?: string
    email: string
  }
  role: 'owner' | 'admin' | 'moderator' | 'member'
  status: 'active' | 'pending' | 'banned' | 'left'
  joinedAt: string
}

interface MembersTabProps {
  communityId: string
  currentUserRole?: 'owner' | 'admin' | 'moderator' | 'member'
  isOwner: boolean
  isAdmin: boolean
}

export const MembersTab = ({ communityId, isOwner, isAdmin }: MembersTabProps) => {
  const { user } = useAuthStore()
  const { success, error: showError } = useNotifications()
  const { confirm, Dialog } = useConfirmDialog()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRoleMenu, setShowRoleMenu] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'banned'>('all')

  useEffect(() => {
    fetchMembers()
  }, [communityId])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await communityService.getCommunityMembers(communityId)
      // Le backend retourne { members, pagination }
      setMembers(response.data?.members || response.data || [])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement des membres')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'moderator' | 'member') => {
    try {
      await communityService.updateMemberRole(communityId, memberId, newRole)
      await fetchMembers()
      setShowRoleMenu(null)
      success('Rôle mis à jour.')
    } catch (err: any) {
      showError(err.response?.data?.error || 'Erreur lors de la modification du rôle')
    }
  }

  const handleTransferOwnership = async (memberId: string) => {
    const accepted = await confirm({
      title: 'Transférer la propriété ?',
      message: 'Cette action donnera la propriété de la communauté à ce membre. Elle est difficile à annuler.',
      confirmLabel: 'Transférer',
      tone: 'danger',
    })
    if (!accepted) {
      return
    }
    try {
      await communityService.updateMemberRole(communityId, memberId, 'owner')
      success('Propriété transférée.')
      window.location.reload() // Recharger pour mettre à jour les permissions
    } catch (err: any) {
      showError(err.response?.data?.error || 'Erreur lors du transfert')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    const accepted = await confirm({
      title: 'Retirer ce membre ?',
      message: 'Le membre perdra l’accès à cette communauté.',
      confirmLabel: 'Retirer',
      tone: 'danger',
    })
    if (!accepted) {
      return
    }
    try {
      await communityService.removeMember(communityId, memberId)
      await fetchMembers()
      success('Membre retiré.')
    } catch (err: any) {
      showError(err.response?.data?.error || 'Erreur lors du retrait')
    }
  }

  const handleBanMember = async (memberId: string) => {
    const accepted = await confirm({
      title: 'Bloquer ce membre ?',
      message: 'Le membre ne pourra plus participer à cette communauté.',
      confirmLabel: 'Bloquer',
      tone: 'danger',
    })
    if (!accepted) {
      return
    }
    try {
      await communityService.banMember(communityId, memberId)
      await fetchMembers()
      success('Membre bloqué.')
    } catch (err: any) {
      showError(err.response?.data?.error || 'Erreur lors du blocage')
    }
  }

  const handleUnbanMember = async (memberId: string) => {
    try {
      await communityService.unbanMember(communityId, memberId)
      await fetchMembers()
      success('Membre débloqué.')
    } catch (err: any) {
      showError(err.response?.data?.error || 'Erreur lors du déblocage')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown size={16} className="role-icon owner" />
      case 'admin':
        return <Shield size={16} className="role-icon admin" />
      case 'moderator':
        return <UserCheck size={16} className="role-icon moderator" />
      default:
        return <Users size={16} className="role-icon member" />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Propriétaire'
      case 'admin':
        return 'Administrateur'
      case 'moderator':
        return 'Modérateur'
      default:
        return 'Membre'
    }
  }

  const canManageMember = (member: Member) => {
    if (!isAdmin && !isOwner) return false
    if (member.role === 'owner') return false // Le propriétaire ne peut pas être géré
    if (isAdmin && !isOwner && ['admin', 'owner'].includes(member.role)) return false // Un admin ne peut pas gérer un autre admin
    return true
  }

  const filteredMembers = members.filter(member => {
    if (filter === 'all') return true
    if (filter === 'active') return member.status === 'active'
    if (filter === 'banned') return member.status === 'banned'
    return true
  })

  if (loading) {
    return <div className="loading">Chargement des membres...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div className="members-tab">
      <div className="members-tab-header">
        <h2>Membres ({members.length})</h2>
        <div className="members-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tous
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Actifs
          </button>
          <button
            className={`filter-btn ${filter === 'banned' ? 'active' : ''}`}
            onClick={() => setFilter('banned')}
          >
            Bloqués
          </button>
        </div>
      </div>

      <div className="members-list">
        {filteredMembers.map((member) => (
          <div key={member._id} className={`member-card ${member.status === 'banned' ? 'banned' : ''}`}>
            <div className="member-info">
              {member.user.avatar ? (
                <img src={member.user.avatar} alt={member.user.name} className="member-avatar" />
              ) : (
                <div className="member-avatar-placeholder">
                  {member.user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="member-details">
                <div className="member-name-row">
                  <span className="member-name">{member.user.name}</span>
                  {getRoleIcon(member.role)}
                  <span className="member-role">{getRoleLabel(member.role)}</span>
                </div>
                <span className="member-email">{member.user.email}</span>
                <span className="member-joined">
                  Rejoint le {new Date(member.joinedAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>

            {canManageMember(member) && (
              <div className="member-actions">
                {member.status === 'banned' ? (
                  <button
                    className="btn-icon unban"
                    onClick={() => handleUnbanMember(member.user._id)}
                    title="Débloquer"
                  >
                    <Unlock size={18} />
                  </button>
                ) : (
                  <>
                    {isOwner && member.role !== 'owner' && (
                      <div className="role-menu-container">
                        <button
                          className="btn-icon"
                          onClick={() => setShowRoleMenu(showRoleMenu === member._id ? null : member._id)}
                          title="Changer le rôle"
                        >
                          <Settings size={18} />
                        </button>
                        {showRoleMenu === member._id && (
                          <div className="role-menu">
                            <button
                              onClick={() => handleRoleChange(member.user._id, 'admin')}
                              disabled={member.role === 'admin'}
                            >
                              Promouvoir Admin
                            </button>
                            <button
                              onClick={() => handleRoleChange(member.user._id, 'moderator')}
                              disabled={member.role === 'moderator'}
                            >
                              Promouvoir Modérateur
                            </button>
                            <button
                              onClick={() => handleRoleChange(member.user._id, 'member')}
                              disabled={member.role === 'member'}
                            >
                              Rétrograder Membre
                            </button>
                            {isOwner && (
                              <button
                                className="transfer-ownership"
                                onClick={() => handleTransferOwnership(member.user._id)}
                              >
                                <Crown size={16} />
                                Transférer la propriété
                              </button>
                            )}
                            <button onClick={() => setShowRoleMenu(null)}>
                              <X size={16} />
                              Annuler
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {isAdmin && (
                      <>
                        <button
                          className="btn-icon ban"
                          onClick={() => handleBanMember(member.user._id)}
                          title="Bloquer"
                        >
                          <Ban size={18} />
                        </button>
                        <button
                          className="btn-icon remove"
                          onClick={() => handleRemoveMember(member.user._id)}
                          title="Retirer"
                        >
                          <UserX size={18} />
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {Dialog}
    </div>
  )
}
