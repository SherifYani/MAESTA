import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import paymentService from '../services/paymentService';

const SubscriptionContext = createContext();

const ACTIONS = {
    SET_PLANS: 'SET_PLANS',
    SET_CURRENT_SUBSCRIPTION: 'SET_CURRENT_SUBSCRIPTION',
    SET_ESCROW_BALANCE: 'SET_ESCROW_BALANCE',
    SET_TRANSACTIONS: 'SET_TRANSACTIONS',
    ADD_TRANSACTION: 'ADD_TRANSACTION',
    SET_BILLING_PERIOD: 'SET_BILLING_PERIOD',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    TOGGLE_AUTO_RENEW: 'TOGGLE_AUTO_RENEW',
    UPDATE_SUBSCRIPTION: 'UPDATE_SUBSCRIPTION'
};

const defaultPlans = [
    { id: 'free', name: 'Free', monthlyPrice: 0, yearlyPrice: 0, features: ['Basic search', '3 applications/month'] },
    { id: 'basic', name: 'Basic', monthlyPrice: 9.99, yearlyPrice: 99.99, features: ['Advanced search', 'Unlimited applications', 'Profile badge'] },
    { id: 'pro', name: 'Professional', monthlyPrice: 29.99, yearlyPrice: 299.99, features: ['All Basic features', 'AI recommendations', 'Priority support', 'Analytics'] },
    { id: 'enterprise', name: 'Enterprise', monthlyPrice: 99.99, yearlyPrice: 999.99, features: ['All Pro features', 'Dedicated manager', 'Custom integrations', 'API access'] }
];

const initialState = {
    plans: defaultPlans,
    currentSubscription: null,
    escrowBalance: { total: 0, available: 0, pending: 0, totalWithdrawn: 0 },
    transactions: [],
    billingPeriod: 'monthly',
    loading: false,
    error: null
};

function subscriptionReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_PLANS:
            return { ...state, plans: action.payload };
        case ACTIONS.SET_CURRENT_SUBSCRIPTION:
            return { ...state, currentSubscription: action.payload };
        case ACTIONS.SET_ESCROW_BALANCE:
            return { ...state, escrowBalance: action.payload };
        case ACTIONS.SET_TRANSACTIONS:
            return { ...state, transactions: action.payload };
        case ACTIONS.ADD_TRANSACTION:
            return { ...state, transactions: [action.payload, ...state.transactions] };
        case ACTIONS.SET_BILLING_PERIOD:
            return { ...state, billingPeriod: action.payload };
        case ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload };
        case ACTIONS.SET_ERROR:
            return { ...state, error: action.payload };
        case ACTIONS.TOGGLE_AUTO_RENEW:
            return {
                ...state,
                currentSubscription: state.currentSubscription
                    ? { ...state.currentSubscription, autoRenew: !state.currentSubscription.autoRenew }
                    : state.currentSubscription
            };
        case ACTIONS.UPDATE_SUBSCRIPTION:
            return {
                ...state,
                currentSubscription: state.currentSubscription
                    ? { ...state.currentSubscription, ...action.payload }
                    : action.payload
            };
        default:
            return state;
    }
}

