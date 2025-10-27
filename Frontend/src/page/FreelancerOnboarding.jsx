/**
 * @file FreelancerOnboarding.jsx
 * @description Freelancer onboarding page with portfolio details
 * @author Your Name
 * @version 1.3.0
 * @date 2024-01-01
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import FormTextarea from "../components/FormTextarea";
import FormSelect from "../components/FormSelect";
import FileUpload from "../components/FileUpload";
import "../styles/onboarding.css";

/**
 * FreelancerOnboarding Component
 * @description Renders the freelancer onboarding form with portfolio details
 * @returns {JSX.Element} The rendered freelancer onboarding component
 */
function FreelancerOnboarding() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        headline: "",
        location: "",
        overview: "",
        skills: "",
        hourlyRate: "",
        portfolioLink: "",
    });

    const [profilePicture, setProfilePicture] = useState(null);
    const [portfolioImages, setPortfolioImages] = useState([]);
    const [completionStatus, setCompletionStatus] = useState({
        basicInfo: false,
        professionalDetails: false,
        portfolio: false
    });
    const [overallProgress, setOverallProgress] = useState(0);

    /**
     * Calculate completion status for each section
     */
    useEffect(() => {
        const basicInfoComplete = formData.headline && formData.location && formData.hourlyRate;
        const professionalDetailsComplete = formData.overview.length >= 50 && formData.skills.length >= 3;
        const portfolioComplete = profilePicture && portfolioImages.length > 0;

        setCompletionStatus({
            basicInfo: basicInfoComplete,
            professionalDetails: professionalDetailsComplete,
            portfolio: portfolioComplete
        });

        // Calculate overall progress (33% per section)
        let progress = 0;
        if (basicInfoComplete) progress += 33;
        if (professionalDetailsComplete) progress += 33;
        if (portfolioComplete) progress += 34; // Extra 1% to reach 100

        setOverallProgress(progress);
    }, [formData, profilePicture, portfolioImages]);

    /**
     * Handles input changes for form fields
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Handles portfolio images upload
     * @param {File} file - The uploaded file
     */
    const handlePortfolioImagesUpload = (file) => {
        if (file) {
            setPortfolioImages(prev => [...prev, file]);
        }
    };

    /**
     * Removes a portfolio image
     * @param {number} index - The index of the image to remove
     */
    const removePortfolioImage = (index) => {
        setPortfolioImages(prev => prev.filter((_, i) => i !== index));
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

        console.log("Submitting freelancer data:", {
            formData,
            profilePicture,
            portfolioImages
        });

        // Simulate API call
        setTimeout(() => {
            alert("Freelancer profile submitted successfully!");
            navigate("/");
        }, 1500);
    };

    /**
     * Handles save as draft
     */
    const handleSaveDraft = () => {
        console.log("Saving draft:", { formData, profilePicture, portfolioImages });
        alert("Draft saved successfully!");
    };

    return (
        <div className="onboarding-phase-2">
            <div className="onboarding-phase-2__container">
                <div className="onboarding-phase-2__header">
                    <h1 className="onboarding-phase-2__title">
                        Complete Your Freelancer Profile
                    </h1>
                    <p className="onboarding-phase-2__subtitle">
                        Showcase your skills and attract clients
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
                            ? "You're ready to submit your freelancer profile!"
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
                                    Tell clients about your professional identity
                                </p>
                            </div>

                            <div className="onboarding-phase-2__form-grid">
                                <div className="onboarding-phase-2__form-item">
                                    <FormInput
                                        icon="fa-solid fa-heading"
                                        type="text"
                                        name="headline"
                                        placeholder="Professional Headline (e.g., Senior Web Developer)"
                                        value={formData.headline}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <p className="onboarding-phase-2__field-hint">
                                        This will be your main professional title
                                    </p>
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
                                        Your location helps clients find local talent
                                    </p>
                                </div>

                                <div className="onboarding-phase-2__form-item">
                                    <FormInput
                                        icon="fa-solid fa-dollar-sign"
                                        type="number"
                                        name="hourlyRate"
                                        placeholder="Hourly Rate (USD)"
                                        value={formData.hourlyRate}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="5"
                                        required
                                    />
                                    <p className="onboarding-phase-2__field-hint">
                                        Set your preferred hourly rate
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Professional Details */}
                        <div className="onboarding-phase-2__section">
                            <div className="onboarding-phase-2__section-header">
                                <div className="onboarding-phase-2__section-title-wrapper">
                                    <h2 className="onboarding-phase-2__section-title">Professional Details</h2>
                                    {completionStatus.professionalDetails && (
                                        <span className="onboarding-phase-2__section-badge completed">
                                            Completed
                                        </span>
                                    )}
                                </div>
                                <p className="onboarding-phase-2__section-description">
                                    Showcase your expertise and skills to attract the right clients
                                </p>
                            </div>

                            <div className="onboarding-phase-2__form-grid">
                                <div className="onboarding-phase-2__full-width">
                                    <div className="onboarding-phase-2__textarea-section">
                                        <FormTextarea
                                            icon="fa-solid fa-align-left"
                                            name="overview"
                                            placeholder="Tell clients about your experience, expertise, and what makes you unique. Describe your approach to projects and your professional background."
                                            value={formData.overview}
                                            onChange={handleInputChange}
                                            rows={6}
                                            maxLength={1000}
                                            required
                                        />
                                        <div className="onboarding-phase-2__character-counter">
                                            {formData.overview.length} / 1000 characters
                                        </div>
                                        <p className="onboarding-phase-2__field-hint">
                                            This is your chance to make a great first impression
                                        </p>
                                    </div>
                                </div>

                                <div className="onboarding-phase-2__full-width">
                                    <div className="onboarding-phase-2__textarea-section">
                                        <FormTextarea
                                            icon="fa-solid fa-code"
                                            name="skills"
                                            placeholder="Web Development, UI/UX Design, React, JavaScript, Python, Project Management..."
                                            value={formData.skills}
                                            onChange={handleInputChange}
                                            rows={3}
                                            required
                                        />
                                        <p className="onboarding-phase-2__field-hint">
                                            List your key skills separated by commas
                                        </p>
                                    </div>
                                </div>

                                <div className="onboarding-phase-2__form-item">
                                    <FormInput
                                        icon="fa-solid fa-link"
                                        type="url"
                                        name="portfolioLink"
                                        placeholder="https://yourportfolio.com"
                                        value={formData.portfolioLink}
                                        onChange={handleInputChange}
                                    />
                                    <p className="onboarding-phase-2__field-hint">
                                        Link to your portfolio website (optional)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Portfolio */}
                        <div className="onboarding-phase-2__section">
                            <div className="onboarding-phase-2__section-header">
                                <div className="onboarding-phase-2__section-title-wrapper">
                                    <h2 className="onboarding-phase-2__section-title">Portfolio & Media</h2>
                                    {completionStatus.portfolio && (
                                        <span className="onboarding-phase-2__section-badge completed">
                                            Completed
                                        </span>
                                    )}
                                </div>
                                <p className="onboarding-phase-2__section-description">
                                    Showcase your work with images and professional media
                                </p>
                            </div>

                            <div className="onboarding-phase-2__form-grid">
                                <div className="onboarding-phase-2__full-width">
                                    <div className="file-upload__container">
                                        <h3 className="onboarding-phase-2__file-section-title">
                                            Profile Picture
                                            <span className="onboarding-phase-2__required-asterisk">*</span>
                                        </h3>
                                        <FileUpload
                                            label="Click to upload or drag and drop"
                                            accept="image/*"
                                            onChange={setProfilePicture}
                                            icon="fa-solid fa-camera"
                                            supportedFormats="PNG, JPG, SVG (Max. 5MB)"
                                            fileType="image"
                                        />
                                        <p className="onboarding-phase-2__field-hint">
                                            A professional photo helps build trust with clients
                                        </p>
                                    </div>
                                </div>

                                <div className="onboarding-phase-2__full-width">
                                    <div className="file-upload__container">
                                        <h3 className="onboarding-phase-2__file-section-title">
                                            Portfolio Images
                                            <span className="onboarding-phase-2__required-asterisk">*</span>
                                        </h3>
                                        <FileUpload
                                            label="Click to upload or drag and drop"
                                            accept="image/*"
                                            onChange={handlePortfolioImagesUpload}
                                            icon="fa-solid fa-images"
                                            supportedFormats="PNG, JPG, SVG (Max. 10MB each)"
                                            fileType="image"
                                            multiple
                                        />
                                        <p className="onboarding-phase-2__field-hint">
                                            Upload screenshots of your best work (minimum 3 images recommended)
                                        </p>
                                        {portfolioImages.length > 0 && (
                                            <div className="onboarding-phase-2__uploaded-files">
                                                <p className="onboarding-phase-2__uploaded-count">
                                                    {portfolioImages.length} image(s) uploaded
                                                </p>
                                                <div className="onboarding-phase-2__uploaded-list">
                                                    {portfolioImages.map((file, index) => (
                                                        <div key={index} className="onboarding-phase-2__uploaded-item">
                                                            <span>{file.name}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removePortfolioImage(index)}
                                                                className="onboarding-phase-2__remove-upload"
                                                            >
                                                                <i className="fa-solid fa-times" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
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

export default FreelancerOnboarding;