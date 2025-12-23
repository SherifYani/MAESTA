/**
 * @file RecommendedJobs.jsx
 * @description Recommended jobs component for job seekers showing jobs based on profile
 * @version 1.0.0
 * @date 2025-12-23
 *
 * @requirements FR-701.3: قائمة الوظائف المقترحة
 */

import React from "react";
import PropTypes from "prop-types";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  Star,
  Clock,
  Target,
  Zap,
} from "lucide-react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import styles from "./RecommendedJobs.module.css";

/**
 * RecommendedJobs component for displaying job recommendations
 * @param {Object} props - Component props
 * @param {Array} props.jobs - Array of recommended job objects
 * @param {Function} props.onSaveJob - Function to save a job to favorites
 * @param {Function} props.onApplyJob - Function to apply for a job
 * @param {Function} props.onViewJob - Function to view job details
 * @param {number} props.limit - Maximum number of jobs to display (0 for all)
 * @returns {JSX.Element} Rendered recommended jobs component
 */
const RecommendedJobs = ({
  jobs = [],
  onSaveJob,
  onApplyJob,
  onViewJob,
  limit = 0,
}) => {
  // Apply limit if specified
  const displayedJobs = limit > 0 ? jobs.slice(0, limit) : jobs;

  // Fallback sample data if no jobs provided
  const recommendedJobs =
    displayedJobs.length > 0
      ? displayedJobs
      : [
          {
            id: 1,
            title: "Senior Frontend Developer",
            company: "TechCorp",
            location: "Remote",
            salary: "$120,000 - $150,000",
            type: "Full-time",
            experience: "5+ years",
            matchScore: 95,
            skills: ["React", "TypeScript", "Next.js"],
            postedDate: "2024-01-18",
            isNew: true,
            isFeatured: true,
            applicants: 42,
          },
          {
            id: 2,
            title: "UI/UX Designer",
            company: "CreativeStudio",
            location: "New York, NY",
            salary: "$90,000 - $110,000",
            type: "Full-time",
            experience: "3+ years",
            matchScore: 88,
            skills: ["Figma", "UI Design", "Prototyping"],
            postedDate: "2024-01-17",
            isNew: false,
            isFeatured: false,
            applicants: 28,
          },
          {
            id: 3,
            title: "React Native Developer",
            company: "MobileFirst",
            location: "San Francisco, CA",
            salary: "$110,000 - $130,000",
            type: "Contract",
            experience: "4+ years",
            matchScore: 82,
            skills: ["React Native", "iOS", "Android"],
            postedDate: "2024-01-16",
            isNew: true,
            isFeatured: true,
            applicants: 35,
          },
        ];

  const handleSaveJob = (jobId, e) => {
    e.stopPropagation();
    if (onSaveJob) {
      onSaveJob(jobId);
    } else {
      console.log(`Save job ${jobId}`);
    }
  };

  const handleApplyJob = (jobId, e) => {
    e.stopPropagation();
    if (onApplyJob) {
      onApplyJob(jobId);
    } else {
      console.log(`Apply to job ${jobId}`);
    }
  };

  const handleViewJob = (jobId) => {
    if (onViewJob) {
      onViewJob(jobId);
    } else {
      console.log(`View job ${jobId}`);
    }
  };

  if (recommendedJobs.length === 0) {
    return (
      <Card className={styles.recommendedJobs} padding={true}>
        <div className={styles.emptyState}>
          <Briefcase size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No Recommended Jobs</h3>
          <p className={styles.emptyDescription}>
            Complete your profile to get personalized job recommendations
          </p>
          <Button variant="primary" icon={Star}>
            Complete Profile
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={styles.recommendedJobs} padding={true}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>Recommended Jobs</h3>
          <Badge variant="primary" rounded={true}>
            {recommendedJobs.length} jobs
          </Badge>
        </div>
        {limit > 0 && recommendedJobs.length >= limit && (
          <Button variant="ghost" size="small">
            View All
          </Button>
        )}
      </div>

      <div className={styles.jobsGrid}>
        {recommendedJobs.map((job) => (
          <div
            key={job.id}
            className={`${styles.jobCard} ${
              job.isFeatured ? styles.featured : ""
            }`}
            onClick={() => handleViewJob(job.id)}>
            {job.isFeatured && (
              <div className={styles.featuredBadge}>
                <Zap size={12} />
                Featured
              </div>
            )}

            <div className={styles.jobHeader}>
              <div className={styles.jobInfo}>
                <div className={styles.jobTitleSection}>
                  <h4 className={styles.jobTitle}>{job.title}</h4>
                  {job.isNew && (
                    <Badge
                      variant="success"
                      rounded={true}
                      className={styles.newBadge}>
                      New
                    </Badge>
                  )}
                </div>
                <p className={styles.jobCompany}>{job.company}</p>
              </div>

              <button
                className={styles.saveButton}
                onClick={(e) => handleSaveJob(job.id, e)}
                aria-label={job.isSaved ? "Remove from saved" : "Save job"}>
                <Star
                  size={20}
                  className={`${styles.saveIcon} ${
                    job.isSaved ? styles.saved : ""
                  }`}
                  fill={job.isSaved ? "currentColor" : "none"}
                />
              </button>
            </div>

            <div className={styles.jobDetails}>
              <div className={styles.detailRow}>
                <div className={styles.detailItem}>
                  <MapPin size={16} className={styles.detailIcon} />
                  <span className={styles.detailText}>{job.location}</span>
                </div>
                <div className={styles.detailItem}>
                  <DollarSign size={16} className={styles.detailIcon} />
                  <span className={styles.detailText}>{job.salary}</span>
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailItem}>
                  <Briefcase size={16} className={styles.detailIcon} />
                  <span className={styles.detailText}>{job.type}</span>
                </div>
                <div className={styles.detailItem}>
                  <Users size={16} className={styles.detailIcon} />
                  <span className={styles.detailText}>
                    {job.applicants} applicants
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.matchSection}>
              <div className={styles.matchScore}>
                <Target size={16} />
                <span className={styles.matchLabel}>Match Score:</span>
                <span className={styles.matchValue}>{job.matchScore}%</span>
                <div className={styles.matchBar}>
                  <div
                    className={styles.matchFill}
                    style={{ width: `${job.matchScore}%` }}
                  />
                </div>
              </div>

              <div className={styles.jobSkills}>
                {job.skills.slice(0, 3).map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className={styles.skillBadge}>
                    {skill}
                  </Badge>
                ))}
                {job.skills.length > 3 && (
                  <Badge variant="outline" className={styles.moreSkills}>
                    +{job.skills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            <div className={styles.jobFooter}>
              <div className={styles.postedDate}>
                <Clock size={14} />
                <span>
                  Posted{" "}
                  {new Date(job.postedDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className={styles.actionButtons}>
                <Button
                  variant="outline"
                  size="small"
                  className={styles.viewButton}
                  onClick={() => handleViewJob(job.id)}>
                  View Details
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  className={styles.applyButton}
                  onClick={(e) => handleApplyJob(job.id, e)}>
                  Apply Now
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

RecommendedJobs.propTypes = {
  /** Array of recommended job objects */
  jobs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      company: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
      salary: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      experience: PropTypes.string,
      matchScore: PropTypes.number.isRequired,
      skills: PropTypes.arrayOf(PropTypes.string),
      postedDate: PropTypes.string.isRequired,
      isNew: PropTypes.bool,
      isFeatured: PropTypes.bool,
      isSaved: PropTypes.bool,
      applicants: PropTypes.number,
    })
  ),
  /** Function to save a job to favorites */
  onSaveJob: PropTypes.func,
  /** Function to apply for a job */
  onApplyJob: PropTypes.func,
  /** Function to view job details */
  onViewJob: PropTypes.func,
  /** Maximum number of jobs to display (0 for all) */
  limit: PropTypes.number,
};

RecommendedJobs.defaultProps = {
  limit: 0,
};

export default RecommendedJobs;
