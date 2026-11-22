import { lienContenu } from '../utils/liens'
import { useEffect, useState } from 'react'
import { blogService, collectionService, ficheService, figureService, proverbService, storyService, timelineService } from '../services/api'
import { DOSSIERS, RECITS } from '../data/recitsContent'
import { DATES, PERSONNALITES, PROVERBES } from '../data/reperesContent'
import { listFrom, joinMeta } from '../utils'
import { countryNameOf, findCountryCodes, formatLifespan, formatYear, placeOf, yearOf, type Place } from '../utils/afrique'

// Contenus des rubriques Récits et Repères, lus dans la base et rattachés à leur pays et à leur
// région. Les contenus rédigés pour la maquette servent tant que la base n'a pas répondu, et
// restent affichés si elle est injoignable : la page n'est jamais vide.

/* ------------------------------------------------------------------ Récits */

export type RecitKind = 'articles' | 'temoignages' | 'histoires' | 'dossiers'

export interface RecitItem extends Place {
  id: string
  kind: RecitKind
  title: string
  excerpt: string
  image: string
  meta: string
  theme: string
  to: string
}

const readingMinutes = (text = '') => Math.max(2, Math.round(text.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length / 200))

// Récits rédigés pour la maquette : chacun a sa page de lecture complète (/recit/:id)
const editorialRecits: RecitItem[] = RECITS.map((recit) => ({
  ...placeOf(findCountryCodes(recit.pays)),
  id: `maquette-${recit.id}`,
  kind: recit.type as RecitKind,
  title: recit.title,
  excerpt: recit.excerpt,
  image: recit.image,
  meta: recit.meta,
  theme: recit.theme ?? '',
  to: recit.to,
}))

// Dossiers de la maquette : sans page propre, ils ne servent que si la base est injoignable
const editorialDossiers: RecitItem[] = DOSSIERS.map((dossier) => ({
  ...placeOf(findCountryCodes(dossier.pays)),
  id: `maquette-${dossier.id}`,
  kind: 'dossiers',
  title: dossier.title,
  excerpt: dossier.excerpt,
  image: dossier.image,
  meta: dossier.meta,
  theme: dossier.theme ?? '',
  to: dossier.to,
}))

const fromBlog = (post: any): RecitItem => ({
  // Le pays saisi par l'auteur (code ISO) d'abord, puis ceux cités dans le titre ou les mots-clés
  ...placeOf([...new Set([post.country && String(post.country).toUpperCase(), ...findCountryCodes(post.title, post.tags)].filter(Boolean))]),
  id: `blog-${post._id}`,
  kind: post.kind === 'temoignage' ? 'temoignages' : 'articles',
  title: post.title,
  excerpt: post.excerpt || '',
  image: post.image || '',
  meta: joinMeta(post.category, `${readingMinutes(post.content)} min`),
  theme: post.category || '',
  to: lienContenu('blog', post),
})

const fromStory = (story: any): RecitItem => ({
  ...placeOf(findCountryCodes(story.tags, story.title, story.subtitle)),
  id: `story-${story._id}`,
  kind: 'histoires',
  title: story.title,
  excerpt: story.subtitle || story.description || '',
  image: story.coverImage || '',
  meta: joinMeta(story.category, story.readingTime && `${story.readingTime} min`),
  theme: story.category || '',
  to: lienContenu('stories', story),
})

const fromCollection = (collection: any): RecitItem => ({
  ...placeOf(findCountryCodes(collection.tags, collection.title, collection.shortDescription)),
  id: `collection-${collection._id}`,
  kind: 'dossiers',
  title: collection.title,
  excerpt: collection.shortDescription || collection.description || '',
  image: collection.coverImage || '',
  meta: joinMeta('Dossier', collection.items?.length && `${collection.items.length} étapes`),
  theme: collection.theme?.[0] || '',
  to: lienContenu('collections', collection),
})

type LoadState = 'chargement' | 'pret' | 'hors-ligne'

