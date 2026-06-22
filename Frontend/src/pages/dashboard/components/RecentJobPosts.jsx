/**
 * @file RecentJobPosts.jsx
 * @description Component for displaying recent job posts with design system compliance
 * @author Sherif Talaat
 * @version 3.0.0
 * @date 2025-12-19
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-12-20
 */

import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Users,
  CheckCircle,
} from "lucide-react";
import styles from "./RecentJobPosts.module.css";

/**
 * RecentJobPosts component
 * @param {Object} props
 * @param {Array} props.jobs - Array of job objects
 * @param {Function} props.onJobClick - Function to handle job click
 * @param {string} props.title - Optional custom title
 * @returns {JSX.Element} Rendered job posts list
 */
const RecentJobPosts = ({
  jobs = [],
  onJobClick,
  title = "Recent Job Posts",
}) => {
  const handleJobClick = (jobId) => {
    if (onJobClick) {
      onJobClick(jobId);
    }
  };

  // Get status configuration with design system colors
  const getStatusConfig = (status) => {
    const configs = {
      active: {
        label: "Active",
        color: "var(--color-primary)",
        bgColor: "var(--color-light-pink)",
        icon: CheckCircle,
      },
      draft: {
        label: "Draft",
        color: "var(--color-muted-foreground)",
        bgColor: "var(--color-muted)",
        icon: Briefcase,
      },
      pending: {
        label: "Pending",
        color: "var(--color-warning)",
        bgColor: "var(--color-warning-light)",
        icon: Clock,
      },
      review: {
        label: "In Review",
        color: "var(--color-accent)",
        bgColor: "var(--color-accent-light)",
        icon: Clock,
      },
      applied: {
        label: "Applied",
        color: "var(--color-primary)",
        bgColor: "var(--color-primary-light)",
        icon: CheckCircle,
      },
      saved: {
        label: "Saved",
        color: "var(--color-accent-pink)",
        bgColor: "var(--color-light-pink)",
        icon: Briefcase,
      },
    };

    return configs[status] || configs.active;
  };

  // Get priority badge with design system colors
  const getPriorityBadge = (priority) => {
    const configs = {
      high: {
        label: "High",
        color: "var(--color-destructive)",
        bgColor: "var(--color-destructive-light)",
      },
      medium: {
        label: "Medium",
        color: "var(--color-warning)",
        bgColor: "var(--color-warning-light)",
      },
      low: {
        label: "Low",
        color: "var(--color-info)",
        bgColor: "var(--color-info-light)",
      },
    };

    const config = configs[priority] || configs.medium;

    return (
      <span
        className={styles.priorityBadge}
        style={{
          color: config.color,
          backgroundColor: config.bgColor,
        }}>
        {config.label}
      </span>
    );
  };

  if (!jobs || jobs.length === 0) {
    return (
      <div className={styles.recentJobPosts}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.noJobs}>
          <Briefcase className={styles.noJobsIcon} />
          <p className={styles.noJobsText}>No job posts available</p>
          <p className={styles.noJobsSubtext}>
            Check back later for new opportunities
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.recentJobPosts}>
      <div className={styles.jobsList}>
        {jobs.map((job) => {
          const statusConfig = getStatusConfig(job.status);
          const Icon = job.icon || Briefcase;

          return (
            <div
              key={job.id}
              className={styles.jobCard}
              onClick={() => handleJobClick(job.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleJobClick(job.id);
                  e.preventDefault();
                }
              }}>
              <div className={styles.jobHeader}>
                <div className={styles.jobIconContainer}>
                  <Icon className={styles.jobIcon} />
                </div>
                <div className={styles.jobInfo}>
                  <h4 className={styles.jobTitle}>{job.title}</h4>
                  <div className={styles.jobMeta}>
                    <span className={styles.companyName}>{job.company}</span>
                    {job.location && (
                      <>
                        <span className={styles.metaSeparator}>•</span>
                        <span className={styles.jobLocation}>
                          <MapPin className={styles.metaIcon} size={14} />
                          {job.location}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className={styles.jobStatus}>
                  <span
                    className={styles.statusBadge}
                    style={{
                      color: statusConfig.color,
                      backgroundColor: statusConfig.bgColor,
                    }}>
                    <statusConfig.icon
                      className={styles.statusIcon}
                      size={12}
                    />
                    {statusConfig.label}
                  </span>
                  {job.priority && getPriorityBadge(job.priority)}
                </div>
              </div>

              <div className={styles.jobDetails}>
                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <DollarSign className={styles.detailIcon} size={16} />
                    <span className={styles.detailLabel}>Budget:</span>
                    <span className={styles.detailValue}>{job.budget}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <Users className={styles.detailIcon} size={16} />
                    <span className={styles.detailLabel}>Proposals:</span>
                    <span className={styles.detailValue}>{job.proposals}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <Clock className={styles.detailIcon} size={16} />
                    <span className={styles.detailLabel}>Posted:</span>
                    <span className={styles.detailValue}>{job.posted}</span>
                  </div>
                </div>

                {job.skills && job.skills.length > 0 && (
                  <div className={styles.skillsContainer}>
                    <div className={styles.skillsLabel}>Required Skills:</div>
                    <div className={styles.skillsList}>
                      {job.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className={styles.skillTag}>
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className={styles.moreSkills}>
                          +{job.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {job.duration && (
                  <div className={styles.durationBadge}>
                    <Clock className={styles.durationIcon} size={12} />
                    {job.duration}
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

export default RecentJobPosts;
