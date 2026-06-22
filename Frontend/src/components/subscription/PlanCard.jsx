/**
 * @file PlanCard.jsx
 * @description Individual subscription plan card component with responsive design
 * @author Sherif Talaat
 * @date 2026-02-06
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */



import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Check, Crown, Star, Zap, Sparkles, ArrowRight } from 'lucide-react';
import styles from './PlanCard.module.css';

/**
 * Subscription plan card component for displaying pricing, features, and CTAs.
 * Supports multiple plan types (free, popular, active) with visual indicators.
 * @param {Object} props - Component props
 * @param {Object} props.plan - Plan configuration object
 * @param {string} props.billingPeriod - Billing period ('monthly' or 'yearly')
 * @param {boolean} props.isActive - Whether this plan is currently active
 * @param {Function} props.onSelect - Callback when plan is selected
 * @param {string} props.variant - Card variant ('default', 'highlight', 'minimal')
 * @param {boolean} props.showYearlySavings - Whether to show yearly savings
 * @param {number} props.yearlySavingsPercentage - Percentage savings for yearly billing
 * @returns {JSX.Element} Rendered plan card component
 */
const PlanCard = ({
    plan,
    billingPeriod,
    isActive = false,
    onSelect,
    variant = 'default',
    showYearlySavings = true,
    yearlySavingsPercentage = 20,
    ...rest
}) => {
    /**
     * Calculate price based on billing period
     */
    const price = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

    /**
     * Calculate monthly equivalent for yearly plans
     */
    const monthlyEquivalent = useMemo(() => {
        if (billingPeriod === 'yearly' && plan.yearlyPrice > 0) {
            return (plan.yearlyPrice / 12).toFixed(2);
        }
        return null;
    }, [billingPeriod, plan.yearlyPrice]);

    /**
     * Calculate yearly savings
     */
    const yearlySavings = useMemo(() => {
        if (billingPeriod === 'yearly' && plan.monthlyPrice > 0 && plan.yearlyPrice > 0) {
            const monthlyTotal = plan.monthlyPrice * 12;
            return monthlyTotal - plan.yearlyPrice;
        }
        return 0;
    }, [billingPeriod, plan.monthlyPrice, plan.yearlyPrice]);

    /**
     * Get period display label
     */
    const periodLabel = billingPeriod === 'monthly' ? 'month' : 'year';

    /**
     * Get plan type icon based on plan properties
     */
    const getPlanIcon = () => {
        if (plan.isPopular) return <Crown size={16} />;
        if (plan.isRecommended) return <Star size={16} />;
        if (plan.isFeatured) return <Sparkles size={16} />;
        return <Zap size={16} />;
    };

    /**
     * Get button text based on plan state
     */
    const getButtonText = () => {
        if (isActive) return 'Current Plan';
        if (plan.monthlyPrice === 0) return 'Get Started Free';
        if (plan.isPopular) return 'Get Started';
        return 'Choose Plan';
    };

    /**
     * Get button variant based on plan state
     */
    const getButtonVariant = () => {
        if (isActive) return 'disabled';
        if (plan.isPopular) return 'primary';
        if (plan.monthlyPrice === 0) return 'free';
        return 'default';
    };

    /**
     * Handle plan selection
     */
    const handleSelect = () => {
        if (!isActive && onSelect) {
            onSelect(plan);
        }
    };

    /**
     * Handle keyboard navigation
     * @param {React.KeyboardEvent<HTMLDivElement>} event - Keyboard event
     */
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleSelect();
        }
    };

    return (
        <div
            className={`${styles.card} ${styles[`card--${variant}`]} ${isActive ? styles.cardActive : ''
                } ${plan.isPopular ? styles.cardPopular : ''}`}
            role="article"
            aria-label={`${plan.name} subscription plan`}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            {...rest}
        >
            {/* Plan Badges */}
            <div className={styles.badges}>
                {/* Popular Badge */}
                {plan.isPopular && (
                    <div
                        className={styles.popularBadge}
                        role="status"
                        aria-label="Most popular plan"
                    >
                        <Crown size={14} className={styles.popularIcon} aria-hidden="true" />
                        <span className={styles.popularText}>Most Popular</span>
                    </div>
                )}

                {/* Active Badge */}
                {isActive && (
                    <div
                        className={styles.activeBadge}
                        role="status"
                        aria-label="Currently active plan"
                    >
                        <Check size={16} className={styles.activeIcon} aria-hidden="true" />
                        <span className={styles.activeText}>Active</span>
                    </div>
                )}

                {/* Yearly Savings Badge */}
                {showYearlySavings &&
                    billingPeriod === 'yearly' &&
                    yearlySavings > 0 && (
                        <div
                            className={styles.savingsBadge}
                            role="status"
                            aria-label={`Save $${yearlySavings} yearly`}
                        >
                            <span className={styles.savingsText}>
                                Save ${yearlySavings.toFixed(2)}
                            </span>
                        </div>
                    )}
            </div>

            {/* Card Content */}
            <div className={styles.content}>
                {/* Plan Header */}
                <header className={styles.header}>
                    <div className={styles.headerIcon}>{getPlanIcon()}</div>
                    <h3 className={styles.title}>{plan.name}</h3>
                    <p className={styles.description}>{plan.description}</p>
                </header>

                {/* Pricing Section */}
                <div className={styles.pricing}>
                    <div className={styles.priceContainer}>
                        <div className={styles.priceWrapper}>
                            <span className={styles.currency}>$</span>
                            <span className={styles.price}>{price}</span>
                            <span className={styles.period}>/{periodLabel}</span>
                        </div>

                        {/* Monthly Equivalent for Yearly Plans */}
                        {monthlyEquivalent && (
                            <p className={styles.monthlyEquivalent}>
                                <span className={styles.equivalentAmount}>${monthlyEquivalent}</span>
                                <span className={styles.equivalentLabel}>/month billed annually</span>
                            </p>
                        )}

                        {/* Yearly Savings Percentage */}
                        {showYearlySavings &&
                            billingPeriod === 'yearly' &&
                            yearlySavingsPercentage > 0 && (
                                <div className={styles.savingsPercentage}>
                                    <span className={styles.savingsPercentageText}>
                                        Save {yearlySavingsPercentage}%
                                    </span>
                                </div>
                            )}
                    </div>
                </div>

                {/* Features List */}
                {plan.features && plan.features.length > 0 && (
                    <section className={styles.featuresSection}>
                        <h4 className={styles.featuresTitle}>Includes:</h4>
                        <ul className={styles.features}>
                            {plan.features.map((feature, index) => (
                                <li
                                    key={`feature-${plan.id}-${index}`}
                                    className={styles.featureItem}
                                >
                                    <Check
                                        size={16}
                                        className={styles.featureIcon}
                                        aria-hidden="true"
                                    />
                                    <span className={styles.featureText}>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Plan Limits */}
                {plan.limits && (
                    <div className={styles.limits}>
                        {Object.entries(plan.limits).map(([key, value]) => (
                            <div key={key} className={styles.limitItem}>
                                <span className={styles.limitLabel}>{key}:</span>
                                <span className={styles.limitValue}>{value}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Call to Action */}
                <div className={styles.cta}>
                    <button
                        type="button"
                        className={`${styles.button} ${styles[`button--${getButtonVariant()}`]
                            }`}
                        onClick={handleSelect}
                        disabled={isActive}
                        aria-label={
                            isActive
                                ? `Current plan: ${plan.name}`
                                : `Select ${plan.name} plan for $${price} per ${periodLabel}`
                        }
                        aria-pressed={isActive}
                    >
                        <span className={styles.buttonText}>{getButtonText()}</span>
                        {!isActive && (
                            <ArrowRight size={16} className={styles.buttonIcon} aria-hidden="true" />
                        )}
                    </button>

                    {/* Free Plan Note */}
                    {plan.monthlyPrice === 0 && (
                        <p className={styles.freeNote}>No credit card required to start</p>
                    )}
                </div>

                {/* Plan Footer */}
                {plan.terms && (
                    <footer className={styles.footer}>
                        <p className={styles.terms}>{plan.terms}</p>
                    </footer>
                )}
            </div>
        </div>
    );
};

PlanCard.propTypes = {
    /**
     * Plan configuration object
     */
    plan: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        monthlyPrice: PropTypes.number.isRequired,
        yearlyPrice: PropTypes.number.isRequired,
        features: PropTypes.arrayOf(PropTypes.string),
        limits: PropTypes.object,
        terms: PropTypes.string,
        isPopular: PropTypes.bool,
        isRecommended: PropTypes.bool,
        isFeatured: PropTypes.bool,
    }).isRequired,
    /**
     * Billing period ('monthly' or 'yearly')
     */
    billingPeriod: PropTypes.oneOf(['monthly', 'yearly']).isRequired,
    /**
     * Whether this plan is currently active
     */
    isActive: PropTypes.bool,
    /**
     * Callback when plan is selected
     */
    onSelect: PropTypes.func.isRequired,
    /**
     * Card visual variant
     */
    variant: PropTypes.oneOf(['default', 'highlight', 'minimal', 'compact']),
    /**
     * Whether to show yearly savings
     */
    showYearlySavings: PropTypes.bool,
    /**
     * Percentage savings for yearly billing
     */
    yearlySavingsPercentage: PropTypes.number,
    /**
     * Additional CSS class
     */
    className: PropTypes.string,
};

PlanCard.defaultProps = {
    isActive: false,
    variant: 'default',
    showYearlySavings: true,
    yearlySavingsPercentage: 20,
    className: '',
};

export default PlanCard;