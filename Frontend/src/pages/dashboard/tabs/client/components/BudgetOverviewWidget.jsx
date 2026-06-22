/**
 * @file BudgetOverviewWidget.jsx
 * @description Budget overview widget for Client Dashboard
 * @author Sherif Talaat
 * @date 2026-1-29
 */
import { DollarSign, TrendingUp } from 'lucide-react';
import styles from '../ClientDashboard.module.css';

const BudgetOverviewWidget = ({
    budgetSpent,
    monthlyBudget,
    monthlyValue,
    spentValue,
    progressPercentage,
    earningsData
}) => {
    return (
        <div className={styles.budgetContent}>
            <div className={styles.budgetStats}>
                <div className={styles.budgetStat}>
                    <span className={styles.budgetStatLabel}>Spent This Month</span>
                    <span className={styles.budgetStatValue}>{budgetSpent}</span>
                </div>
                <div className={styles.budgetStat}>
                    <span className={styles.budgetStatLabel}>Monthly Budget</span>
                    <span className={styles.budgetStatValue}>{monthlyBudget}</span>
                </div>
            </div>

            <div className={styles.budgetProgress}>
                <div className={styles.budgetProgressHeader}>
                    <span className={styles.budgetProgressLabel}>Budget Usage</span>
                    <span className={styles.budgetProgressValue}>{progressPercentage}%</span>
                </div>
                <div className={styles.budgetProgressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            <div className={styles.budgetInsights}>
                <div className={styles.budgetInsight}>
                    <DollarSign size={16} />
                    <span>
                        Remaining: ${(monthlyValue - spentValue).toLocaleString()}
                    </span>
                </div>
                <div className={styles.budgetInsight}>
                    <TrendingUp size={16} />
                    <span>
                        {earningsData?.changePercentage || "+8.2%"} vs last month
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BudgetOverviewWidget;
