/**
 * @file authService.js
 * @description Authentication services - handles user registration, login, password reset, and 2FA
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 05-02-2026
**/

import ApiService from './ApiService';

const authService = {
    // Register new user
    register: async (userData) => {
        try {
            const response = await ApiService.post('/api/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // User login
    login: async (credentials) => {
        try {
            const response = await ApiService.post('/api/auth/login', credentials);

            // Store token
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }

            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Forgot password
    forgotPassword: async (email) => {
        try {
            const response = await ApiService.post('/api/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Reset password
    resetPassword: async (token, newPassword) => {
        try {
            const response = await ApiService.post('/api/auth/reset-password', {
                token,
                newPassword
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Verify email
    verifyEmail: async (token) => {
        try {
            const response = await ApiService.get(`/api/auth/verify-email/${token}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Resend verification email
    resendVerification: async (email) => {
        try {
            const response = await ApiService.post('/api/auth/resend-verification', { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Google login
    loginWithGoogle: async (token) => {
        try {
            const response = await ApiService.post('/api/auth/google-login', { token });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }

            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // LinkedIn login
    loginWithLinkedIn: async (token) => {
        try {
            const response = await ApiService.post('/api/auth/linkedin-login', { token });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }

            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return Promise.resolve();
    },

    // Get current user
    getCurrentUser: async () => {
        try {
            const response = await ApiService.get('/api/auth/me');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Validate token
    validateToken: async () => {
        try {
            const response = await ApiService.get('/api/auth/validate-token');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Change password
    changePassword: async (currentPassword, newPassword) => {
        try {
            const response = await ApiService.put('/api/auth/change-password', {
                currentPassword,
                newPassword
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Enable/Disable 2FA
    toggle2FA: async (enable) => {
        try {
            const endpoint = enable
                ? '/api/auth/enable-2fa'
                : '/api/auth/disable-2fa';

            const response = await ApiService.post(endpoint);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Verify 2FA code
    verify2FA: async (code) => {
        try {
            const response = await ApiService.post('/api/auth/verify-2fa', { code });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default authService;
