/**
 * @file SubscriptionManagement.jsx
 * @description Subscription Management Interface for Admin Dashboard
 * @author Sherif Talaat
 * @date 2026-02-06
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
    CreditCard,
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
import { subscriptionsData } from '../../config/adminMockData';
import styles from './SubscriptionManagement.module.css';

/**
 * Subscription Management component for handling user subscriptions and billing.
 * Follows data-intensive page pattern with revenue metrics.
 * @returns {JSX.Element} The rendered subscription management interface.
 */
const SubscriptionManagement = () => {
    const [subscriptions, setSubscriptions] = useState(subscriptionsData);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [planFilter, setPlanFilter] = useState('all');
    const [selectedSubscription, setSelectedSubscription] = useState(null);

    /**
     * Calculates subscription statistics.
     */
    const subscriptionStats = useMemo(() => {
        const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
        const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
        const mrr = activeSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);
        const arr = mrr * 12;
        const activeCount = activeSubscriptions.length;
        const cancelledCount = subscriptions.filter(sub => sub.status === 'cancelled').length;
        const cancellationRate = ((cancelledCount / subscriptions.length) * 100).toFixed(1);

        return {
            totalRevenue,
            mrr,
            arr,
            activeCount,
            cancelledCount,
            cancellationRate
        };
    }, [subscriptions]);

    /**
     * Filters subscriptions based on search term and filters.
     */
    const filteredSubscriptions = useMemo(() => {
        return subscriptions.filter(sub => {
            const matchesSearch =
                sub.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sub.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
            const matchesPlan = planFilter === 'all' || sub.plan.toLowerCase() === planFilter;
            return matchesSearch && matchesStatus && matchesPlan;
        });
    }, [subscriptions, searchTerm, statusFilter, planFilter]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleDownloadInvoice = useCallback((subscription) => {
        console.log(`Downloading invoice for ${subscription.id}: ${subscription.invoiceId}`);
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
        if (row.status !== 'active') {
            return <span className={styles.billingInactive}>-</span>;
        }
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
        </div >
    );

    const columns = [
        {
            header: 'User',
            accessor: 'user'
        },
        {
            header: 'Plan',
            accessor: 'plan',
            render: renderPlanBadge
        },
        {
            header: 'Amount',
            accessor: 'amount',
            render: renderAmount
        },
        {
            header: 'Status',
            accessor: 'status',
            render: renderStatusBadge
        },
        {
            header: 'Next Billing',
            accessor: 'nextBilling',
            render: renderNextBilling
        },
        {
            header: 'Start Date',
            accessor: 'startDate'
        },
        {
            header: 'Actions',
            render: renderActions
        }
    ];

    // Stats for the grid
    const statsData = [
        {
            id: 'mrr',
            title: 'Monthly Recurring Revenue',
            value: `$${subscriptionStats.mrr.toLocaleString()}`,
            icon: DollarSign,
            change: '+12%',
            trend: 'up',
            description: 'Current MRR'
        },
        {
            id: 'arr',
            title: 'Annual Recurring Revenue',
            value: `$${subscriptionStats.arr.toLocaleString()}`,
            icon: TrendingUp,
            change: '+15%',
            trend: 'up',
            description: 'Projected ARR'
        },
        {
            id: 'active',
            title: 'Active Subscriptions',
            value: subscriptionStats.activeCount.toLocaleString(),
            icon: Users,
            change: '+8%',
            trend: 'up',
            description: 'Currently active'
        },
        {
            id: 'churn',
            title: 'Cancellation Rate',
            value: `${subscriptionStats.cancellationRate}%`,
            icon: XCircle,
            change: '-2%',
            trend: 'down',
            description: 'Lower is better'
        }
    ];

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
                onSearchChange={handleSearchChange}
                filters={
                    <>
                        <select
                            className={styles.filterSelect}
                            value={planFilter}
                            onChange={(e) => setPlanFilter(e.target.value)}
                            aria-label="Filter by plan"
                        >
                            <option value="all">All Plans</option>
                            <option value="basic">Basic</option>
                            <option value="pro">Pro</option>
                            <option value="enterprise">Enterprise</option>
                        </select>
                        <select
                            className={styles.filterSelect}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            aria-label="Filter by status"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="pending">Pending</option>
                        </select>
                    </>
                }
            />

            <main className={styles.content}>
                <AdminDataTable
                    columns={columns}
                    data={filteredSubscriptions}
                    className={styles.dataTable}
                />
            </main>
        </div>
    );
};

export default SubscriptionManagement;