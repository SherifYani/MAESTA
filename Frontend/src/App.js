import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/App.css";
import "./styles/globals.css";
import RegistrationPage from "../src/pages/auth/registration-page.jsx";
import OnboardingPage from "../src/pages/onboarding/OnboardingPage.jsx";
import ForgetPasswordPage from "./pages/auth/ForgetPasswordPage.jsx";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage.jsx";
import VerificationEmailPage from "./pages/auth/VerificationEmailPage.jsx";
import LandingPage from "./pages/landing-page.tsx";
import LoginForm from "./pages/Login.jsx";
import ClientProfile from "./pages/profiles/ClientProfile.jsx";
import FreelancerProfile from "./pages/profiles/FreelancerProfile.jsx";
import JobSeekerProfile from "./pages/profiles/JobSeekerProfile.jsx";
import CompanyProfile from "./pages/profiles/CompanyProfile.jsx";
import EditClientProfile from "./pages/profiles/EditClientProfile.jsx";
import EditJobSeekerProfile from "./pages/profiles/EditJobSeekerProfile.jsx";
import EditCompanyProfile from "./pages/profiles/EditCompanyProfile.jsx";
import EditFreelancerProfile from "./pages/profiles/EditFreelancerProfile.jsx";

function App() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/forget" element={<ForgetPasswordPage />} />
        <Route path="/reset" element={<ResetPasswordPage />} />
        <Route path="/verify" element={<VerificationEmailPage />} />
        <Route path="/profile/client" element={<ClientProfile />} />
        <Route path="/profile/freelancer" element={<FreelancerProfile />} />
        <Route path="/profile/jobseeker" element={<JobSeekerProfile />} />
        <Route path="/profile/company" element={<CompanyProfile />} />
        <Route path="/edit/client" element={<EditClientProfile />} />
        <Route path="/edit/freelancer" element={<EditFreelancerProfile />} />
        <Route path="/edit/jobseeker" element={<EditJobSeekerProfile />} />
        <Route path="/edit/company" element={<EditCompanyProfile />} />
        <Route path="/register/onboarding" element={<OnboardingPage />} />
      </Routes>
    </main>
  );
}

export default App;
