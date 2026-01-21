/**
 * @file RecommendedJobs.jsx
 * @description Displays a list of recommended jobs for job seekers with filtering and application options.
 * Shows jobs based on user's skills and profile with match percentages.
 * @author Sherif Talaat
 * @version 1.0.1
 * @date 2026-1-19
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-1-20
 * 
 * @changes:-
 * - add icon to empty state instead of text
 */

import React, { useState, useMemo } from "react";
import {
  MapPin,
  Clock,
  TrendingUp,
  Briefcase,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Filter,
  X,
  ChevronDown,
  NotepadText
} from "lucide-react";
import Button from "../../../../components/ui/Button";
import Badge from "../../../../components/ui/Badge";
import styles from "./RecommendedJobs.module.css";

/**
 * RecommendedJobs Component
 * @description Displays personalized job recommendations with filtering, sorting, and application functionality.
 * @param {Object} props - Component props
 * @param {Array} props.jobs - Array of job objects to display
 * @param {function} props.onJobSave - Function called when a job is saved/unsaved
 * @param {function} props.onJobApply - Function called when a job is applied to
 * @returns {JSX.Element} The rendered recommended jobs list with filters
 */
const RecommendedJobs = ({
  jobs = [],
  onJobSave = () => { },
  onJobApply = () => { },
}) => {
  const [filters, setFilters] = useState({
    jobType: "all",
    location: "all",
    matchScore: "all",
    showSavedOnly: false,
  });
  const [sortBy, setSortBy] = useState("match");
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  /**
   * Apply filters to jobs list
   * @param {Array} jobList - Array of job objects
   * @returns {Array} Filtered and sorted jobs
   */
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // Apply filters
    if (filters.jobType !== "all") {
      result = result.filter((job) => job.type === filters.jobType);
    }

    if (filters.location !== "all") {
      result = result.filter((job) => job.location === filters.location);
    }

    if (filters.matchScore !== "all") {
      const minScore = parseInt(filters.matchScore);
      result = result.filter((job) => job.matchScore >= minScore);
    }

    if (filters.showSavedOnly) {
      result = result.filter((job) => job.isSaved);
    }

    // Apply sorting
    switch (sortBy) {
      case "match":
        result.sort((a, b) => b.matchScore - a.matchScore);
        break;
      case "date":
        result.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
        break;
      case "salary":
        // Extract numeric salary values for sorting
        result.sort((a, b) => {
          const salaryA = extractSalaryValue(a.salary);
          const salaryB = extractSalaryValue(b.salary);
          return salaryB - salaryA;
        });
        break;
      default:
        break;
    }

    return result;
  }, [jobs, filters, sortBy]);

  /**
   * Extract numeric value from salary string for sorting
   * @param {string} salary - Salary string (e.g., "$80k - $110k")
   * @returns {number} Average salary value
   */
  const extractSalaryValue = (salary) => {
    if (!salary) return 0;
    const numbers = salary.match(/\d+/g);
    if (!numbers) return 0;

    const values = numbers.map((num) => {
      const multiplier = salary.includes("k") ? 1000 : 1;
      return parseInt(num) * multiplier;
    });

    return values.length > 0 ? Math.max(...values) : 0;
  };

  /**
   * Get unique values for filter dropdowns
   */
  const uniqueJobTypes = useMemo(() => {
    const types = [...new Set(jobs.map((job) => job.type).filter(Boolean))];
    return ["all", ...types];
  }, [jobs]);

  const uniqueLocations = useMemo(() => {
    const locations = [
      ...new Set(jobs.map((job) => job.location).filter(Boolean)),
    ];
    return ["all", ...locations];
  }, [jobs]);

  /**
   * Handle job save/unsave
   * @param {Object} job - Job object
   * @param {Event} e - Click event
   */
  const handleSaveJob = (job, e) => {
    e.stopPropagation();
    onJobSave(job.id, !job.isSaved);
  };

  /**
   * Handle job application
   * @param {Object} job - Job object
   * @param {Event} e - Click event
   */
  const handleApplyJob = (job, e) => {
    e.stopPropagation();
    onJobApply(job.id);
  };

  /**
   * Toggle job details expansion
   * @param {string} jobId - Job ID
   */
  const toggleJobDetails = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setFilters({
      jobType: "all",
      location: "all",
      matchScore: "all",
      showSavedOnly: false,
    });
  };

  /**
   * Render match score badge with appropriate color
   * @param {number} score - Match score percentage
   * @returns {JSX.Element} Styled badge component
   */
  const renderMatchBadge = (score) => {
    let variant = "default";
    if (score >= 90) variant = "success";
    else if (score >= 70) variant = "primary";
    else if (score >= 50) variant = "warning";

    return (
      <Badge variant={variant} className={styles.matchBadge}>
        <TrendingUp size={12} />
        <span>{score}% Match</span>
      </Badge>
    );
  };

  /**
   * Render job type badge
   * @param {string} type - Job type
   * @returns {JSX.Element} Styled badge
   */
  const renderJobTypeBadge = (type) => {
    const typeMap = {
      "Full-time": { variant: "primary", label: "Full Time" },
      "Part-time": { variant: "secondary", label: "Part Time" },
      Contract: { variant: "info", label: "Contract" },
      Internship: { variant: "success", label: "Internship" },
      Remote: { variant: "warning", label: "Remote" },
    };

    const config = typeMap[type] || { variant: "default", label: type };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // If no jobs available
  if (jobs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}><NotepadText size={60} /></div>
        <h3>No Job Recommendations</h3>
        <p>Complete your profile to get personalized job recommendations</p>
        <Button variant="primary">Complete Profile</Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Recommended Jobs</h2>
          <p className={styles.subtitle}>
            {filteredJobs.length} jobs match your profile
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            className={`${styles.filterToggle} ${showFilters ? styles.active : ""
              }`}
            onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} />
            Filter{" "}
            {Object.values(filters).filter((f) => f !== "all" && f !== false)
              .length > 0 && (
                <span className={styles.filterCount}>
                  {
                    Object.values(filters).filter(
                      (f) => f !== "all" && f !== false
                    ).length
                  }
                </span>
              )}
          </button>

          <div className={styles.sortDropdown}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}>
              <option value="match">Sort by: Best Match</option>
              <option value="date">Sort by: Newest</option>
              <option value="salary">Sort by: Salary</option>
            </select>
            <ChevronDown size={16} className={styles.sortIcon} />
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Job Type</label>
            <div className={styles.filterOptions}>
              {uniqueJobTypes.map((type) => (
                <button
                  key={type}
                  className={`${styles.filterOption} ${filters.jobType === type ? styles.active : ""
                    }`}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, jobType: type }))
                  }>
                  {type === "all" ? "All Types" : type}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Location</label>
            <div className={styles.filterOptions}>
              {uniqueLocations.map((location) => (
                <button
                  key={location}
                  className={`${styles.filterOption} ${filters.location === location ? styles.active : ""
                    }`}
                  onClick={() => setFilters((prev) => ({ ...prev, location }))}>
                  {location === "all" ? "All Locations" : location}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Match Score</label>
            <div className={styles.filterOptions}>
              {["all", "90", "70", "50"].map((score) => (
                <button
                  key={score}
                  className={`${styles.filterOption} ${filters.matchScore === score ? styles.active : ""
                    }`}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, matchScore: score }))
                  }>
                  {score === "all" ? "Any Match" : `≥ ${score}%`}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterCheckbox}>
              <input
                type="checkbox"
                checked={filters.showSavedOnly}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    showSavedOnly: e.target.checked,
                  }))
                }
              />
              <span>Show Saved Only</span>
            </label>
          </div>

          <div className={styles.filterActions}>
            <button className={styles.clearFilters} onClick={clearFilters}>
              <X size={14} />
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className={styles.jobsList}>
        {filteredJobs.map((job) => (
          <article
            key={job.id}
            className={`${styles.jobCard} ${expandedJobId === job.id ? styles.expanded : ""
              }`}
            onClick={() => toggleJobDetails(job.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleJobDetails(job.id);
              }
            }}>
            <div className={styles.jobHeader}>
              <div className={styles.jobInfo}>
                <div className={styles.jobTitleRow}>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  {job.isUrgent && (
                    <Badge variant="danger" className={styles.urgentBadge}>
                      Urgent Hiring
                    </Badge>
                  )}
                </div>
                <p className={styles.company}>{job.company}</p>
              </div>

              <div className={styles.jobActions}>
                <button
                  className={styles.saveButton}
                  onClick={(e) => handleSaveJob(job, e)}
                  aria-label={
                    job.isSaved ? "Remove from saved jobs" : "Save job"
                  }>
                  {job.isSaved ? (
                    <BookmarkCheck size={20} />
                  ) : (
                    <Bookmark size={20} />
                  )}
                </button>
                {renderMatchBadge(job.matchScore)}
              </div>
            </div>

            <div className={styles.jobDetails}>
              <div className={styles.detailRow}>
                <div className={styles.detailItem}>
                  <MapPin size={16} />
                  <span>{job.location}</span>
                </div>
                <div className={styles.detailItem}>
                  <Clock size={16} />
                  <span>Posted {job.postedDate}</span>
                </div>
                <div className={styles.detailItem}>
                  <Briefcase size={16} />
                  <span>{job.duration}</span>
                </div>
              </div>

              {job.salary && (
                <div className={styles.salary}>
                  <span className={styles.salaryLabel}>Salary:</span>
                  <span className={styles.salaryValue}>{job.salary}</span>
                </div>
              )}
            </div>

            {/* Skills Tags */}
            <div className={styles.skillsSection}>
              <div className={styles.skills}>
                {job.skills?.slice(0, 5).map((skill, index) => (
                  <span key={index} className={styles.skillTag}>
                    {skill}
                  </span>
                ))}
                {job.skills?.length > 5 && (
                  <span className={styles.moreSkills}>
                    +{job.skills.length - 5} more
                  </span>
                )}
              </div>
              {renderJobTypeBadge(job.type)}
            </div>

            {/* Expandable Content */}
            {expandedJobId === job.id && (
              <div className={styles.expandedContent}>
                <div className={styles.jobDescription}>
                  <h4>Job Description</h4>
                  <p>{job.description || "No description available."}</p>
                </div>

                <div className={styles.requirements}>
                  <h4>Requirements</h4>
                  <ul>
                    {job.requirements?.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    )) || <li>No specific requirements listed.</li>}
                  </ul>
                </div>

                <div className={styles.expandedActions}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleSaveJob(job, e)}>
                    {job.isSaved ? "Remove from Saved" : "Save Job"}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => handleApplyJob(job, e)}>
                    Apply Now <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* Collapsed Actions */}
            {expandedJobId !== job.id && (
              <div className={styles.collapsedActions}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleSaveJob(job, e)}>
                  {job.isSaved ? "Saved" : "Save"}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => handleApplyJob(job, e)}>
                  Apply
                </Button>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Footer */}
      {filteredJobs.length > 0 && (
        <div className={styles.footer}>
          <p className={styles.showingText}>
            Showing {filteredJobs.length} of {jobs.length} recommendations
          </p>
          <button className={styles.viewAllButton}>
            View All Jobs <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default RecommendedJobs;
