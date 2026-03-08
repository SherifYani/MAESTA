/**
 * @file App.js
 * @description Main application router with all route definitions
 * @author Mohamed Amin
 * @date 2025-10-01
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-2-6
 */

import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { FloatingAssistantIcon, ChatWindow } from "./components/ai-assistant";
import "./styles/globals.css";
import "./styles/App.css";

// Auth Pages
import RegistrationPage from "./pages/auth/registration-page.jsx";
import ForgetPasswordPage from "./pages/auth/ForgetPasswordPage.jsx";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage.jsx";
import VerificationEmailPage from "./pages/auth/VerificationEmailPage.jsx";
import LoginForm from "./pages/Login.jsx";
import MockLoginPage from "./pages/auth/MockLoginPage.jsx";

// Route Guard
import ProtectedRoute from "./components/common/ProtectedRoute";

// Onboarding
import OnboardingPage from "./pages/onboarding/OnboardingPage.jsx";

// Landing Page
import LandingPage from "./pages/landing-page.tsx";
import ErrorPage from "./pages/ErrorPage.jsx";

// Job Pages
import JobSearchPage from "./pages/jobs/JobSearchPage.jsx";
import JobDetailsPage from "./pages/jobs/JobDetailsPage.jsx";
import JobApplicationPage from "./pages/jobs/JobApplicationPage.jsx";
import JobPostingPage from "./pages/jobs/JobPostingPage.jsx";
import SavedJobsPage from "./pages/jobs/SavedJobsPage.jsx";

// AI Assistant Pages
import CVBuilderPage from "./pages/ai-assistant/CVBuilderPage.jsx";
import CandidateAnalysisPage from "./pages/ai-assistant/CandidateAnalysisPage.jsx";
import SmartSearchPage from "./pages/ai-assistant/SmartSearchPage.jsx";
import AIPostingPage from "./pages/ai-assistant/AIPostingPage.jsx";

// Add these imports for gig pages
import GigListingPage from './pages/gigs/GigListingPage';
import GigDetailsPage from './pages/gigs/GigDetailsPage';
import GigPostingPage from './pages/gigs/GigPostingPage';
import GigBiddingPage from './pages/gigs/GigBiddingPage';
import GigManagementPage from './pages/gigs/GigManagementPage';
import WorkspacePage from './pages/gigs/WorkspacePage';

// Subscription and Payment Pages
import SubscriptionPlansPage from './pages/SubscriptionPlansPage';
import PaymentPage from './pages/PaymentPage';
import { EscrowDashboard, TransactionList } from './components/payment';

// Notification Pages
import { NotificationsCenterPage, NotificationSettingsPage } from './pages/notifications';

// Chat Page
import ChatPage from './pages/chat/ChatPage';

// Context
import { GigProvider } from './context/GigContext';

// Dashboard Components
import MainLayout from "./components/layout/MainLayout";
import DashboardLayout from "./pages/dashboard/layout/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";

import AdminDashboard from "./pages/dashboard/tabs/admin/AdminDashboard.jsx";
import UserManagement from "./pages/dashboard/tabs/admin/components/UserManagement/UserManagement";
import JobManagement from "./pages/dashboard/tabs/admin/components/JobManagement/JobManagement";
import ContentModeration from "./pages/dashboard/tabs/admin/components/ContentModeration/ContentModeration";
import StatisticsDashboard from "./pages/dashboard/tabs/admin/components/Statistics/StatisticsDashboard";
import StaffManagement from "./pages/dashboard/tabs/admin/components/StaffManagement/StaffManagement";
import SubscriptionManagement from "./pages/dashboard/tabs/admin/components/SubscriptionManagement/SubscriptionManagement";
import { RoleBasedProfile, RoleBasedEditProfile } from "./pages/dashboard/RoleBasedRoutes";

