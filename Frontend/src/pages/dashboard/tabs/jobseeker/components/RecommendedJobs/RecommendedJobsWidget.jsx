/**
 * @file RecommendedJobsWidget.jsx
 * @description Lightweight widget to display recommended jobs
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-1-21
 */

import React from 'react';
import { Briefcase, MapPin, TrendingUp } from 'lucide-react';
import Badge from '../../../../components/ui/Badge';
import styles from './RecommendedJobsWidget.module.css';

const RecommendedJobsWidget = ({ jobs = [], onJobClick }) => {
    if (!jobs || jobs.length === 0) {
        return <div className={styles.emptyState}>No recommended jobs</div>;
    }

    const getStatusVariant = (status) => {
        const variants = {
            'review': 'pending',
            'interview': 'active',
            'offer': 'success',
            'rejected': 'destructive',
            'withdrawn': 'outline',
            'under-review': 'pending',
            'accepted': 'success',
            'active': 'success'
        };
        return variants[status] || 'outline';
    };

    const formatStatus = (status) => {
        const statusMap = {
            'review': 'Under Review',
            'interview': 'Interview',
            'offer': 'Offer',
            'rejected': 'Rejected',
            'withdrawn': 'Withdrawn',
            'under-review': 'Review',
            'accepted': 'Accepted',
            'active': 'Active'
        };
        return statusMap[status] || status;
    };

    return (
        <div className={styles.recommendedJobsWidget}>
            <div className={styles.jobsList}>
                {jobs.slice(0, 3).map((job) => (
                    <div
                        key={job.id}
                        className={styles.jobItem}
                        onClick={() => onJobClick?.(job.id)}
                    >
                        <div className={styles.itemHeader}>
                            <div className={styles.jobInfo}>
                                <h4>
                                    <Briefcase size={14} className={styles.briefcaseIcon} />
                                    {job.title}
                                </h4>
                                <div className={styles.company}>
                                    <span>🏢</span> {job.company}
                                </div>
                            </div>
                            <Badge
                                variant={getStatusVariant(job.status)}
                                size="sm"
                                className={styles.statusBadge}
                            >
                                {formatStatus(job.status)}
                            </Badge>
                        </div>

                        <div className={styles.itemMeta}>
                            <div className={styles.location}>
                                <MapPin size={12} />
                                <span>{job.location}</span>
                            </div>
                            <div className={styles.salary}>
                                <span>💰</span>
                                <span>{job.salary}</span>
                            </div>
                        </div>

                        {job.matchScore && (
                            <div className={styles.itemMeta}>
                                <div className={styles.matchBadge}>
                                    <TrendingUp size={12} />
                                    <span>{job.matchScore}% Match</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecommendedJobsWidget;
