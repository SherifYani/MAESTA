/**
 * @file App.js
 * @description Main application router with all route definitions
 * @author Mohamed Amin
 * @date 2025-10-01
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-12-19
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/App.css";
import "./styles/globals.css";

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

// Profile Pages
import ClientProfile from "./pages/profiles/ClientProfile.jsx";
import FreelancerProfile from "./pages/profiles/FreelancerProfile.jsx";
import JobSeekerProfile from "./pages/profiles/JobSeekerProfile.jsx";
import CompanyProfile from "./pages/profiles/CompanyProfile.jsx";
import EditClientProfile from "./pages/profiles/EditClientProfile.jsx";
import EditJobSeekerProfile from "./pages/profiles/EditJobSeekerProfile.jsx";
import EditCompanyProfile from "./pages/profiles/EditCompanyProfile.jsx";
import EditFreelancerProfile from "./pages/profiles/EditFreelancerProfile.jsx";

// Dashboard Components
import DashboardLayout from "./pages/dashboard/layout/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import ClientDashboard from "./pages/dashboard/tabs/client/ClientDashboard";
import FreelancerDashboard from "./pages/dashboard/tabs/freelancer/FreelancerDashboard";
import CompanyDashboard from "./pages/dashboard/tabs/company/CompanyDashboard";
import JobseekerDashboard from "./pages/dashboard/tabs/jobseeker/JobseekerDashboard";

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

        {/* Profile Routes */}
        <Route path="/profile/client" element={<ClientProfile />} />
        <Route path="/profile/freelancer" element={<FreelancerProfile />} />
        <Route path="/profile/jobseeker" element={<JobSeekerProfile />} />
        <Route path="/profile/company" element={<CompanyProfile />} />
        <Route path="/edit/client" element={<EditClientProfile />} />
        <Route path="/edit/freelancer" element={<EditFreelancerProfile />} />
        <Route path="/edit/jobseeker" element={<EditJobSeekerProfile />} />
        <Route path="/edit/company" element={<EditCompanyProfile />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Main dashboard with role-based routing */}
          <Route index element={<Dashboard />} />

          {/* Direct access to specific role dashboards */}
          <Route path="client" element={<ClientDashboard />} />
          <Route path="freelancer" element={<FreelancerDashboard />} />
          <Route path="company" element={<CompanyDashboard />} />
          <Route path="jobseeker" element={<JobseekerDashboard />} />

        </Route>

        {/* 404 Page (Optional) */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">
                  404 - Page Not Found
                </h1>
                <p className="text-lg text-gray-600">
                  The page you're looking for doesn't exist.
                </p>
              </div>
            </div>
          }
        />
      </Routes>
  );
}

export default App;
