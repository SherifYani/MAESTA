/**
 * @file notificationTypes.js
 * @description Defines notification types, icons, and category mappings for the notification system
 * @author Sherif Talaat
 * @date 2026-02-07
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-07
 */

import {
    Bell,
    Briefcase,
    MessageSquare,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    Zap,
    DollarSign,
    FileText,
    Users,
    Settings,
    Heart,
    Star,
    TrendingUp,
    Gift
} from 'lucide-react';

/**
 * System notification types
 */
export const SYSTEM_NOTIFICATIONS = {
    WELCOME: 'WELCOME',
    ACCOUNT_VERIFIED: 'ACCOUNT_VERIFIED',
    PASSWORD_CHANGED: 'PASSWORD_CHANGED',
    SUBSCRIPTION: 'SUBSCRIPTION',
    PAYMENT: 'PAYMENT',
};

/**
 * Job-related notification types
 */
export const JOB_NOTIFICATIONS = {
    JOB_APPLICATION: 'JOB_APPLICATION',
    APPLICATION_STATUS: 'APPLICATION_STATUS',
    INTERVIEW_INVITATION: 'INTERVIEW_INVITATION',
    JOB_RECOMMENDATION: 'JOB_RECOMMENDATION',
    JOB_SAVED: 'JOB_SAVED',
};

/**
 * Gig/Project-related notification types
 */
export const GIG_NOTIFICATIONS = {
    NEW_BID: 'NEW_BID',
    BID_ACCEPTED: 'BID_ACCEPTED',
    PROJECT_MILESTONE: 'PROJECT_MILESTONE',
    PROJECT_COMPLETE: 'PROJECT_COMPLETE',
    REVIEW_RECEIVED: 'REVIEW_RECEIVED',
};

/**
 * Communication notification types
 */
export const COMMUNICATION_NOTIFICATIONS = {
    NEW_MESSAGE: 'NEW_MESSAGE',
    VIDEO_CALL: 'VIDEO_CALL',
    CALL_MISSED: 'CALL_MISSED',
    GROUP_UPDATE: 'GROUP_UPDATE',
};

/**
 * Maps notification types to their corresponding icons
 * @type {Object<string, React.Component>}
 */
export const NOTIFICATION_ICONS = {
    // System
    [SYSTEM_NOTIFICATIONS.WELCOME]: Gift,
    [SYSTEM_NOTIFICATIONS.ACCOUNT_VERIFIED]: CheckCircle,
    [SYSTEM_NOTIFICATIONS.PASSWORD_CHANGED]: Settings,
    [SYSTEM_NOTIFICATIONS.SUBSCRIPTION]: Star,
    [SYSTEM_NOTIFICATIONS.PAYMENT]: DollarSign,

    // Jobs
    [JOB_NOTIFICATIONS.JOB_APPLICATION]: FileText,
    [JOB_NOTIFICATIONS.APPLICATION_STATUS]: TrendingUp,
    [JOB_NOTIFICATIONS.INTERVIEW_INVITATION]: Calendar,
    [JOB_NOTIFICATIONS.JOB_RECOMMENDATION]: Briefcase,
    [JOB_NOTIFICATIONS.JOB_SAVED]: Heart,

    // Gigs
    [GIG_NOTIFICATIONS.NEW_BID]: Zap,
    [GIG_NOTIFICATIONS.BID_ACCEPTED]: CheckCircle,
    [GIG_NOTIFICATIONS.PROJECT_MILESTONE]: TrendingUp,
    [GIG_NOTIFICATIONS.PROJECT_COMPLETE]: CheckCircle,
    [GIG_NOTIFICATIONS.REVIEW_RECEIVED]: Star,

    // Communication
    [COMMUNICATION_NOTIFICATIONS.NEW_MESSAGE]: MessageSquare,
    [COMMUNICATION_NOTIFICATIONS.VIDEO_CALL]: Users,
    [COMMUNICATION_NOTIFICATIONS.CALL_MISSED]: XCircle,
    [COMMUNICATION_NOTIFICATIONS.GROUP_UPDATE]: AlertCircle,

    // Default
    DEFAULT: Bell,
};

/**
 * Maps notification types to their priority levels
 * @type {Object<string, number>}
 */
export const NOTIFICATION_PRIORITY = {
    // High priority (1)
    [SYSTEM_NOTIFICATIONS.PAYMENT]: 1,
    [JOB_NOTIFICATIONS.INTERVIEW_INVITATION]: 1,
    [COMMUNICATION_NOTIFICATIONS.VIDEO_CALL]: 1,
    [COMMUNICATION_NOTIFICATIONS.CALL_MISSED]: 1,

    // Medium priority (0.5)
    [JOB_NOTIFICATIONS.APPLICATION_STATUS]: 0.5,
    [GIG_NOTIFICATIONS.BID_ACCEPTED]: 0.5,
    [GIG_NOTIFICATIONS.PROJECT_COMPLETE]: 0.5,
    [COMMUNICATION_NOTIFICATIONS.NEW_MESSAGE]: 0.5,

    // Default priority (0)
    DEFAULT: 0,
};

/**
 * Maps notification types to their categories for filtering
 * @type {Object<string, string>}
 */
export const NOTIFICATION_CATEGORIES = {
    SYSTEM: 'system',
    JOBS: 'jobs',
    GIGS: 'gigs',
    COMMUNICATION: 'communication',
};

/**
 * Gets the icon component for a notification type
 * @param {string} type - The notification type
 * @returns {React.Component} The icon component
 */
export const getNotificationIcon = (type) => {
    return NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.DEFAULT;
};

/**
 * Gets the priority level for a notification type
 * @param {string} type - The notification type
 * @returns {number} The priority level
 */
export const getNotificationPriority = (type) => {
    return NOTIFICATION_PRIORITY[type] ?? NOTIFICATION_PRIORITY.DEFAULT;
};

/**
 * Gets the category for a notification type
 * @param {string} type - The notification type
 * @returns {string} The category name
 */
export const getNotificationCategory = (type) => {
    if (Object.values(SYSTEM_NOTIFICATIONS).includes(type)) {
        return NOTIFICATION_CATEGORIES.SYSTEM;
    }
    if (Object.values(JOB_NOTIFICATIONS).includes(type)) {
        return NOTIFICATION_CATEGORIES.JOBS;
    }
    if (Object.values(GIG_NOTIFICATIONS).includes(type)) {
        return NOTIFICATION_CATEGORIES.GIGS;
    }
    if (Object.values(COMMUNICATION_NOTIFICATIONS).includes(type)) {
        return NOTIFICATION_CATEGORIES.COMMUNICATION;
    }
    return NOTIFICATION_CATEGORIES.SYSTEM;
};
