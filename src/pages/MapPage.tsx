import { useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { AfricaExplorer } from '../components/AfricaMap/AfricaExplorer'
import { allAfricanCountries } from '../data/allAfricanCountries'
import { africaRegions } from '../data/africaRegions'
import './MapPage.css'

export const MapPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  // Lecture une seule fois : la sélection est ensuite pilotée par la carte
  const initialCountry = useMemo(() => searchParams.get('pays'), []) // eslint-disable-line react-hooks/exhaustive-deps

  // ?pays=sn dans l'URL : la sélection est partageable et survit au retour arrière
  const handleSelection = useCallback(
    (id: string | null) => {
      setSearchParams(id ? { pays: id.toLowerCase() } : {}, { replace: true })
    },
    [setSearchParams],
  )

  const byRegion = useMemo(
    () =>
      africaRegions.map((region) => ({
        region,
        countries: region.countries
          .map((id) => allAfricanCountries.find((c) => c.id === id))
          .filter(Boolean)
          .sort((a, b) => a!.nameFr.localeCompare(b!.nameFr, 'fr')),
      })),
    [],
  )

  return (
    <Layout fullWidth>
      <AfricaExplorer initialCountryId={initialCountry} onSelectionChange={handleSelection} />

      {/* Index textuel : accessible au clavier et aux lecteurs d'écran, utile aussi au référencement */}
      <section className="section map-index" aria-labelledby="map-index-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Tous les pays</p>
              <h2 id="map-index-title">Les pays d’Afrique, région par région</h2>
            </div>
          </div>
          <div className="map-index__grid">
            {byRegion.map(({ region, countries }) => (
              <section key={region.id} className="map-index__region">
                <h3>
                  <i style={{ background: region.color }} aria-hidden="true" />
                  {region.name}
                  <small>{countries.length}</small>
                </h3>
                <ul>
                  {countries.map((country) => (
                    <li key={country!.id}>
                      <Link to={`/country/${country!.id.toLowerCase()}`}>
                        <img src={`https://flagcdn.com/w40/${country!.id.toLowerCase()}.png`} alt="" width={20} height={14} loading="lazy" />
                        {country!.nameFr}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}
