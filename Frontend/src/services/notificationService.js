/**
 * @file notificationService.js
 * @description Notification services — verified against NotificationsController.cs.
 * @author Sherif Talaat
 * @version 2.1.0
 * @date 2026-04-29
 *
 * @last-modified-by Antigravity (AI) — verified against NotificationsController.cs
 * @last-modified-date 2026-04-29
 *
 * REAL ROUTES (NotificationsController [Route("api/[controller]")]):
 *   GET    api/notifications?page=&limit=
 *   GET    api/notifications/unread           ← returns unread count
 *   PUT    api/notifications/{id}/read
 *   PUT    api/notifications/read-all
 *   DELETE api/notifications/{id}
 *   GET    api/notifications/preferences
 *   PUT    api/notifications/preferences
 *   POST   api/notifications/push/subscribe   ← body: "deviceToken" (string)
 **/

import ApiService from './ApiService';

const notificationService = {

    /**
     * Get paginated notifications for the current user.
     * @param {number} page
     * @param {number} limit
     */
    getNotifications: async (page = 1, limit = 20) => {
        const response = await ApiService.get('/api/notifications', { params: { page, limit } });
        const items = Array.isArray(response.data) ? response.data : [];
        return items.map(n => ({
            id: n.notificationId,
            title: n.title || '',
            message: n.message || '',
            type: n.type || 'system',
            read: n.isRead ?? false,
            actionUrl: n.actionUrl || null,
            created_at: n.createdAt
        }));
    },

    /**
     * Get the count of unread notifications.
     * Backend: GET api/notifications/unread
     */
    getUnreadCount: async () => {
        const response = await ApiService.get('/api/notifications/unread');
        return response.data;
    },

    /**
     * Mark a single notification as read.
     * @param {string|number} notificationId
     */
    markAsRead: async (notificationId) => {
        const response = await ApiService.put(`/api/notifications/${notificationId}/read`);
        return response.data;
    },

    /**
     * Mark all notifications as read.
     */
    markAllAsRead: async () => {
        const response = await ApiService.put('/api/notifications/read-all');
        return response.data;
    },

    /**
     * Delete a single notification.
     * @param {string|number} notificationId
     */
    deleteNotification: async (notificationId) => {
        const response = await ApiService.delete(`/api/notifications/${notificationId}`);
        return response.data;
    },

    /**
     * Get the user's notification preferences.
     */
    getPreferences: async () => {
        const response = await ApiService.get('/api/notifications/preferences');
        const p = response.data || {};
        return {
            inApp: {
                jobs: true,
                gigs: true,
                communication: true,
                system: true,
            },
            email: {
                jobs: p.emailNotifications ?? true,
                gigs: p.emailNotifications ?? true,
                communication: p.smsNotifications ?? false,
                system: p.emailNotifications ?? true,
            },
            push: {
                enabled: p.pushNotifications ?? false,
                jobs: p.pushNotifications ?? false,
                gigs: p.pushNotifications ?? false,
                communication: p.pushNotifications ?? false,
                system: p.pushNotifications ?? false,
            },
            language: p.language ?? "en"
        };
    },

    /**
     * Update notification preferences.
     * @param {Object} preferences
     */
    updatePreferences: async (preferences) => {
        const dto = {
            emailNotifications: Object.values(preferences?.email || {}).some(val => val === true),
            smsNotifications: preferences?.email?.communication ?? false,
            pushNotifications: preferences?.push?.enabled ?? false,
            language: preferences?.language ?? "en"
        };
        const response = await ApiService.put('/api/notifications/preferences', dto);
        return preferences;
    },

    /**
     * Subscribe to push notifications.
     * Backend: POST api/notifications/push/subscribe — body is a raw device token string
     * @param {string} deviceToken - push notification device token
     */
    subscribeToPush: async (deviceToken) => {
        const response = await ApiService.post('/api/notifications/push/subscribe',
            JSON.stringify(deviceToken),
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    },

    /**
     * Unsubscribe from push notifications.
     */
    unsubscribeFromPush: async () => {
        // MOCKED: Not implemented in backend yet.
        console.warn("unsubscribeFromPush is mocked");
        return { success: true };
    },

    /**
     * Get notifications filtered by type.
     * @param {string} type - e.g. 'application', 'message', 'system'
     */
    getByType: async (type) => {
        // MOCKED: Not implemented in backend yet.
        console.warn("getByType is mocked");
        return [];
    },
};

export default notificationService;
