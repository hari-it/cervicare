import AwarenessJourney from '../components/AwarenessJourney'
import Disclaimer from '../components/ui/Disclaimer'
import PageHero from '../components/ui/PageHero'

function AwarenessJourneyPage() {
  return (
    <>
      <PageHero
        eyebrow="Learn at your own pace"
        title="Awareness Journey"
        subtitle="An educational experience for understanding cervical-health topics through clear, guided steps."
      />
      <section className="section">
        <div className="container">
          <Disclaimer>
            CERVICARE provides educational information only. It does not diagnose cancer, estimate personal cancer risk,
            or replace advice from a qualified healthcare professional.
          </Disclaimer>
          <AwarenessJourney />
        </div>
      </section>
    </>
  )
}

export default AwarenessJourneyPage
