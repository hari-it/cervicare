import { Route, Routes } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import AboutPage from '../pages/AboutPage'
import AwarenessJourneyPage from '../pages/AwarenessJourneyPage'
import DashboardPage from '../pages/DashboardPage'
import DonorPortalPage from '../pages/DonorPortalPage'
import FindCarePage from '../pages/FindCarePage'
import HomePage from '../pages/HomePage'
import HpvVaccinationPage from '../pages/HpvVaccinationPage'
import HospitalVerificationPage from '../pages/HospitalVerificationPage'
import LearnPage from '../pages/LearnPage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import PatientSupportPage from '../pages/PatientSupportPage'
import PreventionPage from '../pages/PreventionPage'
import ScreeningPage from '../pages/ScreeningPage'
import SelfCheckPage from '../pages/SelfCheckPage'
import SignupPage from '../pages/SignupPage'
import SymptomsPage from '../pages/SymptomsPage'

function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/symptoms" element={<SymptomsPage />} />
        <Route path="/prevention" element={<PreventionPage />} />
        <Route path="/hpv-vaccination" element={<HpvVaccinationPage />} />
          <Route path="/hospital-verification" element={<HospitalVerificationPage />} />
          <Route path="/support-case" element={<PatientSupportPage />} />
        <Route path="/screening" element={<ScreeningPage />} />
        <Route path="/self-check" element={<SelfCheckPage />} />
        <Route path="/find-care" element={<FindCarePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/awareness-journey" element={<AwarenessJourneyPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/donor-portal" element={<DonorPortalPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default AppRouter
