import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Lecture, LectureCard, LectureEmpty, LectureSkeleton } from '../components/Lecture/Lecture'
import { proverbService } from '../services/api'
import { useSeo } from '../seo/useSeo'
import { useAdresseLisible } from '../hooks/useAdresseLisible'
import { lienContenu } from '../utils/liens'
import { joinMeta } from '../utils'
import { findCountryCodes, placeOf } from '../utils/afrique'

// Page d'un proverbe (Repères), dans le gabarit de lecture de la refonte.

interface Proverbe {
  _id: string
  slug?: string
  text: string
  translation?: string
  explanation?: string
  language?: string
  countryName?: string
  category?: string
  tags?: string[]
  source?: string
  author?: string
  isVerified?: boolean
}

interface ProverbeLie {
  _id: string
  slug?: string
  text: string
  language?: string
  explanation?: string
}

const back = { to: '/reperes?type=proverbes', label: 'Retour aux proverbes' }
const sansGuillemets = (text = '') => text.replace(/^[«"\s]+|[»"\s]+$/g, '')

export const ProverbDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [proverbe, setProverbe] = useState<Proverbe | null>(null)
  const [lies, setLies] = useState<ProverbeLie[]>([])
  const [loading, setLoading] = useState(true)

  useAdresseLisible('proverbs', proverbe)
  useSeo(
    proverbe
      ? {
          path: lienContenu('proverbs', proverbe),
          title: `« ${sansGuillemets(proverbe.text)} »`,
          description: joinMeta(`Proverbe ${proverbe.language ? proverbe.language.toLowerCase() : ''}`.trim(), proverbe.countryName) + (proverbe.explanation ? ` : ${proverbe.explanation}` : ''),
          type: 'article',
          jsonLd: {
            '@type': 'Quotation',
            text: sansGuillemets(proverbe.text),
            inLanguage: 'fr',
            about: proverbe.explanation || undefined,
            spatialCoverage: proverbe.countryName ? { '@type': 'Country', name: proverbe.countryName } : undefined,
          },
        }
      : null,
  )

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    proverbService
      .getById(id)
      .then(({ data }) => {
        if (cancelled) return
        setProverbe(data?.data || null)
        setLies(Array.isArray(data?.related) ? data.related : [])
      })
      .catch(() => !cancelled && setProverbe(null))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <LectureSkeleton />
  if (!proverbe) {
    return (
      <LectureEmpty back={back}>
        <h1>Ce proverbe est introuvable</h1>
        <p>Il a peut-être été retiré ou déplacé.</p>
      </LectureEmpty>
    )
  }

  const place = placeOf(findCountryCodes(proverbe.countryName))
  const texte = sansGuillemets(proverbe.text)
  const origine = proverbe.source && !/à contextualiser/i.test(proverbe.source) ? proverbe.source : ''

  return (
    <Lecture
      back={back}
      kicker={joinMeta('Proverbe', proverbe.language, proverbe.countryName)}
      title={`« ${texte} »`}
      byline={{ detail: proverbe.isVerified ? 'Proverbe relu par l’équipe' : 'Tradition orale' }}
      bookmark={{ itemType: 'proverb', itemId: proverbe._id }}
      shareUrl={lienContenu('proverbs', proverbe)}
      place={place.codes.length ? place : undefined}
      toc={[
        ...(proverbe.explanation ? [{ id: 'sens', label: 'Ce qu’il veut dire' }] : []),
        ...(lies.length ? [{ id: 'autres', label: proverbe.countryName ? `Autres proverbes, ${proverbe.countryName}` : 'Autres proverbes' }] : []),
      ]}
      tocLabel="Dans cette page"
      aside={
        <LectureCard kicker="Proverbe">
          <dl className="mrl-facts">
            {proverbe.language && (
              <>
                <dt>Langue</dt>
                <dd>{proverbe.language}</dd>
              </>
            )}
            {proverbe.countryName && (
              <>
                <dt>Pays</dt>
                <dd>{proverbe.countryName}</dd>
              </>
            )}
            {proverbe.category && proverbe.category !== 'Autre' && (
              <>
                <dt>Thème</dt>
                <dd>{proverbe.category}</dd>
              </>
            )}
            <dt>Origine</dt>
            <dd>{origine || 'Tradition orale'}</dd>
          </dl>
          {proverbe.tags && proverbe.tags.length > 0 && (
            <ul className="mrl-tags">
              {proverbe.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
        </LectureCard>
      }
    >
      {proverbe.explanation && (
        <section id="sens">
          <h2>Ce qu’il veut dire</h2>
          <p>{proverbe.explanation}</p>
        </section>
      )}

      <section>
        <p>
          Vous connaissez ce proverbe dans une autre langue, ou une autre manière de le comprendre ?{' '}
          <Link to="/contribute">Proposez une précision</Link> : elle sera relue par l’équipe.
        </p>
      </section>

      {lies.length > 0 && (
        <section id="autres">
          <h2>{proverbe.countryName ? `Autres proverbes, ${proverbe.countryName}` : 'Autres proverbes'}</h2>
          <ul className="mrl-steps">
            {lies.map((item) => (
              <li key={item._id}>
                <Link to={lienContenu('proverbs', item)} className="mrl-step">
                  <span className="mrl-step-text">
                    <span className="mrd-kicker">{joinMeta('Proverbe', item.language)}</span>
                    <strong>« {sansGuillemets(item.text)} »</strong>
                    {item.explanation && <span>{item.explanation}</span>}
                  </span>
                  <ArrowRight size={18} strokeWidth={1.6} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Lecture>
  )
}
