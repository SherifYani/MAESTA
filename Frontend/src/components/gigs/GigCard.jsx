/**
 * @file GigCard.jsx
 * @description Component for displaying gig information in a card format.
 * @author Sherif Talaat
 * @date 2026-02-05
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-07
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    Clock,
    DollarSign,
    Briefcase,
    MapPin,
    User,
    Star,
    Calendar
} from 'lucide-react';
import styles from './GigCard.module.css';

/**
 * Formats budget range for display.
 * @param {Object|number} budget - Budget object or fixed amount.
 * @returns {string} Formatted budget string.
 */
const formatBudget = (budget) => {
    if (!budget) return 'Negotiable';

    if (typeof budget === 'number') {
        return `$${budget.toLocaleString()}`;
    }

    if (budget.min && budget.max) {
        return `$${budget.min.toLocaleString()} - $${budget.max.toLocaleString()}`;
    }

    if (budget.min) return `From $${budget.min.toLocaleString()}`;
    if (budget.max) return `Up to $${budget.max.toLocaleString()}`;

    return 'Negotiable';
};

/**
 * Formats relative date for display.
 * @param {string} dateString - ISO date string.
 * @returns {string} Formatted relative date.
 */
const formatDate = (dateString) => {
    if (!dateString) return 'Just now';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';

    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Truncates text to a specified length.
 * @param {string} text - Text to truncate.
 * @param {number} maxLength - Maximum length.
 * @returns {string} Truncated text.
 */
const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

/**
 * Renders star rating visualization.
 * @param {number} rating - Rating value.
 * @param {number} maxRating - Maximum rating value.
 * @returns {JSX.Element} Star rating element.
 */
const renderRating = (rating, maxRating = 5) => {
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
        stars.push(
            <Star
                key={i}
                size={12}
                className={`${styles.star} ${i <= rating ? styles.starFilled : ''}`}
                aria-hidden="true"
            />
        );
    }
    return stars;
};

/**
 * Gig card component for displaying gig information.
 * @param {Object} props - Component props.
 * @param {Object} props.gig - Gig data object.
 * @param {function} props.onClick - Click handler function.
 * @param {string} [props.className=''] - Additional CSS classes.
 * @param {string} [props.variant='default'] - Card variant style.
 * @returns {JSX.Element} The rendered gig card component.
 */
