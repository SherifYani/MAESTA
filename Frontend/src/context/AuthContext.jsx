/**
 * @file AuthContext.jsx
 * @description Authentication context - manages user authentication state globally.
 *              Supports mock (localStorage-based) auth for prototype and real API auth for production.
 * @author Sherif Talaat
 * @version 2.0.0
 * @date 05-03-2026
 *
 * @changes (v2.0.0):
 * - Removed hardcoded mock user — isAuthenticated is now derived from real localStorage state
 * - Added safe JSON.parse with try/catch for localStorage reads
 * - login() now accepts (userObj, token) and persists both to localStorage
 * - logout() clears token, user, and any redirectAfterLogin from localStorage
 * - Handles edge cases: token present but no user → clears storage and deauthenticates
 * - Handles edge cases: user present but missing role → defaults to 'jobseeker'
 **/

import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import { tokenService } from '../lib/token-service';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

/**
 * Safely reads and parses a JSON value from localStorage.
 * Returns null on any parse error or missing key.
 * @param {string} key
 * @returns {any|null}
 */
const safeGetJSON = (key) => {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ─── Initialisation ──────────────────────────────────────────────────────────
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = safeGetJSON('user');

            if (token && storedUser) {
                // Validate role — default to 'jobseeker' if missing
                if (!storedUser.role) {
                    storedUser.role = 'jobseeker';
                }
                setUser(storedUser);
                setLoading(false);
                return;
            }

            // Token exists but no user object → storage is corrupt, clean it up
            if (token && !storedUser) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setLoading(false);
                return;
            }

            // No token at all → try real API (for when backend is connected)
            const apiToken = tokenService.getToken();
            if (apiToken) {
                try {
                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                } catch (err) {
                    console.error('Failed to load user from API:', err);
                    tokenService.clearToken();
                }
            }

            setLoading(false);
        };

        initAuth();
    }, []);

    // ─── Mock / Real Login ────────────────────────────────────────────────────────
    /**
     * Logs the user in.
     * For mock logins: call login(userObj, mockToken).
     * For real API logins: call login(credentials) — this proxies to authService.login().
     *
     * @param {Object} userObjOrCredentials
     * @param {string} [token] - If provided, used directly (mock mode). If omitted, performs real API call.
     */
    const login = async (userObjOrCredentials, token = null) => {
        try {
            setError(null);

            // Mock login path — token supplied directly
            if (token) {
                const userObj = {
                    ...userObjOrCredentials,
                    role: userObjOrCredentials.role || 'jobseeker',
                };
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userObj));
                setUser(userObj);
                return { user: userObj, token };
            }

            // Real API login path
            const data = await authService.login(userObjOrCredentials);
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
            }
            return data;
        } catch (err) {
            setError(err.message || 'Login failed');
            throw err;
        }
    };

    // ─── Logout ───────────────────────────────────────────────────────────────────
    /**
     * Clears all auth state — localStorage token, user, and any post-login redirect.
     */
    const logout = async () => {
        try {
            // Attempt API logout (no-op if not connected)
            await authService.logout();
        } catch {
            // Swallow — always clear local state regardless
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('redirectAfterLogin');
            tokenService.clearToken?.();
            setUser(null);
            setError(null);
        }
    };

    // ─── Remaining Auth Methods (real API) ────────────────────────────────────────
    const register = async (userData) => {
        try {
            setError(null);
            const data = await authService.register(userData);
            return data;
        } catch (err) {
            setError(err.message || 'Registration failed');
            throw err;
        }
    };

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

    const verifyEmail = async (token) => {
        try {
            setError(null);
            return await authService.verifyEmail(token);
        } catch (err) {
            setError(err.message || 'Email verification failed');
            throw err;
        }
    };

    const loginWithGoogle = async (token) => {
        try {
            setError(null);
            const data = await authService.loginWithGoogle(token);
            setUser(data.user);
            return data;
        } catch (err) {
            setError(err.message || 'Google login failed');
            throw err;
        }
    };

    const loginWithLinkedIn = async (token) => {
        try {
            setError(null);
            const data = await authService.loginWithLinkedIn(token);
            setUser(data.user);
            return data;
        } catch (err) {
            setError(err.message || 'LinkedIn login failed');
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
