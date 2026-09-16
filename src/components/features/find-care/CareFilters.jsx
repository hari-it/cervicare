import { RESOURCE_TYPES } from '../../../data/careResources.demo'

const LOCATION_OPTIONS = [
  { value: 'all', label: 'All locations' },
  { value: 'andhra-pradesh', label: 'Andhra Pradesh' },
  { value: 'india', label: 'India / Nationwide' },
]

function CareFilters({ query, type, location, onQueryChange, onTypeChange, onLocationChange }) {
  return (
    <div>
      <label className="sr-only" htmlFor="care-search">
        Search resources
      </label>
      <input
        id="care-search"
        className="search-input"
        type="search"
        placeholder="Search by name, city, or keyword"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <div className="filters" role="group" aria-label="Filter by type">
        {RESOURCE_TYPES.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`chip ${type === item.value ? 'active' : ''}`}
            onClick={() => onTypeChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="filters" role="group" aria-label="Filter by location">
        {LOCATION_OPTIONS.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`chip ${location === item.value ? 'active' : ''}`}
            onClick={() => onLocationChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CareFilters
