/**
 * @file CompanyMemberOnboarding.jsx
 * @description Company member onboarding page with company search and database alignment
 * @author AI Assistant
 * @date 2024-01-01
 *
 * @last-modified-by AI Assistant
 * @last-modified-date 2024-01-01
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import FormSelect from "../components/FormSelect";
import FileUpload from "../components/FileUpload";
import "../styles/onboarding.css";

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
    const [profilePicture, setProfilePicture] = useState(null);

    // Completion status aligned with database requirements
    const [completionStatus, setCompletionStatus] = useState({
        companySelection: false,
        roleSelection: false,
        professionalInfo: false,
        profileSetup: false
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
            VerificationStatus: "Verified"
        },
        {
            Id: 2,
            Uuid: "123e4567-e89b-12d3-a456-426614174001",
            Name: "HealthPlus Medical",
            Industry: "Healthcare",
            Location: "New York, NY",
            VerificationStatus: "Verified"
        },
        {
            Id: 3,
            Uuid: "123e4567-e89b-12d3-a456-426614174002",
            Name: "FinanceGlobal",
            Industry: "Finance",
            Location: "Chicago, IL",
            VerificationStatus: "Pending"
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
                const results = mockCompanies.filter(company =>
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
        // Required fields for CompanyMembers table
        const companySelectionComplete = selectedCompany !== null;
        const roleSelectionComplete = formData.role !== "";

        // Professional info for Experiences table
        const professionalInfoComplete = formData.position && formData.department;

        // Profile picture for Users table
        const profileSetupComplete = profilePicture !== null;

        setCompletionStatus({
            companySelection: companySelectionComplete,
            roleSelection: roleSelectionComplete,
            professionalInfo: professionalInfoComplete,
            profileSetup: profileSetupComplete
        });

        // Calculate overall progress (25% per section)
        let progress = 0;
        if (companySelectionComplete) progress += 25;
        if (roleSelectionComplete) progress += 25;
        if (professionalInfoComplete) progress += 25;
        if (profileSetupComplete) progress += 25;

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
            AddedAt: new Date().toISOString()
        };

        // Data for Experiences table (current position)
        const experienceData = {
            UserId: null, // Will be set from current user session
            JobTitle: formData.position,
            CompanyName: selectedCompany.Name,
            Description: `Working as ${formData.position} in ${formData.department} department`,
            StartDate: new Date().toISOString().split('T')[0], // Current date
            EndDate: null // Current position
        };

        // Data for Users table (profile picture update)
        const userUpdateData = {
            ProfilePictureUrl: null // Will be set after file upload to CDN
        };

        return {
            companyMember: companyMemberData,
            experience: experienceData,
            user: userUpdateData,
            profilePicture: profilePicture
        };
    };

    /**
     * Handles form submission
     * @param {React.FormEvent} e - The form event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all sections are complete
        if (overallProgress < 100) {
            alert("Please complete all required sections before submitting.");
            return;
        }

        try {
            const submissionData = prepareSubmissionData();

            console.log("Submitting company member data to database:", submissionData);

            // Simulate API calls to multiple tables
            // In real implementation, this would be multiple API calls or a transaction
            setTimeout(() => {
                alert("Company member profile submitted successfully! Awaiting verification.");
                navigate("/dashboard");
            }, 1500);

        } catch (error) {
            console.error("Error submitting company member data:", error);
            alert("Error submitting profile. Please try again.");
        }
    };

    /**
     * Handles save as draft
     */
    const handleSaveDraft = () => {
        const draftData = prepareSubmissionData();
        console.log("Saving draft to database:", draftData);
        alert("Draft saved successfully!");
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
                            ? "You're ready to join your company network!"
                            : "Complete all sections to submit your request."
                        }
                    </p>
                </div>

                <div className="onboarding-phase-2__card">
                    <form onSubmit={handleSubmit}>
                        {/* Section 1: Company Selection */}
                        <div className="onboarding-phase-2__section">
                            <div className="onboarding-phase-2__section-header">
                                <div className="onboarding-phase-2__section-title-wrapper">
                                    <h2 className="onboarding-phase-2__section-title">Company Selection</h2>
                                    {completionStatus.companySelection && (
                                        <span className="onboarding-phase-2__section-badge completed">
                                            Completed
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
                                        <div className="company-search__input-wrapper">
                                            <FormInput
                                                icon="fa-solid fa-building"
                                                type="text"
                                                name="companySearch"
                                                placeholder="Search for your company by name, industry, or location..."
                                                value={companySearch}
                                                onChange={handleCompanySearch}
                                                required
                                            />
                                            {selectedCompany && (
                                                <button
                                                    type="button"
                                                    onClick={handleClearCompany}
                                                    className="company-search__clear-button"
                                                    title="Clear selection"
                                                >
                                                    <i className="fa-solid fa-times" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Search Results Dropdown */}
                                        {searchResults.length > 0 && (
                                            <div className="company-search__results">
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
                                                        onClick={() => handleCompanySelect(company)}
                                                    >
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
                                            <div className="company-search__loading">
                                                <i className="fa-solid fa-spinner fa-spin" />
                                                Searching companies...
                                            </div>
                                        )}

                                        {companySearch.length > 2 && !isSearching && searchResults.length === 0 && (
                                            <div className="company-search__no-results">
                                                <i className="fa-solid fa-building-circle-exclamation" />
                                                No companies found matching your search.
                                            </div>
                                        )}

                                        {/* Selected Company Display */}
                                        {selectedCompany && (
                                            <div className="company-search__selected">
                                                <div className="company-search__selected-header">
                                                    <h4>Selected Company</h4>
                                                    <span className="company-search__selected-badge">
                                                        <i className="fa-solid fa-check" />
                                                        Selected
                                                    </span>
                                                </div>
                                                <div className="company-search__selected-info">
                                                    <h5 className="company-search__selected-name">
                                                        {selectedCompany.Name}
                                                        {selectedCompany.VerificationStatus === "Verified" && (
                                                            <span className="company-search__verified-badge">
                                                                <i className="fa-solid fa-shield-check" />
                                                                Verified Company
                                                            </span>
                                                        )}
                                                    </h5>
                                                    <p className="company-search__selected-details">
                                                        <span>
                                                            <strong>Industry:</strong> {selectedCompany.Industry}
                                                        </span>
                                                        <span>
                                                            <strong>Location:</strong> {selectedCompany.Location}
                                                        </span>
                                                        <span>
                                                            <strong>Status:</strong> {selectedCompany.VerificationStatus}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <p className="onboarding-phase-2__field-hint">
                                            Start typing your company name to search. Only verified companies are available for joining.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Role Selection */}
                        <div className="onboarding-phase-2__section">
                            <div className="onboarding-phase-2__section-header">
                                <div className="onboarding-phase-2__section-title-wrapper">
                                    <h2 className="onboarding-phase-2__section-title">Company Role</h2>
                                    {completionStatus.roleSelection && (
                                        <span className="onboarding-phase-2__section-badge completed">
                                            Completed
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
                                        required
                                    />
                                    <p className="onboarding-phase-2__field-hint">
                                        This determines your permissions within the company
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Professional Information */}
                        <div className="onboarding-phase-2__section">
                            <div className="onboarding-phase-2__section-header">
                                <div className="onboarding-phase-2__section-title-wrapper">
                                    <h2 className="onboarding-phase-2__section-title">Professional Information</h2>
                                    {completionStatus.professionalInfo && (
                                        <span className="onboarding-phase-2__section-badge completed">
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
                                        required
                                    />
                                    <p className="onboarding-phase-2__field-hint">
                                        Your current position at the company
                                    </p>
                                </div>

                                <div className="onboarding-phase-2__form-item">
                                    <FormInput
                                        icon="fa-solid fa-sitemap"
                                        type="text"
                                        name="department"
                                        placeholder="Department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <p className="onboarding-phase-2__field-hint">
                                        Your department or team
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Profile Setup */}
                        <div className="onboarding-phase-2__section">
                            <div className="onboarding-phase-2__section-header">
                                <div className="onboarding-phase-2__section-title-wrapper">
                                    <h2 className="onboarding-phase-2__section-title">Profile Setup</h2>
                                    {completionStatus.profileSetup && (
                                        <span className="onboarding-phase-2__section-badge completed">
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
                                            Professional Photo
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
                                            A professional headshot for your company profile
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
                                {overallProgress === 100 ? "Join Company Network" : `Complete Profile (${overallProgress}%)`}
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