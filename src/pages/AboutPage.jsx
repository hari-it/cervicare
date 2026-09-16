import Disclaimer from '../components/ui/Disclaimer'
import InfoCard from '../components/ui/InfoCard'
import PageHero from '../components/ui/PageHero'
import SectionHeading from '../components/ui/SectionHeading'
import SourcesList from '../components/ui/SourcesList'
import { aboutPage, medicalDisclaimer } from '../data/education'
import { sources } from '../data/sources'

function AboutPage() {
  return (
    <>
      <PageHero eyebrow="CERVICARE" title={aboutPage.title} subtitle={aboutPage.mission} />
      <section className="section">
        <div className="container">
          <Disclaimer variant="warning">{medicalDisclaimer}</Disclaimer>
          <SectionHeading title="What CERVICARE is not" align="left" />
          <div className="grid-2">
            {aboutPage.notFor.map((item) => (
              <InfoCard key={item} title={item} body="This platform will never present itself as a substitute for those services." />
            ))}
          </div>
        </div>
      </section>
      <section className="section section-alt">
        <div className="container">
          <SectionHeading title="Sources used across the site" />
          <SourcesList items={sources} />
        </div>
      </section>
    </>
  )
}

export default AboutPage
