/**
 * @file BidForm.jsx
 * @description Form component for freelancers to submit a bid proposal.
 * @author Sherif Talaat
 * @date 2026-02-05
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-07
 */

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    DollarSign,
    Clock,
    FileText,
    Paperclip,
    X,
    AlertCircle
} from 'lucide-react';
import { Button, Input, LoadingSpinner } from '../common';
import styles from './BidForm.module.css';

/**
 * Bid submission form component.
 * @param {Object} props - Component props.
 * @param {string|number} props.gigId - ID of the gig.
 * @param {function} props.onSubmit - Submit handler function.
 * @param {function} props.onCancel - Cancel handler function.
 * @param {Object} [props.existingBid] - Pre-fill data if editing existing bid.
 * @returns {JSX.Element} The rendered bid form component.
 */
const BidForm = ({ gigId, onSubmit, onCancel, existingBid = null }) => {
    // Form state
    const [formData, setFormData] = useState({
        amount: '',
        duration: '',
        coverLetter: '',
        attachments: []
    });

    // Component state
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    /**
     * Pre-fill form with existing bid data.
     * @returns {void}
     */
    useEffect(() => {
        if (existingBid) {
            setFormData({
                amount: existingBid.amount,
                duration: existingBid.duration,
                coverLetter: existingBid.coverLetter,
                attachments: existingBid.attachments || []
            });
        }
    }, [existingBid]);

    /**
     * Validates the form data.
     * @returns {boolean} True if validation passes, false otherwise.
     */
    const validate = useCallback(() => {
        const newErrors = {};
        const { amount, duration, coverLetter } = formData;

        // Validate amount
        if (!amount || amount <= 0) {
            newErrors.amount = 'Valid bid amount is required';
        } else if (amount < 5) {
            newErrors.amount = 'Minimum bid amount is $5';
        }

        // Validate duration
        if (!duration || duration <= 0) {
            newErrors.duration = 'Estimated duration is required';
        } else if (duration > 365) {
            newErrors.duration = 'Maximum duration is 365 days';
        }

        // Validate cover letter
        if (!coverLetter || coverLetter.trim().length === 0) {
            newErrors.coverLetter = 'Cover letter is required';
        } else if (coverLetter.length < 50) {
            newErrors.coverLetter = 'Cover letter must be at least 50 characters';
        } else if (coverLetter.length > 2000) {
            newErrors.coverLetter = 'Cover letter cannot exceed 2000 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    /**
     * Handles input field changes.
     * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} e - The change event.
     * @returns {void}
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        const sanitizedValue = name === 'amount' || name === 'duration'
            ? Math.max(0, parseFloat(value) || '')
            : value;

        setFormData(prev => ({
            ...prev,
            [name]: sanitizedValue
        }));

        // Clear error for this field if it exists
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    /**
     * Handles file attachment changes.
     * @param {React.ChangeEvent<HTMLInputElement>} e - The file input change event.
     * @returns {void}
     */
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png'
        ];

        const validFiles = files.filter(file => {
            if (file.size > maxSize) {
                return false;
            }
            if (!allowedTypes.includes(file.type)) {
                return false;
            }
            return true;
        });

        const invalidFiles = files.filter(file => !validFiles.includes(file));

        if (invalidFiles.length > 0) {
            // Show error message for invalid files
            setErrors(prev => ({
                ...prev,
                attachments: 'Some files were skipped. Only PDF, DOC, JPEG, PNG files under 5MB are allowed.'
            }));
        }

        if (validFiles.length > 0) {
            setFormData(prev => ({
                ...prev,
                attachments: [...prev.attachments, ...validFiles]
            }));

            // Clear attachment error if it exists
            if (errors.attachments) {
                setErrors(prev => ({
                    ...prev,
                    attachments: null
                }));
            }
        }
    };

    /**
     * Removes an attachment from the list.
     * @param {number} index - The index of the attachment to remove.
     * @returns {void}
     */
    const removeAttachment = (index) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    /**
     * Handles form submission.
     * @param {React.FormEvent<HTMLFormElement>} e - The form submit event.
     * @returns {Promise<void>}
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit(gigId, formData);
            // Reset form on successful submission if not editing
            if (!existingBid) {
                setFormData({
                    amount: '',
                    duration: '',
                    coverLetter: '',
                    attachments: []
                });
            }
        } catch (error) {
            setErrors({
                submit: error.message || 'Failed to submit bid. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Toggles preview mode.
     * @returns {void}
     */
    const togglePreviewMode = () => {
        if (validate()) {
            setPreviewMode(!previewMode);
        }
    };

    /**
     * Calculates total attachment size in MB.
     * @returns {string} Total size formatted in MB.
     */
    const calculateTotalSize = () => {
        const totalBytes = formData.attachments.reduce((total, file) => total + file.size, 0);
        return (totalBytes / (1024 * 1024)).toFixed(2);
    };

    // Render preview mode
    if (previewMode) {
        return (
            <div
                className={styles.container}
                role="region"
                aria-label="Bid proposal preview"
            >
                <h2 className={styles.title}>Review Your Proposal</h2>

                <div className={styles.previewContent}>
                    <div className={styles.previewRow}>
                        <span className={styles.label}>Bid Amount:</span>
                        <span className={styles.value}>${formData.amount}</span>
                    </div>

                    <div className={styles.previewRow}>
                        <span className={styles.label}>Duration:</span>
                        <span className={styles.value}>{formData.duration} days</span>
                    </div>

                    <div className={styles.previewSection}>
                        <span className={styles.label}>Cover Letter:</span>
                        <p className={styles.previewText}>{formData.coverLetter}</p>
                        <div className={styles.charCount}>
                            {formData.coverLetter.length} characters
                        </div>
                    </div>

                    {formData.attachments.length > 0 && (
                        <div className={styles.previewSection}>
                            <span className={styles.label}>Attachments:</span>
                            <ul
                                className={styles.attachmentList}
                                aria-label="Attached files"
                            >
                                {formData.attachments.map((file, index) => (
                                    <li key={index} className={styles.attachmentItem}>
                                        <FileText
                                            size={16}
                                            aria-hidden="true"
                                            className={styles.fileIcon}
                                        />
                                        <span className={styles.fileName}>{file.name}</span>
                                        <span className={styles.fileSize}>
                                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <div className={styles.totalSize}>
                                Total size: {calculateTotalSize()} MB
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.actions}>
                    <Button
                        variant="secondary"
                        onClick={togglePreviewMode}
                        aria-label="Return to edit mode"
                    >
                        Edit Proposal
                    </Button>

                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        aria-label="Confirm and submit proposal"
                    >
                        {isSubmitting ? (
                            <>
                                <LoadingSpinner size="small" />
                                Submitting...
                            </>
                        ) : (
                            'Confirm & Submit'
                        )}
                    </Button>
                </div>
            </div>
        );
    }

    // Render form mode
    return (
        <form
            className={styles.container}
            onSubmit={handleSubmit}
            noValidate
            aria-labelledby="bid-form-title"
        >
            <div className={styles.header}>
                <h2
                    id="bid-form-title"
                    className={styles.title}
                >
                    {existingBid ? 'Edit Proposal' : 'Submit a Proposal'}
                </h2>

                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onCancel}
                    aria-label="Close bid form"
                >
                    <X size={24} aria-hidden="true" />
                </button>
            </div>

            {errors.submit && (
                <div
                    className={styles.errorBanner}
                    role="alert"
                    aria-live="assertive"
                >
                    <AlertCircle size={20} aria-hidden="true" />
                    <span>{errors.submit}</span>
                </div>
            )}

            <div className={styles.gridRow}>
                <div className={styles.fieldGroup}>
                    <label
                        htmlFor="bid-amount"
                        className={styles.label}
                    >
                        Bid Amount ($)
                    </label>

                    <div className={styles.inputWrapper}>
                        <DollarSign
                            size={16}
                            className={styles.inputIcon}
                            aria-hidden="true"
                        />

                        <Input
                            id="bid-amount"
                            name="amount"
                            type="number"
                            className={errors.amount ? styles.isInvalid : ''}
                            value={formData.amount}
                            onChange={handleChange}
                            placeholder="0.00"
                            min="5"
                            step="0.01"
                            required
                            aria-required="true"
                            aria-invalid={!!errors.amount}
                            aria-describedby={errors.amount ? 'amount-error' : undefined}
                        />
                    </div>

                    {errors.amount && (
                        <span
                            id="amount-error"
                            className={styles.errorText}
                        >
                            {errors.amount}
                        </span>
                    )}
                </div>

                <div className={styles.fieldGroup}>
                    <label
                        htmlFor="bid-duration"
                        className={styles.label}
                    >
                        Estimated Duration (Days)
                    </label>

                    <div className={styles.inputWrapper}>
                        <Clock
                            size={16}
                            className={styles.inputIcon}
                            aria-hidden="true"
                        />

                        <Input
                            id="bid-duration"
                            name="duration"
                            type="number"
                            className={errors.duration ? styles.isInvalid : ''}
                            value={formData.duration}
                            onChange={handleChange}
                            placeholder="e.g. 7"
                            min="1"
                            max="365"
                            required
                            aria-required="true"
                            aria-invalid={!!errors.duration}
                            aria-describedby={errors.duration ? 'duration-error' : undefined}
                        />
                    </div>

                    {errors.duration && (
                        <span
                            id="duration-error"
                            className={styles.errorText}
                        >
                            {errors.duration}
                        </span>
                    )}
                </div>
            </div>

            <div className={styles.fieldGroup}>
                <label
                    htmlFor="cover-letter"
                    className={styles.label}
                >
                    Cover Letter
                </label>

                <textarea
                    id="cover-letter"
                    name="coverLetter"
                    className={`${styles.textarea} ${errors.coverLetter ? styles.isInvalid : ''}`}
                    value={formData.coverLetter}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Describe why you are the best fit for this gig..."
                    required
                    aria-required="true"
                    aria-invalid={!!errors.coverLetter}
                    aria-describedby={errors.coverLetter ? 'coverletter-error' : undefined}
                />

                <div className={styles.textareaFooter}>
                    {errors.coverLetter && (
                        <span
                            id="coverletter-error"
                            className={styles.errorText}
                        >
                            {errors.coverLetter}
                        </span>
                    )}

                    <div className={styles.charCount}>
                        <span className={formData.coverLetter.length > 2000 ? styles.charLimitExceeded : ''}>
                            {formData.coverLetter.length}
                        </span>
                        /2000 characters
                    </div>
                </div>
            </div>

            <div className={styles.fieldGroup}>
                <label className={styles.label}>
                    Attachments
                </label>

                <div className={styles.fileUpload}>
                    <input
                        type="file"
                        id="bid-attachments"
                        multiple
                        onChange={handleFileChange}
                        className={styles.fileInput}
                        aria-describedby="file-hint attachments-error"
                    />

                    <label
                        htmlFor="bid-attachments"
                        className={styles.fileLabel}
                        tabIndex="0"
                        role="button"
                    >
                        <Paperclip size={18} aria-hidden="true" />
                        <span>Attach files (Max 5MB each)</span>
                    </label>

                    <p
                        id="file-hint"
                        className={styles.fileHint}
                    >
                        Accepted: PDF, DOC, JPEG, PNG
                    </p>
                </div>

                {errors.attachments && (
                    <span
                        id="attachments-error"
                        className={styles.errorText}
                    >
                        {errors.attachments}
                    </span>
                )}

                {formData.attachments.length > 0 && (
                    <>
                        <ul
                            className={styles.attachmentList}
                            aria-label="Attached files"
                        >
                            {formData.attachments.map((file, index) => (
                                <li
                                    key={index}
                                    className={styles.attachmentItem}
                                >
                                    <FileText
                                        size={14}
                                        aria-hidden="true"
                                        className={styles.fileIcon}
                                    />

                                    <span
                                        className={styles.fileName}
                                        title={file.name}
                                    >
                                        {file.name}
                                    </span>

                                    <span className={styles.fileSize}>
                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => removeAttachment(index)}
                                        className={styles.removeFile}
                                        aria-label={`Remove ${file.name}`}
                                    >
                                        <X size={14} aria-hidden="true" />
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <div className={styles.totalSize}>
                            Total size: {calculateTotalSize()} MB
                        </div>
                    </>
                )}
            </div>

            <div className={styles.termsGroup}>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        required
                        aria-required="true"
                    />
                    <span>
                        I agree to the terms and conditions and understand that this bid is binding.
                    </span>
                </label>
            </div>

            <div className={styles.actions}>
                <Button
                    variant="ghost"
                    onClick={onCancel}
                    type="button"
                    aria-label="Cancel bid submission"
                >
                    Cancel
                </Button>

                <Button
                    variant="secondary"
                    onClick={togglePreviewMode}
                    type="button"
                    aria-label="Preview bid proposal"
                >
                    Preview
                </Button>

                <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                    aria-label="Submit bid proposal"
                >
                    {isSubmitting ? (
                        <>
                            <LoadingSpinner size="small" />
                            Submitting...
                        </>
                    ) : (
                        'Submit Proposal'
                    )}
                </Button>
            </div>
        </form>
    );
};

BidForm.propTypes = {
    gigId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    existingBid: PropTypes.shape({
        amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        duration: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        coverLetter: PropTypes.string,
        attachments: PropTypes.arrayOf(
            PropTypes.oneOfType([
                PropTypes.instanceOf(File),
                PropTypes.shape({
                    name: PropTypes.string,
                    size: PropTypes.number,
                    type: PropTypes.string
                })
            ])
        )
    })
};

export default BidForm;