/**
 * @file SavedJobsWidget.jsx
 * @description Lightweight widget to display saved jobs
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-1-21
 */

import React from 'react';
import { MapPin, DollarSign, X, Check, ArrowRight } from 'lucide-react';
import styles from './SavedJobsWidget.module.css';

const SavedJobsWidget = ({ jobs = [], onRemove, onApply, onView }) => {
    if (!jobs || jobs.length === 0) {
        return <div className={styles.emptyState}>No saved jobs</div>;
    }

    return (
        <div className={styles.savedJobsWidget}>
            <div className={styles.jobsList}>
                {jobs.slice(0, 3).map((job) => (
                    <div
                        key={job.id}
                        className={styles.jobItem}
                        onClick={() => onView?.(job.id)}
                    >
                        <div className={styles.itemHeader}>
                            <div className={styles.jobInfo}>
                                <h5>{job.jobTitle || job.title}</h5>
                                <p className={styles.company}>{job.company}</p>
                            </div>
                        </div>

                        <div className={styles.itemMeta}>
                            <div className={styles.location}>
                                <MapPin size={12} />
                                <span>{job.location}</span>
                            </div>
                            <div className={styles.salary}>
                                <DollarSign size={12} />
                                <span>{job.salary}</span>
                            </div>
                        </div>

                        <div className={styles.actions}>
                            {job.hasApplied ? (
                                <span className={styles.appliedBadge}>
                                    <Check size={10} /> Applied
                                </span>
                            ) : (
                                <button
                                    className={`${styles.actionBtn} ${styles.applyBtn}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onApply?.(job.id);
                                    }}
                                >
                                    Apply
                                </button>
                            )}
                            <button
                                className={`${styles.actionBtn} ${styles.removeBtn}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove?.(job.id);
                                }}
                                title="Remove from saved"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SavedJobsWidget;
