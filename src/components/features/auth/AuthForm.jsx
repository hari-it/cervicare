import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../ui/Button'

function AuthForm({ mode, onSubmit, error, loading }) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState('')
  const isSignup = mode === 'signup'

  function handleSubmit(event) {
    event.preventDefault()
    setLocalError('')
    if (isSignup && !fullName.trim()) {
      setLocalError('Please enter your full name.')
      return
    }
    if (!email.trim() || !password || (isSignup && !confirmPassword)) {
      setLocalError('Please complete all required fields.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setLocalError('Please enter a valid email address.')
      return
    }
    if (password.length < 8) {
      setLocalError('Use a password of at least 8 characters.')
      return
    }
    if (isSignup && password !== confirmPassword) {
      setLocalError('Passwords do not match.')
      return
    }
    onSubmit({ email: email.trim(), password, fullName: fullName.trim() })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {(localError || error) && <p className="form-error">{localError || error}</p>}
      {isSignup ? (
        <div className="form-field">
          <label htmlFor="full-name">Full name</label>
          <input
            id="full-name"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
        </div>
      ) : null}
      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      {isSignup ? (
        <div className="form-field">
          <label htmlFor="confirm-password">Confirm password</label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>
      ) : null}
      <Button type="submit" disabled={loading}>
        {loading ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
      </Button>
      <p style={{ marginTop: '1rem' }}>
        {isSignup ? (
          <>
            Already have an account? <Link to="/login">Log in</Link>
          </>
        ) : (
          <>
            Need an account? <Link to="/signup">Sign up</Link>
          </>
        )}
      </p>
    </form>
  )
}

export default AuthForm
