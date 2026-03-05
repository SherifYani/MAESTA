/**
 * @file AuthContext.jsx
 * @description Authentication context - manages user authentication state globally
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 05-02-2026
**/

import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import { tokenService } from '../lib/token-service';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({
        id: 'user-123',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'jobseeker',
        avatar: 'https://via.placeholder.com/150'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Load user data on page load
        const loadUser = async () => {
            const token = tokenService.getToken();
            if (token) {
                try {
                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                } catch (err) {
                    console.error('Failed to load user:', err);
                    tokenService.clearToken();
                }
            } else {
                // FORCE MOCK USER FOR PROTOTYPE
                setUser({
                    id: 'user-123',
                    name: 'Demo User',
                    email: 'demo@example.com',
                    role: 'jobseeker',
                    avatar: 'https://via.placeholder.com/150'
                });
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    const login = async (credentials) => {
        try {
            setError(null);
            const data = await authService.login(credentials);
            setUser(data.user);
            return data;
        } catch (err) {
            setError(err.message || 'Login failed');
            throw err;
        }
    };

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

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
            setError(null);
        } catch (err) {
            setError(err.message || 'Logout failed');
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
        setError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
