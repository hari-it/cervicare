import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Disclaimer from '../components/ui/Disclaimer'
import EmptyState from '../components/ui/EmptyState'
import PageHero from '../components/ui/PageHero'
import SectionHeading from '../components/ui/SectionHeading'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'
import { getMyPatientCases, getVerifiedHospitals, submitPatientCase } from '../services/supportService'

const initialForm = {
  caseInformation: '',
  treatmentInformation: '',
  hospitalId: '',
  estimatedTreatmentCost: '',
  assistanceRequested: '',
}

function PatientSupportPage() {
  const { user, loading: authLoading } = useAuth()
  const [hospitals, setHospitals] = useState([])
  const [cases, setCases] = useState([])
  const [form, setForm] = useState(initialForm)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadSupportData() {
    setLoading(true)
    setError('')
    try {
      const [verifiedHospitals, patientCases] = await Promise.all([
        getVerifiedHospitals(),
        getMyPatientCases(user.id),
      ])
      setHospitals(verifiedHospitals)
      setCases(patientCases)
    } catch {
      setError('Support case information could not be loaded right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) loadSupportData()
  }, [user])

  if (authLoading) return <Spinner label="Restoring your session" />
  if (!user) return <Navigate to="/login" replace />

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setNotice('')
    try {
      if (Number(form.estimatedTreatmentCost) < 0 || Number(form.assistanceRequested) < 0) {
        throw new Error('Amounts must be zero or greater.')
      }
      if (files.some((file) => file.size > 10 * 1024 * 1024)) {
        throw new Error('Each document must be 10 MB or smaller.')
      }
      const createdCase = await submitPatientCase(user.id, form, files)
      setForm(initialForm)
      setFiles([])
      setNotice(`Case ${createdCase.case_reference} was submitted for hospital verification.`)
      await loadSupportData()
    } catch (submissionError) {
      setError(submissionError.message || 'The support case could not be submitted.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Patient support"
        title="Request financial support"
        subtitle="Submit a documented support case for human hospital and CERVICARE review."
      />
      <section className="section support-section">
        <div className="container">
          <Disclaimer>
            CERVICARE does not diagnose cancer or automatically verify documents. Uploaded evidence is reviewed by authorized humans and is never shown to donors.
          </Disclaimer>
          {error ? <p className="form-error">{error}</p> : null}
          {notice ? <p className="support-notice">{notice}</p> : null}

          <Card className="support-registration-card">
            <SectionHeading
              align="left"
              title="Submit a support case"
              subtitle="Use information from your existing medical and treatment documents. Submission does not mean approval."
            />
            {loading ? <Spinner label="Loading verified hospitals" /> : null}
            {!loading && !hospitals.length ? (
              <EmptyState title="No verified hospitals available" body="A verified hospital must be available before a case can be submitted." />
            ) : null}
            {!loading && hospitals.length ? (
              <form className="support-form" onSubmit={handleSubmit}>
                <div className="support-form-grid">
                  <label>
                    Hospital
                    <select required value={form.hospitalId} onChange={(event) => updateField('hospitalId', event.target.value)}>
                      <option value="">Select a verified hospital</option>
                      {hospitals.map((hospital) => (
                        <option key={hospital.id} value={hospital.id}>
                          {hospital.name} · {hospital.city || hospital.region || 'Location pending'}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Estimated treatment cost
                    <input required min="0" step="0.01" type="number" value={form.estimatedTreatmentCost} onChange={(event) => updateField('estimatedTreatmentCost', event.target.value)} />
                  </label>
                  <label>
                    Financial assistance requested
                    <input required min="0" step="0.01" type="number" value={form.assistanceRequested} onChange={(event) => updateField('assistanceRequested', event.target.value)} />
                  </label>
                  <label>
                    Supporting documents
                    <input type="file" multiple accept=".pdf,image/jpeg,image/png" onChange={(event) => setFiles(Array.from(event.target.files || []))} />
                    <span className="support-field-hint">Private PDF, JPG, or PNG files up to 10 MB each.</span>
                  </label>
                </div>
                <label>
                  Case information from your documents
                  <textarea required rows="5" value={form.caseInformation} onChange={(event) => updateField('caseInformation', event.target.value)} />
                </label>
                <label>
                  Treatment information from your documents
                  <textarea required rows="5" value={form.treatmentInformation} onChange={(event) => updateField('treatmentInformation', event.target.value)} />
                </label>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting case...' : 'Submit support case'}
                </Button>
              </form>
            ) : null}
          </Card>

          <Card className="support-card-spacing">
            <SectionHeading
              align="left"
              title="Your submitted cases"
              subtitle="Track review status and support amounts. Donors see only cases approved for donor viewing."
            />
            {loading ? <Spinner label="Loading submitted cases" /> : null}
            {!loading && !cases.length ? <p className="support-muted">You have not submitted a support case yet.</p> : null}
            <div className="support-case-list">
              {cases.map((item) => <PatientCaseCard key={item.id} item={item} />)}
            </div>
          </Card>
        </div>
      </section>
    </>
  )
}

function PatientCaseCard({ item }) {
  const requested = Number(item.assistance_requested || 0)
  const received = Number(item.assistance_received || 0)
  const remaining = Math.max(0, requested - received)
  let status = 'Submitted - pending hospital verification'
  if (item.hospital_verification_status === 'rejected' || item.admin_verification_status === 'rejected') {
    status = 'Rejected'
  } else if (item.admin_verification_status === 'approved' && item.case_status === 'published') {
    status = 'Approved for donors'
  } else if (item.hospital_verification_status === 'verified') {
    status = 'Pending CERVICARE review'
  }

  return (
    <article className="support-case-card">
      <div className="support-case-heading">
        <div>
          <h3>{item.case_reference}</h3>
          <p>{item.hospitals?.name || 'Hospital assignment'} · {item.hospitals?.city || item.hospitals?.region || 'Location pending'}</p>
        </div>
        <span className="support-status-badge">{status}</span>
      </div>
      <dl className="support-case-details">
        <div><dt>Hospital verification</dt><dd>{item.hospital_verification_status}</dd></div>
        <div><dt>CERVICARE review</dt><dd>{item.admin_verification_status}</dd></div>
        <div><dt>Assistance requested</dt><dd>{requested.toFixed(2)}</dd></div>
        <div><dt>Assistance received</dt><dd>{received.toFixed(2)}</dd></div>
        <div><dt>Remaining assistance</dt><dd>{remaining.toFixed(2)}</dd></div>
        <div><dt>Documents</dt><dd>{item.documents?.length || 0} private metadata record(s)</dd></div>
      </dl>
    </article>
  )
}

export default PatientSupportPage
