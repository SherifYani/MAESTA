/**
 * @file RegisterForm.jsx
 * @description Registration form component with role selection, validation, and social login
 * @author Sherif Talaat
 * @version 3.0.0
 * @date 10-10-2025
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-04-29
 * @fix Wired handleSubmit to real API Step 1: authService.register(RegisterStep1Request).
 *      Navigates to /verify with email in router state. Shows API errors inline.
 */

import { useState, useCallback } from "react";
import RoleCard from "./RoleCard";
import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import DateInput from "./dateInput";
import "../../styles/pages/register-form.css";
import "../../styles/components/form-components.css";
import { useNavigate, Link } from "react-router-dom";
import { validatePhoneNumber, validateURL } from "../../utils/form-validation";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
/**
 * RegisterForm Component
 * @description Renders the complete registration form with role selection and validation
 * @returns {JSX.Element} The rendered registration form component
 */
function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useTranslation(['auth', 'validation']);
  const [apiError, setApiError] = useState("");

  const [selectedRole, setSelectedRole] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    profilePictureUrl: "",
    linkedInUrl: "",
    gender: "",
    dateOfBirth: "",
    country: "",
    city: "",
  });

  const [employerData, setEmployerData] = useState({
    companyName: "",
    description: "",
    industry: "",
    companySize: "",
    foundedYear: "",
    website: "",
    commercialRegistrationNumber: "",
    logoUrl: "",
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation states
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    profilePictureUrl: "",
    linkedInUrl: "",
    gender: "",
    dateOfBirth: "",
    country: "",
    city: "",
  });

  const [employerErrors, setEmployerErrors] = useState({
    companyName: "",
    description: "",
    industry: "",
    companySize: "",
    foundedYear: "",
    website: "",
    commercialRegistrationNumber: "",
    logoUrl: "",
  });

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSymbol: false,
  });

  /**
   * Validates password strength requirements
   * @param {string} password - The password to validate
   * @returns {Object} Validation results for each requirement
   */
  const validatePassword = useCallback((password) => {
    return {
      minLength: password.length >= 8, // GUIDE: MinLength(8)
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }, []);

  /**
   * Handles input changes for basic form fields
   * @param {Event} e - The input change event
   */
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      // Update form data
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Validate in real-time
      let error = "";

      if (name === "email") {
        if (!value) {
          error = t('validation:emailRequired', "Email is required");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = t('validation:emailInvalid', "Please enter a valid email address");
        }
      } else if (name === "firstName" || name === "lastName") {
        if (!value) {
          error = `${
            name === "firstName" ? t('validation:firstName', "First name") : t('validation:lastName', "Last name")
          } ${t('validation:isRequired', "is required")}`;
        } else if (value.length > 50) {
          error = `${
            name === "firstName" ? t('validation:firstName', "First name") : t('validation:lastName', "Last name")
          } ${t('validation:maxLength50', "must be less than 50 characters")}`;
        }
      } else if (name === "phone") {
        if (value && value.trim() !== "") {
          const phoneValidation = validatePhoneNumber(value);
          if (!phoneValidation.isValid) {
            error = phoneValidation.errorMessage;
          }
        }
      } else if (
        name === "profilePictureUrl" ||
        name === "linkedInUrl" ||
        name === "website" ||
        name === "logoUrl"
      ) {
        // URL validation for optional fields
        if (value && value.trim() !== "") {
          const urlError = validateURL(value, false);
          if (urlError) {
            error = urlError;
          }
        }
      } else if (name === "country" || name === "city") {
        // Optional, max length 100
        if (value && value.length > 100) {
          error = `${
            name === "country" ? "Country" : "City"
          } must be less than 100 characters`;
        }
      } else if (name === "password") {
        const passwordValidation = validatePassword(value);
        setPasswordValidation(passwordValidation);

        if (!value) {
          error = t('validation:passwordRequired', "Password is required");
        } else if (value.length < 8) {
          error = t('validation:passwordMinLength8', "Password must be at least 8 characters");
        } else if (!Object.values(passwordValidation).every((v) => v)) {
          error = t('validation:passwordRequirements', "Password does not meet all requirements");
        }

        // Clear confirm password error when password changes
        if (formData.confirmPassword && formData.confirmPassword !== value) {
          setFormErrors((prev) => ({
            ...prev,
            confirmPassword: t('validation:passwordMismatch', "Passwords do not match"),
          }));
        } else if (
          formData.confirmPassword &&
          formData.confirmPassword === value
        ) {
          setFormErrors((prev) => ({
            ...prev,
            confirmPassword: "",
          }));
        }
      } else if (name === "confirmPassword") {
        if (value && formData.password !== value) {
          error = t('validation:passwordMismatch', "Passwords do not match");
        }
      } else if (name === "description") {
        // Handle employer description
        if (value && value.length > 2000) {
          error = "Description must be less than 2000 characters";
        }
      } else if (name === "foundedYear") {
        // Handle employer founded year
        if (value && value.trim() !== "") {
          const year = parseInt(value);
          const currentYear = new Date().getFullYear();
          if (isNaN(year) || year < 1800 || year > currentYear) {
            error = "Please enter a valid year";
          }
        }
      }

      // Update errors
      if (
        name.startsWith("company") ||
        name === "description" ||
        name === "industry" ||
        name === "foundedYear" ||
        name === "website" ||
        name === "commercialRegistrationNumber" ||
        name === "logoUrl"
      ) {
        setEmployerErrors((prev) => ({ ...prev, [name]: error }));
      } else {
        setFormErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [validatePassword, formData.password, formData.confirmPassword]
  );

  /**
   * Handles DateInput changes
   */
  const handleDateChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear any existing error
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  /**
   * Checks if all required fields are filled and valid
   * @returns {boolean} True if form is valid
   */
  const isFormValid = useCallback(() => {
    // Required fields for all users
    const requiredFieldsValid =
      formData.email &&
      !formErrors.email &&
      formData.password &&
      !formErrors.password &&
      formData.confirmPassword &&
      !formErrors.confirmPassword &&
      formData.firstName &&
      !formErrors.firstName &&
      formData.lastName &&
      !formErrors.lastName &&
      termsAccepted;

    return requiredFieldsValid;
  }, [
    formData,
    formErrors,
    employerData,
    employerErrors,
    selectedRole,
    termsAccepted,
  ]);

  /**
   * Maps current role names to guide role names
   */
  const getGuideRoleName = () => {
    switch (selectedRole) {
      case "jobseeker":
        return "JobSeeker";
      case "employer":
        return "Employer";
      case "freelancer":
        return "Freelancer";
      case "client":
        return "Client";
      default:
        return selectedRole;
    }
  };

  /**
   * Handles form submission — calls real API register step 1.
   * Payload matches RegisterStep1Request DTO exactly.
   * On success, navigates to /verify with email in state.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsLoading(true);
    setApiError("");

    // Build RegisterStep1Request payload
    const step1Payload = {
      email:             formData.email,
      password:          formData.password,
      firstName:         formData.firstName,
      lastName:          formData.lastName,
      phone:             formData.phone             || undefined,
      profilePictureUrl: formData.profilePictureUrl || undefined,
      linkedInUrl:       formData.linkedInUrl       || undefined,
      gender:            formData.gender             || undefined,
      dateOfBirth:       formData.dateOfBirth        || undefined,
      country:           formData.country            || undefined,
      city:              formData.city               || undefined,
    };

    try {
      // Step 1 registration — AuthContext.register() stores the temp token
      await register(step1Payload);

      // Store role for onboarding (Step 2)
      localStorage.setItem("userRole", selectedRole);

      // Navigate to email verification — email passed in state for UI display
      navigate("/verify", { state: { email: formData.email } });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || t('auth:registerFailed', "Registration failed. Please try again.");
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles social login via Google or LinkedIn.
   * In production, get the OAuth token from the provider SDK first.
   */
  const handleSocialLogin = async (provider) => {
    // TODO: Integrate Google/LinkedIn SDK to obtain token, then:
    // const token = await getGoogleToken(); // or getLinkedInToken()
    // await loginWithGoogle(token);
    // navigate('/dashboard');
    console.log(`${provider} social login — SDK integration pending`);
  };

  // Check for password mismatch error
  const hasPasswordError =
    formData.confirmPassword && formData.password !== formData.confirmPassword;

  return (
    <div className="register-form__container">
      <div className="register-form__card">
        {/* API-level error banner */}
        {apiError && (
          <div className="form-error-message" style={{ margin: '0 0 1rem' }}>
            <i className="fa-solid fa-exclamation-triangle" />
            <span>{apiError}</span>
          </div>
        )}
        {/* Header */}
        <div className="register-form__header">
          <h2 className="register-form__title">{t('auth:createAccountTitle', 'Create Your Account')}</h2>
          <p className="register-form__subtitle">
            {t('auth:registerSubtitle', 'Register with details as specified in the guide')}
          </p>
        </div>

        {/* Role Selection - Updated to match guide role names */}
        <div className="register-form__role-selection">
          <RoleCard
            icon="fa-solid fa-bullseye"
            title={t('auth:jobseeker', 'Job seeker')}
            isSelected={selectedRole === "jobseeker"}
            onClick={() => setSelectedRole("jobseeker")}
          />
          <RoleCard
            icon="fa-solid fa-briefcase"
            title={t('auth:hirer', 'Hirer')}
            isSelected={selectedRole === "employer"}
            onClick={() => setSelectedRole("employer")}
          />
          {/* <RoleCard
            icon="fa-solid fa-laptop-code"
            title="Freelancer"
            description="مستقل"
            isSelected={selectedRole === "freelancer"}
            onClick={() => setSelectedRole("freelancer")}
          />
          <RoleCard
            icon="fa-solid fa-user-tag"
            title="Client"
            description="عميل"
            isSelected={selectedRole === "client"}
            onClick={() => setSelectedRole("client")}
          /> */}
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="register-form__form">
          {/* Section: Required Basic Information */}
          <div className="register-form__section">
            <h3 className="register-form__section-title">
              {t('auth:requiredInfo', 'Required Information')}
            </h3>
            <p className="register-form__section-description">
              {t('auth:basicDetails', 'Basic details required for all users')}
            </p>

            <div className="register-form__form-grid">
              {/* First Name */}
              <FormInput
                icon="fa-solid fa-user"
                type="text"
                name="firstName"
                placeholder={t('auth:firstName', 'First Name')}
                value={formData.firstName}
                onChange={handleInputChange}
                hasError={!!formErrors.firstName}
                errorMessage={formErrors.firstName}
                required
              />

              {/* Last Name */}
              <FormInput
                icon="fa-solid fa-user"
                type="text"
                name="lastName"
                placeholder={t('auth:lastName', 'Last Name')}
                value={formData.lastName}
                onChange={handleInputChange}
                hasError={!!formErrors.lastName}
                errorMessage={formErrors.lastName}
                required
              />

              {/* Email */}
              <FormInput
                icon="fa-solid fa-envelope"
                type="email"
                name="email"
                placeholder={t('auth:emailAddress', 'Email Address')}
                value={formData.email}
                onChange={handleInputChange}
                hasError={!!formErrors.email}
                errorMessage={formErrors.email}
                required
              />

              {/* Password */}
              <FormInput
                icon="fa-solid fa-lock"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={t('auth:passwordMin8', 'Password (min 8 characters)')}
                value={formData.password}
                onChange={handleInputChange}
                showPasswordToggle
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                hasError={!!formErrors.password}
                errorMessage={formErrors.password}
                required
              />

              {/* Password Strength Requirements */}
              {formData.password && (
                <div className="register-form__password-requirements">
                  <p className="register-form__requirements-title">
                    {t('auth:passwordContain', 'Password must contain:')}
                  </p>
                  <ul className="register-form__requirements-list">
                    <li
                      className={
                        passwordValidation.minLength
                          ? "register-form__requirement-item--valid"
                          : ""
                      }>
                      <i
                        className={`fa-solid ${
                          passwordValidation.minLength ? "fa-check" : "fa-xmark"
                        } register-form__requirement-icon`}
                      />
                      {t('auth:atLeast8', 'At least 8 characters')}
                    </li>
                    <li
                      className={
                        passwordValidation.hasUppercase
                          ? "register-form__requirement-item--valid"
                          : ""
                      }>
                      <i
                        className={`fa-solid ${
                          passwordValidation.hasUppercase
                            ? "fa-check"
                            : "fa-xmark"
                        } register-form__requirement-icon`}
                      />
                      {t('auth:oneUppercase', 'One uppercase letter')}
                    </li>
                    <li
                      className={
                        passwordValidation.hasLowercase
                          ? "register-form__requirement-item--valid"
                          : ""
                      }>
                      <i
                        className={`fa-solid ${
                          passwordValidation.hasLowercase
                            ? "fa-check"
                            : "fa-xmark"
                        } register-form__requirement-icon`}
                      />
                      {t('auth:oneLowercase', 'One lowercase letter')}
                    </li>
                    <li
                      className={
                        passwordValidation.hasNumber
                          ? "register-form__requirement-item--valid"
                          : ""
                      }>
                      <i
                        className={`fa-solid ${
                          passwordValidation.hasNumber ? "fa-check" : "fa-xmark"
                        } register-form__requirement-icon`}
                      />
                      {t('auth:oneNumber', 'One number')}
                    </li>
                    <li
                      className={
                        passwordValidation.hasSymbol
                          ? "register-form__requirement-item--valid"
                          : ""
                      }>
                      <i
                        className={`fa-solid ${
                          passwordValidation.hasSymbol ? "fa-check" : "fa-xmark"
                        } register-form__requirement-icon`}
                      />
                      {t('auth:oneSpecialChar', 'One special character')}
                    </li>
                  </ul>
                </div>
              )}

              {/* Confirm Password */}
              <FormInput
                icon="fa-solid fa-lock"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder={t('auth:confirmPassword', 'Confirm Password')}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                showPasswordToggle
                showPassword={showConfirmPassword}
                onTogglePassword={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                hasError={hasPasswordError}
                errorMessage={formErrors.confirmPassword}
                required
              />

              {/* Password Match Validation */}
              {hasPasswordError && (
                <p className="register-form__error-message">
                  <i className="fa-solid fa-exclamation-triangle" />
                  {t('validation:passwordMismatch', 'Passwords do not match')}
                </p>
              )}
            </div>
          </div>

          {/* Section: Optional Basic Information */}
          <div className="register-form__section">
            <h3 className="register-form__section-title">
              {t('auth:optionalInfo', 'Optional Information')}
            </h3>
            <p className="register-form__section-description">
              {t('auth:additionalDetails', 'Additional details (all optional)')}
            </p>

            <div className="register-form__form-grid">
              {/* Phone */}
              <FormInput
                icon="fa-solid fa-phone"
                type="tel"
                name="phone"
                placeholder={t('auth:phoneNumberOpt', 'Phone Number (Optional)')}
                value={formData.phone}
                onChange={handleInputChange}
                hasError={!!formErrors.phone}
                errorMessage={formErrors.phone}
              />

              {/* Gender */}
              <FormSelect
                icon="fa-solid fa-venus-mars"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                options={[
                  { value: "", label: t('auth:genderOpt', 'Gender (Optional)') },
                  { value: "Male", label: t('auth:male', 'Male') },
                  { value: "Female", label: t('auth:female', 'Female') },
                ]}
                hasError={!!formErrors.gender}
                errorMessage={formErrors.gender}
              />

              {/* Date of Birth */}
              <div className="register-form__date-input-wrapper">
                <DateInput
                  name="dateOfBirth"
                  label={t('auth:dobOpt', 'Date of Birth (Optional)')}
                  value={formData.dateOfBirth}
                  onChange={handleDateChange}
                  required={false}
                  minAge={16}
                  maxAge={100}
                  showAge={true}
                  hasError={!!formErrors.dateOfBirth}
                  errorMessage={formErrors.dateOfBirth}
                />
              </div>

              {/* Country */}
              <FormInput
                icon="fa-solid fa-globe"
                type="text"
                name="country"
                placeholder={t('auth:countryOpt', 'Country (Optional)')}
                value={formData.country}
                onChange={handleInputChange}
                hasError={!!formErrors.country}
                errorMessage={formErrors.country}
              />

              {/* City */}
              <FormInput
                icon="fa-solid fa-city"
                type="text"
                name="city"
                placeholder={t('auth:cityOpt', 'City (Optional)')}
                value={formData.city}
                onChange={handleInputChange}
                hasError={!!formErrors.city}
                errorMessage={formErrors.city}
              />

              {/* LinkedIn URL */}
              <FormInput
                icon="fa-brands fa-linkedin"
                type="url"
                name="linkedInUrl"
                placeholder={t('auth:linkedInUrlOpt', 'LinkedIn Profile URL (Optional)')}
                value={formData.linkedInUrl}
                onChange={handleInputChange}
                hasError={!!formErrors.linkedInUrl}
                errorMessage={formErrors.linkedInUrl}
              />

              {/* Profile Picture URL */}
              <FormInput
                icon="fa-solid fa-image"
                type="url"
                name="profilePictureUrl"
                placeholder={t('auth:profilePicUrlOpt', 'Profile Picture URL (Optional)')}
                value={formData.profilePictureUrl}
                onChange={handleInputChange}
                hasError={!!formErrors.profilePictureUrl}
                errorMessage={formErrors.profilePictureUrl}
              />
            </div>
          </div>

          {/* Terms and Conditions */}
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
                {t('auth:iAgreeToThe', 'I agree to the ')}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="register-form__terms-link">
                  {t('auth:termsAndConditions', 'Terms and Conditions')}
                </a>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid() || isLoading}
            className={`register-form__submit-button ${
              isLoading ? "register-form__submit-button--loading" : ""
            }`}>
            {isLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                {t('auth:creatingAccount', 'Creating Account...')}
              </>
            ) : (
              <>
                <i className="fa-solid fa-user-plus" />
                {t('auth:createAccountBtn', 'Create Account')}
              </>
            )}
          </button>

          <div className="register-form__sign-in-link">
            <p className="register-form__sign-in-text">
              {t('auth:alreadyHaveAccount', 'Already have an account?')}
            </p>
            <Link
              to="/login"
              className="register-form__sign-in-anchor"
              aria-label={t('auth:loginAria', 'Login to your account')}>
              {t('auth:signIn', 'Sign In')}
            </Link>
          </div>
          <div className="register-form__social-login">
            <div className="register-form__social-buttons">
              <button
                type="button"
                onClick={() => handleSocialLogin("Google")}
                className="register-form__social-button">
                <i className="fa-brands fa-google register-form__social-button-icon"></i>
                {t('auth:google', 'Google')}
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin("LinkedIn")}
                className="register-form__social-button">
                <i className="fa-brands fa-linkedin register-form__social-button-icon"></i>
                {t('auth:linkedIn', 'LinkedIn')}
              </button>
            </div>
          </div>

          <p className="register-form__terms-text">
            {t('auth:agreeTermsStartCreate', 'By creating an account, you agree to our ')}
            <Link
              to="/terms"
              target="_blank"
              className="register-form__terms-link">
              {t('auth:terms', 'Terms of Service')}
            </Link>
            {t('auth:and', ' and ')}
            <Link
              to="/privacy"
              target="_blank"
              className="register-form__terms-link">
              {t('auth:privacy', 'Privacy Policy')}
            </Link>
            .
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;
