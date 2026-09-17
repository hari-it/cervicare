import Card from './Card'
import PageHero from './PageHero'

function AccessDenied({ title = 'Access denied', body = 'Your account is not authorized to access this area.' }) {
  return (
    <>
      <PageHero eyebrow="Account access" title={title} subtitle={body} />
      <section className="section">
        <div className="container"><Card><p>{body}</p></Card></div>
      </section>
    </>
  )
}

export default AccessDenied