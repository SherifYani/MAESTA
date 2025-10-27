/**
 * @fileoverview Registration page component for Job Magnet
 * @description Main registration form with role selection, validation, and social login
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 07-10-2025
 */

import { useState, useCallback } from "react"
import RoleCard from "./RoleCard"
import FormInput from "./FormInput"
import FormTextarea from "./FormTextarea"
import FormSelect from "./FormSelect"
import "../styles/register-page.css"

/**
 * RegisterPage Component
 * @description Renders the complete registration form with role selection and validation
 * @returns {JSX.Element} The rendered registration page
 */
function RegisterPage() {
  // Form state management
  const [selectedRole, setSelectedRole] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    industry: "",
    companySize: "",
    location: "",
    website: "",
    companyDescription: "",
  })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Password strength validation state
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSymbol: false,
  })

  /**
   * Validates password strength requirements
   * @param {string} password - The password to validate
   * @returns {Object} Validation results for each requirement
   */
  const validatePassword = useCallback((password) => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }
  }, [])

  /**
   * Handles input changes and updates form state
   * @param {Event} e - The input change event
   */
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))

      // Validate password in real-time
      if (name === "password") {
        setPasswordValidation(validatePassword(value))
      }
    },
    [validatePassword],
  )

  /**
   * Checks if all required fields are filled and valid
   * @returns {boolean} True if form is valid
   */
  const isFormValid = useCallback(() => {
    const baseFieldsFilled =
      formData.fullName.trim().length >= 2 &&
      formData.fullName.trim().length <= 100 &&
      formData.email.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.password !== "" &&
      formData.confirmPassword !== "" &&
      formData.password === formData.confirmPassword &&
      Object.values(passwordValidation).every((v) => v === true) &&
      selectedRole !== "" &&
      termsAccepted

    // Additional validation for employer role
    if (selectedRole === "employer") {
      return (
        baseFieldsFilled &&
        formData.companyName.trim() !== "" &&
        formData.industry !== "" &&
        formData.companySize !== "" &&
        formData.location.trim() !== ""
      )
    }

    return baseFieldsFilled
  }, [formData, passwordValidation, selectedRole, termsAccepted])

  /**
   * Handles form submission
   * @param {Event} e - The form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Form submitted:", { ...formData, role: selectedRole })
      setIsLoading(false)
      alert("Registration successful! Please check your email to verify your account.")
    }, 3000)
  }

  /**
   * Handles social login (Google/LinkedIn)
   * @param {string} provider - The social login provider
   */
  const handleSocialLogin = (provider) => {
    console.log(`${provider} login initiated`)
    alert(`${provider} login will be implemented`)
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          {/* Header */}
          <div className="register-header">
            <h1 className="register-title">Join the Revolution</h1>
            <p className="register-subtitle">Create your account to get started</p>
          </div>

          {/* Role Selection */}
          <div className="role-selection">
            <RoleCard
              icon="fa-solid fa-magnifying-glass"
              title="Job Seeker"
              description="Find your dream job"
              isSelected={selectedRole === "jobseeker"}
              onClick={() => setSelectedRole("jobseeker")}
            />
            <RoleCard
              icon="fa-solid fa-briefcase"
              title="Employer"
              description="Hire top talent"
              isSelected={selectedRole === "employer"}
              onClick={() => setSelectedRole("employer")}
            />
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="register-form">
            {/* Common Fields */}
            <FormInput
              icon="fa-solid fa-user"
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />

            <FormInput
              icon="fa-solid fa-envelope"
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
            />

            <FormInput
              icon="fa-solid fa-lock"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              showPasswordToggle
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
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
              required
            />

            {/* Password Strength Requirements */}
            {formData.password && (
              <div className="password-requirements">
                <p className="requirements-title">Password must contain:</p>
                <ul className="requirements-list">
                  <li className={passwordValidation.minLength ? "valid" : ""}>
                    <i className={`fa-solid ${passwordValidation.minLength ? "fa-check" : "fa-xmark"}`} />
                    At least 8 characters
                  </li>
                  <li className={passwordValidation.hasUppercase ? "valid" : ""}>
                    <i className={`fa-solid ${passwordValidation.hasUppercase ? "fa-check" : "fa-xmark"}`} />
                    One uppercase letter
                  </li>
                  <li className={passwordValidation.hasLowercase ? "valid" : ""}>
                    <i className={`fa-solid ${passwordValidation.hasLowercase ? "fa-check" : "fa-xmark"}`} />
                    One lowercase letter
                  </li>
                  <li className={passwordValidation.hasNumber ? "valid" : ""}>
                    <i className={`fa-solid ${passwordValidation.hasNumber ? "fa-check" : "fa-xmark"}`} />
                    One number
                  </li>
                  <li className={passwordValidation.hasSymbol ? "valid" : ""}>
                    <i className={`fa-solid ${passwordValidation.hasSymbol ? "fa-check" : "fa-xmark"}`} />
                    One special character
                  </li>
                </ul>
              </div>
            )}

            {/* Password Match Validation */}
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="error-message">Passwords do not match</p>
            )}

            {/* Employer-specific Fields */}
            {selectedRole === "employer" && (
              <div className="employer-fields">
                <FormInput
                  icon="fa-solid fa-building"
                  type="text"
                  name="companyName"
                  placeholder="Company Name"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                />

                <FormSelect
                  icon="fa-solid fa-industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  options={[
                    { value: "", label: "Select Industry" },
                    { value: "technology", label: "Technology" },
                    { value: "healthcare", label: "Healthcare" },
                    { value: "finance", label: "Finance" },
                    { value: "education", label: "Education" },
                    { value: "retail", label: "Retail" },
                    { value: "manufacturing", label: "Manufacturing" },
                    { value: "other", label: "Other" },
                  ]}
                  required
                />

                <FormSelect
                  icon="fa-solid fa-users"
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleInputChange}
                  options={[
                    { value: "", label: "Select Company Size" },
                    { value: "1-10", label: "1-10 employees" },
                    { value: "11-50", label: "11-50 employees" },
                    { value: "51-200", label: "51-200 employees" },
                    { value: "201-500", label: "201-500 employees" },
                    { value: "500+", label: "500+ employees" },
                  ]}
                  required
                />

                <FormInput
                  icon="fa-solid fa-location-dot"
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />

                <FormInput
                  icon="fa-solid fa-globe"
                  type="url"
                  name="website"
                  placeholder="Website (optional)"
                  value={formData.website}
                  onChange={handleInputChange}
                />

                <FormTextarea
                  icon="fa-solid fa-file-lines"
                  name="companyDescription"
                  placeholder="Company Description (optional)"
                  value={formData.companyDescription}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="terms-container">
              <label className="terms-label">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="terms-checkbox"
                />
                <span>
                  I agree to the{" "}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="terms-link">
                    Terms and Conditions
                  </a>
                </span>
              </label>
            </div>

            {/* Submit Button */}
                      <button type="submit" disabled={!isFormValid() || isLoading} className={`submit-button ${isLoading ? "submit-button-loading" : ""}`}>
              {isLoading ? (
                  <>
                  <i class="fa-regular fa-paper-plane"></i>
                                  Sending...
                  </>
              ) : (
                <>
                  <i className="fa-solid fa-envelope" />
                  Create Account
                </>
              )}
            </button>

            {/* Sign In Link */}
            <div className="signin-link">
              <p>Already have an account?</p>
              <a href="/signin">Sign in instead</a>
            </div>

            {/* Social Login */}
            <div className="social-login">
              <p className="social-login-text">Or continue with</p>
              <div className="social-buttons">
                <button type="button" onClick={() => handleSocialLogin("Google")} className="social-button google">
                  <i className="fa-brands fa-google" />
                  Google
                </button>
                <button type="button" onClick={() => handleSocialLogin("LinkedIn")} className="social-button linkedin">
                  <i className="fa-brands fa-linkedin-in" />
                  LinkedIn
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

RegisterPage.propTypes = {}

export default RegisterPage
