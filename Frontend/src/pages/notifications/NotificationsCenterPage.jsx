/**
 * @file NotificationsCenterPage.jsx
 * @description Full-page notification center with filters, search, and bulk actions
 * @author Sherif Talaat
 * @date 2026-02-07
 * 
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-16
 *
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, CheckCircle, Trash2, Settings as SettingsIcon } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { groupNotificationsByDate, filterNotificationsByCategory, filterNotificationsByReadStatus } from '../../utils/notificationHelpers';
import { NOTIFICATION_CATEGORIES } from '../../utils/notificationTypes';
import NotificationItem from '../../components/notifications/NotificationItem';
import NotificationSkeleton from '../../components/notifications/NotificationSkeleton';
import EmptyNotifications from '../../components/notifications/EmptyNotifications';
import { PageContainer } from '../../components/layout';
import styles from './NotificationsCenterPage.module.css';

/**
 * NotificationsCenterPage component - Main notifications management page
 * @returns {JSX.Element} Rendered notifications center page
 */
const NotificationsCenterPage = () => {
    const context = useNotifications();
    const {
        notifications = [],
        unreadCount = 0,
        loading = false,
        markAllAsRead = () => { },
        deleteNotification = () => { },
    } = context || {};

    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);
    const [selectedNotifications, setSelectedNotifications] = useState([]);

    // Filter notifications based on current filters
    let filteredNotifications = [...notifications];

    // Apply category filter
    if (selectedCategories.length > 0) {
        filteredNotifications = selectedCategories.reduce((acc, category) => {
            return [...acc, ...filterNotificationsByCategory(notifications, category)];
        }, []);
        // Remove duplicates
        filteredNotifications = Array.from(new Set(filteredNotifications.map(n => n.id)))
            .map(id => filteredNotifications.find(n => n.id === id));
    }

    // Apply read status filter
    if (showUnreadOnly) {
        filteredNotifications = filterNotificationsByReadStatus(filteredNotifications, false);
    }

    // Apply search filter
    if (searchQuery.trim()) {
        filteredNotifications = filteredNotifications.filter(notification =>
            notification.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            notification.message?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Group notifications by date
    const groupedNotifications = groupNotificationsByDate(filteredNotifications);

    /**
     * Handle notification selection for bulk actions
     * @param {string} notificationId - ID of notification to toggle
     */
    const handleNotificationSelect = (notificationId) => {
        setSelectedNotifications(prev =>
            prev.includes(notificationId)
                ? prev.filter(id => id !== notificationId)
                : [...prev, notificationId]
        );
    };

    /**
     * Handle select all/deselect all
     */
    const handleSelectAll = () => {
        if (selectedNotifications.length === filteredNotifications.length) {
            setSelectedNotifications([]);
        } else {
            setSelectedNotifications(filteredNotifications.map(n => n.id));
        }
    };

    /**
     * Handle bulk read action
     */
    const handleBulkRead = async () => {
        try {
            // Mark selected notifications as read
            await markAllAsRead();
            setSelectedNotifications([]);
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        }
    };

    /**
     * Handle bulk delete action
     */
    const handleBulkDelete = async () => {
        try {
            // Delete selected notifications
            for (const id of selectedNotifications) {
                await deleteNotification(id);
            }
            setSelectedNotifications([]);
        } catch (error) {
            console.error('Failed to delete notifications:', error);
        }
    };

    /**
     * Handle notification click
     * @param {Object} notification - Notification object
     */
    const handleNotificationClick = (notification) => {
        // Navigate based on notification type/data
        if (notification.data?.jobId) {
            navigate(`/jobs/${notification.data.jobId}`);
        } else if (notification.data?.projectId) {
            navigate(`/gigs/${notification.data.projectId}`);
        } else if (notification.data?.conversationId) {
            navigate(`/chat/${notification.data.conversationId}`);
        }
    };

    /**
     * Handle category filter toggle
     * @param {string} category - Category to toggle
     */
    const handleCategoryToggle = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    return (
        <PageContainer className={styles.container}>
            {/* Page Header */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Notifications</h1>
                    {unreadCount > 0 && (
                        <span className={styles.unreadBadge}>
                            {unreadCount} unread
                        </span>
                    )}
                </div>

                <div className={styles.headerActions}>
                    <button
                        className={styles.actionButton}
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        aria-label="Mark all notifications as read"
                    >
                        <CheckCircle size={20} />
                        <span>Mark all as read</span>
                    </button>

                    <button
                        className={styles.actionButton}
                        onClick={() => navigate('/notifications/settings')}
                        aria-label="Go to notification settings"
                    >
                        <SettingsIcon size={20} />
                        <span>Settings</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className={styles.content}>
                {/* Filters Sidebar */}
                <aside className={styles.sidebar}>
                    <div className={styles.searchBox}>
                        <Search className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                            aria-label="Search notifications"
                        />
                    </div>

                    <div className={styles.filterSection}>
                        <h3 className={styles.filterTitle}>Filter by Category</h3>
                        {Object.entries(NOTIFICATION_CATEGORIES).map(([key, category]) => (
                            <label key={key} className={styles.filterOption}>
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category)}
                                    onChange={() => handleCategoryToggle(category)}
                                    aria-label={`Filter by ${category}`}
                                />
                                <span className={styles.filterLabel}>{category}</span>
                            </label>
                        ))}
                    </div>

                    <div className={styles.filterSection}>
                        <label className={styles.filterOption}>
                            <input
                                type="checkbox"
                                checked={showUnreadOnly}
                                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                                aria-label="Show unread only"
                            />
                            <span className={styles.filterLabel}>Show unread only</span>
                        </label>
                    </div>
                </aside>

                {/* Notifications List */}
                <main className={styles.main}>
                    {/* Bulk Actions Bar */}
                    {selectedNotifications.length > 0 && (
                        <div className={styles.bulkActions}>
                            <span className={styles.bulkCount}>
                                {selectedNotifications.length} selected
                            </span>
                            <button
                                className={styles.bulkButton}
                                onClick={handleSelectAll}
                                aria-label={selectedNotifications.length === filteredNotifications.length ? 'Deselect all' : 'Select all'}
                            >
                                {selectedNotifications.length === filteredNotifications.length
                                    ? 'Deselect all'
                                    : 'Select all'}
                            </button>
                            <button
                                className={styles.bulkButton}
                                onClick={handleBulkRead}
                                aria-label="Mark selected as read"
                            >
                                <CheckCircle size={16} />
                                Mark as read
                            </button>
                            <button
                                className={styles.bulkButton}
                                onClick={handleBulkDelete}
                                aria-label="Delete selected"
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                            <button
                                className={styles.bulkClose}
                                onClick={() => setSelectedNotifications([])}
                                aria-label="Clear selection"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {/* Notifications Content */}
                    {loading ? (
                        <div className={styles.skeletonContainer}>
                            {[...Array(6)].map((_, i) => (
                                <NotificationSkeleton key={i} />
                            ))}
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <EmptyNotifications
                            message={
                                searchQuery || selectedCategories.length > 0 || showUnreadOnly
                                    ? "No matching notifications"
                                    : "No notifications yet"
                            }
                        />
                    ) : (
                        <div className={styles.notificationsList}>
                            {Object.entries(groupedNotifications).map(([group, groupNotifications]) => (
                                <div key={group} className={styles.notificationGroup}>
                                    <h3 className={styles.groupTitle}>{group}</h3>
                                    <div className={styles.groupList}>
                                        {groupNotifications.map(notification => (
                                            <div
                                                key={notification.id}
                                                className={`${styles.notificationWrapper} ${selectedNotifications.includes(notification.id) ? styles.selected : ''
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className={styles.notificationCheckbox}
                                                    checked={selectedNotifications.includes(notification.id)}
                                                    onChange={() => handleNotificationSelect(notification.id)}
                                                    aria-label={`Select notification: ${notification.title}`}
                                                />
                                                <div className={styles.notificationContent}>
                                                    <NotificationItem
                                                        notification={notification}
                                                        onRead={() => { }}
                                                        onDelete={() => deleteNotification(notification.id)}
                                                        onClick={() => handleNotificationClick(notification)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </PageContainer>
    );
};

export default NotificationsCenterPage;