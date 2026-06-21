/**
 * @file NewApplicants.jsx
 * @description Comprehensive applicant management system with filtering, sorting, and bulk actions
 * @author Sherif Talaat
 * @version 1.1.0
 * @date 2025-01-22
 * 
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-16
 */

import {
    Search,
    UserCheck,
    UserX,
    Calendar,
    Mail,
    Phone,
    MapPin,
    Download,
    Eye,
    Clock,
    TrendingUp,
    Users,
    FileText,
    MoreVertical,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { useState, useEffect } from "react";
import Button from "../../../../components/ui/Button";
import Badge from "../../../../components/ui/Badge";
import Card from "../../../../components/ui/Card";
import GeneralSelect from "../../../../../../components/common/GeneralSelect";
import styles from "./NewApplicants.module.css";

/**
 * New Applicants Component
 * @param {Object} props - Component props
 * @param {Array} props.applicants - Array of applicant objects from dashboard.config.js
 * @param {Function} props.onViewApplicant - Callback for viewing applicant details
 * @param {Function} props.onShortlist - Callback for shortlisting applicant
 * @param {Function} props.onReject - Callback for rejecting applicant
 * @param {Function} props.onScheduleInterview - Callback for scheduling interview
 * @param {Function} props.onBulkAction - Callback for bulk actions
 * @returns {JSX.Element} The rendered new applicants component
 */
const NewApplicants = ({
    applicants,
    onViewApplicant,
    onShortlist,
    onReject,
    onScheduleInterview,
    onBulkAction
}) => {
    const [filteredApplicants, setFilteredApplicants] = useState(applicants || []);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedJob, setSelectedJob] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [selectedApplicants, setSelectedApplicants] = useState([]);
    const [expandedApplicant, setExpandedApplicant] = useState(null);
    const [stats, setStats] = useState(null);
    const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'

    // Initialize with props data
    useEffect(() => {
        if (applicants) {
            setFilteredApplicants(applicants);
            calculateStats(applicants);
        }
    }, [applicants]);

    // Calculate statistics
    const calculateStats = (applicantList) => {
        const stats = {
            total: applicantList.length,
            new: applicantList.filter(app => app.status === "new").length,
            reviewed: applicantList.filter(app => app.status === "reviewed").length,
            shortlisted: applicantList.filter(app => app.status === "shortlisted").length,
            interviewed: applicantList.filter(app => app.status === "interviewed").length,
            rejected: applicantList.filter(app => app.status === "rejected").length,
            avgMatchScore: Math.round(
                applicantList.reduce((sum, app) => sum + app.matchScore, 0) / applicantList.length
            ) || 0,
            highMatch: applicantList.filter(app => app.matchScore >= 90).length,
            mediumMatch: applicantList.filter(app => app.matchScore >= 75 && app.matchScore < 90).length,
            lowMatch: applicantList.filter(app => app.matchScore < 75).length
        };
        setStats(stats);
    };

    // Filter and sort applicants
    useEffect(() => {
        let result = [...(applicants || [])];

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(applicant =>
                applicant.applicantName.toLowerCase().includes(term) ||
                applicant.jobTitle.toLowerCase().includes(term) ||
                applicant.applicantEmail.toLowerCase().includes(term)
            );
        }

        // Apply status filter
        if (selectedStatus !== "all") {
            result = result.filter(applicant => applicant.status === selectedStatus);
        }

        // Apply job filter
        if (selectedJob !== "all") {
            result = result.filter(applicant => applicant.jobId === selectedJob);
        }

        // Apply sorting
        switch (sortBy) {
            case "newest":
                result.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
                break;
            case "oldest":
                result.sort((a, b) => new Date(a.appliedDate) - new Date(b.appliedDate));
                break;
            case "matchScore":
                result.sort((a, b) => b.matchScore - a.matchScore);
                break;
            case "name":
                result.sort((a, b) => a.applicantName.localeCompare(b.applicantName));
                break;
            default:
                break;
        }

        setFilteredApplicants(result);
    }, [searchTerm, selectedStatus, selectedJob, sortBy, applicants]);

    // Get unique jobs for filter
    const jobs = [...new Set((applicants || []).map(applicant => applicant.jobId))];

    // Get status badge variant and icon
    const getStatusConfig = (status) => {
        switch (status) {
            case "new":
                return { variant: "info", icon: Clock, label: "New" };
            case "reviewed":
                return { variant: "warning", icon: Eye, label: "Reviewed" };
            case "shortlisted":
                return { variant: "success", icon: UserCheck, label: "Shortlisted" };
            case "interviewed":
                return { variant: "primary", icon: Calendar, label: "Interviewed" };
            case "rejected":
                return { variant: "error", icon: UserX, label: "Rejected" };
            default:
                return { variant: "default", icon: Clock, label: "Unknown" };
        }
    };

    // Get match score badge variant
    const getMatchScoreVariant = (score) => {
        if (score >= 90) return "success";
        if (score >= 75) return "warning";
        return "error";
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    // Handle applicant selection
    const toggleApplicantSelection = (applicantId) => {
        setSelectedApplicants(prev => {
            if (prev.includes(applicantId)) {
                return prev.filter(id => id !== applicantId);
            } else {
                return [...prev, applicantId];
            }
        });
    };

    const toggleSelectAll = () => {
        if (selectedApplicants.length === filteredApplicants.length) {
            setSelectedApplicants([]);
        } else {
            setSelectedApplicants(filteredApplicants.map(app => app.id));
        }
    };

    // Toggle applicant details
    const toggleApplicantDetails = (applicantId) => {
        setExpandedApplicant(prev => prev === applicantId ? null : applicantId);
    };

    // Event handlers
    const handleViewApplicant = (applicantId) => {
        if (onViewApplicant) onViewApplicant(applicantId);
    };

    const handleShortlist = (applicantId, e) => {
        e.stopPropagation();
        if (onShortlist) onShortlist(applicantId);
    };

    const handleReject = (applicantId, e) => {
        e.stopPropagation();
        if (onReject) onReject(applicantId);
    };

    const handleScheduleInterview = (applicantId, e) => {
        e.stopPropagation();
        if (onScheduleInterview) onScheduleInterview(applicantId);
    };

    const handleBulkAction = (action) => {
        if (onBulkAction && selectedApplicants.length > 0) {
            onBulkAction(action, selectedApplicants);
        }
    };

    const handleViewResume = (applicantId, resumeUrl, e) => {
        e.stopPropagation();
        if (resumeUrl) {
            window.open(resumeUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const handleViewProfile = (applicantId, profileUrl, e) => {
        e.stopPropagation();
        if (profileUrl) {
            window.open(profileUrl, '_blank', 'noopener,noreferrer');
        }
    };

    // Bulk action menu
    const BulkActionsMenu = () => {
        if (selectedApplicants.length === 0) return null;

        return (
            <div className={styles.bulkActions}>
                <div className={styles.bulkActionsInfo}>
                    <span className={styles.bulkCount}>
                        {selectedApplicants.length} selected
                    </span>
                </div>
                <div className={styles.bulkButtons}>
                    <Button
                        variant="outline"
                        size="small"
                        icon={UserCheck}
                        onClick={() => handleBulkAction("shortlist")}
                    >
                        Shortlist
                    </Button>
                    <Button
                        variant="outline"
                        size="small"
                        icon={UserX}
                        onClick={() => handleBulkAction("reject")}
                    >
                        Reject
                    </Button>
                    <Button
                        variant="outline"
                        size="small"
                        icon={Mail}
                        onClick={() => handleBulkAction("email")}
                    >
                        Email
                    </Button>
                    <Button
                        variant="primary"
                        size="small"
                        icon={Download}
                        onClick={() => handleBulkAction("export")}
                    >
                        Export
                    </Button>
                </div>
            </div>
        );
    };

    // Applicant card component for grid view
    const ApplicantGridCard = ({ applicant }) => {
        const statusConfig = getStatusConfig(applicant.status);

        return (
            <Card
                key={applicant.id}
                className={`${styles.applicantGridCard} ${expandedApplicant === applicant.id ? styles.expanded : ""}`}
                onClick={() => toggleApplicantDetails(applicant.id)}
            >
                {/* Header */}
                <div className={styles.gridCardHeader}>
                    <div className={styles.gridCardCheckbox}>
                        <input
                            type="checkbox"
                            checked={selectedApplicants.includes(applicant.id)}
                            onChange={(e) => {
                                e.stopPropagation();
                                toggleApplicantSelection(applicant.id);
                            }}
                        />
                    </div>

                    <div className={styles.gridCardAvatar}>
                        <div className={styles.avatar}>
                            {applicant.applicantName.charAt(0)}
                        </div>
                    </div>

                    <div className={styles.gridCardInfo}>
                        <h4 className={styles.gridCardName}>{applicant.applicantName}</h4>
                        <p className={styles.gridCardJob}>{applicant.jobTitle}</p>
                    </div>

                    <div className={styles.gridCardScore}>
                        <Badge variant={getMatchScoreVariant(applicant.matchScore)}>
                            {applicant.matchScore}% Match
                        </Badge>
                    </div>
                </div>

                {/* Body */}
                <div className={styles.gridCardBody}>
                    <div className={styles.gridCardDetails}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailItem}>
                                <Mail size={14} />
                                {applicant.applicantEmail}
                            </span>
                            <span className={styles.detailItem}>
                                <Phone size={14} />
                                {applicant.applicantPhone}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailItem}>
                                <MapPin size={14} />
                                {applicant.location}
                            </span>
                            <span className={styles.detailItem}>
                                <Calendar size={14} />
                                {formatDate(applicant.appliedDate)}
                            </span>
                        </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedApplicant === applicant.id && (
                        <div className={styles.expandedDetails}>
                            <div className={styles.detailSection}>
                                <h5 className={styles.detailTitle}>Screening Results</h5>
                                <div className={styles.screeningInfo}>
                                    <div className={styles.screeningItem}>
                                        <span className={styles.screeningLabel}>Score:</span>
                                        <span className={styles.screeningValue}>
                                            {applicant.screening?.score || "N/A"} / 100
                                        </span>
                                    </div>
                                    <div className={styles.screeningItem}>
                                        <span className={styles.screeningLabel}>Status:</span>
                                        <Badge variant={applicant.screening?.passed ? "success" : "error"}>
                                            {applicant.screening?.passed ? "Passed" : "Failed"}
                                        </Badge>
                                    </div>
                                    {applicant.screening?.notes && (
                                        <div className={styles.screeningNotes}>
                                            <span className={styles.screeningLabel}>Notes:</span>
                                            <p className={styles.screeningValue}>
                                                {applicant.screening.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.detailSection}>
                                <h5 className={styles.detailTitle}>Profile Information</h5>
                                <div className={styles.profileInfo}>
                                    <div className={styles.profileItem}>
                                        <span className={styles.profileLabel}>Experience:</span>
                                        <span className={styles.profileValue}>{applicant.experience}</span>
                                    </div>
                                    <div className={styles.profileItem}>
                                        <span className={styles.profileLabel}>Education:</span>
                                        <span className={styles.profileValue}>{applicant.education}</span>
                                    </div>
                                    <div className={styles.profileItem}>
                                        <span className={styles.profileLabel}>Source:</span>
                                        <Badge variant="info">{applicant.source}</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={styles.gridCardFooter}>
                    <div className={styles.footerStatus}>
                        <Badge variant={statusConfig.variant}>
                            {statusConfig.label}
                        </Badge>
                    </div>

                    <div className={styles.footerActions}>
                        {applicant.actions?.canViewResume && (
                            <button
                                className={styles.actionButton}
                                onClick={(e) => handleViewResume(applicant.id, applicant.resume.url, e)}
                                title="View Resume"
                            >
                                <FileText size={16} />
                            </button>
                        )}

                        {applicant.actions?.canViewProfile && (
                            <button
                                className={styles.actionButton}
                                onClick={(e) => handleViewProfile(applicant.id, applicant.profile.url, e)}
                                title="View Profile"
                            >
                                <Eye size={16} />
                            </button>
                        )}

                        <button
                            className={styles.expandButton}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleApplicantDetails(applicant.id);
                            }}
                            title={expandedApplicant === applicant.id ? "Collapse" : "Expand"}
                        >
                            {expandedApplicant === applicant.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    </div>
                </div>
            </Card>
        );
    };

    // Applicant row component for list view
    const ApplicantListRow = ({ applicant }) => {
        const statusConfig = getStatusConfig(applicant.status);

        return (
            <tr
                className={`${styles.applicantRow} ${selectedApplicants.includes(applicant.id) ? styles.selected : ""}`}
                onClick={() => handleViewApplicant(applicant.id)}
            >
                <td>
                    <input
                        type="checkbox"
                        checked={selectedApplicants.includes(applicant.id)}
                        onChange={(e) => {
                            e.stopPropagation();
                            toggleApplicantSelection(applicant.id);
                        }}
                        className={styles.rowCheckbox}
                    />
                </td>

                <td>
                    <div className={styles.applicantCell}>
                        <div className={styles.rowAvatar}>
                            {applicant.applicantName.charAt(0)}
                        </div>
                        <div className={styles.rowInfo}>
                            <span className={styles.rowName}>{applicant.applicantName}</span>
                            <span className={styles.rowEmail}>{applicant.applicantEmail}</span>
                        </div>
                    </div>
                </td>

                <td>
                    <span className={styles.rowJob}>{applicant.jobTitle}</span>
                </td>

                <td>
                    <div className={styles.rowScore}>
                        <Badge variant={getMatchScoreVariant(applicant.matchScore)}>
                            {applicant.matchScore}%
                        </Badge>
                    </div>
                </td>

                <td>
                    <Badge variant={statusConfig.variant}>
                        {/* <StatusIcon size={12} /> */}
                        {statusConfig.label}
                    </Badge>
                </td>

                <td>
                    <span className={styles.rowDate}>
                        {formatDate(applicant.appliedDate)}
                    </span>
                </td>

                <td>
                    <div className={styles.rowActions}>
                        {applicant.actions?.canShortlist && (
                            <button
                                className={styles.rowActionButton}
                                onClick={(e) => handleShortlist(applicant.id, e)}
                                title="Shortlist"
                            >
                                <UserCheck size={16} />
                            </button>
                        )}

                        {applicant.actions?.canReject && (
                            <button
                                className={styles.rowActionButton}
                                onClick={(e) => handleReject(applicant.id, e)}
                                title="Reject"
                            >
                                <UserX size={16} />
                            </button>
                        )}

                        {applicant.actions?.canScheduleInterview && (
                            <button
                                className={styles.rowActionButton}
                                onClick={(e) => handleScheduleInterview(applicant.id, e)}
                                title="Schedule Interview"
                            >
                                <Calendar size={16} />
                            </button>
                        )}

                        <button
                            className={styles.rowMoreButton}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleApplicantDetails(applicant.id);
                            }}
                            title="More actions"
                        >
                            <MoreVertical size={16} />
                        </button>
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className={styles.newApplicants}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h2 className={styles.title}>Applicant Management</h2>
                    <p className={styles.subtitle}>
                        Review, shortlist, and manage job applicants
                    </p>
                </div>

                <div className={styles.headerActions}>
                    <div className={styles.viewToggle}>
                        <button
                            className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="4" width="18" height="3" rx="1" />
                                <rect x="3" y="10" width="18" height="3" rx="1" />
                                <rect x="3" y="16" width="18" height="3" rx="1" />
                            </svg>
                        </button>
                        <button
                            className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Grid View"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <rect x="14" y="14" width="7" height="7" rx="1" />
                            </svg>
                        </button>
                    </div>

                    <Button
                        variant="primary"
                        icon={Download}
                        onClick={() => handleBulkAction("export")}
                    >
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className={styles.statsOverview}>
                    <div className={styles.statCard}>
                        <div className={styles.statIconWrapper}>
                            <Users size={20} />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.total}</span>
                            <span className={styles.statLabel}>Total Applicants</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIconWrapper}>
                            <UserCheck size={20} />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.shortlisted}</span>
                            <span className={styles.statLabel}>Shortlisted</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIconWrapper}>
                            <TrendingUp size={20} />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.avgMatchScore}%</span>
                            <span className={styles.statLabel}>Avg Match Score</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIconWrapper}>
                            <Clock size={20} />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.new}</span>
                            <span className={styles.statLabel}>New Applications</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Actions */}
            <BulkActionsMenu />

            {/* Filters Bar */}
            <div className={styles.filtersBar}>
                <div className={styles.searchContainer}>
                    <Search size={20} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or job title..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className={styles.filterControls}>
                    <GeneralSelect
                        value={selectedStatus}
                        onChange={setSelectedStatus}
                        options={[
                            { value: "all", label: "All Status" },
                            { value: "new", label: "New" },
                            { value: "reviewed", label: "Reviewed" },
                            { value: "shortlisted", label: "Shortlisted" },
                            { value: "interviewed", label: "Interviewed" },
                            { value: "rejected", label: "Rejected" },
                        ]}
                    />

                    <GeneralSelect
                        value={selectedJob}
                        onChange={setSelectedJob}
                        options={[
                            { value: "all", label: "All Jobs" },
                            ...jobs.map(jobId => {
                                const job = applicants?.find(app => app.jobId === jobId);
                                return job ? { value: jobId, label: job.jobTitle } : null;
                            }).filter(Boolean)
                        ]}
                    />

                    <GeneralSelect
                        value={sortBy}
                        onChange={setSortBy}
                        options={[
                            { value: "newest", label: "Newest First" },
                            { value: "oldest", label: "Oldest First" },
                            { value: "matchScore", label: "Highest Match Score" },
                            { value: "name", label: "Name A-Z" },
                        ]}
                    />
                </div>
            </div>

            {/* Applicants Container */}
            <div className={styles.applicantsContainer}>
                {filteredApplicants.length === 0 ? (
                    <div className={styles.emptyState}>
                        <UserCheck size={48} />
                        <h3>No applicants found</h3>
                        <p>Try adjusting your filters or check back later for new applications.</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    /* Grid View */
                    <div className={styles.applicantsGrid}>
                        {filteredApplicants.map(applicant => (
                            <ApplicantGridCard
                                key={applicant.id}
                                applicant={applicant}
                            />
                        ))}
                    </div>
                ) : (
                    /* List View */
                    <div className={styles.applicantsTableWrapper}>
                        <table className={styles.applicantsTable}>
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={selectedApplicants.length === filteredApplicants.length && filteredApplicants.length > 0}
                                            onChange={toggleSelectAll}
                                            className={styles.headerCheckbox}
                                        />
                                    </th>
                                    <th>Applicant</th>
                                    <th>Job Position</th>
                                    <th>Match Score</th>
                                    <th>Status</th>
                                    <th>Applied Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApplicants.map(applicant => (
                                    <ApplicantListRow
                                        key={applicant.id}
                                        applicant={applicant}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Summary Footer */}
            {filteredApplicants.length > 0 && (
                <div className={styles.summaryFooter}>
                    <div className={styles.summaryLeft}>
                        <span className={styles.summaryText}>
                            Showing {filteredApplicants.length} of {applicants?.length || 0} applicants
                        </span>
                        {selectedApplicants.length > 0 && (
                            <span className={styles.summarySelected}>
                                • {selectedApplicants.length} selected
                            </span>
                        )}
                    </div>

                    <div className={styles.summaryRight}>
                        <span className={styles.summaryStat}>
                            <Badge variant="success">{stats?.highMatch || 0} high match</Badge>
                        </span>
                        <span className={styles.summaryStat}>
                            <Badge variant="warning">{stats?.mediumMatch || 0} medium</Badge>
                        </span>
                        <span className={styles.summaryStat}>
                            <Badge variant="error">{stats?.lowMatch || 0} low</Badge>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewApplicants;