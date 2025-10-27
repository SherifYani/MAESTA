/**
 * @file CompanyOnboarding.jsx
 * @description Company admin onboarding page with all sections visible
 * @author Sherif Talaat
 * @version 1.3.0
 * @date 24-10-2025
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import FormTextarea from "../components/FormTextarea";
import FormSelect from "../components/FormSelect";
import FileUpload from "../components/FileUpload";
import "../styles/onboarding.css";

/**
 * CompanyOnboarding Component
 * @description Renders the company admin onboarding form with progress tracking
 * @returns {JSX.Element} The rendered company onboarding component
 */
function CompanyOnboarding() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        description: "",
        industry: "",
        companySize: "",
        location: "",
        commercialRegistrationID: "",
    });

    const [logo, setLogo] = useState(null);
    const [registrationPhoto, setRegistrationPhoto] = useState(null);
    const [completionStatus, setCompletionStatus] = useState({
        basicInfo: false,
        companyStory: false,
        legalVerification: false
    });
    const [overallProgress, setOverallProgress] = useState(0);

    /**
     * Calculate completion status for each section
     */
    useEffect(() => {
        const basicInfoComplete = formData.industry && formData.companySize && formData.location;
        const companyStoryComplete = formData.description.length >= 10; // Minimum description length
        const legalVerificationComplete = formData.commercialRegistrationID && registrationPhoto;

        setCompletionStatus({
            basicInfo: basicInfoComplete,
            companyStory: companyStoryComplete,
            legalVerification: legalVerificationComplete
        });

        // Calculate overall progress (33% per section)
        let progress = 0;
        if (basicInfoComplete) progress += 33;
        if (companyStoryComplete) progress += 33;
        if (legalVerificationComplete) progress += 34; // Extra 1% to reach 100

        setOverallProgress(progress);
    }, [formData, logo, registrationPhoto]);

    /**
     * Handles input changes for form fields
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>} e - The change event
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Handles form submission
     * @param {React.FormEvent} e - The form event
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate all sections are complete
        if (overallProgress < 100) {
            alert("Please complete all required sections before submitting.");
            return;
        }

        console.log("Submitting company data:", { formData, logo, registrationPhoto });

        // Simulate API call
        setTimeout(() => {
            alert("Company profile submitted successfully!");
            navigate("/");
        }, 1500);
    };

    /**
     * Handles save as draft
     */
    const handleSaveDraft = () => {
        console.log("Saving draft:", { formData, logo, registrationPhoto });
        alert("Draft saved successfully!");
    };

    return (
        <div className="onboarding-phase-2">
            <div className="onboarding-phase-2__container">
                <div className="onboarding-phase-2__header">
                    <h1 className="onboarding-phase-2__title">
                        Company Registration
                    </h1>
                    <p className="onboarding-phase-2__subtitle">
                        Complete your company profile to attract top talent
                    </p>
                </div>

                {/* Progress Section */}
                <div className="onboarding-phase-2__progress-section">
                    <div className="onboarding-phase-2__progress-header">
                        <h3>Form Completion</h3>
                        <span className="onboarding-phase-2__progress-percentage">
                            {overallProgress}%
                        </span>
                    </div>
                    <div className="onboarding-phase-2__progress-bar">
                        <div
                            className="onboarding-phase-2__progress-fill"
                            style={{ width: `${overallProgress}%` }}
                        ></div>
                    </div>
                    <p className="onboarding-phase-2__progress-hint">
                        {overallProgress === 100
                            ? "You're ready to submit your company profile!"
                            : "Complete all sections to submit your profile."
                        }
                    </p>
                </div>

                <div className="onboarding-phase-2__card">
                    <form onSubmit={handleSubmit}>
                        {/* Section 1: Basic Information */}
                        <div className="onboarding-phase-2__section">
                            <div className="onboarding-phase-2__section-header">
                                <div className="onboarding-phase-2__section-title-wrapper">
                                    <h2 className="onboarding-phase-2__section-title">Basic Information</h2>
                                    {completionStatus.basicInfo && (
                                        <span className="onboarding-phase-2__section-badge completed">
                                            Completed
                                        </span>
                                    )}
                                </div>
                                <p className="onboarding-phase-2__section-description">
                                    Tell us about your company's core details
                                </p>
                            </div>

                            <div className="onboarding-phase-2__form-grid">
                                <div className="onboarding-phase-2__form-item">
                                    <FormSelect
                                        icon="fa-solid fa-industry"
                                        name="industry"
                                        value={formData.industry}
                                        onChange={handleInputChange}
                                        options={[
                                            { value: "", label: "Select Industry" },
                                            { value: "technology", label: "Technology" },
                                            { value: "healthcare", label: "Healthcare" },
                                            { value: "finance", label: "Finance" },
                                            { value: "education", label: "Education" },
                                            { value: "retail", label: "Retail" },
                                            { value: "manufacturing", label: "Manufacturing" },
                                            { value: "other", label: "Other" },
                                        ]}
                                        required
                                    />
                                </div>

                                <div className="onboarding-phase-2__form-item">
                                    <FormSelect
                                        icon="fa-solid fa-users"
                                        name="companySize"
                                        value={formData.companySize}
                                        onChange={handleInputChange}
                                        options={[
                                            { value: "", label: "Select Company Size" },
                                            { value: "1-10", label: "1-10 employees" },
                                            { value: "11-50", label: "11-50 employees" },
                                            { value: "51-200", label: "51-200 employees" },
                                            { value: "201-500", label: "201-500 employees" },
                                            { value: "500+", label: "500+ employees" },
                                        ]}
                                        required
                                    />
                                </div>

                                <div className="onboarding-phase-2__form-item">
                                    <FormInput
                                        icon="fa-solid fa-location-dot"
                                        type="text"
                                        name="location"
                                        placeholder="City, Country"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <p className="onboarding-phase-2__field-hint">
                                        This will be visible to candidates
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Company Story */}
                        <div className="onboarding-phase-2__section">
                            <div className="onboarding-phase-2__section-header">
                                <div className="onboarding-phase-2__section-title-wrapper">
                                    <h2 className="onboarding-phase-2__section-title">Company Story</h2>
                                    {completionStatus.companyStory && (
                                        <span className="onboarding-phase-2__section-badge completed">
                                            Completed
                                        </span>
                                    )}
                                </div>
                                <p className="onboarding-phase-2__section-description">
                                    Share your company's vision and culture to attract the right talent
                                </p>
                            </div>

                            <div className="onboarding-phase-2__form-grid">
                                <div className="onboarding-phase-2__full-width">
                                    <div className="onboarding-phase-2__textarea-section">
                                        <FormTextarea
                                            icon="fa-solid fa-align-left"
                                            name="description"
                                            placeholder="Tell candidates what makes your company special... Describe your mission, culture, and values."
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={6}
                                            maxLength={500}
                                            required
                                        />
                                        <div className="onboarding-phase-2__character-counter">
                                            {formData.description.length} / 500 characters
                                        </div>
                                        <p className="onboarding-phase-2__field-hint">
                                            Describe your mission, culture, and what makes you unique. This is your chance to stand out!
                                        </p>
                                    </div>
                                </div>

                                <div className="onboarding-phase-2__full-width">
                                    <div className="file-upload__container">
                                        <h3 className="onboarding-phase-2__file-section-title">
                                            Company Logo
                                            <span className="onboarding-phase-2__required-asterisk">*</span>
                                        </h3>
                                        <FileUpload
                                            label="Click to upload or drag and drop"
                                            accept="image/*"
                                            onChange={setLogo}
                                            icon="fa-solid fa-image"
                                            supportedFormats="PNG, JPG, SVG (Max. 5MB)"
                                            fileType="image"
                                        />
                                        <p className="onboarding-phase-2__field-hint">
                                            Upload your company logo to build brand recognition
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Legal Verification */}
                        <div className="onboarding-phase-2__section">
                            <div className="onboarding-phase-2__section-header">
                                <div className="onboarding-phase-2__section-title-wrapper">
                                    <h2 className="onboarding-phase-2__section-title">Legal Verification</h2>
                                    {completionStatus.legalVerification && (
                                        <span className="onboarding-phase-2__section-badge completed">
                                            Completed
                                        </span>
                                    )}
                                </div>
                                <p className="onboarding-phase-2__section-description">
                                    Upload necessary documents for compliance and trust
                                </p>
                            </div>

                            <div className="onboarding-phase-2__form-grid">
                                <div className="onboarding-phase-2__form-item">
                                    <FormInput
                                        icon="fa-solid fa-id-card"
                                        type="text"
                                        name="commercialRegistrationID"
                                        placeholder="Enter your commercial registration number"
                                        value={formData.commercialRegistrationID}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <p className="onboarding-phase-2__field-hint">
                                        This information is kept private and used for verification only
                                    </p>
                                </div>

                                <div className="onboarding-phase-2__full-width">
                                    <div className="file-upload__container">
                                        <h3 className="onboarding-phase-2__file-section-title">
                                            Upload Commercial Registration Certificate
                                            <span className="onboarding-phase-2__required-asterisk">*</span>
                                        </h3>
                                        <FileUpload
                                            label="Click to upload or drag and drop"
                                            accept=".pdf,.doc,.docx,image/*"
                                            onChange={setRegistrationPhoto}
                                            icon="fa-solid fa-file-contract"
                                            supportedFormats="PDF, DOC, JPG, PNG (Max. 10MB)"
                                            fileType="document"
                                        />
                                        <p className="onboarding-phase-2__field-hint">
                                            Upload your official business registration document
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
                                onClick={handleSaveDraft}
                            >
                                <i className="fa-solid fa-save" />
                                Save as Draft
                            </button>
                            <button
                                type="submit"
                                className="onboarding-phase-2__submit-button"
                                disabled={overallProgress < 100}
                            >
                                <i className="fa-solid fa-check" />
                                {overallProgress === 100 ? "Complete Profile" : `Complete Profile (${overallProgress}%)`}
                            </button>
                        </div>

                        {/* Terms Notice */}
                        <div className="onboarding-phase-2__terms-notice">
                            <p>
                                By completing this profile, you agree to our{" "}
                                <a href="/terms" className="onboarding-phase-2__terms-link">
                                    Terms of Service
                                </a>{" "}
                                and{" "}
                                <a href="/privacy" className="onboarding-phase-2__terms-link">
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

export default CompanyOnboarding;