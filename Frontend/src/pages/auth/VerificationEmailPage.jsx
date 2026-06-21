/**
 * @file VerificationEmailPage.jsx
 * @description Handles 6-digit email verification OTP entry after registration (Step 1)
 * @author Sherif Talaat
 * @version 1.2.0
 * @date 05-12-2025
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-04-29
 * @fix Wired to real API: authService.verifyEmail(email, code) via POST api/auth/verify-email.
 *      Resend calls authService.resendVerification(email). Navigates to /register/onboarding on success.
 */

import { useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FormInput from "../../components/forms/FormInput";
import { isFormValid } from "../../utils/form-validation";
import { useResendTimer } from "../../hooks/useResendTimer";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import authService from "../../services/authService";
import "../../styles/shared/_form-base.css";
import "../../styles/auth-pages.css";
import "../../styles/components/form-components.css";
import "../../styles/shared/_form-animations.css";

function VerificationEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "your email";
  const maskedEmail = email.includes("@")
    ? `${email.substring(0, 1)}***@${email.split("@")[1]}`
    : "your email";

  // Form state
  const [formData, setFormData] = useState({
    code: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Timer hook
  const { isActive, canResend, formattedTime, resetTimer } =
    useResendTimer(60);

  // Validation handlers
  const validateCode = useCallback((value) => {
    if (!value) return "Verification code is required";
    if (value.length !== 6) return "Code must be 6 digits";
    if (!/^\d+$/.test(value)) return "Code must contain only numbers";
    return "";
  }, []);

  const validateField = useCallback(
    (name, value) => {
      if (name === "code") {
        return validateCode(value);
      }
      return "";
    },
    [validateCode]
  );

  // Handle input changes with auto-validation
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      // Only allow numbers
      const numericValue = value.replace(/\D/g, "");

      // Limit to 6 characters
      const trimmedValue = numericValue.slice(0, 6);

      setFormData((prev) => ({ ...prev, [name]: trimmedValue }));

      // Auto-validate when 6 digits are entered
      if (trimmedValue.length === 6) {
        const error = validateField(name, trimmedValue);
        setErrors((prev) => ({ ...prev, [name]: error }));
      } else {
        // Clear error if not 6 digits yet
        if (errors[name]) {
          setErrors((prev) => ({ ...prev, [name]: "" }));
        }
      }
    },
    [validateField, errors]
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

  // Handle resend code — calls real API
  const handleResend = useCallback(async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      await authService.resendVerification(email);
      resetTimer();
      setFormData({ code: "" });
      setErrors({ success: "Verification code resent successfully!" });
      setTimeout(() => {
        setErrors((prev) => { const { success, ...rest } = prev; return rest; });
      }, 3000);
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to resend code. Please try again.";
      setErrors((prev) => ({ ...prev, form: msg }));
    } finally {
      setIsLoading(false);
    }
  }, [canResend, email, resetTimer]);

  // Handle form submission — calls real API: POST api/auth/verify-email
  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateField("code", formData.code);
    if (error) { setErrors({ code: error }); return; }

    setIsLoading(true);
    try {
      // Backend: POST api/auth/verify-email { email, code }
      await authService.verifyEmail(email, formData.code);
      
      setSuccess("Email verified successfully! Redirecting to onboarding...");
      
      // After successful verification, wait a bit for the user to see the success message
      setTimeout(() => {
        navigate("/register/onboarding", { state: { email } });
      }, 1500);
    } catch (error) {
      const msg = error?.response?.data?.message || "Invalid verification code. Please try again.";
      setErrors((prev) => ({ ...prev, form: msg }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="page-container fade-in">
        <div className="form-card slide-up">
          <div className="form-header">
            <div className="form-icon">
              <i className="fa-solid fa-shield"></i>
            </div>
            <h1 className="form-title">Verify Your Email</h1>
            <p className="form-subtitle">
              Enter the 6-digit code sent to <strong>{maskedEmail}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="form-body" noValidate>
            {success && (
              <div className="form-success-message">
                <i className="fa-solid fa-circle-check"></i>
                <span>{success}</span>
              </div>
            )}

            {errors.form && (
              <div className="form-error-message">
                <i className="fa-solid fa-exclamation-triangle"></i>
                <span>{errors.form}</span>
              </div>
            )}

            {/* Single input approach */}
            <div className="verification-input-container">
              <FormInput
                icon="fa-solid fa-hashtag"
                type="text"
                name="code"
                placeholder="Enter 6-digit code"
                value={formData.code}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                inputMode="numeric"
                maxLength="6"
                pattern="\d*"
                hasError={!!errors.code}
                className="verification-input"
              />

              {/* Or use the separate inputs approach */}
              {/* {renderCodeInputs()} */}
            </div>

            {errors.code && (
              <div className="field-error-message">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{errors.code}</span>
              </div>
            )}

            <div className="verification-info">
              <p className="verification-timer">
                {isActive ? (
                  <>
                    <i className="fa-solid fa-clock"></i>
                    Code expires in:{" "}
                    <span className="timer-countdown">{formattedTime}</span>
                  </>
                ) : (
                  <span className="timer-expired">Code expired</span>
                )}
              </p>

              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend || isLoading}
                className={`form-resend-button ${!canResend ? "form-resend-button--disabled" : ""
                  }`}>
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Resending...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-redo"></i>
                    {canResend
                      ? "Resend Code"
                      : `Resend available in ${formattedTime}`}
                  </>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={
                !isFormValid(errors) || isLoading || formData.code.length !== 6
              }
              className={`form-submit-button ${isLoading ? "form-submit-button--loading" : ""
                }`}>
              {isLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Verifying...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check-circle"></i>
                  Verify Code
                </>
              )}
            </button>

            <div className="form-footer">
              <Link to="/login" className="form-link">
                <i className="fa-solid fa-arrow-left"></i>
                Back to Login
              </Link>

              <p className="form-help">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  className="form-link inline"
                  onClick={handleResend}
                  disabled={!canResend}>
                  Send again
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default VerificationEmailPage;
