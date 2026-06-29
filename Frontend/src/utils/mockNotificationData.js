/**
 * @file mockNotificationData.js
 * @description Mock notification data for testing and development
 * @author Sherif Talaat
 * @date 2026-02-07
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-08
 */

import {
    SYSTEM_NOTIFICATIONS,
    JOB_NOTIFICATIONS,
    GIG_NOTIFICATIONS,
    COMMUNICATION_NOTIFICATIONS,
} from './notificationTypes';

/**
 * Mock notification data for development and testing
 * @type {Array<Object>}
 */
import notificationsData from '../mocks/notifications.json';

/**
 * Mock notification data for development and testing
 * @type {Array<Object>}
 */
export const mockNotifications = notificationsData.map(notification => ({
    ...notification,
    created_at: notification.timestamp || new Date().toISOString(), // Use timestamp from JSON or fallback
    read: notification.read || false
}));

/**
 * Gets mock notifications based on filter criteria
 * @param {Object} filters - Filter criteria
 * @param {boolean} filters.unreadOnly - Only return unread notifications
 * @param {string} filters.category - Filter by category
 * @param {number} filters.limit - Limit number of results
 * @returns {Array<Object>} Filtered mock notifications
 */
export const getMockNotifications = (filters = {}) => {
    let filtered = [...mockNotifications];

    if (filters.unreadOnly) {
        filtered = filtered.filter((n) => !n.read);
    }

    if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter((n) => n.category === filters.category);
    }

    if (filters.limit) {
        filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
};

/**
 * Gets mock unread count
 * @returns {number} Count of unread notifications
 */
export const getMockUnreadCount = () => {
    return mockNotifications.filter((n) => !n.read).length;
};

/**
 * Mock notification preferences
 * @type {Object}
 */
export const mockPreferences = {
    inApp: {
        [SYSTEM_NOTIFICATIONS.WELCOME]: true,
        [SYSTEM_NOTIFICATIONS.ACCOUNT_VERIFIED]: true,
        [SYSTEM_NOTIFICATIONS.PASSWORD_CHANGED]: true,
        [SYSTEM_NOTIFICATIONS.SUBSCRIPTION]: true,
        [SYSTEM_NOTIFICATIONS.PAYMENT]: true,
        [JOB_NOTIFICATIONS.JOB_APPLICATION]: true,
        [JOB_NOTIFICATIONS.APPLICATION_STATUS]: true,
        [JOB_NOTIFICATIONS.INTERVIEW_INVITATION]: true,
        [JOB_NOTIFICATIONS.JOB_RECOMMENDATION]: true,
        [JOB_NOTIFICATIONS.JOB_SAVED]: false,
        [GIG_NOTIFICATIONS.NEW_BID]: true,
        [GIG_NOTIFICATIONS.BID_ACCEPTED]: true,
        [GIG_NOTIFICATIONS.PROJECT_MILESTONE]: true,
        [GIG_NOTIFICATIONS.PROJECT_COMPLETE]: true,
        [GIG_NOTIFICATIONS.REVIEW_RECEIVED]: true,
        [COMMUNICATION_NOTIFICATIONS.NEW_MESSAGE]: true,
        [COMMUNICATION_NOTIFICATIONS.VIDEO_CALL]: true,
        [COMMUNICATION_NOTIFICATIONS.CALL_MISSED]: true,
        [COMMUNICATION_NOTIFICATIONS.GROUP_UPDATE]: false,
    },
    email: {
        [SYSTEM_NOTIFICATIONS.WELCOME]: true,
        [SYSTEM_NOTIFICATIONS.ACCOUNT_VERIFIED]: true,
        [SYSTEM_NOTIFICATIONS.PASSWORD_CHANGED]: true,
        [SYSTEM_NOTIFICATIONS.SUBSCRIPTION]: true,
        [SYSTEM_NOTIFICATIONS.PAYMENT]: true,
        [JOB_NOTIFICATIONS.JOB_APPLICATION]: true,
        [JOB_NOTIFICATIONS.APPLICATION_STATUS]: true,
        [JOB_NOTIFICATIONS.INTERVIEW_INVITATION]: true,
        [JOB_NOTIFICATIONS.JOB_RECOMMENDATION]: false,
        [JOB_NOTIFICATIONS.JOB_SAVED]: false,
        [GIG_NOTIFICATIONS.NEW_BID]: true,
        [GIG_NOTIFICATIONS.BID_ACCEPTED]: true,
        [GIG_NOTIFICATIONS.PROJECT_MILESTONE]: true,
        [GIG_NOTIFICATIONS.PROJECT_COMPLETE]: true,
        [GIG_NOTIFICATIONS.REVIEW_RECEIVED]: false,
        [COMMUNICATION_NOTIFICATIONS.NEW_MESSAGE]: false,
        [COMMUNICATION_NOTIFICATIONS.VIDEO_CALL]: true,
        [COMMUNICATION_NOTIFICATIONS.CALL_MISSED]: true,
        [COMMUNICATION_NOTIFICATIONS.GROUP_UPDATE]: false,
    },
    push: {
        enabled: true,
        [SYSTEM_NOTIFICATIONS.WELCOME]: false,
        [SYSTEM_NOTIFICATIONS.ACCOUNT_VERIFIED]: false,
        [SYSTEM_NOTIFICATIONS.PASSWORD_CHANGED]: true,
        [SYSTEM_NOTIFICATIONS.SUBSCRIPTION]: false,
        [SYSTEM_NOTIFICATIONS.PAYMENT]: true,
        [JOB_NOTIFICATIONS.JOB_APPLICATION]: true,
        [JOB_NOTIFICATIONS.APPLICATION_STATUS]: true,
        [JOB_NOTIFICATIONS.INTERVIEW_INVITATION]: true,
        [JOB_NOTIFICATIONS.JOB_RECOMMENDATION]: false,
        [JOB_NOTIFICATIONS.JOB_SAVED]: false,
        [GIG_NOTIFICATIONS.NEW_BID]: true,
        [GIG_NOTIFICATIONS.BID_ACCEPTED]: true,
        [GIG_NOTIFICATIONS.PROJECT_MILESTONE]: true,
        [GIG_NOTIFICATIONS.PROJECT_COMPLETE]: true,
        [GIG_NOTIFICATIONS.REVIEW_RECEIVED]: false,
        [COMMUNICATION_NOTIFICATIONS.NEW_MESSAGE]: true,
        [COMMUNICATION_NOTIFICATIONS.VIDEO_CALL]: true,
        [COMMUNICATION_NOTIFICATIONS.CALL_MISSED]: true,
        [COMMUNICATION_NOTIFICATIONS.GROUP_UPDATE]: false,
    },
    mutedUntil: null,
};
