/**
 * @file SubscriptionPlans.jsx
 * @description Main subscription plans display component with responsive grid and billing options
 * @author Sherif Talaat
 * @date 2026-02-06
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-16
 */



import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useSubscription } from '../../context/SubscriptionContext';
import PlanCard from './PlanCard';
import BillingToggle from './BillingToggle';
import { Shield, RefreshCw, CheckCircle, Zap } from 'lucide-react';
import GeneralSelect from '../../components/common/GeneralSelect';
import styles from './SubscriptionPlans.module.css';

const calculateYearlySavings = (monthlyPrice, yearlyPrice) => (monthlyPrice * 12) - yearlyPrice;

/**
 * Main subscription plans display component showing all available plans with filtering and selection.
 * Includes billing period toggle, plan cards grid, and feature comparison.
 * @returns {JSX.Element} Rendered subscription plans component
 */
const SubscriptionPlans = () => {
    const navigate = useNavigate();
    const { plans = [], currentSubscription, isLoading } = useSubscription();
    const [billingPeriod, setBillingPeriod] = useState('monthly');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('recommended');

    /**
     * Filter plans based on selected filter
     */
    const filteredPlans = useMemo(() => {
        let result = [...plans];

        switch (filter) {
            case 'free':
                result = result.filter((plan) => plan.monthlyPrice === 0);
                break;
            case 'paid':
                result = result.filter((plan) => plan.monthlyPrice > 0);
                break;
            case 'popular':
                result = result.filter((plan) => plan.isPopular);
                break;
            case 'recommended':
                result = result.filter((plan) => plan.isRecommended);
                break;
            default:
                break;
        }

        // Sort plans
        switch (sortBy) {
            case 'price-asc':
                result.sort((a, b) => a.monthlyPrice - b.monthlyPrice);
                break;
            case 'price-desc':
                result.sort((a, b) => b.monthlyPrice - a.monthlyPrice);
                break;
            case 'popular':
                result.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
                break;
            case 'recommended':
            default:
                result.sort((a, b) => {
                    if (a.isRecommended && !b.isRecommended) return -1;
                    if (!a.isRecommended && b.isRecommended) return 1;
                    if (a.isPopular && !b.isPopular) return -1;
                    if (!a.isPopular && b.isPopular) return 1;
                    return a.monthlyPrice - b.monthlyPrice;
                });
                break;
        }

        return result;
    }, [plans, filter, sortBy]);

    /**
     * Calculate maximum savings for yearly billing display
     */
    const maxYearlySavings = useMemo(() => {
        const paidPlans = plans.filter((plan) => plan.monthlyPrice > 0);
        if (paidPlans.length === 0) return 0;

        return Math.max(
            ...paidPlans.map((plan) => calculateYearlySavings(plan.monthlyPrice, plan.yearlyPrice))
        );
    }, [plans]);

    /**
     * Calculate total yearly savings for all paid plans
     */
    const totalYearlySavings = useMemo(() => {
        return plans
            .filter((plan) => plan.monthlyPrice > 0)
            .reduce((total, plan) => {
                return total + calculateYearlySavings(plan.monthlyPrice, plan.yearlyPrice);
            }, 0);
    }, [plans]);

    /**
     * Handle plan selection
     * @param {Object} plan - Selected plan object
     */
    const handleSelectPlan = (plan) => {
        if (isLoading) return;

        const isCurrentPlan = currentSubscription?.planId === plan.id;
        if (isCurrentPlan) {
            // Already on this plan
            return;
        }

        if (plan.monthlyPrice === 0) {
            // Free plan - direct upgrade
            navigate(`/subscription/upgrade/${plan.id}?period=${billingPeriod}`);
        } else {
            // Paid plan - go to payment
            navigate(`/subscription/payment/${plan.id}?period=${billingPeriod}`);
        }
    };

    /**
     * Handle billing period change
     * @param {string} period - New billing period ('monthly' or 'yearly')
     */
    const handleBillingPeriodChange = (period) => {
        setBillingPeriod(period);
    };

    /**
     * Render filter buttons
     */
    const renderFilterButtons = () => {
        const filters = [
            { id: 'all', label: 'All Plans' },
            { id: 'free', label: 'Free Plans' },
            { id: 'paid', label: 'Paid Plans' },
            { id: 'popular', label: 'Most Popular' },
            { id: 'recommended', label: 'Recommended' },
        ];

        return (
            <div className={styles.filters}>
                {filters.map((filterOption) => (
                    <button
                        key={filterOption.id}
                        type="button"
                        className={`${styles.filterButton} ${filter === filterOption.id ? styles.filterButtonActive : ''
                            }`}
                        onClick={() => setFilter(filterOption.id)}
                        aria-pressed={filter === filterOption.id}
                        aria-label={`Filter by ${filterOption.label}`}
                    >
                        {filterOption.label}
                    </button>
                ))}
            </div>
        );
    };

    /**
     * Render sort options
     */
    const renderSortOptions = () => {
        const sortOptions = [
            { id: 'recommended', label: 'Recommended' },
            { id: 'popular', label: 'Most Popular' },
            { id: 'price-asc', label: 'Price: Low to High' },
            { id: 'price-desc', label: 'Price: High to Low' },
        ];

        return (
            <div className={styles.sortContainer}>
                <label htmlFor="plan-sort" className={styles.sortLabel}>
                    Sort by:
                </label>
                <GeneralSelect
                    value={sortBy}
                    onChange={(selectedValue) => setSortBy(selectedValue)}
                    options={sortOptions.map(option => ({ value: option.id, label: option.label }))}
                    className={styles.sortSelect}
                    aria-label="Sort plans"
                />
            </div>
        );
    };

    /**
     * Render current plan indicator
     */
    const renderCurrentPlanIndicator = () => {
        if (!currentSubscription) return null;

        const currentPlan = plans.find((plan) => plan.id === currentSubscription.planId);
        if (!currentPlan) return null;

        return (
            <div className={styles.currentPlanIndicator} role="status">
                <CheckCircle size={16} className={styles.currentPlanIcon} />
                <span className={styles.currentPlanText}>
                    Your current plan: <strong>{currentPlan.name}</strong>
                </span>
            </div>
        );
    };

    /**
     * Render savings summary
     */
    const renderSavingsSummary = () => {
        if (billingPeriod !== 'yearly' || maxYearlySavings <= 0) return null;

        return (
            <div className={styles.savingsSummary}>
                <Zap size={20} className={styles.savingsIcon} />
                <div className={styles.savingsContent}>
                    <span className={styles.savingsTitle}>Yearly Savings</span>
                    <span className={styles.savingsAmount}>
                        Save up to ${maxYearlySavings.toFixed(2)} with yearly billing
                    </span>
                </div>
            </div>
        );
    };

    /**
     * Render empty state
     */
    const renderEmptyState = () => {
        if (filteredPlans.length > 0) return null;

        return (
            <div className={styles.emptyState} role="status">
                <div className={styles.emptyIcon}>
                    <RefreshCw size={64} className={styles.emptyIconSvg} aria-hidden="true" />
                </div>
                <h2 className={styles.emptyTitle}>No Plans Found</h2>
                <p className={styles.emptyText}>
                    No subscription plans match your current filters. Try selecting a different filter.
                </p>
                <button
                    type="button"
                    className={styles.resetFiltersButton}
                    onClick={() => setFilter('all')}
                    aria-label="Reset all filters"
                >
                    Reset Filters
                </button>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                {/* Header Section */}
                <header className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>Choose Your Perfect Plan</h1>
                        <p className={styles.subtitle}>
                            Select the ideal subscription for your needs. Upgrade, downgrade, or cancel anytime.
                            No long-term contracts.
                        </p>
                    </div>

                    {/* Current Plan Indicator */}
                    {renderCurrentPlanIndicator()}
                </header>

                {/* Savings Banner */}
                {renderSavingsSummary()}

                {/* Controls Section */}
                <section className={styles.controls}>
                    {/* Billing Period Toggle */}
                    <div className={styles.billingToggleContainer}>
                        <BillingToggle
                            billingPeriod={billingPeriod}
                            onChange={handleBillingPeriodChange}
                            savings={maxYearlySavings}
                            size="lg"
                            variant="primary"
                            showIcons={true}
                            aria-label="Toggle billing period between monthly and yearly"
                        />
                    </div>

                    {/* Filters */}
                    <div className={styles.controlsRow}>
                        <div className={styles.controlsLeft}>{renderFilterButtons()}</div>
                        <div className={styles.controlsRight}>{renderSortOptions()}</div>
                    </div>
                </section>

                {/* Plans Grid */}
                <section className={styles.plansSection}>
                    {isLoading ? (
                        <div className={styles.loadingState} aria-live="polite" aria-busy="true">
                            <div className={styles.loadingSpinner} aria-hidden="true" />
                            <p className={styles.loadingText}>Loading subscription plans...</p>
                        </div>
                    ) : (
                        <>
                            {/* Plans Count */}
                            <div className={styles.plansInfo}>
                                <span className={styles.plansCount}>
                                    {filteredPlans.length} plan{filteredPlans.length !== 1 ? 's' : ''} available
                                </span>
                                {billingPeriod === 'yearly' && totalYearlySavings > 0 && (
                                    <span className={styles.totalSavings}>
                                        Total yearly savings: ${totalYearlySavings.toFixed(2)}
                                    </span>
                                )}
                            </div>

                            {/* Plans Grid */}
                            <div className={styles.plansGrid} role="list">
                                {filteredPlans.map((plan) => (
                                    <PlanCard
                                        key={plan.id}
                                        plan={plan}
                                        billingPeriod={billingPeriod}
                                        isActive={currentSubscription?.planId === plan.id}
                                        onSelect={handleSelectPlan}
                                        variant={plan.isPopular ? 'highlight' : 'default'}
                                        showYearlySavings={true}
                                        yearlySavingsPercentage={Math.round(
                                            calculateYearlySavings(plan.monthlyPrice, plan.yearlyPrice) /
                                            (plan.monthlyPrice * 12) *
                                            100
                                        )}
                                        role="listitem"
                                        aria-label={`${plan.name} subscription plan`}
                                    />
                                ))}
                            </div>

                            {/* Empty State */}
                            {renderEmptyState()}
                        </>
                    )}
                </section>

                {/* Features Comparison */}
                <section className={styles.featuresComparison} aria-label="Plan features comparison">
                    <h2 className={styles.comparisonTitle}>Compare All Features</h2>
                    <div className={styles.comparisonTable}>
                        <div className={styles.tableHeader}>
                            <div className={styles.tableCell}>Feature</div>
                            {plans.map((plan) => (
                                <div key={plan.id} className={styles.tableCell}>
                                    {plan.name}
                                </div>
                            ))}
                        </div>
                        {/* Add feature rows here based on your plan data structure */}
                    </div>
                </section>

                {/* Footer Section */}
                <footer className={styles.footer}>
                    <div className={styles.footerContent}>
                        <div className={styles.footerBadge}>
                            <Shield size={24} className={styles.footerIcon} />
                            <div className={styles.footerBadgeContent}>
                                <strong>30-Day Money-Back Guarantee</strong>
                                <span>Full refund if you're not satisfied</span>
                            </div>
                        </div>
                        <div className={styles.footerBadge}>
                            <RefreshCw size={24} className={styles.footerIcon} />
                            <div className={styles.footerBadgeContent}>
                                <strong>Flexible Upgrades</strong>
                                <span>Change plans anytime, no hidden fees</span>
                            </div>
                        </div>
                        <div className={styles.footerBadge}>
                            <CheckCircle size={24} className={styles.footerIcon} />
                            <div className={styles.footerBadgeContent}>
                                <strong>Cancel Anytime</strong>
                                <span>No contracts, no termination fees</span>
                            </div>
                        </div>
                    </div>

                    <p className={styles.footerNote}>
                        Need help choosing? <a href="/contact" className={styles.footerLink}>Contact our team</a>{' '}
                        for personalized recommendations.
                    </p>
                </footer>
            </div>
        </div>
    );
};

SubscriptionPlans.propTypes = {
    // Context props validation
    plans: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            description: PropTypes.string,
            monthlyPrice: PropTypes.number.isRequired,
            yearlyPrice: PropTypes.number.isRequired,
            features: PropTypes.arrayOf(PropTypes.string),
            isPopular: PropTypes.bool,
            isRecommended: PropTypes.bool,
        })
    ),
    currentSubscription: PropTypes.shape({
        planId: PropTypes.string,
        status: PropTypes.string,
    }),
    isLoading: PropTypes.bool,
};

SubscriptionPlans.defaultProps = {
    plans: [],
    currentSubscription: null,
    isLoading: false,
};

export default SubscriptionPlans;