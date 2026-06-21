/**
 * @file SubscriptionManagement.jsx
 * @description Subscription Management Interface for Admin Dashboard
 * @author Sherif Talaat
 * @date 2026-02-06
 * 
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-03-16
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    Download,
    TrendingUp,
    Users,
    DollarSign,
    MoreVertical,
    RefreshCw,
    XCircle
} from 'lucide-react';
import AdminPageHeader from '../shared/AdminPageHeader/AdminPageHeader';
import AdminToolbar from '../shared/AdminToolbar/AdminToolbar';
import AdminStatsGrid from '../shared/AdminStatsGrid/AdminStatsGrid';
import AdminDataTable from '../shared/AdminDataTable';
import GeneralSelect from "../../../../../../components/common/GeneralSelect";
import { getSubscriptionsData } from '../../config/adminDataService';
import styles from './SubscriptionManagement.module.css';

const PAGE_SIZE = 10;

/**
 * Subscription Management component — fully controlled parent for AdminDataTable.
 * @returns {JSX.Element}
 */
const SubscriptionManagement = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [, setLoading] = useState(true);

    useEffect(() => {
        getSubscriptionsData().then(data => {
            setSubscriptions(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    // ── Filter state ─────────────────────────────────────────────────────────
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [planFilter, setPlanFilter] = useState('all');

    // ── Sort state ───────────────────────────────────────────────────────────
    const [sortConfig, setSortConfig] = useState({ key: 'user', direction: 'asc' });

    // ── Pagination state ─────────────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);

    // ── Action dropdown ───────────────────────────────────────────────────────
    const [selectedSubscription, setSelectedSubscription] = useState(null);

    // =========================================================================
    // Stats (on full dataset, not filtered)
    // =========================================================================
    const subscriptionStats = useMemo(() => {
        const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
        const mrr = activeSubscriptions.reduce((sum, s) => sum + s.amount, 0);
        const cancelledCount = subscriptions.filter(s => s.status === 'cancelled').length;
        const cancellationRate = ((cancelledCount / subscriptions.length) * 100).toFixed(1);
        return {
            mrr,
            arr: mrr * 12,
            activeCount: activeSubscriptions.length,
            cancelledCount,
            cancellationRate,
        };
    }, [subscriptions]);

    // =========================================================================
    // Data pipeline: filter → sort → paginate
    // =========================================================================

    const filteredSubscriptions = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return subscriptions.filter(sub => {
            const matchesSearch = !searchTerm
                || sub.user.toLowerCase().includes(term)
                || sub.id.toLowerCase().includes(term)
                || sub.plan.toLowerCase().includes(term);
            const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
            const matchesPlan = planFilter === 'all' || sub.plan.toLowerCase() === planFilter;
            return matchesSearch && matchesStatus && matchesPlan;
        });
    }, [subscriptions, searchTerm, statusFilter, planFilter]);

    const sortedSubscriptions = useMemo(() => {
        if (!sortConfig.key) return filteredSubscriptions;
        return [...filteredSubscriptions].sort((a, b) => {
            let aVal = a[sortConfig.key] ?? '';
            let bVal = b[sortConfig.key] ?? '';
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredSubscriptions, sortConfig]);

    const totalItems = sortedSubscriptions.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

    const paginatedSubscriptions = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return sortedSubscriptions.slice(start, start + PAGE_SIZE);
    }, [sortedSubscriptions, currentPage]);

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

    const handleDownloadInvoice = useCallback((subscription) => {
        console.log(`Downloading invoice ${subscription.invoiceId} for ${subscription.user}`);
        alert(`Downloading invoice ${subscription.invoiceId} for ${subscription.user}`);
    }, []);

    const handleUpdateStatus = useCallback((id, newStatus) => {
        setSubscriptions(prev => prev.map(sub =>
            sub.id === id ? { ...sub, status: newStatus } : sub
        ));
        setSelectedSubscription(null);
    }, []);

    const handleCancelSubscription = useCallback((id, user) => {
        if (window.confirm(`Cancel subscription for ${user}?`)) {
            handleUpdateStatus(id, 'cancelled');
        }
    }, [handleUpdateStatus]);

    // =========================================================================
    // Cell renderers
    // =========================================================================
    const renderPlanBadge = (row) => (
        <span className={`${styles.planBadge} ${styles[`planBadge--${row.plan.toLowerCase()}`]}`}>
            {row.plan}
        </span>
    );

    const renderStatusBadge = (row) => (
        <span className={`${styles.statusBadge} ${styles[`statusBadge--${row.status}`]}`}>
            <span className={styles.statusBadge__dot} />
            {row.status}
        </span>
    );

    const renderAmount = (row) => (
        <span className={row.amount > 0 ? styles.amountActive : styles.amountCancelled}>
            ${row.amount}/mo
        </span>
    );

    const renderNextBilling = (row) => {
        if (row.status !== 'active') return <span className={styles.billingInactive}>-</span>;
        return <span className={styles.billingDate}>{row.nextBilling}</span>;
    };

    const renderActions = (row) => (
        <div className={styles.actions}>
            <button
                className={styles.actionButton}
                onClick={() => handleDownloadInvoice(row)}
                title="Download Invoice"
                aria-label={`Download invoice for ${row.user}`}
            >
                <Download size={16} />
            </button>
            <div className={styles.actions__dropdown}>
                <button
                    className={styles.actions__toggle}
                    onClick={() => setSelectedSubscription(selectedSubscription === row.id ? null : row.id)}
                    aria-label={`More actions for ${row.user}`}
                    aria-expanded={selectedSubscription === row.id}
                >
                    <MoreVertical size={16} />
                </button>

                {selectedSubscription === row.id && (
                    <div className={styles.actions__menu} role="menu">
                        {row.status === 'active' && (
                            <button
                                className={`${styles.actions__item} ${styles['actions__item--danger']}`}
                                onClick={() => handleCancelSubscription(row.id, row.user)}
                                role="menuitem"
                            >
                                <XCircle size={14} />
                                Cancel Subscription
                            </button>
                        )}
                        {row.status === 'cancelled' && (
                            <button
                                className={styles.actions__item}
                                onClick={() => handleUpdateStatus(row.id, 'active')}
                                role="menuitem"
                            >
                                <RefreshCw size={14} />
                                Reactivate
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    // =========================================================================
    // Column definitions
    // =========================================================================
    const columns = [
        { header: 'User', accessor: 'user' },
        { header: 'Plan', accessor: 'plan', render: renderPlanBadge },
        { header: 'Amount', accessor: 'amount', render: renderAmount },
        { header: 'Status', accessor: 'status', render: renderStatusBadge },
        { header: 'Next Billing', accessor: 'nextBilling', render: renderNextBilling },
        { header: 'Start Date', accessor: 'startDate' },
        { header: 'Actions', sortable: false, render: renderActions },
    ];

    // =========================================================================
    // Stats grid
    // =========================================================================
    const statsData = [
        {
            id: 'mrr',
            title: 'Monthly Recurring Revenue',
            value: `$${subscriptionStats.mrr.toLocaleString()}`,
            icon: DollarSign,
            change: '+12%',
            trend: 'up',
            description: 'Current MRR',
        },
        {
            id: 'arr',
            title: 'Annual Recurring Revenue',
            value: `$${subscriptionStats.arr.toLocaleString()}`,
            icon: TrendingUp,
            change: '+15%',
            trend: 'up',
            description: 'Projected ARR',
        },
        {
            id: 'active',
            title: 'Active Subscriptions',
            value: subscriptionStats.activeCount.toLocaleString(),
            icon: Users,
            change: '+8%',
            trend: 'up',
            description: 'Currently active',
        },
        {
            id: 'churn',
            title: 'Cancellation Rate',
            value: `${subscriptionStats.cancellationRate}%`,
            icon: XCircle,
            change: '-2%',
            trend: 'down',
            description: 'Lower is better',
        },
    ];

    // =========================================================================
    // Render
    // =========================================================================
    return (
        <div className={styles.container}>
            <AdminPageHeader
                title="Subscription Management"
                description="Manage subscriptions, billing, and revenue metrics across all user plans."
                actions={
                    <button className={styles.exportButton}>
                        <Download size={18} />
                        Export Data
                    </button>
                }
            />

            <AdminStatsGrid stats={statsData} columns={4} />

            <AdminToolbar
                searchPlaceholder="Search by user or subscription ID..."
                searchValue={searchTerm}
                onSearchChange={(e) => handleSearch(e.target.value)}
                filters={
                    <>
                        <GeneralSelect
                            value={planFilter}
                            onChange={(val) => { setPlanFilter(val); setCurrentPage(1); }}
                            options={[
                                { value: "all", label: "All Plans" },
                                { value: "basic", label: "Basic" },
                                { value: "growth", label: "Growth" },
                                { value: "professional", label: "Professional" },
                                { value: "enterprise", label: "Enterprise" },
                            ]}
                        />
                        <GeneralSelect
                            value={statusFilter}
                            onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                            options={[
                                { value: "all", label: "All Status" },
                                { value: "active", label: "Active" },
                                { value: "cancelled", label: "Cancelled" },
                                { value: "pending", label: "Pending" },
                            ]}
                        />
                    </>
                }
            />

            <main className={styles.content}>
                <AdminDataTable
                    columns={columns}
                    data={paginatedSubscriptions}
                    className={styles.dataTable}
                    searchable={false}
                    filterable={true}
                    pagination={true}
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

export default SubscriptionManagement;