/**
 * @file RecentActivity.jsx
 * @description Widget to display recent system activities
 * @author Sherif Talaat
 * @date 2026-02-06
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-07
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Clock, User, CheckCircle, AlertTriangle, FileText, DollarSign } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import styles from './AdminOverviewWidgets.module.css';

/**
 * Renders the appropriate icon for activity type.
 * @param {Object} props - Component props.
 * @param {string} props.type - The activity type.
 * @returns {JSX.Element} The activity icon element.
 */
const ActivityIcon = ({ type }) => {
    const iconMap = {
        user_signup: { Icon: User, className: styles['activity__icon--user'] },
        job_post: { Icon: FileText, className: styles['activity__icon--job'] },
        report: { Icon: AlertTriangle, className: styles['activity__icon--report'] },
        payment: { Icon: DollarSign, className: styles['activity__icon--payment'] },
        job_application: { Icon: CheckCircle, className: styles['activity__icon--application'] }
    };

    const { Icon, className = styles['activity__icon--default'] } = iconMap[type] || { Icon: Clock, className: styles['activity__icon--default'] };

    return <Icon size={16} className={className} aria-hidden="true" />;
};

ActivityIcon.propTypes = {
    type: PropTypes.string.isRequired
};

/**
 * Recent Activity widget component.
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.activities - Array of activity objects.
 * @returns {JSX.Element} The rendered recent activity widget.
 */
const RecentActivity = ({ activities }) => {
    const navigate = useNavigate();

    /**
     * Handles view all button click.
     */
    const handleViewAll = () => {
        // Navigate to activities page
        navigate('/dashboard/admin/activities');
    };

    return (
        <Card className={styles.widget}>
            <header className={styles.widget__header}>
                <h2 className={styles.widget__title}>Recent Activity</h2>
                <button
                    className={styles.widget__viewAll}
                    onClick={handleViewAll}
                    aria-label="View all activities"
                >
                    View All
                </button>
            </header>
            <div className={styles.activity__list} role="list" aria-label="Recent activities">
                {activities.map((activity) => (
                    <article key={activity.id} className={styles.activity__item} role="listitem">
                        <div className={styles.activity__iconWrapper}>
                            <ActivityIcon type={activity.type} />
                        </div>
                        <div className={styles.activity__content}>
                            <p className={styles.activity__text}>
                                <span className={styles.activity__user}>{activity.user}</span> {activity.action}
                            </p>
                            <time className={styles.activity__time} dateTime={activity.timestamp || activity.time}>
                                {activity.time}
                            </time>
                        </div>
                    </article>
                ))}
            </div>
        </Card>
    );
};

RecentActivity.propTypes = {
    /** Array of activity objects */
    activities: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            type: PropTypes.oneOf(['user_signup', 'job_post', 'report', 'payment', 'job_application']).isRequired,
            user: PropTypes.string.isRequired,
            action: PropTypes.string.isRequired,
            time: PropTypes.string.isRequired,
            timestamp: PropTypes.string
        })
    ).isRequired
};

export default RecentActivity;