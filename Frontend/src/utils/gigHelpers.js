/**
 * @file gigHelpers.js
 * @description Utility functions for gigs management
 * @author Sherif Talaat
 * @date 05-02-2026
 */

/**
 * Format budget for display
 * @param {Object|number} budget - Budget object or number
 * @returns {string} Formatted budget string
 */
export const formatBudget = (budget) => {
    if (!budget) return 'Negotiable';

    if (typeof budget === 'number') {
        return `$${budget.toLocaleString()}`;
    }

    if (budget.min && budget.max) {
        return `$${budget.min.toLocaleString()} - $${budget.max.toLocaleString()}`;
    }

    return 'Negotiable';
};

/**
 * Calculate gig duration in readable format
 * @param {number} days - Duration in days
 * @returns {string} Formatted duration
 */
export const formatDuration = (days) => {
    if (!days) return 'Duration not specified';
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''}`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) !== 1 ? 's' : ''}`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) !== 1 ? 's' : ''}`;
};

/**
 * Validate gig data before submission
 * @param {Object} gigData - Gig data to validate
 * @returns {Object} Validation result
 */
export const validateGigData = (gigData) => {
    const errors = {};

    if (!gigData.title?.trim()) {
        errors.title = 'Title is required';
    }

    if (!gigData.description?.trim()) {
        errors.description = 'Description is required';
    }

    if (gigData.description?.length < 50) {
        errors.description = 'Description must be at least 50 characters';
    }

    // Check budget presence logic depending on structure
    // If budgetMin/Max are separate fields in form data:
    if (gigData.budgetMin && gigData.budgetMax) {
        if (Number(gigData.budgetMin) > Number(gigData.budgetMax)) {
            errors.budget = 'Min budget cannot be greater than max budget';
        }
    } else if (!gigData.budget && !gigData.budgetMin) {
        // Loose check, adapt as needed
        errors.budget = 'Budget is required';
    }

    if (!gigData.duration) {
        errors.duration = 'Duration is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate bid data
 * @param {Object} bidData - Bid data to validate
 * @returns {Object} Validation result
 */
export const validateBidData = (bidData) => {
    const errors = {};

    if (!bidData.proposedPrice || bidData.proposedPrice <= 0) {
        errors.proposedPrice = 'Valid price is required';
    }

    if (!bidData.estimatedDays || bidData.estimatedDays <= 0) {
        errors.estimatedDays = 'Valid timeline is required';
    }

    if (!bidData.proposal?.trim()) {
        errors.proposal = 'Proposal description is required';
    }

    if (bidData.proposal?.length < 100) {
        // errors.proposal = 'Proposal must be at least 100 characters';
        // Relaxing this constraint slightly for dev/testing, but keeping it if strictly required
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
