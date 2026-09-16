import Button from '../components/ui/Button'
import PageHero from '../components/ui/PageHero'

function NotFoundPage() {
  return (
    <>
      <PageHero title="Page not found" subtitle="That address is not part of CERVICARE. Return home or open Find Care." />
      <section className="section">
        <div className="container hero-actions">
          <Button to="/">Home</Button>
          <Button to="/find-care" variant="outline">
            Find Care
          </Button>
        </div>
      </section>
    </>
  )
}

export default NotFoundPage
