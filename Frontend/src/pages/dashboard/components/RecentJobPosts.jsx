/**
 * @file RecentJobPosts.jsx
 * @description Recent job posts component for dashboard
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2025-12-19
 */

import { DollarSign, MapPin, Clock, Users, Briefcase } from "lucide-react";
import styles from "./RecentJobPosts.module.css";

/**
 * Get status badge class based on status
 * @param {string} status - Job status
 * @returns {string} CSS class name
 */
const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return styles.statusActive;
    case "pending":
      return styles.statusPending;
    case "closed":
      return styles.statusClosed;
    case "draft":
      return styles.statusDraft;
    default:
      return styles.statusDefault;
  }
};

/**
 * RecentJobPosts component
 * @param {Object} props - Component props
 * @param {Array} props.jobs - Array of job post objects
 * @returns {JSX.Element} The rendered job posts
 */
const RecentJobPosts = ({ jobs = [] }) => {
  if (jobs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Briefcase size={48} className={styles.emptyIcon} />
        <h3>No job posts yet</h3>
        <p>Create your first job post to get started</p>
        <button className={styles.createJobButton}>Create Job Post</button>
      </div>
    );
  }

  return (
    <div className={styles.recentJobPosts}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Job Posts</h2>
        <button className={styles.viewAllButton}>View All</button>
      </div>

      <div className={styles.jobsGrid}>
        {jobs.map((job) => (
          <div key={job.id} className={styles.jobCard}>
            <div className={styles.jobHeader}>
              <div className={styles.jobTitleSection}>
                <h3 className={styles.jobTitle}>{job.title}</h3>
                <span
                  className={`${styles.statusBadge} ${getStatusClass(
                    job.status
                  )}`}>
                  {job.status}
                </span>
              </div>

              <div className={styles.jobMeta}>
                <span className={styles.metaItem}>
                  <Clock size={14} />
                  Posted {job.postedDate}
                </span>

                <span className={styles.metaItem}>
                  <Users size={14} />
                  {job.applicants} applicants
                </span>
              </div>
            </div>

            <div className={styles.jobDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailItem}>
                  <DollarSign size={16} />
                  {job.budget}
                </span>

                <span className={styles.detailItem}>
                  <MapPin size={16} />
                  {job.location}
                </span>

                <span className={styles.detailItem}>
                  <Briefcase size={16} />
                  {job.category}
                </span>
              </div>
            </div>

            <div className={styles.jobDescription}>
              <p>{job.description}</p>
            </div>

            <div className={styles.jobActions}>
              <button className={styles.viewButton}>View Details</button>
              <button className={styles.editButton}>Edit Post</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentJobPosts;
