/**
 * @file JobSeekerOnboarding.jsx
 * @description Job seeker onboarding page with profile completion
 * @author Your Name
 * @version 1.3.0
 * @date 2024-01-01
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import FormTextarea from "../components/FormTextarea";
import FileUpload from "../components/FileUpload";
import "../styles/onboarding.css";

/**
 * JobSeekerOnboarding Component
 * @description Renders the job seeker onboarding form with experience and education sections
 * @returns {JSX.Element} The rendered job seeker onboarding component
 */
function JobSeekerOnboarding() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        headline: "",
        location: "",
        summary: "",
        skills: "",
    });

    const [profilePicture, setProfilePicture] = useState(null);
    const [resume, setResume] = useState(null);
    const [experiences, setExperiences] = useState([
        { id: "1", title: "", company: "", duration: "" },
    ]);
    const [education, setEducation] = useState([
        { id: "1", degree: "", institution: "", year: "" },
    ]);
    const [completionStatus, setCompletionStatus] = useState({
        basicInfo: false,
        professionalProfile: false,
        experience: false,
        education: false,
        documents: false
    });
    const [overallProgress, setOverallProgress] = useState(0);

    /**
     * Calculate completion status for each section
     */
    useEffect(() => {
        const basicInfoComplete = formData.headline && formData.location;
        const professionalProfileComplete = formData.summary.length >= 50 && formData.skills.length >= 3;
        const experienceComplete = experiences.every(exp => exp.title && exp.company && exp.duration);
        const educationComplete = education.every(edu => edu.degree && edu.institution && edu.year);
        const documentsComplete = resume && profilePicture;

        setCompletionStatus({
            basicInfo: basicInfoComplete,
            professionalProfile: professionalProfileComplete,
            experience: experienceComplete,
            education: educationComplete,
            documents: documentsComplete
        });

        // Calculate overall progress (20% per section)
        let progress = 0;
        if (basicInfoComplete) progress += 20;
        if (professionalProfileComplete) progress += 20;
        if (experienceComplete) progress += 20;
        if (educationComplete) progress += 20;
        if (documentsComplete) progress += 20;

        setOverallProgress(progress);
    }, [formData, experiences, education, resume, profilePicture]);

    /**
     * Handles input changes for form fields
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Adds a new experience field
     */
    const addExperience = () => {
        setExperiences([...experiences, {
            id: Date.now().toString(),
            title: "",
            company: "",
            duration: ""
        }]);
    };

    /**
     * Removes an experience field
     * @param {string} id - The ID of the experience to remove
     */
    const removeExperience = (id) => {
        setExperiences(experiences.filter(exp => exp.id !== id));
    };

    /**
     * Handles experience field changes
     * @param {string} id - The ID of the experience
     * @param {string} field - The field to update
     * @param {string} value - The new value
     */
    const handleExperienceChange = (id, field, value) => {
        setExperiences(experiences.map(exp =>
            exp.id === id ? { ...exp, [field]: value } : exp
        ));
    };

    /**
     * Adds a new education field
     */
    const addEducation = () => {
        setEducation([...education, {
            id: Date.now().toString(),
            degree: "",
            institution: "",
            year: ""
        }]);
    };

    /**
     * Removes an education field
     * @param {string} id - The ID of the education to remove
     */
    const removeEducation = (id) => {
        setEducation(education.filter(edu => edu.id !== id));
    };

    /**
     * Handles education field changes
     * @param {string} id - The ID of the education
     * @param {string} field - The field to update
     * @param {string} value - The new value
     */
    const handleEducationChange = (id, field, value) => {
        setEducation(education.map(edu =>
            edu.id === id ? { ...edu, [field]: value } : edu
        ));
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

        console.log("Submitting job seeker data:", {
            formData,
            profilePicture,
            resume,
            experiences,
            education
        });

        // Simulate API call
        setTimeout(() => {
            alert("Job seeker profile submitted successfully!");
            navigate("/");
        }, 1500);
    };

    /**
     * Handles save as draft
     */
    const handleSaveDraft = () => {
        console.log("Saving draft:", { formData, profilePicture, resume, experiences, education });
        alert("Draft saved successfully!");
    };

    return (
        <div className="onboarding-phase-2">
            <div className="onboarding-phase-2__container">
                <div className="onboarding-phase-2__header">
                    <h1 className="onboarding-phase-2__title">
                        Complete Your Professional Profile
                    </h1>
                    <p className="onboarding-phase-2__subtitle">
                        Showcase your skills and experience to attract employers
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
                            ? "You're ready to submit your profile!"
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
                                    Tell employers about your professional identity
                                </p>
                            </div>

                            <div className="onboarding-phase-2__form-grid">
                                <div className="onboarding-phase-2__form-item">
                                    <FormInput
                                        icon="fa-solid fa-heading"
                                        type="text"
                                        name="headline"
                                        placeholder="Professional Headline (e.g., Senior Software Engineer)"
                                        value={formData.headline}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <p className="onboarding-phase-2__field-hint">
                                        Your main professional title
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
                                        Your current location
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Professional Profile */}
                        <div className="onboarding-phase-2__section">
                            <div className="onboarding-phase-2__section-header">
                                <div className="onboarding-phase-2__section-title-wrapper">
                                    <h2 className="onboarding-phase-2__section-title">Professional Profile</h2>
                                    {completionStatus.professionalProfile && (
                                        <span className="onboarding-phase-2__section-badge completed">
                                            Completed
                                        </span>
                                    )}
                                </div>
                                <p className="onboarding-phase-2__section-description">
                                    Showcase your expertise and career objectives
                                </p>
                            </div>

                            <div className="onboarding-phase-2__form-grid">
                                <div className="onboarding-phase-2__full-width">
                                    <div className="onboarding-phase-2__textarea-section">
                                        <FormTextarea
                                            icon="fa-solid fa-align-left"
                                            name="summary"
                                            placeholder="Describe your professional background, key achievements, and career objectives. Highlight what makes you a great candidate."
                                            value={formData.summary}
                                            onChange={handleInputChange}
                                            rows={6}
                                            maxLength={1500}
                                            required
                                        />
                                        <div className="onboarding-phase-2__character-counter">
                                            {formData.summary.length} / 1500 characters
                                        </div>
                                        <p className="onboarding-phase-2__field-hint">
                                            This is your professional elevator pitch
                                        </p>
                                    </div>
                                </div>

                                <div className="onboarding-phase-2__full-width">
                                    <div className="onboarding-phase-2__textarea-section">
                                        <FormTextarea
                                            icon="fa-solid fa-code"
                                            name="skills"
                                            placeholder="JavaScript, React, Node.js, Project Management, Team Leadership, Agile Methodology..."
                                            value={formData.skills}
                                            onChange={handleInputChange}
                                            rows={3}
                                            required
                                        />
                                        <p className="onboarding-phase-2__field-hint">
                                            List your key skills and technologies separated by commas
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Experience */}
                        <div className="onboarding-phase-2__section">
                            <div className="onboarding-phase-2__section-header">
                                <div className="onboarding-phase-2__section-title-wrapper">
                                    <h2 className="onboarding-phase-2__section-title">Work Experience</h2>
                                    {completionStatus.experience && (
                                        <span className="onboarding-phase-2__section-badge completed">
                                            Completed
                                        </span>
                                    )}
                                </div>
                                <p className="onboarding-phase-2__section-description">
                                    Detail your professional work history
                                </p>
                            </div>

                            <div className="onboarding-phase-2__dynamic-items">
                                {experiences.map((exp, index) => (
                                    <div key={exp.id} className="onboarding-phase-2__dynamic-item">
                                        <div className="onboarding-phase-2__dynamic-header">
                                            <h4 className="onboarding-phase-2__dynamic-title">
                                                Experience #{index + 1}
                                            </h4>
                                            <div className="onboarding-phase-2__dynamic-actions">
                                                {experiences.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExperience(exp.id)}
                                                        className="onboarding-phase-2__remove-button"
                                                    >
                                                        <i className="fa-solid fa-trash" />
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="onboarding-phase-2__dynamic-grid">
                                            <div className="onboarding-phase-2__form-item">
                                                <FormInput
                                                    icon="fa-solid fa-briefcase"
                                                    type="text"
                                                    placeholder="Job Title"
                                                    value={exp.title}
                                                    onChange={(e) => handleExperienceChange(exp.id, 'title', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="onboarding-phase-2__form-item">
                                                <FormInput
                                                    icon="fa-solid fa-building"
                                                    type="text"
                                                    placeholder="Company Name"
                                                    value={exp.company}
                                                    onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="onboarding-phase-2__form-item">
                                                <FormInput
                                                    icon="fa-solid fa-calendar"
                                                    type="text"
                                                    placeholder="Duration (e.g., Jan 2020 - Present)"
                                                    value={exp.duration}
                                                    onChange={(e) => handleExperienceChange(exp.id, 'duration', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addExperience}
                                    className="onboarding-phase-2__add-button"
                                >
                                    <i className="fa-solid fa-plus" />
                                    Add Another Experience
                                </button>
                            </div>
                        </div>

                        {/* Section 4: Education */}
                        <div className="onboarding-phase-2__section">
                            <div className="onboarding-phase-2__section-header">
                                <div className="onboarding-phase-2__section-title-wrapper">
                                    <h2 className="onboarding-phase-2__section-title">Education</h2>
                                    {completionStatus.education && (
                                        <span className="onboarding-phase-2__section-badge completed">
                                            Completed
                                        </span>
                                    )}
                                </div>
                                <p className="onboarding-phase-2__section-description">
                                    Detail your educational background
                                </p>
                            </div>

                            <div className="onboarding-phase-2__dynamic-items">
                                {education.map((edu, index) => (
                                    <div key={edu.id} className="onboarding-phase-2__dynamic-item">
                                        <div className="onboarding-phase-2__dynamic-header">
                                            <h4 className="onboarding-phase-2__dynamic-title">
                                                Education #{index + 1}
                                            </h4>
                                            <div className="onboarding-phase-2__dynamic-actions">
                                                {education.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeEducation(edu.id)}
                                                        className="onboarding-phase-2__remove-button"
                                                    >
                                                        <i className="fa-solid fa-trash" />
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="onboarding-phase-2__dynamic-grid">
                                            <div className="onboarding-phase-2__form-item">
                                                <FormInput
                                                    icon="fa-solid fa-graduation-cap"
                                                    type="text"
                                                    placeholder="Degree (e.g., Bachelor of Science)"
                                                    value={edu.degree}
                                                    onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="onboarding-phase-2__form-item">
                                                <FormInput
                                                    icon="fa-solid fa-school"
                                                    type="text"
                                                    placeholder="Institution Name"
                                                    value={edu.institution}
                                                    onChange={(e) => handleEducationChange(edu.id, 'institution', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="onboarding-phase-2__form-item">
                                                <FormInput
                                                    icon="fa-solid fa-calendar"
                                                    type="text"
                                                    placeholder="Year of Graduation"
                                                    value={edu.year}
                                                    onChange={(e) => handleEducationChange(edu.id, 'year', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addEducation}
                                    className="onboarding-phase-2__add-button"
                                >
                                    <i className="fa-solid fa-plus" />
                                    Add Another Education
                                </button>
                            </div>
                        </div>

                        {/* Section 5: Documents */}
                        <div className="onboarding-phase-2__section">
                            <div className="onboarding-phase-2__section-header">
                                <div className="onboarding-phase-2__section-title-wrapper">
                                    <h2 className="onboarding-phase-2__section-title">Documents</h2>
                                    {completionStatus.documents && (
                                        <span className="onboarding-phase-2__section-badge completed">
                                            Completed
                                        </span>
                                    )}
                                </div>
                                <p className="onboarding-phase-2__section-description">
                                    Upload your resume and professional photo
                                </p>
                            </div>

                            <div className="onboarding-phase-2__form-grid">
                                <div className="onboarding-phase-2__full-width">
                                    <div className="file-upload__container">
                                        <h3 className="onboarding-phase-2__file-section-title">
                                            Resume/CV
                                            <span className="onboarding-phase-2__required-asterisk">*</span>
                                        </h3>
                                        <FileUpload
                                            label="Click to upload or drag and drop"
                                            accept=".pdf,.doc,.docx"
                                            onChange={setResume}
                                            icon="fa-solid fa-file-pdf"
                                            supportedFormats="PDF, DOC, DOCX (Max. 10MB)"
                                            fileType="document"
                                        />
                                        <p className="onboarding-phase-2__field-hint">
                                            Upload your most recent resume or CV
                                        </p>
                                    </div>
                                </div>

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
                                            A professional headshot helps make a good impression
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

export default JobSeekerOnboarding;