/**
 * @file NotificationBell.jsx
 * @description Bell icon component with unread notification count and dropdown trigger
 * @author Sherif Talaat
 * @date 2026-02-07
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-07
 */

import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import styles from './NotificationBell.module.css';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

/**
 * NotificationBell component - Displays notification bell with count
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS class
 * @returns {JSX.Element} Rendered notification bell
 */
const NotificationBell = ({ className = '' }) => {
    const { unreadCount } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const bellRef = useRef(null);

    /**
     * Handles click on the bell button
     */
    const handleClick = () => {
        setIsOpen(!isOpen);
    };

    /**
     * Handles closing the dropdown when clicking outside
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bellRef.current && !bellRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className={`${styles.notificationBell} ${className}`} ref={bellRef}>
            <button
                className={`${styles.bellButton} ${unreadCount > 0 ? styles.hasUnread : ''}`}
                onClick={handleClick}
                aria-label={`Notifications (${unreadCount} unread)`}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <Bell className={styles.bellIcon} />
                {unreadCount > 0 && (
                    <span className={styles.badge} aria-label={`${unreadCount} unread notifications`}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && <NotificationDropdown onClose={() => setIsOpen(false)} />}
        </div>
    );
};

export default NotificationBell;
