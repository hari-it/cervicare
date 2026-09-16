import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'

const learnLinks = [
  { to: '/learn', label: 'About Cervical Cancer' },
  { to: '/symptoms', label: 'Symptoms & Risk Factors' },
  { to: '/prevention', label: 'Prevention' },
  { to: '/hpv-vaccination', label: 'HPV & Vaccination' },
  { to: '/screening', label: 'Screening' },
]

function Navbar() {
  const location = useLocation()
  const { user, profile, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [learnOpen, setLearnOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
    setLearnOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') {
        setLearnOpen(false)
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function handleSignOut() {
    try {
      await signOut()
    } catch {
      /* ignored: still navigate via UI */
    }
  }

  return (
    <nav className="navbar" aria-label="Primary">
      <div className="navbar-container">
        <Link to="/" className="logo">
          <span className="logo-mark">C</span>
          <span className="logo-text">CERVICARE</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>

          <div className={`nav-dropdown ${learnOpen ? 'open' : ''}`}>
            <button
              type="button"
              className="nav-dropdown-toggle"
              aria-expanded={learnOpen}
              aria-haspopup="true"
              onClick={() => setLearnOpen((open) => !open)}
            >
              Learn ▾
            </button>
            <div className="dropdown-menu" role="menu">
              {learnLinks.map((link) => (
                <NavLink key={link.to} to={link.to} role="menuitem">
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          <NavLink to="/self-check">Self-Awareness Check</NavLink>
          <NavLink to="/find-care">Find Care</NavLink>
          <NavLink to="/about">About</NavLink>
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <Button size="sm" variant="ghost" to="/dashboard">
                Dashboard
              </Button>
              <Button size="sm" variant="ghost" to="/hospital-verification">
                Hospital portal
              </Button>
              <Button size="sm" variant="ghost" to="/support-case">
                Support case
              </Button>
              <Button size="sm" variant="ghost" to="/donor-portal">
                Donor portal
              </Button>
              <span className="nav-user" title={user.email}>
                {profile?.full_name?.trim() || user.email}
              </span>
              <Button size="sm" variant="outline" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" to="/login">
                Login
              </Button>
              <Button size="sm" to="/signup">
                Sign up
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={mobileOpen}
          aria-label="Open menu"
          onClick={() => setMobileOpen((open) => !open)}
        >
          ☰
        </button>
      </div>

      <div className={`mobile-panel ${mobileOpen ? 'open' : ''}`}>
        <NavLink to="/" end>
          Home
        </NavLink>
        {learnLinks.map((link) => (
          <NavLink key={link.to} to={link.to}>
            {link.label}
          </NavLink>
        ))}
        <NavLink to="/self-check">Self-Awareness Check</NavLink>
        <NavLink to="/find-care">Find Care</NavLink>
        <NavLink to="/about">About</NavLink>
        {user ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/hospital-verification">Hospital portal</NavLink>
            <NavLink to="/support-case">Support case</NavLink>
            <NavLink to="/donor-portal">Donor portal</NavLink>
            <button type="button" className="linkish" onClick={handleSignOut}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/signup">Sign up</NavLink>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
