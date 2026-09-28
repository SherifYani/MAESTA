/**
 * @file paymentService.js
 * @description Payment services — verified against PaymentsController.cs.
 *              Falls back to mock data when the backend is unavailable.
 * @author Sherif Talaat
 * @version 2.2.0
 * @date 2026-04-29
 *
 * REAL ROUTES (PaymentsController [Route("api/[controller]")]):
 *   GET    api/payments/balance
 *   GET    api/payments/transactions?page=&limit=
 *   POST   api/payments/deposit          → DepositRequest
 *   POST   api/payments/withdraw         → WithdrawRequest
 *   POST   api/payments/escrow/deposit   → EscrowDepositRequest
 *   POST   api/payments/escrow/release/{contractId}
 *   POST   api/payments/escrow/refund/{contractId}   [Admin]
 *   POST   api/subscriptions/subscribe   → SubscribePlanRequest
 *   GET    api/subscriptions/current
 *   GET    api/payments/methods
 *   POST   api/payments/methods
 *   DELETE api/payments/methods/{id}
 *   GET    api/payments/bank-accounts
 *   POST   api/payments/bank-accounts
 *   GET    api/payments/calculate-fee?amount=&type=
 **/

import ApiService from './ApiService';
import { isNetworkError, MOCK_SUBSCRIPTION } from './mockData';

// ─── Mock fallback data defined locally (payment-specific) ───────────────────
const MOCK_BALANCE = {
    balance: 1250.00,
    available: 1000.00,
    pending: 250.00,
    totalEarnings: 4800.00,
    currency: 'USD',
};

const MOCK_TRANSACTIONS = [
    { id: 'tx-1', type: 'deposit', amount: 500, status: 'completed', date: '2026-09-10T10:00:00Z', description: 'Wallet top-up' },
    { id: 'tx-2', type: 'payment', amount: -1400, status: 'completed', date: '2026-09-15T14:00:00Z', description: 'Contract payment — React E-Commerce' },
    { id: 'tx-3', type: 'deposit', amount: 750, status: 'pending', date: '2026-09-25T09:00:00Z', description: 'Milestone release' },
];

const MOCK_PAYMENT_METHODS = [
    { id: 'pm-1', type: 'card', last4: '4242', brand: 'Visa', isDefault: true, expiresAt: '12/28' },
];

const MOCK_BANK_ACCOUNTS = [
    { id: 'ba-1', bankName: 'National Bank', accountNumber: '****1234', isDefault: true },
];

