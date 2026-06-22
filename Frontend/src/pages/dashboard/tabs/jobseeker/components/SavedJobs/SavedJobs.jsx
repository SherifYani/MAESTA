/**
 * @file SavedJobs.jsx
 * @description Displays saved jobs with ability to apply, remove, and track application status
 * Follows BEM methodology and uses global CSS variables
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-1-20
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-1-20
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  BookmarkCheck,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Trash2,
  Eye,
  Send,
  Filter,
  X,
} from "lucide-react";
import Button from "../../../../components/ui/Button";
import Badge from "../../../../components/ui/Badge";
import { Pagination } from "../../../../../../components/common";
import styles from "./SavedJobs.module.css";

/**
 * SavedJobs Component
 * @description Displays saved/favorite jobs with filtering and management options
 * @param {Object} props - Component props
 * @param {Array} props.jobs - Array of saved job objects
 * @param {function} props.onRemoveJob - Callback when a job is removed
 * @param {function} props.onViewJob - Callback when viewing job details
 * @param {function} props.onApplyJob - Callback when applying to a job
 * @returns {JSX.Element} The rendered saved jobs list
 */
const SavedJobs = ({
  jobs = [],
  onRemoveJob = () => { },
  onViewJob = () => { },
  onApplyJob = () => { }
}) => {
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    hasApplied: "all"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  /**
   * Apply filters to jobs list
   * @param {Array} jobList - Array of job objects
   * @returns {Array} Filtered jobs
   */
  const filteredJobs = jobs.filter(job => {
    // Status filter
    if (filters.status !== "all" && job.status !== filters.status) {
      return false;
    }

    // Type filter
    if (filters.type !== "all" && job.type !== filters.type) {
      return false;
    }

    // Application status filter
    if (filters.hasApplied !== "all") {
      const hasApplied = job.hasApplied || false;
      const wantsApplied = filters.hasApplied === "applied";
      if (wantsApplied !== hasApplied) {
        return false;
      }
    }

    return true;
  });

  /**
   * Get unique values for filter dropdowns
   */
  const uniqueTypes = [...new Set(jobs.map(job => job.type).filter(Boolean))];
  const uniqueStatuses = [...new Set(jobs.map(job => job.status).filter(Boolean))];

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  /**
   * Handle job removal
   * @param {string} jobId - Job ID
   * @param {Event} e - Click event
   */
  const handleRemove = (jobId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this job from saved?")) {
      onRemoveJob(jobId);
    }
  };

  /**
   * Handle job application
   * @param {Object} job - Job object
   * @param {Event} e - Click event
   */
  const handleApply = (job, e) => {
    e.stopPropagation();
    onApplyJob(job.jobId || job.id);
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
      status: "all",
      type: "all",
      hasApplied: "all"
    });
  };

  /**
   * Render status badge with appropriate color
   * @param {string} status - Job status
   * @returns {JSX.Element} Badge component
   */
  const renderStatusBadge = (status) => {
    const statusMap = {
      "active": { variant: "success", label: "Active" },
      "expired": { variant: "danger", label: "Expired" },
      "closed": { variant: "secondary", label: "Closed" },
      "draft": { variant: "warning", label: "Draft" }
    };

    const config = statusMap[status] || { variant: "default", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  /**
   * Render application status badge
   * @param {boolean} hasApplied - Whether job has been applied to
   * @returns {JSX.Element} Badge component
   */
  const renderApplicationBadge = (hasApplied) => {
    return hasApplied ? (
      <Badge variant="success" className={styles.appliedBadge}>
        <BookmarkCheck size={12} /> Applied
      </Badge>
    ) : (
      <Badge variant="outline" className={styles.notAppliedBadge}>
        Not Applied
      </Badge>
    );
  };

  /**
   * Render match score indicator
   * @param {number} score - Match score percentage
   * @returns {JSX.Element} Match score display
   */
  const renderMatchScore = (score) => {
    if (!score) return null;
    let colorClass = styles.matchLow;
    if (score >= 80) colorClass = styles.matchHigh;
    else if (score >= 60) colorClass = styles.matchMedium;

    return (
      <div className={styles.matchScore}>
        <div className={styles.matchLabel}>Match</div>
        <div className={`${styles.matchValue} ${colorClass}`}>
          {score}%
        </div>
      </div>
    );
  };

  // Pagination
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pagedJobs = filteredJobs.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const winSize = Math.min(5, totalPages);
  let startPageNum;
  if (totalPages <= 5) startPageNum = 1;
  else if (currentPage <= 3) startPageNum = 1;
  else if (currentPage >= totalPages - 2) startPageNum = totalPages - 4;
  else startPageNum = currentPage - 2;


  // If no saved jobs
  if (jobs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <Bookmark size={48} />
        </div>
        <h3>No Saved Jobs</h3>
        <p>Save jobs you're interested in to track them here</p>
        <Button variant="primary" onClick={() => navigate('/jobs')}>
          <Briefcase size={16} /> Browse Jobs
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h2 className={styles.title}>Saved Jobs</h2>
          <p className={styles.subtitle}>
            {filteredJobs.length} of {jobs.length} saved jobs
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filter
            {Object.values(filters).filter(f => f !== "all").length > 0 && (
              <span className={styles.filterCount}>
                {Object.values(filters).filter(f => f !== "all").length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Job Type</label>
            <div className={styles.filterOptions}>
              <button
                className={`${styles.filterOption} ${filters.type === "all" ? styles.active : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, type: "all" }))}
              >
                All Types
              </button>
              {uniqueTypes.map(type => (
                <button
                  key={type}
                  className={`${styles.filterOption} ${filters.type === type ? styles.active : ''}`}
                  onClick={() => setFilters(prev => ({ ...prev, type }))}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Status</label>
            <div className={styles.filterOptions}>
              <button
                className={`${styles.filterOption} ${filters.status === "all" ? styles.active : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, status: "all" }))}
              >
                All Statuses
              </button>
              {uniqueStatuses.map(status => (
                <button
                  key={status}
                  className={`${styles.filterOption} ${filters.status === status ? styles.active : ''}`}
                  onClick={() => setFilters(prev => ({ ...prev, status }))}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Application Status</label>
            <div className={styles.filterOptions}>
              <button
                className={`${styles.filterOption} ${filters.hasApplied === "all" ? styles.active : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, hasApplied: "all" }))}
              >
                All Jobs
              </button>
              <button
                className={`${styles.filterOption} ${filters.hasApplied === "applied" ? styles.active : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, hasApplied: "applied" }))}
              >
                Applied
              </button>
              <button
                className={`${styles.filterOption} ${filters.hasApplied === "not-applied" ? styles.active : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, hasApplied: "not-applied" }))}
              >
                Not Applied
              </button>
            </div>
          </div>

          <div className={styles.filterActions}>
            <button className={styles.clearButton} onClick={clearFilters}>
              <X size={14} />
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className={styles.jobsList}>
        {pagedJobs.map(job => {
          const jobId = job.id || job.jobId;
          return (
          <article
            key={jobId}
            className={`${styles.jobCard} ${expandedJobId === jobId ? styles.expanded : ''}`}
            onClick={() => toggleJobDetails(jobId)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleJobDetails(jobId);
              }
            }}
          >
            <div className={styles.jobHeader}>
              <div className={styles.jobMainInfo}>
                <div className={styles.jobTitleRow}>
                  <h3 className={styles.jobTitle}>{job.jobTitle || job.title}</h3>
                  {job.isUrgent && (
                    <Badge variant="danger" className={styles.urgentBadge}>
                      Urgent
                    </Badge>
                  )}
                </div>
                <p className={styles.company}>{job.company || job.companyName || "Unknown Company"}</p>
              </div>

              <div className={styles.jobActions}>
                {renderApplicationBadge(job.hasApplied)}
                {renderStatusBadge(job.status)}
                {job.matchScore && renderMatchScore(job.matchScore)}
              </div>
            </div>

            <div className={styles.jobDetails}>
              <div className={styles.detailsRow}>
                <div className={styles.detailItem}>
                  <MapPin size={14} />
                  <span>{job.location}</span>
                </div>
                <div className={styles.detailItem}>
                  <DollarSign size={14} />
                  <span>{job.salary || "Salary not specified"}</span>
                </div>
                <div className={styles.detailItem}>
                  <Calendar size={14} />
                  <span>Saved {job.savedDate}</span>
                </div>
                <div className={styles.detailItem}>
                  <Briefcase size={14} />
                  <span>{job.type || "Full-time"}</span>
                </div>
              </div>
            </div>

            {/* Expandable Content */}
            {expandedJobId === jobId && (
              <div className={styles.expandedContent}>
                <div className={styles.jobMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Job ID:</span>
                    <span className={styles.metaValue}>{job.jobId || job.id}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Saved On:</span>
                    <span className={styles.metaValue}>{job.savedDate}</span>
                  </div>
                  {job.hasApplied && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Applied:</span>
                      <span className={styles.metaValue}>Yes</span>
                    </div>
                  )}
                </div>

                <div className={styles.expandedActions}>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onViewJob(jobId, e); }}
                  >
                    <Eye size={16} /> View Details
                  </Button>

                  {!job.hasApplied && (
                    <Button
                      variant="primary"
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handleApply(job, e); }}
                    >
                      <Send size={16} /> Apply Now
                    </Button>
                  )}

                  <Button
                    variant="destructive"
                    size="small"
                    onClick={(e) => { e.stopPropagation(); handleRemove(jobId, e); }}
                  >
                    <Trash2 size={16} /> Remove
                  </Button>
                </div>
              </div>
            )}

            {/* Collapsed Actions */}
            {expandedJobId !== jobId && (
              <div className={styles.collapsedActions}>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={(e) => { e.stopPropagation(); onViewJob(jobId, e); }}
                >
                  <Eye size={14} />
                </Button>

                {!job.hasApplied && (
                  <Button
                    variant="primary"
                    size="small"
                    onClick={(e) => { e.stopPropagation(); handleApply(job, e); }}
                  >
                    <Send size={14} />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="small"
                  onClick={(e) => { e.stopPropagation(); handleRemove(jobId, e); }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            )}
          </article>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          pageSize={ITEMS_PER_PAGE}
          showTotal={true}
          totalItems={filteredJobs.length}
        />
      )}
    </div>
  );
};

export default SavedJobs;
