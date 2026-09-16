import { useMemo, useState } from 'react'
import QuestionnaireStep from '../components/features/self-check/QuestionnaireStep'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Disclaimer from '../components/ui/Disclaimer'
import InfoCard from '../components/ui/InfoCard'
import PageHero from '../components/ui/PageHero'
import ProgressBar from '../components/ui/ProgressBar'
import { medicalDisclaimer } from '../data/education'
import { buildGuidance, questionnaireIntro, questionnaireQuestions } from '../data/questionnaire'

const learningLinks = [
  { label: 'Learn about cervical cancer', to: '/learn' },
  { label: 'Prevention', to: '/prevention' },
  { label: 'HPV & Vaccination', to: '/hpv-vaccination' },
  { label: 'Screening', to: '/screening' },
  { label: 'Symptoms & Risk Factors', to: '/symptoms' },
  { label: 'Find Care', to: '/find-care' },
]

function SelfCheckPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [complete, setComplete] = useState(false)
  const question = questionnaireQuestions[step]
  const selected = answers[question?.id]
  const guidance = useMemo(() => (complete ? buildGuidance(answers) : []), [complete, answers])

  function select(value) {
    setAnswers((current) => ({ ...current, [question.id]: value }))
  }

  function next() {
    if (step === questionnaireQuestions.length - 1) {
      setComplete(true)
      return
    }
    setStep((value) => value + 1)
  }

  function restart() {
    setStep(0)
    setAnswers({})
    setComplete(false)
  }

  return (
    <>
      <PageHero eyebrow="Educational tool" title={questionnaireIntro.title} subtitle={questionnaireIntro.subtitle} />
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <Disclaimer variant="warning">{medicalDisclaimer} Your answers never produce a cancer probability, risk score, or diagnosis.</Disclaimer>
          {!complete ? (
            <Card style={{ marginTop: '1.4rem' }}>
              <p>
                Question {step + 1} of {questionnaireQuestions.length}
              </p>
              <ProgressBar value={step + 1} max={questionnaireQuestions.length} label="Questionnaire progress" />
              <div style={{ marginTop: '1.2rem' }}>
                <QuestionnaireStep
                  question={question}
                  selected={selected}
                  onSelect={select}
                  onPrev={() => setStep((value) => Math.max(0, value - 1))}
                  onNext={next}
                  isFirst={step === 0}
                  isLast={step === questionnaireQuestions.length - 1}
                  canContinue={Boolean(selected)}
                />
              </div>
            </Card>
          ) : (
            <div style={{ marginTop: '1.4rem' }}>
              <SectionComplete />
              <Card className="self-check-summary-card">
                <h2>Your awareness snapshot</h2>
                <p>Here is a neutral summary of the options you selected for your own reflection.</p>
                <dl className="self-check-summary-list">
                  {questionnaireQuestions.map((item) => {
                    const selectedOption = item.options.find((option) => option.value === answers[item.id])
                    return (
                      <div key={item.id}>
                        <dt>{item.prompt}</dt>
                        <dd>{selectedOption?.label || 'No response recorded'}</dd>
                      </div>
                    )
                  })}
                </dl>
              </Card>
              <div className="grid-2" style={{ marginTop: '1rem' }}>
                {guidance.map((card) => (
                  <InfoCard key={card.title} {...card} />
                ))}
              </div>
              <Card className="self-check-links-card">
                <h2>Keep learning</h2>
                <p>Explore the CERVICARE topics most useful to you.</p>
                <div className="self-check-links">
                  {learningLinks.map((link) => (
                    <Button key={link.to} to={link.to} variant="outline" size="sm">
                      {link.label}
                    </Button>
                  ))}
                </div>
              </Card>
              <div className="hero-actions" style={{ marginTop: '1.4rem' }}>
                <Button variant="ghost" onClick={restart}>
                  Start again
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function SectionComplete() {
  return (
    <>
      <h2>Educational guidance</h2>
      <p>
        Thank you for completing the check. Your responses are for learning and reflection only. Use the cards below as
        general educational points, then speak with a qualified healthcare professional about your own situation.
      </p>
    </>
  )
}

export default SelfCheckPage
