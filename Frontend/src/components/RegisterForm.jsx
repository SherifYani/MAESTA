/**
 * @file RegisterForm.jsx
 * @description Registration form component with role selection, validation, and social login
 * @author Job Magnet Development Team
 * @version 2.0.0
 * @date 10-10-2025
 */

import { useState, useCallback } from "react";
import RoleCard from "./RoleCard";
import FormInput from "./FormInput";
import FormTextarea from "./FormTextarea";
import FormSelect from "./FormSelect";
import "../styles/register-form.css";
import "../styles/form-components.css";
/**
 * RegisterForm Component
 * @description Renders the complete registration form with role selection and validation
 * @returns {JSX.Element} The rendered registration form component
 */
function RegisterForm() {
    // Form state management
    const [selectedRole, setSelectedRole] = useState("");
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        companyName: "",
        industry: "",
        companySize: "",
        location: "",
        website: "",
        companyDescription: "",
    });
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Password strength validation state
    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSymbol: false,
    });

    /**
     * Validates password strength requirements
     * @param {string} password - The password to validate
     * @returns {Object} Validation results for each requirement
     */
    const validatePassword = useCallback((password) => {
        return {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };
    }, []);

    /**
     * Handles input changes and updates form state
     * @param {Event} e - The input change event
     */
    const handleInputChange = useCallback(
        (e) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));

            // Validate password in real-time
            if (name === "password") {
                setPasswordValidation(validatePassword(value));
            }
        },
        [validatePassword]
    );

    /**
     * Checks if all required fields are filled and valid
     * @returns {boolean} True if form is valid
     */
    const isFormValid = useCallback(() => {
        const baseFieldsFilled =
            formData.fullName.trim().length >= 2 &&
            formData.fullName.trim().length <= 100 &&
            formData.email.trim() !== "" &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
            formData.password !== "" &&
            formData.confirmPassword !== "" &&
            formData.password === formData.confirmPassword &&
            Object.values(passwordValidation).every((v) => v === true) &&
            selectedRole !== "" &&
            termsAccepted;

        // Additional validation for employer role
        if (selectedRole === "employer") {
            return (
                baseFieldsFilled &&
                formData.companyName.trim() !== "" &&
                formData.industry !== "" &&
                formData.companySize !== "" &&
                formData.location.trim() !== ""
            );
        }

        return baseFieldsFilled;
    }, [formData, passwordValidation, selectedRole, termsAccepted]);

    /**
     * Handles form submission
     * @param {Event} e - The form submit event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            console.log("Form submitted:", { ...formData, role: selectedRole });
            setIsLoading(false);
            alert("Registration successful! Please check your email to verify your account.");
        }, 3000);
    };

    /**
     * Handles social login (Google/LinkedIn)
     * @param {string} provider - The social login provider
     */
    const handleSocialLogin = (provider) => {
        console.log(`${provider} login initiated`);
        alert(`${provider} login will be implemented`);
    };

    const hasPasswordError = formData.confirmPassword && formData.password !== formData.confirmPassword;

    return (
        <div className="register-form__container">
            <div className="register-form__card">
                {/* Header */}
                <div className="register-form__header">
                    <h2 className="register-form__title">Create Your Account</h2>
                    <p className="register-form__subtitle">Start your journey in less than 2 minutes</p>
                </div>

                {/* Role Selection */}
                <div className="register-form__role-selection">
                    <RoleCard
                        icon="fa-solid fa-bullseye"
                        title="Job Seeker"
                        description="Find opportunities"
                        isSelected={selectedRole === "jobseeker"}
                        onClick={() => setSelectedRole("jobseeker")}
                    />
                    <RoleCard
                        icon="fa-solid fa-briefcase"
                        title="Employer"
                        description="Hire top talent"
                        isSelected={selectedRole === "employer"}
                        onClick={() => setSelectedRole("employer")}
                    />
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="register-form__form">
                    {/* Common Fields */}
                    <FormInput
                        icon="fa-solid fa-user"
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                    />

                    <FormInput
                        icon="fa-solid fa-envelope"
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />

                    <FormInput
                        icon="fa-solid fa-lock"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        showPasswordToggle
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                        required
                    />
                    {/* Password Strength Requirements */}
                    {formData.password && (
                        <div className="register-form__password-requirements">
                            <p className="register-form__requirements-title">Password must contain:</p>
                            <ul className="register-form__requirements-list">
                                <li className={passwordValidation.minLength ? "register-form__requirement-item--valid" : ""}>
                                    <i className={`fa-solid ${passwordValidation.minLength ? "fa-check" : "fa-xmark"} register-form__requirement-icon`} />
                                    At least 8 characters
                                </li>
                                <li className={passwordValidation.hasUppercase ? "register-form__requirement-item--valid" : ""}>
                                    <i className={`fa-solid ${passwordValidation.hasUppercase ? "fa-check" : "fa-xmark"} register-form__requirement-icon`} />
                                    One uppercase letter
                                </li>
                                <li className={passwordValidation.hasLowercase ? "register-form__requirement-item--valid" : ""}>
                                    <i className={`fa-solid ${passwordValidation.hasLowercase ? "fa-check" : "fa-xmark"} register-form__requirement-icon`} />
                                    One lowercase letter
                                </li>
                                <li className={passwordValidation.hasNumber ? "register-form__requirement-item--valid" : ""}>
                                    <i className={`fa-solid ${passwordValidation.hasNumber ? "fa-check" : "fa-xmark"} register-form__requirement-icon`} />
                                    One number
                                </li>
                                <li className={passwordValidation.hasSymbol ? "register-form__requirement-item--valid" : ""}>
                                    <i className={`fa-solid ${passwordValidation.hasSymbol ? "fa-check" : "fa-xmark"} register-form__requirement-icon`} />
                                    One special character
                                </li>
                            </ul>
                        </div>
                    )}

                    <FormInput
                        icon="fa-solid fa-lock"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        hasError={hasPasswordError}
                        required
                    />
                    {/* Password Match Validation */}
                    {hasPasswordError && (
                        <p className="register-form__error-message">Passwords do not match</p>
                    )}



                    {/* Employer-specific Fields */}
                    {selectedRole === "employer" && (
                        <div className="register-form__employer-fields">
                            <FormInput
                                icon="fa-solid fa-building"
                                type="text"
                                name="companyName"
                                placeholder="Company Name"
                                value={formData.companyName}
                                onChange={handleInputChange}
                                required
                            />

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

                            <FormInput
                                icon="fa-solid fa-location-dot"
                                type="text"
                                name="location"
                                placeholder="Location"
                                value={formData.location}
                                onChange={handleInputChange}
                                required
                            />

                            <FormInput
                                icon="fa-solid fa-globe"
                                type="url"
                                name="website"
                                placeholder="Website (optional)"
                                value={formData.website}
                                onChange={handleInputChange}
                            />

                            <FormTextarea
                                icon="fa-solid fa-file-lines"
                                name="companyDescription"
                                placeholder="Company Description (optional)"
                                value={formData.companyDescription}
                                onChange={handleInputChange}
                                rows={4}
                            />
                        </div>
                    )}

                    {/* Terms and Conditions */}
                    <div className="register-form__terms-container">
                        <label className="register-form__terms-label">
                            <input
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                className="register-form__terms-checkbox"
                            />
                            <span>
                                I agree to the{" "}
                                <a href="/terms" target="_blank" rel="noopener noreferrer" className="register-form__terms-link">
                                    Terms and Conditions
                                </a>
                            </span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!isFormValid() || isLoading}
                        className={`register-form__submit-button ${isLoading ? "register-form__submit-button--loading" : ""}`}
                    >
                        {isLoading ? (
                            <>
                                <i className="fa-regular fa-paper-plane"></i>
                                Sending...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-envelope" />
                                Create Account
                            </>
                        )}
                    </button>

                    <div className="register-form__sign-in-link">
                        <p className="register-form__sign-in-text">Already have an account?</p>
                        <a href="#signin" className="register-form__sign-in-anchor">Sign in instead</a>
                    </div>

                    <div className="register-form__divider">
                        <span>Or continue with</span>
                    </div>

                    <div className="register-form__social-login">
                        <div className="register-form__social-buttons">
                            <button
                                type="button"
                                onClick={() => handleSocialLogin("Google")}
                                className="register-form__social-button"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Google
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSocialLogin("LinkedIn")}
                                className="register-form__social-button"
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                LinkedIn
                            </button>
                        </div>
                    </div>

                    <p className="register-form__terms-text">
                        By creating an account, you agree to our{" "}
                        <a href="#terms" className="register-form__terms-link">Terms of Service</a> and{" "}
                        <a href="#privacy" className="register-form__terms-link">Privacy Policy</a>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default RegisterForm;