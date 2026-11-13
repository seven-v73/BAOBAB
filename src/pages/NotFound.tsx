import { Link, useLocation } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { useSeo } from '../seo/useSeo'

/** Page 404 : avant la refonte, toute URL inconnue renvoyait silencieusement vers l'accueil. */
export const NotFound = () => {
  const { pathname } = useLocation()
  useSeo({ title: 'Page introuvable', noindex: true })

  return (
    <Layout>
      <div className="mb-state" style={{ marginTop: 'var(--space-6)', borderStyle: 'solid' }}>
        <p className="eyebrow">Erreur 404</p>
        <h1 style={{ fontSize: 'var(--text-2xl)' }}>Cette page n’existe pas (ou plus)</h1>
        <p>
          L’adresse <code>{pathname}</code> ne correspond à aucun contenu. Vous pouvez repartir de l’accueil ou
          explorer la carte.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-3)' }}>
          <Link to="/" className="btn">
            Retour à l’accueil
          </Link>
          <Link to="/map" className="btn btn-outline">
            Explorer la carte
          </Link>
          <Link to="/search" className="btn btn-ghost">
            Rechercher
          </Link>
        </div>
      </div>
    </Layout>
  )
}
