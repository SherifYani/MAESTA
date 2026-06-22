/**
 * @file PublishedJobsWidget.jsx
 * @description Lightweight published jobs widget for company dashboard overview
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-01-28
 */

import { Users, Clock, MapPin, CheckCircle, AlertCircle } from "lucide-react";
import Badge from "../../../../components/ui/Badge";
import PropTypes from "prop-types";
import styles from "./PublishedJobsWidget.module.css";

/**
 * Published Jobs Widget Component
 * @param {Object} props - Component props
 * @param {Array} props.jobs - Array of job objects (limited to recent/active)
 * @param {Function} props.onViewJob - Callback for viewing job details
 * @returns {JSX.Element} Widget component
 */
const PublishedJobsWidget = ({ jobs, onViewJob }) => {
    const activeJobs = jobs?.filter(job => job.status === "active") || [];
    const displayJobs = activeJobs.slice(0, 4); // Show max 4 jobs

    const getStatusVariant = (status) => {
        switch (status) {
            case "active": return "success";
            case "paused": return "warning";
            case "closed": return "error";
            default: return "default";
        }
    };

    const getDaysRemaining = (expiryDate) => {
        const expiry = new Date(expiryDate);
        const today = new Date();
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (displayJobs.length === 0) {
        return (
            <div className={styles.emptyState}>
                <AlertCircle size={32} />
                <p>No active jobs</p>
            </div>
        );
    }

    return (
        <div className={styles.jobsWidget}>
            {displayJobs.map(job => {
                const daysRemaining = getDaysRemaining(job.expiryDate);
                const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

                return (
                    <div
                        key={job.id}
                        className={styles.jobItem}
                        onClick={() => onViewJob && onViewJob(job.id)}
                    >
                        <div className={styles.jobHeader}>
                            <div className={styles.jobInfo}>
                                <h4 className={styles.jobTitle}>{job.title}</h4>
                                <div className={styles.jobMeta}>
                                    <span className={styles.metaItem}>
                                        <MapPin size={12} />
                                        {job.location}
                                    </span>
                                    <span className={styles.metaItem}>
                                        {job.department}
                                    </span>
                                </div>
                            </div>
                            <Badge variant={getStatusVariant(job.status)}>
                                {job.status}
                            </Badge>
                        </div>

                        <div className={styles.jobStats}>
                            <span className={styles.statItem}>
                                <Users size={14} />
                                {job.stats?.applications || 0}
                            </span>
                            <span className={styles.statItem}>
                                <CheckCircle size={14} />
                                {job.stats?.shortlisted || 0}
                            </span>
                            <span className={`${styles.statItem} ${isExpiringSoon ? styles.expiring : ""}`}>
                                <Clock size={14} />
                                {daysRemaining}d left
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

PublishedJobsWidget.propTypes = {
    jobs: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        location: PropTypes.string,
        department: PropTypes.string,
        status: PropTypes.string,
        expiryDate: PropTypes.string,
        stats: PropTypes.object
    })),
    onViewJob: PropTypes.func
};

PublishedJobsWidget.defaultProps = {
    jobs: [],
    onViewJob: () => { }
};

export default PublishedJobsWidget;
