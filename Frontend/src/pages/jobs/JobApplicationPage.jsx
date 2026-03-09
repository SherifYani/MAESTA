/**
 * @file JobApplicationPage.jsx
 * @description Job application page with form to submit cover letter and resume
 * @author Sherif Talaat
 * @date 2026-02-05
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-05
 */



import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import jobService from '../../services/jobService';
import { PageContainer } from '../../components/layout';
import styles from './JobApplicationPage.module.css';

/**
 * JobApplicationPage component for submitting job applications
 * @component
 * @returns {JSX.Element} The rendered job application page
 */
const JobApplicationPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        coverLetter: '',
        resume: null,
        portfolioUrl: '',
        expectedSalary: '',
        availableStartDate: '',
        additionalInfo: ''
    });

    useEffect(() => {
        fetchJobDetails();
    }, [jobId]);

    /**
     * Fetches job details from the API
     * @async
     * @returns {Promise<void>}
     */
    const fetchJobDetails = async () => {
        try {
            setLoading(true);
            const jobData = await jobService.getJobById(jobId);
            setJob(jobData);
        } catch (err) {
            setError('Failed to load job details');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles text input changes
     * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} e - The change event
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    /**
     * Handles file input changes with validation
     * @param {React.ChangeEvent<HTMLInputElement>} e - The file change event
     */
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            setFormData(prev => ({ ...prev, resume: file }));
        }
    };

    /**
     * Handles form submission
     * @param {React.FormEvent<HTMLFormElement>} e - The form submit event
     * @returns {Promise<void>}
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.coverLetter.trim()) {
            setError('Please write a cover letter');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const applicationData = new FormData();
            applicationData.append('coverLetter', formData.coverLetter);
            if (formData.resume) {
                applicationData.append('resume', formData.resume);
            }
            applicationData.append('portfolioUrl', formData.portfolioUrl);
            applicationData.append('expectedSalary', formData.expectedSalary);
            applicationData.append('availableStartDate', formData.availableStartDate);
            applicationData.append('additionalInfo', formData.additionalInfo);

            await jobService.applyToJob(jobId, applicationData);
            setSuccess(true);

            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to submit application');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className={styles.successContainer}>
                <div className={styles.successIcon}>✓</div>
                <h2>Application Submitted!</h2>
                <p>Your application has been sent successfully.</p>
                <p className={styles.redirectText}>Redirecting to dashboard...</p>
            </div>
        );
    }

    return (
        <PageContainer>
            <div className={styles.header}>
                <button
                    className={styles.backButton}
                    onClick={() => navigate(-1)}
                    aria-label="Go back to previous page"
                >
                    ← Back
                </button>
                <h1 className={styles.pageTitle}>Apply for Position</h1>
            </div>

            {job && (
                <div className={styles.jobSummary}>
                    <div className={styles.jobInfo}>
                        <h2 className={styles.jobTitle}>{job.title}</h2>
                        <p className={styles.companyName}>{job.company?.name}</p>
                        <p className={styles.location}>{job.location}</p>
                    </div>
                </div>
            )}

            {error && (
                <div className={styles.errorAlert} role="alert">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.applicationForm} noValidate>
                <div className={styles.formGroup}>
                    <label htmlFor="coverLetter">
                        Cover Letter <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        id="coverLetter"
                        name="coverLetter"
                        value={formData.coverLetter}
                        onChange={handleInputChange}
                        placeholder="Tell us why you're a great fit for this position..."
                        rows={8}
                        required
                        aria-required="true"
                        maxLength={2000}
                    />
                    <span className={styles.charCount}>
                        {formData.coverLetter.length} / 2000 characters
                    </span>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="resume">Resume / CV</label>
                    <div className={styles.fileUpload}>
                        <input
                            type="file"
                            id="resume"
                            name="resume"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            aria-describedby="fileTypes"
                        />
                        <div className={styles.fileUploadLabel}>
                            {formData.resume ? (
                                <span className={styles.fileName}>{formData.resume.name}</span>
                            ) : (
                                <>
                                    <span className={styles.uploadIcon} aria-hidden="true">📄</span>
                                    <span>Click to upload or drag and drop</span>
                                    <span className={styles.fileTypes} id="fileTypes">
                                        PDF, DOC, DOCX (max 5MB)
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="portfolioUrl">Portfolio / LinkedIn URL</label>
                    <input
                        type="url"
                        id="portfolioUrl"
                        name="portfolioUrl"
                        value={formData.portfolioUrl}
                        onChange={handleInputChange}
                        placeholder="https://..."
                    />
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="expectedSalary">Expected Salary</label>
                        <input
                            type="text"
                            id="expectedSalary"
                            name="expectedSalary"
                            value={formData.expectedSalary}
                            onChange={handleInputChange}
                            placeholder="e.g., $50,000 - $60,000"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="availableStartDate">Available Start Date</label>
                        <input
                            type="date"
                            id="availableStartDate"
                            name="availableStartDate"
                            value={formData.availableStartDate}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="additionalInfo">Additional Information</label>
                    <textarea
                        id="additionalInfo"
                        name="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={handleInputChange}
                        placeholder="Any other information you'd like to share..."
                        rows={4}
                    />
                </div>

                <div className={styles.formActions}>
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                </div>
            </form>
        </PageContainer>
    );
};

export default JobApplicationPage;