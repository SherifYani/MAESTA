/**
 * @file PendingActions.jsx
 * @description To-do list style component for dashboard pending actions.
 *             Shows review proposals, approve payments, respond to messages
 *             with checkboxes, priority indicators, and time indicators.
 * @author Sherif Talaat
 * @version 1.0.0   
 * @date 2025-12-19
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  CheckCircle2, 
  Circle,
  AlertCircle,
  Clock,
  Calendar,
  TrendingUp,
  MessageSquare,
  FileCheck,
  DollarSign
} from 'lucide-react';
import styles from './PendingActions.module.css';

/**
 * Icon mapping for action types
 */
const ACTION_ICONS = {
  review: FileCheck,
  payment: DollarSign,
  message: MessageSquare,
  deadline: Clock,
  meeting: Calendar,
  update: TrendingUp,
  default: AlertCircle
};

/**
 * Priority color mapping
 */
const PRIORITY_COLORS = {
  low: {
    bg: 'var(--color-accent)',
    fg: 'var(--color-accent-foreground)',
    border: 'var(--color-accent)'
  },
  medium: {
    bg: 'var(--color-secondary)',
    fg: 'var(--color-secondary-foreground)',
    border: 'var(--color-secondary)'
  },
  high: {
    bg: 'var(--color-destructive)',
    fg: 'var(--color-destructive-foreground)',
    border: 'var(--color-destructive)'
  }
};

/**
 * Priority label mapping
 */
const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
};

/**
 * Action item component
 * @param {Object} props - Component props
 * @param {Object} props.action - Action data object
 * @param {Function} props.onToggle - Callback when checkbox is toggled
 * @param {Function} props.onClick - Callback when action is clicked
 * @returns {JSX.Element} Rendered action item
 */
const ActionItem = ({ action, onToggle, onClick }) => {
  const IconComponent = ACTION_ICONS[action.type] || ACTION_ICONS.default;
  const priorityColor = PRIORITY_COLORS[action.priority] || PRIORITY_COLORS.medium;

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onToggle?.(action.id, !action.completed);
  };

  return (
    <li 
      className={styles.actionItem} 
      data-priority={action.priority}
      data-completed={action.completed}
      onClick={() => onClick?.(action.id)}
    >
      <button
        className={styles.checkboxButton}
        onClick={handleCheckboxClick}
        aria-label={action.completed ? 'Mark as incomplete' : 'Mark as complete'}
        title={action.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {action.completed ? (
          <CheckCircle2 
            className={styles.checkboxIcon} 
            color="var(--color-accent-pink)" 
            size={20} 
          />
        ) : (
          <Circle 
            className={styles.checkboxIcon} 
            color="var(--color-muted-foreground)" 
            size={20} 
          />
        )}
      </button>

      <div className={styles.actionContent}>
        <div className={styles.actionHeader}>
          <h3 className={styles.actionTitle}>
            {action.title}
          </h3>
          
          <div className={styles.actionMeta}>
            {action.dueDate && (
              <span className={styles.dueDate}>
                <Clock size={12} />
                {action.dueDate}
              </span>
            )}
            
            <span 
              className={styles.priorityBadge}
              style={{
                backgroundColor: priorityColor.bg,
                color: priorityColor.fg,
                borderColor: priorityColor.border
              }}
            >
              {PRIORITY_LABELS[action.priority] || action.priority}
            </span>
          </div>
        </div>

        {action.description && (
          <p className={styles.actionDescription}>
            {action.description}
          </p>
        )}

        {action.category && (
          <div className={styles.actionFooter}>
            <div className={styles.categoryTag}>
              <IconComponent size={12} />
              <span>{action.category}</span>
            </div>
            
            {action.assignedTo && (
              <span className={styles.assignedTo}>
                Assigned to: {action.assignedTo}
              </span>
            )}
          </div>
        )}
      </div>
    </li>
  );
};

ActionItem.propTypes = {
  action: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    priority: PropTypes.oneOf(['low', 'medium', 'high']).isRequired,
    dueDate: PropTypes.string,
    completed: PropTypes.bool,
    category: PropTypes.string,
    type: PropTypes.oneOf(['review', 'payment', 'message', 'deadline', 'meeting', 'update']),
    assignedTo: PropTypes.string
  }).isRequired,
  onToggle: PropTypes.func,
  onClick: PropTypes.func
};

/**
 * PendingActions component
 * @param {Object} props - Component props
 * @param {Array<Object>} props.actions - Array of action objects
 * @param {string} props.title - Component title (optional)
 * @param {Function} props.onActionToggle - Callback when action is toggled
 * @param {Function} props.onActionClick - Callback when action is clicked
 * @returns {JSX.Element} Rendered pending actions list
 */
