/**
 * @file DetailedApplications.jsx
 * @description Detailed applications list component with status tracking and actions
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2025-12-23
 *
 */

import PropTypes from "prop-types";
import {
  CheckCircle,
  Clock,
  MessageSquare,
  XCircle,
  Award,
  Eye,
  FileText,
  ChevronRight,
  Calendar,
  Building,
} from "lucide-react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import styles from "./DetailedApplications.module.css";

/**
 * DetailedApplications component for displaying full applications list with statuses
 * @param {Object} props - Component props
 * @param {Array} props.applications - Array of application objects
 * @param {Function} props.onViewApplication - Function to view application details
 * @param {Function} props.onWithdrawApplication - Function to withdraw application
 * @param {Object} props.stats - Application statistics
 * @returns {JSX.Element} Rendered detailed applications component
 */
const DetailedApplications = ({
  applications = [],
  onViewApplication,
  onWithdrawApplication,
  stats,
}) => {
  // Fallback sample data if no applications provided
  const appData =
    applications.length > 0
      ? applications
      : [
          {
            id: 1,
            jobTitle: "Senior Frontend Developer",
            company: "TechCorp Inc.",
            dateApplied: "2024-01-15",
            status: "under_review",
            stage: "Under Review",
            nextStep: "Technical Assessment",
            timeline: "Expected: 3-5 business days",
          },
          {
            id: 2,
            jobTitle: "UI/UX Designer",
            company: "Creative Studio",
            dateApplied: "2024-01-12",
            status: "interview",
            stage: "Interview Scheduled",
            nextStep: "Design Challenge Review",
            timeline: "Interview: Jan 20, 2024",
          },
          {
            id: 3,
            jobTitle: "React Native Developer",
            company: "MobileFirst",
            dateApplied: "2024-01-10",
            status: "offer",
            stage: "Offer Received",
            nextStep: "Offer Review",
            timeline: "Deadline: Jan 25, 2024",
          },
          {
            id: 4,
            jobTitle: "Full Stack Developer",
            company: "StartupXYZ",
            dateApplied: "2024-01-05",
            status: "rejected",
            stage: "Not Selected",
            nextStep: "Feedback Requested",
            timeline: "Application closed",
          },
        ];

  // Calculate statistics
  const applicationStats = stats || {
    total: appData.length,
    underReview: appData.filter((app) => app.status === "under_review").length,
    interview: appData.filter((app) => app.status === "interview").length,
    offers: appData.filter((app) => app.status === "offer").length,
    rejected: appData.filter((app) => app.status === "rejected").length,
  };

  // Status configuration
  const statusConfig = {
    under_review: {
      label: "Under Review",
      color: "warning",
      icon: Clock,
    },
    interview: {
      label: "Interview",
      color: "info",
      icon: MessageSquare,
    },
    offer: {
      label: "Offer",
      color: "success",
      icon: Award,
    },
    rejected: {
      label: "Rejected",
      color: "error",
      icon: XCircle,
    },
    accepted: {
      label: "Accepted",
      color: "success",
      icon: CheckCircle,
    },
  };

  const handleViewApplication = (applicationId) => {
    if (onViewApplication) {
      onViewApplication(applicationId);
    } else {
      console.log(`View application ${applicationId}`);
    }
  };

  const handleWithdrawApplication = (applicationId, e) => {
    e.stopPropagation();
    if (onWithdrawApplication) {
      onWithdrawApplication(applicationId);
    } else {
      console.log(`Withdraw application ${applicationId}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className={styles.detailedApplications} padding={true}>
      {/* Header with Statistics */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>Applications</h3>
          <Badge variant="primary" rounded={true}>
            {applicationStats.total} total
          </Badge>
        </div>

        <div className={styles.statsSummary}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Active</span>
            <span className={styles.statValue}>
              {applicationStats.underReview +
                applicationStats.interview +
                applicationStats.offers}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Interviews</span>
            <span className={styles.statValue}>
              {applicationStats.interview}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Offers</span>
            <span className={styles.statValue}>{applicationStats.offers}</span>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className={styles.applicationsTable}>
        <div className={styles.tableHeader}>
          <div className={styles.tableCell}>Job / Company</div>
          <div className={styles.tableCell}>Date Applied</div>
          <div className={styles.tableCell}>Status</div>
          <div className={styles.tableCell}>Next Step</div>
          <div className={styles.tableCell}>Actions</div>
        </div>

        <div className={styles.tableBody}>
          {appData.map((application) => {
            const status =
              statusConfig[application.status] || statusConfig.under_review;
            const StatusIcon = status.icon;

            return (
              <div
                key={application.id}
                className={styles.tableRow}
                onClick={() => handleViewApplication(application.id)}>
                <div className={styles.tableCell}>
                  <div className={styles.jobInfo}>
                    <h4 className={styles.jobTitle}>{application.jobTitle}</h4>
                    <div className={styles.companyInfo}>
                      <Building size={14} />
                      <span className={styles.companyName}>
                        {application.company}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.tableCell}>
                  <div className={styles.dateInfo}>
                    <Calendar size={14} />
                    <span className={styles.dateText}>
                      {formatDate(application.dateApplied)}
                    </span>
                  </div>
                </div>

                <div className={styles.tableCell}>
                  <Badge
                    variant={status.color}
                    icon={StatusIcon}
                    className={styles.statusBadge}>
                    {application.stage || status.label}
                  </Badge>
                  {application.timeline && (
                    <span className={styles.timeline}>
                      {application.timeline}
                    </span>
                  )}
                </div>

                <div className={styles.tableCell}>
                  <div className={styles.nextStep}>
                    <span className={styles.nextStepLabel}>Next:</span>
                    <span className={styles.nextStepText}>
                      {application.nextStep}
                    </span>
                  </div>
                </div>

                <div className={styles.tableCell}>
                  <div className={styles.actionButtons}>
                    <Button
                      variant="ghost"
                      size="small"
                      icon={Eye}
                      onClick={() => handleViewApplication(application.id)}
                      className={styles.actionButton}>
                      View
                    </Button>

                    {application.status !== "rejected" &&
                      application.status !== "accepted" && (
                        <Button
                          variant="ghost"
                          size="small"
                          icon={FileText}
                          onClick={(e) =>
                            handleWithdrawApplication(application.id, e)
                          }
                          className={styles.actionButton}>
                          Withdraw
                        </Button>
                      )}

                    <ChevronRight size={16} className={styles.chevronIcon} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {appData.length === 0 && (
        <div className={styles.emptyState}>
          <FileText size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No Applications Yet</h3>
          <p className={styles.emptyDescription}>
            Applications you submit will appear here with their current status
          </p>
          <Button variant="primary" icon={Eye}>
            Browse Jobs
          </Button>
        </div>
      )}
    </Card>
  );
};

DetailedApplications.propTypes = {
  /** Array of application objects */
  applications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      jobTitle: PropTypes.string.isRequired,
      company: PropTypes.string.isRequired,
      dateApplied: PropTypes.string.isRequired,
      status: PropTypes.oneOf([
        "under_review",
        "interview",
        "offer",
        "rejected",
        "accepted",
      ]),
      stage: PropTypes.string,
      nextStep: PropTypes.string,
      timeline: PropTypes.string,
    })
  ),
  /** Function to view application details */
  onViewApplication: PropTypes.func,
  /** Function to withdraw application */
  onWithdrawApplication: PropTypes.func,
  /** Application statistics */
  stats: PropTypes.shape({
    total: PropTypes.number,
    underReview: PropTypes.number,
    interview: PropTypes.number,
    offers: PropTypes.number,
    rejected: PropTypes.number,
  }),
};

export default DetailedApplications;
