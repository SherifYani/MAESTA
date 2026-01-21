/**
 * @file App.js
 * @description Main application router with all route definitions
 * @author Mohamed Amin
 * @date 2025-10-01
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-1-20
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/globals.css";
import "./styles/App.css";
// Auth Pages
import RegistrationPage from "./pages/auth/registration-page.jsx";
import ForgetPasswordPage from "./pages/auth/ForgetPasswordPage.jsx";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage.jsx";
import VerificationEmailPage from "./pages/auth/VerificationEmailPage.jsx";
import LoginForm from "./pages/Login.jsx";

// Onboarding
import OnboardingPage from "./pages/onboarding/OnboardingPage.jsx";

// Landing Page
import LandingPage from "./pages/landing-page.tsx";
import ErrorPage from "./pages/ErrorPage.jsx";

// Dashboard Components
import DashboardLayout from "./pages/dashboard/layout/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";

import AdminDashboard from "./pages/dashboard/tabs/admin/AdminDashboard.jsx";
import { RoleBasedProfile, RoleBasedEditProfile } from "./pages/dashboard/RoleBasedRoutes";

// Jobseeker Dashboard Pages
import RecommendedJobs from "./pages/dashboard/tabs/jobseeker/components/RecommendedJobs/RecommendedJobs.jsx";
import SavedJobs from "./pages/dashboard/tabs/jobseeker/components/SavedJobs/SavedJobs.jsx";
import DetailedApplications from "./pages/dashboard/tabs/jobseeker/components/DetailedApplications/DetailedApplications.jsx"
// Import test data
import {
  JOB_SEEKER_RECOMMENDED_JOBS,
  JOB_SEEKER_APPLICATIONS,
  JOB_SEEKER_SAVED_JOBS
} from './pages/dashboard/config/dashboard.config';

const RecommendedJobsWithData = () => (
  <RecommendedJobs
    jobs={JOB_SEEKER_RECOMMENDED_JOBS}
    onJobSave={(jobId, saved) => console.log(`Job ${jobId} ${saved ? 'saved' : 'unsaved'}`)}
    onJobApply={(jobId) => console.log(`Applied to job ${jobId}`)}
  />
);

const SavedJobsWithData = () => (
  <SavedJobs
    jobs={JOB_SEEKER_SAVED_JOBS}
    onRemoveJob={(jobId) => console.log(`Remove job ${jobId}`)}
    onViewJob={(jobId) => console.log(`View job ${jobId}`)}
    onApplyJob={(jobId) => console.log(`Apply to job ${jobId}`)}
  />
);

const DetailedApplicationsWithData = () => (
  <DetailedApplications
    applications={JOB_SEEKER_APPLICATIONS}
    stats={{
      total: JOB_SEEKER_APPLICATIONS.length,
      underReview: JOB_SEEKER_APPLICATIONS.filter(app => app.status === 'review' || app.status === 'under-review').length,
      interview: JOB_SEEKER_APPLICATIONS.filter(app => app.status === 'interview').length,
      offers: JOB_SEEKER_APPLICATIONS.filter(app => app.status === 'offer' || app.status === 'accepted').length,
      rejected: JOB_SEEKER_APPLICATIONS.filter(app => app.status === 'rejected').length
    }}
    onViewApplication={(appId) => console.log(`View application ${appId}`)}
    onWithdrawApplication={(appId) => console.log(`Withdraw application ${appId}`)}
  />
);


/**
 * Main App component with routing configuration
 * @returns {JSX.Element} The main application router
 */
function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/forget" element={<ForgetPasswordPage />} />
      <Route path="/reset" element={<ResetPasswordPage />} />
      <Route path="/verify" element={<VerificationEmailPage />} />
      <Route path="/register/onboarding" element={<OnboardingPage />} />

      {/* Dashboard Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* General Routes for all roles */}
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<RoleBasedProfile />} />
        <Route path="profile/edit" element={<RoleBasedEditProfile />} />

        {/* Jobseeker Specific Routes */}
        <Route path="recommended-jobs" element={<RecommendedJobsWithData />} />
        <Route path="saved-jobs" element={<SavedJobsWithData />} />
        <Route path="applications" element={<DetailedApplicationsWithData />} />
        {/* Admin Dashboard Routes */}
        <Route element={<AdminDashboard />}></Route>
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;