const PendingActions = ({ 
  actions = [], 
  title = 'Pending Actions',
  onActionToggle,
  onActionClick
}) => {
  const [completedFilter, setCompletedFilter] = useState('pending'); // 'all', 'pending', 'completed'
  
  const pendingCount = actions.filter(action => !action.completed).length;
  const completedCount = actions.filter(action => action.completed).length;

  const filteredActions = actions.filter(action => {
    if (completedFilter === 'all') return true;
    if (completedFilter === 'pending') return !action.completed;
    if (completedFilter === 'completed') return action.completed;
    return true;
  });

  const handleToggle = (id, completed) => {
    onActionToggle?.(id, completed);
  };

  const handleClick = (id) => {
    onActionClick?.(id);
  };

  return (
    <section className={styles.pendingActions}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h2 className={styles.title}>{title}</h2>
          
          <div className={styles.stats}>
            <span className={styles.statItem}>
              <span className={styles.statNumber}>{pendingCount}</span>
              <span className={styles.statLabel}>Pending</span>
            </span>
            <span className={styles.statItem}>
              <span className={styles.statNumber}>{completedCount}</span>
              <span className={styles.statLabel}>Completed</span>
            </span>
          </div>
        </div>

        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${completedFilter === 'all' ? styles.active : ''}`}
            onClick={() => setCompletedFilter('all')}
          >
            All ({actions.length})
          </button>
          <button
            className={`${styles.filterTab} ${completedFilter === 'pending' ? styles.active : ''}`}
            onClick={() => setCompletedFilter('pending')}
          >
            Pending ({pendingCount})
          </button>
          <button
            className={`${styles.filterTab} ${completedFilter === 'completed' ? styles.active : ''}`}
            onClick={() => setCompletedFilter('completed')}
          >
            Completed ({completedCount})
          </button>
        </div>
      </header>

      <div className={styles.content}>
        {filteredActions.length > 0 ? (
          <ul className={styles.actionsList}>
            {filteredActions.map((action) => (
              <ActionItem 
                key={action.id} 
                action={action} 
                onToggle={handleToggle}
                onClick={handleClick}
              />
            ))}
          </ul>
        ) : (
          <div className={styles.emptyState}>
            <CheckCircle2 size={48} color="var(--color-muted-foreground)" />
            <p className={styles.emptyText}>
              {completedFilter === 'completed' 
                ? 'No completed actions'
                : 'No pending actions'}
            </p>
            <p className={styles.emptySubtext}>
              {completedFilter === 'completed' 
                ? 'Complete some tasks to see them here'
                : 'All caught up! No pending actions.'}
            </p>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        {pendingCount > 0 && (
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ 
                width: `${(completedCount / actions.length) * 100}%` 
              }}
            />
          </div>
        )}
        
        <div className={styles.progressText}>
          {pendingCount > 0 ? (
            <>
              <span>{completedCount} of {actions.length} completed</span>
              <span>{Math.round((completedCount / actions.length) * 100)}%</span>
            </>
          ) : (
            <span>All actions completed</span>
          )}
        </div>
      </footer>
    </section>
  );
};

PendingActions.propTypes = {
  /** Array of action objects */
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      priority: PropTypes.oneOf(['low', 'medium', 'high']).isRequired,
      dueDate: PropTypes.string,
      completed: PropTypes.bool,
      category: PropTypes.string,
      type: PropTypes.oneOf(['review', 'payment', 'message', 'deadline', 'meeting', 'update']),
      assignedTo: PropTypes.string
    })
  ),
  /** Component title */
  title: PropTypes.string,
  /** Callback when action is toggled (id, completed) */
  onActionToggle: PropTypes.func,
  /** Callback when action is clicked (id) */
  onActionClick: PropTypes.func
};

PendingActions.defaultProps = {
  actions: [],
  title: 'Pending Actions'
};

export default PendingActions;

/**
 * @example
 * // Usage example:
 * const actions = [
 *   {
 *     id: 1,
 *     title: 'Review proposals for React Developer',
 *     description: '3 new proposals need review',
 *     priority: 'high',
 *     dueDate: 'Tomorrow',
 *     completed: false,
 *     category: 'Review',
 *     type: 'review',
 *     assignedTo: 'John Doe'
 *   },
 *   {
 *     id: 2,
 *     title: 'Approve invoice payment',
 *     description: 'Invoice #INV-2023-001 for $2,500',
 *     priority: 'medium',
 *     dueDate: 'In 3 days',
 *     completed: false,
 *     category: 'Payment',
 *     type: 'payment'
 *   }
 * ];
 * 
 * const handleToggle = (id, completed) => {
 *   console.log(`Action ${id} marked as ${completed ? 'completed' : 'pending'}`);
 * };
 * 
 * const handleClick = (id) => {
 *   console.log(`Action ${id} clicked`);
 * };
 * 
 * <PendingActions 
 *   actions={actions}
 *   title="My Tasks"
 *   onActionToggle={handleToggle}
 *   onActionClick={handleClick}
 * />
 */