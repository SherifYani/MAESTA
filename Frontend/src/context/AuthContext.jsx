/**
 * @file AuthContext.jsx
 * @description Authentication context — manages user authentication state globally.
 *              Response shapes verified against AuthResponse.cs and CurrentUserResponse.cs.
 * @author Sherif Talaat
 * @version 4.0.0
 * @date 2026-04-29
 *
 * @last-modified-by Antigravity (AI) — verified against real DTO shapes
 * @last-modified-date 2026-04-29
 *
 * BACKEND AuthResponse shape:
 *   { userId, email, userType, registrationStatus, accessToken,
 *     accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt, requiresTwoFactor }
 *
 * BACKEND CurrentUserResponse shape (GET api/auth/me):
 *   { userId, email, firstName, lastName, userType, registrationStatus,
 *     isActive, roles[], jobSeekerProfile?, employerProfile? }
 **/

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { tokenService } from '../lib/token-service';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ─── Core Authentication Methods ──────────────────────────────────────────────

    /**
     * Checks if there's a valid session token, and restores the user.
     * Called automatically on mount.
     * Backend GET api/auth/me returns CurrentUserResponse:
     *   { userId, email, firstName, lastName, userType, registrationStatus, isActive, roles[], ... }
     */
    const checkAuth = useCallback(async () => {
        const token = tokenService.getToken();
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }


        try {
            setLoading(true);
            const data = await authService.getCurrentUser();
            // Backend returns CurrentUserResponse directly (not wrapped in { user })
            if (data && data.userId) {
                setUser(normalizeUser(data));
            } else {
                tokenService.clearToken();
                setUser(null);
            }
        } catch (err) {
            console.error('Failed to restore session from token:', err);
            tokenService.clearToken();
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Normalize the backend user object into a consistent frontend shape.
     * Handles both AuthResponse (from login) and CurrentUserResponse (from /me).
     */
    const normalizeUser = (data) => {
        // Only set role if userType is provided by backend
        let normalizedRole = null;
        if (data.userType) {
            normalizedRole = data.userType.toLowerCase();
            if (normalizedRole === 'employer') {
                normalizedRole = 'company';
            }
        }

        return {
            id:                 data.userId,
            email:              data.email,
            firstName:          data.firstName  || '',
            lastName:           data.lastName   || '',
            name:               data.firstName  ? `${data.firstName} ${data.lastName}`.trim() : data.email,
            role:               normalizedRole,
            userType:           data.userType,
            registrationStatus: data.registrationStatus,
            isActive:           data.isActive,
            roles:              data.roles      || [],
            profilePicture:     data.profilePictureUrl || null,
            // Role-specific nested profiles (present in CurrentUserResponse)
            jobSeekerProfile:   data.jobSeekerProfile  || null,
            employerProfile:    data.employerProfile   || null,
        };
    };

    // Initialisation on app load
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (credentials) => {
        try {
            setError(null);
            setLoading(true);

            // Backend AuthResponse: { userId, email, userType, accessToken, refreshToken, requiresTwoFactor }
            const data = await authService.login(credentials);

            // Handle 2FA requirement
            if (data.requiresTwoFactor) {
                return { requiresTwoFactor: true, email: data.email };
            }

            // Store both tokens
            if (data.accessToken) {
                tokenService.setToken(data.accessToken);
            }
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }

            // Build normalized user from AuthResponse fields by calling checkAuth to get full profile
            await checkAuth();

            return data;
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Login failed';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            // Pass refreshToken so backend can revoke it
            const refreshToken = localStorage.getItem('refreshToken') || '';
            await authService.logout(refreshToken);
        } catch {
            // Swallow network errors on logout
        } finally {
            tokenService.clearToken();
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('redirectAfterLogin');
            setUser(null);
            setError(null);
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            setLoading(true);
            // Step 1 — returns AuthResponse with a temp accessToken
            const data = await authService.register(userData);
            // Store the temp token so Step 2 request is authorized
            if (data.accessToken) {
                tokenService.setToken(data.accessToken);
            }
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }
            
            await checkAuth();
            
            return data;
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Registration failed';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // ─── Remaining Auth Methods ───────────────────────────────────────────────────

    const forgotPassword = async (email) => {
        try {
            setError(null);
            return await authService.forgotPassword(email);
        } catch (err) {
            setError(err.message || 'Failed to send reset link');
            throw err;
        }
    };

    const resetPassword = async (token, newPassword) => {
        try {
            setError(null);
            return await authService.resetPassword(token, newPassword);
        } catch (err) {
            setError(err.message || 'Failed to reset password');
            throw err;
        }
    };

    const verifyEmail = async (email, code) => {
        try {
            setError(null);
            // Backend: POST api/auth/verify-email { email, code }
            return await authService.verifyEmail(email, code);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Email verification failed');
            throw err;
        }
    };

    const loginWithGoogle = async (token) => {
        try {
            setError(null);
            const data = await authService.loginWithGoogle(token);
            if (data.accessToken) tokenService.setToken(data.accessToken);
            if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
            setUser(normalizeUser(data));
            return data;
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Google login failed');
            throw err;
        }
    };

    const loginWithLinkedIn = async (token) => {
        try {
            setError(null);
            const data = await authService.loginWithLinkedIn(token);
            if (data.accessToken) tokenService.setToken(data.accessToken);
            if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
            setUser(normalizeUser(data));
            return data;
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'LinkedIn login failed');
            throw err;
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            setError(null);
            return await authService.changePassword(currentPassword, newPassword);
        } catch (err) {
            setError(err.message || 'Failed to change password');
            throw err;
        }
    };

    // ─── Context Value ────────────────────────────────────────────────────────────
    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        checkAuth,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        verifyEmail,
        loginWithGoogle,
        loginWithLinkedIn,
        changePassword,
        setUser,
        setError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
