import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Disclaimer from '../components/ui/Disclaimer'
import EmptyState from '../components/ui/EmptyState'
import PageHero from '../components/ui/PageHero'
import SectionHeading from '../components/ui/SectionHeading'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'
import { createSupportIntent, getApprovedSupportCases, getMySupportRecords } from '../services/supportService'

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

function DonorPortalPage() {
  const { user, loading: authLoading } = useAuth()
  const [cases, setCases] = useState([])
  const [supportHistory, setSupportHistory] = useState([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [amounts, setAmounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadCases() {
    setLoading(true)
    setError('')
    try {
      const [approvedCases, history] = await Promise.all([
        getApprovedSupportCases(user.id),
        getMySupportRecords(user.id),
      ])
      setCases(approvedCases)
      setSupportHistory(history)
    } catch {
      setError('Approved support cases could not be loaded right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) loadCases()
  }, [user])

  const visibleCases = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return cases
      .filter((item) => {
        if (filter === 'recent') return Date.now() - new Date(item.updated_at || item.created_at).getTime() <= 30 * 24 * 60 * 60 * 1000
        if (filter === 'support-needed') return Number(item.assistance_requested || 0) > Number(item.assistance_received || 0)
        return true
      })
      .filter((item) => {
        if (!normalizedQuery) return true
        return [item.case_reference, item.hospitals?.name, item.hospitals?.city, item.hospitals?.region]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery))
      })
  }, [cases, filter, query])

  if (authLoading) return <Spinner label="Restoring your session" />
  if (!user) return <Navigate to="/login" replace />

  async function supportCase(item) {
    const requested = Number(item.assistance_requested || 0)
    const received = Number(item.assistance_received || 0)
    const remaining = Math.max(0, requested - received)
    const amount = Number(amounts[item.id])
    if (!Number.isFinite(amount) || amount <= 0 || amount > remaining) {
      setError('Enter an amount greater than zero and no more than the remaining support need.')
      return
    }

    setActionId(item.id)
    setError('')
    setNotice('')
    try {
      await createSupportIntent(user.id, item.id, amount)
      setAmounts((current) => ({ ...current, [item.id]: '' }))
      setNotice(`Support intent recorded for ${item.case_reference}. Status: Pending payment.`)
      await loadCases()
    } catch {
      setError('This support record could not be submitted. The case may no longer be available for support.')
    } finally {
      setActionId('')
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Donor support"
        title="Support verified cases"
        subtitle="Discover patient support cases that have passed hospital verification and CERVICARE review."
      />
      <section className="section donor-section">
        <div className="container">
          <Disclaimer>
            Donor-facing summaries contain no private medical documents or unnecessary patient identity information. Please review the verification status shown on every case.
          </Disclaimer>
          {error ? <p className="form-error">{error}</p> : null}
          {notice ? <p className="support-notice">{notice}</p> : null}

          <Card className="donor-controls-card">
            <label className="donor-search-label" htmlFor="donor-case-search">Search approved cases</label>
            <input
              id="donor-case-search"
              className="search-input"
              type="search"
              placeholder="Search by case reference, hospital, or city"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="filters" role="group" aria-label="Filter support cases">
              {[
                ['all', 'All cases'],
                ['recent', 'Recently approved'],
                ['support-needed', 'Support needed'],
              ].map(([value, label]) => (
                <button key={value} type="button" className={`chip ${filter === value ? 'active' : ''}`} onClick={() => setFilter(value)}>
                  {label}
                </button>
              ))}
            </div>
          </Card>

          <div className="donor-results-heading">
            <SectionHeading align="left" title="Verified Support Cases" subtitle="Only published cases with hospital verification and CERVICARE approval appear here." />
          </div>
          {loading ? <Spinner label="Loading approved support cases" /> : null}
          {!loading && !visibleCases.length ? <EmptyState title="No approved cases found" body="Try another search or filter. New cases appear only after the required human reviews." /> : null}
          <div className="donor-case-grid">
            {visibleCases.map((item) => <DonorCaseCard key={item.id} item={item} amount={amounts[item.id] || ''} onAmountChange={(value) => setAmounts((current) => ({ ...current, [item.id]: value }))} onSupport={() => supportCase(item)} busy={actionId === item.id} />)}
          </div>

          <Card className="donor-history-card">
            <SectionHeading
              align="left"
              title="Your support history"
              subtitle="Prototype support intents are pending payment until a verified payment mechanism updates them."
            />
            {supportHistory.length ? (
              <div className="donor-history-list">
                {supportHistory.map((record) => (
                  <div key={record.id} className="donor-history-row">
                    <div>
                      <strong>{record.patient_cases?.case_reference || 'Support case'}</strong>
                      <span>{new Date(record.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <strong>{currency.format(Number(record.amount || 0))}</strong>
                      <span className="support-status-badge">{record.status === 'pending' ? 'Pending payment' : record.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="support-muted">No support intents recorded yet.</p>
            )}
          </Card>
        </div>
      </section>
    </>
  )
}

function DonorCaseCard({ item, amount, onAmountChange, onSupport, busy }) {
  const requested = Number(item.assistance_requested || 0)
  const received = Number(item.assistance_received || 0)
  const remaining = Math.max(0, requested - received)
  const canSupport = remaining > 0

  return (
    <Card className="donor-case-card">
      <div className="donor-case-card-header">
        <div>
          <span className="badge badge-green">Verified support case</span>
          <h2>{item.case_reference}</h2>
        </div>
        <span className="donor-verified-label">Hospital verified · CERVICARE approved</span>
      </div>
      <dl className="donor-case-details">
        <div><dt>Hospital</dt><dd>{item.hospitals?.name || 'Verified hospital'}</dd></div>
        {item.hospitals?.city ? <div><dt>City</dt><dd>{item.hospitals.city}</dd></div> : null}
        <div><dt>Treatment support needed</dt><dd>{item.treatment_description || 'Treatment details available through the verified case process.'}</dd></div>
        <div><dt>Estimated treatment cost</dt><dd>{currency.format(Number(item.estimated_treatment_cost || 0))}</dd></div>
        <div><dt>Assistance requested</dt><dd>{currency.format(requested)}</dd></div>
        <div><dt>Support received</dt><dd>{currency.format(received)}</dd></div>
        <div><dt>Remaining support need</dt><dd>{currency.format(remaining)}</dd></div>
        <div><dt>Last updated</dt><dd>{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'Not available'}</dd></div>
      </dl>
      {canSupport ? (
        <div className="donor-support-action">
          <label htmlFor={`support-amount-${item.id}`}>Support amount</label>
          <div className="donor-support-input-row">
            <input id={`support-amount-${item.id}`} type="number" min="1" max={remaining} step="0.01" value={amount} onChange={(event) => onAmountChange(event.target.value)} placeholder="Enter amount" />
            <Button size="sm" disabled={busy} onClick={onSupport}>{busy ? 'Recording...' : 'Support This Case'}</Button>
          </div>
        </div>
      ) : (
        <p className="support-muted">This case has no remaining support need recorded.</p>
      )}
    </Card>
  )
}

export default DonorPortalPage
