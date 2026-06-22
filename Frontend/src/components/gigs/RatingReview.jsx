/**
 * @file RatingReview.jsx
 * @description Component for submitting ratings and reviews for completed gigs.
 * @author Sherif Talaat
 * @date 2026-02-05
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-07
 */

import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Star,
    Send,
    ThumbsUp,
    ThumbsDown,
    MessageCircle,
    CheckCircle,
    AlertCircle,
    User
} from 'lucide-react';
import { Button, LoadingSpinner } from '../common';
import styles from './RatingReview.module.css';

/**
 * Rating stars component with hover and click functionality.
 * @param {Object} props - Component props.
 * @param {number} props.rating - Current rating.
 * @param {number} props.hoverRating - Current hover rating.
 * @param {function} props.onRatingChange - Rating change handler.
 * @param {function} props.onHoverChange - Hover change handler.
 * @param {boolean} props.disabled - Whether rating is disabled.
 * @param {number} [props.size=32] - Star size.
 * @returns {JSX.Element} Rating stars component.
 */
const RatingStars = ({
    rating,
    hoverRating,
    onRatingChange,
    onHoverChange,
    disabled,
    size = 32
}) => {
    const [labels] = useState([
        'Poor',
        'Fair',
        'Good',
        'Very Good',
        'Excellent'
    ]);

    /**
     * Gets the current rating label.
     * @returns {string} Rating label.
     */
    const getRatingLabel = useCallback(() => {
        const currentRating = hoverRating || rating;
        return currentRating > 0 ? labels[currentRating - 1] : 'Select a rating';
    }, [hoverRating, rating, labels]);

    return (
        <div
            className={styles.starRating}
            role="radiogroup"
            aria-label="Rate your experience"
            onMouseLeave={() => !disabled && onHoverChange(0)}
        >
            <div className={styles.starContainer}>
                {[1, 2, 3, 4, 5].map((star) => {
                    const isActive = (hoverRating || rating) >= star;

                    return (
                        <button
                            key={star}
                            type="button"
                            className={styles.starButton}
                            onMouseEnter={() => !disabled && onHoverChange(star)}
                            onClick={() => !disabled && onRatingChange(star)}
                            disabled={disabled}
                            aria-label={`Rate ${star} out of 5 stars`}
                            aria-checked={rating >= star}
                            role="radio"
                            aria-setsize="5"
                            aria-posinset={star}
                        >
                            <Star
                                size={size}
                                className={`${styles.star} ${isActive ? styles.starActive : ''}`}
                                fill={isActive ? "currentColor" : "none"}
                                aria-hidden="true"
                            />
                        </button>
                    );
                })}
            </div>

            <div
                className={styles.ratingLabel}
                aria-live="polite"
                aria-atomic="true"
            >
                {getRatingLabel()}
                {rating > 0 && (
                    <span className={styles.ratingValue} aria-hidden="true">
                        ({rating}.0)
                    </span>
                )}
            </div>
        </div>
    );
};

RatingStars.propTypes = {
    rating: PropTypes.number.isRequired,
    hoverRating: PropTypes.number.isRequired,
    onRatingChange: PropTypes.func.isRequired,
    onHoverChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    size: PropTypes.number
};

/**
 * Review text area component.
 * @param {Object} props - Component props.
 * @param {string} props.review - Current review text.
 * @param {function} props.onReviewChange - Review change handler.
 * @param {boolean} props.disabled - Whether textarea is disabled.
 * @param {number} [props.maxLength=500] - Maximum character length.
 * @returns {JSX.Element} Review text area component.
 */
