/**
 * @file CompanyMemberOnboarding.jsx
 * @description Company member onboarding page with company search and database alignment
 * @author Sherif Talaat
 * @version 1.3.0
 * @date 24-10-2025
 * 
 * @last-modified-by Sherif Talaat
 * @last-modified-date 03-12-2025
 * @fix Updated to match REGISTRATION_FORM_GUIDE.md specifications
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import companyMemberOnboardingService from '../../services/companyMemberOnboardingService';
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import FileUpload from "../../components/forms/FileUpload";
import "../../styles/pages/onboarding.css";
import {
  validateCompanyMemberOnboarding,
  calculateCompanyMemberCompletion,
  validateFile,
  isFormValid,
} from "../../utils/form-validation";
/**
 * CompanyMemberOnboarding Component
 * @description Renders the company member onboarding form aligned with database schema
 * @returns {JSX.Element} The rendered company member onboarding component
 */
function CompanyMemberOnboarding() {
  const navigate = useNavigate();

  // Form state aligned with CompanyMembers table and related tables
  const [formData, setFormData] = useState({
    role: "", // Admin, HR_Manager, Member
    position: "", // Will be stored in Experiences table
    department: "", // Will be stored in Experiences table
  });

  const [companySearch, setCompanySearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formErrors] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await companyMemberOnboardingService.getCompanyMemberOnboardingDraft();
        if (!draft) return;

        setFormData({
          role: draft.role || "",
          position: draft.position || "",
          department: draft.department || "",
        });

        if (draft.companyId) {
          const company = await companyMemberOnboardingService.getCompanyById(draft.companyId);
          handleCompanySelect({
            ...company,
            Id: company.companyId,
            Name: company.companyName,
            Industry: company.industry,
            Location: [company.city, company.country].filter(Boolean).join(', '),
            VerificationStatus: company.isVerified ? 'Verified' : 'Pending',
          });
        }
      } catch (error) {
        setErrorMessage(error.response?.data?.message || "Failed to load saved draft.");
      }
    };

    loadDraft();
  }, []);
  const [completionStatus, setCompletionStatus] = useState({
    companySelection: false,
    roleSelection: false,
    professionalInfo: false,
    profileSetup: false,
  });

  const [overallProgress, setOverallProgress] = useState(0);

  /**
   * Handles company search input changes with debouncing
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleCompanySearch = async (e) => {
    const query = e.target.value;
    setCompanySearch(query);

    if (query.length > 2) {
      setIsSearching(true);
      try {
        const results = await companyMemberOnboardingService.searchCompanies(query);
        setSearchResults(results.map((company) => ({
          ...company,
          Id: company.companyId,
          Name: company.companyName,
          Industry: company.industry,
          Location: [company.city, company.country].filter(Boolean).join(', '),
          VerificationStatus: company.isVerified ? 'Verified' : 'Pending',
        })));
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  /**
   * Handles company selection from search results
   * @param {Object} company - The selected company object from Companies table
   */
  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setCompanySearch(company.Name);
    setSearchResults([]);
  };

  /**
   * Clears the selected company
   */
  const handleClearCompany = () => {
    setSelectedCompany(null);
    setCompanySearch("");
    setSearchResults([]);
  };

  /**
   * Calculate completion status based on database requirements
   */
  useEffect(() => {
    const errors = validateCompanyMemberOnboarding(formData, selectedCompany);

    const profilePictureError = validateFile(profilePicture, {
      fieldName: "Profile picture",
      maxSizeMB: 5,
    });

    const companySelectionComplete = !errors.company && selectedCompany;
    const roleSelectionComplete = !errors.role;
    const professionalInfoComplete = !errors.position && !errors.department;
    const profileSetupComplete = !profilePictureError;

    setCompletionStatus({
      companySelection: companySelectionComplete,
      roleSelection: roleSelectionComplete,
      professionalInfo: professionalInfoComplete,
      profileSetup: profileSetupComplete,
    });

    const progress = calculateCompanyMemberCompletion(
      formData,
      selectedCompany,
      profilePicture
    );
    setOverallProgress(progress);
  }, [formData, selectedCompany, profilePicture]);

  /**
   * Handles input changes for form fields
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>} e - The change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Prepares data for database insertion
   * @returns {Object} Data structured for database tables
   */
  const prepareSubmissionData = (profilePictureUrl = null) => ({
    companyId: selectedCompany.Id,
    role: formData.role,
    position: formData.position,
    department: formData.department,
    profilePictureUrl,
  });

  /**
   * Handles form submission
   * @param {React.FormEvent} e - The form event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateCompanyMemberOnboarding(formData, selectedCompany);
    const profilePictureError = validateFile(profilePicture, {
      fieldName: "Profile picture",
      maxSizeMB: 5,
    });

    const allErrors = {
      ...errors,
      profilePicture: profilePictureError,
    };

    if (!isFormValid(allErrors)) {
      alert("Please complete all required sections before submitting.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const profilePictureUrl = await companyMemberOnboardingService.uploadCompanyMemberProfilePhoto(profilePicture);
      const submissionData = prepareSubmissionData(profilePictureUrl);
      const response = await companyMemberOnboardingService.submitCompanyMemberOnboarding(submissionData);

      setSuccessMessage(response.message || "Company member profile submitted successfully!");
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || "Error submitting profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles save as draft
   */
  const handleSaveDraft = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const profilePictureUrl = profilePicture
        ? await companyMemberOnboardingService.uploadCompanyMemberProfilePhoto(profilePicture)
        : null;

      await companyMemberOnboardingService.saveCompanyMemberOnboardingDraft({
        companyId: selectedCompany?.Id || null,
        role: formData.role || null,
        position: formData.position || null,
        department: formData.department || null,
        profilePictureUrl,
      });

      setSuccessMessage("Draft saved successfully!");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || "Error saving draft. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="onboarding-phase-2">
      <div className="onboarding-phase-2__container">
        <div className="onboarding-phase-2__header">
          <h1 className="onboarding-phase-2__title">
            Join Your Company Network
          </h1>
          <p className="onboarding-phase-2__subtitle">
            Connect with your company and colleagues on our platform
          </p>
        </div>

        {/* Progress Section - Phase 1 style */}
        <div className="register-form__progress-section">
          <div className="register-form__progress-header">
            <h3>Joining Progress</h3>
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
              ? "✅ Ready to join company network!"
              : "Complete all sections to request access"}
          </p>
        </div>

        <div className="onboarding-phase-2__card">
          {errorMessage && (
            <div className="register-form__error-message" role="alert">
              <i className="fa-solid fa-exclamation-triangle" />
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="register-form__success-message" role="status">
              <i className="fa-solid fa-check-circle" />
              {successMessage}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {/* Section 1: Company Selection */}
            <div className="onboarding-phase-2__section">
              <div className="onboarding-phase-2__section-header">
                <div className="onboarding-phase-2__section-title-wrapper">
                  <h2 className="onboarding-phase-2__section-title">
                    Company Selection
                  </h2>
                  {completionStatus.companySelection && (
                    <span className="onboarding-phase-2__section-badge completed">
                      <i className="fa-solid fa-check-circle" />
                      Selected
                    </span>
                  )}
                </div>
                <p className="onboarding-phase-2__section-description">
                  Search and select your company from our verified partners
                </p>
              </div>

              <div className="onboarding-phase-2__form-grid">
                <div className="onboarding-phase-2__full-width">
                  <div className="company-search__container">
                    <div className="company-search__input-wrapper register-form__input-wrapper">
                      <i className="fa-solid fa-building register-form__input-icon"></i>
                      <input
                        type="text"
                        name="companySearch"
                        placeholder="Search for your company by name, industry, or location..."
                        value={companySearch}
                        onChange={handleCompanySearch}
                        className={`register-form__input ${
                          !selectedCompany && companySearch !== ""
                            ? "register-form__input--error"
                            : ""
                        }`}
                        required
                      />
                      {selectedCompany && (
                        <button
                          type="button"
                          onClick={handleClearCompany}
                          className="company-search__clear-button register-form__clear-button"
                          title="Clear selection">
                          <i className="fa-solid fa-times" />
                        </button>
                      )}
                    </div>

                    {!selectedCompany &&
                      companySearch &&
                      companySearch.length < 3 && (
                        <p className="register-form__error-message">
                          <i className="fa-solid fa-exclamation-triangle" />
                          Type at least 3 characters to search
                        </p>
                      )}

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                      <div className="company-search__results register-form__dropdown">
                        <div className="company-search__results-header">
                          <span>Search Results</span>
                          <span className="company-search__results-count">
                            {searchResults.length} company(s) found
                          </span>
                        </div>
                        {searchResults.map((company) => (
                          <div
                            key={company.Id}
                            className="company-search__result-item"
                            onClick={() => handleCompanySelect(company)}>
                            <div className="company-search__result-info">
                              <h4 className="company-search__result-name">
                                {company.Name}
                                {company.VerificationStatus === "Verified" && (
                                  <span className="company-search__verified-badge">
                                    <i className="fa-solid fa-check-circle" />
                                    Verified
                                  </span>
                                )}
                              </h4>
                              <p className="company-search__result-details">
                                <span className="company-search__result-industry">
                                  {company.Industry}
                                </span>
                                <span className="company-search__result-location">
                                  <i className="fa-solid fa-location-dot" />
                                  {company.Location}
                                </span>
                              </p>
                            </div>
                            <div className="company-search__result-action">
                              <i className="fa-solid fa-chevron-right" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {isSearching && (
                      <div className="company-search__loading register-form__loading">
                        <i className="fa-solid fa-spinner fa-spin" />
                        Searching companies...
                      </div>
                    )}

                    {companySearch.length > 2 &&
                      !isSearching &&
                      searchResults.length === 0 && (
                        <div className="company-search__no-results register-form__no-results">
                          <i className="fa-solid fa-building-circle-exclamation" />
                          No companies found matching your search.
                        </div>
                      )}

                    {/* Selected Company Display */}
                    {selectedCompany && (
                      <div className="company-search__selected register-form__selected-item">
                        <div className="company-search__selected-header">
                          <h4>
                            <i className="fa-solid fa-check-circle" />
                            Selected Company
                          </h4>
                        </div>
                        <div className="company-search__selected-info">
                          <h5 className="company-search__selected-name">
                            {selectedCompany.Name}
                            {selectedCompany.VerificationStatus ===
                              "Verified" && (
                              <span className="company-search__verified-badge">
                                <i className="fa-solid fa-shield-check" />
                                Verified Company
                              </span>
                            )}
                          </h5>
                          <div className="company-search__selected-details">
                            <div className="company-search__detail-item">
                              <i className="fa-solid fa-industry" />
                              <span>{selectedCompany.Industry}</span>
                            </div>
                            <div className="company-search__detail-item">
                              <i className="fa-solid fa-location-dot" />
                              <span>{selectedCompany.Location}</span>
                            </div>
                            <div className="company-search__detail-item">
                              <i className="fa-solid fa-badge-check" />
                              <span
                                className={
                                  selectedCompany.VerificationStatus ===
                                  "Verified"
                                    ? "text-success"
                                    : "text-warning"
                                }>
                                {selectedCompany.VerificationStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="onboarding-phase-2__field-hint register-form__hint">
                      <i className="fa-solid fa-info-circle" />
                      Start typing your company name to search. Only verified
                      companies are available for joining.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Role Selection */}
            <div className="onboarding-phase-2__section">
              <div className="onboarding-phase-2__section-header">
                <div className="onboarding-phase-2__section-title-wrapper">
                  <h2 className="onboarding-phase-2__section-title">
                    Company Role
                  </h2>
                  {completionStatus.roleSelection && (
                    <span className="onboarding-phase-2__section-badge completed">
                      <i className="fa-solid fa-check-circle" />
                      Selected
                    </span>
                  )}
                </div>
                <p className="onboarding-phase-2__section-description">
                  Select your role within the company
                </p>
              </div>

              <div className="onboarding-phase-2__form-grid">
                <div className="onboarding-phase-2__form-item">
                  <FormSelect
                    icon="fa-solid fa-user-tie"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    options={[
                      { value: "", label: "Select Your Role" },
                      { value: "Admin", label: "Company Admin" },
                      { value: "HR_Manager", label: "HR Manager" },
                      { value: "Member", label: "Team Member" },
                    ]}
                    hasError={!formData.role && formData.role !== ""}
                    errorMessage="Please select your role"
                    required
                  />
                  {formData.role && (
                    <div className="register-form__role-description">
                      <p className="register-form__hint">
                        <i className="fa-solid fa-info-circle" />
                        {formData.role === "Admin" &&
                          "Full access to company settings and member management"}
                        {formData.role === "HR_Manager" &&
                          "Can post jobs and manage candidates"}
                        {formData.role === "Member" &&
                          "Access to company network and job postings"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Professional Information */}
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
                  Tell us about your position in the company
                </p>
              </div>

              <div className="onboarding-phase-2__form-grid">
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-briefcase"
                    type="text"
                    name="position"
                    placeholder="Your Job Title"
                    value={formData.position}
                    onChange={handleInputChange}
                    hasError={!formData.position && formData.position !== ""}
                    errorMessage="Job title is required"
                    required
                  />
                </div>

                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-sitemap"
                    type="text"
                    name="department"
                    placeholder="Department"
                    value={formData.department}
                    onChange={handleInputChange}
                    hasError={
                      !formData.department && formData.department !== ""
                    }
                    errorMessage="Department is required"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Profile Setup */}
            <div className="onboarding-phase-2__section">
              <div className="onboarding-phase-2__section-header">
                <div className="onboarding-phase-2__section-title-wrapper">
                  <h2 className="onboarding-phase-2__section-title">
                    Profile Setup
                  </h2>
                  {completionStatus.profileSetup && (
                    <span className="onboarding-phase-2__section-badge completed">
                      <i className="fa-solid fa-check-circle" />
                      Completed
                    </span>
                  )}
                </div>
                <p className="onboarding-phase-2__section-description">
                  Upload your professional photo for identification
                </p>
              </div>

              <div className="onboarding-phase-2__form-grid">
                <div className="onboarding-phase-2__full-width">
                  <div className="file-upload__container">
                    <h3 className="onboarding-phase-2__file-section-title">
                      <i className="fa-solid fa-camera" />
                      Professional Photo
                      <span className="onboarding-phase-2__required-asterisk">
                        *
                      </span>
                    </h3>
                    <FileUpload
                      label="Click to upload or drag and drop"
                      accept="image/*"
                      onChange={(file) => {
                        if (file && file.size > 5 * 1024 * 1024) {
                          alert("Photo size must be less than 5MB");
                          return;
                        }
                        setProfilePicture(file);
                      }}
                      icon="fa-solid fa-camera"
                      supportedFormats="PNG, JPG, SVG (Max. 5MB)"
                      fileType="image"
                      hasError={!profilePicture}
                      errorMessage="Profile photo is required"
                    />
                    {profilePicture && (
                      <div className="register-form__file-preview">
                        <div className="register-form__avatar-preview">
                          <img
                            src={URL.createObjectURL(profilePicture)}
                            alt="Profile preview"
                            className="register-form__avatar-image"
                          />
                          <div className="register-form__avatar-actions">
                            <button
                              type="button"
                              onClick={() => setProfilePicture(null)}
                              className="register-form__remove-avatar">
                              <i className="fa-solid fa-trash" />
                              Change Photo
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Steps */}
            <div className="register-form__verification-steps">
              <h4 className="register-form__verification-title">
                <i className="fa-solid fa-shield-alt" />
                Verification Process
              </h4>
              <div className="register-form__steps">
                <div className="register-form__step">
                  <div className="register-form__step-icon completed">
                    <i className="fa-solid fa-user-check" />
                  </div>
                  <div className="register-form__step-content">
                    <h5>Submit Request</h5>
                    <p>Your request will be sent to company administrators</p>
                  </div>
                </div>
                <div className="register-form__step">
                  <div className="register-form__step-icon">
                    <i className="fa-solid fa-clock" />
                  </div>
                  <div className="register-form__step-content">
                    <h5>Admin Review</h5>
                    <p>Company admin will verify your employment</p>
                  </div>
                </div>
                <div className="register-form__step">
                  <div className="register-form__step-icon">
                    <i className="fa-solid fa-envelope" />
                  </div>
                  <div className="register-form__step-content">
                    <h5>Confirmation</h5>
                    <p>You'll receive email confirmation once approved</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="register-form__submit-section">
              <button
                type="button"
                className="register-form__draft-button"
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
                      ? "Join Company Network"
                      : `Complete Profile (${overallProgress}%)`}
                  </>
                )}
              </button>
            </div>

            {/* Terms Notice */}
            <div className="register-form__terms-notice">
              <p>
                By requesting access, you agree to our{" "}
                <a href="/terms" className="register-form__terms-link">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="register-form__terms-link">
                  Privacy Policy
                </a>
                . Your company administrator will verify your membership.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CompanyMemberOnboarding;
