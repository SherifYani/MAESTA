/**
 * @file PaymentPage.jsx
 * @description Payment processing page for subscription checkout
 * @author Sherif Talaat
 * @date 2026-02-06
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';
import PaymentCheckout from '../components/subscription/PaymentCheckout';
import { CheckCircle, XCircle } from 'lucide-react';
import { PageContainer } from '../components/layout';
import styles from './PaymentPage.module.css';

const PaymentPage = () => {
    const { planId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { plans, subscribeToPlan, loading } = useSubscription();

    const [paymentStatus, setPaymentStatus] = useState(null); // null, 'success', 'error'
    const [message, setMessage] = useState('');

    const billingPeriod = searchParams.get('period') || 'monthly';
    const plan = plans.find(p => p.id === planId);

    useEffect(() => {
        if (!plan) {
            navigate('/subscription/plans');
        }
    }, [plan, navigate]);

    const handlePaymentSubmit = async (paymentDetails) => {
        const result = await subscribeToPlan(planId, billingPeriod, paymentDetails);

        if (result.success) {
            setPaymentStatus('success');
            setMessage(result.message);
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
                navigate('/dashboard/subscription');
            }, 3000);
        } else {
            setPaymentStatus('error');
            setMessage(result.message);
            // Clear error after 5 seconds
            setTimeout(() => {
                setPaymentStatus(null);
                setMessage('');
            }, 5000);
        }
    };

    const handleCancel = () => {
        navigate('/subscription/plans');
    };

    if (!plan) {
        return null;
    }

    // Success State
    if (paymentStatus === 'success') {
        return (
            <div className={styles.successPage}>
                <div className={styles.successCard}>
                    <div className={styles.successIconWrapper}>
                        <div className={styles.successIconBg}>
                            <CheckCircle className={styles.successIcon} size={48} />
                        </div>
                    </div>
                    <h2 className={styles.successTitle}>Payment Successful!</h2>
                    <p className={styles.successMessage}>{message}</p>
                    <p className={styles.redirectText}>
                        Redirecting to your dashboard...
                    </p>
                    <div className={styles.spinnerWrapper}>
                        <div className={styles.spinner}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <PageContainer className={styles.pageContainer}>
                {/* Page Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        Complete Your Purchase
                    </h1>
                    <p className={styles.subtitle}>
                        You're subscribing to the <span className={styles.planName}>{plan.name}</span> plan
                    </p>
                </div>

                {/* Error Message */}
                {paymentStatus === 'error' && (
                    <div className={styles.errorAlert}>
                        <XCircle className={styles.errorIcon} size={24} />
                        <div>
                            <h3 className={styles.errorTitle}>Payment Failed</h3>
                            <p className={styles.errorMessage}>{message}</p>
                        </div>
                    </div>
                )}

                {/* Payment Checkout Component */}
                <div className={styles.checkoutWrapper}>
                    <PaymentCheckout
                        plan={plan}
                        billingPeriod={billingPeriod}
                        onSubmit={handlePaymentSubmit}
                        onCancel={handleCancel}
                        loading={loading}
                    />
                </div>
            </PageContainer>
        </div>
    );
};

export default PaymentPage;
