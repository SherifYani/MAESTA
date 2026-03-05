/**
 * @file notificationService.js
 * @description Notification services - handles push notifications, email preferences, and in-app alerts
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 05-02-2026
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-07
 **/

import ApiService from './ApiService';
import {
    mockNotifications,
    getMockNotifications,
    getMockUnreadCount,
    mockPreferences
} from '../utils/mockNotificationData';

// Use mock data in development mode
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || true;

const notificationService = {
    // Get all notifications
    getNotifications: async (page = 1, limit = 20) => {
        if (USE_MOCK_DATA) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));
            return getMockNotifications({ limit });
        }

        try {
            const response = await ApiService.get(`/api/notifications?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get unread notifications count
    getUnreadCount: async () => {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 100));
            return { count: getMockUnreadCount() };
        }

        try {
            const response = await ApiService.get('/api/notifications/unread-count');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 200));
            const notification = mockNotifications.find(n => n.id === notificationId);
            if (notification) {
                notification.read = true;
            }
            return { success: true };
        }

        try {
            const response = await ApiService.put(`/api/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Mark all as read
    markAllAsRead: async () => {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 300));
            mockNotifications.forEach(n => {
                n.read = true;
            });
            return { success: true };
        }

        try {
            const response = await ApiService.put('/api/notifications/read-all');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete notification
    deleteNotification: async (notificationId) => {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 200));
            const index = mockNotifications.findIndex(n => n.id === notificationId);
            if (index !== -1) {
                mockNotifications.splice(index, 1);
            }
            return { success: true };
        }

        try {
            const response = await ApiService.delete(`/api/notifications/${notificationId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get notification preferences
    getPreferences: async () => {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 200));
            return mockPreferences;
        }

        try {
            const response = await ApiService.get('/api/notifications/preferences');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update notification preferences
    updatePreferences: async (preferences) => {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 300));
            Object.assign(mockPreferences, preferences);
            return mockPreferences;
        }

        try {
            const response = await ApiService.put('/api/notifications/preferences', preferences);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Subscribe to push notifications
    subscribeToPush: async (subscription) => {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 300));
            mockPreferences.push.enabled = true;
            return { success: true };
        }

        try {
            const response = await ApiService.post('/api/notifications/subscribe', subscription);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Unsubscribe from push notifications
    unsubscribeFromPush: async () => {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 300));
            mockPreferences.push.enabled = false;
            return { success: true };
        }

        try {
            const response = await ApiService.delete('/api/notifications/subscribe');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get notifications by type
    getByType: async (type) => {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 200));
            return getMockNotifications({ category: type });
        }

        try {
            const response = await ApiService.get(`/api/notifications/type/${type}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default notificationService;

