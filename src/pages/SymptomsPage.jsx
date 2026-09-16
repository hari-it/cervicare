import Disclaimer from '../components/ui/Disclaimer'
import FAQ from '../components/ui/FAQ'
import InfoCard from '../components/ui/InfoCard'
import PageHero from '../components/ui/PageHero'
import SectionHeading from '../components/ui/SectionHeading'
import SourcesList from '../components/ui/SourcesList'
import { medicalDisclaimer, symptomsPage } from '../data/education'
import { sources } from '../data/sources'

function SymptomsPage() {
  return (
    <>
      <PageHero eyebrow="Learn" title={symptomsPage.title} subtitle={symptomsPage.intro} />
      <section className="section">
        <div className="container">
          <Disclaimer variant="warning">{medicalDisclaimer}</Disclaimer>
          <div className="grid-2" style={{ marginTop: '1.5rem' }}>
            <InfoCard title="Symptoms that warrant clinical advice">
              <ul>
                {symptomsPage.symptoms.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </InfoCard>
            <InfoCard title="Risk factors described by cancer agencies">
              <ul>
                {symptomsPage.risks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </InfoCard>
          </div>
        </div>
      </section>
      <section className="section section-alt">
        <div className="container">
          <SectionHeading title="Questions people often ask" />
          <FAQ items={symptomsPage.faqs} />
          <SectionHeading title="Sources" />
          <SourcesList items={sources.filter((item) => ['acs', 'who-cc', 'cdc-screening'].includes(item.id))} />
        </div>
      </section>
    </>
  )
}

export default SymptomsPage
