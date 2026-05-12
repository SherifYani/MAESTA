/**
 * @file authService.js
 * @description Authentication services — all routes verified against the real
 *              JobMagnet.API AuthController (api/auth/*).
 * @author Sherif Talaat
 * @version 3.1.0
 * @date 2026-04-29
 *
 * @last-modified-by Antigravity (AI) — verified against AuthController.cs
 * @last-modified-date 2026-04-29
 *
 * REAL ROUTES (AuthController [Route("api/[controller]")]):
 *   POST   api/auth/register/step1      ← [AllowAnonymous]
 *   POST   api/auth/register/step2      ← [Authorize] (temp token from step1)
 *   POST   api/auth/verify-email        ← body: { email, code }
 *   POST   api/auth/resend-verification
 *   POST   api/auth/forgot-password
 *   POST   api/auth/reset-password
 *   POST   api/auth/enable-2fa          ← [Authorize]
 *   POST   api/auth/disable-2fa         ← [Authorize]
 *   POST   api/auth/verify-2fa
 *   POST   api/auth/login
 *   POST   api/auth/refresh-token       ← body: { refreshToken }
 *   POST   api/auth/logout              ← body: { refreshToken }
 *   POST   api/auth/logout-all          ← [Authorize]
 *   GET    api/auth/me                  ← [Authorize]
 *   POST   api/auth/login-google        ← body: "token" (string)
 *   POST   api/auth/login-linkedin      ← body: "token" (string)
 *   GET    api/auth/activate?email=&code=
 */

import ApiService from './ApiService';

const authService = {

    /**
     * Register Step 1 — basic info (email, password, name…).
     * Returns a temporary access token + refresh token for Step 2.
     * @param {Object} userData - { name, email, password, ... }
     */
    register: async (userData) => {
        const response = await ApiService.post('/api/auth/register/step1', userData);
        return response.data;
    },

    /**
     * Register Step 2 — select user type + role-specific data.
     * Requires the temporary token from Step 1 to be set in headers.
     * @param {Object} roleData - { userType, ... role-specific fields }
     */
    registerStep2: async (roleData) => {
        const response = await ApiService.post('/api/auth/register/step2', roleData);
        return response.data;
    },

    /**
     * Login with email and password.
     * Returns { accessToken, refreshToken, user }
     * @param {Object} credentials - { email, password }
     */
    login: async (credentials) => {
        const response = await ApiService.post('/api/auth/login', credentials);
        return response.data;
    },

    /**
     * Send a password-reset code to the given email.
     * @param {string} email
     */
    forgotPassword: async (email) => {
        const response = await ApiService.post('/api/auth/forgot-password', { email });
        return response.data;
    },

    /**
     * Reset password using the reset code received by email.
     * Backend expects a ResetPasswordRequest DTO.
     * @param {string} token   - the reset code
     * @param {string} newPassword
     */
    resetPassword: async (token, newPassword) => {
        const response = await ApiService.post('/api/auth/reset-password', { token, newPassword });
        return response.data;
    },

    /**
     * Verify email using the OTP code.
     * Backend expects: POST api/auth/verify-email with body { email, code }
     * @param {string} email
     * @param {string} code  - OTP code from the verification email
     */
    verifyEmail: async (email, code) => {
        const response = await ApiService.post('/api/auth/verify-email', { email, code });
        return response.data;
    },

    /**
     * Resend the verification code email.
     */
    resendVerification: async (email) => {
        const response = await ApiService.post('/api/auth/resend-verification', { email });
        return response.data;
    },

    /**
     * Login with Google OAuth token.
     * Backend sends the token as a raw string body.
     * @param {string} token - Google ID token
     */
    loginWithGoogle: async (token) => {
        const response = await ApiService.post('/api/auth/login-google', JSON.stringify(token), {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    },

    /**
     * Login with LinkedIn OAuth token.
     * @param {string} token - LinkedIn access token
     */
    loginWithLinkedIn: async (token) => {
        const response = await ApiService.post('/api/auth/login-linkedin', JSON.stringify(token), {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    },

    /**
     * Logout from the current device.
     * Backend requires body: { refreshToken }
     * @param {string} refreshToken
     */
    logout: async (refreshToken = '') => {
        try {
            await ApiService.post('/api/auth/logout', { refreshToken });
        } catch {
            // Swallow network errors — client-side token cleanup still happens in AuthContext
        }
    },

    /**
     * Logout from ALL devices — revokes all refresh tokens.
     */
    logoutAll: async () => {
        const response = await ApiService.post('/api/auth/logout-all');
        return response.data;
    },

    /**
     * Get the currently authenticated user's profile.
     * Called on page load to restore the session from a stored token.
     * @returns {{ id, name, email, role, ... }}
     */
    getCurrentUser: async () => {
        const response = await ApiService.get('/api/auth/me');
        return response.data;
    },

    /**
     * Refresh the access token using a refresh token.
     * Backend expects body: { refreshToken }
     * @param {string} refreshToken
     */
    refreshToken: async (refreshToken) => {
        const response = await ApiService.post('/api/auth/refresh-token', { refreshToken });
        return response.data;
    },

    /**
     * Change the authenticated user's password.
     * NOTE: This is actually on ProfileController: PUT api/profile/change-password
     * @param {string} currentPassword
     * @param {string} newPassword
     */
    changePassword: async (currentPassword, newPassword) => {
        const response = await ApiService.put('/api/profile/change-password', { currentPassword, newPassword });
        return response.data;
    },

    /**
     * Enable Two-Factor Authentication.
     */
    enable2FA: async () => {
        const response = await ApiService.post('/api/auth/enable-2fa');
        return response.data;
    },

    /**
     * Disable Two-Factor Authentication.
     */
    disable2FA: async () => {
        const response = await ApiService.post('/api/auth/disable-2fa');
        return response.data;
    },

    /**
     * Verify a 2FA code during login.
     * Backend expects a Verify2faRequest DTO.
     * @param {string} email
     * @param {string} code
     */
    verify2FA: async (email, code) => {
        const response = await ApiService.post('/api/auth/verify-2fa', { email, code });
        return response.data;
    },
};

export default authService;
