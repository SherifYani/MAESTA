/**
 * @file PendingActions.jsx
 * @description Widget to display pending admin tasks
 * @author Sherif Talaat
 * @date 2026-02-06
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-07
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ChevronRight } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import styles from './AdminOverviewWidgets.module.css';

/**
 * Priority badge component for pending actions.
 * @param {Object} props - Component props.
 * @param {string} props.priority - The priority level (high, medium, low).
 * @returns {JSX.Element} The rendered priority badge.
 */
const PriorityBadge = ({ priority }) => {
    return (
        <span className={`${styles.priorityBadge} ${styles[`priorityBadge--${priority}`]}`}>
            {priority}
        </span>
    );
};

PriorityBadge.propTypes = {
    priority: PropTypes.oneOf(['high', 'medium', 'low']).isRequired
};

/**
 * Pending Actions widget component.
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.actions - Array of pending action objects.
 * @returns {JSX.Element} The rendered pending actions widget.
 */
const PendingActions = ({ actions }) => {
    const navigate = useNavigate();
    const totalCount = actions.reduce((acc, curr) => acc + curr.count, 0);

    /**
     * Handles action item click.
     * @param {Object} action - The action object.
     */
    const handleActionClick = (action) => {
        // Navigate to the specific pending items page
        navigate(`/dashboard/admin/pending/${action.id}`);
    };

    /**
     * Handles resolve button click.
     * @param {Object} action - The action object.
     * @param {Event} event - The click event.
     */
    const handleResolveClick = (action, event) => {
        event.stopPropagation();
        // Navigate to resolve action page
        navigate(`/dashboard/admin/resolve/${action.id}`);
    };

    return (
        <Card className={styles.widget}>
            <header className={styles.widget__header}>
                <h2 className={styles.widget__title}>Pending Actions</h2>
                <span className={styles.widget__badge} aria-label={`${totalCount} pending actions`}>
                    {totalCount}
                </span>
            </header>
            <div className={styles.action__list} role="list" aria-label="Pending actions">
                {actions.map((action) => (
                    <div
                        key={action.id}
                        className={styles.action__item}
                        role="listitem"
                        onClick={() => handleActionClick(action)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleActionClick(action);
                            }
                        }}
                        tabIndex={0}
                        aria-label={`${action.title}: ${action.count} items, priority: ${action.priority}`}
                    >
                        <div className={styles.action__content}>
                            <h3 className={styles.action__title}>{action.title}</h3>
                            <div className={styles.action__meta}>
                                <PriorityBadge priority={action.priority} />
                                <span className={styles.action__count}>
                                    {action.count} item{action.count !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                        <button
                            className={styles.action__button}
                            onClick={(e) => handleResolveClick(action, e)}
                            aria-label={`Resolve ${action.title}`}
                        >
                            <ChevronRight size={18} aria-hidden="true" />
                        </button>
                    </div>
                ))}
            </div>
        </Card>
    );
};

PendingActions.propTypes = {
    /** Array of pending action objects */
    actions: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            title: PropTypes.string.isRequired,
            count: PropTypes.number.isRequired,
            priority: PropTypes.oneOf(['high', 'medium', 'low']).isRequired
        })
    ).isRequired
};

export default PendingActions;