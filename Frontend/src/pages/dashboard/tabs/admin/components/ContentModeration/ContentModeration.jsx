/**
 * @file ContentModeration.jsx
 * @description Content Moderation Interface for Admin Dashboard
 * @author Sherif Talaat
 * @date 2026-02-06
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-16
 */

import React, { useState, useMemo, useCallback } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Shield } from 'lucide-react';
import AdminPageHeader from '../shared/AdminPageHeader/AdminPageHeader';
import AdminToolbar from '../shared/AdminToolbar/AdminToolbar';
import AdminDataTable from '../shared/AdminDataTable';
import GeneralSelect from "../../../../../../components/common/GeneralSelect";
import { reportsData } from '../../config/adminMockData';
import styles from './ContentModeration.module.css';

const PAGE_SIZE = 10;

/**
 * Content Moderation component — fully controlled parent for AdminDataTable.
 * @returns {JSX.Element}
 */
const ContentModeration = () => {
    const [reports, setReports] = useState(reportsData);

    // ── Filter state ─────────────────────────────────────────────────────────
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // ── Sort state ───────────────────────────────────────────────────────────
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

    // ── Pagination state ─────────────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);

    // =========================================================================
    // Summary counts (on full dataset)
    // =========================================================================
    const pendingCount = useMemo(() => reports.filter(r => r.status === 'pending').length, [reports]);
    const resolvedCount = useMemo(() => reports.filter(r => r.status === 'resolved').length, [reports]);

    // =========================================================================
    // Data pipeline: filter → sort → paginate
    // =========================================================================

    const filteredReports = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return reports.filter(report => {
            const matchesSearch = !searchTerm
                || report.id.toLowerCase().includes(term)
                || report.reason.toLowerCase().includes(term)
                || report.reporter.toLowerCase().includes(term)
                || report.type.toLowerCase().includes(term);
            const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [reports, searchTerm, statusFilter]);

    const sortedReports = useMemo(() => {
        if (!sortConfig.key) return filteredReports;
        return [...filteredReports].sort((a, b) => {
            let aVal = a[sortConfig.key] ?? '';
            let bVal = b[sortConfig.key] ?? '';
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredReports, sortConfig]);

    const totalItems = sortedReports.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

    const paginatedReports = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return sortedReports.slice(start, start + PAGE_SIZE);
    }, [sortedReports, currentPage]);

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

    const handleAction = useCallback((id, action) => {
        console.log(`Report ${id} action: ${action}`);
        setReports(prev => prev.map(report =>
            report.id === id
                ? {
                    ...report,
                    status: action === 'dismiss' ? 'resolved' : 'removed',
                    lastAction: action,
                    resolvedAt: new Date().toISOString(),
                }
                : report
        ));
    }, []);

    // =========================================================================
    // Cell renderers
    // =========================================================================
    const renderStatusBadge = (row) => (
        <span className={`${styles.statusBadge} ${styles[`statusBadge--${row.status}`]}`}>
            {row.status}
        </span>
    );

    const renderActions = (row) => (
        <div className={styles.actions}>
            {row.status === 'pending' ? (
                <>
                    <button
                        className={`${styles.actionButton} ${styles.actionButton__success}`}
                        title="Dismiss Report"
                        onClick={() => handleAction(row.id, 'dismiss')}
                        aria-label={`Dismiss report ${row.id}`}
                    >
                        <CheckCircle size={16} />
                    </button>
                    <button
                        className={`${styles.actionButton} ${styles.actionButton__warn}`}
                        title="Warn User"
                        onClick={() => handleAction(row.id, 'warn')}
                        aria-label={`Warn user for report ${row.id}`}
                    >
                        <AlertTriangle size={16} />
                    </button>
                    <button
                        className={`${styles.actionButton} ${styles.actionButton__danger}`}
                        title="Remove Content"
                        onClick={() => handleAction(row.id, 'remove')}
                        aria-label={`Remove content for report ${row.id}`}
                    >
                        <XCircle size={16} />
                    </button>
                </>
            ) : (
                <span className={styles.resolvedText}>Resolved</span>
            )}
        </div>
    );

    // =========================================================================
    // Column definitions
    // =========================================================================
    const columns = [
        { header: 'Report ID', accessor: 'id', render: (row) => <span className={styles.idCell}>#{row.id}</span> },
        { header: 'Type', accessor: 'type' },
        { header: 'Reason', accessor: 'reason', render: (row) => <span className={styles.reason}>{row.reason}</span> },
        { header: 'Target ID', accessor: 'targetId' },
        { header: 'Reporter', accessor: 'reporter' },
        { header: 'Date', accessor: 'date' },
        { header: 'Status', accessor: 'status', render: renderStatusBadge },
        { header: 'Actions', sortable: false, render: renderActions },
    ];

    // =========================================================================
    // Render
    // =========================================================================
    const statusBadge = (
        <span className={styles.headerBadge}>
            <Shield size={14} />
            {pendingCount} Pending
        </span>
    );

    return (
        <div className={styles.container}>
            <AdminPageHeader
                title="Content Moderation"
                description="Review and manage reported content, users, and violations to maintain platform quality and safety."
                badge={statusBadge}
            />

            <AdminToolbar
                searchPlaceholder="Search by report ID, type, reason, or reporter..."
                searchValue={searchTerm}
                onSearchChange={(e) => handleSearch(e.target.value)}
                filters={
                    <>
                        <GeneralSelect
                            value={statusFilter}
                            onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                            options={[
                                { value: "all", label: "All Status" },
                                { value: "pending", label: "Pending" },
                                { value: "investigating", label: "Investigating" },
                                { value: "resolved", label: "Resolved" },
                                { value: "dismissed", label: "Dismissed" },
                                { value: "removed", label: "Removed" },
                            ]}
                        />
                    </>
                }
                actions={
                    <div className={styles.toolbarStats}>
                        <span className={styles.toolbarStat}>
                            <strong>{pendingCount}</strong> Pending
                        </span>
                        <span className={styles.toolbarStat}>
                            <strong>{resolvedCount}</strong> Resolved
                        </span>
                    </div>
                }
            />

            <main className={styles.content}>
                <AdminDataTable
                    columns={columns}
                    data={paginatedReports}
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

export default ContentModeration;