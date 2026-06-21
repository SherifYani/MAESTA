/**
 * @file NotificationDropdown.jsx
 * @description Dropdown component displaying recent notifications with tabs and actions
 * @author Sherif Talaat
 * @date 2026-02-07
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-07
 */

import React, { useState } from 'react';
import { Settings, CheckCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './NotificationDropdown.module.css';
import { useNotifications } from '../../context/NotificationContext';
import NotificationItem from './NotificationItem';
import EmptyNotifications from './EmptyNotifications';
import NotificationSkeleton from './NotificationSkeleton';

/**
 * Returns the best navigation URL for a notification,
 * using actionUrl first, then falling back to type-based routing.
 */
export const getNotificationRoute = (notification) => {
    if (notification.actionUrl && !notification.actionUrl.startsWith('/interviews/')) {
        return notification.actionUrl;
    }
    const typeStr = (notification.type || notification.Type || '').toLowerCase();
    const titleStr = (notification.title || notification.Title || '').toLowerCase();
    
    if (typeStr.includes('interview') || titleStr.includes('interview')) return '/dashboard/my-interviews';
    if (typeStr.includes('application') || titleStr.includes('application')) return '/dashboard/new-applications';
    if (typeStr.includes('job') || titleStr.includes('job')) return '/jobs';
    if (typeStr.includes('message') || titleStr.includes('message')) return '/chat';
    
    return '/notifications';
};

/**
 * NotificationDropdown component - Displays notification list in dropdown
 * @param {Object} props - Component props
 * @param {Function} props.onClose - Callback when dropdown is closed
 * @returns {JSX.Element} Rendered notification dropdown
 */
const NotificationDropdown = ({ onClose }) => {
    const navigate = useNavigate();
    const context = useNotifications();

    // Defensive defaults for when context is not available
    const {
        notifications = [],
        loading = false,
        markAsRead = () => { },
        markAllAsRead = () => { },
        deleteNotification = () => { },
    } = context || {};

    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'

    // Filter notifications based on active tab with defensive checks
    const filteredNotifications =
        activeTab === 'all'
            ? (notifications || []).slice(0, 10) // Show only first 10
            : (notifications || []).filter((n) => !n.read).slice(0, 10);

    /**
     * Handles marking all notifications as read
     */
    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    /**
     * Handles navigation to notification settings
     */
    const handleSettingsClick = () => {
        navigate('/notifications/settings');
        onClose();
    };

    /**
     * Handles navigation to notifications center
     */
    const handleViewAll = () => {
        navigate('/notifications');
        onClose();
    };

    /**
     * Handles notification item click
     */
    const handleNotificationClick = (notification) => {
        const route = getNotificationRoute(notification);
        navigate(route);
        onClose();
    };


    return (
        <div className={styles.dropdown}>
            {/* Header */}
            <div className={styles.header}>
                <Link to="/notifications"><h3 className={styles.title}>Notifications</h3></Link>
                <div className={styles.actions}>
                    <button
                        className={styles.actionButton}
                        onClick={handleMarkAllRead}
                        aria-label="Mark all as read"
                        title="Mark all as read"
                    >
                        <CheckCheck className={styles.actionIcon} />
                    </button>
                    <button
                        className={styles.actionButton}
                        onClick={handleSettingsClick}
                        aria-label="Notification settings"
                        title="Settings"
                    >
                        <Settings className={styles.actionIcon} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'unread' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('unread')}
                >
                    Unread
                </button>
            </div>

            {/* Notification List */}
            <div className={styles.notificationList}>
                {loading ? (
                    <NotificationSkeleton count={3} />
                ) : filteredNotifications.length === 0 ? (
                    <EmptyNotifications
                        message={
                            activeTab === 'unread'
                                ? 'No unread notifications'
                                : 'No notifications yet'
                        }
                    />
                ) : (
                    filteredNotifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onRead={markAsRead}
                            onDelete={deleteNotification}
                            onClick={handleNotificationClick}
                        />
                    ))
                )}
            </div>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
                <div className={styles.footer}>
                    <button className={styles.viewAllButton} onClick={handleViewAll}>
                        View All Notifications
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
