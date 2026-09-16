import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="logo-mark">C</span>
            <span className="logo-text">CERVICARE</span>
          </Link>
          <p className="footer-tagline">Awareness Today. Protection Tomorrow.</p>
          <p className="footer-description">
            Helping people learn about cervical cancer, HPV, vaccination, screening, and
            where to look for support. Educational information only.
          </p>
        </div>

        <div className="footer-links">
          <h3>Explore</h3>
          <Link to="/learn">About cervical cancer</Link>
          <Link to="/prevention">Prevention</Link>
          <Link to="/screening">Screening</Link>
          <Link to="/find-care">Find Care</Link>
        </div>

        <div className="footer-links">
          <h3>Learn</h3>
          <Link to="/symptoms">Symptoms &amp; risk</Link>
          <Link to="/hpv-vaccination">HPV &amp; vaccination</Link>
          <Link to="/self-check">Self-Awareness Check</Link>
        </div>

        <div className="footer-links">
          <h3>Support</h3>
          <Link to="/about">About CERVICARE</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign up</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} CERVICARE. All rights reserved.</p>
        <p>
          CERVICARE does not provide medical diagnosis or treatment. Content is based on
          public health sources listed on educational pages.
        </p>
      </div>
    </footer>
  )
}

export default Footer
