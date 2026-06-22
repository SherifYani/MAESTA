import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

// Lazy load auth components
const LoginForm = lazy(() => import("../pages/Login.jsx"));
const OnboardingPage = lazy(() => import("../pages/onboarding/OnboardingPage.jsx"));

const AuthRoutes = () => (
  <Routes>
    <Route index element={<LoginForm />} />
    <Route path="onboarding" element={<OnboardingPage />} />
    {/* These will handle when the parent route is just the base (e.g. /forgotpassword) */}
    <Route path="/" element={<LoginForm />} /> 
  </Routes>
);

export default AuthRoutes;
