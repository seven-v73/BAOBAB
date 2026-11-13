import { useEffect, useState } from 'react'
import { contributionService } from '../../services/api'
import { useNotifications } from '../../hooks/useNotifications'
import './AdminContributions.css'

interface Contribution {
  _id: string
  type: string
  title: string
  content: string
  countryName?: string
  language?: string
  status: string
  visibility: string
  sourceUrl?: string
  mediaUrl?: string
  submittedBy?: { name: string }
  createdAt: string
}

const statusLabels: Record<string, string> = {
  proposed: 'Proposé',
  'in-review': 'En vérification',
  approved: 'Validé',
  rejected: 'Rejeté',
}

export const AdminContributions = () => {
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const { success, error } = useNotifications()

  const fetchContributions = async () => {
    try {
      setLoading(true)
      const response = await contributionService.getAll({ status, limit: 100 })
      setContributions(response.data.contributions || [])
    } catch (fetchError) {
      console.error('Erreur contributions admin:', fetchError)
      error('Impossible de charger les contributions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContributions()
  }, [status])

  const changeStatus = async (id: string, nextStatus: string) => {
    try {
      await contributionService.updateStatus(id, { status: nextStatus })
      success('Contribution modérée')
      fetchContributions()
    } catch (statusError) {
      console.error('Erreur modération:', statusError)
      error('Impossible de modifier le statut')
    }
  }

  return (
    <div className="admin-contributions">
      <div className="admin-contributions-head">
        <div>
          <h2>Contributions communautaires</h2>
          <p>Valider les savoirs proposés avant publication.</p>
        </div>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">Tous les statuts</option>
          <option value="proposed">Proposées</option>
          <option value="in-review">En vérification</option>
          <option value="approved">Validées</option>
          <option value="rejected">Rejetées</option>
        </select>
      </div>

      {loading ? <p>Chargement...</p> : (
        <div className="admin-contributions-list">
          {contributions.map((contribution) => (
            <article key={contribution._id}>
              <div className="admin-contribution-meta">
                <span>{contribution.type}</span>
                <strong>{statusLabels[contribution.status] || contribution.status}</strong>
                {contribution.countryName && <span>{contribution.countryName}</span>}
                {contribution.language && <span>{contribution.language}</span>}
              </div>
              <h3>{contribution.title}</h3>
              <p>{contribution.content}</p>
              <small>
                Proposé par {contribution.submittedBy?.name || 'membre'} · {new Date(contribution.createdAt).toLocaleDateString('fr-FR')}
              </small>
              <div className="admin-contribution-links">
                {contribution.sourceUrl && <a href={contribution.sourceUrl} target="_blank" rel="noreferrer">Source</a>}
                {contribution.mediaUrl && <a href={contribution.mediaUrl} target="_blank" rel="noreferrer">Média</a>}
              </div>
              <div className="admin-contribution-actions">
                <button type="button" onClick={() => changeStatus(contribution._id, 'in-review')}>Vérifier</button>
                <button type="button" onClick={() => changeStatus(contribution._id, 'approved')}>Valider</button>
                <button type="button" onClick={() => changeStatus(contribution._id, 'rejected')}>Rejeter</button>
              </div>
            </article>
          ))}
          {contributions.length === 0 && <p>Aucune contribution pour ce filtre.</p>}
        </div>
      )}
    </div>
  )
}
