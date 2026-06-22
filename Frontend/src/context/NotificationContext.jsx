/**
 * @file NotificationContext.jsx
 * @description Notification context - manages notifications and alerts globally
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 05-02-2026
**/

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext({});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [preferences, setPreferences] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load notifications when user is authenticated and fully approved/completed
    useEffect(() => {
        const isApproved = user?.registrationStatus === 'Approved' || user?.registrationStatus === 'Completed';
        if (user?.id && isApproved) {
            loadNotifications();
            loadUnreadCount();
            loadPreferences();
        } else {
            setNotifications([]);
            setUnreadCount(0);
            setPreferences({});
        }
    }, [user, user?.registrationStatus]);

    // Poll for new notifications every 30 seconds
    useEffect(() => {
        const isApproved = user?.registrationStatus === 'Approved' || user?.registrationStatus === 'Completed';
        if (!user || !isApproved) return;

        const interval = setInterval(() => {
            loadUnreadCount();
        }, 30000);

        return () => clearInterval(interval);
    }, [user, user?.registrationStatus]);

    const loadNotifications = async (page = 1) => {
        try {
            setLoading(true);
            const data = await notificationService.getNotifications(page);
            if (page === 1) {
                setNotifications(data);
            } else {
                setNotifications(prev => [...prev, ...data]);
            }
        } catch (err) {
            setError(err.message || 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const loadUnreadCount = async () => {
        try {
            const data = await notificationService.getUnreadCount();
            setUnreadCount(data.count || 0);
        } catch (err) {
            console.error('Failed to load unread count:', err);
        }
    };

    const loadPreferences = async () => {
        try {
            const data = await notificationService.getPreferences();
            setPreferences(data);
        } catch (err) {
            console.error('Failed to load preferences:', err);
        }
    };

    const markAsRead = useCallback(async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            setError(err.message || 'Failed to mark as read');
        }
    }, []);

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            setError(err.message || 'Failed to mark all as read');
            throw err;
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);
            const notification = notifications.find(n => n.id === notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            if (notification && !notification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            setError(err.message || 'Failed to delete notification');
            throw err;
        }
    };

    const updatePreferences = async (newPreferences) => {
        try {
            const data = await notificationService.updatePreferences(newPreferences);
            setPreferences(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to update preferences');
            throw err;
        }
    };

    const subscribeToPush = async (subscription) => {
        try {
            await notificationService.subscribeToPush(subscription);
        } catch (err) {
            setError(err.message || 'Failed to subscribe to push');
            throw err;
        }
    };

    // Add a new notification (for real-time updates)
    const addNotification = useCallback((notification) => {
        setNotifications(prev => [notification, ...prev]);
        if (!notification.read) {
            setUnreadCount(prev => prev + 1);
        }
    }, []);

    const value = {
        notifications,
        unreadCount,
        preferences,
        loading,
        error,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        updatePreferences,
        subscribeToPush,
        addNotification,
        setError
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
