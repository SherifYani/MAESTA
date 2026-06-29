/**
 * @file AdminStatsCard.jsx
 * @description Reusable statistics card for admin dashboard with trend indicators
 * @author Sherif Talaat
 * @date 2026-02-06
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-07
 */

import React from 'react';
import PropTypes from 'prop-types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import styles from './AdminStatsCard.module.css';

/**
 * Admin Statistics Card Component for displaying key metrics with trends.
 * @param {Object} props - Component props.
 * @param {string} props.title - Title of the statistic.
 * @param {string|number} props.value - Value of the statistic.
 * @param {string} [props.trend] - Trend string (e.g., "+12%").
 * @param {React.ReactNode} [props.icon] - Icon element or component.
 * @param {string} [props.description] - Additional description text.
 * @param {string} [props.variant] - Card variant (default, accent, success, warning, danger).
 * @param {function} [props.onClick] - Click handler for the card.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} Rendered statistics card component.
 */
const AdminStatsCard = ({
    title,
    value,
    trend,
    icon: IconComponent,
    description,
    variant = 'default',
    onClick,
    className = '',
}) => {
    /**
     * Determines the trend type and icon based on trend value.
     * @returns {Object} Object containing trend type and icon component.
     */
    const getTrendInfo = () => {
        if (!trend) return null;

        const isPositive = trend.startsWith('+');
        const isNegative = trend.startsWith('-');
        const isNeutral = trend.includes('0%') || !isPositive && !isNegative;

        if (isPositive) {
            return {
                type: 'positive',
                Icon: TrendingUp,
                ariaLabel: 'Positive trend'
            };
        } else if (isNegative) {
            return {
                type: 'negative',
                Icon: TrendingDown,
                ariaLabel: 'Negative trend'
            };
        } else {
            return {
                type: 'neutral',
                Icon: Minus,
                ariaLabel: 'Neutral trend'
            };
        }
    };

    const trendInfo = getTrendInfo();

    /**
     * Handles card click events.
     * @param {React.MouseEvent} event - The click event.
     */
    const handleClick = (event) => {
        if (onClick) {
            onClick({ title, value, trend, event });
        }
    };

    /**
     * Handles keyboard events for accessibility.
     * @param {React.KeyboardEvent} event - The keyboard event.
     */
    const handleKeyPress = (event) => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            handleClick(event);
        }
    };

    const cardClasses = [
        styles.card,
        styles[`card--${variant}`],
        onClick && styles.cardClickable,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <Card
            className={cardClasses}
            onClick={onClick ? handleClick : undefined}
            onKeyPress={onClick ? handleKeyPress : undefined}
            tabIndex={onClick ? 0 : undefined}
            role={onClick ? 'button' : 'article'}
            aria-label={onClick ? `${title}: ${value} ${trend ? `(${trend})` : ''}` : undefined}
        >
            <div className={styles.card__header}>
                <h3 className={styles.card__title}>{title}</h3>
                {IconComponent && (
                    <div className={styles.card__icon} aria-hidden="true">
                        <IconComponent size={24} />
                    </div>
                )}
            </div>

            <div className={styles.card__content}>
                <div className={styles.valueContainer}>
                    <span className={styles.card__value}>{value}</span>
                    {trend && trendInfo && (
                        <div className={styles.trendContainer}>
                            <span
                                className={`${styles.card__trend} ${styles[`card__trend--${trendInfo.type}`]}`}
                                aria-label={`Trend: ${trend}`}
                                title={`Trend: ${trend}`}
                            >
                                <trendInfo.Icon
                                    size={14}
                                    className={styles.trendIcon}
                                    aria-hidden="true"
                                />
                                <span className={styles.trendText}>{trend}</span>
                            </span>
                        </div>
                    )}
                </div>

                {description && (
                    <p className={styles.card__description}>{description}</p>
                )}
            </div>

            {variant === 'accent' && (
                <div className={styles.card__accentBar} aria-hidden="true" />
            )}
        </Card>
    );
};

AdminStatsCard.propTypes = {
    /** Title of the statistic */
    title: PropTypes.string.isRequired,
    /** Value of the statistic */
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    /** Trend indicator (e.g., "+12%", "-5%", "0%") */
    trend: PropTypes.string,
    /** Icon component or element */
    icon: PropTypes.elementType,
    /** Additional description text */
    description: PropTypes.string,
    /** Card variant/style */
    variant: PropTypes.oneOf(['default', 'accent', 'success', 'warning', 'danger']),
    /** Click handler for the card */
    onClick: PropTypes.func,
    /** Additional CSS classes */
    className: PropTypes.string,
};

AdminStatsCard.defaultProps = {
    variant: 'default',
};

export default AdminStatsCard;