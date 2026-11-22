import { useLocation } from 'react-router-dom'
import { applySeo, type SeoInput } from './useSeo'
import { useEffect } from 'react'

/**
 * Balises par défaut selon la route. Les pages de détail (article, pays, personnalité…)
 * les précisent ensuite avec useSeo() une fois leurs données chargées.
 */
const staticRoutes: Record<string, SeoInput> = {
  '/': {},
  '/map': { title: 'Explorer les pays d’Afrique', description: 'Les pays d’Afrique un par un : capitales, langues, histoire, cultures, cuisines et personnalités.' },
  '/recits': { title: 'Récits : articles, témoignages et dossiers sur l’Afrique', description: 'Articles documentés, témoignages et dossiers thématiques pour comprendre les lieux, les époques et les héritages africains.' },
  '/reperes': { title: 'Repères : dates, personnalités et proverbes d’Afrique', description: 'Les grandes dates de l’histoire africaine, les personnalités qui l’ont marquée et les proverbes qui la transmettent.' },
  '/sources': { title: 'Sources et provenance des contenus', description: 'D’où viennent les contenus de MonBaobab : sources, méthode de vérification et contributions.' },
  '/contribute': { title: 'Contribuer : partager une histoire, un savoir, un lieu', description: 'Partagez un récit, un proverbe, une recette ou un savoir-faire pour enrichir la mémoire collective africaine.' },
  // Pages privées ou utilitaires : jamais indexées
  '/login': { title: 'Connexion', noindex: true },
  '/register': { title: 'Créer un compte', noindex: true },
  '/mot-de-passe-oublie': { title: 'Mot de passe oublié', noindex: true },
  '/dashboard': { title: 'Mon espace', noindex: true },
  '/search': { title: 'Recherche', noindex: true },
  '/admin': { title: 'Administration', noindex: true },
  '/blog/admin': { title: 'Administration du blog', noindex: true },
  '/blog/ecrire': { title: 'Écrire un article', noindex: true },
}

/** Titre provisoire des pages de détail pendant le chargement de leurs données */
const detailSections: Array<[RegExp, SeoInput]> = [
  [/^\/blog\/ecrire\/[^/]+$/, { title: 'Modifier mon texte', noindex: true }],
  [/^\/blog\/[^/]+$/, { title: 'Récits' }],
  [/^\/recit\/[^/]+$/, { title: 'Récits' }],
  [/^\/country\/[^/]+$/, { title: 'Fiche pays' }],
  [/^\/figures\/[^/]+$/, { title: 'Repères' }],
  [/^\/stories\/[^/]+$/, { title: 'Récits' }],
  [/^\/collections\/[^/]+$/, { title: 'Récits' }],
  [/^\/timeline\/[^/]+$/, { title: 'Repères' }],
  [/^\/proverbs\/[^/]+$/, { title: 'Proverbe' }],
]

export const RouteSeo = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
    const known = staticRoutes[path]
    if (known) {
      applySeo({ ...known, path })
      return
    }
    const section = detailSections.find(([pattern]) => pattern.test(path))
    if (section) applySeo({ ...section[1], path })
    // Route inconnue : la page 404 pose elle-même noindex
  }, [pathname])

  return null
}
