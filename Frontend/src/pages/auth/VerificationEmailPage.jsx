
/**
 * VerificationEmailPage Component
 * @description Handles 6-digit email verification code entry
 * @author Sherif Talaat
 * @version 1.1.0
 * @date 05-12-2025
 * 
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-16
 */

import { useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import FormInput from "../../components/forms/FormInput";
import {
  isFormValid,
} from "../../utils/form-validation";
import { useResendTimer } from "../../hooks/useResendTimer";
import AuthHeader from "../../components/common/AuthHeader";
import Footer from "../../components/common/Footer";
import "../../styles/shared/_form-base.css";
import "../../styles/auth-pages.css";
import "../../styles/components/form-components.css";
import "../../styles/shared/_form-animations.css";

function VerificationEmailPage() {
  const location = useLocation();
  const email = location.state?.email || "your email";
  const maskedEmail = email.includes("@")
    ? `${email.substring(0, 1)}***@${email.split("@")[1]}`
    : "your email";

  // Form state
  const [formData, setFormData] = useState({
    code: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Timer hook
  const { timer, isActive, canResend, formattedTime, resetTimer } =
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

  // Auto-focus next input (if using separate inputs)
  const handleCodeInput = useCallback((e) => {
    const { value, name } = e.target;

    if (value.length === 1 && e.target.nextElementSibling) {
      e.target.nextElementSibling.focus();
    }
  }, []);

  // Handle resend code
  const handleResend = useCallback(async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Resending code to:", email);

      resetTimer();
      setFormData({ code: "" });
      setErrors({});

      // Show success message
      setErrors((prev) => ({
        ...prev,
        success: "Verification code resent successfully!",
      }));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setErrors((prev) => {
          const { success, ...rest } = prev;
          return rest;
        });
      }, 3000);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        form: "Failed to resend code. Please try again.",
      }));
    } finally {
      setIsLoading(false);
    }
  }, [canResend, email, resetTimer]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateField("code", formData.code);
    if (error) {
      setErrors({ code: error });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API verification
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Verifying code:", formData.code);

      // Navigate to reset password page
      // In a real app, you would use react-router-dom's navigate
      window.location.href = "/reset-password?token=verified";
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        form: "Invalid verification code. Please try again.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Alternative: Render 6 separate inputs
  const renderCodeInputs = () => {
    return (
      <div className="verification-code-inputs">
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength="1"
            className="code-input"
            value={formData.code[index] || ""}
            onChange={(e) => {
              const newCode = formData.code.split("");
              newCode[index] = e.target.value.replace(/\D/g, "")[0] || "";
              setFormData({ code: newCode.join("") });

              // Auto-focus next
              if (e.target.value && e.target.nextElementSibling) {
                e.target.nextElementSibling.focus();
              }
            }}
            onKeyDown={(e) => {
              // Handle backspace
              if (
                e.key === "Backspace" &&
                !formData.code[index] &&
                e.target.previousElementSibling
              ) {
                e.target.previousElementSibling.focus();
              }
            }}
            autoFocus={index === 0}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <AuthHeader />
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
            {errors.success && (
              <div className="form-success-message">
                <i className="fa-solid fa-circle-check"></i>
                <span>{errors.success}</span>
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
