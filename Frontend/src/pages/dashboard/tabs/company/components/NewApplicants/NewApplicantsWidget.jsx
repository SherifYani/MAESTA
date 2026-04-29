/**
 * @file NewApplicantsWidget.jsx
 * @description Lightweight new applicants widget for company dashboard overview
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-01-28
 */

import { UserCheck, Mail, Calendar, Target } from "lucide-react";
import Badge from "../../../../components/ui/Badge";
import PropTypes from "prop-types";
import styles from "./NewApplicantsWidget.module.css";

/**
 * New Applicants Widget Component
 * @param {Object} props - Component props
 * @param {Array} props.applicants - Array of applicant objects (limited to recent)
 * @param {Function} props.onViewApplicant - Callback  for viewing applicant details
 * @returns {JSX.Element} Widget component
 */
const NewApplicantsWidget = ({ applicants, onViewApplicant }) => {
    const recentApplicants = applicants?.slice(0, 3) || []; // Show max 5 applicants

    const getStatusConfig = (status) => {
        switch (status) {
            case "new":
                return { variant: "info", label: "New" };
            case "reviewed":
                return { variant: "warning", label: "Reviewed" };
            case "shortlisted":
                return { variant: "success", label: "Shortlisted" };
            case "interviewed":
                return { variant: "primary", label: "Interviewed" };
            case "rejected":
                return { variant: "error", label: "Rejected" };
            default:
                return { variant: "default", label: "Unknown" };
        }
    };

    const getMatchScoreVariant = (score) => {
        if (score >= 90) return "success";
        if (score >= 75) return "warning";
        return "error";
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        });
    };

    if (recentApplicants.length === 0) {
        return (
            <div className={styles.emptyState}>
                <UserCheck size={32} />
                <p>No new applicants</p>
            </div>
        );
    }

    return (
        <div className={styles.applicantsWidget}>
            {recentApplicants.map(applicant => {
                const statusConfig = getStatusConfig(applicant.status);

                return (
                    <div
                        key={applicant.id}
                        className={styles.applicantItem}
                        onClick={() => onViewApplicant && onViewApplicant(applicant.id)}
                    >
                        <div className={styles.applicantHeader}>
                            <div className={styles.applicantAvatar}>
                                {applicant.applicantName.charAt(0)}
                            </div>
                            <div className={styles.applicantInfo}>
                                <h4 className={styles.applicantName}>
                                    {applicant.applicantName}
                                </h4>
                                <p className={styles.applicantJob}>
                                    {applicant.jobTitle}
                                </p>
                            </div>
                            <Badge variant={getMatchScoreVariant(applicant.matchScore)}>
                                {applicant.matchScore}%
                            </Badge>
                        </div>

                        <div className={styles.applicantMeta}>
                            <span className={styles.metaItem}>
                                <Mail size={12} />
                                {applicant.applicantEmail}
                            </span>
                            <span className={styles.metaItem}>
                                <Calendar size={12} />
                                {formatDate(applicant.appliedDate)}
                            </span>
                        </div>

                        <div className={styles.applicantFooter}>
                            <Badge variant={statusConfig.variant}>
                                {statusConfig.label}
                            </Badge>
                            {applicant.status === "new" && (
                                <span className={styles.newIndicator}>
                                    <span className={styles.newDot}></span>
                                    New
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

NewApplicantsWidget.propTypes = {
    applicants: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        applicantName: PropTypes.string.isRequired,
        applicantEmail: PropTypes.string,
        jobTitle: PropTypes.string,
        status: PropTypes.string,
        matchScore: PropTypes.number,
        appliedDate: PropTypes.string
    })),
    onViewApplicant: PropTypes.func
};

NewApplicantsWidget.defaultProps = {
    applicants: [],
    onViewApplicant: () => { }
};

export default NewApplicantsWidget;
