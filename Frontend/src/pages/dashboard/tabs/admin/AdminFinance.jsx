/**
 * @file AdminFinance.jsx
 * @description Finance operations page for withdrawals, refunds, and revenue overview.
 * @author OpenCode
 * @date 2026-06-22
 * @last-modified-by OpenCode
 * @last-modified-date 2026-06-22
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CreditCard, RefreshCw, Wallet } from 'lucide-react';
import AdminPageHeader from './components/shared/AdminPageHeader/AdminPageHeader';
import AdminToolbar from './components/shared/AdminToolbar/AdminToolbar';
import AdminDataTable from './components/shared/AdminDataTable';
import * as adminService from '../../../../services/adminService';
import styles from './AdminOperations.module.css';

const PAGE_SIZE = 10;

const AdminFinance = () => {
  const [summary, setSummary] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [view, setView] = useState('withdrawals');
  const [status, setStatus] = useState('Pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState('');

  const loadFinance = useCallback(async () => {
    const [summaryResult, withdrawalResult, refundResult] = await Promise.all([
      adminService.getFinanceSummary(),
      adminService.getWithdrawals(status === 'all' ? undefined : status),
      adminService.getRefunds(status === 'all' ? undefined : status),
    ]);
    setSummary(summaryResult.data);
    setWithdrawals(withdrawalResult.data || []);
    setRefunds(refundResult.data || []);
  }, [status]);

  useEffect(() => {
    loadFinance().catch(() => setMessage('Failed to load finance data'));
  }, [loadFinance]);

  const data = useMemo(() => {
    const source = view === 'withdrawals' ? withdrawals : refunds;
    const term = searchTerm.toLowerCase();
    return source.filter((item) => !term || JSON.stringify(item).toLowerCase().includes(term));
  }, [refunds, searchTerm, view, withdrawals]);

  const pagedData = data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));

  const updateStatus = async (id, nextStatus) => {
    if (view === 'withdrawals') await adminService.updateWithdrawalStatus(id, nextStatus);
    else await adminService.updateRefundStatus(id, nextStatus);
    setMessage(`${view === 'withdrawals' ? 'Withdrawal' : 'Refund'} updated to ${nextStatus}`);
    loadFinance();
  };

  const columns = view === 'withdrawals'
    ? [
      { header: 'ID', accessor: 'withdrawalRequestId' },
      { header: 'User', accessor: 'userEmail' },
      { header: 'Amount', accessor: 'amount', render: (row) => `$${Number(row.amount || 0).toLocaleString()}` },
      { header: 'Method', accessor: 'paymentMethod' },
      { header: 'Status', accessor: 'status', render: (row) => <span className={styles.badge}>{row.status}</span> },
      { header: 'Actions', sortable: false, render: (row) => <FinanceActions onChange={(next) => updateStatus(row.withdrawalRequestId, next)} statuses={['Processing', 'Approved', 'Rejected', 'Completed']} /> },
    ]
    : [
      { header: 'ID', accessor: 'refundRequestId' },
      { header: 'User', accessor: 'userEmail' },
      { header: 'Transaction', accessor: 'transactionId' },
      { header: 'Reason', accessor: 'reason' },
      { header: 'Status', accessor: 'status', render: (row) => <span className={styles.badge}>{row.status}</span> },
      { header: 'Actions', sortable: false, render: (row) => <FinanceActions onChange={(next) => updateStatus(row.refundRequestId, next)} statuses={['Approved', 'Rejected', 'Processed']} /> },
    ];

  return (
    <div className={styles.adminOperationsPage}>
      <AdminPageHeader title="Finance Operations" description="Review revenue, withdrawals, refunds, and finance queues." />
      <section className={styles.operationsGrid}>
        <Metric icon={CreditCard} label="Revenue" value={`$${Number(summary?.totalRevenue || 0).toLocaleString()}`} />
        <Metric icon={Wallet} label="Pending Withdrawals" value={`$${Number(summary?.pendingWithdrawals || 0).toLocaleString()}`} />
        <Metric icon={RefreshCw} label="Pending Refunds" value={summary?.pendingRefundCount || 0} />
      </section>
      <AdminToolbar
        searchPlaceholder="Search finance queue..."
        searchValue={searchTerm}
        onSearchChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }}
        filters={<div className={styles.toolbarActions}><select className={styles.select} value={view} onChange={(event) => setView(event.target.value)}><option value="withdrawals">Withdrawals</option><option value="refunds">Refunds</option></select><select className={styles.select} value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All Statuses</option><option value="Pending">Pending</option><option value="Processing">Processing</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option><option value="Completed">Completed</option><option value="Processed">Processed</option></select></div>}
      />
      {message && <p className={styles.statusMessage}>{message}</p>}
      <AdminDataTable columns={columns} data={pagedData} searchable={false} filterable={false} currentPage={currentPage} totalPages={totalPages} totalItems={data.length} onPageChange={setCurrentPage} pageSize={PAGE_SIZE} />
    </div>
  );
};

const Metric = ({ icon: Icon, label, value }) => <article className={styles.glassCard}><Icon size={22} /><p className={styles.metricLabel}>{label}</p><p className={styles.metricValue}>{value}</p></article>;
const FinanceActions = ({ statuses, onChange }) => <select className={styles.select} defaultValue="" onChange={(event) => event.target.value && onChange(event.target.value)}><option value="">Update</option>{statuses.map((item) => <option key={item} value={item}>{item}</option>)}</select>;

export default AdminFinance;
