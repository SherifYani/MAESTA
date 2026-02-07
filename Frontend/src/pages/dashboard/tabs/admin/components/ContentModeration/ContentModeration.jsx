/**
 * @file ContentModeration.jsx
 * @description Content Moderation Interface for Admin Dashboard
 * @author Sherif Talaat
 * @date 2026-02-06
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */

import React, { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Shield } from 'lucide-react';
import AdminPageHeader from '../shared/AdminPageHeader/AdminPageHeader';
import AdminToolbar from '../shared/AdminToolbar/AdminToolbar';
import AdminDataTable from '../shared/AdminDataTable';
import { reportsData } from '../../config/adminMockData';
import styles from './ContentModeration.module.css';

/**
 * Content Moderation component for handling user reports and content management.
 * Follows task-focused page pattern with integrated header status.
 * @returns {JSX.Element} The rendered content moderation interface.
 */
const ContentModeration = () => {
    const [reports, setReports] = useState(reportsData);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    /**
     * Filters reports based on search and status
     */
    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            const matchesSearch =
                report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.reporter.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [reports, searchTerm, statusFilter]);

    /**
     * Handles report actions (dismiss, warn, remove).
     * @param {string} id - The report ID.
     * @param {string} action - The action to perform.
     */
    const handleAction = (id, action) => {
        console.log(`Report ${id} action: ${action}`);
        setReports(reports.map(report =>
            report.id === id
                ? {
                    ...report,
                    status: action === 'dismiss' ? 'resolved' : 'removed',
                    lastAction: action,
                    resolvedAt: new Date().toISOString()
                }
                : report
        ));
    };

    /**
     * Handles search input change
     */
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    /**
     * Renders a status badge with appropriate styling.
     * @param {Object} row - The report row data.
     * @returns {JSX.Element} The status badge element.
     */
    const renderStatusBadge = (row) => (
        <span className={`${styles.statusBadge} ${styles[`statusBadge--${row.status}`]}`}>
            {row.status}
        </span>
    );

    /**
     * Renders action buttons for pending reports.
     * @param {Object} row - The report row data.
     * @returns {JSX.Element} The action buttons container.
     */
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

    const columns = [
        {
            header: 'Report ID',
            accessor: 'id',
            render: (row) => <span className={styles.idCell}>#{row.id}</span>
        },
        { header: 'Type', accessor: 'type' },
        {
            header: 'Reason',
            accessor: 'reason',
            render: (row) => <span className={styles.reason}>{row.reason}</span>
        },
        { header: 'Target ID', accessor: 'targetId' },
        { header: 'Reporter', accessor: 'reporter' },
        { header: 'Date', accessor: 'date' },
        {
            header: 'Status',
            accessor: 'status',
            render: renderStatusBadge
        },
        {
            header: 'Actions',
            render: renderActions
        }
    ];

    const pendingCount = reports.filter(report => report.status === 'pending').length;
    const resolvedCount = reports.filter(report => report.status === 'resolved').length;

    // Status badge for header
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
                searchPlaceholder="Search by report ID, reason, or reporter..."
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
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
                            <option value="removed">Removed</option>
                        </select>
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
                    data={filteredReports}
                    className={styles.dataTable}
                />
            </main>
        </div>
    );
};

export default ContentModeration;