/**
 * @file SubscriptionContext.jsx
 * @description Context provider for subscription and payment state management
 * @author Sherif Talaat
 * @date 2026-02-06
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
    SUBSCRIPTION_PLANS,
    MOCK_USER_SUBSCRIPTION,
    MOCK_ESCROW_BALANCE,
    MOCK_TRANSACTIONS,
    processPayment,
    processWithdrawal
} from '../mocks/subscriptionData';

// Create Context
const SubscriptionContext = createContext();

// Action Types
const ACTIONS = {
    SET_CURRENT_PLAN: 'SET_CURRENT_PLAN',
    SET_BILLING_PERIOD: 'SET_BILLING_PERIOD',
    SET_ESCROW_BALANCE: 'SET_ESCROW_BALANCE',
    ADD_TRANSACTION: 'ADD_TRANSACTION',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    TOGGLE_AUTO_RENEW: 'TOGGLE_AUTO_RENEW',
    UPDATE_SUBSCRIPTION: 'UPDATE_SUBSCRIPTION'
};

// Initial State
const initialState = {
    plans: SUBSCRIPTION_PLANS,
    currentSubscription: MOCK_USER_SUBSCRIPTION,
    escrowBalance: MOCK_ESCROW_BALANCE,
    transactions: MOCK_TRANSACTIONS,
    billingPeriod: 'monthly',
    loading: false,
    error: null
};

// Reducer
function subscriptionReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_CURRENT_PLAN:
            return {
                ...state,
                currentSubscription: {
                    ...state.currentSubscription,
                    planId: action.payload
                }
            };

        case ACTIONS.SET_BILLING_PERIOD:
            return {
                ...state,
                billingPeriod: action.payload
            };

        case ACTIONS.SET_ESCROW_BALANCE:
            return {
                ...state,
                escrowBalance: action.payload
            };

        case ACTIONS.ADD_TRANSACTION:
            return {
                ...state,
                transactions: [action.payload, ...state.transactions]
            };

        case ACTIONS.SET_LOADING:
            return {
                ...state,
                loading: action.payload
            };

        case ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload
            };

        case ACTIONS.TOGGLE_AUTO_RENEW:
            return {
                ...state,
                currentSubscription: {
                    ...state.currentSubscription,
                    autoRenew: !state.currentSubscription.autoRenew
                }
            };

        case ACTIONS.UPDATE_SUBSCRIPTION:
            return {
                ...state,
                currentSubscription: {
                    ...state.currentSubscription,
                    ...action.payload
                }
            };

        default:
            return state;
    }
}

// Provider Component
export function SubscriptionProvider({ children }) {
    const [state, dispatch] = useReducer(subscriptionReducer, initialState);

    // Subscribe to a plan
    const subscribeToPlan = async (planId, billingPeriod, paymentDetails) => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: ACTIONS.SET_ERROR, payload: null });

        try {
            // Process payment
            const result = await processPayment(paymentDetails);

            if (result.success) {
                // Update subscription
                const plan = state.plans.find(p => p.id === planId);
                const amount = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

                dispatch({
                    type: ACTIONS.UPDATE_SUBSCRIPTION,
                    payload: {
                        planId,
                        billingPeriod,
                        status: 'active',
                        currentPeriodStart: new Date(),
                        currentPeriodEnd: new Date(Date.now() + (billingPeriod === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000),
                        nextBillingAmount: amount,
                        nextBillingDate: new Date(Date.now() + (billingPeriod === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000)
                    }
                });

                // Add transaction
                dispatch({
                    type: ACTIONS.ADD_TRANSACTION,
                    payload: {
                        id: result.transactionId,
                        date: new Date(),
                        type: 'payment',
                        amount,
                        status: 'completed',
                        description: `${plan.name} Plan - ${billingPeriod === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`,
                        invoiceUrl: `/invoices/${result.transactionId}.pdf`,
                        metadata: { planId, period: billingPeriod }
                    }
                });

                dispatch({ type: ACTIONS.SET_LOADING, payload: false });
                return { success: true, message: 'Subscription activated successfully!' };
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
            return { success: false, message: error.message };
        }
    };

    // Cancel subscription
    const cancelSubscription = async () => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        dispatch({
            type: ACTIONS.UPDATE_SUBSCRIPTION,
            payload: {
                status: 'canceled',
                autoRenew: false
            }
        });

        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        return { success: true, message: 'Subscription canceled successfully' };
    };

    // Toggle auto-renew
    const toggleAutoRenew = () => {
        dispatch({ type: ACTIONS.TOGGLE_AUTO_RENEW });
    };

    // Withdraw earnings
    const withdrawEarnings = async (amount, method, accountDetails) => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: ACTIONS.SET_ERROR, payload: null });

        try {
            const result = await processWithdrawal({ amount, method, accountDetails });

            if (result.success) {
                // Update escrow balance
                const fee = method === 'bank' ? amount * 0.01 : amount * 0.02; // 1% for bank, 2% for others
                dispatch({
                    type: ACTIONS.SET_ESCROW_BALANCE,
                    payload: {
                        ...state.escrowBalance,
                        available: state.escrowBalance.available - amount - fee,
                        totalWithdrawn: state.escrowBalance.totalWithdrawn + amount
                    }
                });

                // Add transaction
                dispatch({
                    type: ACTIONS.ADD_TRANSACTION,
                    payload: {
                        id: result.transactionId,
                        date: new Date(),
                        type: 'withdrawal',
                        amount: -(amount + fee),
                        status: 'pending',
                        description: `Withdrawal to ${method}`,
                        invoiceUrl: null,
                        metadata: { method, fee, estimatedArrival: result.estimatedArrival }
                    }
                });

                dispatch({ type: ACTIONS.SET_LOADING, payload: false });
                return { success: true, message: result.message };
            } else {
                throw new Error(result.message);
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
        dispatch
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
}

// Custom Hook
export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
}

export default SubscriptionContext;
