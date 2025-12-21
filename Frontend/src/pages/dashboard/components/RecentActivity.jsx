/**
 * @file RecentActivity.jsx
 * @description Recent activity feed component
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2025-12-19
 */

import {
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  MessageSquare,
  Bell,
} from "lucide-react";
import styles from "./RecentActivity.module.css";

/**
 * Get activity icon based on type
 * @param {string} type - Activity type
 * @returns {JSX.Element} Icon component
 */
const getActivityIcon = (type) => {
  switch (type) {
    case "success":
      return <CheckCircle className={styles.iconSuccess} size={20} />;
    case "warning":
      return <AlertCircle className={styles.iconWarning} size={20} />;
    case "info":
      return <FileText className={styles.iconInfo} size={20} />;
    case "message":
      return <MessageSquare className={styles.iconMessage} size={20} />;
    case "notification":
      return <Bell className={styles.iconNotification} size={20} />;
    default:
      return <FileText className={styles.iconDefault} size={20} />;
  }
};

/**
 * Format timestamp to relative time
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Relative time string
 */
const formatTime = (timestamp) => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffInHours = Math.floor((now - activityTime) / (1000 * 60 * 60));

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
  return activityTime.toLocaleDateString();
};

/**
 * RecentActivity component
 * @param {Object} props - Component props
 * @param {Array} props.activities - Array of activity objects
 * @param {number} [props.limit] - Maximum number of activities to show
 * @returns {JSX.Element} The rendered activity feed
 */
const RecentActivity = ({ activities = [], limit = 6 }) => {
  const displayedActivities = activities.slice(0, limit);

  if (activities.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FileText size={48} className={styles.emptyIcon} />
        <h3>No recent activity</h3>
        <p>Your activity will appear here</p>
      </div>
    );
  }

  return (
    <div className={styles.recentActivity}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Activity</h2>
        <span className={styles.activityCount}>
          {activities.length} activities
        </span>
      </div>

      <div className={styles.activityList}>
        {displayedActivities.map((activity, index) => (
          <div key={`${activity.id || index}`} className={styles.activityItem}>
            <div className={styles.activityIcon}>
              {getActivityIcon(activity.type)}
            </div>

            <div className={styles.activityContent}>
              <p className={styles.activityText}>{activity.text}</p>

              <div className={styles.activityMeta}>
                <span className={styles.timestamp}>
                  <Clock size={12} />
                  {formatTime(activity.timestamp)}
                </span>

                {activity.status && (
                  <span
                    className={`${styles.status} ${styles[activity.status]}`}>
                    {activity.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length > limit && (
        <button className={styles.viewAllButton}>View all activities</button>
      )}
    </div>
  );
};

export default RecentActivity;
