/**
 * @file NotificationSkeleton.jsx
 * @description Loading skeleton component for notifications
 * @author Sherif Talaat
 * @date 2026-02-07
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-07
 */

import React from 'react';
import styles from './NotificationSkeleton.module.css';

/**
 * NotificationSkeleton component - Displays loading skeleton
 * @param {Object} props - Component props
 * @param {number} props.count - Number of skeleton items to display
 * @returns {JSX.Element} Rendered skeleton loader
 */
const NotificationSkeleton = ({ count = 3 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className={styles.skeletonItem}>
                    <div className={styles.iconSkeleton} />
                    <div className={styles.contentSkeleton}>
                        <div className={styles.titleSkeleton} />
                        <div className={styles.messageSkeleton} />
                    </div>
                </div>
            ))}
        </>
    );
};

export default NotificationSkeleton;
