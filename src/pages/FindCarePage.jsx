import { useEffect, useState } from 'react'
import CareCenterCard from '../components/features/find-care/CareCenterCard'
import CareFilters from '../components/features/find-care/CareFilters'
import Disclaimer from '../components/ui/Disclaimer'
import EmptyState from '../components/ui/EmptyState'
import PageHero from '../components/ui/PageHero'
import Spinner from '../components/ui/Spinner'
import { listResources, usingDemoCareData } from '../services/careService'

function FindCarePage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [location, setLocation] = useState('all')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    listResources({ query, type, location })
      .then((rows) => {
        if (active) setItems(rows)
      })
      .catch((err) => {
        if (active) setError(err.message || 'Unable to load resources.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [query, type, location])

  return (
    <>
      <PageHero
        eyebrow="Support"
        title="Find care"
        subtitle="Find verified healthcare resources and government health programmes."
      />
      <section className="section">
        <div className="container">
          {usingDemoCareData() ? (
            <Disclaimer>
              Showing labelled SAMPLE/DEMO data because Supabase is not connected. Official scheme links are real
              government programmes; fictional centres are not real locations.
            </Disclaimer>
          ) : (
            <Disclaimer>Live listings are loaded from the healthcare_resources table.</Disclaimer>
          )}
          <div style={{ marginTop: '1.2rem' }}>
            <CareFilters
              query={query}
              type={type}
              location={location}
              onQueryChange={setQuery}
              onTypeChange={setType}
              onLocationChange={setLocation}
            />
          </div>
          {loading ? <Spinner label="Loading care resources" /> : null}
          {error ? <p className="form-error">{error}</p> : null}
          {!loading && !error && items.length === 0 ? (
            <EmptyState title="No matching resources" body="Try a different keyword or clear the type filter." />
          ) : null}
          <div className="grid-2">
            {items.map((resource) => (
              <CareCenterCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default FindCarePage
