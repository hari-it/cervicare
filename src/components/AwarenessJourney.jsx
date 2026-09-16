import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from './ui/Button'
import Card from './ui/Card'
import ProgressBar from './ui/ProgressBar'
import { useAuth } from '../context/AuthContext'
import { hpvPage, learnPage, preventionPage, screeningPage, symptomsPage } from '../data/education'
import { getLearningProgress, saveTopicProgress } from '../services/progressService'

export const journeyTopics = [
  {
    id: 'cervical-cancer',
    title: 'Understanding Cervical Cancer',
    description: 'Learn how cervical cancer develops and why prevention matters.',
    route: '/learn',
    steps: [learnPage.cards[0], learnPage.cards[1], learnPage.cards[3]],
  },
  {
    id: 'hpv-vaccination',
    title: 'HPV & Vaccination',
    description: 'Understand HPV, what vaccines do, and when to ask a clinician.',
    route: '/hpv-vaccination',
    steps: [hpvPage.cards[0], hpvPage.cards[1], hpvPage.cards[2]],
  },
  {
    id: 'prevention',
    title: 'Prevention',
    description: 'Explore the complementary ways public health supports prevention.',
    route: '/prevention',
    steps: [preventionPage.cards[0], preventionPage.cards[1], preventionPage.cards[2]],
  },
  {
    id: 'screening',
    title: 'Screening',
    description: 'Learn what screening is and why follow-up matters.',
    route: '/screening',
    steps: [screeningPage.cards[0], screeningPage.cards[1], screeningPage.cards[2]],
  },
  {
    id: 'symptoms-risk-factors',
    title: 'Symptoms & Risk Factors',
    description: 'Review educational information without turning it into a diagnosis.',
    route: '/symptoms',
    steps: [
      {
        title: 'Symptoms can have many causes',
        body: symptomsPage.intro,
      },
      {
        title: 'Examples to discuss with a clinician',
        body: symptomsPage.symptoms.join('. ') + '.',
      },
      {
        title: 'Risk information is not a score',
        body: symptomsPage.faqs[1].a,
      },
    ],
  },
]

function AwarenessJourney() {
  const { user } = useAuth()
  const [selectedTopicId, setSelectedTopicId] = useState(null)
  const [step, setStep] = useState(0)
  const [progressByTopic, setProgressByTopic] = useState({})
  const [progressError, setProgressError] = useState('')
  const selectedTopic = journeyTopics.find((topic) => topic.id === selectedTopicId)

  useEffect(() => {
    let active = true
    if (!user) {
      setProgressByTopic({})
      return undefined
    }

    getLearningProgress(user.id)
      .then((rows) => {
        if (!active) return
        setProgressByTopic(
          rows.reduce((result, row) => {
            result[row.topic] = row
            return result
          }, {}),
        )
      })
      .catch(() => {
        if (active) setProgressError('Saved learning progress could not be loaded right now.')
      })

    return () => {
      active = false
    }
  }, [user])

  function persistProgress(topic, completedSteps) {
    if (!user) return
    const completed = completedSteps === 3
    const current = progressByTopic[topic.id]
    if (current?.completed_steps === completedSteps && current?.completed === completed) return

    setProgressByTopic((previous) => ({
      ...previous,
      [topic.id]: {
        ...previous[topic.id],
        topic: topic.id,
        completed_steps: completedSteps,
        total_steps: 3,
        completed,
      },
    }))
    saveTopicProgress(user.id, topic.id, completedSteps, completed).catch(() => {
      setProgressError('Your latest learning progress could not be saved. Please try again.')
    })
  }

  function selectTopic(topicId) {
    setSelectedTopicId(topicId)
    const savedSteps = progressByTopic[topicId]?.completed_steps || 0
    setStep(Math.min(savedSteps, 2))
    setProgressError('')
    const topic = journeyTopics.find((item) => item.id === topicId)
    if (topic && savedSteps === 0) persistProgress(topic, 1)
  }

  function returnToTopics() {
    setSelectedTopicId(null)
    setStep(0)
    setProgressError('')
  }

  return (
    <div className="journey-shell">
      {!selectedTopic ? (
        <>
          <div className="journey-intro">
            <p className="eyebrow">A guided learning experience</p>
            <h1>Your Cervical Health Awareness Journey</h1>
            <p>
              Explore important cervical-health topics through concise, educational steps designed to support your
              understanding at your own pace.
            </p>
          </div>
          <div className="journey-topic-grid">
            {journeyTopics.map((topic) => (
              <button key={topic.id} type="button" className="journey-topic-card" onClick={() => selectTopic(topic.id)}>
                <span className="journey-topic-number">0{journeyTopics.indexOf(topic) + 1}</span>
                <h2>{topic.title}</h2>
                <p>{topic.description}</p>
                {progressByTopic[topic.id]?.completed ? <span className="journey-topic-status">Completed</span> : null}
                <span className="journey-topic-link">Begin topic</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <Card className="journey-learning-card">
          <div className="journey-learning-header">
            <div>
              <p className="eyebrow">{selectedTopic.title}</p>
              <h1>Step {step + 1} of 3</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={returnToTopics}>
              Return to Topics
            </Button>
          </div>
          <ProgressBar value={step + 1} max={3} label={`Step ${step + 1} of 3`} />
          {progressError ? <p className="form-error">{progressError}</p> : null}
          <div className="journey-step-card">
            <p className="journey-step-kicker">Step {step + 1} of 3</p>
            <h2>{selectedTopic.steps[step].title}</h2>
            <p>{selectedTopic.steps[step].body}</p>
          </div>
          {step === 2 ? (
            <div className="journey-complete">
              <h2>You've completed this learning journey.</h2>
              <p>Keep exploring reliable information and choose the next step that feels useful to you.</p>
              <div className="journey-actions">
                <Button type="button" onClick={returnToTopics}>
                  Explore another topic
                </Button>
                <Button to={selectedTopic.route} variant="outline">
                  Learn more on CERVICARE
                </Button>
                <Button to="/find-care" variant="ghost">
                  Find Care
                </Button>
              </div>
            </div>
          ) : (
            <div className="journey-step-nav">
              <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>
                Previous
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const nextStep = step + 1
                  setStep(nextStep)
                  persistProgress(selectedTopic, nextStep + 1)
                }}
              >
                Next
              </Button>
            </div>
          )}
          <p className="journey-back-link">
            <Link to={selectedTopic.route}>Open the full {selectedTopic.title.toLowerCase()} page</Link>
          </p>
        </Card>
      )}
    </div>
  )
}

export default AwarenessJourney
