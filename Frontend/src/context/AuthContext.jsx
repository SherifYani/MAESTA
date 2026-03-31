/**
 * @file AuthContext.jsx
 * @description Authentication context - manages user authentication state globally.
 *              Supports simulated API auth for prototyping, prepared for real API.
 * @author Sherif Talaat
 * @version 3.0.0
 * @date 05-03-2026
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
     * Called automatically on mount, and can be called manually.
     */
    const checkAuth = useCallback(async () => {
        const token = tokenService.getToken() || localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await authService.getCurrentUser();
            if (data && data.user) {
                // Ensure role has a default
                if (!data.user.role) {
                    data.user.role = 'jobseeker';
                }
                setUser(data.user);
            }
        } catch (err) {
            console.error('Failed to restore session from token:', err);
            tokenService.clearToken();
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initialisation on app load
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (credentials) => {
        try {
            setError(null);
            setLoading(true);

            // Real/Simulated API login
            const data = await authService.login(credentials);
            
            if (data.token) {
                tokenService.setToken(data.token);
                localStorage.setItem('token', data.token);
            }
            if (data.user) {
                const userObj = { ...data.user, role: data.user.role || 'jobseeker' };
                setUser(userObj);
            }
            
            return data;
        } catch (err) {
            setError(err.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch {
            // Swallow network errors on logout
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('redirectAfterLogin');
            tokenService.clearToken(); // Handles sessionStorage/localStorage inside
            setUser(null);
            setError(null);
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            setLoading(true);
            const data = await authService.register(userData);
            return data;
        } catch (err) {
            setError(err.message || 'Registration failed');
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
