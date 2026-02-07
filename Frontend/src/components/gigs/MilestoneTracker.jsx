/**
 * @file MilestoneTracker.jsx
 * @description Component to visualize and manage gig milestones and progress.
 * @author Sherif Talaat
 * @date 2026-02-05
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-07
 */

import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Circle,
    CheckCircle,
    Clock,
    AlertTriangle,
    DollarSign,
    Calendar,
    TrendingUp,
    MoreVertical,
    Edit,
    Trash2,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Button } from '../common';
import styles from './MilestoneTracker.module.css';

/**
 * Status badge component for milestone status.
 * @param {Object} props - Component props.
 * @param {string} props.status - Milestone status.
 * @param {boolean} [props.compact=false] - Whether to show compact version.
 * @returns {JSX.Element} Status badge component.
 */
const StatusBadge = ({ status, compact = false }) => {
    const statusConfig = {
        pending: {
            label: 'Pending',
            icon: Clock,
            className: styles.statusPending,
            iconColor: styles.statusIconPending
        },
        active: {
            label: 'Active',
            icon: Circle,
            className: styles.statusActive,
            iconColor: styles.statusIconActive
        },
        completed: {
            label: 'Completed',
            icon: CheckCircle,
            className: styles.statusCompleted,
            iconColor: styles.statusIconCompleted
        },
        overdue: {
            label: 'Overdue',
            icon: AlertTriangle,
            className: styles.statusOverdue,
            iconColor: styles.statusIconOverdue
        }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    if (compact) {
        return (
            <span
                className={`${styles.statusBadge} ${config.className} ${styles.statusBadgeCompact}`}
                title={config.label}
                aria-label={`Status: ${config.label}`}
            >
                <Icon size={12} className={config.iconColor} aria-hidden="true" />
            </span>
        );
    }

    return (
        <span
            className={`${styles.statusBadge} ${config.className}`}
            aria-label={`Status: ${config.label}`}
        >
            <Icon size={14} className={config.iconColor} aria-hidden="true" />
            <span className={styles.statusLabel}>{config.label}</span>
        </span>
    );
};

StatusBadge.propTypes = {
    status: PropTypes.oneOf(['pending', 'active', 'completed', 'overdue']).isRequired,
    compact: PropTypes.bool
};

/**
 * Milestone tracking component for project management.
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.milestones - List of milestones.
 * @param {function} props.onUpdate - Handler for milestone updates.
 * @param {function} [props.onAdd] - Handler for adding new milestone.
 * @param {function} [props.onDelete] - Handler for deleting milestone.
 * @param {boolean} [props.canEdit=false] - Whether user can edit milestones.
 * @param {string} [props.role='freelancer'] - User role ('client' or 'freelancer').
 * @param {boolean} [props.showDetails=true] - Whether to show milestone details.
 * @param {boolean} [props.collapsible=false] - Whether the tracker is collapsible.
 * @returns {JSX.Element} The rendered milestone tracker component.
 */
const MilestoneTracker = ({
    milestones,
    onUpdate,
    onAdd,
    onDelete,
    canEdit = false,
    role = 'freelancer',
    showDetails = true,
    collapsible = false
}) => {
    // Component state
    const [expandedMilestones, setExpandedMilestones] = useState({});
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [progress, setProgress] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [paidAmount, setPaidAmount] = useState(0);

    /**
     * Calculates progress metrics.
     * @returns {void}
     */
    const calculateMetrics = useCallback(() => {
        if (!milestones || milestones.length === 0) {
            setProgress(0);
            setTotalAmount(0);
            setPaidAmount(0);
            return;
        }

        const completedCount = milestones.filter(m => m.status === 'completed').length;
        const calculatedProgress = Math.round((completedCount / milestones.length) * 100);
        const calculatedTotal = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
        const calculatedPaid = milestones
            .filter(m => m.status === 'completed')
            .reduce((sum, m) => sum + (m.amount || 0), 0);

        setProgress(calculatedProgress);
        setTotalAmount(calculatedTotal);
        setPaidAmount(calculatedPaid);
    }, [milestones]);

    /**
     * Toggles milestone expansion.
     * @param {string|number} milestoneId - Milestone ID.
     * @returns {void}
     */
    const toggleMilestoneExpansion = useCallback((milestoneId) => {
        setExpandedMilestones(prev => ({
            ...prev,
            [milestoneId]: !prev[milestoneId]
        }));
    }, []);

    /**
     * Handles status change for a milestone.
     * @param {string|number} id - Milestone ID.
     * @param {string} currentStatus - Current status.
     * @returns {void}
     */
    const handleStatusChange = useCallback((id, currentStatus) => {
        if (!canEdit) return;

        let newStatus = currentStatus;

        // Define status transitions based on role
        if (role === 'freelancer') {
            switch (currentStatus) {
                case 'pending':
                    newStatus = 'active';
                    break;
                case 'active':
                    newStatus = 'completed';
                    break;
                case 'completed':
                    newStatus = 'pending';
                    break;
                default:
                    newStatus = 'pending';
            }
        } else if (role === 'client') {
            switch (currentStatus) {
                case 'pending':
                    newStatus = 'active';
                    break;
                case 'active':
                    newStatus = 'completed';
                    break;
                case 'completed':
                    newStatus = 'pending';
                    break;
                default:
                    newStatus = 'pending';
            }
        }

        onUpdate(id, newStatus);
    }, [canEdit, role, onUpdate]);

    /**
     * Formats date for display.
     * @param {string} dateString - ISO date string.
     * @returns {string} Formatted date.
     */
    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'Not set';

        const date = new Date(dateString);
        const now = new Date();
        const isOverdue = date < now;

        return (
            <span className={isOverdue ? styles.dateOverdue : ''}>
                {date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                })}
                {isOverdue && (
                    <span className={styles.overdueIndicator} aria-hidden="true"> ⚠️</span>
                )}
            </span>
        );
    }, []);

    /**
     * Gets overdue status for a milestone.
     * @param {string} dueDate - Due date string.
     * @param {string} status - Current status.
     * @returns {string} Overdue status.
     */
    const getOverdueStatus = useCallback((dueDate, status) => {
        if (status === 'completed') return status;

        if (!dueDate) return status;

        const due = new Date(dueDate);
        const now = new Date();

        return due < now ? 'overdue' : status;
    }, []);

    // Calculate metrics on mount and when milestones change
    useEffect(() => {
        calculateMetrics();
    }, [calculateMetrics]);

    // Initialize expanded state for milestones with details
    useEffect(() => {
        const initialExpanded = {};
        milestones.forEach(milestone => {
            if (milestone.description || milestone.attachments?.length > 0) {
                initialExpanded[milestone.id] = false;
            }
        });
        setExpandedMilestones(initialExpanded);
    }, [milestones]);

    // If no milestones, show empty state
    if (!milestones || milestones.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Project Milestones</h2>
                    {canEdit && onAdd && (
                        <Button
                            variant="outline"
                            size="small"
                            onClick={onAdd}
                            aria-label="Add milestone"
                        >
                            Add Milestone
                        </Button>
                    )}
                </div>

                <div className={styles.emptyState}>
                    <Calendar size={48} className={styles.emptyIcon} aria-hidden="true" />
                    <h3 className={styles.emptyTitle}>No milestones yet</h3>
                    <p className={styles.emptyDescription}>
                        Add milestones to track project progress and payments.
                    </p>
                    {canEdit && onAdd && (
                        <Button
                            variant="primary"
                            onClick={onAdd}
                            aria-label="Create first milestone"
                        >
                            Create First Milestone
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h2 className={styles.title}>Project Milestones</h2>
                    <div className={styles.stats}>
                        <span className={styles.statItem} aria-label={`${progress}% complete`}>
                            <TrendingUp size={14} aria-hidden="true" />
                            {progress}% Complete
                        </span>
                        <span className={styles.statItem} aria-label={`$${paidAmount} paid of $${totalAmount} total`}>
                            <DollarSign size={14} aria-hidden="true" />
                            ${paidAmount.toLocaleString()} of ${totalAmount.toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className={styles.headerRight}>
                    {collapsible && (
                        <button
                            type="button"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className={styles.collapseButton}
                            aria-label={isCollapsed ? 'Expand milestones' : 'Collapse milestones'}
                        >
                            {isCollapsed ? (
                                <ChevronDown size={16} aria-hidden="true" />
                            ) : (
                                <ChevronUp size={16} aria-hidden="true" />
                            )}
                        </button>
                    )}

                    {canEdit && onAdd && (
                        <Button
                            variant="outline"
                            size="small"
                            onClick={onAdd}
                            aria-label="Add milestone"
                        >
                            Add Milestone
                        </Button>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className={styles.progressSection}>
                <div className={styles.progressLabels}>
                    <span className={styles.progressLabel}>Project Progress</span>
                    <span className={styles.progressPercentage}>{progress}%</span>
                </div>

                <div
                    className={styles.progressBar}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label={`Project progress: ${progress}% complete`}
                >
                    <div
                        className={styles.progressFill}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className={styles.progressStats}>
                    <div className={styles.progressStat}>
                        <span className={styles.progressStatLabel}>Completed</span>
                        <span className={styles.progressStatValue}>
                            {milestones.filter(m => m.status === 'completed').length} / {milestones.length}
                        </span>
                    </div>

                    <div className={styles.progressStat}>
                        <span className={styles.progressStatLabel}>Active</span>
                        <span className={styles.progressStatValue}>
                            {milestones.filter(m => m.status === 'active').length}
                        </span>
                    </div>

                    <div className={styles.progressStat}>
                        <span className={styles.progressStatLabel}>Pending</span>
                        <span className={styles.progressStatValue}>
                            {milestones.filter(m => m.status === 'pending').length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Milestone List */}
            {!isCollapsed && (
                <div className={styles.milestoneList}>
                    {milestones.map((milestone, index) => {
                        const isLast = index === milestones.length - 1;
                        const isExpanded = expandedMilestones[milestone.id];
                        const overdueStatus = getOverdueStatus(milestone.dueDate, milestone.status);
                        const milestoneStatus = overdueStatus === 'overdue' ? 'overdue' : milestone.status;

                        return (
                            <div
                                key={milestone.id}
                                className={`${styles.milestoneItem} ${styles[`status${milestoneStatus.charAt(0).toUpperCase() + milestoneStatus.slice(1)}`]}`}
                                aria-label={`Milestone ${index + 1}: ${milestone.title}, ${milestoneStatus}`}
                            >
                                {/* Timeline Connector */}
                                {!isLast && (
                                    <div
                                        className={styles.timelineConnector}
                                        aria-hidden="true"
                                    />
                                )}

                                {/* Timeline Dot */}
                                <div className={styles.timelineDot}>
                                    <div className={styles.timelineDotInner}>
                                        <button
                                            type="button"
                                            className={styles.statusButton}
                                            onClick={() => handleStatusChange(milestone.id, milestoneStatus)}
                                            disabled={!canEdit}
                                            aria-label={`Change status from ${milestoneStatus} to next status`}
                                            title={`Current status: ${milestoneStatus}. Click to change.`}
                                        >
                                            {milestoneStatus === 'completed' && (
                                                <CheckCircle size={20} className={styles.statusIcon} aria-hidden="true" />
                                            )}
                                            {milestoneStatus === 'active' && (
                                                <Clock size={20} className={styles.statusIcon} aria-hidden="true" />
                                            )}
                                            {milestoneStatus === 'pending' && (
                                                <Circle size={20} className={styles.statusIcon} aria-hidden="true" />
                                            )}
                                            {milestoneStatus === 'overdue' && (
                                                <AlertTriangle size={20} className={styles.statusIcon} aria-hidden="true" />
                                            )}
                                        </button>

                                        <span className={styles.milestoneNumber} aria-hidden="true">
                                            {index + 1}
                                        </span>
                                    </div>
                                </div>

                                {/* Milestone Content */}
                                <div className={styles.milestoneContent}>
                                    <div className={styles.milestoneHeader}>
                                        <div className={styles.milestoneInfo}>
                                            <h3 className={styles.milestoneTitle}>
                                                {milestone.title}
                                                <StatusBadge
                                                    status={milestoneStatus}
                                                    compact={!showDetails}
                                                />
                                            </h3>

                                            {showDetails && (
                                                <div className={styles.milestoneMeta}>
                                                    <span className={styles.milestoneAmount} aria-label={`Amount: $${milestone.amount}`}>
                                                        <DollarSign size={12} aria-hidden="true" />
                                                        ${milestone.amount?.toLocaleString() || '0'}
                                                    </span>

                                                    <span className={styles.milestoneDueDate} aria-label={`Due date: ${new Date(milestone.dueDate).toLocaleDateString()}`}>
                                                        <Calendar size={12} aria-hidden="true" />
                                                        Due: {formatDate(milestone.dueDate)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.milestoneActions}>
                                            {milestone.description && (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleMilestoneExpansion(milestone.id)}
                                                    className={styles.expandButton}
                                                    aria-expanded={isExpanded}
                                                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} milestone details`}
                                                >
                                                    {isExpanded ? (
                                                        <ChevronUp size={16} aria-hidden="true" />
                                                    ) : (
                                                        <ChevronDown size={16} aria-hidden="true" />
                                                    )}
                                                </button>
                                            )}

                                            {canEdit && onDelete && (
                                                <button
                                                    type="button"
                                                    onClick={() => onDelete(milestone.id)}
                                                    className={styles.deleteButton}
                                                    aria-label={`Delete milestone: ${milestone.title}`}
                                                >
                                                    <Trash2 size={16} aria-hidden="true" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {isExpanded && milestone.description && (
                                        <div
                                            className={styles.milestoneDetails}
                                            aria-label="Milestone details"
                                        >
                                            <div className={styles.descriptionSection}>
                                                <h4 className={styles.detailsTitle}>Description</h4>
                                                <p className={styles.milestoneDescription}>
                                                    {milestone.description}
                                                </p>
                                            </div>

                                            {milestone.deliverables && milestone.deliverables.length > 0 && (
                                                <div className={styles.deliverablesSection}>
                                                    <h4 className={styles.detailsTitle}>Deliverables</h4>
                                                    <ul className={styles.deliverablesList}>
                                                        {milestone.deliverables.map((deliverable, idx) => (
                                                            <li key={idx} className={styles.deliverableItem}>
                                                                <CheckCircle size={12} className={styles.deliverableIcon} aria-hidden="true" />
                                                                {deliverable}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {milestone.attachments && milestone.attachments.length > 0 && (
                                                <div className={styles.attachmentsSection}>
                                                    <h4 className={styles.detailsTitle}>Attachments</h4>
                                                    <div className={styles.attachmentsList}>
                                                        {milestone.attachments.map((attachment, idx) => (
                                                            <a
                                                                key={idx}
                                                                href={attachment.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={styles.attachmentItem}
                                                                aria-label={`View attachment: ${attachment.name}`}
                                                            >
                                                                {attachment.name}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Summary */}
            {showDetails && (
                <div className={styles.summary}>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Total Budget</span>
                        <span className={styles.summaryValue}>${totalAmount.toLocaleString()}</span>
                    </div>

                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Paid</span>
                        <span className={styles.summaryValue}>${paidAmount.toLocaleString()}</span>
                    </div>

                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Remaining</span>
                        <span className={styles.summaryValue}>
                            ${(totalAmount - paidAmount).toLocaleString()}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

MilestoneTracker.propTypes = {
    milestones: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            title: PropTypes.string.isRequired,
            description: PropTypes.string,
            amount: PropTypes.number.isRequired,
            dueDate: PropTypes.string.isRequired,
            status: PropTypes.oneOf(['pending', 'active', 'completed']).isRequired,
            deliverables: PropTypes.arrayOf(PropTypes.string),
            attachments: PropTypes.arrayOf(
                PropTypes.shape({
                    name: PropTypes.string.isRequired,
                    url: PropTypes.string.isRequired
                })
            )
        })
    ).isRequired,
    onUpdate: PropTypes.func.isRequired,
    onAdd: PropTypes.func,
    onDelete: PropTypes.func,
    canEdit: PropTypes.bool,
    role: PropTypes.oneOf(['client', 'freelancer']),
    showDetails: PropTypes.bool,
    collapsible: PropTypes.bool
};

export default MilestoneTracker;