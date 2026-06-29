/**
 * @file subscriptionData.js
 * @description Mock data for subscription plans, transactions, and escrow
 * @author Sherif Talaat
 * @date 2026-02-06
 */

// ============================================================================
// Subscription Plans
// ============================================================================

export const SUBSCRIPTION_PLANS = [
    {
        id: 'free',
        name: 'Free',
        description: 'Perfect for getting started',
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [
            '5 job postings per month',
            'Basic candidate search',
            'Standard support',
            'Profile visibility',
            'Email notifications'
        ],
        isPopular: false,
        colorScheme: 'gray',
        maxJobs: 5,
        maxApplicants: 20
    },
    {
        id: 'basic',
        name: 'Basic',
        description: 'Great for small businesses',
        monthlyPrice: 29,
        yearlyPrice: 290, // Save $58/year
        features: [
            '20 job postings per month',
            'Advanced candidate search',
            'Priority support',
            'Featured profile',
            'Analytics dashboard',
            'Resume downloads',
            'Custom branding'
        ],
        isPopular: false,
        colorScheme: 'blue',
        maxJobs: 20,
        maxApplicants: 100
    },
    {
        id: 'professional',
        name: 'Professional',
        description: 'Most popular for growing teams',
        monthlyPrice: 79,
        yearlyPrice: 790, // Save $158/year
        features: [
            'Unlimited job postings',
            'AI-powered candidate matching',
            'Dedicated account manager',
            'Premium profile placement',
            'Advanced analytics',
            'Unlimited resume downloads',
            'API access',
            'Team collaboration tools',
            'Custom workflows'
        ],
        isPopular: true,
        colorScheme: 'purple',
        maxJobs: -1, // unlimited
        maxApplicants: -1
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For large organizations',
        monthlyPrice: 199,
        yearlyPrice: 1990, // Save $398/year
        features: [
            'Everything in Professional',
            'White-label solution',
            'Custom integrations',
            'SLA guarantee',
            'On-premise deployment option',
            'Dedicated infrastructure',
            'Advanced security features',
            'Training & onboarding',
            'Custom contract terms',
            '24/7 phone support'
        ],
        isPopular: false,
        colorScheme: 'gold',
        maxJobs: -1,
        maxApplicants: -1
    }
];

// ============================================================================
// Mock User Subscription
// ============================================================================

export const MOCK_USER_SUBSCRIPTION = {
    planId: 'basic',
    status: 'active',
    billingPeriod: 'monthly',
    currentPeriodStart: new Date('2026-01-06'),
    currentPeriodEnd: new Date('2026-03-06'),
    autoRenew: true,
    paymentMethod: 'Visa ending in 4242',
    nextBillingDate: new Date('2026-03-06'),
    nextBillingAmount: 29
};

// ============================================================================
// Mock Escrow Balance
// ============================================================================

export const MOCK_ESCROW_BALANCE = {
    available: 2450.00,
    pending: 850.00,
    locked: 320.00,
    currency: 'USD',
    totalEarnings: 5280.00,
    totalWithdrawn: 1660.00
};

// ============================================================================
// Mock Transactions
// ============================================================================

