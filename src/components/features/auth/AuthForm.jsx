import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../ui/Button'

function AuthForm({ mode, onSubmit, error, loading }) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountType, setAccountType] = useState('')
  const [localError, setLocalError] = useState('')
  const isSignup = mode === 'signup'

  function handleSubmit(event) {
    event.preventDefault()
    setLocalError('')
    const formData = new FormData(event.currentTarget)
    const submittedEmail = String(formData.get('email') || '').trim()
    const submittedPassword = String(formData.get('password') || '')
    const submittedConfirmPassword = String(formData.get('confirm-password') || '')
    if (isSignup && !fullName.trim()) {
      setLocalError('Please enter your full name.')
      return
    }
    if (isSignup && !accountType) {
      setLocalError('Please select an account type.')
      return
    }
    if (!submittedEmail || !submittedPassword || (isSignup && !submittedConfirmPassword)) {
      setLocalError('Please complete all required fields.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submittedEmail)) {
      setLocalError('Please enter a valid email address.')
      return
    }
    if (submittedPassword.length < 8) {
      setLocalError('Use a password of at least 8 characters.')
      return
    }
    if (isSignup && submittedPassword !== submittedConfirmPassword) {
      setLocalError('Passwords do not match.')
      return
    }
    onSubmit({ email: submittedEmail, password: submittedPassword, fullName: fullName.trim(), accountType })
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
          name="email"
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
          name="password"
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
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>
      ) : null}
      {isSignup ? (
        <fieldset className="account-type-fieldset">
          <legend>What type of account are you creating?</legend>
          <div className="account-type-options">
            {[
              ['patient', 'Patient', 'Request and track personal support cases'],
              ['hospital', 'Hospital / Hospital Representative', 'Register a hospital for independent verification'],
              ['donor', 'Donor', 'Support approved patient cases after authorization'],
            ].map(([value, label, description]) => (
              <label key={value} className={`account-type-option ${accountType === value ? 'selected' : ''}`}>
                <input type="radio" name="account-type" value={value} checked={accountType === value} onChange={(event) => setAccountType(event.target.value)} />
                <span>
                  <strong>{label}</strong>
                  <small>{description}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
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