// Company Dashboard Pages
import NewApplicants from "./pages/dashboard/tabs/company/components/NewApplicants/NewApplicants.jsx";
import PerformanceAnalytics from "./pages/dashboard/tabs/company/components/PerformanceAnalytics/PerformanceAnalytics.jsx";
import PublishedJobs from "./pages/dashboard/tabs/company/components/PublishedJobs/PublishedJobs.jsx";

// Jobseeker Dashboard Pages
import RecommendedJobs from "./pages/dashboard/tabs/jobseeker/components/RecommendedJobs/RecommendedJobs.jsx";
import SavedJobs from "./pages/dashboard/tabs/jobseeker/components/SavedJobs/SavedJobs.jsx";
import DetailedApplications from "./pages/dashboard/tabs/jobseeker/components/DetailedApplications/DetailedApplications.jsx";

// Company Data Service
import {
  getPublishedJobsData,
  getNewApplicantsData,
  getPerformanceAnalyticsData,
  updateJobStatus,
  updateApplicantStatus,
  bulkApplicantAction,
  exportCompanyData
} from './pages/dashboard/tabs/company/services/companyDataService';

// Import test data for jobseeker
import {
  JOB_SEEKER_RECOMMENDED_JOBS,
  JOB_SEEKER_APPLICATIONS,
  JOB_SEEKER_SAVED_JOBS
} from './pages/dashboard/config/dashboard.config';

/**
 * Company Dashboard Component Wrappers with Data Service
 */

// Published Jobs with Data Service
const PublishedJobsWithData = () => {
  const data = getPublishedJobsData();

  if (!data.success) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-destructive)' }}>
        <h3>Error Loading Jobs</h3>
        <p>{data.error}</p>
      </div>
    );
  }

  return (
    <PublishedJobs
      jobs={data.data.jobs}
      stats={data.data.stats}
      filters={data.data.filters}
      pagination={data.data.pagination}
      onCreateJob={() => console.log("Create new job")}
      onViewJob={(jobId) => console.log(`View job ${jobId}`)}
      onEditJob={(jobId) => console.log(`Edit job ${jobId}`)}
      onUpdateJobStatus={updateJobStatus}
      onManageApplicants={(jobId) => {
        console.log(`Manage applicants for job ${jobId}`);
        // In a real app, you might navigate to applicants page with job filter
      }}
      onExportData={() => exportCompanyData('jobs', { format: 'csv' })}
    />
  );
};

// New Applicants with Data Service
const NewApplicantsWithData = () => {
  const data = getNewApplicantsData();

  if (!data.success) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-destructive)' }}>
        <h3>Error Loading Applicants</h3>
        <p>{data.error}</p>
      </div>
    );
  }

  return (
    <NewApplicants
      applicants={data.data.applicants}
      stats={data.data.stats}
      filters={data.data.filters}
      pagination={data.data.pagination}
      onViewApplicant={(applicantId) => console.log(`View applicant ${applicantId}`)}
      onShortlist={(applicantId, notes) => updateApplicantStatus(applicantId, 'shortlisted', notes)}
      onReject={(applicantId, notes) => updateApplicantStatus(applicantId, 'rejected', notes)}
      onScheduleInterview={(applicantId, date) => {
        console.log(`Schedule interview for ${applicantId} on ${date}`);
        updateApplicantStatus(applicantId, 'interview_scheduled');
      }}
      onUpdateApplicantStatus={updateApplicantStatus}
      onBulkAction={bulkApplicantAction}
      onExportData={() => exportCompanyData('applicants', { format: 'csv' })}
    />
  );
};

// Performance Analytics with Data Service
const PerformanceAnalyticsWithData = () => {
  const data = getPerformanceAnalyticsData({ period: 'monthly' });

  if (!data.success) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-destructive)' }}>
        <h3>Error Loading Analytics</h3>
        <p>{data.error}</p>
      </div>
    );
  }

  return (
    <PerformanceAnalytics
      analyticsData={data.data.analytics}
      stats={data.data.stats}
      insights={data.data.insights}
      trends={data.data.trends}
      period={data.data.period}
      onPeriodChange={(newPeriod) => {
        console.log(`Period changed to ${newPeriod}`);
        // In a real app, you would reload data with new period
      }}
      onExport={() => exportCompanyData('analytics', { format: 'pdf' })}
      onRefresh={() => {
        console.log("Refreshing analytics data");
        // In a real app, you would reload the data
        window.location.reload();
      }}
    />
  );
};

