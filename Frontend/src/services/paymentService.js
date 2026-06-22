/**
 * @file paymentService.js
 * @description Payment services — verified against PaymentsController.cs.
 * @author Sherif Talaat
 * @version 2.1.0
 * @date 2026-04-29
 *
 * @last-modified-by Antigravity (AI) — verified against PaymentsController.cs
 * @last-modified-date 2026-04-29
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

const paymentService = {
    // Get saved payment methods
    getPaymentMethods: async () => {
        try {
            const response = await ApiService.get('/api/payments/methods');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Add payment method
    addPaymentMethod: async (paymentData) => {
        try {
            const response = await ApiService.post('/api/payments/methods', paymentData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Remove payment method
    removePaymentMethod: async (methodId) => {
        try {
            const response = await ApiService.delete(`/api/payments/methods/${methodId}`);
            return response.data;
        } catch (error) {
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
            throw error;
        }
    },

    // Get wallet balance
    getBalance: async () => {
        try {
            const response = await ApiService.get('/api/payments/balance');
            return response.data;
        } catch (error) {
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
            throw error;
        }
    },

    // Deposit funds
    depositFunds: async (amount, paymentMethodId) => {
        try {
            const response = await ApiService.post('/api/payments/deposit', { amount, paymentMethodId });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Request withdrawal
    requestWithdrawal: async (amount, withdrawalMethod) => {
        try {
            const response = await ApiService.post('/api/payments/withdraw', { amount, method: withdrawalMethod });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Deposit to escrow for a contract
    // Backend: POST api/payments/escrow/deposit — body: EscrowDepositRequest
    depositToEscrow: async (escrowDepositRequest) => {
        const response = await ApiService.post('/api/payments/escrow/deposit', escrowDepositRequest);
        return response.data;
    },

    // Release escrow for a completed contract
    // Backend: POST api/payments/escrow/release/{contractId}
    releaseEscrow: async (contractId) => {
        const response = await ApiService.post(`/api/payments/escrow/release/${contractId}`);
        return response.data;
    },

    // Refund escrow (Admin only)
    // Backend: POST api/payments/escrow/refund/{contractId}
    refundEscrow: async (contractId) => {
        const response = await ApiService.post(`/api/payments/escrow/refund/${contractId}`);
        return response.data;
    },

    // Subscribe to a plan
    // Backend: POST api/subscriptions/subscribe
    subscribeToPlan: async (planRequest) => {
        const response = await ApiService.post('/api/subscriptions/subscribe', planRequest);
        return response.data;
    },

    // Get current active subscription
    // Backend: GET api/subscriptions/current
    getCurrentSubscription: async () => {
        const response = await ApiService.get('/api/subscriptions/current');
        return response.data;
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
            throw error;
        }
    },

    // Request refund — maps to escrow refund
    requestRefund: async (transactionId, reason) => {
        try {
            const response = await ApiService.post(`/api/payments/escrow/refund/${transactionId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Link bank account
    linkBankAccount: async (bankData) => {
        try {
            const response = await ApiService.post('/api/payments/bank-accounts', bankData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get linked bank accounts
    getBankAccounts: async () => {
        try {
            const response = await ApiService.get('/api/payments/bank-accounts');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Calculate service fee
    calculateFee: async (amount, type) => {
        try {
            const response = await ApiService.get(`/api/payments/calculate-fee?amount=${amount}&type=${type}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default paymentService;
