/**
 * @file PublishedJobs.jsx
 * @description Displays all published jobs with filtering, sorting, and management actions
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2025-01-22
 * 
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-16
 */

import {
    Search,
    Plus,
    MoreVertical,
    Eye,
    Edit,
    Pause,
    Play,
    Trash2,
    Users,
    Clock,
    DollarSign,
    MapPin,
    Building,
    TrendingUp,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import Button from "../../../../components/ui/Button";
import Badge from "../../../../components/ui/Badge";
import Card from "../../../../components/ui/Card";
import GeneralSelect from "../../../../../../components/common/GeneralSelect";
import { Pagination } from "../../../../../../components/common";
import styles from "./PublishedJobs.module.css";
import { useState, useEffect } from "react";

/**
 * Published Jobs Component
 * @param {Object} props - Component props
 * @param {Array} props.jobs - Array of job objects from dashboard.config.js
 * @param {Function} props.onCreateJob - Callback for creating new job
 * @param {Function} props.onViewJob - Callback for viewing job details
 * @param {Function} props.onEditJob - Callback for editing job
 * @param {Function} props.onManageApplicants - Callback for managing applicants
 * @returns {JSX.Element} The rendered published jobs component
 */
const PublishedJobs = ({
    jobs,
    onCreateJob,
    onViewJob,
    onEditJob,
    onUpdateJobStatus,
    onDeleteJob,
    onManageApplicants
}) => {
    const [filteredJobs, setFilteredJobs] = useState(jobs || []);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [stats, setStats] = useState(null);

    // Initialize with props data
    useEffect(() => {
        if (jobs) {
            setFilteredJobs(jobs);
            calculateStats(jobs);
        }
    }, [jobs]);

    // Calculate statistics
    const calculateStats = (jobList) => {
        const stats = {
            total: jobList.length,
            active: jobList.filter(job => job.status === "active").length,
            paused: jobList.filter(job => job.status === "paused").length,
            closed: jobList.filter(job => job.status === "closed").length,
            urgent: jobList.filter(job => job.isUrgent).length,
            remote: jobList.filter(job => job.isRemote).length,
            totalApplications: jobList.reduce((sum, job) => sum + (job.stats?.applications || 0), 0),
            totalShortlisted: jobList.reduce((sum, job) => sum + (job.stats?.shortlisted || 0), 0),
            totalHired: jobList.reduce((sum, job) => sum + (job.stats?.hired || 0), 0),
            avgCompletionRate: Math.round(
                jobList.reduce((sum, job) => sum + (job.stats?.completionRate || 0), 0) / jobList.length
            ) || 0
        };
        setStats(stats);
    };

    // Filter and sort jobs
    useEffect(() => {
        let result = [...(jobs || [])];

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(job =>
                (job.title || "").toLowerCase().includes(term) ||
                (job.department || "").toLowerCase().includes(term) ||
                (job.location || "").toLowerCase().includes(term)
            );
        }

        // Apply status filter
        if (selectedStatus !== "all") {
            result = result.filter(job => job.status === selectedStatus);
        }

        // Apply department filter
        if (selectedDepartment !== "all") {
            result = result.filter(job => job.department === selectedDepartment);
        }

        // Apply sorting
        switch (sortBy) {
            case "newest":
                result.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
                break;
            case "oldest":
                result.sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
                break;
            case "applications":
                result.sort((a, b) => (b.stats?.applications || 0) - (a.stats?.applications || 0));
                break;
            case "deadline":
                result.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
                break;
            default:
                break;
        }

        setFilteredJobs(result);
    }, [searchTerm, selectedStatus, selectedDepartment, sortBy, jobs]);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStatus, selectedDepartment, sortBy]);

    const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedJobs = filteredJobs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Get unique departments for filter
    const departments = [...new Set((jobs || []).map(job => job.department || "General"))];

    // Get status badge variant
    const getStatusVariant = (status) => {
        switch (status) {
            case "active": return "success";
            case "paused": return "warning";
            case "closed": return "error";
            default: return "default";
        }
    };

    // Get level badge variant
    const getLevelVariant = (level) => {
        if (!level) return "default";
        switch (level.toLowerCase()) {
            case "senior": return "success";
            case "mid-level": return "warning";
            case "manager": return "primary";
            default: return "default";
        }
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

    // Calculate days remaining
    const getDaysRemaining = (expiryDate) => {
        if (!expiryDate) return 0;
        const expiry = new Date(expiryDate);
        const today = new Date();
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Event handlers
    const handleCreateJob = () => {
        if (onCreateJob) onCreateJob();
    };

    const handleViewJob = (jobId) => {
        if (onViewJob) onViewJob(jobId);
    };

    const handleEditJob = (jobId, e) => {
        e.stopPropagation();
        if (onEditJob) onEditJob(jobId);
    };

    const handleManageApplicants = (jobId, e) => {
        e.stopPropagation();
        if (onManageApplicants) onManageApplicants(jobId);
    };

    const handleToggleStatus = (jobId, currentStatus, e) => {
        e.stopPropagation();
        if (onUpdateJobStatus) {
            onUpdateJobStatus(jobId, currentStatus !== "active");
        }
    };

    const handleDeleteJob = (jobId, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
            if (onDeleteJob) onDeleteJob(jobId);
        }
    };

    // Action menu component for each job
    const JobActionsMenu = ({ job }) => {
        const [showMenu, setShowMenu] = useState(false);

        return (
            <div className={styles.actionsMenuContainer}>
                <button
                    className={styles.menuButton}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                >
                    <MoreVertical size={20} />
                </button>

                {showMenu && (
                    <div className={styles.menuDropdown}>
                        <button
                            className={styles.menuItem}
                            onClick={(e) => {
                                handleViewJob(job.id);
                                setShowMenu(false);
                            }}
                        >
                            <Eye size={16} />
                            View Details
                        </button>

                        {job.actions?.canEdit && (
                            <button
                                className={styles.menuItem}
                                onClick={(e) => {
                                    handleEditJob(job.id, e);
                                    setShowMenu(false);
                                }}
                            >
                                <Edit size={16} />
                                Edit Job
                            </button>
                        )}

                        {job.actions?.canPause && (
                            <button
                                className={styles.menuItem}
                                onClick={(e) => {
                                    handleToggleStatus(job.id, job.status, e);
                                    setShowMenu(false);
                                }}
                            >
                                {job.status === "active" ? (
                                    <>
                                        <Pause size={16} />
                                        Pause Job
                                    </>
                                ) : (
                                    <>
                                        <Play size={16} />
                                        Activate Job
                                    </>
                                )}
                            </button>
                        )}

                        {job.actions?.canDelete && (
                            <button
                                className={styles.menuItem}
                                onClick={(e) => {
                                    handleDeleteJob(job.id, e);
                                    setShowMenu(false);
                                }}
                            >
                                <Trash2 size={16} />
                                Delete Job
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={styles.publishedJobs}>
            {/* Header with Actions */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h2 className={styles.title}>Published Jobs</h2>
                    <p className={styles.subtitle}>
                        Manage and track all your job postings
                    </p>
                </div>

                <div className={styles.headerActions}>
                    <Button
                        variant="primary"
                        icon={Plus}
                        onClick={handleCreateJob}
                    >
                        Post New Job
                    </Button>
                </div>
            </div>

            {/* Stats Summary */}
            {stats && (
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <span className={styles.statLabel}>Active Jobs</span>
                            <Badge variant="success">{stats.active}</Badge>
                        </div>
                        <div className={styles.statValue}>{stats.total} total</div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <span className={styles.statLabel}>Total Applications</span>
                            <Badge variant="info">{stats.totalApplications}</Badge>
                        </div>
                        <div className={styles.statValue}>{stats.totalShortlisted} shortlisted</div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <span className={styles.statLabel}>Hire Rate</span>
                            <Badge variant="warning">
                                {stats.total > 0 ? Math.round((stats.totalHired / stats.total) * 100) : 0}%
                            </Badge>
                        </div>
                        <div className={styles.statValue}>{stats.totalHired} hires</div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <span className={styles.statLabel}>Completion Rate</span>
                            <Badge variant={stats.avgCompletionRate >= 70 ? "success" : "warning"}>
                                {stats.avgCompletionRate}%
                            </Badge>
                        </div>
                        <div className={styles.statValue}>Avg. per job</div>
                    </div>
                </div>
            )}

            {/* Filters Bar */}
            <div className={styles.filtersBar}>
                <div className={styles.searchContainer}>
                    <Search size={20} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search jobs by title, department, or location..."
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
                            { value: "active", label: "Active" },
                            { value: "paused", label: "Paused" },
                            { value: "closed", label: "Closed" },
                        ]}
                    />

                    <GeneralSelect
                        value={selectedDepartment}
                        onChange={setSelectedDepartment}
                        options={[
                            { value: "all", label: "All Departments" },
                            ...departments.map(dept => ({ value: dept, label: dept }))
                        ]}
                    />

                    <GeneralSelect
                        value={sortBy}
                        onChange={setSortBy}
                        options={[
                            { value: "newest", label: "Newest First" },
                            { value: "oldest", label: "Oldest First" },
                            { value: "applications", label: "Most Applications" },
                            { value: "deadline", label: "Closest Deadline" },
                        ]}
                    />
                </div>
            </div>

            {/* Jobs Grid/List */}
            <div className={styles.jobsContainer}>
                {filteredJobs.length === 0 ? (
                    <div className={styles.emptyState}>
                        <AlertCircle size={48} />
                        <h3>No jobs found</h3>
                        <p>Try adjusting your filters or create a new job posting.</p>
                        <Button
                            variant="primary"
                            icon={Plus}
                            onClick={handleCreateJob}
                        >
                            Create Your First Job
                        </Button>
                    </div>
                ) : (
                    <div className={styles.jobsGrid}>
                        {paginatedJobs.map(job => {
                            const daysRemaining = getDaysRemaining(job.expiryDate);
                            const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
                            const isExpired = daysRemaining < 0;

                            return (
                                <Card
                                    key={job.id}
                                    className={`${styles.jobCard} ${job.isUrgent ? styles.urgentCard : ""}`}
                                    onClick={() => handleViewJob(job.id)}
                                >
                                    {/* Job Header */}
                                    <div className={styles.jobHeader}>
                                        <div className={styles.jobTitleSection}>
                                            <h3 className={styles.jobTitle}>{job.title}</h3>
                                            <div className={styles.jobBadges}>
                                                <Badge variant={getStatusVariant(job.status)}>
                                                    {job.status}
                                                </Badge>
                                                <Badge variant={getLevelVariant(job.level)}>
                                                    {job.level}
                                                </Badge>
                                                {job.isUrgent && (
                                                    <Badge variant="error">
                                                        <AlertCircle size={12} />
                                                        Urgent
                                                    </Badge>
                                                )}
                                                {job.isRemote && (
                                                    <Badge variant="info">
                                                        Remote
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <JobActionsMenu job={job} />
                                    </div>

                                    {/* Job Details */}
                                    <div className={styles.jobDetails}>
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailItem}>
                                                <Building size={16} />
                                                {job.department}
                                            </span>
                                            <span className={styles.detailItem}>
                                                <MapPin size={16} />
                                                {job.location}
                                            </span>
                                            <span className={styles.detailItem}>
                                                <DollarSign size={16} />
                                                {job.salary}
                                            </span>
                                            <span className={styles.detailItem}>
                                                {job.type}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stats Bar */}
                                    <div className={styles.statsBar}>
                                        <div className={styles.statItem}>
                                            <Users size={16} />
                                            <span className={styles.statValue}>{job.stats?.applications || 0}</span>
                                            <span className={styles.statLabel}>Apps</span>
                                        </div>

                                        <div className={styles.statItem}>
                                            <CheckCircle size={16} />
                                            <span className={styles.statValue}>{job.stats?.shortlisted || 0}</span>
                                            <span className={styles.statLabel}>Shortlisted</span>
                                        </div>

                                        <div className={styles.statItem}>
                                            <TrendingUp size={16} />
                                            <span className={styles.statValue}>{job.stats?.completionRate || 0}%</span>
                                            <span className={styles.statLabel}>Completion</span>
                                        </div>

                                        <div className={styles.statItem}>
                                            <Clock size={16} />
                                            <span className={`${styles.statValue} ${isExpired ? styles.expired : isExpiringSoon ? styles.expiringSoon : ""
                                                }`}>
                                                {isExpired ? "Expired" : `${daysRemaining}d left`}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className={styles.jobFooter}>
                                        <div className={styles.postedInfo}>
                                            <span>Posted: {formatDate(job.postedDate)}</span>
                                            <span>Expires: {formatDate(job.expiryDate)}</span>
                                        </div>

                                        <div className={styles.footerActions}>
                                            <Button
                                                variant="ghost"
                                                size="small"
                                                icon={Users}
                                                onClick={(e) => handleManageApplicants(job.id, e)}
                                            >
                                                {job.stats?.applicants || 0} Applicants
                                            </Button>

                                            {job.actions?.canViewApplicants && (
                                                <Button
                                                    variant="outline"
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleManageApplicants(job.id, e);
                                                    }}
                                                >
                                                    Manage
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div style={{ marginTop: '2rem', padding: '0 1rem' }}>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        pageSize={ITEMS_PER_PAGE}
                        showTotal={true}
                        totalItems={filteredJobs.length}
                    />
                </div>
            )}

            {/* Summary Footer */}
            {filteredJobs.length > 0 && (
                <div className={styles.summaryFooter}>
                    <span className={styles.summaryText}>
                        Showing {filteredJobs.length} of {jobs?.length || 0} jobs
                    </span>
                    <span className={styles.summaryText}>
                        • {stats?.active || 0} active • {stats?.urgent || 0} urgent • {stats?.remote || 0} remote
                    </span>
                </div>
            )}
        </div>
    );
};

export default PublishedJobs;