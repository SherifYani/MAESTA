/**
 * @file JobManagement.jsx
 * @description Job Management Interface for Admin Dashboard
 * @author Sherif Talaat
 * @date 2026-02-06
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */

import React, { useState, useMemo } from 'react';
import { Eye, Edit, Trash, FileText, Briefcase } from 'lucide-react';
import AdminPageHeader from '../shared/AdminPageHeader/AdminPageHeader';
import AdminToolbar from '../shared/AdminToolbar/AdminToolbar';
import AdminDataTable from '../shared/AdminDataTable';
import { jobsData } from '../../config/adminMockData';
import styles from './JobManagement.module.css';

/**
 * Job Management component for administering job postings.
 * Follows task-focused page pattern.
 * @returns {JSX.Element} The rendered job management interface.
 */
const JobManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [jobs, setJobs] = useState(jobsData);

    /**
     * Filters jobs based on search term and status filter.
     */
    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            const matchesSearch =
                job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.company.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, statusFilter, jobs]);

    /**
     * Calculates job statistics
     */
    const jobStats = useMemo(() => {
        return {
            active: jobs.filter(job => job.status === 'active').length,
            pending: jobs.filter(job => job.status === 'pending').length,
            expired: jobs.filter(job => job.status === 'expired').length,
            flagged: jobs.filter(job => job.reports > 0).length
        };
    }, [jobs]);

    /**
     * Handles search input changes.
     */
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    /**
     * Handles job deletion with confirmation.
     */
    const handleDeleteJob = (id, title) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete "${title}"?`);
        if (confirmDelete) {
            console.log(`Deleting job ${id}: ${title}`);
            setJobs(jobs.filter(job => job.id !== id));
        }
    };

    /**
     * Renders job information with icon and details.
     */
    const renderJobInfo = (row) => (
        <div className={styles.jobInfo}>
            <div className={styles.jobInfo__icon}>
                <FileText size={16} aria-hidden="true" />
            </div>
            <div className={styles.jobInfo__details}>
                <h3 className={styles.jobInfo__title}>{row.title}</h3>
                <p className={styles.jobInfo__meta}>
                    {row.company} • {row.type}
                </p>
            </div>
        </div>
    );

    /**
     * Renders status badge with appropriate styling.
     */
    const renderStatusBadge = (row) => (
        <span className={`${styles.statusBadge} ${styles[`statusBadge--${row.status}`]}`}>
            {row.status}
        </span>
    );

    /**
     * Renders report count with appropriate styling.
     */
    const renderReports = (row) => (
        <span
            className={row.reports > 0 ? styles.reportCountDanger : styles.reportCount}
            title={row.reports > 0 ? `${row.reports} reports on this job` : 'No reports'}
        >
            {row.reports}
        </span>
    );

    /**
     * Renders action buttons for job management.
     */
    const renderActions = (row) => (
        <div className={styles.actions}>
            <button
                className={styles.actionButton}
                title="View Job Details"
                aria-label={`View details for ${row.title}`}
            >
                <Eye size={16} aria-hidden="true" />
            </button>
            <button
                className={styles.actionButton}
                title="Edit Job"
                aria-label={`Edit ${row.title}`}
            >
                <Edit size={16} aria-hidden="true" />
            </button>
            <button
                className={`${styles.actionButton} ${styles.actionButton__danger}`}
                title="Delete Job"
                onClick={() => handleDeleteJob(row.id, row.title)}
                aria-label={`Delete ${row.title}`}
            >
                <Trash size={16} aria-hidden="true" />
            </button>
        </div>
    );

    const columns = [
        {
            header: 'Job Title',
            accessor: 'title',
            render: renderJobInfo
        },
        {
            header: 'Status',
            accessor: 'status',
            render: renderStatusBadge
        },
        {
            header: 'Applications',
            accessor: 'applications'
        },
        {
            header: 'Reports',
            accessor: 'reports',
            render: renderReports
        },
        {
            header: 'Posted',
            accessor: 'postedDate'
        },
        {
            header: 'Actions',
            render: renderActions
        }
    ];

    // Header badge showing active jobs
    const headerBadge = (
        <span className={styles.headerBadge}>
            <Briefcase size={14} />
            {jobStats.active} Active
        </span>
    );

    return (
        <div className={styles.container}>
            <AdminPageHeader
                title="Job Management"
                description="Manage job postings, review applications, and moderate job content across the platform."
                badge={headerBadge}
            />

            <AdminToolbar
                searchPlaceholder="Search by job title or company..."
                searchValue={searchTerm}
                onSearchChange={handleSearchChange}
                filters={
                    <>
                        <select
                            className={styles.filterSelect}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            aria-label="Filter by status"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="expired">Expired</option>
                        </select>
                    </>
                }
                actions={
                    <div className={styles.toolbarStats}>
                        <span className={styles.toolbarStat}>
                            <strong>{jobStats.active}</strong> Active
                        </span>
                        <span className={styles.toolbarStat}>
                            <strong>{jobStats.pending}</strong> Pending
                        </span>
                        <span className={styles.toolbarStat}>
                            <strong>{jobStats.flagged}</strong> Flagged
                        </span>
                    </div>
                }
            />

            <main className={styles.content}>
                <AdminDataTable
                    columns={columns}
                    data={filteredJobs}
                    className={styles.dataTable}
                />
            </main>
        </div>
    );
};

export default JobManagement;