/**
 * Jobseeker Component Wrappers
 */
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
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/mock-login" element={<MockLoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/forget" element={<ForgetPasswordPage />} />
        <Route path="/reset" element={<ResetPasswordPage />} />
        <Route path="/verify" element={<VerificationEmailPage />} />
        <Route path="/register/onboarding" element={<OnboardingPage />} />

        {/* Main Layout Routes — requires authentication */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          {/* Job Pages - Public Routes */}
          <Route path="/jobs" element={<JobSearchPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
          <Route path="/jobs/:jobId/apply" element={<JobApplicationPage />} />
          <Route path="/jobs/post" element={<JobPostingPage />} />
          <Route path="/jobs/saved" element={<SavedJobsPage />} />

          {/* AI Assistant Pages */}
          <Route path="/ai/cv-builder" element={<CVBuilderPage />} />
          <Route path="/ai/candidate-analysis" element={<CandidateAnalysisPage />} />
          <Route path="/ai/smart-search" element={<SmartSearchPage />} />
          <Route path="/ai/post-job" element={<AIPostingPage />} />

          {/* Gig Routes - Wrapped in GigProvider */}
          <Route element={
            <GigProvider>
              <Outlet />
            </GigProvider>
          }>
            <Route path="/gigs" element={<GigListingPage />} />
            <Route path="/gigs/:id" element={<GigDetailsPage />} />
            <Route path="/gigs/new" element={<GigPostingPage />} />
            <Route path="/gigs/:id/bid" element={<GigBiddingPage />} />
            <Route path="/gigs/manage" element={<GigManagementPage />} />
            <Route path="/gigs/:id/workspace" element={<WorkspacePage />} />
          </Route>

          {/* Subscription and Payment Routes */}
          <Route path="/subscription/plans" element={<SubscriptionPlansPage />} />
          <Route path="/subscription/payment/:planId" element={<PaymentPage />} />

          {/* Notification Routes */}
          <Route path="/notifications" element={<NotificationsCenterPage />} />
          <Route path="/notifications/settings" element={<NotificationSettingsPage />} />

          {/* Chat Routes */}
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
        </Route>

        {/* Dashboard Routes — requires authentication */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          {/* General Routes for all roles */}
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<RoleBasedProfile />} />
          <Route path="profile/edit" element={<RoleBasedEditProfile />} />

          {/* Company Specific Routes - Using Data Service */}
          <Route path="published-jobs" element={<PublishedJobsWithData />} />
          <Route path="new-applications" element={<NewApplicantsWithData />} />
          <Route path="performance-analytics" element={<PerformanceAnalyticsWithData />} />

          {/* Jobseeker Specific Routes */}
          <Route path="recommended-jobs" element={<RecommendedJobsWithData />} />
          <Route path="saved-jobs" element={<SavedJobsWithData />} />
          <Route path="applications" element={<DetailedApplicationsWithData />} />

          {/* Admin Dashboard Routes */}
          <Route path="users" element={<UserManagement />} />
          <Route path="jobs" element={<JobManagement />} />
          <Route path="moderation" element={<ContentModeration />} />
          <Route path="statistics" element={<StatisticsDashboard />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="subscriptions" element={<SubscriptionManagement />} />

          {/* Subscription & Payment Dashboard Routes */}
          <Route path="subscription" element={<SubscriptionManagement />} />
          <Route path="escrow" element={<EscrowDashboard />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>

      {/* Global AI Assistant */}
      <FloatingAssistantIcon
        onClick={() => setIsChatOpen(!isChatOpen)}
        isOpen={isChatOpen}
      />
      <ChatWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
}

export default App;