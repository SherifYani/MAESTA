/**
 * @file SubscriptionPlansPage.jsx
 * @description Public page for viewing and selecting subscription plans
 * @author Sherif Talaat
 * @date 2026-02-06
 */

import React from 'react';
import SubscriptionPlans from '../components/subscription/SubscriptionPlans';
import styles from './SubscriptionPlansPage.module.css';

const SubscriptionPlansPage = () => {
    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <SubscriptionPlans />
            </div>
        </div>
    );
};

export default SubscriptionPlansPage;
