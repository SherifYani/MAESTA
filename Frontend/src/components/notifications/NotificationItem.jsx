/**
 * @file NotificationItem.jsx
 * @description Individual notification item component
 * @author Sherif Talaat
 * @date 2026-02-07
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-07
 */

import React from 'react';
import { X } from 'lucide-react';
import styles from './NotificationItem.module.css';
import { formatRelativeTime } from '../../utils/notificationHelpers';
import { getNotificationIcon } from '../../utils/notificationTypes';

/**
 * NotificationItem component - Displays a single notification
 * @param {Object} props - Component props
 * @param {Object} props.notification - Notification data
 * @param {Function} props.onRead - Callback when notification is marked as read
 * @param {Function} props.onDelete - Callback when notification is deleted
 * @param {Function} props.onClick - Callback when notification is clicked
 * @returns {JSX.Element} Rendered notification item
 */
const NotificationItem = ({ notification, onRead, onDelete, onClick }) => {
    const IconComponent = getNotificationIcon(notification.type);

    /**
     * Handles notification click
     */
    const handleClick = () => {
        if (!notification.read && onRead) {
            onRead(notification.id);
        }
        if (onClick) {
            onClick(notification);
        }
    };

    /**
     * Handles delete button click
     */
    const handleDelete = (e) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(notification.id);
        }
    };

    return (
        <div
            className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            aria-label={notification.title}
        >
            <div className={styles.iconWrapper}>
                <IconComponent className={styles.icon} />
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <h4 className={styles.title}>{notification.title}</h4>
                    <span className={styles.time}>
                        {formatRelativeTime(notification.created_at)}
                    </span>
                </div>
                <p className={styles.message}>{notification.message}</p>
            </div>

            <button
                className={styles.deleteButton}
                onClick={handleDelete}
                aria-label="Delete notification"
            >
                <X className={styles.deleteIcon} />
            </button>

            {!notification.read && <div className={styles.unreadDot} />}
        </div>
    );
};

export default NotificationItem;
