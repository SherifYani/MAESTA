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
import FormInput from "../../components/forms/FormInput";
import FormTextarea from "../../components/forms/FormTextarea";
import FormSelect from "../../components/forms/FormSelect";
import FileUpload from "../../components/forms/FileUpload";
import "../../styles/pages/onboarding.css";
import {
  validateFile,
  validateMultipleFiles,
} from "../../utils/form-validation";

/**
 * FreelancerOnboarding Component
 * @description Renders the freelancer onboarding form aligned with guide
 * @returns {JSX.Element} The rendered freelancer onboarding component
 */
function FreelancerOnboarding() {
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
      errors.professionalTitle = "Professional title is required";
    } else if (formData.professionalTitle.length > 100) {
      errors.professionalTitle =
        "Professional title must be less than 100 characters";
    }

    // ExperienceYears validation (0-50)
    if (!formData.experienceYears && formData.experienceYears !== 0) {
      errors.experienceYears = "Years of experience is required";
    } else {
      const years = parseInt(formData.experienceYears);
      if (isNaN(years) || years < 0 || years > 50) {
        errors.experienceYears = "Experience must be between 0 and 50 years";
      }
    }

    // Bio validation (10-2000 characters)
    if (!formData.bio || formData.bio.trim() === "") {
      errors.bio = "Bio is required";
    } else if (formData.bio.length < 10) {
      errors.bio = "Bio must be at least 10 characters";
    } else if (formData.bio.length > 2000) {
      errors.bio = "Bio must be less than 2000 characters";
    }

    // HourlyRate validation
    if (!formData.hourlyRate || formData.hourlyRate.trim() === "") {
      errors.hourlyRate = "Hourly rate is required";
    } else {
      const rate = parseFloat(formData.hourlyRate);
      if (isNaN(rate) || rate < 0) {
        errors.hourlyRate = "Hourly rate must be a valid number";
      }
    }

    // Currency validation (must be one of USD, EGP, SAR)
    if (
      !formData.currency ||
      !["USD", "EGP", "SAR"].includes(formData.currency)
    ) {
      errors.currency = "Currency must be USD, EGP, or SAR";
    }

    // PortfolioUrl validation (URL format, optional)
    if (formData.portfolioUrl && formData.portfolioUrl.trim() !== "") {
      try {
        new URL(formData.portfolioUrl);
      } catch {
        errors.portfolioUrl = "Please enter a valid URL for your portfolio";
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
        errors.documentVerificationUrl =
          "Please enter a valid URL for your verification document";
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

    try {
      console.log("Submitting freelancer data:", submissionData);

      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert("Freelancer profile submitted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error submitting freelancer data:", error);
      alert("Error submitting profile. Please try again.");
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
        alert("Draft saved successfully!");
      }, 1000);
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Error saving draft. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="onboarding-phase-2">
      <div className="onboarding-phase-2__container">
        <div className="onboarding-phase-2__header">
          <h1 className="onboarding-phase-2__title">
            Complete Your Freelancer Profile
          </h1>
          <p className="onboarding-phase-2__subtitle">
            Provide your professional information as specified in the guide
          </p>
        </div>

        {/* Progress Section */}
        <div className="register-form__progress-section">
          <div className="register-form__progress-header">
            <h3>Profile Completion</h3>
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
              ? "🎉 Your freelancer profile is complete!"
              : "Complete required sections to submit your profile"}
          </p>
        </div>

        <div className="onboarding-phase-2__card">
          <form onSubmit={handleSubmit}>
            {/* Section 1: Professional Information */}
            <div className="onboarding-phase-2__section">
              <div className="onboarding-phase-2__section-header">
                <div className="onboarding-phase-2__section-title-wrapper">
                  <h2 className="onboarding-phase-2__section-title">
                    Professional Information
                  </h2>
                  {completionStatus.professionalInfo && (
                    <span className="onboarding-phase-2__section-badge completed">
                      <i className="fa-solid fa-check-circle" />
                      Completed
                    </span>
                  )}
                </div>
                <p className="onboarding-phase-2__section-description">
                  Your professional identity as specified in the guide
                </p>
              </div>

              <div className="onboarding-phase-2__form-grid">
                {/* Professional Title */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-heading"
                    type="text"
                    name="professionalTitle"
                    placeholder="Professional Title (e.g., Senior Web Developer)"
                    value={formData.professionalTitle}
                    onChange={handleInputChange}
                    hasError={!!formErrors.professionalTitle}
                    errorMessage={formErrors.professionalTitle}
                    required
                  />
                  <p className="onboarding-phase-2__field-hint">
                    Your main professional title
                  </p>
                </div>

                {/* Experience Years */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-calendar-alt"
                    type="number"
                    name="experienceYears"
                    placeholder="Years of Experience (0-50)"
                    value={formData.experienceYears}
                    onChange={handleInputChange}
                    min="0"
                    max="50"
                    hasError={!!formErrors.experienceYears}
                    errorMessage={formErrors.experienceYears}
                    required
                  />
                  <p className="onboarding-phase-2__field-hint">
                    Total years of professional experience
                  </p>
                </div>

                {/* Bio */}
                <div className="onboarding-phase-2__full-width">
                  <div className="onboarding-phase-2__textarea-section">
                    <FormTextarea
                      icon="fa-solid fa-align-left"
                      name="bio"
                      placeholder="Professional bio (10-2000 characters). Describe your expertise and experience."
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
                        {formData.bio.length} / 2000 characters
                      </span>
                      {formData.bio.length > 0 && formData.bio.length < 10 && (
                        <span className="register-form__character-error">
                          <i className="fa-solid fa-exclamation-triangle" />
                          Need {10 - formData.bio.length} more characters
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
                    Financial Information
                  </h2>
                  {completionStatus.financialInfo && (
                    <span className="onboarding-phase-2__section-badge completed">
                      <i className="fa-solid fa-check-circle" />
                      Completed
                    </span>
                  )}
                </div>
                <p className="onboarding-phase-2__section-description">
                  Your rates and currency as specified in the guide
                </p>
              </div>

              <div className="onboarding-phase-2__form-grid">
                {/* Hourly Rate */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-dollar-sign"
                    type="text"
                    name="hourlyRate"
                    placeholder="Hourly Rate (e.g., 50.00)"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    hasError={!!formErrors.hourlyRate}
                    errorMessage={formErrors.hourlyRate}
                    required
                  />
                  <p className="onboarding-phase-2__field-hint">
                    Your standard hourly rate
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
                      { value: "USD", label: "USD - US Dollar" },
                      { value: "EGP", label: "EGP - Egyptian Pound" },
                      { value: "SAR", label: "SAR - Saudi Riyal" },
                    ]}
                    hasError={!!formErrors.currency}
                    errorMessage={formErrors.currency}
                    required
                  />
                  <p className="onboarding-phase-2__field-hint">
                    Currency for your rates (USD, EGP, or SAR)
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Portfolio & Links (Optional) */}
            <div className="onboarding-phase-2__section">
              <div className="onboarding-phase-2__section-header">
                <div className="onboarding-phase-2__section-title-wrapper">
                  <h2 className="onboarding-phase-2__section-title">
                    Portfolio & Verification
                  </h2>
                  {completionStatus.portfolio &&
                    completionStatus.verification && (
                      <span className="onboarding-phase-2__section-badge completed">
                        <i className="fa-solid fa-check-circle" />
                        Completed
                      </span>
                    )}
                </div>
                <p className="onboarding-phase-2__section-description">
                  Optional links to your portfolio and verification documents
                </p>
              </div>

              <div className="onboarding-phase-2__form-grid">
                {/* Portfolio URL */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-link"
                    type="url"
                    name="portfolioUrl"
                    placeholder="Portfolio URL (Optional)"
                    value={formData.portfolioUrl}
                    onChange={handleInputChange}
                    hasError={!!formErrors.portfolioUrl}
                    errorMessage={formErrors.portfolioUrl}
                  />
                  <p className="onboarding-phase-2__field-hint">
                    Link to your online portfolio or work samples
                  </p>
                </div>

                {/* Document Verification URL */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-id-card"
                    type="url"
                    name="documentVerificationUrl"
                    placeholder="Document Verification URL (Optional)"
                    value={formData.documentVerificationUrl}
                    onChange={handleInputChange}
                    hasError={!!formErrors.documentVerificationUrl}
                    errorMessage={formErrors.documentVerificationUrl}
                  />
                  <p className="onboarding-phase-2__field-hint">
                    Link to your identity or passport verification document
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4: Additional Information (Extra Fields) */}
            <div className="onboarding-phase-2__section">
              <div className="onboarding-phase-2__section-header">
                <div className="onboarding-phase-2__section-title-wrapper">
                  <h2 className="onboarding-phase-2__section-title">
                    Additional Information
                  </h2>
                  <span className="onboarding-phase-2__section-badge optional">
                    Optional
                  </span>
                </div>
                <p className="onboarding-phase-2__section-description">
                  Additional profile details (not in registration guide)
                </p>
              </div>

              <div className="onboarding-phase-2__form-grid">
                {/* Location (Extra) */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-location-dot"
                    type="text"
                    name="location"
                    placeholder="Location (Optional)"
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
                      placeholder="Skills and Technologies (Optional)"
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
                      Portfolio Images (Optional)
                    </h3>
                    <FileUpload
                      label="Click to upload or drag and drop"
                      accept="image/*"
                      onChange={(file) => {
                        if (file && file.size > 10 * 1024 * 1024) {
                          alert("File size must be less than 10MB");
                          return;
                        }
                        if (extraFields.portfolioImages.length >= 10) {
                          alert("Maximum 10 portfolio images allowed");
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
                          {extraFields.portfolioImages.length} image(s) uploaded
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
                      Profile Picture (Optional)
                    </h3>
                    <FileUpload
                      label="Click to upload or drag and drop"
                      accept="image/*"
                      onChange={(file) => {
                        if (file && file.size > 5 * 1024 * 1024) {
                          alert("File size must be less than 5MB");
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
                Save as Draft
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
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check" />
                    {overallProgress === 100
                      ? "Complete Profile"
                      : `Complete Profile (${overallProgress}%)`}
                  </>
                )}
              </button>
            </div>

            {/* Terms Notice */}
            <div className="register-form__terms-notice">
              <p>
                By completing this profile, you agree to our{" "}
                <a href="/terms" className="register-form__terms-link">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="register-form__terms-link">
                  Privacy Policy
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
