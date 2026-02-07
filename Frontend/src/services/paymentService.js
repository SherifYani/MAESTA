/**
 * @file paymentService.js
 * @description Payment services - handles transactions, escrow, withdrawals, and payment methods
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 05-02-2026
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
            const response = await ApiService.get(`/api/payments/earnings?period=${period}`);
            return response.data;
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

    // Create escrow
    createEscrow: async (contractId, amount) => {
        try {
            const response = await ApiService.post('/api/payments/escrow', { contractId, amount });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Release escrow
    releaseEscrow: async (escrowId) => {
        try {
            const response = await ApiService.post(`/api/payments/escrow/${escrowId}/release`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get invoices
    getInvoices: async () => {
        try {
            const response = await ApiService.get('/api/payments/invoices');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Request refund
    requestRefund: async (transactionId, reason) => {
        try {
            const response = await ApiService.post('/api/payments/refund', { transactionId, reason });
            return response.data;
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
