/**
 * @file GigPostForm.jsx
 * @description Multi-step form for clients to post new gigs.
 * @author Sherif Talaat
 * @version 1.0.1
 * @date 2026-02-05
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-16
 */

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    Briefcase,
    List,
    DollarSign,
    Check,
    ChevronRight,
    ChevronLeft,
    Save,
    Clock,
    Tag,
    User,
    AlertCircle
} from 'lucide-react';
import { Button, Input, LoadingSpinner } from '../common';
import GeneralSelect from '../common/GeneralSelect';
import styles from './GigPostForm.module.css';

/**
 * Step configuration for the multi-step form.
 * @type {Array<Object>}
 */
const STEPS = [
    {
        id: 1,
        title: 'Basic Details',
        description: 'Title, category, and description',
        icon: Briefcase
    },
    {
        id: 2,
        title: 'Requirements',
        description: 'Skills and experience level',
        icon: List
    },
    {
        id: 3,
        title: 'Budget & Timeline',
        description: 'Budget type, range, and duration',
        icon: DollarSign
    },
    {
        id: 4,
        title: 'Review & Submit',
        description: 'Review all details before posting',
        icon: Check
    }
];

/**
 * Categories for gig posting.
 * @type {Array<string>}
 */
const GIG_CATEGORIES = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Graphic Design',
    'Content Writing',
    'Digital Marketing',
    'Social Media Management',
    'Data Analysis',
    'Product Management',
    'Customer Support',
    'Sales & Business Development',
    'Other'
];

/**
 * Experience levels for gigs.
 * @type {Array<string>}
 */
const EXPERIENCE_LEVELS = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'expert', label: 'Expert' }
];

/**
 * Budget types for gigs.
 * @type {Array<Object>}
 */
const BUDGET_TYPES = [
    { value: 'fixed', label: 'Fixed Price', description: 'One-time payment for the entire project' },
    { value: 'hourly', label: 'Hourly Rate', description: 'Payment based on hours worked' }
];

/**
 * Multi-step gig posting wizard.
 * @param {Object} props - Component props.
 * @param {Object} [props.initialData] - Initial data for editing existing gig.
 * @param {function} props.onSubmit - Submit handler function.
 * @param {function} [props.onSaveDraft] - Draft save handler function.
 * @param {function} [props.onCancel] - Cancel handler function.
 * @param {boolean} [props.isSubmitting=false] - Whether form is submitting.
 * @param {string} [props.error] - Form submission error.
 * @returns {JSX.Element} The rendered gig post form component.
 */