const ReviewTextArea = ({
    review,
    onReviewChange,
    disabled,
    maxLength = 500
}) => {
    const [characterCount, setCharacterCount] = useState(review.length);

    /**
     * Handles text area change.
     * @param {React.ChangeEvent<HTMLTextAreaElement>} e - Change event.
     * @returns {void}
     */
    const handleChange = useCallback((e) => {
        const newValue = e.target.value;
        if (newValue.length <= maxLength) {
            onReviewChange(newValue);
            setCharacterCount(newValue.length);
        }
    }, [onReviewChange, maxLength]);

    /**
     * Gets character count color.
     * @returns {string} CSS class for character count.
     */
    const getCharacterCountClass = useCallback(() => {
        const percentage = (characterCount / maxLength) * 100;

        if (percentage >= 90) return styles.charCountWarning;
        if (percentage >= 75) return styles.charCountInfo;
        return styles.charCountNormal;
    }, [characterCount, maxLength]);

    return (
        <div className={styles.reviewSection}>
            <label htmlFor="review-text" className={styles.reviewLabel}>
                <MessageCircle size={16} aria-hidden="true" />
                Share your experience
                <span className={styles.optionalText} aria-label="Optional field">(optional)</span>
            </label>

            <textarea
                id="review-text"
                className={styles.reviewTextarea}
                value={review}
                onChange={handleChange}
                placeholder="What went well? What could be improved? Be specific and constructive..."
                rows={4}
                maxLength={maxLength}
                disabled={disabled}
                aria-label="Review text area"
                aria-describedby="review-hint char-count"
            />

            <div className={styles.reviewFooter}>
                <p id="review-hint" className={styles.reviewHint}>
                    Your review helps others make informed decisions.
                </p>

                <div className={styles.charCountWrapper}>
                    <span
                        id="char-count"
                        className={`${styles.charCount} ${getCharacterCountClass()}`}
                        aria-label={`${characterCount} characters used out of ${maxLength}`}
                    >
                        {characterCount}/{maxLength}
                    </span>
                </div>
            </div>
        </div>
    );
};

ReviewTextArea.propTypes = {
    review: PropTypes.string.isRequired,
    onReviewChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    maxLength: PropTypes.number
};

/**
 * Review recommendation component.
 * @param {Object} props - Component props.
 * @param {boolean} props.recommended - Current recommendation.
 * @param {function} props.onRecommendationChange - Recommendation change handler.
 * @param {boolean} props.disabled - Whether buttons are disabled.
 * @returns {JSX.Element} Review recommendation component.
 */
const ReviewRecommendation = ({
    recommended,
    onRecommendationChange,
    disabled
}) => {
    return (
        <div className={styles.recommendationSection}>
            <h4 className={styles.recommendationTitle}>
                Would you recommend this {recommended !== null ? 'freelancer' : 'client'}?
            </h4>

            <div
                className={styles.recommendationButtons}
                role="radiogroup"
                aria-label="Recommendation"
            >
                <button
                    type="button"
                    className={`${styles.recommendationButton} ${recommended === true ? styles.recommendationSelected : ''}`}
                    onClick={() => !disabled && onRecommendationChange(true)}
                    disabled={disabled}
                    aria-pressed={recommended === true}
                    aria-label="Recommend"
                >
                    <ThumbsUp size={20} aria-hidden="true" />
                    <span>Yes, recommend</span>
                </button>

                <button
                    type="button"
                    className={`${styles.recommendationButton} ${recommended === false ? styles.recommendationSelected : ''}`}
                    onClick={() => !disabled && onRecommendationChange(false)}
                    disabled={disabled}
                    aria-pressed={recommended === false}
                    aria-label="Do not recommend"
                >
                    <ThumbsDown size={20} aria-hidden="true" />
                    <span>No, do not recommend</span>
                </button>
            </div>
        </div>
    );
};

ReviewRecommendation.propTypes = {
    recommended: PropTypes.bool,
    onRecommendationChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool
};

/**
 * Rating and review form.
 * @param {Object} props - Component props.
 * @param {string|number} props.gigId - Gig ID.
 * @param {string|number} props.targetUserId - ID of user being reviewed.
 * @param {Object} [props.targetUser] - Information about the user being reviewed.
 * @param {string} props.userRole - Role of reviewer ('client' or 'freelancer').
 * @param {function} props.onSubmit - Submit handler.
 * @param {Object} [props.existingReview] - Existing review data.
 * @param {function} [props.onCancel] - Cancel handler.
 * @param {boolean} [props.isSubmitting=false] - Whether form is submitting.
 * @param {string} [props.error] - Form submission error.
 * @returns {JSX.Element} The rendered rating review component.
 */
