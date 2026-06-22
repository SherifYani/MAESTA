/**
 * @file SubscriptionPlansPage.jsx
 * @description Public page for viewing and selecting subscription plans
 * @author Sherif Talaat
 * @date 2026-02-06
 */

import React from 'react';
import SubscriptionPlans from '../components/subscription/SubscriptionPlans';
import { PageContainer } from '../components/layout';
import styles from './SubscriptionPlansPage.module.css';

const SubscriptionPlansPage = () => {
    return (
        <PageContainer className={styles.page}>
            <SubscriptionPlans />
        </PageContainer>
    );
};

export default SubscriptionPlansPage;
