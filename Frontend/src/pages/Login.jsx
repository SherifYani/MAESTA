/**
 * @file Login.jsx
 * @description Login page component with email/password authentication and social login options.
 * Uses BEM methodology for CSS class naming and follows React functional component patterns.
 * @author Shahd Mohay
 * @version 2.0.0
 * @date 2025-12-11
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-12-16
 */

import React, { useState } from "react";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import "../styles/login.css";

/**
 * LoginForm Component
 * @description Main login form component providing user authentication functionality.
 * Includes email/password login, social login options, form validation, and error handling.
 * Follows accessibility best practices and BEM CSS methodology.
 * @returns {JSX.Element} The rendered login form with validation and user feedback.
 */
export default function LoginForm() {
  // State for password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  
  // State for form submission loading
  const [loading, setLoading] = useState(false);
  
  // State for form errors and validation messages
  const [error, setError] = useState("");
  
  // State for form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  /**
   * Handles input field changes and clears any existing errors.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event.
   */
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
    setError("");
  };

  /**
   * Validates form data before submission.
   * @returns {boolean} True if form is valid, false otherwise.
   */
  const validateForm = () => {
    if (!formData.email.trim()) {
      setError("Email address is required");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    if (!formData.password.trim()) {
      setError("Password is required");
      return false;
    }
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    
    return true;
  };

  /**
   * Handles form submission for user authentication.
   * @param {React.FormEvent<HTMLFormElement>} event - The form submit event.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || "Login failed. Please check your credentials.");
        return;
      }
      
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      
      // Navigate to dashboard after successful login
      window.location.href = "/dashboard";
    } catch (error) {
      setError(error.message || "An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggles password visibility between text and password types.
   */
  const togglePasswordVisibility = () => {
    setShowPassword((previousState) => !previousState);
  };

  /**
   * Handles social login button clicks.
   * @param {string} provider - Social login provider (e.g., "google", "linkedin").
   */
  const handleSocialLogin = (provider) => {
    console.log(`Social login with ${provider}`);
    // Implementation for social login would go here
    setError(`${provider} login is not yet implemented`);
  };

  /**
   * Navigates back to the previous page.
   */
  const handleBackNavigation = () => {
    window.history.back();
  };

  return (
    <div className="auth-login">
      {/* Decorative Background Elements */}
      <div className="auth-login__stars" aria-hidden="true">
        {Array.from({ length: 50 }).map((_, index) => (
          <div
            key={`star-${index}`}
            className="auth-login__star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      <div className="auth-login__particles" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, index) => (
          <div
            key={`particle-${index}`}
            className="auth-login__particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
            }}
          />
        ))}
      </div>

      <div className="auth-login__orb auth-login__orb--1" aria-hidden="true" />
      <div className="auth-login__orb auth-login__orb--2" aria-hidden="true" />
      <div className="auth-login__orb auth-login__orb--3" aria-hidden="true" />

      {/* Back Navigation Button */}
      <button
        className="auth-login__back-btn"
        aria-label="Go back to previous page"
        onClick={handleBackNavigation}
        type="button"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Main Content Wrapper */}
      <main className="auth-login__wrapper">
        {/* Welcome Section */}
        <section className="auth-login__welcome">
          <h1 className="auth-login__welcome-title">Welcome Back</h1>
          <p className="auth-login__welcome-text">
            Sign in to access your account
          </p>
        </section>

        {/* Login Card */}
        <section className="auth-login__card">
          <header className="auth-login__header">
            <h2 className="auth-login__title">Sign In</h2>
            <p className="auth-login__subtitle">
              Access your professional dashboard
            </p>
          </header>

          {/* Error Display */}
          {error && (
            <div 
              className="auth-login__error"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          {/* Login Form */}
          <form 
            onSubmit={handleSubmit} 
            className="auth-login__form"
            aria-label="Login form"
            noValidate
          >
            {/* Email Field */}
            <div className="auth-login__field">
              <Mail 
                className="auth-login__field-icon" 
                size={20} 
                aria-hidden="true"
              />
              <input
                type="email"
                id="login-email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="auth-login__input"
                aria-label="Email address"
                aria-required="true"
                autoComplete="email"
                maxLength={100}
              />
            </div>

            {/* Password Field */}
            <div className="auth-login__field">
              <Lock 
                className="auth-login__field-icon" 
                size={20} 
                aria-hidden="true"
              />
              <input
                type={showPassword ? "text" : "password"}
                id="login-password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="auth-login__input"
                aria-label="Password"
                aria-required="true"
                autoComplete="current-password"
                minLength={6}
                maxLength={100}
              />
              <button
                type="button"
                className="auth-login__toggle-password"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-controls="login-password"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff size={20} aria-hidden="true" />
                ) : (
                  <Eye size={20} aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Form Options */}
            <div className="auth-login__options">
              <label className="auth-login__checkbox">
                <input 
                  type="checkbox" 
                  name="rememberMe"
                  aria-label="Remember me on this device"
                  disabled={loading}
                />
                <span>Remember me</span>
              </label>
              <a 
                href="#forgot-password" 
                className="auth-login__forgot"
                aria-label="Forgot password? Reset it here"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-login__submit"
              disabled={loading}
              aria-label={loading ? "Signing in..." : "Sign in to account"}
            >
              <Sparkles size={20} aria-hidden="true" />
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="auth-login__signup-link">
            <p>{"Don't have an account?"}</p>
            <a 
              href="/register" 
              aria-label="Create a new account"
            >
              Create one now
            </a>
          </div>

          {/* Social Login Divider */}
          <div className="auth-login__divider">
            <span>Or continue with</span>
          </div>

          {/* Social Login Buttons */}
          <div className="auth-login__social">
            <button
              className="auth-login__social-btn auth-login__social-btn--google"
              type="button"
              onClick={() => handleSocialLogin("google")}
              disabled={loading}
              aria-label="Sign in with Google"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>

            <button
              className="auth-login__social-btn auth-login__social-btn--linkedin"
              type="button"
              onClick={() => handleSocialLogin("linkedin")}
              disabled={loading}
              aria-label="Sign in with LinkedIn"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </button>
          </div>

          {/* Terms and Conditions */}
          <p className="auth-login__terms">
            By signing in, you agree to our{" "}
            <a 
              href="#terms-of-service" 
              aria-label="Read our Terms of Service"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a 
              href="#privacy-policy" 
              aria-label="Read our Privacy Policy"
            >
              Privacy Policy
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}