export function SubscriptionProvider({ children }) {
    const [state, dispatch] = useReducer(subscriptionReducer, initialState);

    useEffect(() => {
        loadSubscriptionData();
        loadBalance();
        loadTransactions();
    }, []);

    const loadSubscriptionData = async () => {
        try {
            const data = await paymentService.getCurrentSubscription();
            if (data) {
                dispatch({ type: ACTIONS.SET_CURRENT_SUBSCRIPTION, payload: data });
            }
        } catch (err) {
            console.warn('No active subscription found');
        }
    };

    const loadBalance = async () => {
        try {
            const data = await paymentService.getBalance();
            if (data) {
                dispatch({ type: ACTIONS.SET_ESCROW_BALANCE, payload: {
                    total: data.total || data.balance || 0,
                    available: data.available || data.balance || 0,
                    pending: data.pending || 0,
                    totalWithdrawn: data.totalWithdrawn || 0
                }});
            }
        } catch (err) {
            console.warn('Failed to load balance');
        }
    };

    const loadTransactions = async () => {
        try {
            const data = await paymentService.getTransactions();
            const transactions = data?.items || data || [];
            dispatch({ type: ACTIONS.SET_TRANSACTIONS, payload: transactions });
        } catch (err) {
            console.warn('Failed to load transactions');
        }
    };

    const subscribeToPlan = async (planId, billingPeriod, paymentDetails) => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: ACTIONS.SET_ERROR, payload: null });

        try {
            const plan = state.plans.find(p => p.id === planId);
            const amount = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

            const result = await paymentService.subscribeToPlan({
                planId,
                billingPeriod,
                amount,
                paymentDetails
            });

            if (result) {
                dispatch({
                    type: ACTIONS.UPDATE_SUBSCRIPTION,
                    payload: {
                        planId,
                        billingPeriod,
                        status: 'active',
                        currentPeriodStart: new Date().toISOString(),
                        currentPeriodEnd: new Date(Date.now() + (billingPeriod === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
                        nextBillingAmount: amount,
                        nextBillingDate: new Date(Date.now() + (billingPeriod === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString()
                    }
                });

                dispatch({
                    type: ACTIONS.ADD_TRANSACTION,
                    payload: {
                        id: result.transactionId || Date.now(),
                        date: new Date().toISOString(),
                        type: 'payment',
                        amount,
                        status: 'completed',
                        description: `${plan.name} Plan - ${billingPeriod === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`
                    }
                });

                dispatch({ type: ACTIONS.SET_LOADING, payload: false });
                return { success: true, message: 'Subscription activated successfully!' };
            } else {
                throw new Error('Subscription failed');
            }
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
            return { success: false, message: error.message };
        }
    };

    const cancelSubscription = async () => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        try {
            await paymentService.subscribeToPlan({ planId: 'free', billingPeriod: 'monthly', amount: 0 });
            dispatch({
                type: ACTIONS.UPDATE_SUBSCRIPTION,
                payload: { status: 'canceled', autoRenew: false }
            });
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
            return { success: true, message: 'Subscription canceled successfully' };
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
            return { success: false, message: error.message };
        }
    };

    const toggleAutoRenew = () => {
        dispatch({ type: ACTIONS.TOGGLE_AUTO_RENEW });
    };

    const withdrawEarnings = async (amount, method, accountDetails) => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: ACTIONS.SET_ERROR, payload: null });

        try {
            const result = await paymentService.requestWithdrawal(amount, method);

            if (result) {
                const fee = method === 'bank' ? amount * 0.01 : amount * 0.02;
                dispatch({
                    type: ACTIONS.SET_ESCROW_BALANCE,
                    payload: {
                        ...state.escrowBalance,
                        available: state.escrowBalance.available - amount - fee,
                        totalWithdrawn: state.escrowBalance.totalWithdrawn + amount
                    }
                });

                dispatch({
                    type: ACTIONS.ADD_TRANSACTION,
                    payload: {
                        id: result.transactionId || Date.now(),
                        date: new Date().toISOString(),
                        type: 'withdrawal',
                        amount: -(amount + fee),
                        status: 'pending',
                        description: `Withdrawal to ${method}`
                    }
                });

                dispatch({ type: ACTIONS.SET_LOADING, payload: false });
                return { success: true, message: result.message || 'Withdrawal initiated' };
            } else {
                throw new Error('Withdrawal failed');
            }
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
            return { success: false, message: error.message };
        }
    };

    const value = {
        ...state,
        subscribeToPlan,
        cancelSubscription,
        toggleAutoRenew,
        withdrawEarnings,
        loadBalance,
        loadTransactions,
        dispatch
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
}

export default SubscriptionContext;
