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
const CommunityRoutes = lazy(() => import("./routes/CommunityRoutes"));

// Static Pages
const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const ErrorPage = lazy(() => import("./pages/ErrorPage.jsx"));

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
    <div className="loader">Loading MAESTA...</div>
  </div>
);

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

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
        <Route path="/community/*" element={<ProtectedRoute><CommunityRoutes /></ProtectedRoute>} />

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