export const useRecits = () => {
  const [state, setState] = useState<{ status: LoadState; items: RecitItem[] }>({
    status: 'chargement',
    items: [...editorialRecits, ...editorialDossiers],
  })

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([blogService.getAll(), storyService.getAll({ limit: 200 }), collectionService.getAll({ limit: 200 })]).then(
      ([blogs, stories, collections]) => {
        if (cancelled) return
        const ok = [blogs, stories, collections].some((result) => result.status === 'fulfilled')
        const read = (result: PromiseSettledResult<{ data: unknown }>, key: string) =>
          result.status === 'fulfilled' ? listFrom(result.value.data, key) : []
        const fromDb = [
          ...read(blogs, 'blogs').filter((post) => post.published !== false).map(fromBlog),
          ...read(stories, 'stories').filter((story) => story.published !== false).map(fromStory),
          ...read(collections, 'collections').filter((collection) => collection.isActive !== false).map(fromCollection),
        ]
        const hasDossiers = fromDb.some((item) => item.kind === 'dossiers')
        setState({
          status: ok ? 'pret' : 'hors-ligne',
          items: [...editorialRecits, ...fromDb, ...(hasDossiers ? [] : editorialDossiers)],
        })
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  return state
}

/* ----------------------------------------------------------------- Repères */

export interface DateItem extends Place {
  id: string
  year: number | null
  annee: string
  titre: string
  epoque: string
  to?: string
}

export interface FigureItem extends Place {
  id: string
  nom: string
  dates: string
  role: string
  portrait: string
  to?: string
}

export interface ProverbItem extends Place {
  id: string
  citation: string
  origine: string
  langue: string
  to?: string
}

// Portraits dessinés pour la maquette, rattachés aux personnalités de la base par leur nom
const normalizeName = (value = '') => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '')
const PORTRAITS = new Map(PERSONNALITES.map((p) => [normalizeName(p.nom), p.portrait]))

const clip = (text = '', max = 110) => {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > max ? `${clean.slice(0, clean.lastIndexOf(' ', max)).replace(/[,;:]$/, '')}…` : clean
}

const fromEvent = (event: any): DateItem => {
  const where = event.location?.region || event.location?.country || ''
  const codes = findCountryCodes(where, event.title)
  return {
    ...placeOf(codes, /afrique/i.test(where) ? 'Tout le continent' : 'Afrique et monde'),
    id: `event-${event._id}`,
    year: yearOf(event.date),
    annee: formatYear(event.date),
    titre: event.title,
    epoque: event.period && event.period !== 'Autre' ? event.period : '',
    to: lienContenu('timeline', event),
  }
}

const fromFigure = (figure: any): FigureItem => ({
  ...placeOf(findCountryCodes(figure.birthPlace?.location, figure.relatedCountries, figure.shortBiography)),
  id: `figure-${figure._id}`,
  nom: figure.name,
  dates: formatLifespan(figure.birthDate, figure.deathDate),
  role: clip(figure.shortBiography || (figure.role || []).join(' · ')),
  portrait: figure.image || PORTRAITS.get(normalizeName(figure.name)) || '',
  to: lienContenu('figures', figure),
})

const fromProverb = (proverb: any): ProverbItem => ({
  ...placeOf(findCountryCodes(proverb.countryName)),
  id: `proverb-${proverb._id}`,
  citation: proverb.text,
  langue: proverb.language || '',
  origine: joinMeta(proverb.language ? `Proverbe ${proverb.language.toLowerCase()}` : 'Proverbe', proverb.countryName),
})

// Fiches publiées de la base de connaissances (server/data/afrique), ouvertes sur /fiche/:id
const fromFicheEvent = (fiche: any): DateItem => ({
  ...placeOf([fiche.pays]),
  id: `fiche-${fiche.ficheId}`,
  year: yearOf(fiche.contenu?.date || fiche.date),
  annee: fiche.contenu?.date_affichee || formatYear(fiche.contenu?.date || fiche.date),
  titre: fiche.titre,
  epoque: '',
  to: `/fiche/${fiche.ficheId}`,
})

const fromFichePersonne = (fiche: any): FigureItem => ({
  ...placeOf([fiche.pays]),
  id: `fiche-${fiche.ficheId}`,
  nom: fiche.titre,
  dates: formatLifespan(fiche.contenu?.naissance?.date, fiche.contenu?.deces?.date),
  role: clip(fiche.description),
  portrait: fiche.contenu?.image?.url || PORTRAITS.get(normalizeName(fiche.titre)) || '',
  to: `/fiche/${fiche.ficheId}`,
})

const fromFicheProverbe = (fiche: any): ProverbItem => ({
  ...placeOf([fiche.pays]),
  id: `fiche-${fiche.ficheId}`,
  citation: fiche.contenu?.traduction || fiche.titre,
  langue: fiche.contenu?.langue || '',
  origine: joinMeta(fiche.contenu?.langue ? `Proverbe ${String(fiche.contenu.langue).toLowerCase()}` : 'Proverbe', countryNameOf(fiche.pays)),
  to: `/fiche/${fiche.ficheId}`,
})

const sansDoublon = <T,>(base: T[], ajouts: T[], cle: (item: T) => string) => {
  const vus = new Set(base.map(cle))
  return [...base, ...ajouts.filter((item) => !vus.has(cle(item)))]
}

// Contenu de la maquette, en attendant la base
const editorialDates: DateItem[] = DATES.map((d) => ({ ...placeOf(findCountryCodes(d.pays)), id: d.id, year: null, annee: d.annee, titre: d.titre, epoque: d.epoque }))
const editorialFigures: FigureItem[] = PERSONNALITES.map((p) => ({ ...placeOf(findCountryCodes(p.pays)), id: p.id, nom: p.nom, dates: p.dates, role: p.role, portrait: p.portrait }))
const editorialProverbs: ProverbItem[] = PROVERBES.map((p) => ({ ...placeOf([]), id: p.id, citation: p.citation, origine: p.origine, langue: '' }))

export const useReperes = () => {
  const [state, setState] = useState<{ status: LoadState; dates: DateItem[]; figures: FigureItem[]; proverbs: ProverbItem[] }>({
    status: 'chargement',
    dates: editorialDates,
    figures: editorialFigures,
    proverbs: editorialProverbs,
  })
  const [proverbeDuJour, setProverbeDuJour] = useState<ProverbItem | null>(null)

  useEffect(() => {
    let cancelled = false
    proverbService
      .getDuJour()
      .then(({ data }) => {
        if (!cancelled && data?.data) setProverbeDuJour(fromProverb(data.data))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([
      timelineService.getAll({ limit: 200 }),
      figureService.getAll({ limit: 200 }),
      proverbService.getAll({ limit: 200 }),
      ficheService.getAll({ type: 'evenement', limit: 200 }),
      ficheService.getAll({ type: 'personnalite', limit: 200 }),
      ficheService.getAll({ type: 'proverbe', limit: 200 }),
    ]).then(
      ([events, figures, proverbs, ficheEvents, fichePersonnes, ficheProverbes]) => {
        if (cancelled) return
        setState((previous) => {
          const read = (result: PromiseSettledResult<{ data: unknown }>, key: string) =>
            result.status === 'fulfilled' ? listFrom(result.value.data, key) : null
          const dbEvents = read(events, 'events')
          const dbFigures = read(figures, 'figures')
          const dbProverbs = read(proverbs, 'data')
          const publiees = (result: PromiseSettledResult<{ data: unknown }>) => (result.status === 'fulfilled' ? listFrom(result.value.data, 'fiches') : [])
          const nom = (value: string) => normalizeName(value)
          const etat = {
            dates: dbEvents?.length
              ? dbEvents.filter((e) => e.isActive !== false).map(fromEvent).sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
              : previous.dates,
            figures: dbFigures?.length
              ? dbFigures.filter((f) => f.isActive !== false).map(fromFigure).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
              : previous.figures,
            proverbs: dbProverbs?.length ? dbProverbs.map(fromProverb) : previous.proverbs,
          }
          return {
            status: (dbEvents || dbFigures || dbProverbs ? 'pret' : 'hors-ligne') as LoadState,
            dates: sansDoublon(etat.dates, publiees(ficheEvents).map(fromFicheEvent), (d) => nom(d.titre)).sort((a, b) => (a.year ?? 0) - (b.year ?? 0)),
            figures: sansDoublon(etat.figures, publiees(fichePersonnes).map(fromFichePersonne), (f) => nom(f.nom)).sort((a, b) => a.nom.localeCompare(b.nom, 'fr')),
            proverbs: sansDoublon(etat.proverbs, publiees(ficheProverbes).map(fromFicheProverbe), (p) => nom(p.citation)),
          }
        })
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  return { ...state, proverbeDuJour }
}
