import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthForm from '../components/features/auth/AuthForm'
import Card from '../components/ui/Card'
import PageHero from '../components/ui/PageHero'
import { useAuth } from '../context/AuthContext'

function SignupPage() {
  const { signUp, configured } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')

  async function handleSubmit({ email, password, fullName, accountType }) {
    setError('')
    setNotice('')
    setLoading(true)
    try {
      const data = await signUp(email, password, fullName)
      if (data?.session) {
        if (accountType === 'hospital') {
          navigate('/hospital-registration')
          return
        }
        if (accountType === 'donor') {
          setNotice('Account created. Donor access requires trusted approval before the Donor Portal becomes available.')
          return
        }
        navigate('/')
        return
      }
      setNotice(
        accountType === 'hospital'
          ? 'Account created. Confirm your email, then complete hospital registration for independent verification.'
          : accountType === 'donor'
            ? 'Account created. Confirm your email. Donor access requires trusted approval before the Donor Portal becomes available.'
            : 'Account created. If email confirmation is enabled, check your inbox before logging in.',
      )
    } catch (err) {
      setError(err.message || 'Unable to create an account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHero eyebrow="Account" title="Sign up" subtitle="Create your CERVICARE account to access personalized support and resources." />
      <Card className="auth-card">
        {!configured ? (
          <p className="form-error">
            Account creation is temporarily unavailable. Please try again later.
          </p>
        ) : null}
        {notice ? <p>{notice}</p> : null}
        <AuthForm mode="signup" onSubmit={handleSubmit} error={error} loading={loading} />
      </Card>
    </>
  )
}

export default SignupPage
