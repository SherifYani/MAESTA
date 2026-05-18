/**
 * @file FreelancerOnboarding.jsx
 * @description Freelancer onboarding page aligned with guide specifications
 * @author Sherif Talaat
 * @version 1.4.0
 * @date 24-10-2025
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 03-12-2025
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FormInput from "../../components/forms/FormInput";
import FormTextarea from "../../components/forms/FormTextarea";
import FormSelect from "../../components/forms/FormSelect";
import FileUpload from "../../components/forms/FileUpload";
import "../../styles/pages/onboarding.css";
import {
  validateFile,
  validateMultipleFiles,
} from "../../utils/form-validation";
import authService from "../../services/authService";

/**
 * FreelancerOnboarding Component
 * @description Renders the freelancer onboarding form aligned with guide
 * @returns {JSX.Element} The rendered freelancer onboarding component
 */
function FreelancerOnboarding() {
  const { t } = useTranslation(['auth', 'validation']);
  const navigate = useNavigate();

  // Updated form state to match guide fields
  const [formData, setFormData] = useState({
    professionalTitle: "", // GUIDE: ProfessionalTitle (string)
    experienceYears: "", // GUIDE: ExperienceYears (int, 0-50)
    bio: "", // GUIDE: Bio (string, 10-2000 characters)
    hourlyRate: "", // GUIDE: HourlyRate (decimal)
    currency: "USD", // GUIDE: Currency (USD, EGP, SAR)
    portfolioUrl: "", // GUIDE: PortfolioUrl (string)
    documentVerificationUrl: "", // GUIDE: DocumentVerificationUrl (string)
  });

  // NOTE: Current form has extra fields not in guide
  const [extraFields, setExtraFields] = useState({
    location: "",
    skills: "",
    overview: "",
    portfolioImages: [],
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [formErrors, setFormErrors] = useState({
    professionalTitle: "",
    experienceYears: "",
    bio: "",
    hourlyRate: "",
    currency: "",
    portfolioUrl: "",
    documentVerificationUrl: "",
  });

  const [completionStatus, setCompletionStatus] = useState({
    professionalInfo: false,
    financialInfo: false,
    portfolio: false,
    verification: false,
  });

  const [overallProgress, setOverallProgress] = useState(0);

  /**
   * Calculate completion status for each section
   */
  useEffect(() => {
    const errors = {};

    // ProfessionalTitle validation
    if (
      !formData.professionalTitle ||
      formData.professionalTitle.trim() === ""
    ) {
      errors.professionalTitle = t('validation:profTitleRequired', "Professional title is required");
    } else if (formData.professionalTitle.length > 100) {
      errors.professionalTitle = t('validation:profTitleLength', "Professional title must be less than 100 characters");
    }

    // ExperienceYears validation (0-50)
    if (!formData.experienceYears && formData.experienceYears !== 0) {
      errors.experienceYears = t('validation:expRequired', "Years of experience is required");
    } else {
      const years = parseInt(formData.experienceYears);
      if (isNaN(years) || years < 0 || years > 50) {
        errors.experienceYears = t('validation:expRange', "Experience must be between 0 and 50 years");
      }
    }

    // Bio validation (10-2000 characters)
    if (!formData.bio || formData.bio.trim() === "") {
      errors.bio = t('validation:bioRequired', "Bio is required");
    } else if (formData.bio.length < 10) {
      errors.bio = t('validation:bioMinLength', "Bio must be at least 10 characters");
    } else if (formData.bio.length > 2000) {
      errors.bio = t('validation:bioMaxLength', "Bio must be less than 2000 characters");
    }

    // HourlyRate validation
    if (!formData.hourlyRate || formData.hourlyRate.trim() === "") {
      errors.hourlyRate = t('validation:hourlyRateRequired', "Hourly rate is required");
    } else {
      const rate = parseFloat(formData.hourlyRate);
      if (isNaN(rate) || rate < 0) {
        errors.hourlyRate = t('validation:hourlyRateInvalid', "Hourly rate must be a valid number");
      }
    }

    // Currency validation (must be one of USD, EGP, SAR)
    if (
      !formData.currency ||
      !["USD", "EGP", "SAR"].includes(formData.currency)
    ) {
      errors.currency = t('validation:currencyInvalid', "Currency must be USD, EGP, or SAR");
    }

    // PortfolioUrl validation (URL format, optional)
    if (formData.portfolioUrl && formData.portfolioUrl.trim() !== "") {
      try {
        new URL(formData.portfolioUrl);
      } catch {
        errors.portfolioUrl = t('validation:invalidPortfolioUrl', "Please enter a valid URL for your portfolio");
      }
    }

    // DocumentVerificationUrl validation (URL format, optional)
    if (
      formData.documentVerificationUrl &&
      formData.documentVerificationUrl.trim() !== ""
    ) {
      try {
        new URL(formData.documentVerificationUrl);
      } catch {
        errors.documentVerificationUrl = t('validation:invalidDocUrl', "Please enter a valid URL for your verification document");
      }
    }

    setFormErrors(errors);

    // File validation for extra fields (not in guide)
    const profilePictureError = validateFile(profilePicture, {
      fieldName: "Profile picture",
      maxSizeMB: 5,
    });

    const portfolioImagesError = validateMultipleFiles(
      extraFields.portfolioImages,
      {
        minCount: 0, // Optional in current form but not in guide
        fieldName: "Portfolio images",
      }
    );

    // Calculate completion status based on guide requirements
    const professionalInfoComplete =
      !errors.professionalTitle &&
      !errors.experienceYears &&
      !errors.bio &&
      formData.professionalTitle &&
      formData.experienceYears !== "" &&
      formData.bio;

    const financialInfoComplete =
      !errors.hourlyRate &&
      !errors.currency &&
      formData.hourlyRate &&
      formData.currency;

    const portfolioComplete =
      !errors.portfolioUrl && // Optional, so no error means complete
      (formData.portfolioUrl === "" || formData.portfolioUrl);

    const verificationComplete =
      !errors.documentVerificationUrl && // Optional
      (formData.documentVerificationUrl === "" ||
        formData.documentVerificationUrl);

    setCompletionStatus({
      professionalInfo: professionalInfoComplete,
      financialInfo: financialInfoComplete,
      portfolio: portfolioComplete,
      verification: verificationComplete,
    });

    // Calculate overall progress
    let progress = 0;

    // Professional Info (40%)
    if (professionalInfoComplete) progress += 40;

    // Financial Info (30%)
    if (financialInfoComplete) progress += 30;

    // Portfolio and Verification (30% combined, both optional)
    if (portfolioComplete) progress += 15;
    if (verificationComplete) progress += 15;

    setOverallProgress(Math.min(progress, 100));
  }, [formData, profilePicture, extraFields.portfolioImages]);

  /**
   * Handles input changes for guide fields
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "experienceYears") {
      // Only allow numbers 0-50
      if (value === "" || /^\d+$/.test(value)) {
        const numValue = value === "" ? "" : parseInt(value);
        if (numValue === "" || (numValue >= 0 && numValue <= 50)) {
          setFormData((prev) => ({ ...prev, [name]: numValue }));
        }
      }
    } else if (name === "hourlyRate") {
      // Allow decimal numbers
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  /**
   * Handles extra fields changes
   */
  const handleExtraFieldChange = (e) => {
    const { name, value } = e.target;
    setExtraFields((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handles portfolio images upload (extra field)
   */
  const handlePortfolioImagesUpload = (file) => {
    if (file) {
      setExtraFields((prev) => ({
        ...prev,
        portfolioImages: [...prev.portfolioImages, file],
      }));
    }
  };

  /**
   * Removes a portfolio image
   */
  const removePortfolioImage = (index) => {
    setExtraFields((prev) => ({
      ...prev,
      portfolioImages: prev.portfolioImages.filter((_, i) => i !== index),
    }));
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare submission data
    const submissionData = {
      // Guide fields
      professionalTitle: formData.professionalTitle,
      experienceYears: parseInt(formData.experienceYears) || 0,
      bio: formData.bio,
      hourlyRate: parseFloat(formData.hourlyRate) || 0,
      currency: formData.currency,
      portfolioUrl: formData.portfolioUrl || null,
      documentVerificationUrl: formData.documentVerificationUrl || null,

      // Extra fields
      extraData: {
        location: extraFields.location,
        skills: extraFields.skills,
        overview: extraFields.overview,
        portfolioImages: extraFields.portfolioImages,
        profilePicture: profilePicture,
      },
    };

    setIsLoading(true);
    setApiError("");

    try {
      await authService.registerStep2({
        userType: "Freelancer",
        professionalTitle: formData.professionalTitle,
        experienceYears: parseInt(formData.experienceYears) || 0,
        bio: formData.bio,
        hourlyRate: parseFloat(formData.hourlyRate) || 0,
        currency: formData.currency,
        portfolioUrl: formData.portfolioUrl || null,
        documentVerificationUrl: formData.documentVerificationUrl || null,
        // Backend handles file uploads or ignores extra Data
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting freelancer data:", error);
      setApiError(error?.response?.data?.message || t('auth:completeProfileFailed', "Error submitting profile. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles save as draft
   */
  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      const draftData = {
        ...formData,
        ...extraFields,
        profilePicture,
      };

      console.log("Saving draft:", draftData);

      setTimeout(() => {
        alert(t('auth:draftSaved', "Draft saved successfully!"));
      }, 1000);
    } catch (error) {
      console.error("Error saving draft:", error);
      alert(t('auth:draftFailed', "Error saving draft. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="onboarding-phase-2">
      <div className="onboarding-phase-2__container">
        <div className="onboarding-phase-2__header">
          <h1 className="onboarding-phase-2__title">
            {t('auth:onboarding.freelancer.title', "Complete Your Freelancer Profile")}
          </h1>
          <p className="onboarding-phase-2__subtitle">
            {t('auth:onboarding.freelancer.subtitle', "Provide your professional information as specified in the guide")}
          </p>
        </div>

        {/* Progress Section */}
        <div className="register-form__progress-section">
          <div className="register-form__progress-header">
            <h3>{t('auth:onboarding.freelancer.profileCompletion', "Profile Completion")}</h3>
            <span className="register-form__progress-percentage">
              {overallProgress}%
            </span>
          </div>
          <div className="register-form__progress-bar">
            <div
              className="register-form__progress-fill"
              style={{ width: `${overallProgress}%` }}></div>
          </div>
          <p className="register-form__progress-hint">
            {overallProgress === 100
              ? t('auth:onboarding.freelancer.readyToSubmit', "🎉 Your freelancer profile is complete!")
              : t('auth:onboarding.freelancer.completeRequired', "Complete required sections to submit your profile")}
          </p>
        </div>

        {apiError && (
          <div className="onboarding-phase-2__api-error">
            <i className="fa-solid fa-circle-exclamation"></i>
            {apiError}
          </div>
        )}

        <div className="onboarding-phase-2__card">
          <form onSubmit={handleSubmit}>
            {/* Section 1: Professional Information */}
            <div className="onboarding-phase-2__section">
              <div className="onboarding-phase-2__section-header">
                <div className="onboarding-phase-2__section-title-wrapper">
                  <h2 className="onboarding-phase-2__section-title">
                    {t('auth:onboarding.freelancer.professionalInfo', "Professional Information")}
                  </h2>
                  {completionStatus.professionalInfo && (
                    <span className="onboarding-phase-2__section-badge completed">
                      <i className="fa-solid fa-check-circle" />
                      {t('auth:onboarding.company.completed', "Completed")}
                    </span>
                  )}
                </div>
                <p className="onboarding-phase-2__section-description">
                  {t('auth:onboarding.freelancer.profInfoDesc', "Your professional identity as specified in the guide")}
                </p>
              </div>

              <div className="onboarding-phase-2__form-grid">
                {/* Professional Title */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-heading"
                    type="text"
                    name="professionalTitle"
                    placeholder={t('auth:onboarding.freelancer.profTitlePlaceholder', "Professional Title (e.g., Senior Web Developer)")}
                    value={formData.professionalTitle}
                    onChange={handleInputChange}
                    hasError={!!formErrors.professionalTitle}
                    errorMessage={formErrors.professionalTitle}
                    required
                  />
                  <p className="onboarding-phase-2__field-hint">
                    {t('auth:onboarding.freelancer.profTitleHint', "Your main professional title")}
                  </p>
                </div>

                {/* Experience Years */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-calendar-alt"
                    type="number"
                    name="experienceYears"
                    placeholder={t('auth:onboarding.freelancer.expYearsPlaceholder', "Years of Experience (0-50)")}
                    value={formData.experienceYears}
                    onChange={handleInputChange}
                    min="0"
                    max="50"
                    hasError={!!formErrors.experienceYears}
                    errorMessage={formErrors.experienceYears}
                    required
                  />
                  <p className="onboarding-phase-2__field-hint">
                    {t('auth:onboarding.freelancer.expYearsHint', "Total years of professional experience")}
                  </p>
                </div>

                {/* Bio */}
                <div className="onboarding-phase-2__full-width">
                  <div className="onboarding-phase-2__textarea-section">
                    <FormTextarea
                      icon="fa-solid fa-align-left"
                      name="bio"
                      placeholder={t('auth:onboarding.freelancer.bioPlaceholder', "Professional bio (10-2000 characters). Describe your expertise and experience.")}
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={6}
                      maxLength={2000}
                      hasError={!!formErrors.bio}
                      errorMessage={formErrors.bio}
                      required
                    />
                    <div className="register-form__character-counter">
                      <span
                        className={
                          formData.bio.length > 1900
                            ? "register-form__character-counter--warning"
                            : ""
                        }>
                        {formData.bio.length} / 2000 {t('auth:onboarding.jobseeker.characters', "characters")}
                      </span>
                      {formData.bio.length > 0 && formData.bio.length < 10 && (
                        <span className="register-form__character-error">
                          <i className="fa-solid fa-exclamation-triangle" />
                          {t('auth:onboarding.jobseeker.needMoreChars', { count: 10 - formData.bio.length, defaultValue: `Need ${10 - formData.bio.length} more characters` })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Financial Information */}
            <div className="onboarding-phase-2__section">
              <div className="onboarding-phase-2__section-header">
                <div className="onboarding-phase-2__section-title-wrapper">
                  <h2 className="onboarding-phase-2__section-title">
                    {t('auth:onboarding.freelancer.financialInfo', "Financial Information")}
                  </h2>
                  {completionStatus.financialInfo && (
                    <span className="onboarding-phase-2__section-badge completed">
                      <i className="fa-solid fa-check-circle" />
                      {t('auth:onboarding.company.completed', "Completed")}
                    </span>
                  )}
                </div>
                <p className="onboarding-phase-2__section-description">
                  {t('auth:onboarding.freelancer.financialInfoDesc', "Your rates and currency as specified in the guide")}
                </p>
              </div>

              <div className="onboarding-phase-2__form-grid">
                {/* Hourly Rate */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-dollar-sign"
                    type="text"
                    name="hourlyRate"
                    placeholder={t('auth:onboarding.freelancer.hourlyRatePlaceholder', "Hourly Rate (e.g., 50.00)")}
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    hasError={!!formErrors.hourlyRate}
                    errorMessage={formErrors.hourlyRate}
                    required
                  />
                  <p className="onboarding-phase-2__field-hint">
                    {t('auth:onboarding.freelancer.hourlyRateHint', "Your standard hourly rate")}
                  </p>
                </div>

                {/* Currency */}
                <div className="onboarding-phase-2__form-item">
                  <FormSelect
                    icon="fa-solid fa-money-bill-wave"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    options={[
                      { value: "USD", label: t('auth:onboarding.freelancer.currencyUsd', "USD - US Dollar") },
                      { value: "EGP", label: t('auth:onboarding.freelancer.currencyEgp', "EGP - Egyptian Pound") },
                      { value: "SAR", label: t('auth:onboarding.freelancer.currencySar', "SAR - Saudi Riyal") },
                    ]}
                    hasError={!!formErrors.currency}
                    errorMessage={formErrors.currency}
                    required
                  />
                  <p className="onboarding-phase-2__field-hint">
                    {t('auth:onboarding.freelancer.currencyHint', "Currency for your rates (USD, EGP, or SAR)")}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Portfolio & Links (Optional) */}
            <div className="onboarding-phase-2__section">
              <div className="onboarding-phase-2__section-header">
                <div className="onboarding-phase-2__section-title-wrapper">
                  <h2 className="onboarding-phase-2__section-title">
                    {t('auth:onboarding.freelancer.portfolioAndVerification', "Portfolio & Verification")}
                  </h2>
                  {completionStatus.portfolio &&
                    completionStatus.verification && (
                      <span className="onboarding-phase-2__section-badge completed">
                        <i className="fa-solid fa-check-circle" />
                        {t('auth:onboarding.company.completed', "Completed")}
                      </span>
                    )}
                </div>
                <p className="onboarding-phase-2__section-description">
                  {t('auth:onboarding.freelancer.portfolioDesc', "Optional links to your portfolio and verification documents")}
                </p>
              </div>

              <div className="onboarding-phase-2__form-grid">
                {/* Portfolio URL */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-link"
                    type="url"
                    name="portfolioUrl"
                    placeholder={t('auth:onboarding.freelancer.portfolioUrlPlaceholder', "Portfolio URL (Optional)")}
                    value={formData.portfolioUrl}
                    onChange={handleInputChange}
                    hasError={!!formErrors.portfolioUrl}
                    errorMessage={formErrors.portfolioUrl}
                  />
                  <p className="onboarding-phase-2__field-hint">
                    {t('auth:onboarding.freelancer.portfolioUrlHint', "Link to your online portfolio or work samples")}
                  </p>
                </div>

                {/* Document Verification URL */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-id-card"
                    type="url"
                    name="documentVerificationUrl"
                    placeholder={t('auth:onboarding.freelancer.docVerificationUrlPlaceholder', "Document Verification URL (Optional)")}
                    value={formData.documentVerificationUrl}
                    onChange={handleInputChange}
                    hasError={!!formErrors.documentVerificationUrl}
                    errorMessage={formErrors.documentVerificationUrl}
                  />
                  <p className="onboarding-phase-2__field-hint">
                    {t('auth:onboarding.freelancer.docVerificationUrlHint', "Link to your identity or passport verification document")}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4: Additional Information (Extra Fields) */}
            <div className="onboarding-phase-2__section">
              <div className="onboarding-phase-2__section-header">
                <div className="onboarding-phase-2__section-title-wrapper">
                  <h2 className="onboarding-phase-2__section-title">
                    {t('auth:onboarding.freelancer.additionalInfo', "Additional Information")}
                  </h2>
                  <span className="onboarding-phase-2__section-badge optional">
                    {t('auth:onboarding.jobseeker.optional', "Optional")}
                  </span>
                </div>
                <p className="onboarding-phase-2__section-description">
                  {t('auth:onboarding.freelancer.additionalInfoDesc', "Additional profile details (not in registration guide)")}
                </p>
              </div>

              <div className="onboarding-phase-2__form-grid">
                {/* Location (Extra) */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-location-dot"
                    type="text"
                    name="location"
                    placeholder={t('auth:onboarding.freelancer.locationPlaceholder', "Location (Optional)")}
                    value={extraFields.location}
                    onChange={handleExtraFieldChange}
                  />
                </div>

                {/* Skills (Extra) */}
                <div className="onboarding-phase-2__full-width">
                  <div className="onboarding-phase-2__textarea-section">
                    <FormTextarea
                      icon="fa-solid fa-code"
                      name="skills"
                      placeholder={t('auth:onboarding.freelancer.skillsPlaceholder', "Skills and Technologies (Optional)")}
                      value={extraFields.skills}
                      onChange={handleExtraFieldChange}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Portfolio Images (Extra) */}
                <div className="onboarding-phase-2__full-width">
                  <div className="file-upload__container">
                    <h3 className="onboarding-phase-2__file-section-title">
                      <i className="fa-solid fa-images" />
                      {t('auth:onboarding.freelancer.portfolioImagesTitle', "Portfolio Images (Optional)")}
                    </h3>
                    <FileUpload
                      label={t('auth:onboarding.jobseeker.clickToUpload', "Click to upload or drag and drop")}
                      accept="image/*"
                      onChange={(file) => {
                        if (file && file.size > 10 * 1024 * 1024) {
                          setApiError(t('auth:onboarding.freelancer.fileSize10MB', "File size must be less than 10MB"));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          return;
                        }
                        if (extraFields.portfolioImages.length >= 10) {
                          setApiError(t('auth:onboarding.freelancer.max10Images', "Maximum 10 portfolio images allowed"));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          return;
                        }
                        handlePortfolioImagesUpload(file);
                      }}
                      icon="fa-solid fa-images"
                      supportedFormats="PNG, JPG, SVG (Max. 10MB each)"
                      fileType="image"
                      multiple
                    />

                    {extraFields.portfolioImages.length > 0 && (
                      <div className="register-form__uploaded-files">
                        <p className="register-form__uploaded-count">
                          <i className="fa-solid fa-check-circle" />
                          {t('auth:onboarding.freelancer.imagesUploaded', { count: extraFields.portfolioImages.length, defaultValue: `${extraFields.portfolioImages.length} image(s) uploaded` })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Picture (Extra) */}
                <div className="onboarding-phase-2__full-width">
                  <div className="file-upload__container">
                    <h3 className="onboarding-phase-2__file-section-title">
                      <i className="fa-solid fa-camera" />
                      {t('auth:onboarding.freelancer.profilePicTitle', "Profile Picture (Optional)")}
                    </h3>
                    <FileUpload
                      label={t('auth:onboarding.jobseeker.clickToUpload', "Click to upload or drag and drop")}
                      accept="image/*"
                      onChange={(file) => {
                        if (file && file.size > 5 * 1024 * 1024) {
                          setApiError(t('auth:onboarding.freelancer.fileSize5MB', "File size must be less than 5MB"));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          return;
                        }
                        setProfilePicture(file);
                      }}
                      icon="fa-solid fa-camera"
                      supportedFormats="PNG, JPG, SVG (Max. 5MB)"
                      fileType="image"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="onboarding-phase-2__submit-section">
              <button
                type="button"
                className="onboarding-phase-2__draft-button"
                onClick={handleSaveDraft}
                disabled={isLoading}>
                <i className="fa-solid fa-save" />
                {t('auth:onboarding.jobseeker.saveDraft', "Save as Draft")}
              </button>
              <button
                type="submit"
                className={`onboarding-phase-2__submit-button ${
                  isLoading ? "onboarding-phase-2__submit-button--loading" : ""
                }`}
                disabled={overallProgress < 100 || isLoading}>
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    {t('auth:onboarding.jobseeker.submitting', "Submitting...")}
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check" />
                    {overallProgress === 100
                      ? t('auth:onboarding.jobseeker.completeProfile', "Complete Profile")
                      : t('auth:onboarding.freelancer.completeProfileProgress', { progress: overallProgress, defaultValue: `Complete Profile (${overallProgress}%)` })}
                  </>
                )}
              </button>
            </div>

            {/* Terms Notice */}
            <div className="register-form__terms-notice">
              <p>
                {t('auth:onboarding.jobseeker.termsNotice', "By completing this profile, you agree to our")}{" "}
                <a href="/terms" className="register-form__terms-link">
                  {t('auth:terms', "Terms of Service")}
                </a>{" "}
                {t('auth:and', "and")}{" "}
                <a href="/privacy" className="register-form__terms-link">
                  {t('auth:privacy', "Privacy Policy")}
                </a>
                .
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FreelancerOnboarding;
