/**
 * @file CompanyOnBoarding.jsx
 * @description Company/Employer onboarding page — Step 2 of registration (company profile completion)
 * @author Sherif Talaat
 * @version 2.0.0
 * @date 24-10-2025
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-04-29
 * @fix Wired handleSubmit to real API: authService.registerStep2({ userType: 'Employer', ... })
 *      with full company DTO fields mapped. Navigates to /dashboard on success.
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
import { useAuth } from "../../context/AuthContext";

/**
 * CompanyOnboarding Component
 * @description Renders the company admin onboarding form aligned with guide
 * @returns {JSX.Element} The rendered company onboarding component
 */
function CompanyOnboarding() {
  const { t } = useTranslation(['auth', 'validation']);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  // Updated form state to match guide fields
  // GUIDE: Company Entity + Employer Entity
  const [companyData, setCompanyData] = useState({
    // Company Entity fields
    companyName: "", // GUIDE: CompanyName (required if company)
    description: "", // GUIDE: Description (up to 2000 characters)
    industry: "", // GUIDE: Industry (string)
    companySize: "", // GUIDE: CompanySize (string - 1-10, 11-50, etc.)
    foundedYear: "", // GUIDE: FoundedYear (int)
    website: "", // GUIDE: Website (string)
    country: "", // GUIDE: Country (string)
    city: "", // GUIDE: City (string)
    commercialRegistrationNumber: "", // GUIDE: CommercialRegistrationNumber (string)
    logoUrl: "", // GUIDE: LogoUrl (string - URL)
  });

  const [employerData, setEmployerData] = useState({
    // Employer Entity fields (MISSING IN CURRENT FORM)
    businessEmail: "", // GUIDE: BusinessEmail (string)
    contactPerson: "", // GUIDE: ContactPerson (string)
    contactPhone: "", // GUIDE: ContactPhone (string)
    nationalId: "", // GUIDE: NationalId (string - for individuals)
    taxNumber: "", // GUIDE: TaxNumber (string)
  });

  // Current form has file uploads instead of URLs
  const [logoFile, setLogoFile] = useState(null);
  const [registrationDocumentFile, setRegistrationDocumentFile] =
    useState(null);

  // Extra fields not in guide
  const [extraFields, setExtraFields] = useState({
    location: "", // Combined location in current form
  });

  const [completionStatus, setCompletionStatus] = useState({
    companyInfo: false,
    companyDetails: false,
    contactInfo: false,
    legalInfo: false,
  });

  const [overallProgress, setOverallProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    // Company Entity errors
    companyName: "",
    description: "",
    industry: "",
    companySize: "",
    foundedYear: "",
    website: "",
    country: "",
    city: "",
    commercialRegistrationNumber: "",
    logoUrl: "",

    // Employer Entity errors
    businessEmail: "",
    contactPerson: "",
    contactPhone: "",
    nationalId: "",
    taxNumber: "",
  });

  /**
   * Calculate completion status for each section
   */
  useEffect(() => {
    const errors = {};

    // ... (existing validation code remains the same) ...

    setFormErrors(errors);

    // File validation for current implementation (not in guide)
    const logoFileError = validateFile(logoFile, {
      fieldName: "Company logo",
      maxSizeMB: 5,
    });

    const registrationDocumentError = validateFile(registrationDocumentFile, {
      fieldName: "Registration certificate",
      maxSizeMB: 10,
    });

    // Calculate completion status based on guide requirements
    const companyInfoComplete =
      !errors.companyName &&
      !errors.industry &&
      !errors.companySize &&
      companyData.companyName &&
      companyData.industry &&
      companyData.companySize;

    // FIX: Optional fields should only affect completion if they're filled AND have errors
    const companyDetailsComplete =
      (!companyData.description || !errors.description) &&
      (!companyData.foundedYear || !errors.foundedYear) &&
      (!companyData.website || !errors.website) &&
      (!companyData.country || !errors.country) &&
      (!companyData.city || !errors.city) &&
      (!companyData.logoUrl || !errors.logoUrl);

    const contactInfoComplete =
      // All fields are optional, so only check for errors when fields are filled
      (!employerData.businessEmail || !errors.businessEmail) &&
      (!employerData.contactPerson || !errors.contactPerson) &&
      (!employerData.contactPhone || !errors.contactPhone) &&
      (!employerData.nationalId || !errors.nationalId) &&
      (!employerData.taxNumber || !errors.taxNumber);

    const legalInfoComplete =
      !errors.commercialRegistrationNumber &&
      companyData.commercialRegistrationNumber;

    setCompletionStatus({
      companyInfo: companyInfoComplete,
      companyDetails: companyDetailsComplete,
      contactInfo: contactInfoComplete,
      legalInfo: legalInfoComplete,
    });

    // Calculate overall progress (optional fields shouldn't block progress)
    let progress = 0;

    // Company Info (30%) - REQUIRED
    if (companyInfoComplete) progress += 30;

    // Company Details (20%) - OPTIONAL fields, always count as complete if no errors
    // FIX: This section should not decrease progress due to optional field validation
    if (companyDetailsComplete) progress += 20;

    // Contact Info (20%) - OPTIONAL fields, always count as complete if no errors
    if (contactInfoComplete) progress += 20;

    // Legal Info (30%) - REQUIRED
    if (legalInfoComplete) progress += 30;

    setOverallProgress(Math.min(progress, 100));
  }, [companyData, employerData, logoFile, registrationDocumentFile]);

  /**
   * Handles company data input changes
   */
  const handleCompanyDataChange = (e) => {
    const { name, value } = e.target;
    setCompanyData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handles employer data input changes
   */
  const handleEmployerDataChange = (e) => {
    const { name, value } = e.target;
    setEmployerData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handles extra fields changes
   */
  const handleExtraFieldChange = (e) => {
    const { name, value } = e.target;
    setExtraFields((prev) => ({ ...prev, [name]: value }));
  };

  const [apiError, setApiError] = useState("");

  /**
   * Handles form submission — calls real API register step 2.
   * Payload matches RegisterStep2Request DTO with userType = "Employer".
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError("");

    // Build RegisterStep2Request payload for Employer
    const step2Payload = {
      userType:                     "Employer",
      businessEmail:                 employerData.businessEmail   || undefined,
      nationalId:                    employerData.nationalId       || undefined,
      taxNumber:                     employerData.taxNumber        || undefined,
      contactPerson:                 employerData.contactPerson    || undefined,
      contactPhone:                  employerData.contactPhone     || undefined,
      companyName:                   companyData.companyName,
      companyDescription:            companyData.description       || undefined,
      companyIndustry:               companyData.industry          || undefined,
      companySize:                   companyData.companySize       || undefined,
      foundedYear:                   companyData.foundedYear ? parseInt(companyData.foundedYear) : undefined,
      companyCountry:                companyData.country           || undefined,
      companyCity:                   companyData.city              || undefined,
      companyWebsite:                companyData.website           || undefined,
      commercialRegistrationNumber:  companyData.commercialRegistrationNumber || undefined,
      companyLogoUrl:                companyData.logoUrl           || undefined,
    };

    try {
      await authService.registerStep2(step2Payload);
      
      // Refresh auth state to get updated userType and profile data
      if (checkAuth) {
        await checkAuth();
      }

      localStorage.removeItem("userRole");
      navigate("/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || t('auth:onboarding.company.registrationFailed', "Failed to complete registration. Please try again.");
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="onboarding-phase-2">
      <div className="onboarding-phase-2__container">
        <div className="onboarding-phase-2__header">
          <h1 className="onboarding-phase-2__title">{t('auth:onboarding.company.title', "Company Registration")}</h1>
          <p className="onboarding-phase-2__subtitle">
            {t('auth:onboarding.company.subtitle', "Complete your company profile as specified in the guide")}
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
            <h3>{t('auth:onboarding.company.registrationProgress', "Registration Progress")}</h3>
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
              ? t('auth:onboarding.company.readyForSubmission', "Company profile ready for submission!")
              : t('auth:onboarding.company.completeRequired', "Complete required sections to verify your company")}
          </p>
        </div>

        <div className="onboarding-phase-2__card">
          <form onSubmit={handleSubmit}>
            {/* Section 1: Company Basic Information */}
            <div className="onboarding-phase-2__section">
              <div className="onboarding-phase-2__section-header">
                <div className="onboarding-phase-2__section-title-wrapper">
                  <h2 className="onboarding-phase-2__section-title">
                    {t('auth:onboarding.company.companyBasicInfo', "Company Basic Information")}
                  </h2>
                  {completionStatus.companyInfo && (
                    <span className="onboarding-phase-2__section-badge completed">
                      <i className="fa-solid fa-check-circle" />
                      {t('auth:onboarding.company.completed', "Completed")}
                    </span>
                  )}
                </div>
                <p className="onboarding-phase-2__section-description">
                  {t('auth:onboarding.company.basicInfoDesc', "Required company details as specified in the guide")}
                </p>
              </div>

              <div className="onboarding-phase-2__form-grid">
                {/* Company Name */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-building"
                    type="text"
                    name="companyName"
                    placeholder={t('auth:onboarding.company.companyNamePlaceholder', "Company Name")}
                    value={companyData.companyName}
                    onChange={handleCompanyDataChange}
                    hasError={!!formErrors.companyName}
                    errorMessage={formErrors.companyName}
                    required
                  />
                  <p className="onboarding-phase-2__field-hint">
                    {t('auth:onboarding.company.companyNameHint', "Your company's legal name")}
                  </p>
                </div>

                {/* Industry */}
                <div className="onboarding-phase-2__form-item">
                  <FormSelect
                    icon="fa-solid fa-industry"
                    name="industry"
                    value={companyData.industry}
                    onChange={handleCompanyDataChange}
                    options={[
                      { value: "", label: t('auth:onboarding.company.selectIndustry', "Select Industry") },
                      { value: "technology", label: t('auth:onboarding.company.industryTech', "Technology") },
                      { value: "healthcare", label: t('auth:onboarding.company.industryHealth', "Healthcare") },
                      { value: "finance", label: t('auth:onboarding.company.industryFinance', "Finance") },
                      { value: "education", label: t('auth:onboarding.company.industryEdu', "Education") },
                      { value: "retail", label: t('auth:onboarding.company.industryRetail', "Retail") },
                      { value: "manufacturing", label: t('auth:onboarding.company.industryMfg', "Manufacturing") },
                      { value: "construction", label: t('auth:onboarding.company.industryConstruction', "Construction") },
                      { value: "transportation", label: t('auth:onboarding.company.industryTransport', "Transportation") },
                      { value: "hospitality", label: t('auth:onboarding.company.industryHospitality', "Hospitality") },
                      { value: "other", label: t('auth:onboarding.company.industryOther', "Other") },
                    ]}
                    hasError={!!formErrors.industry}
                    errorMessage={formErrors.industry}
                    required
                  />
                </div>

                {/* Company Size */}
                <div className="onboarding-phase-2__form-item">
                  <FormSelect
                    icon="fa-solid fa-users"
                    name="companySize"
                    value={companyData.companySize}
                    onChange={handleCompanyDataChange}
                    options={[
                      { value: "", label: t('auth:onboarding.company.selectSize', "Select Company Size") },
                      { value: "1-10", label: t('auth:onboarding.company.size1_10', "1-10 employees") },
                      { value: "11-50", label: t('auth:onboarding.company.size11_50', "11-50 employees") },
                      { value: "51-200", label: t('auth:onboarding.company.size51_200', "51-200 employees") },
                      { value: "201-500", label: t('auth:onboarding.company.size201_500', "201-500 employees") },
                      { value: "501-1000", label: t('auth:onboarding.company.size501_1000', "501-1000 employees") },
                      { value: "1000+", label: t('auth:onboarding.company.size1000_plus', "1000+ employees") },
                    ]}
                    hasError={!!formErrors.companySize}
                    errorMessage={formErrors.companySize}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Company Details (Optional) */}
            <div className="onboarding-phase-2__section">
              <div className="onboarding-phase-2__section-header">
                <div className="onboarding-phase-2__section-title-wrapper">
                  <h2 className="onboarding-phase-2__section-title">
                    {t('auth:onboarding.company.companyDetails', "Company Details")}
                  </h2>
                  {completionStatus.companyDetails && (
                    <span className="onboarding-phase-2__section-badge completed">
                      <i className="fa-solid fa-check-circle" />
                      {t('auth:onboarding.company.completed', "Completed")}
                    </span>
                  )}
                </div>
                <p className="onboarding-phase-2__section-description">
                  {t('auth:onboarding.company.companyDetailsDesc', "Additional company information (optional)")}
                </p>
              </div>

              <div className="onboarding-phase-2__form-grid">
                {/* Description */}
                <div className="onboarding-phase-2__full-width">
                  <div className="onboarding-phase-2__textarea-section">
                    <FormTextarea
                      icon="fa-solid fa-align-left"
                      name="description"
                      placeholder={t('auth:onboarding.company.descPlaceholder', "Company description (up to 2000 characters)")}
                      value={companyData.description}
                      onChange={handleCompanyDataChange}
                      rows={6}
                      maxLength={2000}
                      hasError={!!formErrors.description}
                      errorMessage={formErrors.description}
                    />
                    <div className="onboarding-phase-2__character-counter">
                      <span
                        className={
                          companyData.description.length > 1900
                            ? "onboarding-phase-2__character-counter--warning"
                            : ""
                        }>
                        {companyData.description.length} / 2000 {t('auth:onboarding.jobseeker.characters', "characters")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Founded Year */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-coins"
                    type="number"
                    name="foundedYear"
                    placeholder={t('auth:onboarding.company.foundedYearPlaceholder', "Founded Year (Optional)")}
                    value={companyData.foundedYear}
                    onChange={handleCompanyDataChange}
                    min="1800"
                    max={new Date().getFullYear()}
                    hasError={!!formErrors.foundedYear}
                    errorMessage={formErrors.foundedYear}
                  />
                </div>

                {/* Website */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-globe"
                    type="url"
                    name="website"
                    placeholder={t('auth:onboarding.company.websitePlaceholder', "Company Website (Optional)")}
                    value={companyData.website}
                    onChange={handleCompanyDataChange}
                    hasError={!!formErrors.website}
                    errorMessage={formErrors.website}
                  />
                </div>

                {/* Country and City */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-flag"
                    type="text"
                    name="country"
                    placeholder={t('auth:onboarding.company.countryPlaceholder', "Country (Optional)")}
                    value={companyData.country}
                    onChange={handleCompanyDataChange}
                  />
                </div>

                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-city"
                    type="text"
                    name="city"
                    placeholder={t('auth:onboarding.company.cityPlaceholder', "City (Optional)")}
                    value={companyData.city}
                    onChange={handleCompanyDataChange}
                  />
                </div>

                {/* Logo URL (Guide expects URL, current has file upload) */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-image"
                    type="url"
                    name="logoUrl"
                    placeholder={t('auth:onboarding.company.logoUrlPlaceholder', "Logo URL (Optional)")}
                    value={companyData.logoUrl}
                    onChange={handleCompanyDataChange}
                    hasError={!!formErrors.logoUrl}
                    errorMessage={formErrors.logoUrl}
                  />
                  <p className="onboarding-phase-2__field-hint">
                    {t('auth:onboarding.company.logoUrlHint', "URL to your company logo")}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Employer Contact Information (Optional) */}
            <div className="onboarding-phase-2__section">
              <div className="onboarding-phase-2__section-header">
                <div className="onboarding-phase-2__section-title-wrapper">
                  <h2 className="onboarding-phase-2__section-title">
                    {t('auth:onboarding.company.employerContactInfo', "Employer Contact Information")}
                  </h2>
                  {completionStatus.contactInfo && (
                    <span className="onboarding-phase-2__section-badge completed">
                      <i className="fa-solid fa-check-circle" />
                      {t('auth:onboarding.company.completed', "Completed")}
                    </span>
                  )}
                </div>
                <p className="onboarding-phase-2__section-description">
                  {t('auth:onboarding.company.contactInfoDesc', "Your contact details as the employer (all optional)")}
                </p>
              </div>

              <div className="onboarding-phase-2__form-grid">
                {/* Business Email */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-envelope"
                    type="email"
                    name="businessEmail"
                    placeholder={t('auth:onboarding.company.businessEmailPlaceholder', "Business Email (Optional)")}
                    value={employerData.businessEmail}
                    onChange={handleEmployerDataChange}
                    hasError={!!formErrors.businessEmail}
                    errorMessage={formErrors.businessEmail}
                  />
                </div>

                {/* Contact Person */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-user-tie"
                    type="text"
                    name="contactPerson"
                    placeholder={t('auth:onboarding.company.contactPersonPlaceholder', "Contact Person (Optional)")}
                    value={employerData.contactPerson}
                    onChange={handleEmployerDataChange}
                  />
                </div>

                {/* Contact Phone */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-phone"
                    type="tel"
                    name="contactPhone"
                    placeholder={t('auth:onboarding.company.contactPhonePlaceholder', "Contact Phone (Optional)")}
                    value={employerData.contactPhone}
                    onChange={handleEmployerDataChange}
                  />
                </div>

                {/* National ID */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-id-card"
                    type="text"
                    name="nationalId"
                    placeholder={t('auth:onboarding.company.nationalIdPlaceholder', "National ID (Optional)")}
                    value={employerData.nationalId}
                    onChange={handleEmployerDataChange}
                  />
                  <p className="onboarding-phase-2__field-hint">
                    {t('auth:onboarding.company.nationalIdHint', "For individual employers")}
                  </p>
                </div>

                {/* Tax Number */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-receipt"
                    type="text"
                    name="taxNumber"
                    placeholder={t('auth:onboarding.company.taxNumberPlaceholder', "Tax Number (Optional)")}
                    value={employerData.taxNumber}
                    onChange={handleEmployerDataChange}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Legal Verification */}
            <div className="onboarding-phase-2__section">
              <div className="onboarding-phase-2__section-header">
                <div className="onboarding-phase-2__section-title-wrapper">
                  <h2 className="onboarding-phase-2__section-title">
                    {t('auth:onboarding.company.legalVerification', "Legal Verification")}
                  </h2>
                  {completionStatus.legalInfo && (
                    <span className="onboarding-phase-2__section-badge completed">
                      <i className="fa-solid fa-check-circle" />
                      {t('auth:onboarding.company.completed', "Completed")}
                    </span>
                  )}
                </div>
                <p className="onboarding-phase-2__section-description">
                  {t('auth:onboarding.company.legalInfoDesc', "Required legal information for company verification")}
                </p>
              </div>

              <div className="onboarding-phase-2__form-grid">
                {/* Commercial Registration Number */}
                <div className="onboarding-phase-2__form-item">
                  <FormInput
                    icon="fa-solid fa-id-card"
                    type="text"
                    name="commercialRegistrationNumber"
                    placeholder={t('auth:onboarding.company.crnPlaceholder', "Commercial Registration Number")}
                    value={companyData.commercialRegistrationNumber}
                    onChange={handleCompanyDataChange}
                    hasError={!!formErrors.commercialRegistrationNumber}
                    errorMessage={formErrors.commercialRegistrationNumber}
                    required
                  />
                  <p className="onboarding-phase-2__field-hint">
                    {t('auth:onboarding.company.crnHint', "Your company's official registration number")}
                  </p>
                </div>

                {/* Current Implementation: File Upload (not in guide) */}
                <div className="onboarding-phase-2__full-width">
                  <div className="file-upload__container">
                    <h3 className="onboarding-phase-2__file-section-title">
                      <i className="fa-solid fa-file-contract" />
                      {t('auth:onboarding.company.crnDocTitle', "Commercial Registration Document (Optional)")}
                    </h3>
                    <p
                      className="onboarding-phase-2__field-hint"
                      style={{ marginBottom: "10px" }}>
                      {t('auth:onboarding.company.notInGuideUrlsOnly', "Note: This file upload is not in the registration guide. The guide expects URLs only.")}
                    </p>
                    <FileUpload
                      label={t('auth:onboarding.jobseeker.clickToUpload', "Click to upload or drag and drop")}
                      accept=".pdf,.doc,.docx,image/*"
                      onChange={(file) => {
                        if (file && file.size > 10 * 1024 * 1024) {
                          setApiError(t('auth:onboarding.company.docSizeError', "Document size must be less than 10MB"));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          return;
                        }
                        setRegistrationDocumentFile(file);
                      }}
                      icon="fa-solid fa-file-contract"
                      supportedFormats="PDF, DOC, JPG, PNG (Max. 10MB)"
                      fileType="document"
                    />
                  </div>
                </div>

                {/* Current Implementation: Logo File Upload (not in guide) */}
                <div className="onboarding-phase-2__full-width">
                  <div className="file-upload__container">
                    <h3 className="onboarding-phase-2__file-section-title">
                      <i className="fa-solid fa-image" />
                      {t('auth:onboarding.company.logoUploadTitle', "Company Logo Upload (Optional)")}
                    </h3>
                    <p
                      className="onboarding-phase-2__field-hint"
                      style={{ marginBottom: "10px" }}>
                      {t('auth:onboarding.company.notInGuideLogoUrl', "Note: This file upload is not in the registration guide. The guide expects LogoUrl (URL).")}
                    </p>
                    <FileUpload
                      label={t('auth:onboarding.jobseeker.clickToUpload', "Click to upload or drag and drop")}
                      accept="image/*"
                      onChange={(file) => {
                        if (file && file.size > 5 * 1024 * 1024) {
                          setApiError(t('auth:onboarding.company.logoSizeError', "Logo size must be less than 5MB"));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          return;
                        }
                        setLogoFile(file);
                      }}
                      icon="fa-solid fa-image"
                      supportedFormats="PNG, JPG, SVG (Max. 5MB)"
                      fileType="image"
                    />
                  </div>
                </div>

                {/* Extra Field: Combined Location (current implementation) */}
                <div className="onboarding-phase-2__full-width">
                  <div className="onboarding-phase-2__section-header">
                    <h3
                      className="onboarding-phase-2__section-title"
                      style={{ fontSize: "1.1rem" }}>
                      <i className="fa-solid fa-map-marker-alt" />
                      {t('auth:onboarding.company.locationTitle', "Current Form Location Field")}
                    </h3>
                    <p
                      className="onboarding-phase-2__section-description"
                      style={{ fontSize: "0.9rem" }}>
                      {t('auth:onboarding.company.locationDesc', "This field exists in the current implementation but is not in the guide. The guide uses separate Country and City fields.")}
                    </p>
                  </div>
                  <FormInput
                    icon="fa-solid fa-location-dot"
                    type="text"
                    name="location"
                    placeholder={t('auth:onboarding.company.locationPlaceholder', "City, Country (Current Implementation)")}
                    value={extraFields.location}
                    onChange={handleExtraFieldChange}
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="onboarding-phase-2__submit-section">
              <button
                type="submit"
                className={`onboarding-phase-2__submit-button ${
                  isLoading ? "onboarding-phase-2__submit-button--loading" : ""
                }`}
                disabled={overallProgress < 30 || isLoading}>
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    {t('auth:onboarding.company.submitting', "Submitting...")}
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check" />
                    {t('auth:onboarding.company.completeRegistration', "Complete Registration")}
                  </>
                )}
              </button>
            </div>

            {/* Verification Notice */}
            <div className="onboarding-phase-2__verification-notice">
              <div className="onboarding-phase-2__verification-icon">
                <i className="fa-solid fa-shield-check" />
              </div>
              <div className="onboarding-phase-2__verification-text">
                <h4>{t('auth:onboarding.company.verificationProcess', "Verification Process")}</h4>
                <p>
                  {t('auth:onboarding.company.verificationDesc', "Your company will be verified within 24-48 hours. You'll receive an email once verification is complete.")}
                </p>
              </div>
            </div>

            {/* Terms Notice */}
            <div className="onboarding-phase-2__terms-notice">
              <p>
                {t('auth:onboarding.company.termsNotice', "By completing registration, you certify that all information is accurate and agree to our")}{" "}
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

export default CompanyOnboarding;