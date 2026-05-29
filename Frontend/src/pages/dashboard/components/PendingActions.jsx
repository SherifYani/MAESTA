/**
 * @file PendingActions.jsx
 * @description Unified pending actions/tasks component supporting both jobseeker and admin modes
 * @author Sherif Talaat
 * @version 3.0.0 (Unified)
 * @date 2026-05-23
 *
 * @supports
 * - Jobseeker mode: checkbox completion tracking with progress
 * - Admin mode: click-through navigation with priority badges
 */

import { Check, Clock, AlertTriangle, Calendar, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import styles from "./PendingActions.module.css";

/**
 * Priority badge component for admin mode actions.
 */
const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    high: { icon: AlertTriangle, label: 'High', color: 'error' },
    medium: { icon: Clock, label: 'Medium', color: 'warning' },
    low: { icon: Calendar, label: 'Low', color: 'info' }
  };

  const config = priorityConfig[priority] || priorityConfig.low;
  const Icon = config.icon;

  return (
    <span className={`${styles.priorityBadge} ${styles[`priority--${config.color}`]}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
};

PriorityBadge.propTypes = {
  priority: PropTypes.oneOf(['high', 'medium', 'low']).isRequired
};

/**
 * Unified PendingActions component
 * @param {Object} props - Component props
 * @param {Array} props.actions - Array of action objects
 * @param {string} props.mode - 'jobseeker' or 'admin' (default: 'jobseeker')
 * @param {Function} props.onActionComplete - Callback for jobseeker mode (mark as complete)
 * @param {Function} props.onActionClick - Callback for admin mode (click action)
 * @param {Function} props.onResolve - Callback for admin mode (resolve button)
 * @returns {JSX.Element} Rendered component
 */
const PendingActions = ({
  actions = [],
  mode = 'jobseeker',
  onActionComplete,
  onActionClick,
  onResolve
}) => {
  const navigate = useNavigate();
  const [completedActions, setCompletedActions] = useState(new Set());

  // ──── Jobseeker Mode Handlers ────────────────────────────────────────

  const handleCompleteAction = (actionId) => {
    setCompletedActions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(actionId)) {
        newSet.delete(actionId);
      } else {
        newSet.add(actionId);
      }

      if (onActionComplete) {
        onActionComplete(actionId, newSet.has(actionId));
      }

      return newSet;
    });
  };

  // ──── Admin Mode Handlers ────────────────────────────────────────────

  const handleAdminActionClick = (action) => {
    if (onActionClick) {
      onActionClick(action);
    } else {
      navigate(`/dashboard/pending/${action.id}`);
    }
  };

  const handleAdminResolve = (action, event) => {
    event.stopPropagation();
    if (onResolve) {
      onResolve(action);
    } else {
      navigate(`/dashboard/resolve/${action.id}`);
    }
  };

  // ──── Render: Empty State ────────────────────────────────────────────

  if (actions.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Check size={48} className={styles.emptyIcon} />
        <h3>All caught up!</h3>
        <p>No pending actions</p>
      </div>
    );
  }

  // ──── Render: Jobseeker Mode ─────────────────────────────────────────

  if (mode === 'jobseeker') {
    const completedCount = completedActions.size;
    const totalCount = actions.length;
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
      <div className={styles.pendingActionsContent}>
        {/* Progress tracking at top */}
        <div className={styles.progress}>
          <span className={styles.progressText}>
            {completedCount} of {totalCount} completed
          </span>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Actions list */}
        <div className={styles.actionsList}>
          {actions.map((action) => {
            const isCompleted = completedActions.has(action.id);

            return (
              <div
                key={action.id}
                className={`${styles.actionItem} ${
                  isCompleted ? styles.completed : ""
                }`}
              >
                <button
                  className={styles.checkbox}
                  onClick={() => handleCompleteAction(action.id)}
                  aria-label={
                    isCompleted ? "Mark as pending" : "Mark as complete"
                  }
                >
                  <Check size={16} className={styles.checkIcon} />
                </button>

                <div className={styles.actionContent}>
                  <div className={styles.actionHeader}>
                    <span className={styles.actionTitle}>{action.title}</span>

                    <div className={styles.actionMeta}>
                      {action.priority && (
                        <span className={styles.priority}>
                          <AlertTriangle size={12} />
                          {action.priority}
                        </span>
                      )}

                      {action.dueDate && (
                        <span className={styles.dueDate}>
                          <Calendar size={12} />
                          {new Date(action.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {action.description && (
                    <p className={styles.actionDescription}>
                      {action.description}
                    </p>
                  )}

                  {action.actions && (
                    <div className={styles.actionButtons}>
                      {action.actions.map((btn, idx) => (
                        <button
                          key={idx}
                          className={`${styles.actionButton} ${styles[btn.type]}`}
                          onClick={() => btn.onClick && btn.onClick(action.id)}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ──── Render: Admin Mode ─────────────────────────────────────────────

  if (mode === 'admin') {
    const totalCount = actions.reduce((acc, curr) => acc + (curr.count || 1), 0);

    return (
      <div className={styles.adminActionsContainer}>
        <div className={styles.adminHeader}>
          <h3 className={styles.adminTitle}>Pending Actions</h3>
          <span className={styles.adminBadge} aria-label={`${totalCount} pending actions`}>
            {totalCount}
          </span>
        </div>

        <div className={styles.adminActionsList} role="list" aria-label="Pending actions">
          {actions.map((action) => (
            <div
              key={action.id}
              className={styles.adminActionItem}
              role="listitem"
              onClick={() => handleAdminActionClick(action)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleAdminActionClick(action);
                }
              }}
              tabIndex={0}
              aria-label={`${action.title}: ${action.count || 1} items, priority: ${action.priority}`}
            >
              <div className={styles.adminActionContent}>
                <h4 className={styles.adminActionTitle}>{action.title}</h4>
                <div className={styles.adminActionMeta}>
                  <PriorityBadge priority={action.priority} />
                  <span className={styles.adminActionCount}>
                    {action.count || 1} item{(action.count || 1) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <button
                className={styles.adminActionButton}
                onClick={(e) => handleAdminResolve(action, e)}
                aria-label={`Resolve ${action.title}`}
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

PendingActions.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      priority: PropTypes.oneOf(['high', 'medium', 'low']),
      dueDate: PropTypes.string,
      count: PropTypes.number,
      actions: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          type: PropTypes.string,
          onClick: PropTypes.func
        })
      )
    })
  ),
  mode: PropTypes.oneOf(['jobseeker', 'admin']),
  onActionComplete: PropTypes.func,
  onActionClick: PropTypes.func,
  onResolve: PropTypes.func
};

PendingActions.defaultProps = {
  actions: [],
  mode: 'jobseeker',
  onActionComplete: null,
  onActionClick: null,
  onResolve: null
};

export default PendingActions;
