/**
 * @file RecentActivity.jsx
 * @description Timeline-style activity feed component for dashboard.
 *             Shows new proposals, messages, job updates with icons,
 *             descriptions, timestamps, and user mentions.
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2025-12-19
 *
 */

import PropTypes from "prop-types";
import {
  MessageSquare,
  Briefcase,
  UserPlus,
  CheckCircle,
  FileText,
  Clock,
} from "lucide-react";
import styles from "./RecentActivity.module.css";

/**
 * Icon mapping for activity types
 */
const ACTIVITY_ICONS = {
  proposal: FileText,
  message: MessageSquare,
  job: Briefcase,
  connection: UserPlus,
  completion: CheckCircle,
  default: Clock,
};

/**
 * Color mapping for activity types
 */
const ACTIVITY_COLORS = {
  proposal: "var(--color-accent-pink)",
  message: "var(--color-primary)",
  job: "var(--color-vivid-pink)",
  connection: "var(--color-primary)",
  completion: "var(--color-accent)",
  default: "var(--color-muted-foreground)",
};

/**
 * Activity item component
 * @param {Object} props - Component props
 * @param {Object} props.activity - Activity data object
 * @returns {JSX.Element} Rendered activity item
 */
const ActivityItem = ({ activity }) => {
  const IconComponent = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.default;
  const iconColor = ACTIVITY_COLORS[activity.type] || ACTIVITY_COLORS.default;

  return (
    <li className={styles.activityItem} data-read={activity.read}>
      <div className={styles.activityIcon} style={{ color: iconColor }}>
        <IconComponent size={16} />
      </div>

      <div className={styles.activityContent}>
        <p className={styles.activityDescription}>
          {activity.description}
          {activity.user && (
            <span className={styles.userMention}> @{activity.user}</span>
          )}
        </p>

        <div className={styles.activityMeta}>
          <time className={styles.activityTime}>{activity.time}</time>

          {activity.priority && (
            <span
              className={`${styles.priorityBadge} ${
                styles[activity.priority]
              }`}>
              {activity.priority}
            </span>
          )}
        </div>
      </div>
    </li>
  );
};

ActivityItem.propTypes = {
  activity: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.oneOf([
      "proposal",
      "message",
      "job",
      "connection",
      "completion",
    ]),
    description: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    user: PropTypes.string,
    read: PropTypes.bool,
    priority: PropTypes.oneOf(["low", "medium", "high"]),
  }).isRequired,
};

/**
 * RecentActivity component
 * @param {Object} props - Component props
 * @param {Array<Object>} props.activities - Array of activity objects
 * @param {string} props.title - Component title (optional)
 * @returns {JSX.Element} Rendered activity feed
 */
const RecentActivity = ({ activities = [], title = "Recent Activity" }) => {
  const unreadCount = activities.filter((activity) => !activity.read).length;

  return (
    <section className={styles.recentActivity}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>

        {unreadCount > 0 && (
          <span className={styles.unreadBadge}>{unreadCount} new</span>
        )}
      </header>

      <div className={styles.content}>
        {activities.length > 0 ? (
          <ul className={styles.activityList}>
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </ul>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No recent activity</p>
            <p className={styles.emptySubtext}>
              Updates will appear here as they happen
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

RecentActivity.propTypes = {
  /** Array of activity objects */
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      type: PropTypes.oneOf([
        "proposal",
        "message",
        "job",
        "connection",
        "completion",
      ]),
      description: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      user: PropTypes.string,
      read: PropTypes.bool,
      priority: PropTypes.oneOf(["low", "medium", "high"]),
    })
  ),
  /** Component title */
  title: PropTypes.string,
};

RecentActivity.defaultProps = {
  activities: [],
  title: "Recent Activity",
};

export default RecentActivity;

/**
 * @example
 * // Usage example:
 * const activities = [
 *   {
 *     id: 1,
 *     type: 'proposal',
 *     description: 'New proposal received for React Developer position',
 *     time: '2 hours ago',
 *     user: 'john.doe',
 *     read: false,
 *     priority: 'high'
 *   },
 *   {
 *     id: 2,
 *     type: 'message',
 *     description: 'New message from project manager',
 *     time: '4 hours ago',
 *     user: 'jane.smith',
 *     read: true
 *   }
 * ];
 *
 * <RecentActivity activities={activities} title="Latest Updates" />
 */
