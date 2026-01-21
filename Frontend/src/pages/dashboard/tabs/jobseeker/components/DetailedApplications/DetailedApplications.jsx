/**
 * @file DetailedApplications.jsx
 * @description Displays job applications with detailed status tracking and filtering
 * Follows BEM methodology and uses global CSS variables
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-1-20
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-1-20
 */

import React, { useState, useMemo } from "react";
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
  ChevronDown,
  ExternalLink,
  MapPin,
  DollarSign,
  Users,
  BarChart
} from "lucide-react";
import Button from "../../../../components/ui/Button";
import Badge from "../../../../components/ui/Badge";
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
  onViewApplication = () => {},
  onWithdrawApplication = () => {},
  onUpdateStatus = () => {}
}) => {
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
    matchScore: "all"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [sortBy, setSortBy] = useState("date");

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
    }

    return filtered;
  }, [applications, filters, sortBy]);

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
   * Toggle application details
   * @param {string} appId - Application ID
   */
  const toggleAppDetails = (appId) => {
    setExpandedAppId(expandedAppId === appId ? null : appId);
  };

  /**
   * Handle application withdrawal
   * @param {string} appId - Application ID
   * @param {Event} e - Click event
   */
  const handleWithdraw = (appId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to withdraw this application?")) {
      onWithdrawApplication(appId);
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

  // If no applications
  if (applications.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <FileText size={48} />
        </div>
        <h3>No Applications Yet</h3>
        <p>Start applying to jobs to track your progress here</p>
        <Button variant="primary">
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
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="date">Sort by: Newest</option>
              <option value="match">Sort by: Match Score</option>
              <option value="company">Sort by: Company</option>
              <option value="status">Sort by: Status</option>
            </select>
            <ChevronDown size={16} className={styles.sortIcon} />
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
        {filteredApplications.map(application => {
          const statusConfig = getStatusConfig(application.status);
          const StatusIcon = statusConfig.icon;
          
          return (
            <article 
              key={application.id} 
              className={`${styles.applicationCard} ${expandedAppId === application.id ? styles.expanded : ''}`}
              onClick={() => toggleAppDetails(application.id)}
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
              {expandedAppId === application.id && (
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
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewApplication(application.id);
                      }}
                    >
                      <Eye size={16} /> View Details
                    </Button>
                    
                    {!["rejected", "withdrawn", "offer"].includes(application.status?.toLowerCase()) && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => handleWithdraw(application.id, e)}
                      >
                        <Trash2 size={16} /> Withdraw
                      </Button>
                    )}
                    
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Update Status
                    </Button>
                  </div>
                </div>
              )}

              {/* Collapsed Actions */}
              {expandedAppId !== application.id && (
                <div className={styles.collapsedActions}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewApplication(application.id);
                    }}
                  >
                    <Eye size={14} />
                  </Button>
                  
                  {!["rejected", "withdrawn", "offer"].includes(application.status?.toLowerCase()) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleWithdraw(application.id, e)}
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

      {/* Footer */}
      {filteredApplications.length > 0 && (
        <div className={styles.footer}>
          <div className={styles.footerInfo}>
            Showing {filteredApplications.length} of {applications.length} applications
          </div>
          <div className={styles.footerActions}>
            <Button variant="outline" size="sm">
              Load More
            </Button>
            <Button variant="primary" size="sm">
              <ExternalLink size={14} /> Application Analytics
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailedApplications;