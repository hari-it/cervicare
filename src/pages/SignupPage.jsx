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

  async function handleSubmit({ email, password, fullName }) {
    setError('')
    setNotice('')
    setLoading(true)
    try {
      const data = await signUp(email, password, fullName)
      if (data?.session) {
        navigate('/')
        return
      }
      setNotice('Account created. If email confirmation is enabled, check your inbox before logging in.')
    } catch (err) {
      setError(err.message || 'Unable to create an account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHero eyebrow="Account" title="Sign up" subtitle="Create an account when Supabase Auth is connected. No secrets are stored in the app code." />
      <Card className="auth-card">
        {!configured ? (
          <p className="form-error">
            Authentication is not connected yet. Check the Supabase environment configuration, then restart the dev server.
          </p>
        ) : null}
        {notice ? <p>{notice}</p> : null}
        <AuthForm mode="signup" onSubmit={handleSubmit} error={error} loading={loading} />
      </Card>
    </>
  )
}

export default SignupPage
