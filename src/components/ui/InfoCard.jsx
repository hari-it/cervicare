import Card from './Card'

function InfoCard({ title, body, children }) {
  return (
    <Card className="info-card">
      {title ? <h3>{title}</h3> : null}
      {body ? <p>{body}</p> : null}
      {children}
    </Card>
  )
}

export default InfoCard
