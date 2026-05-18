/**
 * @file JobSeekerOnboarding.jsx
 * @description Job seeker onboarding page — Step 2 of registration (profile completion)
 * @author Sherif Talaat
 * @version 2.0.0
 * @date 24-10-2025
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-04-29
 * @fix Wired handleSubmit to real API: authService.registerStep2({ userType: 'JobSeeker', ... }).
 *      Navigates to /dashboard on success. Shows API errors inline. Removed setTimeout simulation.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FormInput from "../../components/forms/FormInput";
import FormTextarea from "../../components/forms/FormTextarea";
import FormSelect from "../../components/forms/FormSelect";
import FileUpload from "../../components/forms/FileUpload";
import "../../styles/pages/onboarding.css";
import { validateFile } from "../../utils/form-validation";
import authService from "../../services/authService";

/**
 * JobSeekerOnboarding Component
 * @description Renders the job seeker onboarding form aligned with guide specifications
 * @returns {JSX.Element} The rendered job seeker onboarding component
 */
function JobSeekerOnboarding() {
  const { t } = useTranslation(['auth', 'validation']);
  const navigate = useNavigate();

  // Updated form state to match guide fields
  const [formData, setFormData] = useState({
    professionalTitle: "", // GUIDE: ProfessionalTitle (string)
    experienceYears: "", // GUIDE: ExperienceYears (int, 0-50)
    bio: "", // GUIDE: Bio (string, 10-2000 characters)
    cvUrl: "", // GUIDE: CVUrl (string - URL)
    preferredJobType: "", // GUIDE: PreferredJobType (string - FullTime, PartTime, etc.)
  });

  // NOTE: Current form has extra fields not in guide:
  // location, skills, experiences array, education array
  // Keeping them commented for reference
  const [extraFields, setExtraFields] = useState({
    location: "",
    skills: "",
    experiences: [{ id: "1", title: "", company: "", duration: "" }],
    education: [{ id: "1", degree: "", institution: "", year: "" }],
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [resume, setResume] = useState(null); // GUIDE expects CVUrl (URL), not file upload
  const [completionStatus, setCompletionStatus] = useState({
    professionalInfo: false,
    documents: false,
  });
  const [overallProgress, setOverallProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    professionalTitle: "",
    experienceYears: "",
    bio: "",
    cvUrl: "",
    preferredJobType: "",
  });

  /**
   * Calculate completion status for each section
   */
  useEffect(() => {
    // Validate guide-required fields
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

    // CVUrl validation (URL format)
    if (formData.cvUrl && formData.cvUrl.trim() !== "") {
      try {
        new URL(formData.cvUrl);
      } catch {
        errors.cvUrl = t('validation:invalidCvUrl', "Please enter a valid URL for your CV");
      }
    }

    // PreferredJobType validation
    if (!formData.preferredJobType || formData.preferredJobType.trim() === "") {
      errors.preferredJobType = t('validation:prefJobTypeRequired', "Preferred job type is required");
    }

    setFormErrors(errors);

    // File validation
    const resumeError = validateFile(resume, {
      fieldName: "Resume",
      maxSizeMB: 10,
      allowedTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    });

    // Calculate completion status based on guide requirements
    const professionalInfoComplete =
      !errors.professionalTitle &&
      !errors.experienceYears &&
      !errors.bio &&
      !errors.preferredJobType &&
      formData.professionalTitle &&
      formData.experienceYears !== "" &&
      formData.bio &&
      formData.preferredJobType;

    const documentsComplete =
      (!formData.cvUrl || !errors.cvUrl) && // CVUrl is optional per guide
      !resumeError && // File upload is extra, not in guide
      resume; // Current form requires file upload

    setCompletionStatus({
      professionalInfo: professionalInfoComplete,
      documents: documentsComplete,
    });

    // Calculate overall progress based on guide requirements
    let progress = 0;

    // Professional Info (80% weight)
    if (professionalInfoComplete) progress += 80;

    // Documents (20% weight - CVUrl is optional, so give credit if provided or skipped)
    if ((!formData.cvUrl || !errors.cvUrl) && resume) {
      progress += 20;
    } else if (!formData.cvUrl && !resume) {
      // If neither provided, still give partial credit for optional field
      progress += 10;
    }

    setOverallProgress(Math.min(progress, 100));
  }, [formData, resume]);

  /**
   * Handles input changes for form fields
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>} e - The change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special handling for experienceYears to ensure it's a number
    if (name === "experienceYears") {
      // Only allow numbers and empty string
      if (value === "" || /^\d+$/.test(value)) {
        const numValue = value === "" ? "" : parseInt(value);
        if (numValue === "" || (numValue >= 0 && numValue <= 50)) {
          setFormData((prev) => ({ ...prev, [name]: numValue }));
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  /**
   * Saves the current form data as a draft (local storage or API)
   */
  const handleSaveDraft = () => {
    try {
      const draftData = {
        formData,
      };
      localStorage.setItem("jobSeekerDraft", JSON.stringify(draftData));
      alert(t('auth:draftSaved', "Draft saved successfully!"));
    } catch (error) {
      console.error("Failed to save draft", error);
      alert(t('auth:draftFailed', "Failed to save draft. Please try again."));
    }
  };

  /**
   * Handles extra fields changes (fields not in guide)
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event
   */
  const handleExtraFieldChange = (e) => {
    const { name, value } = e.target;
    setExtraFields((prev) => ({ ...prev, [name]: value }));
  };

  const [apiError, setApiError] = useState("");

  /**
   * Handles form submission — calls real API register step 2.
   * Payload matches RegisterStep2Request DTO with userType = "JobSeeker".
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError("");

    // Build RegisterStep2Request payload
    const step2Payload = {
      userType:         "JobSeeker",
      professionalTitle: formData.professionalTitle,
      experienceYears:   parseInt(formData.experienceYears) || 0,
      bio:               formData.bio,
      cvUrl:             formData.cvUrl || undefined,
      preferredJobType:  formData.preferredJobType,
    };

    try {
      await authService.registerStep2(step2Payload);
      // Clear role from localStorage now that onboarding is complete
      localStorage.removeItem("userRole");
      navigate("/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || t('auth:completeProfileFailed', "Failed to complete profile. Please try again.");
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="onboarding-phase-2">
      <div className="onboarding-phase-2__container">
        <div className="onboarding-phase-2__header">
          <h1 className="onboarding-phase-2__title">
            {t('auth:onboarding.jobseeker.title', "Complete Your Job Seeker Profile")}
          </h1>
          <p className="onboarding-phase-2__subtitle">
            {t('auth:onboarding.jobseeker.subtitle', "Showcase your professional information to attract employers")}
          </p>
        </div>

        {/* API error banner */}
        {apiError && (
          <div className="form-error-message" style={{ margin: '0 0 1rem' }}>
            <i className="fa-solid fa-exclamation-triangle" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Progress Section */}
        <div className="onboarding-phase-2__progress-section">
          <div className="onboarding-phase-2__progress-header">
            <h3>{t('auth:onboarding.jobseeker.formCompletion', "Form Completion")}</h3>
            <span className="onboarding-phase-2__progress-percentage">
              {overallProgress}%
            </span>
          </div>
          <div className="onboarding-phase-2__progress-bar">
            <div
              className="onboarding-phase-2__progress-fill"
              style={{ width: `${overallProgress}%` }}></div>
          </div>
          <p className="onboarding-phase-2__progress-hint">
            {overallProgress === 100
              ? t('auth:onboarding.jobseeker.readyToSubmit', "You're ready to submit your profile!")
              : t('auth:onboarding.jobseeker.completeRequired', "Complete required sections to submit your profile")}
          </p>
        </div>

        <div className="onboarding-phase-2__card">
          <form onSubmit={handleSubmit}>
            {/* Section 1: Professional Information (GUIDE FIELDS) */}
            <div className="onboarding-phase-2__section">
              <div className="onboarding-phase-2__section-header">
                <div className="onboarding-phase-2__section-title-wrapper">
                  <h2 className="onboarding-phase-2__section-title">
                    {t('auth:onboarding.jobseeker.professionalInfo', "Professional Information")}
                  </h2>
                  {completionStatus.professionalInfo && (
                    <span className="onboarding-phase-2__section-badge completed">
                      {t('auth:onboarding.jobseeker.completed', "Completed")}
                    </span>
                  )}
                </div>
                <p className="onboarding-phase-2__section-description">
                  {t('auth:onboarding.jobseeker.profInfoDesc', "Enter your professional details as specified in the registration guide")}
                </p>
              </div>

              <div className="onboarding-phase-2__form-grid">
                {/* Professional Title (GUIDE: ProfessionalTitle) */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-heading"
                    type="text"
                    name="professionalTitle"
                    placeholder={t('auth:onboarding.jobseeker.profTitlePlaceholder', "Professional Title (e.g., Civil Engineer)")}
                    value={formData.professionalTitle}
                    onChange={handleInputChange}
                    hasError={!!formErrors.professionalTitle}
                    errorMessage={formErrors.professionalTitle}
                    required
                  />
                  <p className="onboarding-phase-2__field-hint">
                    {t('auth:onboarding.jobseeker.profTitleHint', "Your main professional title as it appears in the guide")}
                  </p>
                </div>

                {/* Experience Years (GUIDE: ExperienceYears 0-50) */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-calendar-alt"
                    type="number"
                    name="experienceYears"
                    placeholder={t('auth:onboarding.jobseeker.expYearsPlaceholder', "Years of Experience (0-50)")}
                    value={formData.experienceYears}
                    onChange={handleInputChange}
                    min="0"
                    max="50"
                    hasError={!!formErrors.experienceYears}
                    errorMessage={formErrors.experienceYears}
                    required
                  />
                  <p className="onboarding-phase-2__field-hint">
                    {t('auth:onboarding.jobseeker.expYearsHint', "Number of years of professional experience")}
                  </p>
                </div>

                {/* Preferred Job Type (GUIDE: PreferredJobType) */}
                <div className="onboarding-phase-2__form-item">
                  <FormSelect
                    icon="fa-solid fa-briefcase"
                    name="preferredJobType"
                    value={formData.preferredJobType}
                    onChange={handleInputChange}
                    options={[
                      { value: "", label: t('auth:onboarding.jobseeker.preferredJobType', "Select Preferred Job Type") },
                      { value: "FullTime", label: t('auth:onboarding.jobseeker.fullTime', "Full Time") },
                      { value: "PartTime", label: t('auth:onboarding.jobseeker.partTime', "Part Time") },
                      { value: "Contract", label: t('auth:onboarding.jobseeker.contract', "Contract") },
                      { value: "Internship", label: t('auth:onboarding.jobseeker.internship', "Internship") },
                      { value: "Remote", label: t('auth:onboarding.jobseeker.remote', "Remote") },
                      { value: "Hybrid", label: t('auth:onboarding.jobseeker.hybrid', "Hybrid") },
                    ]}
                    hasError={!!formErrors.preferredJobType}
                    errorMessage={formErrors.preferredJobType}
                    required
                  />
                  <p className="onboarding-phase-2__field-hint">
                    {t('auth:onboarding.jobseeker.prefJobHint', "Select your preferred work arrangement")}
                  </p>
                </div>

                {/* Bio (GUIDE: Bio 10-2000 characters) */}
                <div className="onboarding-phase-2__full-width">
                  <div className="onboarding-phase-2__textarea-section">
                    <FormTextarea
                      icon="fa-solid fa-align-left"
                      name="bio"
                      placeholder={t('auth:onboarding.jobseeker.bioPlaceholder', "Professional bio (10-2000 characters). Describe your background, skills, and career objectives.")}
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={6}
                      maxLength={2000}
                      hasError={!!formErrors.bio}
                      errorMessage={formErrors.bio}
                      required
                    />
                    <div className="onboarding-phase-2__character-counter">
                      {formData.bio.length} / 2000 {t('auth:onboarding.jobseeker.characters', "characters")}
                      {formData.bio.length > 0 && formData.bio.length < 10 && (
                        <span className="onboarding-phase-2__character-error">
                          <i className="fa-solid fa-exclamation-triangle" />
                          {t('auth:onboarding.jobseeker.needMoreChars', { count: 10 - formData.bio.length, defaultValue: `Need ${10 - formData.bio.length} more characters` })}
                        </span>
                      )}
                    </div>
                    <p className="onboarding-phase-2__field-hint">
                      {t('auth:onboarding.jobseeker.bioHint', "Your professional introduction (minimum 10 characters)")}
                    </p>
                  </div>
                </div>

                {/* CV URL (GUIDE: CVUrl - optional) */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-link"
                    type="url"
                    name="cvUrl"
                    placeholder={t('auth:onboarding.jobseeker.cvUrlPlaceholder', "CV/Resume URL (Optional)")}
                    value={formData.cvUrl}
                    onChange={handleInputChange}
                    hasError={!!formErrors.cvUrl}
                    errorMessage={formErrors.cvUrl}
                  />
                  <p className="onboarding-phase-2__field-hint">
                    {t('auth:onboarding.jobseeker.cvUrlHint', "Link to your online CV or resume (optional)")}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Additional Information (EXTRA FIELDS - NOT IN GUIDE) */}
            <div className="onboarding-phase-2__section">
              <div className="onboarding-phase-2__section-header">
                <div className="onboarding-phase-2__section-title-wrapper">
                  <h2 className="onboarding-phase-2__section-title">
                    {t('auth:onboarding.jobseeker.additionalInfo', "Additional Information")}
                  </h2>
                  <span className="onboarding-phase-2__section-badge optional">
                    {t('auth:onboarding.jobseeker.optional', "Optional")}
                  </span>
                </div>
                <p className="onboarding-phase-2__section-description">
                  {t('auth:onboarding.jobseeker.addInfoDesc', "Additional fields for enhanced profile (not in registration guide)")}
                </p>
              </div>

              <div className="onboarding-phase-2__form-grid">
                {/* Location (EXTRA - not in guide) */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-location-dot"
                    type="text"
                    name="location"
                    placeholder={t('auth:onboarding.jobseeker.locationPlaceholder', "Current Location (Optional)")}
                    value={extraFields.location}
                    onChange={handleExtraFieldChange}
                  />
                  <p className="onboarding-phase-2__field-hint">
                    {t('auth:onboarding.jobseeker.locationHint', "Your current city and country")}
                  </p>
                </div>

                {/* Skills (EXTRA - not in guide) */}
                <div className="onboarding-phase-2__full-width">
                  <div className="onboarding-phase-2__textarea-section">
                    <FormTextarea
                      icon="fa-solid fa-code"
                      name="skills"
                      placeholder={t('auth:onboarding.jobseeker.skillsPlaceholder', "Key skills and technologies (Optional)")}
                      value={extraFields.skills}
                      onChange={handleExtraFieldChange}
                      rows={3}
                    />
                    <p className="onboarding-phase-2__field-hint">
                      {t('auth:onboarding.jobseeker.skillsHint', "List your skills separated by commas")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Documents */}
            <div className="onboarding-phase-2__section">
              <div className="onboarding-phase-2__section-header">
                <div className="onboarding-phase-2__section-title-wrapper">
                  <h2 className="onboarding-phase-2__section-title">
                    {t('auth:onboarding.jobseeker.documents', "Documents")}
                  </h2>
                  {completionStatus.documents && (
                    <span className="onboarding-phase-2__section-badge completed">
                      {t('auth:onboarding.jobseeker.completed', "Completed")}
                    </span>
                  )}
                </div>
                <p className="onboarding-phase-2__section-description">
                  {t('auth:onboarding.jobseeker.documentsDesc', "Upload your resume and professional photo")}
                </p>
              </div>

              <div className="onboarding-phase-2__form-grid">
                {/* Resume File Upload (EXTRA - guide expects CVUrl) */}
                <div className="onboarding-phase-2__full-width">
                  <div className="file-upload__container">
                    <h3 className="onboarding-phase-2__file-section-title">
                      {t('auth:onboarding.jobseeker.resumeFile', "Resume/CV File")}
                      <span className="onboarding-phase-2__required-asterisk">
                        *
                      </span>
                    </h3>
                    <FileUpload
                      label={t('auth:onboarding.jobseeker.clickToUpload', "Click to upload or drag and drop")}
                      accept=".pdf,.doc,.docx"
                      onChange={setResume}
                      icon="fa-solid fa-file-pdf"
                      supportedFormats={t('auth:onboarding.jobseeker.supportedPdfDoc', "PDF, DOC, DOCX (Max. 10MB)")}
                      fileType="document"
                    />
                    <p className="onboarding-phase-2__field-hint">
                      {t('auth:onboarding.jobseeker.resumeHint', "Upload your resume or CV (required in current form, but guide uses URL)")}
                    </p>
                  </div>
                </div>

                {/* Profile Picture (EXTRA - not in guide for JobSeeker) */}
                <div className="onboarding-phase-2__full-width">
                  <div className="file-upload__container">
                    <h3 className="onboarding-phase-2__file-section-title">
                      {t('auth:onboarding.jobseeker.profilePicture', "Profile Picture")}
                      <span className="onboarding-phase-2__required-asterisk">
                        *
                      </span>
                    </h3>
                    <FileUpload
                      label={t('auth:onboarding.jobseeker.clickToUpload', "Click to upload or drag and drop")}
                      accept="image/*"
                      onChange={setProfilePicture}
                      icon="fa-solid fa-camera"
                      supportedFormats={t('auth:onboarding.jobseeker.supportedImages', "PNG, JPG, SVG (Max. 5MB)")}
                      fileType="image"
                    />
                    <p className="onboarding-phase-2__field-hint">
                      {t('auth:onboarding.jobseeker.profPicHint', "A professional headshot")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="onboarding-phase-2__submit-section">
              <button
                type="button"
                className="onboarding-phase-2__draft-button"
                onClick={handleSaveDraft}>
                <i className="fa-solid fa-save" />
                {t('auth:onboarding.jobseeker.saveDraft', "Save as Draft")}
              </button>
              <button
                type="submit"
                className={`onboarding-phase-2__submit-button ${
                  isLoading ? "onboarding-phase-2__submit-button--loading" : ""
                }`}
                disabled={overallProgress < 80 || isLoading}>
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    {t('auth:onboarding.jobseeker.submitting', "Submitting...")}
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check" />
                    {t('auth:onboarding.jobseeker.completeProfile', "Complete Profile")}
                  </>
                )}
              </button>
            </div>

            {/* Terms Notice */}
            <div className="onboarding-phase-2__terms-notice">
              <p>
                {t('auth:onboarding.jobseeker.termsNotice', "By completing this profile, you agree to our")}{" "}
                <a href="/terms" className="onboarding-phase-2__terms-link">
                  {t('auth:terms', "Terms of Service")}
                </a>{" "}
                {t('auth:and', "and")}{" "}
                <a href="/privacy" className="onboarding-phase-2__terms-link">
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

export default JobSeekerOnboarding;
