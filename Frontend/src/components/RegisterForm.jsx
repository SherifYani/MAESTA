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
import { useNavigate } from "react-router-dom";

/**
 * RegisterForm Component
 * @description Renders the complete registration form with role selection and validation
 * @returns {JSX.Element} The rendered registration form component
 */
function RegisterForm() {

    const navigate = useNavigate();
    // Form state management
    const [selectedRole, setSelectedRole] = useState("");
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
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

    // Phone number validation state
    const [phoneValidation, setPhoneValidation] = useState({
        isValid: false,
        errorMessage: "",
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
     * Validates phone number format
     * @param {string} phone - The phone number to validate
     * @returns {Object} Validation result with isValid boolean and error message
     */
    const validatePhoneNumber = useCallback((phone) => {
        // Remove all non-digit characters except + for international numbers
        const cleanedPhone = phone.replace(/[^\d+]/g, '');

        // Basic phone number validation patterns
        const patterns = {
            international: /^\+[1-9]\d{1,14}$/, // E.164 format
            usCanada: /^(\+1\s?)?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/,
            general: /^[\+]?[(]?[\d\s\(\)\-]{10,}$/ // General pattern for most countries
        };

        if (!phone.trim()) {
            return { isValid: false, errorMessage: "Phone number is required" };
        }

        if (phone.length < 10) {
            return { isValid: false, errorMessage: "Phone number is too short" };
        }

        if (phone.length > 20) {
            return { isValid: false, errorMessage: "Phone number is too long" };
        }

        // Check if phone contains only valid characters
        const validChars = /^[\d\s\(\)\-\+\.]+$/;
        if (!validChars.test(phone)) {
            return { isValid: false, errorMessage: "Invalid characters in phone number" };
        }

        // Check against patterns
        const isValid = patterns.international.test(cleanedPhone) ||
            patterns.usCanada.test(phone) ||
            patterns.general.test(phone);

        if (!isValid) {
            return { isValid: false, errorMessage: "Please enter a valid phone number" };
        }

        return { isValid: true, errorMessage: "" };
    }, []);

    /**
     * Formats phone number as user types
     * @param {string} phone - The raw phone number input
     * @returns {string} Formatted phone number
     */
    const formatPhoneNumber = useCallback((phone) => {
        // Remove all non-digit characters
        const numbers = phone.replace(/\D/g, '');

        // US/Canada formatting
        if (numbers.length <= 3) {
            return numbers;
        } else if (numbers.length <= 6) {
            return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
        } else {
            return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
        }
    }, []);

    /**
     * Handles input changes and updates form state
     * @param {Event} e - The input change event
     */
    const handleInputChange = useCallback(
        (e) => {
            const { name, value } = e.target;
            let processedValue = value;

            // Handle phone number formatting and validation
            if (name === "phoneNumber") {
                // Format phone number as user types
                processedValue = formatPhoneNumber(value);

                // Validate phone number
                const validation = validatePhoneNumber(processedValue);
                setPhoneValidation(validation);
            }

            // Validate password in real-time
            if (name === "password") {
                setPasswordValidation(validatePassword(value));
            }

            setFormData((prev) => ({ ...prev, [name]: processedValue }));
        },
        [validatePassword, validatePhoneNumber, formatPhoneNumber]
    );

    /**
     * Handles phone number blur event for final validation
     * @param {Event} e - The blur event
     */
    const handlePhoneBlur = useCallback((e) => {
        const { value } = e.target;
        const validation = validatePhoneNumber(value);
        setPhoneValidation(validation);
    }, [validatePhoneNumber]);

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
            formData.phoneNumber.trim() !== "" &&
            phoneValidation.isValid &&
            formData.password !== "" &&
            formData.confirmPassword !== "" &&
            formData.password === formData.confirmPassword &&
            Object.values(passwordValidation).every((v) => v === true) &&
            selectedRole !== "" &&
            termsAccepted;

        return baseFieldsFilled;
    }, [formData, passwordValidation, phoneValidation, selectedRole, termsAccepted]);

    /**
     * Handles form submission
     * @param {Event} e - The form submit event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final phone validation before submission
        const finalPhoneValidation = validatePhoneNumber(formData.phoneNumber);
        setPhoneValidation(finalPhoneValidation);

        if (!finalPhoneValidation.isValid) {
            alert("Please fix the phone number error before submitting.");
            return;
        }

        setIsLoading(true);

        // Store the selected role for onboarding
        localStorage.setItem("userRole", selectedRole);

        // Simulate API call
        setTimeout(() => {
            console.log("Form submitted:", { ...formData, role: selectedRole });
            setIsLoading(false);
            alert("Registration successful! Please check your email to verify your account.");

            // Navigate to onboarding after successful registration
            navigate("/register/onboarding");
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
                        isSelected={selectedRole === "jobseeker"}
                        onClick={() => setSelectedRole("jobseeker")}
                    />
                    <RoleCard
                        icon="fa-solid fa-briefcase"
                        title="Employer"
                        isSelected={selectedRole === "employer"}
                        onClick={() => setSelectedRole("employer")}
                    />
                    <RoleCard
                        icon="fa-solid fa-user-tie"
                        title="Freelancer"
                        isSelected={selectedRole === "freelancer"}
                        onClick={() => setSelectedRole("freelancer")}
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

                    {/* Phone Number Field */}
                    <FormInput
                        icon="fa-solid fa-phone"
                        type="tel"
                        name="phoneNumber"
                        placeholder="Phone Number (e.g., (123) 456-7890)"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        onBlur={handlePhoneBlur}
                        hasError={!phoneValidation.isValid && formData.phoneNumber !== ""}
                        required
                    />
                    {/* Phone Number Validation Error */}
                    {!phoneValidation.isValid && formData.phoneNumber !== "" && (
                        <p className="register-form__error-message">
                            <i className="fa-solid fa-exclamation-triangle" />
                            {phoneValidation.errorMessage}
                        </p>
                    )}

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
                        <p className="register-form__error-message">
                            <i className="fa-solid fa-exclamation-triangle" />
                            Passwords do not match
                        </p>
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
                                <i className="fa-brands fa-google register-form__social-button-icon"></i>
                                Google
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSocialLogin("LinkedIn")}
                                className="register-form__social-button"
                            >
                                <i className="fa-brands fa-linkedin register-form__social-button-icon"></i>
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