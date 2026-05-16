import { useCallback, useEffect, useState } from 'react'
import { Button } from '../../components/Button/Button'
import { communityService } from '../../services/api'
import { useNotifications } from '../../hooks/useNotifications'
import { useConfirmDialog } from '../../components/UX/ConfirmDialog'
import { EmptyState } from '../../components/UX/EmptyState'
import { Skeleton } from '../../components/UX/Skeleton'
import { CheckCircle, Search, XCircle } from 'lucide-react'
import './AdminCommunityRequests.css'

type RequestStatus = 'pending' | 'approved' | 'rejected' | 'all'

interface CommunityRequest {
  _id: string
  name: string
  description: string
  type: 'public' | 'private'
  culture?: string
  tags: string[]
  status: 'pending' | 'approved' | 'rejected'
  adminNote?: string
  createdAt: string
  requestedBy?: {
    name: string
    email: string
  }
  reviewedBy?: {
    name: string
  }
  community?: {
    name: string
  }
}

const statusLabel: Record<CommunityRequest['status'], string> = {
  pending: 'En attente',
  approved: 'Validée',
  rejected: 'Refusée',
}

export const AdminCommunityRequests = () => {
  const [requests, setRequests] = useState<CommunityRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<RequestStatus>('pending')
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const { success, error: showError } = useNotifications()
  const { confirm, requestText, Dialog } = useConfirmDialog()

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true)
      const response = await communityService.getCommunityRequests({ status, limit: 100 })
      setRequests(response.data.requests || [])
    } catch (error: any) {
      showError(error.response?.data?.error || 'Impossible de charger les demandes')
    } finally {
      setLoading(false)
    }
  }, [showError, status])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleApprove = async (request: CommunityRequest) => {
    const accepted = await confirm({
      title: `Valider "${request.name}" ?`,
      message: 'Le groupe sera publié immédiatement et le demandeur deviendra propriétaire.',
      confirmLabel: 'Valider le groupe',
      tone: 'success',
    })
    if (!accepted) return

    try {
      setBusyId(request._id)
      await communityService.approveCommunityRequest(request._id)
      success('Groupe créé et demande validée')
      fetchRequests()
    } catch (error: any) {
      showError(error.response?.data?.error || 'Impossible de valider cette demande')
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async (request: CommunityRequest) => {
    const adminNote = await requestText({
      title: `Refuser "${request.name}" ?`,
      message: 'Ajoutez une note courte pour garder une trace de la décision.',
      placeholder: 'Ex: Sujet trop proche d’un groupe existant...',
      confirmLabel: 'Refuser la demande',
      tone: 'danger',
    })
    if (adminNote === null) return

    try {
      setBusyId(request._id)
      await communityService.rejectCommunityRequest(request._id, adminNote)
      success('Demande refusée')
      fetchRequests()
    } catch (error: any) {
      showError(error.response?.data?.error || 'Impossible de refuser cette demande')
    } finally {
      setBusyId(null)
    }
  }

  const filteredRequests = requests.filter((request) => {
    const value = `${request.name} ${request.description} ${request.culture || ''} ${request.requestedBy?.name || ''} ${request.requestedBy?.email || ''}`.toLowerCase()
    return value.includes(search.toLowerCase())
  })

  const pendingCount = requests.filter(request => request.status === 'pending').length

  if (loading) {
    return <Skeleton variant="cards" count={4} label="Chargement des demandes de groupes" />
  }

  return (
    <div className="admin-community-requests">
      <div className="admin-section-header">
        <div>
          <h2>Demandes de groupes</h2>
          <p>Validez les nouveaux cercles communautaires avant leur publication.</p>
        </div>
        <div className="community-request-summary">
          <span className="summary-number">{pendingCount}</span>
          <span>à traiter</span>
        </div>
      </div>

      <div className="community-request-toolbar">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="search"
            placeholder="Rechercher une demande..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="filter-buttons">
          {(['pending', 'approved', 'rejected', 'all'] as RequestStatus[]).map((value) => (
            <Button
              key={value}
              size="small"
              variant={status === value ? 'primary' : 'outline'}
              onClick={() => setStatus(value)}
            >
              {value === 'pending' ? 'En attente' : value === 'approved' ? 'Validées' : value === 'rejected' ? 'Refusées' : 'Toutes'}
            </Button>
          ))}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <EmptyState
          title="Aucune demande pour ce filtre"
          description="Les nouvelles propositions de groupes apparaîtront ici dès qu’un membre les enverra."
          action={status !== 'all' && <Button variant="outline" size="small" onClick={() => setStatus('all')}>Voir toutes les demandes</Button>}
        />
      ) : (
        <div className="community-requests-grid">
          {filteredRequests.map((request) => (
            <article key={request._id} className="community-request-card">
              <div className="request-card-header">
                <div>
                  <span className={`request-status ${request.status}`}>{statusLabel[request.status]}</span>
                  <h3>{request.name}</h3>
                </div>
                <span className="request-type">{request.type === 'private' ? 'Privé' : 'Public'}</span>
              </div>

              <p className="request-description">{request.description}</p>

              <div className="request-meta">
                <span>Demandé par {request.requestedBy?.name || 'Utilisateur'}</span>
                {request.requestedBy?.email && <span>{request.requestedBy.email}</span>}
                {request.culture && <span>Culture : {request.culture}</span>}
                <span>{new Date(request.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>

              {request.tags.length > 0 && (
                <div className="community-tags">
                  {request.tags.slice(0, 5).map((tag) => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
              )}

              {request.adminNote && (
                <p className="request-note">Note admin : {request.adminNote}</p>
              )}

              {request.status === 'pending' && (
                <div className="request-actions">
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleApprove(request)}
                    disabled={busyId === request._id}
                  >
                    <CheckCircle size={16} />
                    Valider
                  </Button>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => handleReject(request)}
                    disabled={busyId === request._id}
                  >
                    <XCircle size={16} />
                    Refuser
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      {Dialog}
    </div>
  )
}
