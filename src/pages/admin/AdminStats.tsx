import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, CalendarDays, Library, Map as MapIcon, PenLine, Inbox, UserRound, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { blogService, ficheService, userService } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'
import { listFrom } from '../../utils'
import { allAfricanCountries } from '../../data/allAfricanCountries'
import { REGION_COLORS, REGION_LABELS, REGION_ORDER, regionOfCode, type Region } from '../../utils/afrique'
import './AdminStats.css'

// Tableau de bord : ce qui attend une action, ce qui est en ligne, et la couverture du continent
// par la base de connaissances (une couleur par région, comme sur le site). Aucun chiffre inventé.

interface Props {
  aTraiter: Partial<Record<string, number>>
  onNavigate: (section: string) => void
}

interface FicheStats {
  pays: Record<string, Record<string, number> & { total: number }>
  statuts: Record<string, number>
  miseAJourDisponible: number
}

const dateDuJour = () => new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export const AdminStats = ({ aTraiter, onNavigate }: Props) => {
  const user = useAuthStore((state) => state.user)
  const [fiches, setFiches] = useState<FicheStats | null>(null)
  const [articles, setArticles] = useState<number | null>(null)
  const [membres, setMembres] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    ficheService.getStats().then(({ data }) => !cancelled && setFiches(data)).catch(() => undefined)
    blogService
      .getAll({ published: true })
      .then(({ data }) => !cancelled && setArticles(listFrom(data, 'blogs').length))
      .catch(() => undefined)
    userService
      .getAll({ limit: 1 })
      .then(({ data }) => !cancelled && setMembres(data?.pagination?.total ?? listFrom(data, 'users').length))
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  // Couverture par région : pays ayant des fiches, fiches au total et publiées
  const regions = useMemo(() => {
    const parRegion = Object.fromEntries(REGION_ORDER.map((r) => [r, { pays: [] as Array<{ code: string; nom: string; total: number; publie: number }>, total: 0, publie: 0 }])) as Record<
      Region,
      { pays: Array<{ code: string; nom: string; total: number; publie: number }>; total: number; publie: number }
    >
    for (const country of allAfricanCountries) {
      const code = country.id.toUpperCase()
      const region = regionOfCode(code)
      if (!region) continue
      const s = fiches?.pays?.[code]
      parRegion[region].pays.push({ code, nom: country.nameFr, total: s?.total || 0, publie: s?.publie || 0 })
      parRegion[region].total += s?.total || 0
      parRegion[region].publie += s?.publie || 0
    }
    return parRegion
  }, [fiches])

  const maxPays = Math.max(1, ...Object.values(fiches?.pays || {}).map((p) => p.total))
  const paysCouverts = Object.keys(fiches?.pays || {}).length
  const prenom = (user?.name || '').split(/\s+/)[0]

  const taches: Array<{ id: string; titre: string; texte: string; nombre: number; icon: LucideIcon }> = [
    { id: 'fiches', titre: 'Fiches en revue', texte: 'À relire, valider puis publier.', nombre: aTraiter.fiches || 0, icon: Library },
    { id: 'contributions', titre: 'Contributions proposées', texte: 'Proverbes, sources et corrections envoyés par les membres.', nombre: aTraiter.contributions || 0, icon: Inbox },
    { id: 'blog', titre: 'Articles en relecture', texte: 'Textes soumis, en attente de votre décision.', nombre: aTraiter.blog || 0, icon: PenLine },
  ]

  const enLigne: Array<{ libelle: string; valeur: number | null; icon: LucideIcon }> = [
    { libelle: 'Fiches publiées', valeur: fiches ? fiches.statuts.publie || 0 : null, icon: Library },
    { libelle: 'Articles publiés', valeur: articles, icon: BookOpen },
    { libelle: 'Membres', valeur: membres, icon: Users },
    { libelle: 'Pays dans la base', valeur: fiches ? paysCouverts : null, icon: MapIcon },
  ]

  return (
    <div className="mts">
      <section className="mts-accueil">
        <div>
          <p className="mts-date">{dateDuJour()}</p>
          <h2>Bonjour{prenom ? ` ${prenom}` : ''}.</h2>
          <p>Voici ce qui attend une action, et l’avancée de la mémoire collective, région par région.</p>
        </div>
      </section>

      <section className="mts-bloc" aria-labelledby="mts-taches">
        <h3 id="mts-taches">À traiter</h3>
        <ul className="mts-taches">
          {taches.map((tache) => {
            const Icon = tache.icon
            return (
              <li key={tache.id}>
                <button type="button" className={`mts-tache${tache.nombre ? ' is-due' : ''}`} onClick={() => onNavigate(tache.id)}>
                  <span className="mts-picto" aria-hidden="true">
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  <strong className="mts-nombre">{tache.nombre}</strong>
                  <span className="mts-tache-titre">{tache.titre}</span>
                  <span className="mts-tache-texte">{tache.nombre ? tache.texte : 'Rien en attente.'}</span>
                  <span className="mts-ouvrir">
                    Ouvrir <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        {fiches && fiches.miseAJourDisponible > 0 && (
          <p className="mts-note">
            {fiches.miseAJourDisponible} fiche(s) déjà validée(s) ont une nouvelle version collectée à relire, dans la base de connaissances.
          </p>
        )}
      </section>

      <section className="mts-bloc" aria-labelledby="mts-ligne">
        <h3 id="mts-ligne">Sur le site</h3>
        <dl className="mts-chiffres">
          {enLigne.map(({ libelle, valeur, icon: Icon }) => (
            <div key={libelle}>
              <dt>
                <Icon size={16} strokeWidth={1.8} aria-hidden="true" /> {libelle}
              </dt>
              <dd>{valeur ?? '…'}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mts-bloc" aria-labelledby="mts-continent">
        <div className="mts-bloc-tete">
          <h3 id="mts-continent">Couverture du continent</h3>
          <p>Fiches de la base de connaissances, par région et par pays. Plus la case est foncée, plus le pays est documenté.</p>
        </div>
        <ul className="mts-regions">
          {REGION_ORDER.map((region) => {
            const r = regions[region]
            const documentes = r.pays.filter((p) => p.total > 0).length
            return (
              <li key={region} className="mts-region" style={{ '--mts-region': REGION_COLORS[region] } as CSSProperties}>
                <div className="mts-region-tete">
                  <span className="mts-region-nom">
                    <i aria-hidden="true" /> {REGION_LABELS[region]}
                  </span>
                  <span className="mts-region-chiffres">
                    {documentes}/{r.pays.length} pays · {r.total} fiches · {r.publie} publiées
                  </span>
                </div>
                <div className="mts-barre" aria-hidden="true">
                  <span style={{ width: `${(documentes / Math.max(1, r.pays.length)) * 100}%` }} />
                </div>
                <ul className="mts-mosaique">
                  {r.pays
                    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
                    .map((p) => (
                      <li
                        key={p.code}
                        title={`${p.nom} : ${p.total} fiche(s), ${p.publie} publiée(s)`}
                        style={{ '--mts-niveau': p.total ? 0.18 + 0.82 * (p.total / maxPays) : 0 } as CSSProperties}
                        className={p.total ? 'is-documente' : undefined}
                      >
                        {p.code}
                      </li>
                    ))}
                </ul>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="mts-bloc" aria-labelledby="mts-raccourcis">
        <h3 id="mts-raccourcis">Raccourcis</h3>
        <div className="mts-raccourcis">
          <Link to="/blog/ecrire" className="mts-raccourci">
            <PenLine size={18} aria-hidden="true" /> Écrire un article
          </Link>
          <button type="button" className="mts-raccourci" onClick={() => onNavigate('timeline')}>
            <CalendarDays size={18} aria-hidden="true" /> Ajouter une date
          </button>
          <button type="button" className="mts-raccourci" onClick={() => onNavigate('figures')}>
            <UserRound size={18} aria-hidden="true" /> Ajouter une personnalité
          </button>
          <Link to="/map" className="mts-raccourci">
            <MapIcon size={18} aria-hidden="true" /> Voir la carte
          </Link>
        </div>
      </section>
    </div>
  )
}
