import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthForm from '../components/features/auth/AuthForm'
import Card from '../components/ui/Card'
import PageHero from '../components/ui/PageHero'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const { signIn, configured } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit({ email, password }) {
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Unable to log in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHero eyebrow="Account" title="Log in" subtitle="Accounts are powered by Supabase Auth once credentials are configured." />
      <Card className="auth-card">
        {!configured ? (
          <p className="form-error">
            Authentication is not connected yet. Check the Supabase environment configuration, then restart the dev server.
          </p>
        ) : null}
        <AuthForm mode="login" onSubmit={handleSubmit} error={error} loading={loading} />
      </Card>
    </>
  )
}

export default LoginPage
