import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageHero from '../components/ui/PageHero'
import { useAuth } from '../context/AuthContext'
import { requestHospitalRegistration } from '../services/supportService'

const initialForm = { name: '', city: '', region: '', officialWebsite: '' }

function HospitalRegistrationPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setNotice('')
    try {
      await requestHospitalRegistration(user.id, form)
      setForm(initialForm)
      setNotice('Hospital registration submitted for human review. Portal access begins only after approval.')
    } catch {
      setError('The hospital registration could not be submitted. Please check the details and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHero eyebrow="Hospital registration" title="Request hospital verification" subtitle="Submit official hospital details for independent reviewer approval." />
      <section className="section support-section">
        <div className="container">
          {error ? <p className="form-error">{error}</p> : null}
          {notice ? <p className="support-notice">{notice}</p> : null}
          <Card className="support-registration-card">
            <form className="support-form" onSubmit={handleSubmit}>
              <div className="support-form-grid">
                {[
                  ['name', 'Hospital name', true],
                  ['city', 'City', true],
                  ['region', 'Region', true],
                  ['officialWebsite', 'Official website', false],
                ].map(([field, label, required]) => (
                  <label key={field}>
                    {label}
                    <input type={field === 'officialWebsite' ? 'url' : 'text'} required={required} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} />
                  </label>
                ))}
              </div>
              <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit for verification'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/')}>Cancel</Button>
            </form>
          </Card>
        </div>
      </section>
    </>
  )
}

export default HospitalRegistrationPage