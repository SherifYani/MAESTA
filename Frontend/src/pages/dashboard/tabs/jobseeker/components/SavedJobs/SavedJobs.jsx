/**
 * @file SavedJobs.jsx
 * @description Saved jobs component for job seekers showing favorited/bookmarked jobs
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2025-12-22
 *
 */

import React from "react";
import PropTypes from "prop-types";
import {
  Bookmark,
  MapPin,
  DollarSign,
  Calendar,
  Briefcase,
  Eye,
  BookmarkCheck,
} from "lucide-react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import styles from "./SavedJobs.module.css";

/**
 * SavedJobs component for displaying bookmarked jobs
 * @param {Object} props - Component props
 * @param {Array} props.jobs - Array of saved job objects
 * @param {Function} props.onRemoveJob - Function to remove job from saved list
 * @param {Function} props.onViewJob - Function to view job details
 * @returns {JSX.Element} Rendered saved jobs component
 */
const SavedJobs = ({ jobs = [], onRemoveJob, onViewJob }) => {
  // Fallback sample data if no jobs provided
  const savedJobs =
    jobs.length > 0
      ? jobs
      : [
          {
            id: 1,
            title: "Senior Frontend Developer",
            company: "TechCorp",
            location: "Remote",
            salary: "$120,000 - $150,000",
            dateSaved: "2024-01-15",
            jobType: "Full-time",
            status: "active",
            matchScore: 92,
          },
          {
            id: 2,
            title: "UI/UX Designer",
            company: "CreativeStudio",
            location: "New York, NY",
            salary: "$90,000 - $110,000",
            dateSaved: "2024-01-12",
            jobType: "Full-time",
            status: "active",
            matchScore: 85,
          },
          {
            id: 3,
            title: "React Native Developer",
            company: "MobileFirst",
            location: "San Francisco, CA",
            salary: "$110,000 - $130,000",
            dateSaved: "2024-01-10",
            jobType: "Contract",
            status: "expired",
            matchScore: 78,
          },
        ];

  const handleRemoveJob = (jobId, e) => {
    e.stopPropagation();
    if (onRemoveJob) {
      onRemoveJob(jobId);
    } else {
      console.log(`Remove job ${jobId}`);
    }
  };

  const handleViewJob = (jobId) => {
    if (onViewJob) {
      onViewJob(jobId);
    } else {
      console.log(`View job ${jobId}`);
    }
  };

  if (savedJobs.length === 0) {
    return (
      <Card className={styles.savedJobs} padding={true}>
        <div className={styles.emptyState}>
          <Bookmark size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No Saved Jobs</h3>
          <p className={styles.emptyDescription}>
            Jobs you bookmark will appear here for easy access
          </p>
          <Button variant="primary" icon={Briefcase}>
            Browse Jobs
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={styles.savedJobs} padding={true}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>Saved Jobs</h3>
          <Badge variant="primary" rounded={true}>
            {savedJobs.length} jobs
          </Badge>
        </div>
        <Button variant="ghost" size="small">
          View All
        </Button>
      </div>

      <div className={styles.jobsList}>
        {savedJobs.map((job) => (
          <div
            key={job.id}
            className={`${styles.jobItem} ${
              job.status === "expired" ? styles.expired : ""
            }`}
            onClick={() => handleViewJob(job.id)}>
            <div className={styles.jobHeader}>
              <div className={styles.jobInfo}>
                <h4 className={styles.jobTitle}>{job.title}</h4>
                <p className={styles.jobCompany}>{job.company}</p>
              </div>

              <div className={styles.jobActions}>
                <button
                  className={styles.bookmarkButton}
                  onClick={(e) => handleRemoveJob(job.id, e)}
                  aria-label="Remove from saved">
                  {job.status === "expired" ? (
                    <BookmarkCheck size={20} className={styles.bookmarkIcon} />
                  ) : (
                    <Bookmark size={20} className={styles.bookmarkIcon} />
                  )}
                </button>
              </div>
            </div>

            <div className={styles.jobDetails}>
              <div className={styles.detailItem}>
                <MapPin size={16} className={styles.detailIcon} />
                <span className={styles.detailText}>{job.location}</span>
              </div>
              <div className={styles.detailItem}>
                <DollarSign size={16} className={styles.detailIcon} />
                <span className={styles.detailText}>{job.salary}</span>
              </div>
              <div className={styles.detailItem}>
                <Calendar size={16} className={styles.detailIcon} />
                <span className={styles.detailText}>
                  Saved{" "}
                  {new Date(job.dateSaved).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className={styles.jobFooter}>
              <Badge
                variant={job.jobType === "Full-time" ? "primary" : "secondary"}
                className={styles.typeBadge}>
                {job.jobType}
              </Badge>

              <div className={styles.matchScore}>
                <span className={styles.matchLabel}>Match:</span>
                <span className={styles.matchValue}>{job.matchScore}%</span>
                <div className={styles.matchBar}>
                  <div
                    className={styles.matchFill}
                    style={{ width: `${job.matchScore}%` }}
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="small"
                icon={Eye}
                className={styles.viewButton}>
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

SavedJobs.propTypes = {
  /** Array of saved job objects */
  jobs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      company: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
      salary: PropTypes.string.isRequired,
      dateSaved: PropTypes.string.isRequired,
      jobType: PropTypes.oneOf([
        "Full-time",
        "Part-time",
        "Contract",
        "Internship",
      ]),
      status: PropTypes.oneOf(["active", "expired", "filled"]),
      matchScore: PropTypes.number,
    })
  ),
  /** Function to remove job from saved list */
  onRemoveJob: PropTypes.func,
  /** Function to view job details */
  onViewJob: PropTypes.func,
};

export default SavedJobs;
