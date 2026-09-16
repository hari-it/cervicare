import Disclaimer from '../components/ui/Disclaimer'
import FAQ from '../components/ui/FAQ'
import InfoCard from '../components/ui/InfoCard'
import PageHero from '../components/ui/PageHero'
import SectionHeading from '../components/ui/SectionHeading'
import SourcesList from '../components/ui/SourcesList'
import { learnPage, medicalDisclaimer } from '../data/education'
import { sources } from '../data/sources'

function LearnPage() {
  return (
    <>
      <PageHero eyebrow="Learn" title={learnPage.title} subtitle={learnPage.intro} />
      <section className="section">
        <div className="container">
          <Disclaimer variant="warning">{medicalDisclaimer}</Disclaimer>
          <div className="grid-2" style={{ marginTop: '1.4rem' }}>
            {learnPage.cards.map((card) => (
              <InfoCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>
      <section className="section section-alt">
        <div className="container">
          <SectionHeading title="Questions people often ask" />
          <FAQ items={learnPage.faqs} />
          <SectionHeading title="Sources" />
          <SourcesList items={sources.filter((item) => ['who-cc', 'who-hpv', 'acs'].includes(item.id))} />
        </div>
      </section>
    </>
  )
}

export default LearnPage