const RatingReview = ({
    gigId,
    targetUserId,
    targetUser,
    userRole,
    onSubmit,
    existingReview,
    onCancel,
    isSubmitting = false,
    error = null
}) => {
    // Form state
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [review, setReview] = useState(existingReview?.comment || '');
    const [recommended, setRecommended] = useState(
        existingReview?.recommended !== undefined ? existingReview.recommended : null
    );
    const [hoverRating, setHoverRating] = useState(0);
    const [validationError, setValidationError] = useState('');

    // Submitted state
    const [isSubmitted, setIsSubmitted] = useState(!!existingReview);

    /**
     * Validates the form.
     * @returns {boolean} True if form is valid.
     */
    const validateForm = useCallback(() => {
        if (rating === 0) {
            setValidationError('Please select a rating');
            return false;
        }

        if (recommended === null) {
            setValidationError('Please indicate if you recommend this user');
            return false;
        }

        setValidationError('');
        return true;
    }, [rating, recommended]);

    /**
     * Handles rating change.
     * @param {number} newRating - New rating value.
     * @returns {void}
     */
    const handleRatingChange = useCallback((newRating) => {
        setRating(newRating);

        // Clear validation error when rating is selected
        if (newRating > 0 && validationError === 'Please select a rating') {
            setValidationError('');
        }
    }, [validationError]);

    /**
     * Handles recommendation change.
     * @param {boolean} isRecommended - Whether user is recommended.
     * @returns {void}
     */
    const handleRecommendationChange = useCallback((isRecommended) => {
        setRecommended(isRecommended);

        // Clear validation error when recommendation is selected
        if (validationError === 'Please indicate if you recommend this user') {
            setValidationError('');
        }
    }, [validationError]);

    /**
     * Handles form submission.
     * @param {React.FormEvent} e - Form event.
     * @returns {Promise<void>}
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const reviewData = {
            gigId,
            targetUserId,
            rating,
            comment: review.trim() || null,
            recommended,
            userRole
        };

        try {
            await onSubmit(reviewData);
            setIsSubmitted(true);
        } catch (error) {
            // Error handling is done by parent component
            console.error('Failed to submit review:', error);
        }
    }, [gigId, targetUserId, rating, review, recommended, userRole, onSubmit, validateForm]);

    /**
     * Handles form reset.
     * @returns {void}
     */
    const handleReset = useCallback(() => {
        if (!existingReview) {
            setRating(0);
            setReview('');
            setRecommended(null);
            setHoverRating(0);
            setValidationError('');
        }
    }, [existingReview]);

    // Update form when existingReview changes
    useEffect(() => {
        if (existingReview) {
            setRating(existingReview.rating || 0);
            setReview(existingReview.comment || '');
            setRecommended(existingReview.recommended !== undefined ? existingReview.recommended : null);
            setIsSubmitted(true);
        }
    }, [existingReview]);

    // Thank you message after submission
    if (isSubmitted && !existingReview) {
        return (
            <div
                className={styles.submittedContainer}
                role="status"
                aria-live="polite"
            >
                <CheckCircle
                    size={64}
                    className={styles.submittedIcon}
                    aria-hidden="true"
                />

                <h2 className={styles.submittedTitle}>
                    Thank You for Your Feedback!
                </h2>

                <p className={styles.submittedMessage}>
                    Your review has been submitted successfully and will help others
                    make informed decisions.
                </p>

                <div className={styles.submittedActions}>
                    <Button
                        variant="primary"
                        onClick={handleReset}
                        aria-label="Submit another review"
                    >
                        Submit Another Review
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <h2 className={styles.title}>
                    {existingReview ? 'Your Review' : 'Leave a Review'}
                </h2>

                {targetUser && (
                    <div className={styles.targetUser}>
                        <div className={styles.userAvatar}>
                            {targetUser.avatar ? (
                                <img
                                    src={targetUser.avatar}
                                    alt={targetUser.name || 'User'}
                                    className={styles.avatarImage}
                                    loading="lazy"
                                />
                            ) : (
                                <User
                                    size={24}
                                    className={styles.avatarFallback}
                                    aria-hidden="true"
                                />
                            )}
                        </div>

                        <div className={styles.userInfo}>
                            <span className={styles.userName}>
                                {targetUser.name || 'Anonymous User'}
                            </span>
                            <span className={styles.userRole}>
                                {userRole === 'client' ? 'Freelancer' : 'Client'}
                            </span>
                        </div>
                    </div>
                )}
            </header>

            {/* Error Display */}
            {(error || validationError) && (
                <div
                    className={styles.errorContainer}
                    role="alert"
                    aria-live="assertive"
                >
                    <AlertCircle size={20} aria-hidden="true" />
                    <span>{error || validationError}</span>
                </div>
            )}

            {/* Form */}
            <form
                className={styles.form}
                onSubmit={handleSubmit}
                noValidate
                aria-label="Rating and review form"
            >
                {/* Rating Section */}
                <section
                    className={styles.ratingSection}
                    aria-label="Rating selection"
                >
                    <h3 className={styles.sectionTitle}>
                        How would you rate your experience?
                    </h3>

                    <RatingStars
                        rating={rating}
                        hoverRating={hoverRating}
                        onRatingChange={handleRatingChange}
                        onHoverChange={setHoverRating}
                        disabled={isSubmitted}
                        size={40}
                    />
                </section>

                {/* Recommendation Section */}
                <section
                    className={styles.recommendationSection}
                    aria-label="Recommendation selection"
                >
                    <ReviewRecommendation
                        recommended={recommended}
                        onRecommendationChange={handleRecommendationChange}
                        disabled={isSubmitted}
                    />
                </section>

                {/* Review Section */}
                <section
                    className={styles.reviewSection}
                    aria-label="Review text"
                >
                    <ReviewTextArea
                        review={review}
                        onReviewChange={setReview}
                        disabled={isSubmitted}
                        maxLength={500}
                    />
                </section>

                {/* Tips Section */}
                <div className={styles.tipsSection}>
                    <h4 className={styles.tipsTitle}>
                        <MessageCircle size={16} aria-hidden="true" />
                        Tips for a great review:
                    </h4>
                    <ul className={styles.tipsList}>
                        <li>Be specific about what you liked or didn't like</li>
                        <li>Focus on the work quality and communication</li>
                        <li>Keep it professional and constructive</li>
                        <li>Share details that would help others</li>
                    </ul>
                </div>

                {/* Actions */}
                <footer className={styles.actions}>
                    <div className={styles.actionButtons}>
                        {onCancel && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onCancel}
                                disabled={isSubmitting}
                                aria-label="Cancel review"
                            >
                                Cancel
                            </Button>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitted || isSubmitting}
                            className={styles.submitButton}
                            aria-label={isSubmitted ? 'Review already submitted' : 'Submit review'}
                        >
                            {isSubmitting ? (
                                <>
                                    <LoadingSpinner size="small" />
                                    Submitting...
                                </>
                            ) : isSubmitted ? (
                                <>
                                    <CheckCircle size={16} aria-hidden="true" />
                                    Submitted
                                </>
                            ) : (
                                <>
                                    <Send size={16} aria-hidden="true" />
                                    Submit Review
                                </>
                            )}
                        </Button>
                    </div>

                    <p className={styles.disclaimer}>
                        Your review will be visible to other users and cannot be edited after submission.
                    </p>
                </footer>
            </form>
        </div>
    );
};

RatingReview.propTypes = {
    gigId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    targetUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    targetUser: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        avatar: PropTypes.string
    }),
    userRole: PropTypes.oneOf(['client', 'freelancer']).isRequired,
    onSubmit: PropTypes.func.isRequired,
    existingReview: PropTypes.shape({
        rating: PropTypes.number,
        comment: PropTypes.string,
        recommended: PropTypes.bool
    }),
    onCancel: PropTypes.func,
    isSubmitting: PropTypes.bool,
    error: PropTypes.string
};

export default RatingReview;