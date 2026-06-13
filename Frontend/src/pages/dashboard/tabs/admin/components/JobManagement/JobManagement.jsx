/**
 * @file JobManagement.jsx
 * @description Job Management Interface for Admin Dashboard
 * @author Sherif Talaat
 * @date 2026-02-06
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-16
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Eye, Edit, Trash, FileText, Briefcase } from 'lucide-react';
import AdminPageHeader from '../shared/AdminPageHeader/AdminPageHeader';
import AdminToolbar from '../shared/AdminToolbar/AdminToolbar';
import AdminDataTable from '../shared/AdminDataTable';
import GeneralSelect from "../../../../../../components/common/GeneralSelect";
import { getJobsData } from '../../config/adminMockData';
import styles from './JobManagement.module.css';

const PAGE_SIZE = 10;

const JobManagement = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getJobsData().then(data => {
            setJobs(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    // ── Filter state ─────────────────────────────────────────────────────────
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // ── Sort state ───────────────────────────────────────────────────────────
    const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });

    // ── Pagination state ─────────────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);

    // =========================================================================
    // Stats (on full dataset)
    // =========================================================================
    const jobStats = useMemo(() => ({
        active: jobs.filter(j => j.status === 'active').length,
        pending: jobs.filter(j => j.status === 'pending').length,
        expired: jobs.filter(j => j.status === 'expired').length,
        flagged: jobs.filter(j => j.reports > 0).length,
    }), [jobs]);

    // =========================================================================
    // Data pipeline: filter → sort → paginate
    // =========================================================================

    const filteredJobs = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return jobs.filter(job => {
            const matchesSearch = !searchTerm
                || job.title.toLowerCase().includes(term)
                || job.company.toLowerCase().includes(term);
            const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [jobs, searchTerm, statusFilter]);

    const sortedJobs = useMemo(() => {
        if (!sortConfig.key) return filteredJobs;
        return [...filteredJobs].sort((a, b) => {
            let aVal = a[sortConfig.key] ?? '';
            let bVal = b[sortConfig.key] ?? '';
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredJobs, sortConfig]);

    const totalItems = sortedJobs.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

    const paginatedJobs = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return sortedJobs.slice(start, start + PAGE_SIZE);
    }, [sortedJobs, currentPage]);

    // =========================================================================
    // Handlers
    // =========================================================================
    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        setCurrentPage(1);
    }, []);

    const handleSort = useCallback((key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    }, [totalPages]);

    const handleDeleteJob = useCallback((id, title) => {
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            setJobs(prev => prev.filter(job => job.id !== id));
        }
    }, []);

    // =========================================================================
    // Cell renderers
    // =========================================================================
    const renderJobInfo = (row) => (
        <div className={styles.jobInfo}>
            <div className={styles.jobInfo__icon}>
                <FileText size={16} aria-hidden="true" />
            </div>
            <div className={styles.jobInfo__details}>
                <h3 className={styles.jobInfo__title}>{row.title}</h3>
                <p className={styles.jobInfo__meta}>{row.company} • {row.type}</p>
            </div>
        </div>
    );

    const renderStatusBadge = (row) => (
        <span className={`${styles.statusBadge} ${styles[`statusBadge--${row.status}`]}`}>
            {row.status}
        </span>
    );

    const renderReports = (row) => (
        <span
            className={row.reports > 0 ? styles.reportCountDanger : styles.reportCount}
            title={row.reports > 0 ? `${row.reports} reports on this job` : 'No reports'}
        >
            {row.reports}
        </span>
    );

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

    // =========================================================================
    // Column definitions
    // =========================================================================
    const columns = [
        { header: 'Job Title', accessor: 'title', render: renderJobInfo },
        { header: 'Status', accessor: 'status', render: renderStatusBadge },
        { header: 'Applications', accessor: 'applications' },
        { header: 'Reports', accessor: 'reports', render: renderReports },
        { header: 'Posted', accessor: 'postedDate' },
        { header: 'Actions', sortable: false, render: renderActions },
    ];

    // =========================================================================
    // Render
    // =========================================================================
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
                onSearchChange={(e) => handleSearch(e.target.value)}
                filters={
                    <>
                        <GeneralSelect
                            value={statusFilter}
                            onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                            options={[
                                { value: "all", label: "All Status" },
                                { value: "active", label: "Active" },
                                { value: "pending", label: "Pending" },
                                { value: "expired", label: "Expired" },
                                { value: "review", label: "Under Review" },
                            ]}
                        />
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
                    data={paginatedJobs}
                    className={styles.dataTable}
                    searchable={false}
                    filterable={true}
                    pagination={totalItems > PAGE_SIZE}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                    pageSize={PAGE_SIZE}
                />
            </main>
        </div>
    );
};

export default JobManagement;