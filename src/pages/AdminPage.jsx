import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHero from '../components/ui/PageHero'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'
import { getDonorAccessRequests, reviewDonorAccess } from '../services/adminService'
import { getPublishedCaseCount, getReviewerCases, getReviewerHospitals, reviewHospital, reviewPatientCase } from '../services/supportService'

function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [hospitals, setHospitals] = useState([])
  const [cases, setCases] = useState([])
  const [donors, setDonors] = useState([])
  const [publishedCount, setPublishedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  async function loadManagement() {
    setLoading(true)
    setError('')
    try {
      const [nextHospitals, nextCases, nextDonors, nextPublishedCount] = await Promise.all([
        getReviewerHospitals(user.id),
        getReviewerCases(user.id),
        getDonorAccessRequests(user.id),
        getPublishedCaseCount(user.id),
      ])
      setHospitals(nextHospitals)
      setCases(nextCases)
      setDonors(nextDonors)
      setPublishedCount(nextPublishedCount)
    } catch (loadError) {
      setError(loadError.message || 'Admin management data could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && isAdmin) loadManagement()
  }, [user, isAdmin])

  if (authLoading) return <Spinner label="Checking administrator access" />
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />

  async function handleAction(id, action) {
    if (action === 'reject' && !window.confirm('Reject this request? This action cannot be undone from the dashboard.')) return
    setActionId(id)
    setNotice('')
    setError('')
    try {
      if (action === 'hospital-approve' || action === 'hospital-reject') {
        const hospital = hospitals.find((item) => item.id === id)
        const representative = hospital?.hospital_representatives?.find((item) => item.status === 'pending')
        if (!representative) throw new Error('No pending representative is attached to this hospital.')
        await reviewHospital(id, representative.user_id, action === 'hospital-approve' ? 'approve' : 'reject')
      } else if (action === 'case-approve' || action === 'case-reject') {
        await reviewPatientCase(id, action === 'case-approve' ? 'approve' : 'reject')
      } else {
        await reviewDonorAccess(id, action === 'donor-approve' ? 'approve' : 'reject')
      }
      setNotice('Management action completed successfully.')
      await loadManagement()
    } catch (actionError) {
      setError(actionError.message || 'The management action could not be completed.')
    } finally {
      setActionId('')
    }
  }

  return (
    <>
      <PageHero eyebrow="CERVICARE administration" title="Admin Dashboard" subtitle="Review hospitals, patient cases, and donor access through the existing human-controlled workflows." />
      <section className="section admin-section">
        <div className="container">
          {loading ? <Spinner label="Loading admin management" /> : null}
          {error ? <p className="form-error">{error}</p> : null}
          {notice ? <p className="support-notice">{notice}</p> : null}
          {!loading ? (
            <>
              <div className="admin-overview-grid">
                <StatCard label="Pending hospitals" value={hospitals.length} />
                <StatCard label="Cases awaiting review" value={cases.length} />
                <StatCard label="Pending donor requests" value={donors.length} />
                <StatCard label="Published cases" value={publishedCount} />
              </div>
              <ManagementSection title="Hospital Management" count={hospitals.length}>
                {!hospitals.length ? <EmptyState title="No hospitals awaiting action" body="New registrations will appear here after submission." /> : hospitals.map((hospital) => (
                  <ManagementRow key={hospital.id} title={hospital.name} details={`${hospital.city || 'Location pending'} · ${hospital.region || 'Region pending'} · Registered ${formatDate(hospital.created_at)}`} status={hospital.verification_status}>
                    <details className="admin-details">
                      <summary>View details</summary>
                      <p>Website: {hospital.official_website || 'Not provided'}</p>
                      <p>Representative ID: {hospital.hospital_representatives?.find((item) => item.status === 'pending')?.user_id || 'Not available'}</p>
                    </details>
                    <span className="admin-detail">Representative: {hospital.hospital_representatives?.find((item) => item.status === 'pending')?.user_id || 'Not available'}</span>
                    <Button size="sm" disabled={actionId === hospital.id} onClick={() => handleAction(hospital.id, 'hospital-approve')}>Approve</Button>
                    <Button size="sm" variant="outline" disabled={actionId === hospital.id} onClick={() => handleAction(hospital.id, 'hospital-reject')}>Reject</Button>
                  </ManagementRow>
                ))}
              </ManagementSection>
              <ManagementSection title="Patient Case Management" count={cases.length}>
                {!cases.length ? <EmptyState title="No patient cases awaiting review" body="Cases appear after hospital verification." /> : cases.map((item) => (
                  <ManagementRow key={item.id} title={item.case_reference} details={`${item.hospitals?.name || 'Hospital pending'} · Updated ${formatDate(item.updated_at || item.created_at)}`} status={item.admin_verification_status}>
                    <details className="admin-details">
                      <summary>View details</summary>
                      <p>Hospital status: {item.hospital_verification_status}</p>
                      <p>Case status: {item.case_status}</p>
                      <p>Estimated cost: {Number(item.estimated_treatment_cost || 0).toFixed(2)} · Received: {Number(item.assistance_received || 0).toFixed(2)}</p>
                      <p>Case information: {item.diagnosis_description || 'Not provided'}</p>
                    </details>
                    <span className="admin-detail">{item.treatment_description || item.diagnosis_description || 'Case information not provided'} · Requested {Number(item.assistance_requested || 0).toFixed(2)}</span>
                    <Button size="sm" disabled={actionId === item.id} onClick={() => handleAction(item.id, 'case-approve')}>Approve for donors</Button>
                    <Button size="sm" variant="outline" disabled={actionId === item.id} onClick={() => handleAction(item.id, 'case-reject')}>Reject</Button>
                  </ManagementRow>
                ))}
              </ManagementSection>
              <ManagementSection title="Donor Management" count={donors.length}>
                {!donors.length ? <EmptyState title="No donor requests awaiting approval" body="Donor selections remain pending until an administrator approves access." /> : donors.map((donor) => (
                  <ManagementRow key={donor.id} title={donor.full_name || donor.email} details={`${donor.email} · Requested ${formatDate(donor.created_at)}`} status={donor.status}>
                    <details className="admin-details">
                      <summary>View details</summary>
                      <p>User ID: {donor.user_id}</p>
                      <p>Request status: {donor.status}</p>
                    </details>
                    <Button size="sm" disabled={actionId === donor.id} onClick={() => handleAction(donor.id, 'donor-approve')}>Approve donor</Button>
                    <Button size="sm" variant="outline" disabled={actionId === donor.id} onClick={() => handleAction(donor.id, 'donor-reject')}>Reject</Button>
                  </ManagementRow>
                ))}
              </ManagementSection>
              <ManagementSection title="Support Management / Overview">
                <p className="support-muted">Published cases are available to approved donors only after both hospital verification and CERVICARE approval.</p>
              </ManagementSection>
            </>
          ) : null}
        </div>
      </section>
    </>
  )
}

function ManagementSection({ title, count, children }) {
  return <Card className="admin-management-card"><div className="admin-section-heading"><h2>{title}</h2>{count !== undefined ? <span className="support-status-badge">{count}</span> : null}</div><div className="admin-list">{children}</div></Card>
}

function ManagementRow({ title, details, status, children }) {
  return <article className="admin-row"><div className="admin-row-main"><div><h3>{title}</h3><p>{details}</p></div><span className="support-status-badge">{status}</span></div><div className="admin-row-actions">{children}</div></article>
}

function StatCard({ label, value }) {
  return <Card className="admin-stat-card"><span>{label}</span><strong>{value}</strong></Card>
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : 'Date unavailable'
}

export default AdminPage