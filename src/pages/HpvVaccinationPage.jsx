import Disclaimer from '../components/ui/Disclaimer'
import FAQ from '../components/ui/FAQ'
import InfoCard from '../components/ui/InfoCard'
import PageHero from '../components/ui/PageHero'
import SectionHeading from '../components/ui/SectionHeading'
import SourcesList from '../components/ui/SourcesList'
import { hpvPage, medicalDisclaimer } from '../data/education'
import { sources } from '../data/sources'

function HpvVaccinationPage() {
  return (
    <>
      <PageHero eyebrow="Learn" title={hpvPage.title} subtitle={hpvPage.intro} />
      <section className="section">
        <div className="container">
          <Disclaimer>{medicalDisclaimer}</Disclaimer>
          <div className="grid-3" style={{ marginTop: '1.4rem' }}>
            {hpvPage.cards.map((card) => (
              <InfoCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>
      <section className="section section-alt">
        <div className="container">
          <SectionHeading title="Questions people often ask" />
          <FAQ items={hpvPage.faqs} />
          <SectionHeading title="Sources" />
          <SourcesList items={sources.filter((item) => ['who-hpv', 'cdc-hpv', 'mohfw'].includes(item.id))} />
        </div>
      </section>
    </>
  )
}

export default HpvVaccinationPage
