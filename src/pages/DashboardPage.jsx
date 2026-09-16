import { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { journeyTopics } from '../components/AwarenessJourney'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Disclaimer from '../components/ui/Disclaimer'
import PageHero from '../components/ui/PageHero'
import ProgressBar from '../components/ui/ProgressBar'
import SectionHeading from '../components/ui/SectionHeading'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'
import { getLearningProgress } from '../services/progressService'

const exploreLinks = [
  {
    title: 'Learn',
    description: 'Understand cervical cancer clearly.',
    to: '/learn',
  },
  {
    title: 'Prevention',
    description: 'Explore educational prevention information.',
    to: '/prevention',
  },
  {
    title: 'HPV & Vaccination',
    description: 'Learn about HPV and vaccines.',
    to: '/hpv-vaccination',
  },
  {
    title: 'Screening',
    description: 'Learn how screening works.',
    to: '/screening',
  },
  {
    title: 'Symptoms & Risk Factors',
    description: 'Review educational information safely.',
    to: '/symptoms',
  },
  {
    title: 'Find Care',
    description: 'Browse verified healthcare resources.',
    to: '/find-care',
  },
]

function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const [progressRows, setProgressRows] = useState([])
  const [progressLoading, setProgressLoading] = useState(true)
  const [progressError, setProgressError] = useState('')

  useEffect(() => {
    let active = true
    if (!user) {
      setProgressRows([])
      setProgressLoading(false)
      return undefined
    }

    setProgressLoading(true)
    getLearningProgress(user.id)
      .then((rows) => {
        if (active) setProgressRows(rows)
      })
      .catch(() => {
        if (active) setProgressError('Learning progress could not be loaded right now.')
      })
      .finally(() => {
        if (active) setProgressLoading(false)
      })

    return () => {
      active = false
    }
  }, [user])

  if (loading) {
    return <Spinner label="Restoring your session" />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const fullName = profile?.full_name?.trim() || user.email
  const progressByTopic = progressRows.reduce((result, row) => {
    result[row.topic] = row
    return result
  }, {})
  const completedTopics = journeyTopics.filter((topic) => progressByTopic[topic.id]?.completed).length
  const hasProgress = progressRows.some((row) => row.completed_steps > 0)
  const allTopicsCompleted = completedTopics === journeyTopics.length
  const nextTopic = journeyTopics.find((topic) => !progressByTopic[topic.id]?.completed)
  const nextTopicProgress = nextTopic ? progressByTopic[nextTopic.id] : null
  const nextStep = nextTopicProgress?.completed_steps || 0

  return (
    <>
      <PageHero
        eyebrow="Your space"
        title={`Welcome, ${fullName}`}
        subtitle="Continue building your cervical health awareness at your own pace."
      />
      <section className="section dashboard-section">
        <div className="container">
          <Disclaimer>
            CERVICARE provides educational information and does not replace professional medical advice.
          </Disclaimer>

          <div className="dashboard-content-grid">
            <Card>
              <SectionHeading
                align="left"
                title="Your Awareness Journey"
                subtitle={allTopicsCompleted ? "You've explored all five Awareness Journey topics." : 'Pick up where you left off in your learning.'}
              />
              {!allTopicsCompleted && nextTopic ? (
                <>
                  <p className="dashboard-next-topic">{nextTopic.title}</p>
                  <p className="dashboard-status">
                    {nextStep > 0 ? `Step ${Math.min(nextStep, 3)} of 3 · In progress` : 'Not started'}
                  </p>
                  <Button to="/awareness-journey">Continue Learning</Button>
                </>
              ) : (
                <div className="dashboard-complete-actions">
                  <p className="dashboard-status">Your learning overview is complete.</p>
                  <Button to="/awareness-journey">Review Awareness Journey</Button>
                  <Button to="/find-care" variant="outline">
                    Find Care
                  </Button>
                </div>
              )}
            </Card>

            <Card>
              <SectionHeading align="left" title="Profile summary" />
              <dl className="dashboard-profile-list">
                <div>
                  <dt>Full name</dt>
                  <dd>{fullName}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{user.email}</dd>
                </div>
              </dl>
            </Card>
          </div>

          <Card className="dashboard-progress-card">
            <SectionHeading
              align="left"
              title="Your Learning Progress"
              subtitle="Track your progress through the educational Awareness Journey."
            />
            {progressLoading ? <Spinner label="Loading learning progress" /> : null}
            {!progressLoading && progressError ? <p className="form-error">{progressError}</p> : null}
            {!progressLoading && !progressError ? (
              <>
                {hasProgress ? (
                  <>
                    <div className="dashboard-progress-summary">
                      <strong>{completedTopics} of {journeyTopics.length} topics completed</strong>
                      <span>{Math.round((completedTopics / journeyTopics.length) * 100)}%</span>
                    </div>
                    <ProgressBar value={completedTopics} max={journeyTopics.length} label="Overall learning progress" />
                  </>
                ) : (
                  <p className="dashboard-progress-empty">Start your awareness journey to track your learning progress.</p>
                )}
                <ul className="dashboard-topic-list">
                  {journeyTopics.map((topic) => {
                    const progress = progressByTopic[topic.id]
                    const status = progress?.completed ? 'Completed' : progress?.completed_steps ? 'In progress' : 'Not started'
                    return (
                      <li key={topic.id}>
                        <span className={progress?.completed ? 'dashboard-topic-check complete' : 'dashboard-topic-check'}>
                          {progress?.completed ? '✓' : '○'}
                        </span>
                        <span>{topic.title}</span>
                        <span className="dashboard-topic-status">{status}</span>
                      </li>
                    )
                  })}
                </ul>
                <Button to="/awareness-journey">
                  {hasProgress ? 'Continue Learning' : 'Start Awareness Journey'}
                </Button>
              </>
            ) : null}
          </Card>

          <Card className="dashboard-explore-card">
            <SectionHeading
              align="left"
              title="Explore CERVICARE"
              subtitle="Return to trusted educational resources whenever you need them."
            />
            <div className="dashboard-explore-grid">
              {exploreLinks.map((resource) => (
                <Link key={resource.to} className="dashboard-explore-link" to={resource.to}>
                  <strong>{resource.title}</strong>
                  <span>{resource.description}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </>
  )
}

export default DashboardPage
