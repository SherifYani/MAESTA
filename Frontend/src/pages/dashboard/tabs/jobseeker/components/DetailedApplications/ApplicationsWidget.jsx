/**
 * @file ApplicationsWidget.jsx
 * @description Lightweight widget to display recent applications
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-1-21
 */

import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import styles from './ApplicationsWidget.module.css';

const ApplicationsWidget = ({ applications = [], onViewApplication }) => {
    if (!applications || applications.length === 0) {
        return <div className={styles.emptyState}>No active applications</div>;
    }

    const getStatusClass = (status) => {
        const s = status?.toLowerCase() || 'applied';
        if (s.includes('interview')) return styles.status_interview;
        if (s.includes('offer')) return styles.status_offer;
        if (s.includes('reject')) return styles.status_rejected;
        if (s.includes('review')) return styles.status_review;
        return styles.status_applied;
    };

    const formatStatus = (status) => {
        const s = status?.replace('-', ' ') || 'Applied';
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    return (
        <div className={styles.applicationsWidget}>
            <div className={styles.appList}>
                {applications.slice(0, 4).map((app) => (
                    <div
                        key={app.id}
                        className={styles.applicationItem}
                        onClick={() => onViewApplication?.(app.id)}
                    >
                        <div className={styles.itemHeader}>
                            <div className={styles.jobInfo}>
                                <h4>{app.jobTitle || app.title}</h4>
                                <p className={styles.company}>{app.company}</p>
                            </div>
                            <span className={`${styles.statusBadge} ${getStatusClass(app.status)}`}>
                                {formatStatus(app.status)}
                            </span>
                        </div>

                        <div className={styles.itemMeta}>
                            <div className={styles.date}>
                                <Calendar size={12} />
                                <span>{app.appliedDate || app.date}</span>
                            </div>
                            {app.nextAction && (
                                <div className={styles.date}>
                                    <Clock size={12} />
                                    <span>{app.nextAction}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ApplicationsWidget;
