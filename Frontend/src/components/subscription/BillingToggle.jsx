/**
 * @file BillingToggle.jsx
 * @description Toggle switch for monthly/yearly billing period selection
 * @author Sherif Talaat
 * @date 2026-02-06
 */

import React from 'react';
import styles from './BillingToggle.module.css';

const BillingToggle = ({ billingPeriod, onChange, savings }) => {
    return (
        <div className={styles.container}>
            <span className={billingPeriod === 'monthly' ? styles.labelActive : styles.labelInactive}>
                Monthly
            </span>

            <button
                onClick={() => onChange(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                className={`${styles.toggle} ${billingPeriod === 'yearly' ? styles.toggleActive : ''}`}
                aria-pressed={billingPeriod === 'yearly'}
                aria-label="Toggle billing period"
            >
                <span className={`${styles.toggleThumb} ${billingPeriod === 'yearly' ? styles.toggleThumbActive : ''}`} />
            </button>

            <div className={styles.labelContainer}>
                <span className={billingPeriod === 'yearly' ? styles.labelActive : styles.labelInactive}>
                    Yearly
                </span>
                {savings && billingPeriod === 'yearly' && (
                    <span className={styles.savingsBadge}>
                        Save ${savings}
                    </span>
                )}
            </div>
        </div>
    );
};

export default BillingToggle;
