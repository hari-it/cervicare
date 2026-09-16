import Card from '../../ui/Card'

const labels = {
  screening_centre: 'Screening centre',
  hospital: 'Hospital',
  ngo: 'NGO',
  government_scheme: 'Government scheme',
}

const verificationLabels = {
  screening_centre: 'Verified resource',
  hospital: 'Verified resource',
  ngo: 'Verified resource',
  government_scheme: 'Official programme',
}

function CareCenterCard({ resource }) {
  return (
    <Card>
      <div className="care-meta">
        <span className="badge">{labels[resource.resource_type] || resource.resource_type}</span>
        {resource.is_demo ? (
          <span className="badge">DEMO / SAMPLE</span>
        ) : (
          <span className="badge badge-green">{verificationLabels[resource.resource_type] || 'Verified resource'}</span>
        )}
      </div>
      <h3>{resource.name}</h3>
      <p>
        {resource.city}
        {resource.region ? ` · ${resource.region}` : ''}
      </p>
      <p>{resource.description}</p>
      {resource.contact ? <p>{resource.contact}</p> : null}
      {resource.website ? (
        <p>
          <a href={resource.website} target="_blank" rel="noreferrer">
            Official website
          </a>
        </p>
      ) : null}
    </Card>
  )
}

export default CareCenterCard