const GigPostForm = ({
    initialData,
    onSubmit,
    onSaveDraft,
    onCancel,
    isSubmitting = false,
    error = null
}) => {
    // Form state
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        skills: [],
        experienceLevel: 'entry',
        duration: 30,
        budgetType: 'fixed',
        budgetMin: '',
        budgetMax: '',
        attachments: [],
        isPublic: true,
        ...initialData
    });

    // UI state
    const [skillInput, setSkillInput] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [isDraftSaving, setIsDraftSaving] = useState(false);

    /**
     * Validates the current step.
     * @param {number} step - Step number to validate.
     * @returns {Object} Validation errors object.
     */
    const validateStep = useCallback((step) => {
        const errors = {};

        switch (step) {
            case 1:
                if (!formData.title.trim()) {
                    errors.title = 'Title is required';
                } else if (formData.title.length > 100) {
                    errors.title = 'Title cannot exceed 100 characters';
                }

                if (!formData.category) {
                    errors.category = 'Category is required';
                }

                if (!formData.description.trim()) {
                    errors.description = 'Description is required';
                } else if (formData.description.length < 50) {
                    errors.description = 'Description must be at least 50 characters';
                } else if (formData.description.length > 5000) {
                    errors.description = 'Description cannot exceed 5000 characters';
                }
                break;

            case 2:
                if (formData.skills.length === 0) {
                    errors.skills = 'At least one skill is required';
                }
                break;

            case 3:
                if (!formData.duration || formData.duration < 1) {
                    errors.duration = 'Valid duration is required';
                }

                if (!formData.budgetMin) {
                    errors.budgetMin = 'Minimum budget is required';
                } else if (formData.budgetMin < 10) {
                    errors.budgetMin = 'Minimum budget must be at least $10';
                }

                if (formData.budgetMax && formData.budgetMax < formData.budgetMin) {
                    errors.budgetMax = 'Maximum budget must be greater than minimum';
                }
                break;

            default:
                break;
        }

        return errors;
    }, [formData]);

    /**
     * Handles input field changes.
     * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>} e - Change event.
     * @returns {void}
     */
    const handleChange = useCallback((e) => {
        const { name, value, type } = e.target;

        const updatedValue = type === 'number'
            ? (value === '' ? '' : parseInt(value) || 0)
            : value;

        setFormData(prev => ({
            ...prev,
            [name]: updatedValue
        }));

        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    }, [validationErrors]);

    /**
     * Handles skill addition via Enter key.
     * @param {React.KeyboardEvent<HTMLInputElement>} e - Keyboard event.
     * @returns {void}
     */
    const handleSkillKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();

            const skill = skillInput.trim();
            if (!formData.skills.includes(skill) && skill.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    skills: [...prev.skills, skill]
                }));

                // Clear skills validation error
                if (validationErrors.skills) {
                    setValidationErrors(prev => ({
                        ...prev,
                        skills: null
                    }));
                }
            }
            setSkillInput('');
        }
    }, [skillInput, formData.skills, validationErrors]);

    /**
     * Removes a skill from the list.
     * @param {string} skillToRemove - Skill to remove.
     * @returns {void}
     */
    const removeSkill = useCallback((skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    }, []);

    /**
     * Navigates to the next step with validation.
     * @returns {void}
     */
    const nextStep = useCallback(() => {
        const errors = validateStep(currentStep);

        if (Object.keys(errors).length === 0) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
            setValidationErrors({});
        } else {
            setValidationErrors(errors);
        }
    }, [currentStep, validateStep]);

    /**
     * Navigates to the previous step.
     * @returns {void}
     */
    const prevStep = useCallback(() => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    }, []);

    /**
     * Handles form submission.
     * @returns {Promise<void>}
     */
    const handleSubmit = useCallback(async () => {
        const finalValidation = validateStep(4);

        if (Object.keys(finalValidation).length === 0) {
            await onSubmit(formData);
        } else {
            setValidationErrors(finalValidation);
            // Scroll to first error
            const firstError = Object.keys(finalValidation)[0];
            const element = document.getElementById(firstError);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [formData, onSubmit, validateStep]);

    /**
     * Handles draft saving.
     * @returns {Promise<void>}
     */
    const handleSaveDraft = useCallback(async () => {
        setIsDraftSaving(true);
        try {
            await onSaveDraft?.(formData);
        } finally {
            setIsDraftSaving(false);
        }
    }, [formData, onSaveDraft]);

    /**
     * Formats budget range for display.
     * @returns {string} Formatted budget string.
     */
    const formatBudget = useCallback(() => {
        if (formData.budgetType === 'fixed') {
            if (formData.budgetMin && formData.budgetMax) {
                return `$${formData.budgetMin.toLocaleString()} - $${formData.budgetMax.toLocaleString()}`;
            }
            return formData.budgetMin ? `$${formData.budgetMin.toLocaleString()}` : 'Not set';
        } else {
            if (formData.budgetMin && formData.budgetMax) {
                return `$${formData.budgetMin}/hr - $${formData.budgetMax}/hr`;
            }
            return formData.budgetMin ? `$${formData.budgetMin}/hr` : 'Not set';
        }
    }, [formData.budgetType, formData.budgetMin, formData.budgetMax]);

    /**
     * Renders step 1: Basic Details.
     * @returns {JSX.Element} Step 1 content.
     */
    const renderStep1 = () => (
        <div className={styles.stepContainer}>
            <div className={styles.stepHeader}>
                <Briefcase size={24} className={styles.stepIcon} aria-hidden="true" />
                <h3 className={styles.stepTitle}>Tell us about your project</h3>
                <p className={styles.stepDescription}>
                    Start by giving your gig a clear title and detailed description.
                </p>
            </div>

            <div className={styles.formFields}>
                <div className={styles.fieldGroup}>
                    <label htmlFor="title" className={styles.label}>
                        Gig Title *
                    </label>
                    <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., React Developer needed for E-commerce website"
                        maxLength={100}
                        required
                        aria-required="true"
                        aria-invalid={!!validationErrors.title}
                        aria-describedby={validationErrors.title ? 'title-error' : undefined}
                        className={validationErrors.title ? styles.inputError : ''}
                    />
                    {validationErrors.title && (
                        <span id="title-error" className={styles.errorText}>
                            <AlertCircle size={12} aria-hidden="true" />
                            {validationErrors.title}
                        </span>
                    )}
                    <div className={styles.charCount}>
                        {formData.title.length}/100 characters
                    </div>
                </div>

                <div className={styles.fieldGroup}>
                    <label htmlFor="category" className={styles.label}>
                        Category *
                    </label>
                    <div className={styles.selectWrapper}>
                        <GeneralSelect
                            value={formData.category}
                            onChange={(selectedValue) => handleChange({ target: { name: "category", value: selectedValue } })}
                            options={[
                                { value: "", label: "Select a category" },
                                ...GIG_CATEGORIES.map(category => ({ value: category, label: category }))
                            ]}
                            className={`${styles.select} ${validationErrors.category ? styles.inputError : ''}`}
                            aria-label="Category"
                        />
                    </div>
                    {validationErrors.category && (
                        <span id="category-error" className={styles.errorText}>
                            <AlertCircle size={12} aria-hidden="true" />
                            {validationErrors.category}
                        </span>
                    )}
                </div>

                <div className={styles.fieldGroup}>
                    <label htmlFor="description" className={styles.label}>
                        Project Description *
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className={`${styles.textarea} ${validationErrors.description ? styles.inputError : ''}`}
                        placeholder="Describe your project in detail. Include goals, requirements, and any specific needs..."
                        rows={8}
                        maxLength={5000}
                        required
                        aria-required="true"
                        aria-invalid={!!validationErrors.description}
                        aria-describedby={validationErrors.description ? 'description-error' : undefined}
                    />
                    {validationErrors.description && (
                        <span id="description-error" className={styles.errorText}>
                            <AlertCircle size={12} aria-hidden="true" />
                            {validationErrors.description}
                        </span>
                    )}
                    <div className={styles.charCount}>
                        {formData.description.length}/5000 characters
                    </div>
                </div>
            </div>
        </div>
    );

    /**
     * Renders step 2: Requirements.
     * @returns {JSX.Element} Step 2 content.
     */
    const renderStep2 = () => (
        <div className={styles.stepContainer}>
            <div className={styles.stepHeader}>
                <List size={24} className={styles.stepIcon} aria-hidden="true" />
                <h3 className={styles.stepTitle}>Required skills and experience</h3>
                <p className={styles.stepDescription}>
                    Specify what skills and experience level you're looking for.
                </p>
            </div>

            <div className={styles.formFields}>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                        Required Skills *
                    </label>
                    <div className={styles.skillInputWrapper}>
                        <Input
                            type="text"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={handleSkillKeyDown}
                            placeholder="Type a skill and press Enter (e.g., React, Python, UX Design)"
                            className={validationErrors.skills ? styles.inputError : ''}
                            aria-describedby={validationErrors.skills ? 'skills-error' : undefined}
                        />
                    </div>
                    {validationErrors.skills && (
                        <span id="skills-error" className={styles.errorText}>
                            <AlertCircle size={12} aria-hidden="true" />
                            {validationErrors.skills}
                        </span>
                    )}

                    {formData.skills.length > 0 && (
                        <div className={styles.skillsList} aria-label="Selected skills">
                            {formData.skills.map((skill, index) => (
                                <div key={index} className={styles.skillTag}>
                                    <Tag size={12} aria-hidden="true" />
                                    <span className={styles.skillText}>{skill}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSkill(skill)}
                                        className={styles.removeSkill}
                                        aria-label={`Remove ${skill}`}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={styles.helpText}>
                        Add at least 3-5 relevant skills for best results
                    </div>
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                        Experience Level
                    </label>
                    <div className={styles.radioGroup}>
                        {EXPERIENCE_LEVELS.map(({ value, label }) => (
                            <label key={value} className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name="experienceLevel"
                                    value={value}
                                    checked={formData.experienceLevel === value}
                                    onChange={handleChange}
                                    className={styles.radioInput}
                                    aria-label={label}
                                />
                                <span className={styles.radioCustom}></span>
                                <span className={styles.radioText}>{label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    /**
     * Renders step 3: Budget & Timeline.
     * @returns {JSX.Element} Step 3 content.
     */
    const renderStep3 = () => (
        <div className={styles.stepContainer}>
            <div className={styles.stepHeader}>
                <DollarSign size={24} className={styles.stepIcon} aria-hidden="true" />
                <h3 className={styles.stepTitle}>Set budget and timeline</h3>
                <p className={styles.stepDescription}>
                    Define your budget and project duration.
                </p>
            </div>

            <div className={styles.formFields}>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                        Budget Type
                    </label>
                    <div className={styles.toggleGroup} role="radiogroup" aria-label="Select budget type">
                        {BUDGET_TYPES.map(({ value, label, description }) => (
                            <button
                                key={value}
                                type="button"
                                className={`${styles.toggleButton} ${formData.budgetType === value ? styles.toggleActive : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, budgetType: value }))}
                                aria-pressed={formData.budgetType === value}
                                aria-label={`${label}: ${description}`}
                            >
                                <div className={styles.toggleContent}>
                                    <span className={styles.toggleLabel}>{label}</span>
                                    <span className={styles.toggleDescription}>{description}</span>
                                </div>
                                {formData.budgetType === value && (
                                    <Check size={16} className={styles.toggleCheck} aria-hidden="true" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.fieldGroup}>
                        <label htmlFor="budgetMin" className={styles.label}>
                            Minimum Budget *
                        </label>
                        <div className={styles.inputGroup}>
                            <span className={styles.currencyPrefix}>$</span>
                            <Input
                                id="budgetMin"
                                name="budgetMin"
                                type="number"
                                value={formData.budgetMin}
                                onChange={handleChange}
                                placeholder="0"
                                min="10"
                                step="100"
                                className={validationErrors.budgetMin ? styles.inputError : ''}
                                aria-required="true"
                                aria-invalid={!!validationErrors.budgetMin}
                                aria-describedby={validationErrors.budgetMin ? 'budgetMin-error' : undefined}
                            />
                        </div>
                        {validationErrors.budgetMin && (
                            <span id="budgetMin-error" className={styles.errorText}>
                                <AlertCircle size={12} aria-hidden="true" />
                                {validationErrors.budgetMin}
                            </span>
                        )}
                    </div>

                    <div className={styles.fieldGroup}>
                        <label htmlFor="budgetMax" className={styles.label}>
                            Maximum Budget (Optional)
                        </label>
                        <div className={styles.inputGroup}>
                            <span className={styles.currencyPrefix}>$</span>
                            <Input
                                id="budgetMax"
                                name="budgetMax"
                                type="number"
                                value={formData.budgetMax}
                                onChange={handleChange}
                                placeholder="0"
                                min={formData.budgetMin || 10}
                                step="100"
                                className={validationErrors.budgetMax ? styles.inputError : ''}
                                aria-invalid={!!validationErrors.budgetMax}
                                aria-describedby={validationErrors.budgetMax ? 'budgetMax-error' : undefined}
                            />
                        </div>
                        {validationErrors.budgetMax && (
                            <span id="budgetMax-error" className={styles.errorText}>
                                <AlertCircle size={12} aria-hidden="true" />
                                {validationErrors.budgetMax}
                            </span>
                        )}
                    </div>
                </div>

                <div className={styles.fieldGroup}>
                    <label htmlFor="duration" className={styles.label}>
                        Project Duration (Days) *
                    </label>
                    <div className={styles.inputGroup}>
                        <Clock size={16} className={styles.inputIcon} aria-hidden="true" />
                        <Input
                            id="duration"
                            name="duration"
                            type="number"
                            value={formData.duration}
                            onChange={handleChange}
                            placeholder="30"
                            min="1"
                            max="365"
                            className={validationErrors.duration ? styles.inputError : ''}
                            aria-required="true"
                            aria-invalid={!!validationErrors.duration}
                            aria-describedby={validationErrors.duration ? 'duration-error' : undefined}
                        />
                    </div>
                    {validationErrors.duration && (
                        <span id="duration-error" className={styles.errorText}>
                            <AlertCircle size={12} aria-hidden="true" />
                            {validationErrors.duration}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    /**
     * Renders step 4: Review & Submit.
     * @returns {JSX.Element} Step 4 content.
     */
    const renderStep4 = () => (
        <div className={styles.stepContainer}>
            <div className={styles.stepHeader}>
                <Check size={24} className={styles.stepIcon} aria-hidden="true" />
                <h3 className={styles.stepTitle}>Review and submit your gig</h3>
                <p className={styles.stepDescription}>
                    Please review all details before posting.
                </p>
            </div>

            <div className={styles.reviewContainer}>
                <div className={styles.reviewSection}>
                    <h4 className={styles.reviewTitle}>
                        {formData.title || 'Untitled Gig'}
                    </h4>
                    <div className={styles.reviewCategory}>
                        <Tag size={14} aria-hidden="true" />
                        {formData.category || 'No category selected'}
                    </div>

                    <div className={styles.reviewDescription}>
                        <h5 className={styles.reviewSubtitle}>Description</h5>
                        <p className={styles.reviewText}>
                            {formData.description || 'No description provided'}
                        </p>
                    </div>
                </div>

                <div className={styles.reviewGrid}>
                    <div className={styles.reviewCard}>
                        <h5 className={styles.reviewCardTitle}>
                            <User size={16} aria-hidden="true" />
                            Requirements
                        </h5>
                        <div className={styles.reviewCardContent}>
                            <div className={styles.reviewItem}>
                                <strong>Experience Level:</strong>
                                <span>{EXPERIENCE_LEVELS.find(l => l.value === formData.experienceLevel)?.label || 'Not specified'}</span>
                            </div>
                            <div className={styles.reviewItem}>
                                <strong>Required Skills:</strong>
                                <div className={styles.reviewSkills}>
                                    {formData.skills.length > 0 ? (
                                        formData.skills.map((skill, index) => (
                                            <span key={index} className={styles.reviewSkill}>
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className={styles.noData}>No skills specified</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.reviewCard}>
                        <h5 className={styles.reviewCardTitle}>
                            <DollarSign size={16} aria-hidden="true" />
                            Budget & Timeline
                        </h5>
                        <div className={styles.reviewCardContent}>
                            <div className={styles.reviewItem}>
                                <strong>Budget Type:</strong>
                                <span>{BUDGET_TYPES.find(t => t.value === formData.budgetType)?.label || 'Not specified'}</span>
                            </div>
                            <div className={styles.reviewItem}>
                                <strong>Budget Range:</strong>
                                <span>{formatBudget()}</span>
                            </div>
                            <div className={styles.reviewItem}>
                                <strong>Duration:</strong>
                                <span>{formData.duration} days</span>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className={styles.errorBanner} role="alert">
                        <AlertCircle size={16} aria-hidden="true" />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </div>
    );

    /**
     * Renders current step content.
     * @returns {JSX.Element} Current step content.
     */
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return renderStep1();
            case 2:
                return renderStep2();
            case 3:
                return renderStep3();
            case 4:
                return renderStep4();
            default:
                return null;
        }
    };

    return (
        <div className={styles.container} role="form" aria-label="Post a new gig">
            {/* Progress Steps */}
            <aside className={styles.sidebar} aria-label="Form progress">
                <div className={styles.progressHeader}>
                    <h2 className={styles.progressTitle}>Post a New Gig</h2>
                    <div className={styles.progressIndicator}>
                        Step {currentStep} of {STEPS.length}
                    </div>
                </div>

                <div className={styles.stepsList}>
                    {STEPS.map((step) => {
                        const isActive = step.id === currentStep;
                        const isCompleted = step.id < currentStep;
                        const Icon = step.icon;

                        return (
                            <div
                                key={step.id}
                                className={`${styles.stepItem} ${isActive ? styles.stepItemActive : ''
                                    } ${isCompleted ? styles.stepItemCompleted : ''}`}
                                aria-current={isActive ? 'step' : undefined}
                            >
                                <div className={styles.stepIconWrapper}>
                                    {isCompleted ? (
                                        <Check size={16} aria-hidden="true" />
                                    ) : (
                                        <Icon size={16} aria-hidden="true" />
                                    )}
                                </div>
                                <div className={styles.stepContent}>
                                    <span className={styles.stepNumber}>Step {step.id}</span>
                                    <span className={styles.stepName}>{step.title}</span>
                                    <span className={styles.stepDesc}>{step.description}</span>
                                </div>
                                {step.id < STEPS.length && (
                                    <div className={styles.stepConnector} aria-hidden="true" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.content}>
                <header className={styles.header}>
                    <h1 className={styles.pageTitle}>
                        {STEPS[currentStep - 1].title}
                    </h1>

                    <div className={styles.headerActions}>
                        {onCancel && (
                            <Button
                                variant="ghost"
                                onClick={onCancel}
                                aria-label="Cancel gig posting"
                            >
                                Cancel
                            </Button>
                        )}

                        {onSaveDraft && (
                            <Button
                                variant="outline"
                                onClick={handleSaveDraft}
                                disabled={isDraftSaving}
                                className={styles.saveDraftButton}
                                aria-label="Save as draft"
                            >
                                {isDraftSaving ? (
                                    <LoadingSpinner size="small" />
                                ) : (
                                    <>
                                        <Save size={16} aria-hidden="true" />
                                        Save Draft
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </header>

                {/* Form Content */}
                <div className={styles.formArea}>
                    {renderStepContent()}
                </div>

                {/* Form Footer */}
                <footer className={styles.footer}>
                    <div className={styles.footerActions}>
                        {currentStep > 1 ? (
                            <Button
                                variant="secondary"
                                onClick={prevStep}
                                className={styles.navButton}
                                aria-label="Go to previous step"
                            >
                                <ChevronLeft size={16} aria-hidden="true" />
                                Back
                            </Button>
                        ) : (
                            <div /> // Spacer
                        )}

                        {currentStep < STEPS.length ? (
                            <Button
                                variant="primary"
                                onClick={nextStep}
                                className={styles.navButton}
                                aria-label="Go to next step"
                            >
                                Continue
                                <ChevronRight size={16} aria-hidden="true" />
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={styles.submitButton}
                                aria-label="Submit gig"
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoadingSpinner size="small" />
                                        Posting...
                                    </>
                                ) : (
                                    'Post Gig'
                                )}
                            </Button>
                        )}
                    </div>

                    <div className={styles.footerHelp}>
                        <p>
                            Need help? <button type="button" className={styles.helpLink}>View posting guidelines</button>
                        </p>
                    </div>
                </footer>
            </main>
        </div>
    );
};

GigPostForm.propTypes = {
    initialData: PropTypes.shape({
        title: PropTypes.string,
        category: PropTypes.string,
        description: PropTypes.string,
        skills: PropTypes.arrayOf(PropTypes.string),
        experienceLevel: PropTypes.oneOf(['entry', 'intermediate', 'expert']),
        duration: PropTypes.number,
        budgetType: PropTypes.oneOf(['fixed', 'hourly']),
        budgetMin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        budgetMax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        attachments: PropTypes.array,
        isPublic: PropTypes.bool
    }),
    onSubmit: PropTypes.func.isRequired,
    onSaveDraft: PropTypes.func,
    onCancel: PropTypes.func,
    isSubmitting: PropTypes.bool,
    error: PropTypes.string
};

export default GigPostForm;