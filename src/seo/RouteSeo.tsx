import { useLocation } from 'react-router-dom'
import { applySeo, type SeoInput } from './useSeo'
import { useEffect } from 'react'

/**
 * Balises par défaut selon la route. Les pages de détail (article, pays, personnalité…)
 * les précisent ensuite avec useSeo() une fois leurs données chargées.
 */
const staticRoutes: Record<string, SeoInput> = {
  '/': {},
  '/map': { title: 'Carte interactive des pays d’Afrique', description: 'Explorez les pays d’Afrique : capitales, langues, histoire, cultures, cuisines et personnalités.' },
  '/blog': { title: 'Carnet de savoirs : articles sur l’Afrique', description: 'Articles, repères et lectures pour comprendre les lieux, les époques et les héritages africains.' },
  '/figures': { title: 'Personnalités historiques africaines', description: 'Portraits de celles et ceux qui ont marqué l’histoire de l’Afrique : souverains, résistantes, savants, artistes.' },
  '/stories': { title: 'Récits et histoires d’Afrique', description: 'Épopées, contes, biographies et histoires transmises, à lire chapitre par chapitre.' },
  '/collections': { title: 'Collections thématiques', description: 'Parcours thématiques sur les empires, les arts et les patrimoines africains.' },
  '/timeline': { title: 'Chronologie de l’histoire africaine', description: 'Les grandes périodes de l’histoire de l’Afrique, des royaumes anciens aux indépendances.' },
  '/quizzes': { title: 'Quiz sur l’histoire et les cultures africaines', description: 'Testez et enrichissez vos connaissances sur l’Afrique avec des quiz pour tous les niveaux.' },
  '/proverbs': { title: 'Proverbes africains et leur sens', description: 'Proverbes africains classés par pays et par langue, avec leur explication.' },
  '/shop': { title: 'Boutique : créations et objets africains', description: 'Objets, matières et créations choisis pour leur usage et leur histoire.' },
  '/communities': { title: 'Cercles : communautés autour de l’Afrique', description: 'Rejoignez un cercle pour échanger autour d’un pays, d’une langue ou d’un thème.' },
  '/sources': { title: 'Sources et provenance des contenus', description: 'D’où viennent les contenus de MonBaobab : sources, méthode de vérification et contributions.' },
  '/contribute': { title: 'Contribuer : partager une histoire, un savoir, un lieu', description: 'Partagez un récit, un proverbe, une recette ou un savoir-faire pour enrichir la mémoire collective africaine.' },
  // Pages privées ou utilitaires : jamais indexées
  '/login': { title: 'Connexion', noindex: true },
  '/register': { title: 'Créer un compte', noindex: true },
  '/cart': { title: 'Panier', noindex: true },
  '/checkout': { title: 'Paiement', noindex: true },
  '/dashboard': { title: 'Mon espace', noindex: true },
  '/community': { title: 'Communauté', noindex: true },
  '/communities/create': { title: 'Créer un cercle', noindex: true },
  '/search': { title: 'Recherche', noindex: true },
  '/admin': { title: 'Administration', noindex: true },
  '/blog/admin': { title: 'Administration du blog', noindex: true },
}

/** Titre provisoire des pages de détail pendant le chargement de leurs données */
const detailSections: Array<[RegExp, SeoInput]> = [
  [/^\/blog\/[^/]+$/, { title: 'Carnet de savoirs' }],
  [/^\/country\/[^/]+$/, { title: 'Fiche pays' }],
  [/^\/figures\/[^/]+$/, { title: 'Personnalités' }],
  [/^\/stories\/[^/]+$/, { title: 'Récits' }],
  [/^\/collections\/[^/]+$/, { title: 'Collections' }],
  [/^\/timeline\/[^/]+$/, { title: 'Chronologie' }],
  [/^\/quizzes\/[^/]+$/, { title: 'Quiz' }],
  [/^\/communities\/[^/]+$/, { title: 'Cercles' }],
  [/^\/orders\/[^/]+$/, { title: 'Commande', noindex: true }],
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
