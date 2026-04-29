/**
 * @file notificationHelpers.js
 * @description Helper functions for notification formatting, time display, and utilities
 * @author Sherif Talaat
 * @date 2026-02-07
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-07
 */

/**
 * Formats a date to a relative time string (e.g., "5 minutes ago", "2 hours ago")
 * @param {string|Date} date - The date to format
 * @returns {string} The formatted relative time string
 */
export const formatRelativeTime = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) {
        return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

/**
 * Truncates notification text to a specified length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} The truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) {
        return text;
    }
    return `${text.substring(0, maxLength)}...`;
};

/**
 * Groups notifications by date (Today, Yesterday, This Week, Earlier)
 * @param {Array<Object>} notifications - Array of notification objects
 * @returns {Object} Grouped notifications by time period
 */
export const groupNotificationsByDate = (notifications) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const grouped = {
        today: [],
        yesterday: [],
        thisWeek: [],
        earlier: [],
    };

    notifications.forEach((notification) => {
        const notificationDate = new Date(notification.created_at);
        const notificationDay = new Date(
            notificationDate.getFullYear(),
            notificationDate.getMonth(),
            notificationDate.getDate()
        );

        if (notificationDay.getTime() === today.getTime()) {
            grouped.today.push(notification);
        } else if (notificationDay.getTime() === yesterday.getTime()) {
            grouped.yesterday.push(notification);
        } else if (notificationDate >= weekAgo) {
            grouped.thisWeek.push(notification);
        } else {
            grouped.earlier.push(notification);
        }
    });

    return grouped;
};

/**
 * Filters notifications by category
 * @param {Array<Object>} notifications - Array of notification objects
 * @param {string} category - Category to filter by (all, system, jobs, gigs, communication)
 * @returns {Array<Object>} Filtered notifications
 */
export const filterNotificationsByCategory = (notifications, category) => {
    if (category === 'all') {
        return notifications;
    }
    return notifications.filter(
        (notification) => notification.category === category
    );
};

/**
 * Filters notifications by read status
 * @param {Array<Object>} notifications - Array of notification objects
 * @param {boolean} isRead - Read status to filter by
 * @returns {Array<Object>} Filtered notifications
 */
export const filterNotificationsByReadStatus = (notifications, isRead) => {
    return notifications.filter((notification) => notification.read === isRead);
};

/**
 * Sorts notifications by date (newest first)
 * @param {Array<Object>} notifications - Array of notification objects
 * @returns {Array<Object>} Sorted notifications
 */
export const sortNotificationsByDate = (notifications) => {
    return [...notifications].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
};

/**
 * Gets unread notification count
 * @param {Array<Object>} notifications - Array of notification objects
 * @returns {number} Count of unread notifications
 */
export const getUnreadCount = (notifications) => {
    return notifications.filter((notification) => !notification.read).length;
};

/**
 * Determines if a notification is new (within last 24 hours)
 * @param {string|Date} date - The notification date
 * @returns {boolean} True if notification is new
 */
export const isNewNotification = (date) => {
    const notificationDate = new Date(date);
    const now = new Date();
    const diffInHours = Math.floor((now - notificationDate) / (1000 * 60 * 60));
    return diffInHours < 24;
};

/**
 * Formats notification count for display (e.g., "99+" for counts over 99)
 * @param {number} count - The notification count
 * @returns {string} Formatted count string
 */
export const formatNotificationCount = (count) => {
    if (count > 99) {
        return '99+';
    }
    return count.toString();
};
