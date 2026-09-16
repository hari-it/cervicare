import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Disclaimer from '../components/ui/Disclaimer'
import PageHero from '../components/ui/PageHero'
import SectionHeading from '../components/ui/SectionHeading'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'
import {
  getAssignedHospitalCases,
  getMyHospitalRepresentations,
  getReviewerCases,
  getReviewerHospitals,
  rejectPatientCase,
  reviewHospital,
  reviewPatientCase,
  requestHospitalRegistration,
  verifyPatientCase,
} from '../services/supportService'

const initialForm = { name: '', city: '', region: '', officialWebsite: '' }

function HospitalVerificationPage() {
  const { user, loading: authLoading } = useAuth()
  const [representations, setRepresentations] = useState([])
  const [assignedCases, setAssignedCases] = useState([])
  const [reviewerHospitals, setReviewerHospitals] = useState([])
  const [reviewerCases, setReviewerCases] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [actionId, setActionId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadPortal() {
    setLoading(true)
    setError('')
    try {
      const nextRepresentations = await getMyHospitalRepresentations(user.id)
      setRepresentations(nextRepresentations)
      const verifiedHospitalIds = nextRepresentations
        .filter((item) => item.status === 'verified' && item.hospitals?.verification_status === 'verified')
        .map((item) => item.hospital_id)
      const [nextCases, nextReviewerHospitals, nextReviewerCases] = await Promise.all([
        getAssignedHospitalCases(user.id, verifiedHospitalIds),
        getReviewerHospitals(user.id),
        getReviewerCases(user.id),
      ])
      setAssignedCases(nextCases)
      setReviewerHospitals(nextReviewerHospitals)
      setReviewerCases(nextReviewerCases)
    } catch {
      setError('The hospital portal could not load right now. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) loadPortal()
  }, [user])

  if (authLoading) return <Spinner label="Restoring your session" />
  if (!user) return <Navigate to="/login" replace />

  async function registerHospital(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setNotice('')
    try {
      await requestHospitalRegistration(user.id, form)
      setForm(initialForm)
      setNotice('Hospital registration submitted for human review.')
      await loadPortal()
    } catch {
      setError('The hospital registration could not be submitted. Please check the details and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCaseAction(caseId, decision) {
    setActionId(caseId)
    setError('')
    setNotice('')
    try {
      if (decision === 'verify') await verifyPatientCase(caseId)
      else await rejectPatientCase(caseId)
      setNotice(decision === 'verify' ? 'Case marked as hospital verified.' : 'Case marked as hospital rejected.')
      await loadPortal()
    } catch {
      setError('This case could not be updated. Confirm that your hospital verification is active.')
    } finally {
      setActionId('')
    }
  }

  async function handleHospitalReview(hospitalId, representativeUserId, decision) {
    setActionId(hospitalId)
    setError('')
    setNotice('')
    try {
      await reviewHospital(hospitalId, representativeUserId, decision)
      setNotice(decision === 'approve' ? 'Hospital approved and representative verified.' : 'Hospital registration rejected.')
      await loadPortal()
    } catch {
      setError('The hospital review could not be completed. Reviewer approval may be required.')
    } finally {
      setActionId('')
    }
  }

  async function handleCaseReview(caseId, decision) {
    setActionId(caseId)
    setError('')
    setNotice('')
    try {
      await reviewPatientCase(caseId, decision)
      setNotice(decision === 'approve' ? 'Case approved for donor viewing.' : 'Case rejected during CERVICARE review.')
      await loadPortal()
    } catch {
      setError('The case review could not be completed.')
    } finally {
      setActionId('')
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Controlled support workflow"
        title="Hospital verification portal"
        subtitle="Hospital representatives can review assigned cases only after their hospital identity has been independently verified."
      />
      <section className="section support-section">
        <div className="container">
          <Disclaimer>
            CERVICARE does not diagnose patients or automatically validate documents. Hospital and CERVICARE reviewer decisions are human-controlled.
          </Disclaimer>
          {loading ? <Spinner label="Loading hospital verification portal" /> : null}
          {error ? <p className="form-error">{error}</p> : null}
          {notice ? <p className="support-notice">{notice}</p> : null}

          {!loading ? (
            <>
              <Card className="support-registration-card">
                <SectionHeading
                  align="left"
                  title="Register a hospital profile"
                  subtitle="Submit official hospital details for independent reviewer approval. This does not verify the hospital automatically."
                />
                <form className="support-form" onSubmit={registerHospital}>
                  <div className="support-form-grid">
                    <label>
                      Hospital name
                      <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                    </label>
                    <label>
                      City
                      <input required value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
                    </label>
                    <label>
                      Region
                      <input required value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })} />
                    </label>
                    <label>
                      Official website
                      <input type="url" value={form.officialWebsite} onChange={(event) => setForm({ ...form, officialWebsite: event.target.value })} />
                    </label>
                  </div>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit for verification'}
                  </Button>
                </form>
              </Card>

              {representations.length ? (
                <Card className="support-card-spacing">
                  <SectionHeading align="left" title="Hospital profile status" />
                  <div className="support-status-list">
                    {representations.map((item) => (
                      <div key={item.id} className="support-status-row">
                        <div>
                          <strong>{item.hospitals?.name || 'Hospital profile'}</strong>
                          <span>{item.hospitals?.city || 'Location pending'}</span>
                        </div>
                        <span className="support-status-badge">{item.status}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : null}

              {representations.some((item) => item.status === 'verified' && item.hospitals?.verification_status === 'verified') ? (
                <Card className="support-card-spacing">
                  <SectionHeading
                    align="left"
                    title="Assigned patient cases"
                    subtitle="Only cases assigned to your verified hospital are shown. Medical document paths are never shown to donors."
                  />
                  {assignedCases.length ? (
                    <div className="support-case-list">
                      {assignedCases.map((item) => (
                        <CaseCard key={item.id} item={item} actionId={actionId} onAction={handleCaseAction} />
                      ))}
                    </div>
                  ) : (
                    <p className="support-muted">No assigned cases are awaiting hospital verification.</p>
                  )}
                </Card>
              ) : null}

              {reviewerHospitals.length || reviewerCases.length ? (
                <Card className="support-card-spacing">
                  <SectionHeading
                    align="left"
                    title="Reviewer approval"
                    subtitle="This panel appears only for users provisioned as CERVICARE reviewers in Supabase."
                  />
                  {reviewerHospitals.map((hospital) => {
                    const representative = hospital.hospital_representatives?.find((item) => item.status === 'pending')
                    return (
                      <div key={hospital.id} className="support-review-row">
                        <div>
                          <strong>{hospital.name}</strong>
                          <span>{hospital.city}, {hospital.region}</span>
                        </div>
                        {representative ? (
                          <div className="support-actions">
                            <Button size="sm" disabled={actionId === hospital.id} onClick={() => handleHospitalReview(hospital.id, representative.user_id, 'approve')}>
                              Approve hospital
                            </Button>
                            <Button size="sm" variant="outline" disabled={actionId === hospital.id} onClick={() => handleHospitalReview(hospital.id, representative.user_id, 'reject')}>
                              Reject
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                  {reviewerCases.map((item) => (
                    <div key={item.id} className="support-review-row">
                      <div>
                        <strong>{item.case_reference}</strong>
                        <span>{item.hospitals?.name || 'Hospital'} · Hospital verified</span>
                      </div>
                      <div className="support-actions">
                        <Button size="sm" disabled={actionId === item.id} onClick={() => handleCaseReview(item.id, 'approve')}>
                          Approve for donors
                        </Button>
                        <Button size="sm" variant="outline" disabled={actionId === item.id} onClick={() => handleCaseReview(item.id, 'reject')}>
                          Reject case
                        </Button>
                      </div>
                    </div>
                  ))}
                </Card>
              ) : null}
            </>
          ) : null}
        </div>
      </section>
    </>
  )
}

function CaseCard({ item, actionId, onAction }) {
  const waiting = ['pending', 'under_review'].includes(item.hospital_verification_status)
  return (
    <article className="support-case-card">
      <div className="support-case-heading">
        <div>
          <h3>{item.case_reference}</h3>
          <p>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Date unavailable'}</p>
        </div>
        <span className="support-status-badge">{item.hospital_verification_status}</span>
      </div>
      <dl className="support-case-details">
        <div><dt>Diagnosis description</dt><dd>{item.diagnosis_description || 'Not provided'}</dd></div>
        <div><dt>Treatment description</dt><dd>{item.treatment_description || 'Not provided'}</dd></div>
        <div><dt>Documents</dt><dd>{item.documents?.length || 0} metadata record(s); files remain private.</dd></div>
      </dl>
      {waiting ? (
        <div className="support-actions">
          <Button size="sm" disabled={actionId === item.id} onClick={() => onAction(item.id, 'verify')}>
            Verify case
          </Button>
          <Button size="sm" variant="outline" disabled={actionId === item.id} onClick={() => onAction(item.id, 'reject')}>
            Reject case
          </Button>
        </div>
      ) : null}
    </article>
  )
}

export default HospitalVerificationPage