const paymentService = {
    // Get saved payment methods
    getPaymentMethods: async () => {
        try {
            const response = await ApiService.get('/api/payments/methods');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[paymentService] getPaymentMethods — mock fallback');
                return MOCK_PAYMENT_METHODS;
            }
            throw error;
        }
    },

    // Add payment method
    addPaymentMethod: async (paymentData) => {
        try {
            const response = await ApiService.post('/api/payments/methods', paymentData);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[paymentService] addPaymentMethod — mock fallback');
                return { id: `pm-mock-${Date.now()}`, ...paymentData };
            }
            throw error;
        }
    },

    // Remove payment method
    removePaymentMethod: async (methodId) => {
        try {
            const response = await ApiService.delete(`/api/payments/methods/${methodId}`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[paymentService] removePaymentMethod — mock fallback');
                return { message: 'Payment method removed (mock).' };
            }
            throw error;
        }
    },

    // Get transaction history
    getTransactions: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await ApiService.get(`/api/payments/transactions?${queryParams}`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[paymentService] getTransactions — mock fallback');
                return { items: MOCK_TRANSACTIONS, totalItems: MOCK_TRANSACTIONS.length };
            }
            throw error;
        }
    },

    // Get wallet balance
    getBalance: async () => {
        try {
            const response = await ApiService.get('/api/payments/balance');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[paymentService] getBalance — mock fallback');
                return MOCK_BALANCE;
            }
            throw error;
        }
    },

    // Get earnings summary
    getEarningsSummary: async (period = 'month') => {
        try {
            const response = await ApiService.get('/api/payments/balance');
            const transactionsRes = await ApiService.get('/api/payments/transactions', {
                params: { page: 1, limit: 100 }
            });
            const balance = response.data;
            const transactions = transactionsRes.data?.items || transactionsRes.data || [];
            return {
                totalEarnings: balance?.totalEarnings || balance?.balance || 0,
                pending: transactions
                    .filter(t => t.status === 'pending')
                    .reduce((sum, t) => sum + (t.amount || 0), 0),
                available: balance?.available || balance?.balance || 0,
                period
            };
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[paymentService] getEarningsSummary — mock fallback');
                return {
                    totalEarnings: MOCK_BALANCE.totalEarnings,
                    pending: MOCK_BALANCE.pending,
                    available: MOCK_BALANCE.available,
                    period,
                };
            }
            throw error;
        }
    },

    // Deposit funds
    depositFunds: async (amount, paymentMethodId) => {
        try {
            const response = await ApiService.post('/api/payments/deposit', { amount, paymentMethodId });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[paymentService] depositFunds — mock fallback');
                return { id: `tx-mock-${Date.now()}`, amount, type: 'deposit', status: 'completed' };
            }
            throw error;
        }
    },

    // Request withdrawal
    requestWithdrawal: async (amount, withdrawalMethod) => {
        try {
            const response = await ApiService.post('/api/payments/withdraw', { amount, method: withdrawalMethod });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[paymentService] requestWithdrawal — mock fallback');
                return { id: `tx-mock-${Date.now()}`, amount, type: 'withdrawal', status: 'pending' };
            }
            throw error;
        }
    },

    // Deposit to escrow for a contract
    depositToEscrow: async (escrowDepositRequest) => {
        try {
            const response = await ApiService.post('/api/payments/escrow/deposit', escrowDepositRequest);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[paymentService] depositToEscrow — mock fallback');
                return { message: 'Escrow deposit successful (mock).', ...escrowDepositRequest };
            }
            throw error;
        }
    },

    // Release escrow for a completed contract
    releaseEscrow: async (contractId) => {
        try {
            const response = await ApiService.post(`/api/payments/escrow/release/${contractId}`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[paymentService] releaseEscrow — mock fallback');
                return { message: 'Escrow released (mock).', contractId };
            }
            throw error;
        }
    },

    // Refund escrow (Admin only)
    refundEscrow: async (contractId) => {
        try {
            const response = await ApiService.post(`/api/payments/escrow/refund/${contractId}`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[paymentService] refundEscrow — mock fallback');
                return { message: 'Escrow refunded (mock).', contractId };
            }
            throw error;
        }
    },

    // Subscribe to a plan
    subscribeToPlan: async (planRequest) => {
        try {
            const response = await ApiService.post('/api/subscriptions/subscribe', planRequest);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[paymentService] subscribeToPlan — mock fallback');
                return { ...MOCK_SUBSCRIPTION, ...planRequest };
            }
            throw error;
        }
    },

    // Get current active subscription
    getCurrentSubscription: async () => {
        try {
            const response = await ApiService.get('/api/subscriptions/current');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[paymentService] getCurrentSubscription — mock fallback');
                return MOCK_SUBSCRIPTION;
            }
            throw error;
        }
    },

    // Get invoices — maps to transactions
    getInvoices: async () => {
        try {
            const response = await ApiService.get('/api/payments/transactions', {
                params: { page: 1, limit: 50 }
            });
            const transactions = response.data?.items || response.data || [];
            return transactions.filter(t => t.type === 'deposit' || t.type === 'payment');
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[paymentService] getInvoices — mock fallback');
                return MOCK_TRANSACTIONS.filter(t => t.type === 'deposit' || t.type === 'payment');
            }
            throw error;
        }
    },

    // Request refund — maps to escrow refund
    requestRefund: async (transactionId, reason) => {
        try {
            const response = await ApiService.post(`/api/payments/escrow/refund/${transactionId}`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[paymentService] requestRefund — mock fallback');
                return { message: 'Refund requested (mock).', transactionId };
            }
            throw error;
        }
    },

    // Link bank account
    linkBankAccount: async (bankData) => {
        try {
            const response = await ApiService.post('/api/payments/bank-accounts', bankData);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[paymentService] linkBankAccount — mock fallback');
                return { id: `ba-mock-${Date.now()}`, ...bankData };
            }
            throw error;
        }
    },

    // Get linked bank accounts
    getBankAccounts: async () => {
        try {
            const response = await ApiService.get('/api/payments/bank-accounts');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[paymentService] getBankAccounts — mock fallback');
                return MOCK_BANK_ACCOUNTS;
            }
            throw error;
        }
    },

    // Calculate service fee
    calculateFee: async (amount, type) => {
        try {
            const response = await ApiService.get(`/api/payments/calculate-fee?amount=${amount}&type=${type}`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[paymentService] calculateFee — mock fallback');
                // Simple 5% fee calculation for mock
                return { amount, fee: parseFloat((amount * 0.05).toFixed(2)), total: parseFloat((amount * 1.05).toFixed(2)), type };
            }
            throw error;
        }
    }
};

export default paymentService;
