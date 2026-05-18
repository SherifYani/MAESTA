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
            throw error.response?.data || error.message;
        }
    },

    // Add payment method
    addPaymentMethod: async (paymentData) => {
        try {
            const response = await ApiService.post('/api/payments/methods', paymentData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Remove payment method
    removePaymentMethod: async (methodId) => {
        try {
            const response = await ApiService.delete(`/api/payments/methods/${methodId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get transaction history
    getTransactions: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await ApiService.get(`/api/payments/transactions?${queryParams}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get wallet balance
    getBalance: async () => {
        try {
            const response = await ApiService.get('/api/payments/balance');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get earnings summary
    getEarningsSummary: async (period = 'month') => {
        try {
            // MOCKED: Not implemented in backend yet.
            console.warn("getEarningsSummary is mocked");
            return { totalEarnings: 0, pending: 0, available: 0, period };
            // const response = await ApiService.get(`/api/payments/earnings?period=${period}`);
            // return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Deposit funds
    depositFunds: async (amount, paymentMethodId) => {
        try {
            const response = await ApiService.post('/api/payments/deposit', { amount, paymentMethodId });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Request withdrawal
    requestWithdrawal: async (amount, withdrawalMethod) => {
        try {
            const response = await ApiService.post('/api/payments/withdraw', { amount, method: withdrawalMethod });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
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

    // Get invoices
    getInvoices: async () => {
        try {
            // MOCKED: Not implemented in backend yet.
            console.warn("getInvoices is mocked");
            return [];
            // const response = await ApiService.get('/api/payments/invoices');
            // return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Request refund
    requestRefund: async (transactionId, reason) => {
        try {
            // MOCKED: Not implemented in backend yet.
            console.warn("requestRefund is mocked");
            return { success: true, transactionId };
            // const response = await ApiService.post('/api/payments/refund', { transactionId, reason });
            // return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Link bank account
    linkBankAccount: async (bankData) => {
        try {
            const response = await ApiService.post('/api/payments/bank-accounts', bankData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Calculate service fee
    calculateFee: async (amount, type) => {
        try {
            const response = await ApiService.get(`/api/payments/calculate-fee?amount=${amount}&type=${type}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default paymentService;
