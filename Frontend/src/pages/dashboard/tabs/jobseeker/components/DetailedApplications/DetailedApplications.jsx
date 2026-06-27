/**
 * @file DetailedApplications.jsx
 * @description Displays job applications with detailed status tracking and filtering
 * Follows BEM methodology and uses global CSS variables
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-1-20
 * 
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-16
 */

import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Eye,
  Trash2,
  Filter,
  MapPin,
  DollarSign,
  BarChart
} from "lucide-react";
import Button from "../../../../components/ui/Button";
import Badge from "../../../../components/ui/Badge";
import GeneralSelect from "../../../../../../components/common/GeneralSelect";
import { Pagination } from "../../../../../../components/common";
import styles from "./DetailedApplications.module.css";

/**
 * DetailedApplications Component
 * @description Displays job applications with status tracking and management
 * @param {Object} props - Component props
 * @param {Array} props.applications - Array of application objects
 * @param {Object} props.stats - Application statistics
 * @param {function} props.onViewApplication - Callback when viewing application
 * @param {function} props.onWithdrawApplication - Callback when withdrawing application
 * @param {function} props.onUpdateStatus - Callback when updating application status
 * @returns {JSX.Element} The rendered applications list
 */
const DetailedApplications = ({
  applications = [],
  stats = {},
  onViewApplication = () => { },
  onWithdrawApplication = () => { },
  onUpdateStatus = () => { }
}) => {
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
    matchScore: "all"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  /**
   * Apply filters and sorting to applications
   */
  const filteredApplications = useMemo(() => {
    let filtered = [...applications];

    // Apply filters
    if (filters.status !== "all") {
      filtered = filtered.filter(app =>
        app.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.dateRange !== "all") {
      const now = new Date();
      const cutoff = new Date();

      switch (filters.dateRange) {
        case "week":
          cutoff.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoff.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          cutoff.setMonth(now.getMonth() - 3);
          break;
        default:
          break;
      }

      filtered = filtered.filter(app => {
        const appDate = new Date(app.appliedDate || app.date);
        return appDate >= cutoff;
      });
    }

    if (filters.matchScore !== "all") {
      const minScore = parseInt(filters.matchScore);
      filtered = filtered.filter(app => app.matchScore >= minScore);
    }

    // Apply sorting
    switch (sortBy) {
      case "date":
        filtered.sort((a, b) =>
          new Date(b.appliedDate || b.date) - new Date(a.appliedDate || a.date)
        );
        break;
      case "match":
        filtered.sort((a, b) => b.matchScore - a.matchScore);
        break;
      case "company":
        filtered.sort((a, b) => a.company.localeCompare(b.company));
        break;
      case "status":
        const statusOrder = {
          "offer": 1,
          "interview": 2,
          "review": 3,
          "applied": 4,
          "rejected": 5,
          "withdrawn": 6
        };
        filtered.sort((a, b) =>
          (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99)
        );
        break;
      default:
        break;
    }

    return filtered;
  }, [applications, filters, sortBy]);

  // Reset to page 1 whenever filters or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  /**
   * Get status icon and color
   * @param {string} status - Application status
   * @returns {Object} Icon component and color
   */
  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase() || "";

    switch (statusLower) {
      case "offer":
      case "accepted":
        return {
          icon: CheckCircle,
          color: "var(--color-success)",
          bgColor: "rgba(34, 197, 94, 0.1)",
          label: "Offer"
        };
      case "interview":
      case "scheduled":
        return {
          icon: Calendar,
          color: "var(--color-accent)",
          bgColor: "rgba(168, 85, 247, 0.1)",
          label: "Interview"
        };
      case "review":
      case "applied":
      case "pending":
        return {
          icon: Clock,
          color: "var(--color-warning)",
          bgColor: "rgba(245, 158, 11, 0.1)",
          label: "Under Review"
        };
      case "rejected":
      case "not selected":
        return {
          icon: XCircle,
          color: "var(--color-danger)",
          bgColor: "rgba(239, 68, 68, 0.1)",
          label: "Rejected"
        };
      case "withdrawn":
        return {
          icon: AlertCircle,
          color: "var(--color-secondary)",
          bgColor: "rgba(156, 163, 175, 0.1)",
          label: "Withdrawn"
        };
      default:
        return {
          icon: FileText,
          color: "var(--color-info)",
          bgColor: "rgba(59, 130, 246, 0.1)",
          label: status || "Applied"
        };
    }
  };

  /**
   * Render status badge
   * @param {string} status - Application status
   * @param {string} stage - Application stage
   * @returns {JSX.Element} Status badge
   */
  const renderStatusBadge = (status, stage) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <Badge
        variant="custom"
        style={{
          background: config.bgColor,
          color: config.color,
          borderColor: config.color
        }}
        className={styles.statusBadge}
      >
        <Icon size={12} />
        {stage || config.label}
      </Badge>
    );
  };

  /**
   * Render timeline for application
   * @param {Array} timeline - Timeline array
   * @returns {JSX.Element} Timeline component
   */
  const renderTimeline = (timeline) => {
    if (!timeline || !Array.isArray(timeline)) return null;

    return (
      <div className={styles.timeline}>
        {timeline.slice(0, 3).map((item, index) => (
          <div key={index} className={styles.timelineItem}>
            <div className={styles.timelineDot} />
            <div className={styles.timelineContent}>
              <span className={styles.timelineAction}>{item.action}</span>
              <span className={styles.timelineDate}>{item.date}</span>
            </div>
            <Badge
              variant={item.status === "completed" ? "success" :
                item.status === "scheduled" ? "warning" : "default"}
              size="sm"
            >
              {item.status}
            </Badge>
          </div>
        ))}
      </div>
    );
  };

  /**
   * Get the application ID from different API payload shapes
   * @param {Object} application - Application object
   * @returns {string|number|null} Application ID
   */
  const getApplicationId = (application) =>
    application.id || application.applicationId || application.jobApplicationId || null;

  /**
   * Get the related job ID from different application payload shapes
   * @param {Object} application - Application object
   * @returns {string|number|null} Related job ID
   */
  const getApplicationJobId = (application) =>
    application.jobId || application.job?.id || application.job?.jobId || null;

  /**
   * Toggle application details
   * @param {string} appId - Application ID
   */
  const toggleAppDetails = (appId) => {
    setExpandedAppId(expandedAppId === appId ? null : appId);
  };

  /**
   * Handle view details action
   * @param {Object} application - Application object
   * @param {Event} e - Click event
   */
  const handleViewDetails = (application, e) => {
    e.stopPropagation();
    const jobId = getApplicationJobId(application);

    if (jobId) {
      navigate(`/jobs/${jobId}`);
      return;
    }

    onViewApplication(getApplicationId(application));
  };

  /**
   * Handle status action by expanding the application card
   * @param {string} appId - Application ID
   * @param {Event} e - Click event
   */
  const handleUpdateStatus = (appId, e) => {
    e.stopPropagation();
    setExpandedAppId(appId);
    onUpdateStatus(appId);
  };

  /**
   * Handle application withdrawal
   * @param {string} appId - Application ID
   * @param {Event} e - Click event
   */
  const handleWithdraw = async (appId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to withdraw this application?")) {
      await onWithdrawApplication(appId);
    }
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setFilters({
      status: "all",
      dateRange: "all",
      matchScore: "all"
    });
  };

  // Pagination
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pagedApplications = filteredApplications.slice(startIdx, startIdx + ITEMS_PER_PAGE);


  // If no applications
  if (applications.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <FileText size={48} />
        </div>
        <h3>No Applications Yet</h3>
        <p>Start applying to jobs to track your progress here</p>
        <Button variant="primary" onClick={() => navigate('/jobs')}>
          Browse Jobs
        </Button>
      </div>
    );
  }

  // Application statistics
  const applicationStats = {
    total: stats.total || applications.length,
    underReview: stats.underReview || applications.filter(app =>
      ["applied", "review", "pending"].includes(app.status?.toLowerCase())
    ).length,
    interview: stats.interview || applications.filter(app =>
      ["interview", "scheduled"].some(status =>
        app.status?.toLowerCase().includes(status)
      )
    ).length,
    offers: stats.offers || applications.filter(app =>
      ["offer", "accepted"].some(status =>
        app.status?.toLowerCase().includes(status)
      )
    ).length,
    rejected: stats.rejected || applications.filter(app =>
      ["rejected", "not selected"].includes(app.status?.toLowerCase())
    ).length,
  };

  return (
    <div className={styles.container}>
      {/* Header with Stats */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h2 className={styles.title}>Job Applications</h2>
          <p className={styles.subtitle}>
            Track and manage all your job applications
          </p>
        </div>

        <div className={styles.headerStats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{applicationStats.total}</div>
            <div className={styles.statLabel}>Total</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{applicationStats.underReview}</div>
            <div className={styles.statLabel}>Review</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{applicationStats.interview}</div>
            <div className={styles.statLabel}>Interview</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{applicationStats.offers}</div>
            <div className={styles.statLabel}>Offers</div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className={styles.controls}>
        <div className={styles.filterControls}>
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

          <div className={styles.sortDropdown}>
            <GeneralSelect
              value={sortBy}
              onChange={setSortBy}
              label="Sort By"
              options={[
                { value: "date", label: "Sort by: Newest" },
                { value: "match", label: "Sort by: Match Score" },
                { value: "company", label: "Sort by: Company" },
                { value: "status", label: "Sort by: Status" },
              ]}
            />
          </div>
        </div>

        <div className={styles.viewOptions}>
          <Button variant="outline" size="sm">
            <BarChart size={16} /> Analytics
          </Button>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status</label>
            <div className={styles.filterOptions}>
              {["all", "applied", "review", "interview", "offer", "rejected", "withdrawn"].map(status => (
                <button
                  key={status}
                  className={`${styles.filterOption} ${filters.status === status ? styles.active : ''}`}
                  onClick={() => setFilters(prev => ({ ...prev, status }))}
                >
                  {status === "all" ? "All Statuses" : status}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Date Range</label>
            <div className={styles.filterOptions}>
              {["all", "week", "month", "quarter"].map(range => (
                <button
                  key={range}
                  className={`${styles.filterOption} ${filters.dateRange === range ? styles.active : ''}`}
                  onClick={() => setFilters(prev => ({ ...prev, dateRange: range }))}
                >
                  {range === "all" ? "All Time" : `Last ${range}`}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Match Score</label>
            <div className={styles.filterOptions}>
              {["all", "90", "80", "70", "60"].map(score => (
                <button
                  key={score}
                  className={`${styles.filterOption} ${filters.matchScore === score ? styles.active : ''}`}
                  onClick={() => setFilters(prev => ({ ...prev, matchScore: score }))}
                >
                  {score === "all" ? "Any Score" : `≥ ${score}%`}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterActions}>
            <button className={styles.clearButton} onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className={styles.applicationsList}>
        {pagedApplications.map(application => {
          const applicationId = getApplicationId(application);

          return (
            <article
              key={applicationId}
              className={`${styles.applicationCard} ${expandedAppId === applicationId ? styles.expanded : ''}`}
              onClick={() => toggleAppDetails(applicationId)}
              role="button"
              tabIndex={0}
            >
              <div className={styles.appHeader}>
                <div className={styles.appMainInfo}>
                  <div className={styles.appTitleRow}>
                    <h3 className={styles.appTitle}>{application.jobTitle || application.title}</h3>
                    {renderStatusBadge(application.status, application.stage)}
                  </div>
                  <p className={styles.company}>{application.company}</p>
                </div>

                <div className={styles.appMeta}>
                  <div className={styles.matchScore}>
                    <TrendingUp size={14} />
                    <span>{application.matchScore || "N/A"}% Match</span>
                  </div>
                  <div className={styles.appliedDate}>
                    <Calendar size={14} />
                    <span>{application.appliedDate || application.date}</span>
                  </div>
                </div>
              </div>

              <div className={styles.appDetails}>
                <div className={styles.detailsRow}>
                  <div className={styles.detailItem}>
                    <MapPin size={14} />
                    <span>{application.location || "Location not specified"}</span>
                  </div>
                  {application.salary && (
                    <div className={styles.detailItem}>
                      <DollarSign size={14} />
                      <span>{application.salary}</span>
                    </div>
                  )}
                  {application.nextAction && (
                    <div className={styles.detailItem}>
                      <Clock size={14} />
                      <span>Next: {application.nextAction}</span>
                    </div>
                  )}
                </div>

                {application.notes && (
                  <div className={styles.notes}>
                    <span className={styles.notesLabel}>Notes: </span>
                    {application.notes}
                  </div>
                )}
              </div>

              {/* Expandable Content */}
              {expandedAppId === applicationId && (
                <div className={styles.expandedContent}>
                  {application.timeline && (
                    <div className={styles.timelineSection}>
                      <h4>Application Timeline</h4>
                      {renderTimeline(application.timeline)}
                    </div>
                  )}

                  {application.offerDetails && (
                    <div className={styles.offerSection}>
                      <h4>Offer Details</h4>
                      <div className={styles.offerDetails}>
                        {Object.entries(application.offerDetails).map(([key, value]) => (
                          <div key={key} className={styles.offerItem}>
                            <span className={styles.offerLabel}>{key}:</span>
                            <span className={styles.offerValue}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {application.feedback && (
                    <div className={styles.feedbackSection}>
                      <h4>Feedback</h4>
                      <p>{application.feedback}</p>
                    </div>
                  )}

                  <div className={styles.expandedActions}>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={(e) => handleViewDetails(application, e)}
                    >
                      <Eye size={16} /> View Details
                    </Button>

                    {!["rejected", "withdrawn", "offer"].includes(application.status?.toLowerCase()) && (
                      <Button
                        variant="destructive"
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleWithdraw(applicationId, e); }}
                      >
                        <Trash2 size={16} /> Withdraw
                      </Button>
                    )}

                    <Button
                      variant="primary"
                      size="small"
                      onClick={(e) => handleUpdateStatus(applicationId, e)}
                    >
                      Update Status
                    </Button>
                  </div>
                </div>
              )}

              {/* Collapsed Actions */}
              {expandedAppId !== applicationId && (
                <div className={styles.collapsedActions}>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={(e) => handleViewDetails(application, e)}
                  >
                    <Eye size={14} />
                  </Button>

                  {!["rejected", "withdrawn", "offer"].includes(application.status?.toLowerCase()) && (
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handleWithdraw(applicationId, e); }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
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
          totalItems={filteredApplications.length}
        />
      )}
    </div>
  );
};

export default DetailedApplications;