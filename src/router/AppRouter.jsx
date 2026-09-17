import { Route, Routes } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import AboutPage from '../pages/AboutPage'
import AdminPage from '../pages/AdminPage'
import AwarenessJourneyPage from '../pages/AwarenessJourneyPage'
import DashboardPage from '../pages/DashboardPage'
import DonorPortalPage from '../pages/DonorPortalPage'
import FindCarePage from '../pages/FindCarePage'
import HomePage from '../pages/HomePage'
import HpvVaccinationPage from '../pages/HpvVaccinationPage'
import HospitalVerificationPage from '../pages/HospitalVerificationPage'
import HospitalRegistrationPage from '../pages/HospitalRegistrationPage'
import LearnPage from '../pages/LearnPage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import PatientSupportPage from '../pages/PatientSupportPage'
import PreventionPage from '../pages/PreventionPage'
import ScreeningPage from '../pages/ScreeningPage'
import SelfCheckPage from '../pages/SelfCheckPage'
import SignupPage from '../pages/SignupPage'
import SymptomsPage from '../pages/SymptomsPage'
import RouteGuard, { SignedInRoute } from './RouteGuard'

function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/symptoms" element={<SymptomsPage />} />
        <Route path="/prevention" element={<PreventionPage />} />
        <Route path="/hpv-vaccination" element={<HpvVaccinationPage />} />
        <Route path="/hospital-registration" element={<SignedInRoute><HospitalRegistrationPage /></SignedInRoute>} />
        <Route path="/hospital-verification" element={<RouteGuard access="hospital"><HospitalVerificationPage /></RouteGuard>} />
        <Route path="/support-case" element={<RouteGuard access="patient"><PatientSupportPage /></RouteGuard>} />
        <Route path="/screening" element={<ScreeningPage />} />
        <Route path="/self-check" element={<SelfCheckPage />} />
        <Route path="/find-care" element={<FindCarePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admin" element={<RouteGuard access="admin"><AdminPage /></RouteGuard>} />
        <Route path="/awareness-journey" element={<AwarenessJourneyPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/donor-portal" element={<RouteGuard access="donor"><DonorPortalPage /></RouteGuard>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default AppRouter
