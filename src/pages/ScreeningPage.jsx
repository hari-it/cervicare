import Disclaimer from '../components/ui/Disclaimer'
import InfoCard from '../components/ui/InfoCard'
import PageHero from '../components/ui/PageHero'
import SectionHeading from '../components/ui/SectionHeading'
import SourcesList from '../components/ui/SourcesList'
import { medicalDisclaimer, screeningPage } from '../data/education'
import { sources } from '../data/sources'

function ScreeningPage() {
  return (
    <>
      <PageHero eyebrow="Learn" title={screeningPage.title} subtitle={screeningPage.intro} />
      <section className="section">
        <div className="container">
          <Disclaimer variant="warning">
            Screening intervals published for one country may not apply to you. Confirm with a clinician or your national programme.
          </Disclaimer>
          <div className="grid-3" style={{ marginTop: '1.4rem' }}>
            {screeningPage.cards.map((card) => (
              <InfoCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>
      <section className="section section-alt">
        <div className="container">
          <Disclaimer>{medicalDisclaimer}</Disclaimer>
          <SectionHeading title="Sources" />
          <SourcesList items={sources.filter((item) => ['who-cc', 'cdc-screening', 'mohfw', 'nhm'].includes(item.id))} />
        </div>
      </section>
    </>
  )
}

export default ScreeningPage
