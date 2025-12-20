/**
 * @file RecentJobPosts.jsx
 * @description Component displaying recent job posts with proposals
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2025-12-20
 */

import { Calendar, Users, DollarSign } from "lucide-react";
import styles from "./RecentJobPosts.module.css";

/**
 * Job post item component
 * @param {Object} props - Component props
 * @param {string} props.title - Job title
 * @param {number} props.proposals - Number of proposals
 * @param {string} props.status - Job status
 * @param {string} props.date - Posted date
 * @param {string} props.budget - Job budget
 * @returns {JSX.Element} The rendered job post item
 */
const JobPostItem = ({ title, proposals, status, date, budget }) => {
  return (
    <div className={styles.jobItem}>
      <div className={styles.jobHeader}>
        <h4 className={styles.jobTitle}>{title}</h4>
        <span
          className={`${styles.statusBadge} ${styles[status.toLowerCase()]}`}>
          {status}
        </span>
      </div>

      <div className={styles.jobDetails}>
        <div className={styles.detailItem}>
          <Users className={styles.detailIcon} size={16} />
          <span className={styles.detailText}>{proposals} proposals</span>
        </div>

        <div className={styles.detailItem}>
          <Calendar className={styles.detailIcon} size={16} />
          <span className={styles.detailText}>{date}</span>
        </div>

        <div className={styles.detailItem}>
          <DollarSign className={styles.detailIcon} size={16} />
          <span className={styles.detailText}>{budget}</span>
        </div>
      </div>

      <div className={styles.jobActions}>
        <button className={styles.viewButton}>View Details</button>
        <button className={styles.reviewButton}>Review Proposals</button>
      </div>
    </div>
  );
};

/**
 * RecentJobPosts component showing latest job posts
 * @returns {JSX.Element} The rendered recent job posts section
 */
const RecentJobPosts = () => {
  const recentJobs = [
    {
      id: 1,
      title: "Senior React Developer",
      proposals: 23,
      status: "Active",
      date: "Posted 2 days ago",
      budget: "$5,000 - $8,000",
    },
    {
      id: 2,
      title: "UI/UX Designer",
      proposals: 18,
      status: "Active",
      date: "Posted 1 week ago",
      budget: "$3,000 - $5,000",
    },
    {
      id: 3,
      title: "Content Writer (Slight)",
      proposals: 31,
      status: "Review",
      date: "Posted 3 days ago",
      budget: "$1,000 - $2,000",
    },
  ];

  return (
    <div className={styles.recentJobPosts}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>
          Recent Job Posts
          <span className={styles.sectionSubtitle}>Your latest positions</span>
        </h3>
        <button className={styles.viewAllButton}>View All →</button>
      </div>

      <div className={styles.jobsList}>
        {recentJobs.map((job) => (
          <JobPostItem
            key={job.id}
            title={job.title}
            proposals={job.proposals}
            status={job.status}
            date={job.date}
            budget={job.budget}
          />
        ))}
      </div>
    </div>
  );
};

export default RecentJobPosts;
