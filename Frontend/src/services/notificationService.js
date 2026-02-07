/**
 * @file notificationService.js
 * @description Notification services - handles push notifications, email preferences, and in-app alerts
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 05-02-2026
**/

import ApiService from './ApiService';

const notificationService = {
    // Get all notifications
    getNotifications: async (page = 1, limit = 20) => {
        try {
            const response = await ApiService.get(`/api/notifications?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get unread notifications count
    getUnreadCount: async () => {
        try {
            const response = await ApiService.get('/api/notifications/unread-count');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        try {
            const response = await ApiService.put(`/api/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Mark all as read
    markAllAsRead: async () => {
        try {
            const response = await ApiService.put('/api/notifications/read-all');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete notification
    deleteNotification: async (notificationId) => {
        try {
            const response = await ApiService.delete(`/api/notifications/${notificationId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get notification preferences
    getPreferences: async () => {
        try {
            const response = await ApiService.get('/api/notifications/preferences');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update notification preferences
    updatePreferences: async (preferences) => {
        try {
            const response = await ApiService.put('/api/notifications/preferences', preferences);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Subscribe to push notifications
    subscribeToPush: async (subscription) => {
        try {
            const response = await ApiService.post('/api/notifications/subscribe', subscription);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Unsubscribe from push notifications
    unsubscribeFromPush: async () => {
        try {
            const response = await ApiService.delete('/api/notifications/subscribe');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get notifications by type
    getByType: async (type) => {
        try {
            const response = await ApiService.get(`/api/notifications/type/${type}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default notificationService;
