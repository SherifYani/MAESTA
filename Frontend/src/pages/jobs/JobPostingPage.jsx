/**
 * @file JobPostingPage.jsx
 * @description Job posting page for companies to create new job listings
 * @author Sherif Talaat
 * @date 2026-02-05
 * 
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-16
 */



import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jobService from '../../services/jobService';
import { PageContainer } from '../../components/layout';
import GeneralSelect from '../../components/common/GeneralSelect';
import styles from './JobPostingPage.module.css';

/**
 * Job posting page for companies to create new job listings
 * @component
 * @returns {JSX.Element} The job posting page component
 */
const JobPostingPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        responsibilities: '',
        location: '',
        jobType: 'full-time',
        experienceLevel: 'mid',
        salaryMin: '',
        salaryMax: '',
        salaryCurrency: 'USD',
        skills: [],
        benefits: [],
        deadline: '',
        isRemote: false
    });

    const [skillInput, setSkillInput] = useState('');
    const [benefitInput, setBenefitInput] = useState('');

    /**
     * Handles input changes for form fields
     * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>} e - The change event
     */
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    /**
     * Adds a skill to the skills list
     */
    const addSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, skillInput.trim()]
            }));
            setSkillInput('');
        }
    };

    /**
     * Removes a skill from the skills list
     * @param {string} skill - The skill to remove
     */
    const removeSkill = (skill) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skill)
        }));
    };

    /**
     * Adds a benefit to the benefits list
     */
    const addBenefit = () => {
        if (benefitInput.trim() && !formData.benefits.includes(benefitInput.trim())) {
            setFormData(prev => ({
                ...prev,
                benefits: [...prev.benefits, benefitInput.trim()]
            }));
            setBenefitInput('');
        }
    };

    /**
     * Removes a benefit from the benefits list
     * @param {string} benefit - The benefit to remove
     */
    const removeBenefit = (benefit) => {
        setFormData(prev => ({
            ...prev,
            benefits: prev.benefits.filter(b => b !== benefit)
        }));
    };

    /**
     * Validates the current step
     * @param {number} step - The step number to validate
     * @returns {boolean} Whether the step is valid
     */
    const validateStep = (step) => {
        switch (step) {
            case 1:
                return formData.title && formData.description;
            case 2:
                return formData.location && formData.jobType;
            case 3:
                return true;
            default:
                return true;
        }
    };

    /**
     * Handles navigation to the next step
     */
    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        } else {
            setError('Please fill in all required fields');
        }
    };

    /**
     * Handles navigation to the previous step
     */
    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
        setError(null);
    };

    /**
     * Handles form submission
     * @param {React.FormEvent<HTMLFormElement>} e - The form submit event
     * @returns {Promise<void>}
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError(null);

            const jobData = {
                ...formData,
                salary: formData.salaryMin && formData.salaryMax
                    ? `${formData.salaryCurrency} ${formData.salaryMin} - ${formData.salaryMax}`
                    : null
            };

            await jobService.createJob(jobData);
            navigate('/dashboard', {
                state: {
                    message: 'Job posted successfully!',
                    type: 'success'
                }
            });
        } catch (err) {
            setError(err.message || 'Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Renders the current step content
     * @returns {JSX.Element} The step content
     */
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>Job Details</h2>

                        <div className={styles.formGroup}>
                            <label htmlFor="title">Job Title *</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., Senior Frontend Developer"
                                required
                                aria-required="true"
                                aria-label="Job title"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="description">Job Description *</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
                                rows={8}
                                required
                                aria-required="true"
                                aria-label="Job description"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="requirements">Requirements</label>
                            <textarea
                                id="requirements"
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleInputChange}
                                placeholder="List the qualifications and experience required..."
                                rows={5}
                                aria-label="Job requirements"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="responsibilities">Responsibilities</label>
                            <textarea
                                id="responsibilities"
                                name="responsibilities"
                                value={formData.responsibilities}
                                onChange={handleInputChange}
                                placeholder="List the main responsibilities..."
                                rows={5}
                                aria-label="Job responsibilities"
                            />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>Job Configuration</h2>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="location">Location *</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="e.g., New York, NY"
                                    required
                                    aria-required="true"
                                    aria-label="Job location"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="jobType">Job Type *</label>
                                <GeneralSelect
                                    value={formData.jobType || "full-time"}
                                    onChange={(selectedValue) => handleInputChange({ target: { name: "jobType", value: selectedValue } })}
                                    options={[
                                        { value: "full-time", label: "Full Time" },
                                        { value: "part-time", label: "Part Time" },
                                        { value: "contract", label: "Contract" },
                                        { value: "internship", label: "Internship" }
                                    ]}
                                    aria-label="Job type"
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="experienceLevel">Experience Level</label>
                                <GeneralSelect
                                    value={formData.experienceLevel || "entry"}
                                    onChange={(selectedValue) => handleInputChange({ target: { name: "experienceLevel", value: selectedValue } })}
                                    options={[
                                        { value: "entry", label: "Entry Level" },
                                        { value: "mid", label: "Mid Level" },
                                        { value: "senior", label: "Senior Level" },
                                        { value: "executive", label: "Executive" }
                                    ]}
                                    aria-label="Experience level"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="deadline">Application Deadline</label>
                                <input
                                    type="date"
                                    id="deadline"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleInputChange}
                                    aria-label="Application deadline"
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="isRemote"
                                    checked={formData.isRemote}
                                    onChange={handleInputChange}
                                    aria-label="Remote position"
                                />
                                This is a remote position
                            </label>
                        </div>

                        <div className={styles.salarySection}>
                            <label htmlFor="salaryCurrency">Salary Range</label>
                            <div className={styles.salaryInputs}>
                                <GeneralSelect
                                    value={formData.salaryCurrency || "USD"}
                                    onChange={(selectedValue) => handleInputChange({ target: { name: "salaryCurrency", value: selectedValue } })}
                                    options={[
                                        { value: "USD", label: "USD" },
                                        { value: "EUR", label: "EUR" },
                                        { value: "GBP", label: "GBP" },
                                        { value: "EGP", label: "EGP" }
                                    ]}
                                    aria-label="Salary currency"
                                />
                                <input
                                    type="number"
                                    id="salaryMin"
                                    name="salaryMin"
                                    value={formData.salaryMin}
                                    onChange={handleInputChange}
                                    placeholder="Min"
                                    aria-label="Minimum salary"
                                />
                                <span className={styles.salarySeparator} aria-hidden="true">to</span>
                                <input
                                    type="number"
                                    id="salaryMax"
                                    name="salaryMax"
                                    value={formData.salaryMax}
                                    onChange={handleInputChange}
                                    placeholder="Max"
                                    aria-label="Maximum salary"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>Skills & Benefits</h2>

                        <div className={styles.formGroup}>
                            <label htmlFor="skillInput">Required Skills</label>
                            <div className={styles.tagInput}>
                                <input
                                    type="text"
                                    id="skillInput"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                    placeholder="Type a skill and press Enter"
                                    aria-label="Add new skill"
                                />
                                <button
                                    type="button"
                                    onClick={addSkill}
                                    aria-label="Add skill"
                                >
                                    Add
                                </button>
                            </div>
                            <div className={styles.tags} role="list" aria-label="Required skills">
                                {formData.skills.map((skill, index) => (
                                    <span key={index} className={styles.tag} role="listitem">
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => removeSkill(skill)}
                                            aria-label={`Remove ${skill} skill`}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="benefitInput">Benefits</label>
                            <div className={styles.tagInput}>
                                <input
                                    type="text"
                                    id="benefitInput"
                                    value={benefitInput}
                                    onChange={(e) => setBenefitInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                                    placeholder="e.g., Health insurance, Remote work..."
                                    aria-label="Add new benefit"
                                />
                                <button
                                    type="button"
                                    onClick={addBenefit}
                                    aria-label="Add benefit"
                                >
                                    Add
                                </button>
                            </div>
                            <div className={styles.tags} role="list" aria-label="Job benefits">
                                {formData.benefits.map((benefit, index) => (
                                    <span key={index} className={styles.tag} role="listitem">
                                        {benefit}
                                        <button
                                            type="button"
                                            onClick={() => removeBenefit(benefit)}
                                            aria-label={`Remove ${benefit} benefit`}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <PageContainer>
            <header className={styles.header}>
                <h1 className={styles.title}>Post a New Job</h1>
                <p className={styles.subtitle}>Fill in the details to create a new job listing</p>
            </header>

            <nav className={styles.progressBar} aria-label="Job posting progress">
                {[1, 2, 3].map((step) => (
                    <div
                        key={step}
                        className={`${styles.progressStep} ${currentStep >= step ? styles.progressStepActive : ''}`}
                        onClick={() => step < currentStep && setCurrentStep(step)}
                        onKeyDown={(e) => {
                            if (step < currentStep && (e.key === 'Enter' || e.key === ' ')) {
                                e.preventDefault();
                                setCurrentStep(step);
                            }
                        }}
                        role="button"
                        tabIndex={step < currentStep ? 0 : -1}
                        aria-label={`Step ${step}: ${step === 1 ? 'Details' : step === 2 ? 'Configuration' : 'Skills'}`}
                        aria-current={currentStep === step ? 'step' : undefined}
                    >
                        <div className={styles.stepNumber} aria-hidden="true">{step}</div>
                        <span className={styles.stepLabel}>
                            {step === 1 ? 'Details' : step === 2 ? 'Configuration' : 'Skills'}
                        </span>
                    </div>
                ))}
            </nav>

            {error && (
                <div className={styles.errorAlert} role="alert">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
                {renderStep()}

                <div className={styles.formActions}>
                    {currentStep > 1 && (
                        <button
                            type="button"
                            className={styles.backButton}
                            onClick={handleBack}
                            aria-label="Go back to previous step"
                        >
                            Back
                        </button>
                    )}

                    {currentStep < 3 ? (
                        <button
                            type="button"
                            className={styles.nextButton}
                            onClick={handleNext}
                            aria-label="Go to next step"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                            aria-label={loading ? 'Posting job...' : 'Post job'}
                        >
                            {loading ? 'Posting...' : 'Post Job'}
                        </button>
                    )}
                </div>
            </form>
        </PageContainer>
    );
};

export default JobPostingPage;