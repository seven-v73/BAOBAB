import { Link, useLocation } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { useSeo } from '../seo/useSeo'
import './Rubriques.css'
import './NotFound.css'

/** Page 404 : une adresse inconnue l'annonce clairement (et n'est pas indexée) au lieu de renvoyer à l'accueil. */
export const NotFound = () => {
  const { pathname } = useLocation()
  useSeo({ title: 'Page introuvable', noindex: true })

  return (
    <Layout>
      <section className="mnf">
        <p className="mnf-code">404</p>
        <h1>Ce chemin ne mène nulle part.</h1>
        <p className="mnf-texte">
          L’adresse <code>{pathname}</code> ne correspond à aucune page. Elle a peut-être changé avec la nouvelle
          version du site.
        </p>
        <div className="mnf-actions">
          <Link to="/" className="mbr-button">
            Retour à l’accueil <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link to="/map" className="mbr-button mbr-button--ghost">
            Explorer les pays
          </Link>
        </div>
      </section>
    </Layout>
  )
}
