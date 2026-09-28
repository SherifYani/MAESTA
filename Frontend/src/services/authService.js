/**
 * @file authService.js
 * @description Authentication services — all routes verified against the real
 *              JobMagnet.API AuthController (api/auth/*).
 *              Falls back to mock data when the backend is unavailable.
 * @author Sherif Talaat
 * @version 3.2.0
 * @date 2026-04-29
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
import {
    isNetworkError,
    MOCK_USER,
    MOCK_TOKEN_RESPONSE,
    findMockUser,
    createMockTokenResponse,
} from './mockData';

const authService = {

    /**
     * Dedicated direct Mock Login helper — immediately prepares user and session.
     * @param {string} roleOrEmail - e.g. 'jobSeeker', 'employer', 'freelancer', 'admin', 'client', or any email
     */
    mockLogin: (roleOrEmail = 'jobSeeker') => {
        const mockUser = findMockUser(roleOrEmail);
        const response = createMockTokenResponse(mockUser);
        try {
            localStorage.setItem('maesta_mock_user', JSON.stringify(mockUser));
        } catch (e) {
            console.error('[authService] Failed to store mock user session', e);
        }
        return response;
    },

    /**
     * Register Step 1 — basic info (email, password, name…).
     * Returns a temporary access token + refresh token for Step 2.
     * @param {Object} userData - { name, email, password, ... }
     */
    register: async (userData) => {
        try {
            const response = await ApiService.post('/api/auth/register/step1', userData);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[authService] register — mock fallback');
                const mockUser = findMockUser(userData?.email || 'jobseeker');
                try {
                    localStorage.setItem('maesta_mock_user', JSON.stringify(mockUser));
                } catch {}
                return createMockTokenResponse(mockUser);
            }
            throw error;
        }
    },

    /**
     * Register Step 2 — select user type + role-specific data.
     * Requires the temporary token from Step 1 to be set in headers.
     * @param {Object} roleData - { userType, ... role-specific fields }
     */
    registerStep2: async (roleData) => {
        try {
            const response = await ApiService.post('/api/auth/register/step2', roleData);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[authService] registerStep2 — mock fallback');
                const role = roleData?.userType || 'jobseeker';
                const mockUser = findMockUser(role);
                try {
                    localStorage.setItem('maesta_mock_user', JSON.stringify(mockUser));
                } catch {}
                return createMockTokenResponse(mockUser);
            }
            throw error;
        }
    },

    /**
     * Login with email and password.
     * Returns { accessToken, refreshToken, user }
     * @param {Object} credentials - { email, password }
     */
    login: async (credentials) => {
        try {
            const response = await ApiService.post('/api/auth/login', credentials);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[authService] login — mock fallback');
                const mockUser = findMockUser(credentials?.email || credentials?.role);
                const mockAuthResponse = createMockTokenResponse(mockUser);
                try {
                    localStorage.setItem('maesta_mock_user', JSON.stringify(mockUser));
                } catch (e) {
                    console.error('[authService] Failed to save mock session', e);
                }
                return mockAuthResponse;
            }
            throw error;
        }
    },

    /**
     * Send a password-reset code to the given email.
     * @param {string} email
     */
    forgotPassword: async (email) => {
        try {
            const response = await ApiService.post('/api/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[authService] forgotPassword — mock fallback');
                return { message: 'Reset email sent (mock).' };
            }
            throw error;
        }
    },

    /**
     * Reset password using the reset code received by email.
     * Backend expects a ResetPasswordRequest DTO.
     * @param {string} token   - the reset code
     * @param {string} newPassword
     */
    resetPassword: async (token, newPassword) => {
        try {
            const response = await ApiService.post('/api/auth/reset-password', { token, newPassword });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[authService] resetPassword — mock fallback');
                return { message: 'Password reset successful (mock).' };
            }
            throw error;
        }
    },

    /**
     * Verify email using the OTP code.
     * Backend expects: POST api/auth/verify-email with body { email, code }
     * @param {string} email
     * @param {string} code  - OTP code from the verification email
     */
    verifyEmail: async (email, code) => {
        try {
            const response = await ApiService.post('/api/auth/verify-email', { email, code });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[authService] verifyEmail — mock fallback');
                return { message: 'Email verified (mock).' };
            }
            throw error;
        }
    },

    /**
     * Resend the verification code email.
     */
    resendVerification: async (email) => {
        try {
            const response = await ApiService.post('/api/auth/resend-verification', { email });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[authService] resendVerification — mock fallback');
                return { message: 'Verification email resent (mock).' };
            }
            throw error;
        }
    },

    /**
     * Login with Google OAuth token.
     * Backend sends the token as a raw string body.
     * @param {string} token - Google ID token
     */
    loginWithGoogle: async (token) => {
        try {
            const response = await ApiService.post('/api/auth/login-google', JSON.stringify(token), {
                headers: { 'Content-Type': 'application/json' }
            });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[authService] loginWithGoogle — mock fallback');
                const mockUser = {
                    ...findMockUser('jobseeker'),
                    id: 'mock-google-user',
                    userId: 'mock-google-user',
                    firstName: 'Google',
                    lastName: 'User',
                    name: 'Google User',
                    email: 'google.demo@example.com',
                };
                try {
                    localStorage.setItem('maesta_mock_user', JSON.stringify(mockUser));
                } catch {}
                return createMockTokenResponse(mockUser);
            }
            throw error;
        }
    },

    /**
     * Login with LinkedIn OAuth token.
     * @param {string} token - LinkedIn access token
     */
    loginWithLinkedIn: async (token) => {
        try {
            const response = await ApiService.post('/api/auth/login-linkedin', JSON.stringify(token), {
                headers: { 'Content-Type': 'application/json' }
            });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[authService] loginWithLinkedIn — mock fallback');
                const mockUser = {
                    ...findMockUser('jobseeker'),
                    id: 'mock-linkedin-user',
                    userId: 'mock-linkedin-user',
                    firstName: 'LinkedIn',
                    lastName: 'Professional',
                    name: 'LinkedIn Professional',
                    email: 'linkedin.demo@example.com',
                };
                try {
                    localStorage.setItem('maesta_mock_user', JSON.stringify(mockUser));
                } catch {}
                return createMockTokenResponse(mockUser);
            }
            throw error;
        }
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
        } finally {
            try {
                localStorage.removeItem('maesta_mock_user');
            } catch {}
        }
    },

    /**
     * Logout from ALL devices — revokes all refresh tokens.
     */
    logoutAll: async () => {
        try {
            const response = await ApiService.post('/api/auth/logout-all');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[authService] logoutAll — mock fallback');
                try {
                    localStorage.removeItem('maesta_mock_user');
                } catch {}
                return { message: 'Logged out from all devices (mock).' };
            }
            throw error;
        }
    },

    /**
     * Get the currently authenticated user's profile.
     * Called on page load to restore the session from a stored token.
     * @returns {{ id, name, email, role, ... }}
     */
    getCurrentUser: async () => {
        try {
            const response = await ApiService.get('/api/auth/me');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[authService] getCurrentUser — mock fallback');
                try {
                    const savedMock = localStorage.getItem('maesta_mock_user');
                    if (savedMock) {
                        return JSON.parse(savedMock);
                    }
                } catch (e) {
                    console.warn('[authService] Error parsing maesta_mock_user', e);
                }
                return MOCK_USER;
            }
            throw error;
        }
    },

    /**
     * Refresh the access token using a refresh token.
     * Backend expects body: { refreshToken }
     * @param {string} refreshToken
     */
    refreshToken: async (refreshToken) => {
        try {
            const response = await ApiService.post('/api/auth/refresh-token', { refreshToken });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[authService] refreshToken — mock fallback');
                return MOCK_TOKEN_RESPONSE;
            }
            throw error;
        }
    },

    /**
     * Change the authenticated user's password.
     * NOTE: This is actually on ProfileController: PUT api/profile/change-password
     * @param {string} currentPassword
     * @param {string} newPassword
     */
    changePassword: async (currentPassword, newPassword) => {
        try {
            const response = await ApiService.put('/api/profile/change-password', { currentPassword, newPassword });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[authService] changePassword — mock fallback');
                return { message: 'Password changed (mock).' };
            }
            throw error;
        }
    },

    /**
     * Enable Two-Factor Authentication.
     */
    enable2FA: async () => {
        try {
            const response = await ApiService.post('/api/auth/enable-2fa');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[authService] enable2FA — mock fallback');
                return { message: '2FA enabled (mock).' };
            }
            throw error;
        }
    },

    /**
     * Disable Two-Factor Authentication.
     */
    disable2FA: async () => {
        try {
            const response = await ApiService.post('/api/auth/disable-2fa');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[authService] disable2FA — mock fallback');
                return { message: '2FA disabled (mock).' };
            }
            throw error;
        }
    },

    /**
     * Verify a 2FA code during login.
     * Backend expects a Verify2faRequest DTO.
     * @param {string} email
     * @param {string} code
     */
    verify2FA: async (email, code) => {
        try {
            const response = await ApiService.post('/api/auth/verify-2fa', { email, code });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[authService] verify2FA — mock fallback');
                return MOCK_TOKEN_RESPONSE;
            }
            throw error;
        }
    },
};

export default authService;
