/**
 * @file BillingPage.jsx
 * @description Billing & Wallet page — shows account balance, recent transactions,
 *              saved payment methods, linked bank accounts, and current subscription.
 *              All sections call real PaymentsController and Subscriptions backend APIs.
 * @author Sherif Talaat
 * @date 2026-06-17
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2026-06-17
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Wallet, CreditCard, ArrowDownLeft, ArrowUpRight,
    Building2, BadgeCheck, Plus, Trash2, RefreshCw, ChevronRight
} from 'lucide-react';
import paymentService from '../../../../../services/paymentService';
import styles from './BillingPage.module.css';

// ─── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Format a numeric value as a USD currency string.
 * @param {number} amount
 * @returns {string}
 */
const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount ?? 0);

/**
 * Format an ISO date string as a short locale date.
 * @param {string} dateStr
 * @returns {string}
 */
const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// ─── Section Header ──────────────────────────────────────────────────────────────

/**
 * Consistent section header used across all cards.
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Lucide icon.
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {React.ReactNode} [props.action] - Optional action button on the right.
 * @returns {JSX.Element}
 */
const SectionHeader = ({ icon, title, subtitle, action }) => (
    <div className={styles.sectionHeader}>
        <div className={styles.sectionHeader__left}>
            <div className={styles.sectionHeader__icon}>{icon}</div>
            <div>
                <h2 className={styles.sectionHeader__title}>{title}</h2>
                {subtitle && <p className={styles.sectionHeader__subtitle}>{subtitle}</p>}
            </div>
        </div>
        {action && <div className={styles.sectionHeader__action}>{action}</div>}
    </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────────

/**
 * BillingPage — a shared dashboard page for all user roles.
 * @returns {JSX.Element}
 */
const BillingPage = () => {
    // Balance
    const [balance, setBalance] = useState(null);
    const [isLoadingBalance, setIsLoadingBalance] = useState(true);

    console.log('BillingPage component mounted');

    // Transactions
    const [transactions, setTransactions] = useState([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
    const [txPage, setTxPage] = useState(1);
    const [txTotal, setTxTotal] = useState(0);

    // Payment Methods
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [isLoadingMethods, setIsLoadingMethods] = useState(true);

    // Bank Accounts
    const [bankAccounts, setBankAccounts] = useState([]);
    const [isLoadingBanks, setIsLoadingBanks] = useState(true);

    // Subscription
    const [subscription, setSubscription] = useState(null);
    const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

    // Global error state
    const [globalError, setGlobalError] = useState('');

    // ─── Data loaders ─────────────────────────────────────────────────────────

    const loadBalance = useCallback(async () => {
        setIsLoadingBalance(true);
        try {
            const data = await paymentService.getBalance();
            setBalance(data);
        } catch {
            setGlobalError('Some data could not be loaded. Please refresh.');
        } finally {
            setIsLoadingBalance(false);
        }
    }, []);

    const loadTransactions = useCallback(async (page = 1) => {
        setIsLoadingTransactions(true);
        try {
            const data = await paymentService.getTransactions({ page, limit: 10 });
            const items = data?.items || data || [];
            const total = data?.total ?? items.length;
            setTransactions(items);
            setTxTotal(total);
        } catch {
            setTransactions([]);
        } finally {
            setIsLoadingTransactions(false);
        }
    }, []);

    const loadPaymentMethods = useCallback(async () => {
        setIsLoadingMethods(true);
        try {
            const data = await paymentService.getPaymentMethods();
            setPaymentMethods(Array.isArray(data) ? data : []);
        } catch {
            setPaymentMethods([]);
        } finally {
            setIsLoadingMethods(false);
        }
    }, []);

    const loadBankAccounts = useCallback(async () => {
        setIsLoadingBanks(true);
        try {
            const response = await paymentService.getBankAccounts();
            setBankAccounts(Array.isArray(response) ? response : []);
        } catch {
            setBankAccounts([]);
        } finally {
            setIsLoadingBanks(false);
        }
    }, []);

    const loadSubscription = useCallback(async () => {
        setIsLoadingSubscription(true);
        try {
            const data = await paymentService.getCurrentSubscription();
            setSubscription(data);
        } catch {
            setSubscription(null);
        } finally {
            setIsLoadingSubscription(false);
        }
    }, []);

    useEffect(() => {
        loadBalance();
        loadTransactions(1);
        loadPaymentMethods();
        loadBankAccounts();
        loadSubscription();
    }, [loadBalance, loadTransactions, loadPaymentMethods, loadBankAccounts, loadSubscription]);

    // ─── Actions ──────────────────────────────────────────────────────────────

    /**
     * Remove a saved payment method.
     * @param {number} methodId
     */
    const handleRemoveMethod = async (methodId) => {
        try {
            await paymentService.removePaymentMethod(methodId);
            setPaymentMethods(prev => prev.filter(m => m.id !== methodId));
        } catch {
            setGlobalError('Failed to remove payment method.');
        }
    };

    /**
     * Handle page change for transaction history.
     * @param {number} newPage
     */
    const handleTxPageChange = (newPage) => {
        setTxPage(newPage);
        loadTransactions(newPage);
    };

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Determine transaction direction icon.
     * @param {string} type - Transaction type string from backend.
     * @returns {JSX.Element}
     */
    const getTxIcon = (type) => {
        const incomingTypes = ['deposit', 'refund', 'earning', 'release'];
        const isIncoming = incomingTypes.some(t => type?.toLowerCase().includes(t));
        return isIncoming
            ? <ArrowDownLeft size={16} className={styles.tx__iconIn} />
            : <ArrowUpRight size={16} className={styles.tx__iconOut} />;
    };

    const txTotalPages = Math.ceil(txTotal / 10);

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className={styles.page}>
            <div className={styles.page__bg} aria-hidden="true" />

            {/* Page Header */}
            <div className={styles.page__header}>
                <h1 className={styles.page__title}>Billing & Wallet</h1>
                <p className={styles.page__subtitle}>Manage your balance, payment methods, and subscription.</p>
            </div>

            {/* Global Error */}
            {globalError && (
                <div className={styles.globalError} role="alert">
                    {globalError}
                    <button type="button" className={styles.globalError__dismiss} onClick={() => setGlobalError('')}>✕</button>
                </div>
            )}

            {/* ── Wallet Balance Card ── */}
            <div className={`${styles.card} ${styles['card--balance']}`}>
                <SectionHeader
                    icon={<Wallet size={22} />}
                    title="Wallet Balance"
                    subtitle="Your current available balance"
                    action={
                        <button type="button" className={styles.btn__icon} onClick={loadBalance} aria-label="Refresh balance">
                            <RefreshCw size={16} />
                        </button>
                    }
                />
                {isLoadingBalance ? (
                    <div className={styles.skeleton} aria-label="Loading balance" />
                ) : (
                    <div className={styles.balance__grid}>
                        <div className={styles.balance__item}>
                            <span className={styles.balance__label}>Available</span>
                            <span className={styles.balance__value}>{formatCurrency(balance?.available ?? balance?.balance)}</span>
                        </div>
                        {balance?.pending !== undefined && (
                            <div className={styles.balance__item}>
                                <span className={styles.balance__label}>Pending</span>
                                <span className={styles.balance__value}>{formatCurrency(balance.pending)}</span>
                            </div>
                        )}
                        {balance?.totalEarnings !== undefined && (
                            <div className={styles.balance__item}>
                                <span className={styles.balance__label}>Total Earned</span>
                                <span className={styles.balance__value}>{formatCurrency(balance.totalEarnings)}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Subscription Card ── */}
            <div className={styles.card}>
                <SectionHeader
                    icon={<BadgeCheck size={22} />}
                    title="Current Subscription"
                    subtitle="Your active plan details"
                    action={
                        <Link to="/subscription/plans" className={styles.btn__link}>
                            Upgrade <ChevronRight size={14} />
                        </Link>
                    }
                />
                {isLoadingSubscription ? (
                    <div className={styles.skeleton} />
                ) : subscription ? (
                    <div className={styles.subscription__row}>
                        <div className={styles.subscription__info}>
                            <p className={styles.subscription__plan}>{subscription.planName || subscription.plan || 'Active Plan'}</p>
                            <p className={styles.subscription__meta}>
                                Renews on {formatDate(subscription.renewalDate || subscription.expiresAt)}
                            </p>
                        </div>
                        <span className={`${styles.badge} ${styles['badge--success']}`}>Active</span>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <p>No active subscription.</p>
                        <Link to="/subscription/plans" className={styles.btn__primary}>View Plans</Link>
                    </div>
                )}
            </div>

            {/* ── Transaction History ── */}
            <div className={styles.card}>
                <SectionHeader
                    icon={<ArrowDownLeft size={22} />}
                    title="Transaction History"
                    subtitle="Your recent payments and earnings"
                />
                {isLoadingTransactions ? (
                    <div className={styles.skeleton} style={{ height: '160px' }} />
                ) : transactions.length === 0 ? (
                    <div className={styles.emptyState}>
                        <ArrowDownLeft size={36} className={styles.emptyState__icon} />
                        <p>No transactions yet.</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.txTable}>
                            {/* Table Header */}
                            <div className={`${styles.txRow} ${styles['txRow--header']}`}>
                                <span>Type</span>
                                <span>Description</span>
                                <span>Date</span>
                                <span className={styles.txRow__amount}>Amount</span>
                                <span>Status</span>
                            </div>
                            {/* Table Rows */}
                            {transactions.map((tx, idx) => (
                                <div key={tx.transactionId || tx.id || idx} className={styles.txRow}>
                                    <div className={styles.tx__typeCell}>
                                        {getTxIcon(tx.type)}
                                        <span>{tx.type || '—'}</span>
                                    </div>
                                    <span className={styles.tx__desc}>{tx.description || tx.notes || '—'}</span>
                                    <span>{formatDate(tx.createdAt || tx.date)}</span>
                                    <span className={`${styles.txRow__amount} ${tx.amount >= 0 ? styles['tx--positive'] : styles['tx--negative']}`}>
                                        {formatCurrency(Math.abs(tx.amount))}
                                    </span>
                                    <span className={`${styles.badge} ${styles[`badge--${tx.status?.toLowerCase() || 'default'}`]}`}>
                                        {tx.status || '—'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {txTotalPages > 1 && (
                            <div className={styles.pagination}>
                                <button
                                    type="button"
                                    className={styles.pagination__btn}
                                    disabled={txPage === 1}
                                    onClick={() => handleTxPageChange(txPage - 1)}
                                >
                                    Previous
                                </button>
                                <span className={styles.pagination__info}>Page {txPage} of {txTotalPages}</span>
                                <button
                                    type="button"
                                    className={styles.pagination__btn}
                                    disabled={txPage === txTotalPages}
                                    onClick={() => handleTxPageChange(txPage + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── Payment Methods ── */}
            <div className={styles.card}>
                <SectionHeader
                    icon={<CreditCard size={22} />}
                    title="Payment Methods"
                    subtitle="Saved cards for deposits and payments"
                    action={
                        <button type="button" className={styles.btn__outline}>
                            <Plus size={15} /> Add Card
                        </button>
                    }
                />
                {isLoadingMethods ? (
                    <div className={styles.skeleton} />
                ) : paymentMethods.length === 0 ? (
                    <div className={styles.emptyState}>
                        <CreditCard size={36} className={styles.emptyState__icon} />
                        <p>No payment methods saved.</p>
                    </div>
                ) : (
                    <ul className={styles.methodsList}>
                        {paymentMethods.map((method) => (
                            <li key={method.id} className={styles.methodItem}>
                                <CreditCard size={20} className={styles.methodItem__icon} />
                                <div className={styles.methodItem__info}>
                                    <p className={styles.methodItem__name}>
                                        {method.brand || 'Card'} •••• {method.last4 || '****'}
                                    </p>
                                    <p className={styles.methodItem__meta}>
                                        Expires {method.expMonth}/{method.expYear}
                                    </p>
                                </div>
                                {method.isDefault && (
                                    <span className={`${styles.badge} ${styles['badge--info']}`}>Default</span>
                                )}
                                <button
                                    type="button"
                                    className={styles.btn__iconDanger}
                                    onClick={() => handleRemoveMethod(method.id)}
                                    aria-label={`Remove card ending in ${method.last4}`}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* ── Bank Accounts ── */}
            <div className={styles.card}>
                <SectionHeader
                    icon={<Building2 size={22} />}
                    title="Bank Accounts"
                    subtitle="Linked accounts for withdrawals"
                    action={
                        <button type="button" className={styles.btn__outline}>
                            <Plus size={15} /> Link Account
                        </button>
                    }
                />
                {isLoadingBanks ? (
                    <div className={styles.skeleton} />
                ) : bankAccounts.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Building2 size={36} className={styles.emptyState__icon} />
                        <p>No bank accounts linked.</p>
                    </div>
                ) : (
                    <ul className={styles.methodsList}>
                        {bankAccounts.map((account) => (
                            <li key={account.id} className={styles.methodItem}>
                                <Building2 size={20} className={styles.methodItem__icon} />
                                <div className={styles.methodItem__info}>
                                    <p className={styles.methodItem__name}>{account.bankName || 'Bank Account'}</p>
                                    <p className={styles.methodItem__meta}>•••• {account.last4 || '****'}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default BillingPage;
