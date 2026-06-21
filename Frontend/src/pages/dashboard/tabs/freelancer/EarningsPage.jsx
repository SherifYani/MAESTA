/**
 * @file EarningsPage.jsx
 * @description Earnings and transaction management page for Freelancers.
 *              Allows viewing wallet balance, transaction history, and requesting payouts.
 * @author Antigravity
 * @date 2026-06-20
 *
 * @last-modified-by Antigravity
 * @last-modified-date 2026-06-20
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  DollarSign, ArrowUpRight, ArrowDownLeft, Calendar, 
  Clock, ShieldAlert, CreditCard, ChevronRight, Activity 
} from 'lucide-react';
import paymentService from '../../../../services/paymentService';
import { LoadingSpinner, Alert, Button } from '../../../../components/common';
import styles from './EarningsPage.module.css';

/**
 * EarningsPage component.
 * Displays freelancer's financial stats, transactions, and withdrawal requests.
 * @returns {JSX.Element} The rendered Earnings page.
 */
const EarningsPage = () => {
  const [balance, setBalance] = useState({ available: 0, pending: 0, totalEarnings: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Withdrawal form state
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('paypal');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(null);
  const [withdrawError, setWithdrawError] = useState(null);

  /**
   * Fetch balance and transaction data from payments service.
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const balanceData = await paymentService.getBalance();
      const transactionData = await paymentService.getTransactions({ page: 1, limit: 20 });
      
      // Calculate pending / totals from transactions
      const txs = transactionData?.items || transactionData || [];
      const totalEarned = txs
        .filter(t => t.type === 'deposit' || t.type === 'payment')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
        
      setBalance({
        available: balanceData?.balance || balanceData?.available || 0,
        pending: txs.filter(t => t.status === 'pending').reduce((sum, t) => sum + (t.amount || 0), 0),
        totalEarnings: totalEarned || balanceData?.totalEarnings || 0
      });
      
      setTransactions(txs);
    } catch (err) {
      console.error('Error fetching financial data:', err);
      setError('Failed to fetch financial records. Please try again.');
      
      // Fallback fallback mock data in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock financial data in development mode.');
        setBalance({
          available: 3420.50,
          pending: 450.00,
          totalEarnings: 8900.00
        });
        setTransactions([
          {
            id: 'tx_001',
            description: 'Escrow Release: Landing Page UI/UX Design',
            amount: 800.00,
            type: 'deposit',
            status: 'completed',
            createdAt: '2026-06-18T11:22:33Z'
          },
          {
            id: 'tx_002',
            description: 'Withdrawal to PayPal (payouts@example.com)',
            amount: 1500.00,
            type: 'withdrawal',
            status: 'completed',
            createdAt: '2026-06-15T09:15:00Z'
          },
          {
            id: 'tx_003',
            description: 'Escrow Deposit: Python Web Scraping Script',
            amount: 450.00,
            type: 'deposit',
            status: 'pending',
            createdAt: '2026-06-19T14:30:00Z'
          },
          {
            id: 'tx_004',
            description: 'Hourly Payment Week Ending June 7',
            amount: 1200.00,
            type: 'deposit',
            status: 'completed',
            createdAt: '2026-06-08T10:00:00Z'
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Handle withdrawal submission.
   * @param {React.FormEvent} e - Form event.
   */
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawSuccess(null);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setWithdrawError('Please enter a valid positive amount.');
      return;
    }

    if (numericAmount > balance.available) {
      setWithdrawError('Withdrawal amount exceeds your available balance.');
      return;
    }

    try {
      setWithdrawLoading(true);
      await paymentService.requestWithdrawal(numericAmount, method);
      
      setWithdrawSuccess(`Successfully requested withdrawal of $${numericAmount.toFixed(2)}.`);
      setAmount('');
      
      // Refresh balance and transaction details
      fetchData();
    } catch (err) {
      setWithdrawError(err.message || 'Failed to submit withdrawal request.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Earnings Dashboard</h1>
          <p className={styles.subtitle}>View your balances, monitor payouts, and request withdrawals</p>
        </div>
      </header>

      {error && <Alert type="error" message={error} className="mb-6" />}

      {/* Metrics Cards */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricContent}>
            <div className={styles.metricLabel}>Total Earnings</div>
            <div className={styles.metricValue}>${balance.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className={styles.metricIcon}>
            <DollarSign size={24} />
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricContent}>
            <div className={styles.metricLabel}>Available Balance</div>
            <div className={styles.metricValue}>${balance.available.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className={styles.metricIcon}>
            <ArrowUpRight size={24} />
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricContent}>
            <div className={styles.metricLabel}>Pending Escrow</div>
            <div className={styles.metricValue}>${balance.pending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className={styles.metricIcon}>
            <Clock size={24} />
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Transaction History Section */}
        <section className={styles.transactionsCard}>
          <h2 className={styles.sectionTitle}>
            <Activity size={20} />
            Transaction History
          </h2>

          <div className={styles.tableContainer}>
            {transactions.length === 0 ? (
              <div className={styles.emptyState}>No transactions recorded.</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Description</th>
                    <th className={styles.th}>Date</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const isWithdrawal = tx.type === 'withdrawal' || tx.amount < 0;
                    return (
                      <tr key={tx.id || Math.random()} className={styles.tr}>
                        <td className={styles.td}>{tx.description || 'General Transaction'}</td>
                        <td className={styles.td}>{formatDate(tx.createdAt || tx.timestamp)}</td>
                        <td className={styles.td}>
                          <span className={`${styles.transStatus} ${styles[tx.status?.toLowerCase() || 'pending']}`}>
                            {tx.status || 'Pending'}
                          </span>
                        </td>
                        <td className={`${styles.td} ${styles.amount} ${isWithdrawal ? styles.withdrawal : styles.deposit}`}>
                          {isWithdrawal ? '-' : '+'}${Math.abs(tx.amount || 0).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Withdrawal Section */}
        <section className={styles.withdrawCard}>
          <h2 className={styles.sectionTitle}>
            <CreditCard size={20} />
            Request Payout
          </h2>

          {withdrawSuccess && <Alert type="success" message={withdrawSuccess} className="mb-4" />}
          {withdrawError && <Alert type="error" message={withdrawError} className="mb-4" />}

          <form onSubmit={handleWithdrawSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="withdraw-amount">Amount to Withdraw</label>
              <div className={styles.inputGroup}>
                <DollarSign className={styles.inputIcon} size={16} />
                <input
                  id="withdraw-amount"
                  type="number"
                  step="0.01"
                  min="1"
                  max={balance.available}
                  className={styles.input}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <span className={styles.helperText}>
                Available for withdrawal: ${balance.available.toFixed(2)}
              </span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="withdraw-method">Withdrawal Method</label>
              <select
                id="withdraw-method"
                className={styles.select}
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                required
              >
                <option value="paypal">PayPal</option>
                <option value="bank">Bank Transfer</option>
                <option value="stripe">Stripe Connect</option>
              </select>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={withdrawLoading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance.available}
            >
              {withdrawLoading ? 'Processing Request...' : 'Withdraw Funds'}
              <ChevronRight size={16} />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default EarningsPage;
