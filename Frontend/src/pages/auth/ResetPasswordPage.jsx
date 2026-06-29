
/**
 * ResetPasswordPage Component
 * @description Allows users to set a new password with strength validation
 * @author Sherif Talaat
 * @version 1.1.0
 * @date 05-12-2025
 * 
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-16
 */
import { useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FormInput from "../../components/forms/FormInput";
import {
  validatePassword,
  validatePasswordMatch,
  getPasswordStrengthScore,
  getPasswordStrengthText,
  isFormValid,
  debounceValidation,
} from "../../utils/form-validation";
import authService from "../../services/authService";
import Footer from "../../components/common/Footer";
import "../../styles/shared/_form-base.css";
import "../../styles/auth-pages.css";
import "../../styles/components/form-components.css";
import "../../styles/shared/_form-animations.css";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // Form state
  const [formData, setFormData] = useState({
    token: token || "", // Initialise from URL or empty
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSymbol: false,
  });

  // Calculate password strength
  const passwordStrength = getPasswordStrengthScore(passwordValidation);
  const strengthText = getPasswordStrengthText(passwordValidation);

  // Validation handlers
  const validateField = useCallback(
    (name, value, allValues = formData) => {
      let error = "";

      switch (name) {
        case "token":
          if (!value) error = "Reset code is required";
          else if (value.length < 4) error = "Invalid reset code";
          break;

        case "newPassword":
          const validation = validatePassword(value);
          setPasswordValidation(validation);

          // Check if all requirements met
          const allValid = Object.values(validation).every((v) => v);
          if (value && !allValid) {
            error = "Password does not meet requirements";
          }
          break;

        case "confirmPassword":
          error = validatePasswordMatch(allValues.newPassword, value);
          break;

        default:
          break;
      }

      return error;
    },
    [formData]
  );

  // Debounced validation
  const debouncedValidate = useCallback(
    debounceValidation((name, value) => {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }, 500),
    [validateField]
  );

  // Handle input changes
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }

      // Trigger debounced validation
      debouncedValidate(name, value);

      // Special handling for password validation display
      if (name === "newPassword") {
        const validation = validatePassword(value);
        setPasswordValidation(validation);
      }
    },
    [errors, debouncedValidate]
  );

  // Handle blur validation
  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField]
  );

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);

    if (isFormValid(newErrors)) {
      setIsLoading(true);

      try {
        // Call actual API endpoint with formData.token instead of URL token
        await authService.resetPassword(formData.token, formData.newPassword);
        console.log("Password reset for token:", formData.token);
        console.log("New password set");

        // Show success and redirect
        alert("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } catch (error) {
        const msg = error?.response?.data?.message || "Failed to reset password. Please try again or request a new link.";
        setErrors((prev) => ({
          ...prev,
          form: msg,
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Password strength bar color
  const getStrengthColor = () => {
    if (passwordStrength < 40) return "var(--destructive)";
    if (passwordStrength < 60) return "var(--accent-pink)";
    if (passwordStrength < 80) return "var(--ring)";
    return "var(--chart-2)";
  };

  return (
    <div>
      <div className="page-container fade-in">
        <div className="form-card slide-up">
          <div className="form-header">
            <div className="form-icon">
              <i className="fa-solid fa-window-restore"></i>
            </div>
            <h1 className="form-title">Reset Password</h1>
            <p className="form-subtitle">
              Create a new password for your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="form-body" noValidate>
            {errors.form && (
              <div className="form-error-message">
                <i className="fa-solid fa-exclamation-triangle"></i>
                <span>{errors.form}</span>
              </div>
            )}

            {/* Token / Reset Code */}
            <div className="password-field-group">
              <FormInput
                icon="fa-solid fa-hashtag"
                type="text"
                name="token"
                placeholder="Reset Code (from your email)"
                value={formData.token}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                hasError={!!errors.token}
                className={errors.token ? "form-input--error" : ""}
              />

              {errors.token && (
                <div className="field-error-message">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{errors.token}</span>
                </div>
              )}
            </div>

            {/* New Password */}
            <div className="password-field-group">
              <FormInput
                icon="fa-solid fa-lock"
                type={showPassword ? "text" : "password"}
                name="newPassword"
                placeholder="New Password"
                value={formData.newPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                showPasswordToggle
                showPassword={showPassword}
                onTogglePassword={togglePasswordVisibility}
                hasError={!!errors.newPassword}
                className={errors.newPassword ? "form-input--error" : ""}
              />

              {errors.newPassword && (
                <div className="field-error-message">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{errors.newPassword}</span>
                </div>
              )}

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="password-strength-container">
                  <div className="password-strength-bar">
                    <div
                      className="password-strength-fill"
                      style={{
                        width: `${passwordStrength}%`,
                        backgroundColor: getStrengthColor(),
                        boxShadow: `0 0 10px ${getStrengthColor()}40`,
                      }}
                    />
                  </div>

                  <div className="password-strength-info">
                    <span className="strength-text">
                      Strength: <strong>{strengthText}</strong>
                    </span>
                    <span className="strength-percentage">
                      {Math.round(passwordStrength)}%
                    </span>
                  </div>

                  {/* Password Requirements */}
                  <div className="password-requirements">
                    <p className="requirements-title">Password must contain:</p>
                    <ul className="requirements-list">
                      <li
                        className={
                          passwordValidation.minLength
                            ? "requirement-item--valid"
                            : ""
                        }>
                        <i
                          className={`fa-solid ${passwordValidation.minLength ? "fa-check" : "fa-xmark"
                            } requirement-icon`}
                        />
                        At least 8 characters
                      </li>
                      <li
                        className={
                          passwordValidation.hasUppercase
                            ? "requirement-item--valid"
                            : ""
                        }>
                        <i
                          className={`fa-solid ${passwordValidation.hasUppercase
                            ? "fa-check"
                            : "fa-xmark"
                            } requirement-icon`}
                        />
                        One uppercase letter
                      </li>
                      <li
                        className={
                          passwordValidation.hasLowercase
                            ? "requirement-item--valid"
                            : ""
                        }>
                        <i
                          className={`fa-solid ${passwordValidation.hasLowercase
                            ? "fa-check"
                            : "fa-xmark"
                            } requirement-icon`}
                        />
                        One lowercase letter
                      </li>
                      <li
                        className={
                          passwordValidation.hasNumber
                            ? "requirement-item--valid"
                            : ""
                        }>
                        <i
                          className={`fa-solid ${passwordValidation.hasNumber ? "fa-check" : "fa-xmark"
                            } requirement-icon`}
                        />
                        One number
                      </li>
                      <li
                        className={
                          passwordValidation.hasSymbol
                            ? "requirement-item--valid"
                            : ""
                        }>
                        <i
                          className={`fa-solid ${passwordValidation.hasSymbol ? "fa-check" : "fa-xmark"
                            } requirement-icon`}
                        />
                        One special character
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="password-field-group">
              <FormInput
                icon="fa-solid fa-lock"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                showPasswordToggle
                showPassword={showConfirmPassword}
                onTogglePassword={toggleConfirmPasswordVisibility}
                hasError={!!errors.confirmPassword}
                className={errors.confirmPassword ? "form-input--error" : ""}
              />

              {errors.confirmPassword && (
                <div className="field-error-message">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{errors.confirmPassword}</span>
                </div>
              )}

              {/* Password Match Indicator */}
              {formData.confirmPassword &&
                formData.newPassword &&
                !errors.confirmPassword && (
                  <div className="password-match-indicator success">
                    <i className="fa-solid fa-check-circle"></i>
                    <span>Passwords match</span>
                  </div>
                )}
            </div>

            <button
              type="submit"
              disabled={!isFormValid(errors) || isLoading}
              className={`form-submit-button ${isLoading ? "form-submit-button--loading" : ""
                }`}>
              {isLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Updating...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check-double"></i>
                  Reset Password
                </>
              )}
            </button>

            <div className="form-footer">
              <Link to="/login" className="form-link">
                <i className="fa-solid fa-arrow-left"></i>
                Back to Login
              </Link>

              <p className="form-help">
                Remember your password?{" "}
                <Link to="/login" className="form-link inline">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ResetPasswordPage;
