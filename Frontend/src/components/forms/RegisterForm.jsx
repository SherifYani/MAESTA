/**
 * @file RegisterForm.jsx
 * @description Centered Hero Redesign — Registration form component (Phase 1)
 *              Streamlined fields, role switcher toggle, responsive inputs, and mock fallback.
 * @author Sherif Talaat
 * @version 4.0.0
 * @date 2026-09-28
 */

import React, { useState, useCallback, useMemo } from "react";
import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import DateInput from "./dateInput";
import "../../styles/pages/register-form.css";
import "../../styles/components/form-components.css";
import { useNavigate, Link } from "react-router-dom";
import { validatePhoneNumber } from "../../utils/form-validation";
import { useAuth } from "../../context/AuthContext";
import { Sparkles, Briefcase, Building2, Check, X, ShieldAlert } from "lucide-react";

/**
 * RegisterForm Component
 * @description Streamlined registration form with role selection and validation
 */
export default function RegisterForm() {
  const navigate = useNavigate();
  const { register, mockLogin } = useAuth();
  const [apiError, setApiError] = useState("");

  const [selectedRole, setSelectedRole] = useState("jobseeker");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation error states
  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
  });

  /**
   * Validates password strength requirements
   */
  const passwordValidation = useMemo(() => {
    const p = formData.password || "";
    return {
      minLength: p.length >= 8,
      hasUppercase: /[A-Z]/.test(p),
      hasLowercase: /[a-z]/.test(p),
      hasNumber: /\d/.test(p),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(p),
    };
  }, [formData.password]);

  // Overall password score (0 to 5)
  const passwordScore = useMemo(() => {
    return Object.values(passwordValidation).filter(Boolean).length;
  }, [passwordValidation]);

  const passwordStrengthLabel = useMemo(() => {
    if (!formData.password) return "";
    if (passwordScore <= 2) return "Weak";
    if (passwordScore <= 4) return "Medium";
    return "Strong";
  }, [formData.password, passwordScore]);

  /**
   * Handles input changes
   */
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    let error = "";
    if (name === "email") {
      if (!value) {
        error = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = "Please enter a valid email address";
      }
    } else if (name === "firstName" || name === "lastName") {
      if (!value) {
        error = `${name === "firstName" ? "First name" : "Last name"} is required`;
      } else if (value.length > 50) {
        error = `${name === "firstName" ? "First name" : "Last name"} must be under 50 chars`;
      }
    } else if (name === "phone") {
      if (value && value.trim() !== "") {
        const phoneValidation = validatePhoneNumber(value);
        if (!phoneValidation.isValid) {
          error = phoneValidation.errorMessage;
        }
      }
    } else if (name === "confirmPassword") {
      if (value && value !== formData.password) {
        error = "Passwords do not match";
      }
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));
  }, [formData.password]);

  const handleDateChange = useCallback((e) => {
    if (!e) return;
    const value = e.target ? e.target.value : (typeof e === "string" ? e : "");
    setFormData((prev) => ({ ...prev, dateOfBirth: value || "" }));
    setFormErrors((prev) => ({ ...prev, dateOfBirth: "" }));
  }, []);

  const hasPasswordMismatch =
    formData.confirmPassword && formData.password !== formData.confirmPassword;

  /**
   * Form validity check
   */
  const isFormValid = useCallback(() => {
    return (
      formData.email &&
      !formErrors.email &&
      formData.password &&
      formData.password.length >= 8 &&
      formData.confirmPassword &&
      !hasPasswordMismatch &&
      formData.firstName &&
      !formErrors.firstName &&
      formData.lastName &&
      !formErrors.lastName &&
      termsAccepted
    );
  }, [formData, formErrors, hasPasswordMismatch, termsAccepted]);

  /**
   * Handles form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsLoading(true);
    setApiError("");

    const step1Payload = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone || undefined,
      gender: formData.gender || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
    };

    try {
      await register(step1Payload);
      localStorage.setItem("userRole", selectedRole);
      navigate("/verify", { state: { email: formData.email } });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed. Please try again.";
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles social login / register
   */
  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    setApiError("");
    try {
      if (mockLogin) {
        await mockLogin(selectedRole);
      }
      navigate("/dashboard");
    } catch (err) {
      setApiError(err.message || `${provider} sign in failed`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-form__card">
      {/* API Error Notification */}
      {apiError && (
        <div className="register-form__alert" role="alert">
          <ShieldAlert size={18} />
          <span>{apiError}</span>
        </div>
      )}

      {/* Header */}
      <div className="register-form__header">
        <div className="register-form__brand">
          <span className="register-form__brand-icon">M</span>
          <span className="register-form__brand-text">MAESTA</span>
        </div>
        <h1 className="register-form__title">Create Account</h1>
        <p className="register-form__subtitle">
          Join thousands of top professionals and elite hirers
        </p>
      </div>

      {/* Role Switcher Toggle */}
      {/* <div
        className="register-form__role-toggle"
        role="radiogroup"
        aria-label="Select account role">
        <button
          type="button"
          role="radio"
          aria-checked={selectedRole === "jobseeker"}
          className={`register-form__role-btn ${
            selectedRole === "jobseeker" ? "register-form__role-btn--active" : ""
          }`}
          onClick={() => setSelectedRole("jobseeker")}>
          <Briefcase size={16} />
          <span>Job Seeker</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={selectedRole === "employer"}
          className={`register-form__role-btn ${
            selectedRole === "employer" ? "register-form__role-btn--active" : ""
          }`}
          onClick={() => setSelectedRole("employer")}>
          <Building2 size={16} />
          <span>Employer</span>
        </button>
      </div> */}

      {/* Form */}
      <form onSubmit={handleSubmit} className="register-form__form" noValidate>
        {/* Name Row (First Name & Last Name) */}
        <div className="register-form__row register-form__row--2col">
          <FormInput
            icon="fa-solid fa-user"
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleInputChange}
            hasError={!!formErrors.firstName}
            errorMessage={formErrors.firstName}
            required
          />
          <FormInput
            icon="fa-solid fa-user"
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleInputChange}
            hasError={!!formErrors.lastName}
            errorMessage={formErrors.lastName}
            required
          />
        </div>

        {/* Email */}
        <FormInput
          icon="fa-solid fa-envelope"
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleInputChange}
          hasError={!!formErrors.email}
          errorMessage={formErrors.email}
          required
        />

        {/* Password & Confirm Password */}
        <div className="register-form__row register-form__row--2col">
          <FormInput
            icon="fa-solid fa-lock"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password (8+ chars)"
            value={formData.password}
            onChange={handleInputChange}
            showPasswordToggle
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            hasError={!!formErrors.password}
            errorMessage={formErrors.password}
            required
          />
          <FormInput
            icon="fa-solid fa-lock"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            showPasswordToggle
            showPassword={showConfirmPassword}
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            hasError={hasPasswordMismatch || !!formErrors.confirmPassword}
            errorMessage={hasPasswordMismatch ? "Passwords do not match" : formErrors.confirmPassword}
            required
          />
        </div>

        {/* Live Password Strength Meter */}
        {formData.password && (
          <div className="register-form__strength-meter">
            <div className="register-form__strength-header">
              <span className="register-form__strength-text">Password strength:</span>
              <span className={`register-form__strength-badge register-form__strength-badge--${passwordStrengthLabel.toLowerCase()}`}>
                {passwordStrengthLabel}
              </span>
            </div>
            <div className="register-form__strength-bar">
              <div
                className={`register-form__strength-fill register-form__strength-fill--${passwordStrengthLabel.toLowerCase()}`}
                style={{ width: `${(passwordScore / 5) * 100}%` }}
              />
            </div>
            <div className="register-form__strength-rules">
              <span className={passwordValidation.minLength ? "rule-valid" : ""}>
                {passwordValidation.minLength ? <Check size={12} /> : <X size={12} />} 8+ chars
              </span>
              <span className={passwordValidation.hasUppercase ? "rule-valid" : ""}>
                {passwordValidation.hasUppercase ? <Check size={12} /> : <X size={12} />} Uppercase
              </span>
              <span className={passwordValidation.hasNumber ? "rule-valid" : ""}>
                {passwordValidation.hasNumber ? <Check size={12} /> : <X size={12} />} Number
              </span>
              <span className={passwordValidation.hasSymbol ? "rule-valid" : ""}>
                {passwordValidation.hasSymbol ? <Check size={12} /> : <X size={12} />} Symbol
              </span>
            </div>
          </div>
        )}

        {/* Optional Row: Phone & Gender */}
        <div className="register-form__row register-form__row--2col">
          <FormInput
            icon="fa-solid fa-phone"
            type="tel"
            name="phone"
            placeholder="Phone Number (Optional)"
            value={formData.phone}
            onChange={handleInputChange}
            hasError={!!formErrors.phone}
            errorMessage={formErrors.phone}
          />

          <FormSelect
            icon="fa-solid fa-venus-mars"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            options={[
              { value: "", label: "Gender (Optional)" },
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
            ]}
          />
        </div>

        {/* Optional: Date of Birth */}
        <div className="register-form__date-wrapper">
          <DateInput
            name="dateOfBirth"
            label="Date of Birth (Optional)"
            value={formData.dateOfBirth}
            onChange={handleDateChange}
            required={false}
            minAge={16}
            maxAge={100}
            showAge={true}
          />
        </div>

        {/* Terms Agreement Checkbox */}
        <div className="register-form__terms-container">
          <label className="register-form__terms-label">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="register-form__terms-checkbox"
              required
            />
            <span>
              I agree to the{" "}
              <Link to="/terms" target="_blank" className="register-form__terms-link">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" target="_blank" className="register-form__terms-link">
                Privacy Policy
              </Link>
            </span>
          </label>
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid() || isLoading}
          className={`register-form__submit-button ${isLoading ? "register-form__submit-button--loading" : ""
            }`}>
          {isLoading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Create Account</span>
            </>
          )}
        </button>

        {/* Social Registration Divider */}
        <div className="register-form__divider">
          <span>Or sign up with</span>
        </div>

        {/* Social Buttons */}
        <div className="register-form__social-buttons">
          <button
            type="button"
            onClick={() => handleSocialLogin("Google")}
            disabled={isLoading}
            className="register-form__social-button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin("LinkedIn")}
            disabled={isLoading}
            className="register-form__social-button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            <span>LinkedIn</span>
          </button>
        </div>

        {/* Sign In Anchor */}
        <div className="register-form__sign-in-link">
          <p className="register-form__sign-in-text">Already have an account?</p>
          <Link to="/login" className="register-form__sign-in-anchor">
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
