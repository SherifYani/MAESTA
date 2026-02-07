/**
 * @file TransactionList.jsx
 * @description Transaction history list component with filtering and export capabilities
 * @author Sherif Talaat
 * @date 2026-02-06
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-02-06
 */



import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Download, FileText, Filter, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import styles from './TransactionList.module.css';

/**
 * Transaction list component for displaying and filtering transaction history.
 * @returns {JSX.Element} Rendered transaction list component
 */
const TransactionList = () => {
    const { transactions = [] } = useSubscription();
    const [filter, setFilter] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    /**
     * Filter transactions based on selected filters and search query
     */
    const filteredTransactions = useMemo(() => {
        let result = [...transactions];

        // Apply type/status filter
        if (filter !== 'all') {
            result = result.filter(
                (transaction) => transaction.type === filter || transaction.status === filter
            );
        }

        // Apply search query filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (transaction) =>
                    transaction.description.toLowerCase().includes(query) ||
                    transaction.id.toLowerCase().includes(query)
            );
        }

        // Apply date range filter
        if (dateRange !== 'all') {
            const now = new Date();
            const cutoffDate = new Date();

            switch (dateRange) {
                case 'today':
                    cutoffDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    cutoffDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    cutoffDate.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    cutoffDate.setFullYear(now.getFullYear() - 1);
                    break;
                default:
                    break;
            }

            result = result.filter((transaction) => new Date(transaction.date) >= cutoffDate);
        }

        // Sort by date (newest first)
        return result.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [transactions, filter, searchQuery, dateRange]);

    /**
     * Formats date to readable format
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date string
     */
    const formatDate = useCallback((date) => {
        const transactionDate = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now - transactionDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Show relative time for recent transactions
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        }

        // Format date
        return transactionDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }, []);

    /**
     * Formats amount with proper currency formatting
     * @param {number} amount - Amount to format
     * @returns {Object} Formatted amount with sign and class
     */
    const formatAmount = useCallback((amount) => {
        const isNegative = amount < 0;
        const absoluteAmount = Math.abs(amount);
        const formatted = absoluteAmount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        return {
            display: `${isNegative ? '-' : '+'}$${formatted}`,
            isNegative,
            value: amount,
        };
    }, []);

    /**
     * Gets transaction type label
     * @param {string} type - Transaction type
     * @returns {string} Human-readable type label
     */
    const getTypeLabel = useCallback((type) => {
        const typeMap = {
            payment: 'Payment Received',
            withdrawal: 'Withdrawal',
            commission: 'Platform Commission',
            refund: 'Refund',
            deposit: 'Deposit',
        };

        return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
    }, []);

    /**
     * Gets transaction icon based on type
     * @param {string} type - Transaction type
     * @returns {React.ElementType} Icon component
     */
    const getTransactionIcon = useCallback((type) => {
        const iconMap = {
            payment: ArrowDownRight,
            withdrawal: ArrowUpRight,
            commission: FileText,
            refund: ArrowUpRight,
            deposit: ArrowDownRight,
        };

        return iconMap[type] || FileText;
    }, []);

    /**
     * Handles export of transaction data
     */
    const handleExport = useCallback(() => {
        const csvContent = [
            ['Date', 'Type', 'Description', 'Amount', 'Status', 'Transaction ID'].join(','),
            ...filteredTransactions.map((t) =>
                [
                    new Date(t.date).toISOString(),
                    t.type,
                    t.description,
                    formatAmount(t.amount).display,
                    t.status,
                    t.id,
                ].join(',')
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [filteredTransactions, formatAmount]);

    /**
     * Renders filter buttons
     */
    const renderFilterButtons = () => {
        const filters = [
            { id: 'all', label: 'All Transactions' },
            { id: 'payment', label: 'Payments' },
            { id: 'withdrawal', label: 'Withdrawals' },
            { id: 'commission', label: 'Commissions' },
            { id: 'completed', label: 'Completed' },
            { id: 'pending', label: 'Pending' },
        ];

        return filters.map((filterOption) => (
            <button
                key={filterOption.id}
                type="button"
                className={`${styles.filterButton} ${filter === filterOption.id ? styles.filterButtonActive : ''
                    }`}
                onClick={() => setFilter(filterOption.id)}
                aria-pressed={filter === filterOption.id}
                aria-label={`Filter by ${filterOption.label}`}
            >
                {filterOption.label}
            </button>
        ));
    };

    /**
     * Renders date range filters
     */
    const renderDateRangeFilters = () => {
        const dateRanges = [
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'Last 7 Days' },
            { id: 'month', label: 'Last 30 Days' },
            { id: 'year', label: 'Last Year' },
        ];

        return (
            <div className={styles.dateRangeFilter}>
                <Calendar size={16} className={styles.dateRangeIcon} />
                <select
                    className={styles.dateRangeSelect}
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    aria-label="Select date range"
                >
                    {dateRanges.map((range) => (
                        <option key={range.id} value={range.id}>
                            {range.label}
                        </option>
                    ))}
                </select>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Transaction History</h1>
                    <p className={styles.subtitle}>
                        View all your payment and withdrawal transactions
                    </p>
                </div>

                {/* Export Button */}
                <button
                    type="button"
                    className={styles.exportButton}
                    onClick={handleExport}
                    disabled={filteredTransactions.length === 0}
                    aria-label="Export transactions as CSV"
                >
                    <Download size={20} className={styles.exportIcon} />
                    <span>Export CSV</span>
                </button>
            </header>

            {/* Controls */}
            <div className={styles.controls}>
                {/* Search */}
                <div className={styles.searchContainer}>
                    <input
                        type="search"
                        className={styles.searchInput}
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search transactions"
                    />
                </div>

                {/* Date Range Filter */}
                {renderDateRangeFilters()}

                {/* Filter Indicator */}
                <div className={styles.filterIndicator}>
                    <Filter size={16} className={styles.filterIcon} />
                    <span className={styles.filterLabel}>
                        {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Filters */}
            <nav className={styles.filters} aria-label="Transaction filters">
                {renderFilterButtons()}
            </nav>

            {/* Transactions List */}
            <section className={styles.transactionsSection}>
                {filteredTransactions.length > 0 ? (
                    <div className={styles.transactionsList} role="list">
                        {filteredTransactions.map((transaction) => {
                            const Icon = getTransactionIcon(transaction.type);
                            const amountInfo = formatAmount(transaction.amount);
                            const typeLabel = getTypeLabel(transaction.type);

                            return (
                                <article
                                    key={transaction.id}
                                    className={`${styles.transactionCard} ${styles[`transactionCard--${transaction.type}`]
                                        }`}
                                    role="listitem"
                                    aria-label={`${typeLabel}: ${amountInfo.display}`}
                                >
                                    {/* Transaction Header */}
                                    <div className={styles.transactionHeader}>
                                        <div className={styles.transactionIcon}>
                                            <Icon
                                                size={20}
                                                className={styles.transactionIconSvg}
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <div className={styles.transactionInfo}>
                                            <h3 className={styles.transactionDescription}>
                                                {transaction.description}
                                            </h3>
                                            <div className={styles.transactionMeta}>
                                                <span className={styles.transactionType}>{typeLabel}</span>
                                                <time
                                                    className={styles.transactionDate}
                                                    dateTime={transaction.date}
                                                >
                                                    {formatDate(transaction.date)}
                                                </time>
                                            </div>
                                        </div>
                                        <div
                                            className={`${styles.transactionAmount} ${amountInfo.isNegative ? styles.amountNegative : styles.amountPositive
                                                }`}
                                        >
                                            {amountInfo.display}
                                        </div>
                                    </div>

                                    {/* Transaction Footer */}
                                    <div className={styles.transactionFooter}>
                                        <div className={styles.transactionIdContainer}>
                                            <span className={styles.transactionIdLabel}>Transaction ID:</span>
                                            <code className={styles.transactionId}>{transaction.id}</code>
                                        </div>
                                        <div className={styles.transactionActions}>
                                            <span
                                                className={`${styles.statusBadge} ${styles[`statusBadge--${transaction.status}`]
                                                    }`}
                                                aria-label={`Status: ${transaction.status}`}
                                            >
                                                {transaction.status}
                                            </span>
                                            {transaction.invoiceUrl && (
                                                <a
                                                    href={transaction.invoiceUrl}
                                                    className={styles.invoiceLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={`Download invoice for ${transaction.id}`}
                                                >
                                                    <FileText size={16} className={styles.invoiceIcon} />
                                                    <span>Invoice</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty State */
                    <div className={styles.emptyState} role="status">
                        <div className={styles.emptyIcon}>
                            <FileText size={64} className={styles.emptyIconSvg} aria-hidden="true" />
                        </div>
                        <h2 className={styles.emptyTitle}>No Transactions Found</h2>
                        <p className={styles.emptyText}>
                            {searchQuery || filter !== 'all' || dateRange !== 'all'
                                ? 'No transactions match your current filters. Try adjusting your search or filters.'
                                : 'You haven’t made any transactions yet. Transactions will appear here once you start earning.'}
                        </p>
                        {(searchQuery || filter !== 'all' || dateRange !== 'all') && (
                            <button
                                type="button"
                                className={styles.clearFiltersButton}
                                onClick={() => {
                                    setFilter('all');
                                    setDateRange('all');
                                    setSearchQuery('');
                                }}
                                aria-label="Clear all filters"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                )}
            </section>

            {/* Footer Summary */}
            {filteredTransactions.length > 0 && (
                <footer className={styles.footer}>
                    <div className={styles.summary}>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Total Transactions:</span>
                            <span className={styles.summaryValue}>{filteredTransactions.length}</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Total Amount:</span>
                            <span className={styles.summaryValue}>
                                ${filteredTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
};

TransactionList.propTypes = {
    // Context props validation
    transactions: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            type: PropTypes.oneOf(['payment', 'withdrawal', 'commission', 'refund', 'deposit'])
                .isRequired,
            description: PropTypes.string.isRequired,
            amount: PropTypes.number.isRequired,
            date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
            status: PropTypes.oneOf(['completed', 'pending', 'failed', 'processing']).isRequired,
            invoiceUrl: PropTypes.string,
        })
    ),
};

TransactionList.defaultProps = {
    transactions: [],
};

export default TransactionList;