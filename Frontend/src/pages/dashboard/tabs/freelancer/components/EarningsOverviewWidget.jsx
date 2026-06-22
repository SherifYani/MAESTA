/**
 * @file EarningsOverviewWidget.jsx
 * @description Earnings overview for Freelancer Dashboard
 */
import React from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import styles from '../../freelancer/FreelancerDashboard.module.css';

const EarningsOverviewWidget = ({
    monthlyTarget,
    currentMonthEarnings,
    projectedTotal,
    earningsProgress,
    earningsData
}) => {
    return (
        <div className={styles.earningsContent}>
            <div className={styles.earningsStats}>
                <div className={styles.earningsStat}>
                    <span className={styles.earningsStatLabel}>This Month</span>
                    <span className={styles.earningsStatValue}>
                        ${currentMonthEarnings.toLocaleString()}
                    </span>
                </div>
                <div className={styles.earningsStat}>
                    <span className={styles.earningsStatLabel}>Projected</span>
                    <span className={styles.earningsStatValue}>
                        {typeof projectedTotal === "string"
                            ? projectedTotal
                            : `$${projectedTotal.toLocaleString()}`}
                    </span>
                </div>
            </div>

            <div className={styles.earningsProgress}>
                <div className={styles.earningsProgressHeader}>
                    <span className={styles.earningsProgressLabel}>Target Progress</span>
                    <span className={styles.earningsProgressValue}>{earningsProgress}%</span>
                </div>
                <div className={styles.earningsProgressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${earningsProgress}%` }}
                    />
                </div>
            </div>

            <div className={styles.earningsInsights}>
                <div className={styles.earningsInsight}>
                    <DollarSign size={16} />
                    <span>
                        Remaining: ${(monthlyTarget - currentMonthEarnings).toLocaleString()}
                    </span>
                </div>
                <div className={styles.earningsInsight}>
                    <TrendingUp size={16} />
                    <span>
                        {earningsData?.changePercentage || "+12.5%"} vs last month
                    </span>
                </div>
            </div>
        </div>
    );
};

export default EarningsOverviewWidget;
