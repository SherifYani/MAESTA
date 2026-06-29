/**
 * @file App.js
 * @description Main application router refactored for modularity, performance, and localized skeletons.
 * @author Mohamed Amin / Sherif Talaat / Antigravity
 * @version 4.0.0
 * @last-modified-date 2026-03-31
 */

import React, { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { FloatingAssistantIcon, ChatWindow } from "./components/ai-assistant";
import ProtectedRoute from "./components/common/ProtectedRoute";
import TableSkeleton from "./components/common/Skeleton/TableSkeleton";
import "./styles/globals.css";
import "./styles/App.css";

// Modular Route Groups (Lazy Loaded)
const RegistrationPage = lazy(() => import("./pages/auth/registration-page.jsx"));
const ForgetPasswordPage = lazy(() => import("./pages/auth/ForgetPasswordPage.jsx"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage.jsx"));
const VerificationEmailPage = lazy(() => import("./pages/auth/VerificationEmailPage.jsx"));
const LoginForm = lazy(() => import("./pages/Login.jsx"));
const OnboardingPage = lazy(() => import("./pages/onboarding/OnboardingPage.jsx"));
const MockLoginPage = lazy(() => import("./pages/auth/MockLoginPage.jsx"));

const DashboardRoutes = lazy(() => import("./routes/DashboardRoutes"));
const JobRoutes = lazy(() => import("./routes/JobRoutes"));
const AiRoutes = lazy(() => import("./routes/AiRoutes"));
const GigRoutes = lazy(() => import("./routes/GigRoutes"));
const ChatRoutes = lazy(() => import("./routes/CommonRoutes").then(m => ({ default: m.ChatRoutes })));
const NotificationRoutes = lazy(() => import("./routes/CommonRoutes").then(m => ({ default: m.NotificationRoutes })));
const SubscriptionRoutes = lazy(() => import("./routes/CommonRoutes").then(m => ({ default: m.SubscriptionRoutes })));

// Static Pages
const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const ErrorPage = lazy(() => import("./pages/ErrorPage.jsx"));
const MarketingInfoPage = lazy(() => import("./pages/MarketingInfoPage.jsx"));

// Profile Pages (Phase 4)
const JobSeekerProfile = lazy(() => import("./pages/profiles/JobSeekerProfile"));
const CompanyProfile = lazy(() => import("./pages/profiles/CompanyProfile"));
const FreelancerProfile = lazy(() => import("./pages/profiles/FreelancerProfile"));
const ClientProfile = lazy(() => import("./pages/profiles/ClientProfile"));
const EditJobSeekerProfile = lazy(() => import("./pages/profiles/EditJobSeekerProfile"));
const EditCompanyProfile = lazy(() => import("./pages/profiles/EditCompanyProfile"));
const EditClientProfile = lazy(() => import("./pages/profiles/EditClientProfile"));
const EditFreelancerProfile = lazy(() => import("./pages/profiles/EditFreelancerProfile"));
const CompanyProfileView = lazy(() => import("./pages/profiles/CompanyProfileView"));

// Onboarding Pages (Phase 5)
const JobSeekerOnboarding = lazy(() => import("./pages/onboarding/JobSeekerOnboarding"));
const CompanyOnBoarding = lazy(() => import("./pages/onboarding/CompanyOnBoarding"));
const FreelancerOnboarding = lazy(() => import("./pages/onboarding/FreelancerOnboarding"));
const CompanyMemberOnBoarding = lazy(() => import("./pages/onboarding/CompanyMemberOnBoarding"));

// Loading Fallback
const PageLoader = () => (
  <div style={{
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-background)',
    color: 'var(--color-primary)'
  }}>
    <div className="loader">Loading Job Magnet...</div>
  </div>
);

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<MarketingInfoPage pageKey="about" />} />
        <Route path="/blog" element={<MarketingInfoPage pageKey="blog" />} />
        <Route path="/careers" element={<MarketingInfoPage pageKey="careers" />} />
        <Route path="/privacy" element={<MarketingInfoPage pageKey="privacy" />} />
        <Route path="/terms" element={<MarketingInfoPage pageKey="terms" />} />
        <Route path="/security" element={<MarketingInfoPage pageKey="security" />} />
        <Route path="/cookies" element={<MarketingInfoPage pageKey="cookies" />} />
        <Route path="/accessibility" element={<MarketingInfoPage pageKey="accessibility" />} />
        <Route path="/contact" element={<MarketingInfoPage pageKey="contact" />} />

        {/* Auth Pages - Managed individually for simplicity and layout-specific skeletons */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/forgotpassword" element={<ForgetPasswordPage />} />
        <Route path="/resetpassword" element={<ResetPasswordPage />} />
        <Route path="/verify" element={<VerificationEmailPage />} />
        <Route path="/register/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
        {process.env.NODE_ENV === 'development' && (
          <Route path="/mock-login" element={<MockLoginPage />} />
        )}


        {/* Job Module - Handles /jobs */}
        <Route path="/jobs/*" element={
          <ProtectedRoute>
            <Suspense fallback={<TableSkeleton rows={8} columns={4} />}>
              <JobRoutes />
            </Suspense>
          </ProtectedRoute>
        } />

        {/* AI Assistant Module - Handles /ai */}
        <Route path="/ai/*" element={
          <ProtectedRoute>
            <Suspense fallback={<div style={{ padding: '2rem' }}>Loading AI Tools...</div>}>
              <AiRoutes />
            </Suspense>
          </ProtectedRoute>
        } />

        {/* Gig Module - Handles /gigs */}
        <Route path="/gigs/*" element={
          <ProtectedRoute>
            <Suspense fallback={<TableSkeleton rows={8} columns={5} />}>
              <GigRoutes />
            </Suspense>
          </ProtectedRoute>
        } />

        {/* Dashboard Module - Handles /dashboard */}
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <Suspense fallback={<TableSkeleton rows={12} columns={6} />}>
              <DashboardRoutes />
            </Suspense>
          </ProtectedRoute>
        } />

        {/* Common Modules - Handles /chat, /notifications, /subscription */}
        <Route path="/chat/*" element={<ProtectedRoute><ChatRoutes /></ProtectedRoute>} />
        <Route path="/notifications/*" element={<ProtectedRoute><NotificationRoutes /></ProtectedRoute>} />
        <Route path="/subscription/*" element={<ProtectedRoute><SubscriptionRoutes /></ProtectedRoute>} />

        {/* Profile Routes (Phase 4) */}
        <Route path="/profiles/jobseeker/:userId" element={<JobSeekerProfile />} />
        <Route path="/profiles/company/:userId" element={<CompanyProfile />} />
        <Route path="/profiles/freelancer/:userId" element={<FreelancerProfile />} />
        <Route path="/profiles/client/:userId" element={<ClientProfile />} />
        <Route path="/profiles/edit/jobseeker" element={<ProtectedRoute><EditJobSeekerProfile /></ProtectedRoute>} />
        <Route path="/profiles/edit/company" element={<ProtectedRoute><EditCompanyProfile /></ProtectedRoute>} />
        <Route path="/profiles/edit/client" element={<ProtectedRoute><EditClientProfile /></ProtectedRoute>} />
        <Route path="/profiles/edit/freelancer" element={<ProtectedRoute><EditFreelancerProfile /></ProtectedRoute>} />
        <Route path="/company/:companyId" element={<CompanyProfileView />} />

        {/* Onboarding Routes (Phase 5) */}
        <Route path="/onboarding/jobseeker" element={<ProtectedRoute><JobSeekerOnboarding /></ProtectedRoute>} />
        <Route path="/onboarding/company" element={<ProtectedRoute><CompanyOnBoarding /></ProtectedRoute>} />
        <Route path="/onboarding/freelancer" element={<ProtectedRoute><FreelancerOnboarding /></ProtectedRoute>} />
        <Route path="/onboarding/company-member" element={<ProtectedRoute><CompanyMemberOnBoarding /></ProtectedRoute>} />

        {/* 404 & Redirects */}
        <Route path="/404" element={<ErrorPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
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
    </Suspense>
  );
}

export default App;