export const MOCK_TRANSACTIONS = [
    {
        id: 'TXN-001',
        date: new Date('2026-02-06T10:30:00'),
        type: 'payment',
        amount: 29.00,
        status: 'completed',
        description: 'Basic Plan - Monthly Subscription',
        invoiceUrl: '/invoices/INV-2026-02-001.pdf',
        metadata: { planId: 'basic', period: 'monthly' }
    },
    {
        id: 'TXN-002',
        date: new Date('2026-02-05T14:22:00'),
        type: 'withdrawal',
        amount: -500.00,
        status: 'completed',
        description: 'Withdrawal to Bank Account ending in 7890',
        invoiceUrl: '/invoices/INV-2026-02-002.pdf',
        metadata: { method: 'bank', fee: 5.00 }
    },
    {
        id: 'TXN-003',
        date: new Date('2026-02-04T09:15:00'),
        type: 'commission',
        amount: 150.00,
        status: 'completed',
        description: 'Escrow release for Project #4521',
        invoiceUrl: null,
        metadata: { projectId: '4521', gigId: 'GIG-042' }
    },
    {
        id: 'TXN-004',
        date: new Date('2026-02-03T16:45:00'),
        type: 'payment',
        amount: 450.00,
        status: 'completed',
        description: 'Gig payment - Website Redesign',
        invoiceUrl: '/invoices/INV-2026-02-004.pdf',
        metadata: { gigId: 'GIG-042' }
    },
    {
        id: 'TXN-005',
        date: new Date('2026-02-02T11:20:00'),
        type: 'withdrawal',
        amount: -300.00,
        status: 'pending',
        description: 'Withdrawal to PayPal',
        invoiceUrl: null,
        metadata: { method: 'paypal', fee: 3.00 }
    },
    {
        id: 'TXN-006',
        date: new Date('2026-02-01T08:30:00'),
        type: 'commission',
        amount: 200.00,
        status: 'completed',
        description: 'Escrow release for Project #4512',
        invoiceUrl: null,
        metadata: { projectId: '4512', gigId: 'GIG-038' }
    },
    {
        id: 'TXN-007',
        date: new Date('2026-01-30T13:10:00'),
        type: 'refund',
        amount: 29.00,
        status: 'completed',
        description: 'Refund - Subscription cancellation',
        invoiceUrl: '/invoices/INV-2026-01-007.pdf',
        metadata: { reason: 'User requested refund' }
    },
    {
        id: 'TXN-008',
        date: new Date('2026-01-28T10:05:00'),
        type: 'payment',
        amount: 350.00,
        status: 'completed',
        description: 'Gig payment - Logo Design',
        invoiceUrl: '/invoices/INV-2026-01-008.pdf',
        metadata: { gigId: 'GIG-035' }
    },
    {
        id: 'TXN-009',
        date: new Date('2026-01-25T15:40:00'),
        type: 'withdrawal',
        amount: -800.00,
        status: 'completed',
        description: 'Withdrawal to Bank Account ending in 7890',
        invoiceUrl: '/invoices/INV-2026-01-009.pdf',
        metadata: { method: 'bank', fee: 8.00 }
    },
    {
        id: 'TXN-010',
        date: new Date('2026-01-22T09:25:00'),
        type: 'commission',
        amount: 175.00,
        status: 'completed',
        description: 'Escrow release for Project #4498',
        invoiceUrl: null,
        metadata: { projectId: '4498', gigId: 'GIG-032' }
    },
    {
        id: 'TXN-011',
        date: new Date('2026-01-20T12:50:00'),
        type: 'payment',
        amount: 29.00,
        status: 'failed',
        description: 'Basic Plan - Monthly Subscription (Payment Failed)',
        invoiceUrl: null,
        metadata: { planId: 'basic', period: 'monthly', error: 'Insufficient funds' }
    },
    {
        id: 'TXN-012',
        date: new Date('2026-01-18T14:15:00'),
        type: 'payment',
        amount: 550.00,
        status: 'completed',
        description: 'Gig payment - Mobile App Development',
        invoiceUrl: '/invoices/INV-2026-01-012.pdf',
        metadata: { gigId: 'GIG-028' }
    }
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get subscription plan by ID
 * @param {string} planId 
 * @returns {object|null}
 */
export const getSubscriptionPlan = (planId) => {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId) || null;
};

/**
 * Calculate yearly savings
 * @param {number} monthlyPrice 
 * @param {number} yearlyPrice 
 * @returns {number}
 */
export const calculateYearlySavings = (monthlyPrice, yearlyPrice) => {
    return (monthlyPrice * 12) - yearlyPrice;
};

/**
 * Calculate upgrade/downgrade price difference
 * @param {string} currentPlanId 
 * @param {string} newPlanId 
 * @param {string} billingPeriod 
 * @returns {number} Positive for upgrade, negative for downgrade
 */
export const calculatePriceDifference = (currentPlanId, newPlanId, billingPeriod = 'monthly') => {
    const currentPlan = getSubscriptionPlan(currentPlanId);
    const newPlan = getSubscriptionPlan(newPlanId);

    if (!currentPlan || !newPlan) return 0;

    const currentPrice = billingPeriod === 'monthly' ? currentPlan.monthlyPrice : currentPlan.yearlyPrice;
    const newPrice = billingPeriod === 'monthly' ? newPlan.monthlyPrice : newPlan.yearlyPrice;

    return newPrice - currentPrice;
};

/**
 * Filter transactions by type
 * @param {Array} transactions 
 * @param {string} type 
 * @returns {Array}
 */
export const filterTransactionsByType = (transactions, type) => {
    if (type === 'all') return transactions;
    return transactions.filter(t => t.type === type);
};

/**
 * Filter transactions by status
 * @param {Array} transactions 
 * @param {string} status 
 * @returns {Array}
 */
export const filterTransactionsByStatus = (transactions, status) => {
    if (status === 'all') return transactions;
    return transactions.filter(t => t.status === status);
};

/**
 * Mock payment processing function
 * @param {object} paymentDetails 
 * @returns {Promise}
 */
export const processPayment = async (paymentDetails) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock validation
    if (paymentDetails.cardNumber === '4242424242424242') {
        return {
            success: true,
            transactionId: `TXN-${Date.now()}`,
            message: 'Payment processed successfully'
        };
    }

    // Simulate random success/failure
    const success = Math.random() > 0.2; // 80% success rate

    return {
        success,
        transactionId: success ? `TXN-${Date.now()}` : null,
        message: success ? 'Payment processed successfully' : 'Payment failed - please try again'
    };
};

/**
 * Mock withdrawal processing function
 * @param {object} withdrawalDetails 
 * @returns {Promise}
 */
export const processWithdrawal = async (withdrawalDetails) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock validation
    if (withdrawalDetails.amount > MOCK_ESCROW_BALANCE.available) {
        return {
            success: false,
            message: 'Insufficient available balance'
        };
    }

    if (withdrawalDetails.amount < 10) {
        return {
            success: false,
            message: 'Minimum withdrawal amount is $10'
        };
    }

    return {
        success: true,
        transactionId: `TXN-${Date.now()}`,
        message: 'Withdrawal request submitted successfully',
        estimatedArrival: '2-3 business days'
    };
};
