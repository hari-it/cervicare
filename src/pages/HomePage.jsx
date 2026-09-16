import CtaBand from '../components/features/home/CtaBand'
import Button from '../components/ui/Button'
import Disclaimer from '../components/ui/Disclaimer'
import InfoCard from '../components/ui/InfoCard'
import SectionHeading from '../components/ui/SectionHeading'
import StatCard from '../components/ui/StatCard'
import { homeContent, medicalDisclaimer } from '../data/education'

function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="brand">{homeContent.hero.brand}</p>
            <h1>{homeContent.hero.headline}</h1>
            <p className="hero-tagline">{homeContent.hero.tagline}</p>
            <p>{homeContent.hero.description}</p>
            <div className="hero-actions">
              <Button to="/learn">Learn About Cervical Cancer</Button>
              <Button to="/find-care" variant="outline">
                Find Screening Support
              </Button>
            </div>
          </div>
          <div className="hero-panel" aria-hidden="true">
            <span />
            <h2>Education first. Care next.</h2>
            <p>Vaccination, screening, and timely clinical advice save lives. CERVICARE helps you understand why.</p>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionHeading
            title="What public health agencies report"
            subtitle="Only statements that can be attributed to authoritative sources are shown. Unverified local numbers are left as placeholders."
          />
          <div className="grid-2">
            {homeContent.stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading title="What is cervical cancer?" align="left" />
          <div className="grid-2">
            <InfoCard
              title="A cancer of the cervix"
              body="It begins in the cells of the cervix. WHO identifies persistent high-risk HPV infection as the main cause of cervical cancer."
            />
            <InfoCard
              title="Often silent at first"
              body="Precancer and early disease frequently have no symptoms. That is why screening is recommended even when a person feels well."
            />
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionHeading
            title="Why awareness matters"
            subtitle="Information cannot replace a clinician, but it can help people recognise when to seek screening, vaccination, and professional advice."
          />
          <div className="grid-3">
            <InfoCard title="Know the cause" body="HPV is common. Persistent high-risk infection is the concern, not a one-time exposure by itself." />
            <InfoCard title="Know the tools" body="Vaccination and screening are complementary. One does not fully replace the other." />
            <InfoCard title="Know the limits" body="Websites cannot diagnose. Unusual bleeding or pain should be discussed with a qualified professional." />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading title="Prevention" align="left" subtitle="HPV vaccination, screening, not smoking, and safer sexual health practices all play a role." />
          <Button to="/prevention" variant="secondary">
            Explore prevention
          </Button>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionHeading title="HPV and vaccination" align="left" subtitle="Vaccines prevent infection with the HPV types that cause most cervical cancers. They do not treat cancer." />
          <Button to="/hpv-vaccination">Learn about HPV vaccines</Button>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading title="Screening" align="left" subtitle="Screening looks for HPV or cell changes before cancer develops. Tests and intervals follow national programmes." />
          <Button to="/screening" variant="secondary">
            Understand screening
          </Button>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <CtaBand
            title="Self-Awareness Check"
            body="A short educational questionnaire. It does not diagnose cancer or calculate risk."
            to="/self-check"
            actionLabel="Start the check"
          />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <CtaBand
            variant="green"
            title="Find care and support"
            body="Search sample listings and official government scheme links. Live directories can connect through Supabase later."
            to="/find-care"
            actionLabel="Open Find Care"
          />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionHeading
            title="Government and NGO support"
            subtitle="India’s public programmes include Ayushman Bharat PM-JAY and the National Health Mission. Confirm eligibility on official sites. Sample NGO rows in Find Care are labelled DEMO."
          />
          <Disclaimer>{medicalDisclaimer}</Disclaimer>
        </div>
      </section>
    </>
  )
}

export default HomePage
