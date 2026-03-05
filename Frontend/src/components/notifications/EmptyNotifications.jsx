/**
 * @file EmptyNotifications.jsx
 * @description Empty state component for when there are no notifications
 * @author Sherif Talaat
 * @date 2026-02-07
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-07
 */

import React from 'react';
import { Bell } from 'lucide-react';
import styles from './EmptyNotifications.module.css';

/**
 * EmptyNotifications component - Displays empty state
 * @param {Object} props - Component props
 * @param {string} props.message - Optional custom message
 * @returns {JSX.Element} Rendered empty state
 */
const EmptyNotifications = ({ message = "No notifications yet" }) => {
    return (
        <div className={styles.emptyState}>
            <div className={styles.iconWrapper}>
                <Bell className={styles.icon} />
            </div>
            <p className={styles.message}>{message}</p>
            <p className={styles.subtitle}>We'll notify you when something new happens</p>
        </div>
    );
};

export default EmptyNotifications;
