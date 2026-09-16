import Card from './Card'

function StatCard({ kicker, title, body }) {
  return (
    <Card className="stat-card">
      {kicker ? <p className="stat-kicker">{kicker}</p> : null}
      <h3>{title}</h3>
      <p>{body}</p>
    </Card>
  )
}

export default StatCard
