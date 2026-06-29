/**
 * @file Login.jsx
 * @description Login page component with email/password authentication and social login options.
 * Uses BEM methodology for CSS class naming and follows React functional component patterns.
 * @author Shahd Mohay
 * @version 2.0.2
 * @date 2025-12-11
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-3-16
 *
 * @changes
 * - add the Auth Header component
 * - add the Footer component
 * - fix the forgot password page
 */

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import "../styles/login.css";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

/**
 * LoginForm Component
 * @description Main login form component providing user authentication functionality.
 * Includes email/password login, social login options, form validation, and error handling.
 * Follows accessibility best practices and BEM CSS methodology.
 * @returns {JSX.Element} The rendered login form with validation and user feedback.
 */
export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

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
   * Memoized star positions - calculated only once on component mount
   * Prevents stars from regenerating on every input change
   */
  const stars = useMemo(
    () =>
      Array.from({ length: 50 }).map((_, index) => ({
        id: `star-${index}`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        opacity: Math.random() * 0.7 + 0.3,
      })),
    []
  );

  /**
   * Memoized particle positions - calculated only once on component mount
   * Prevents particles from regenerating on every input change
   */
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, index) => ({
        id: `particle-${index}`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 8}s`,
        width: `${Math.random() * 5 + 2}px`,
        height: `${Math.random() * 5 + 2}px`,
      })),
    []
  );

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
      await login({
        email: formData.email,
        password: formData.password,
      });

      const redirectTo = localStorage.getItem('redirectAfterLogin') || '/dashboard';
      localStorage.removeItem('redirectAfterLogin');

      navigate(redirectTo);
    } catch (error) {
      setError(
        error.message || "An error occurred during login. Please try again."
      );
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
    <div>
      <Header />

      <div className="auth-login">
        {/* Decorative Background Elements - Now memoized */}
        <div className="auth-login__stars" aria-hidden="true">
          {stars.map((star) => (
            <div
              key={star.id}
              className="auth-login__star"
              style={{
                left: star.left,
                top: star.top,
                animationDelay: star.animationDelay,
                opacity: star.opacity,
              }}
            />
          ))}
        </div>

        <div className="auth-login__particles" aria-hidden="true">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="auth-login__particle"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.animationDelay,
                width: particle.width,
                height: particle.height,
              }}
            />
          ))}
        </div>

        <div
          className="auth-login__orb auth-login__orb--1"
          aria-hidden="true"
        />
        <div
          className="auth-login__orb auth-login__orb--2"
          aria-hidden="true"
        />
        <div
          className="auth-login__orb auth-login__orb--3"
          aria-hidden="true"
        />

        {/* Back Navigation Button */}
        <button
          className="auth-login__back-btn"
          aria-label="Go back to previous page"
          onClick={handleBackNavigation}
          type="button">
          <ArrowLeft size={20} />
        </button>

        {/* Main Content Wrapper */}
        <main className="auth-login__wrapper">
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
                aria-live="assertive">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form
              onSubmit={handleSubmit}
              className="auth-login__form"
              aria-label="Login form"
              noValidate>
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
                  disabled={loading}>
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
                  href="/forgotpassword"
                  className="auth-login__forgot"
                  aria-label="Forgot password? Reset it here">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="auth-login__submit"
                disabled={loading}
                aria-label={loading ? "Signing in..." : "Sign in to account"}>
                <Sparkles size={20} aria-hidden="true" />
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="auth-login__signup-link">
              <p>{"Don't have an account?"}</p>
              <a href="/register" aria-label="Create a new account">
                Create one now
              </a>
            </div>

            {/* Social Login Divider */}
            <div className="auth-login__divider">
              <span>Or continue with</span>
            </div>

            {/* Terms and Conditions */}
            <p className="auth-login__terms">
              By signing in, you agree to our
              <a
                href="#terms-of-service"
                aria-label="Read our Terms of Service">
                {" "}
                Terms of Service
              </a>{" "}
              and
              <a href="#privacy-policy" aria-label="Read our Privacy Policy">
                {" "}
                Privacy Policy
              </a>
            </p>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
