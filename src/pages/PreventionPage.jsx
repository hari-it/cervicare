import Disclaimer from '../components/ui/Disclaimer'
import InfoCard from '../components/ui/InfoCard'
import PageHero from '../components/ui/PageHero'
import SectionHeading from '../components/ui/SectionHeading'
import SourcesList from '../components/ui/SourcesList'
import { medicalDisclaimer, preventionPage } from '../data/education'
import { sources } from '../data/sources'

function PreventionPage() {
  return (
    <>
      <PageHero eyebrow="Learn" title={preventionPage.title} subtitle={preventionPage.intro} />
      <section className="section">
        <div className="container">
          <Disclaimer>{medicalDisclaimer}</Disclaimer>
          <div className="grid-2" style={{ marginTop: '1.4rem' }}>
            {preventionPage.cards.map((card) => (
              <InfoCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>
      <section className="section section-alt">
        <div className="container">
          <SectionHeading title="Sources" />
          <SourcesList items={sources.filter((item) => ['who-elim', 'cdc-hpv', 'acs', 'who-cc'].includes(item.id))} />
        </div>
      </section>
    </>
  )
}

export default PreventionPage
