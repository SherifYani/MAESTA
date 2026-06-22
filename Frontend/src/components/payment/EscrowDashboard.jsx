/**
 * @file EscrowDashboard.jsx
 * @description Escrow balance dashboard showing freelancer earnings with responsive design
 * @author Sherif Talaat
 * @date 2026-02-06
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */



import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Wallet, Clock, Lock, Banknote, AlertCircle, TrendingUp } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import WithdrawForm from './WithdrawForm';
import styles from './EscrowDashboard.module.css';

/**
 * Dashboard component for managing escrow balances and withdrawals.
 * Displays available, pending, locked, and total earnings with action options.
 * @returns {JSX.Element} Rendered escrow dashboard component
 */
const EscrowDashboard = () => {
    const { escrowBalance } = useSubscription();
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    /**
     * Format currency with proper localization
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    /**
     * Calculate percentage of available balance relative to total earnings
     * @returns {number} Percentage value (0-100)
     */
    const calculateAvailablePercentage = useMemo(() => {
        if (escrowBalance.totalEarnings <= 0) return 0;
        return (escrowBalance.available / escrowBalance.totalEarnings) * 100;
    }, [escrowBalance.available, escrowBalance.totalEarnings]);

    /**
     * Balance card configurations with color schemes using design system variables
     */
    const balanceCards = [
        {
            title: 'Available Balance',
            amount: escrowBalance.available,
            icon: Wallet,
            color: 'green',
            description: 'Ready to withdraw',
            gradient: 'from-chart-2 to-chart-2-dark',
        },
        {
            title: 'Pending Release',
            amount: escrowBalance.pending,
            icon: Clock,
            color: 'yellow',
            description: 'Awaiting milestone completion',
            gradient: 'from-chart-3 to-chart-3-dark',
        },
        {
            title: 'In Escrow',
            amount: escrowBalance.locked,
            icon: Lock,
            color: 'blue',
            description: 'Locked until project completion',
            gradient: 'from-chart-1 to-chart-1-dark',
        },
        {
            title: 'Total Earnings',
            amount: escrowBalance.totalEarnings,
            icon: Banknote,
            color: 'purple',
            description: 'All-time earnings',
            gradient: 'from-chart-4 to-chart-5',
        },
    ];

    /**
     * Info card configurations
     */
    const infoCards = [
        {
            title: 'Withdrawal Processing Times',
            icon: Clock,
            color: 'blue',
            items: [
                'Bank Transfer: 2-3 business days',
                'PayPal: 24-48 hours',
                'Minimum withdrawal: $10.00',
            ],
        },
        {
            title: 'How Escrow Works',
            icon: Lock,
            color: 'purple',
            items: [
                'Funds held securely until milestones are met',
                'Released automatically upon project completion',
                'Dispute resolution available',
            ],
        },
    ];

    /**
     * Handles withdrawal button click
     */
    const handleWithdrawClick = () => {
        setShowWithdrawModal(true);
    };

    return (
        <div className={styles.container}>
            {/* Dashboard Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Escrow Dashboard</h1>
                    <p className={styles.subtitle}>
                        Manage your freelance earnings and withdrawals
                    </p>
                </div>

                {/* Earnings Trend Indicator */}
                <div className={styles.trendIndicator}>
                    <TrendingUp size={20} className={styles.trendIcon} />
                    <span className={styles.trendText}>
                        {calculateAvailablePercentage.toFixed(0)}% available
                    </span>
                </div>
            </header>

            {/* Balance Cards Grid */}
            <div className={styles.balanceGrid}>
                {balanceCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <article
                            key={`balance-card-${index}`}
                            className={`${styles.balanceCard} ${styles[`balanceCard--${card.color}`]}`}
                            aria-label={`${card.title}: ${formatCurrency(card.amount)}`}
                        >
                            {/* Card Header */}
                            <div className={styles.cardHeader}>
                                <div className={styles.cardHeaderInner}>
                                    <div className={`${styles.iconContainer} ${styles[`iconContainer--${card.color}`]}`}>
                                        <Icon
                                            size={24}
                                            className={styles.cardIcon}
                                            aria-hidden="true"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className={styles.cardBody}>
                                <h2 className={styles.cardTitle}>{card.title}</h2>
                                <p className={styles.amount}>{formatCurrency(card.amount)}</p>
                                <p className={styles.description}>{card.description}</p>
                            </div>
                        </article>
                    );
                })}
            </div>

            {/* Quick Actions Section */}
            <section className={styles.actionsCard}>
                <h2 className={styles.actionsTitle}>Quick Actions</h2>
                <div className={styles.actionsContent}>
                    <div className={styles.actionsButtons}>
                        <button
                            type="button"
                            className={styles.withdrawButton}
                            onClick={handleWithdrawClick}
                            disabled={escrowBalance.available < 10}
                            aria-label={`Withdraw available balance of ${formatCurrency(escrowBalance.available)}`}
                            title={
                                escrowBalance.available < 10
                                    ? 'Minimum withdrawal amount is $10.00'
                                    : 'Withdraw available balance'
                            }
                        >
                            <Wallet size={20} className={styles.buttonIcon} />
                            <span>Withdraw Earnings</span>
                        </button>

                        {escrowBalance.available < 10 && (
                            <div className={styles.withdrawAlert} role="alert">
                                <AlertCircle size={16} className={styles.alertIcon} />
                                <p className={styles.alertText}>
                                    Minimum withdrawal amount is $10.00
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Information Cards Grid */}
            <div className={styles.infoGrid}>
                {infoCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <aside
                            key={`info-card-${index}`}
                            className={`${styles.infoCard} ${styles[`infoCard--${card.color}`]}`}
                        >
                            <h3 className={`${styles.infoTitle} ${styles[`infoTitle--${card.color}`]}`}>
                                <Icon size={20} className={styles.infoIcon} />
                                {card.title}
                            </h3>
                            <ul className={`${styles.infoList} ${styles[`infoList--${card.color}`]}`}>
                                {card.items.map((item, itemIndex) => (
                                    <li key={`info-item-${itemIndex}`}>{item}</li>
                                ))}
                            </ul>
                        </aside>
                    );
                })}
            </div>

            {/* Stats Summary */}
            <div className={styles.statsSummary}>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Available for Withdrawal</span>
                    <span className={styles.statValue}>{formatCurrency(escrowBalance.available)}</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Total in Escrow</span>
                    <span className={styles.statValue}>{formatCurrency(escrowBalance.locked)}</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Pending Release</span>
                    <span className={styles.statValue}>{formatCurrency(escrowBalance.pending)}</span>
                </div>
            </div>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <WithdrawForm
                    availableBalance={escrowBalance.available}
                    onClose={() => setShowWithdrawModal(false)}
                />
            )}
        </div>
    );
};

EscrowDashboard.propTypes = {
    // Context props validation
    escrowBalance: PropTypes.shape({
        available: PropTypes.number,
        pending: PropTypes.number,
        locked: PropTypes.number,
        totalEarnings: PropTypes.number,
    }),
};

export default EscrowDashboard;