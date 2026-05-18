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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(['auth', 'validation']);
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
  const [profilePicture, setProfilePicture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    role: "",
    position: "",
    department: "",
  });

  // Completion status aligned with database requirements
  const [completionStatus, setCompletionStatus] = useState({
    companySelection: false,
    roleSelection: false,
    professionalInfo: false,
    profileSetup: false,
  });

  const [overallProgress, setOverallProgress] = useState(0);

  // Mock company data - will be replaced with actual API call to Companies table
  const mockCompanies = [
    {
      Id: 1,
      Uuid: "123e4567-e89b-12d3-a456-426614174000",
      Name: "TechCorp Inc.",
      Industry: "Technology",
      Location: "San Francisco, CA",
      VerificationStatus: "Verified",
    },
    {
      Id: 2,
      Uuid: "123e4567-e89b-12d3-a456-426614174001",
      Name: "HealthPlus Medical",
      Industry: "Healthcare",
      Location: "New York, NY",
      VerificationStatus: "Verified",
    },
    {
      Id: 3,
      Uuid: "123e4567-e89b-12d3-a456-426614174002",
      Name: "FinanceGlobal",
      Industry: "Finance",
      Location: "Chicago, IL",
      VerificationStatus: "Pending",
    },
  ];

  /**
   * Handles company search input changes with debouncing
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleCompanySearch = (e) => {
    const query = e.target.value;
    setCompanySearch(query);

    if (query.length > 2) {
      setIsSearching(true);
      // Simulate API call to Companies table
      setTimeout(() => {
        const results = mockCompanies.filter(
          (company) =>
            company.Name.toLowerCase().includes(query.toLowerCase()) ||
            company.Industry.toLowerCase().includes(query.toLowerCase()) ||
            company.Location.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(results);
        setIsSearching(false);
      }, 300);
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
    setFormErrors(errors);

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
  const prepareSubmissionData = () => {
    // Data for CompanyMembers table
    const companyMemberData = {
      UserId: null, // Will be set from current user session
      CompanyId: selectedCompany.Id,
      Role: formData.role,
      IsVerifiedMember: false, // Default until verified
      VerificationSource: "Manual", // Options: Manual, CompanyInvite, GovernmentAPI
      AddedAt: new Date().toISOString(),
    };

    // Data for Experiences table (current position)
    const experienceData = {
      UserId: null, // Will be set from current user session
      JobTitle: formData.position,
      CompanyName: selectedCompany.Name,
      Description: `Working as ${formData.position} in ${formData.department} department`,
      StartDate: new Date().toISOString().split("T")[0], // Current date
      EndDate: null, // Current position
    };

    // Data for Users table (profile picture update)
    const userUpdateData = {
      ProfilePictureUrl: null, // Will be set after file upload to CDN
    };

    return {
      companyMember: companyMemberData,
      experience: experienceData,
      user: userUpdateData,
      profilePicture: profilePicture,
    };
  };

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
      alert(t('auth:onboarding.companyMember.completeAllSections', "Please complete all required sections before submitting."));
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const submissionData = prepareSubmissionData();
      console.log("Submitting company member data:", submissionData);

      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert(t('auth:profileSubmitted', "Company member profile submitted successfully!"));
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting company member data:", error);
      alert(t('auth:completeProfileFailed', "Error submitting profile. Please try again."));
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
      const draftData = prepareSubmissionData();
      console.log("Saving draft to database:", draftData);
      // Simulate API call
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
            {t('auth:onboarding.companyMember.title', "Join Your Company Network")}
          </h1>
          <p className="onboarding-phase-2__subtitle">
            {t('auth:onboarding.companyMember.subtitle', "Connect with your company and colleagues on our platform")}
          </p>
        </div>

        {/* Progress Section - Phase 1 style */}
        <div className="register-form__progress-section">
          <div className="register-form__progress-header">
            <h3>{t('auth:onboarding.companyMember.joiningProgress', "Joining Progress")}</h3>
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
              ? t('auth:onboarding.companyMember.readyToJoin', "✅ Ready to join company network!")
              : t('auth:onboarding.companyMember.completeToRequest', "Complete all sections to request access")}
          </p>
        </div>

        <div className="onboarding-phase-2__card">
          <form onSubmit={handleSubmit}>
            {/* Section 1: Company Selection */}
            <div className="onboarding-phase-2__section">
              <div className="onboarding-phase-2__section-header">
                <div className="onboarding-phase-2__section-title-wrapper">
                  <h2 className="onboarding-phase-2__section-title">
                    {t('auth:onboarding.companyMember.companySelection', "Company Selection")}
                  </h2>
                  {completionStatus.companySelection && (
                    <span className="onboarding-phase-2__section-badge completed">
                      <i className="fa-solid fa-check-circle" />
                      {t('auth:onboarding.jobseeker.selected', "Selected")}
                    </span>
                  )}
                </div>
                <p className="onboarding-phase-2__section-description">
                  {t('auth:onboarding.companyMember.companySelectionDesc', "Search and select your company from our verified partners")}
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
                        placeholder={t('auth:onboarding.companyMember.searchCompanyPlaceholder', "Search for your company by name, industry, or location...")}
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
                          title={t('auth:onboarding.companyMember.clearSelection', "Clear selection")}>
                          <i className="fa-solid fa-times" />
                        </button>
                      )}
                    </div>

                    {!selectedCompany &&
                      companySearch &&
                      companySearch.length < 3 && (
                        <p className="register-form__error-message">
                          <i className="fa-solid fa-exclamation-triangle" />
                          {t('auth:onboarding.companyMember.typeAtLeast3Chars', "Type at least 3 characters to search")}
                        </p>
                      )}

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                      <div className="company-search__results register-form__dropdown">
                        <div className="company-search__results-header">
                          <span>{t('auth:onboarding.companyMember.searchResults', "Search Results")}</span>
                          <span className="company-search__results-count">
                            {t('auth:onboarding.companyMember.companiesFound', { count: searchResults.length, defaultValue: `${searchResults.length} company(s) found` })}
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
                                    {t('auth:onboarding.companyMember.verified', "Verified")}
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
                        {t('auth:onboarding.companyMember.searchingCompanies', "Searching companies...")}
                      </div>
                    )}

                    {companySearch.length > 2 &&
                      !isSearching &&
                      searchResults.length === 0 && (
                        <div className="company-search__no-results register-form__no-results">
                          <i className="fa-solid fa-building-circle-exclamation" />
                          {t('auth:onboarding.companyMember.noCompaniesFound', "No companies found matching your search.")}
                        </div>
                      )}

                    {/* Selected Company Display */}
                    {selectedCompany && (
                      <div className="company-search__selected register-form__selected-item">
                        <div className="company-search__selected-header">
                          <h4>
                            <i className="fa-solid fa-check-circle" />
                            {t('auth:onboarding.companyMember.selectedCompany', "Selected Company")}
                          </h4>
                        </div>
                        <div className="company-search__selected-info">
                          <h5 className="company-search__selected-name">
                            {selectedCompany.Name}
                            {selectedCompany.VerificationStatus ===
                              "Verified" && (
                              <span className="company-search__verified-badge">
                                <i className="fa-solid fa-shield-check" />
                                {t('auth:onboarding.companyMember.verifiedCompany', "Verified Company")}
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
                      {t('auth:onboarding.companyMember.startTypingHint', "Start typing your company name to search. Only verified companies are available for joining.")}
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
                    {t('auth:onboarding.companyMember.companyRole', "Company Role")}
                  </h2>
                  {completionStatus.roleSelection && (
                    <span className="onboarding-phase-2__section-badge completed">
                      <i className="fa-solid fa-check-circle" />
                      {t('auth:onboarding.jobseeker.selected', "Selected")}
                    </span>
                  )}
                </div>
                <p className="onboarding-phase-2__section-description">
                  {t('auth:onboarding.companyMember.companyRoleDesc', "Select your role within the company")}
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
                      { value: "", label: t('auth:onboarding.companyMember.selectRolePlaceholder', "Select Your Role") },
                      { value: "Admin", label: t('auth:onboarding.companyMember.roleAdmin', "Company Admin") },
                      { value: "HR_Manager", label: t('auth:onboarding.companyMember.roleHr', "HR Manager") },
                      { value: "Member", label: t('auth:onboarding.companyMember.roleMember', "Team Member") },
                    ]}
                    hasError={!formData.role && formData.role !== ""}
                    errorMessage={t('auth:onboarding.companyMember.roleRequired', "Please select your role")}
                    required
                  />
                  {formData.role && (
                    <div className="register-form__role-description">
                      <p className="register-form__hint">
                        <i className="fa-solid fa-info-circle" />
                        {formData.role === "Admin" &&
                          t('auth:onboarding.companyMember.roleDescAdmin', "Full access to company settings and member management")}
                        {formData.role === "HR_Manager" &&
                          t('auth:onboarding.companyMember.roleDescHr', "Can post jobs and manage candidates")}
                        {formData.role === "Member" &&
                          t('auth:onboarding.companyMember.roleDescMember', "Access to company network and job postings")}
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
                    {t('auth:onboarding.companyMember.profInfo', "Professional Information")}
                  </h2>
                  {completionStatus.professionalInfo && (
                    <span className="onboarding-phase-2__section-badge completed">
                      <i className="fa-solid fa-check-circle" />
                      {t('auth:onboarding.company.completed', "Completed")}
                    </span>
                  )}
                </div>
                <p className="onboarding-phase-2__section-description">
                  {t('auth:onboarding.companyMember.profInfoDesc', "Tell us about your position in the company")}
                </p>
              </div>

              <div className="onboarding-phase-2__form-grid">
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-briefcase"
                    type="text"
                    name="position"
                    placeholder={t('auth:onboarding.companyMember.jobTitlePlaceholder', "Your Job Title")}
                    value={formData.position}
                    onChange={handleInputChange}
                    hasError={!formData.position && formData.position !== ""}
                    errorMessage={t('auth:onboarding.companyMember.jobTitleRequired', "Job title is required")}
                    required
                  />
                </div>

                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-sitemap"
                    type="text"
                    name="department"
                    placeholder={t('auth:onboarding.companyMember.departmentPlaceholder', "Department")}
                    value={formData.department}
                    onChange={handleInputChange}
                    hasError={
                      !formData.department && formData.department !== ""
                    }
                    errorMessage={t('auth:onboarding.companyMember.departmentRequired', "Department is required")}
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
                    {t('auth:onboarding.companyMember.profileSetup', "Profile Setup")}
                  </h2>
                  {completionStatus.profileSetup && (
                    <span className="onboarding-phase-2__section-badge completed">
                      <i className="fa-solid fa-check-circle" />
                      {t('auth:onboarding.company.completed', "Completed")}
                    </span>
                  )}
                </div>
                <p className="onboarding-phase-2__section-description">
                  {t('auth:onboarding.companyMember.profileSetupDesc', "Upload your professional photo for identification")}
                </p>
              </div>

              <div className="onboarding-phase-2__form-grid">
                <div className="onboarding-phase-2__full-width">
                  <div className="file-upload__container">
                    <h3 className="onboarding-phase-2__file-section-title">
                      <i className="fa-solid fa-camera" />
                      {t('auth:onboarding.companyMember.profPhotoTitle', "Professional Photo")}
                      <span className="onboarding-phase-2__required-asterisk">
                        *
                      </span>
                    </h3>
                    <FileUpload
                      label={t('auth:onboarding.jobseeker.clickToUpload', "Click to upload or drag and drop")}
                      accept="image/*"
                      onChange={(file) => {
                        if (file && file.size > 5 * 1024 * 1024) {
                          alert(t('auth:onboarding.companyMember.photoSizeError', "Photo size must be less than 5MB"));
                          return;
                        }
                        setProfilePicture(file);
                      }}
                      icon="fa-solid fa-camera"
                      supportedFormats="PNG, JPG, SVG (Max. 5MB)"
                      fileType="image"
                      hasError={!profilePicture}
                      errorMessage={t('auth:onboarding.companyMember.profPhotoRequired', "Profile photo is required")}
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
                              {t('auth:onboarding.companyMember.changePhoto', "Change Photo")}
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
                {t('auth:onboarding.companyMember.verificationProcessTitle', "Verification Process")}
              </h4>
              <div className="register-form__steps">
                <div className="register-form__step">
                  <div className="register-form__step-icon completed">
                    <i className="fa-solid fa-user-check" />
                  </div>
                  <div className="register-form__step-content">
                    <h5>{t('auth:onboarding.companyMember.submitRequest', "Submit Request")}</h5>
                    <p>{t('auth:onboarding.companyMember.submitRequestDesc', "Your request will be sent to company administrators")}</p>
                  </div>
                </div>
                <div className="register-form__step">
                  <div className="register-form__step-icon">
                    <i className="fa-solid fa-clock" />
                  </div>
                  <div className="register-form__step-content">
                    <h5>{t('auth:onboarding.companyMember.adminReview', "Admin Review")}</h5>
                    <p>{t('auth:onboarding.companyMember.adminReviewDesc', "Company admin will verify your employment")}</p>
                  </div>
                </div>
                <div className="register-form__step">
                  <div className="register-form__step-icon">
                    <i className="fa-solid fa-envelope" />
                  </div>
                  <div className="register-form__step-content">
                    <h5>{t('auth:onboarding.companyMember.confirmation', "Confirmation")}</h5>
                    <p>{t('auth:onboarding.companyMember.confirmationDesc', "You'll receive email confirmation once approved")}</p>
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
                      ? t('auth:onboarding.companyMember.joinCompanyNetwork', "Join Company Network")
                      : t('auth:onboarding.companyMember.joinProgressText', { progress: overallProgress, defaultValue: `Complete Profile (${overallProgress}%)` })}
                  </>
                )}
              </button>
            </div>

            {/* Terms Notice */}
            <div className="register-form__terms-notice">
              <p>
                {t('auth:onboarding.companyMember.termsNoticeText', "By requesting access, you agree to our")}{" "}
                <a href="/terms" className="register-form__terms-link">
                  {t('auth:terms', "Terms of Service")}
                </a>{" "}
                {t('auth:and', "and")}{" "}
                <a href="/privacy" className="register-form__terms-link">
                  {t('auth:privacy', "Privacy Policy")}
                </a>
                {t('auth:onboarding.companyMember.termsNoticeTextEnd', ". Your company administrator will verify your membership.")}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CompanyMemberOnboarding;
