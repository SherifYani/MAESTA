
import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import FormInput from "../../components/forms/FormInput";
import {
  validateRequired,
  validateEmail,
  isFormValid,
  debounceValidation,
} from "../../utils/form-validation";
import "../../styles/auth-pages.css";
import "../../styles/shared/_form-base.css";
import "../../styles/components/form-components.css";
import "../../styles/shared/_form-animations.css";

/**
 * ForgetPasswordPage Component
 * @description Allows users to request a password reset link via email
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 05-12-2025
 */
function ForgetPasswordPage() {
  // Form state
  const [formData, setFormData] = useState({
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Validation handlers
  const validateField = useCallback((name, value) => {
    let error = "";

    switch (name) {
      case "email":
        error = validateEmail(value);
        if (!error && value.trim() !== "") {
          error = validateRequired(value, "Email");
        }
        break;
      default:
        break;
    }

    return error;
  }, []);

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
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log("Password reset request for:", formData.email);

        setIsSubmitted(true);
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          form: "Failed to send reset link. Please try again.",
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Render success state
  if (isSubmitted) {
    return (
      <div className="page-container fade-in">
        <div className="form-card slide-up">
          <div className="form-header">
            <div className="form-icon">
              <i className="fa-solid fa-envelope-circle-check"></i>
            </div>
            <h1 className="form-title">Check Your Email</h1>
            <p className="form-subtitle">
              We've sent a password reset link to{" "}
              <strong>{formData.email}</strong>
            </p>
          </div>

          <div className="form-body">
            <div className="success-message">
              <div className="success-icon">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <p>
                If an account exists with this email, you'll receive reset
                instructions shortly.
              </p>
            </div>

            <div className="form-footer">
              <Link to="/login" className="form-link">
                <i className="fa-solid fa-arrow-left"></i>
                Back to Login
              </Link>

              <p className="form-help">
                Didn't receive the email?{" "}
                <button
                  type="button"
                  className="form-link inline"
                  onClick={() => setIsSubmitted(false)}>
                  Try another email
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <div className="form-card slide-up">
        <div className="form-header">
          <div className="form-icon">
            <i className="fa-solid fa-key"></i>
          </div>
          <h1 className="form-title">Forgot Password</h1>
          <p className="form-subtitle">
            We'll send you a password reset link to your email address
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form-body" noValidate>
          {errors.form && (
            <div className="form-error-message">
              <i className="fa-solid fa-exclamation-triangle"></i>
              <span>{errors.form}</span>
            </div>
          )}

          <FormInput
            icon="fa-solid fa-envelope"
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            hasError={!!errors.email}
            className={errors.email ? "form-input--error" : ""}
          />

          {errors.email && (
            <div className="field-error-message">
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{errors.email}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!isFormValid(errors) || isLoading}
            className={`form-submit-button ${
              isLoading ? "form-submit-button--loading" : ""
            }`}>
            {isLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                Sending...
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane"></i>
                Send Reset Link
              </>
            )}
          </button>

          <div className="form-footer">
            <Link to="/login" className="form-link">
              <i className="fa-solid fa-arrow-left"></i>
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgetPasswordPage;
