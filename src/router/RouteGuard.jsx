import { Navigate } from 'react-router-dom'
import AccessDenied from '../components/ui/AccessDenied'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'

function RouteGuard({ access, children }) {
  const { user, loading, isAdmin, isHospitalVerified, role } = useAuth()
  if (loading) return <Spinner label="Checking account access" />
  if (!user) return <Navigate to="/login" replace />
  const allowed = access === 'admin'
    ? isAdmin
    : access === 'hospital'
      ? isAdmin || isHospitalVerified
      : access === 'donor'
        ? isAdmin || role === 'donor'
        : isAdmin || role === 'patient'
  if (!allowed) return <AccessDenied />
  return children
}

export function SignedInRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner label="Restoring your session" />
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default RouteGuard