const GigCard = ({
    gig,
    onClick,
    className = '',
    variant = 'default'
}) => {
    const {
        id,
        projectId,
        title,
        description,
        budget,
        duration,
        experienceLevel,
        location,
        requiredSkills = [],
        client = {},
        bidCount = 0,
        createdAt,
        postedDate,
        isFeatured = false,
        isUrgent = false
    } = gig;

    const displayId = id || projectId;

    /**
     * Handles card click events.
     * @returns {void}
     */
    const handleClick = useCallback(() => {
        if (onClick) {
            onClick(gig);
        }
    }, [onClick, gig]);

    /**
     * Handles keyboard events for accessibility.
     * @param {React.KeyboardEvent} e - Keyboard event.
     * @returns {void}
     */
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    }, [handleClick]);

    /**
     * Gets experience level label.
     * @returns {string} Formatted experience level.
     */
    const getExperienceLabel = useCallback(() => {
        if (!experienceLevel) return 'Any Level';

        const levels = {
            entry: 'Entry Level',
            intermediate: 'Intermediate',
            expert: 'Expert'
        };

        return levels[experienceLevel.toLowerCase()] || experienceLevel;
    }, [experienceLevel]);

    return (
        <article
            className={`${styles.card} ${styles[variant]} ${className}`}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`View gig details: ${title}. Budget: ${formatBudget(budget)}. ${description}`}
            data-gig-id={displayId}
            data-featured={isFeatured}
            data-urgent={isUrgent}
        >
            {/* Card Header */}
            <header className={styles.header}>
                <div className={styles.headerTop}>
                    <h3 className={styles.title} title={title}>
                        {truncateText(title, 60)}
                    </h3>

                    <div className={styles.badgeContainer}>
                        {isFeatured && (
                            <span
                                className={styles.featuredBadge}
                                aria-label="Featured gig"
                            >
                                Featured
                            </span>
                        )}
                        {isUrgent && (
                            <span
                                className={styles.urgentBadge}
                                aria-label="Urgent gig"
                            >
                                Urgent
                            </span>
                        )}
                    </div>
                </div>

                <div className={styles.metaInfo}>
                    <span className={styles.date} title={createdAt || postedDate ? new Date(createdAt || postedDate).toLocaleDateString() : 'Date unavailable'}>
                        <Calendar size={14} aria-hidden="true" />
                        {formatDate(createdAt || postedDate)}
                    </span>

                    <span className={styles.bidCount} aria-label={`${bidCount} bids received`}>
                        {bidCount} bid{bidCount !== 1 ? 's' : ''}
                    </span>
                </div>
            </header>

            {/* Client Information */}
            <div className={styles.clientSection}>
                <div className={styles.clientInfo}>
                    <div className={styles.avatarContainer}>
                        {client.avatar ? (
                            <img
                                src={client.avatar}
                                alt={client.name || 'Client avatar'}
                                className={styles.avatar}
                                loading="lazy"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    if (e.target.nextElementSibling) {
                                        e.target.nextElementSibling.style.display = 'flex';
                                    }
                                }}
                            />
                        ) : null}

                        <div
                            className={styles.avatarFallback}
                            style={{ display: client.avatar ? 'none' : 'flex' }}
                            aria-hidden="true"
                        >
                            <User size={16} />
                        </div>
                    </div>

                    <div className={styles.clientDetails}>
                        <span className={styles.clientName} title={client.name}>
                            {client.name || 'Anonymous Client'}
                        </span>

                        {client.rating && (
                            <div
                                className={styles.rating}
                                aria-label={`Client rating: ${client.rating} out of 5 stars`}
                            >
                                {renderRating(client.rating)}
                                <span className={styles.ratingValue}>
                                    {client.rating.toFixed(1)}
                                </span>
                            </div>
                        )}

                        {client.completedProjects && (
                            <span className={styles.projectCount}>
                                {client.completedProjects} project{client.completedProjects !== 1 ? 's' : ''} completed
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Gig Description */}
            <div className={styles.descriptionSection}>
                <p className={styles.description} title={description}>
                    {truncateText(description, 120)}
                </p>
            </div>

            {/* Required Skills */}
            {requiredSkills.length > 0 && (
                <div className={styles.skillsSection}>
                    <div className={styles.skills} aria-label="Required skills">
                        {requiredSkills.slice(0, 4).map((skill, index) => (
                            <span
                                key={`${displayId}-skill-${index}`}
                                className={styles.skillTag}
                                aria-label={skill}
                            >
                                {skill}
                            </span>
                        ))}

                        {requiredSkills.length > 4 && (
                            <span
                                className={styles.moreSkills}
                                aria-label={`${requiredSkills.length - 4} more skills required`}
                                title={requiredSkills.slice(4).join(', ')}
                            >
                                +{requiredSkills.length - 4}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Gig Metadata */}
            <div className={styles.metadataSection}>
                <div className={styles.metadataGrid}>
                    <div className={styles.metadataItem} aria-label="Budget">
                        <DollarSign
                            size={16}
                            className={styles.metadataIcon}
                            aria-hidden="true"
                        />
                        <span className={styles.metadataValue}>
                            {formatBudget(budget)}
                        </span>
                    </div>

                    <div className={styles.metadataItem} aria-label="Duration">
                        <Clock
                            size={16}
                            className={styles.metadataIcon}
                            aria-hidden="true"
                        />
                        <span className={styles.metadataValue}>
                            {duration} day{duration !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className={styles.metadataItem} aria-label="Experience level required">
                        <Briefcase
                            size={16}
                            className={styles.metadataIcon}
                            aria-hidden="true"
                        />
                        <span className={styles.metadataValue}>
                            {getExperienceLabel()}
                        </span>
                    </div>

                    {location && (
                        <div className={styles.metadataItem} aria-label="Location">
                            <MapPin
                                size={16}
                                className={styles.metadataIcon}
                                aria-hidden="true"
                            />
                            <span
                                className={styles.metadataValue}
                                title={location}
                            >
                                {truncateText(location, 15)}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Card Footer */}
            <footer className={styles.footer}>
                <div className={styles.viewPrompt}>
                    Click to view details
                    <span className={styles.viewArrow} aria-hidden="true">→</span>
                </div>
            </footer>
        </article>
    );
};

GigCard.propTypes = {
    gig: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        budget: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.shape({
                min: PropTypes.number,
                max: PropTypes.number
            })
        ]),
        duration: PropTypes.number,
        experienceLevel: PropTypes.string,
        location: PropTypes.string,
        requiredSkills: PropTypes.arrayOf(PropTypes.string),
        client: PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            name: PropTypes.string,
            avatar: PropTypes.string,
            rating: PropTypes.number,
            completedProjects: PropTypes.number
        }),
        bidCount: PropTypes.number,
        createdAt: PropTypes.string,
        isFeatured: PropTypes.bool,
        isUrgent: PropTypes.bool
    }).isRequired,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
    variant: PropTypes.oneOf(['default', 'compact', 'detailed'])
};

export default GigCard;