/**
 * @file PendingActions.jsx
 * @description Interactive pending actions/tasks component - NO internal card wrapper
 * @author Sherif Talaat
 * @version 2.0.0
 * @date 2025-12-19
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-12-21
 */

import { Check, Clock, AlertTriangle, Calendar } from "lucide-react";
import { useState } from "react";
import styles from "./PendingActions.module.css";

/**
 * PendingActions component - renders list only, no card wrapper
 */
const PendingActions = ({ actions = [], onActionComplete }) => {
  const [completedActions, setCompletedActions] = useState(new Set());

  const handleCompleteAction = (actionId) => {
    setCompletedActions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(actionId)) {
        newSet.delete(actionId);
      } else {
        newSet.add(actionId);
      }

      // Notify parent component
      if (onActionComplete) {
        onActionComplete(actionId, newSet.has(actionId));
      }

      return newSet;
    });
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className={styles.priorityHigh} size={16} />;
      case "medium":
        return <Clock className={styles.priorityMedium} size={16} />;
      case "low":
        return <Calendar className={styles.priorityLow} size={16} />;
      default:
        return <Clock className={styles.priorityDefault} size={16} />;
    }
  };

  const completedCount = completedActions.size;
  const totalCount = actions.length;
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (actions.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Check size={48} className={styles.emptyIcon} />
        <h3>All caught up!</h3>
        <p>No pending actions</p>
      </div>
    );
  }

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
              }`}>
              <button
                className={styles.checkbox}
                onClick={() => handleCompleteAction(action.id)}
                aria-label={
                  isCompleted ? "Mark as pending" : "Mark as complete"
                }>
                <Check size={16} className={styles.checkIcon} />
              </button>

              <div className={styles.actionContent}>
                <div className={styles.actionHeader}>
                  <span className={styles.actionTitle}>{action.title}</span>

                  <div className={styles.actionMeta}>
                    {action.priority && (
                      <span className={styles.priority}>
                        {getPriorityIcon(action.priority)}
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
                        onClick={() => btn.onClick && btn.onClick(action.id)}>
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
};

export default PendingActions;
