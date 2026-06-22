/**
 * @file AdminHealth.jsx
 * @description Platform health and operational status page.
 * @author OpenCode
 * @date 2026-06-22
 * @last-modified-by OpenCode
 * @last-modified-date 2026-06-22
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Activity, AlertCircle, CheckCircle, Database, ShieldCheck, Users } from 'lucide-react';
import AdminPageHeader from './components/shared/AdminPageHeader/AdminPageHeader';
import * as adminService from '../../../../services/adminService';
import styles from './AdminOperations.module.css';

const AdminHealth = () => {
  const [health, setHealth] = useState(null);
  const [message, setMessage] = useState('');

  const loadHealth = useCallback(async () => {
    const result = await adminService.getHealth();
    setHealth(result.data);
    setMessage(`Last checked ${new Date(result.data.checkedAt).toLocaleString()}`);
  }, []);

  useEffect(() => { loadHealth().catch(() => setMessage('Health check failed')); }, [loadHealth]);

  return (
    <div className={styles.adminOperationsPage}>
      <AdminPageHeader title="System Health" description="Monitor API, database, users, reports, and pending operational queues." actions={<button className={styles.button} onClick={loadHealth}>Refresh</button>} />
      <section className={styles.operationsGrid}>
        <Metric icon={Activity} label="API Status" value={health?.api || 'Unknown'} description="Backend service availability" />
        <Metric icon={Database} label="Database Status" value={health?.database || 'Unknown'} description="SQL Server connectivity" />
        <Metric icon={Users} label="Total Users" value={health?.totalUsers ?? 0} description={`${health?.activeUsers ?? 0} active accounts`} />
        <Metric icon={ShieldCheck} label="Pending Reports" value={health?.pendingReports ?? 0} description="Moderation queue" />
        <Metric icon={Activity} label="Total Jobs" value={health?.totalJobs ?? 0} description={`${health?.activeJobs ?? 0} active jobs`} />
        <Metric icon={Database} label="Total Revenue" value={`$${Number(health?.totalRevenue || 0).toLocaleString()}`} description="Completed payments" />
      </section>
      <section className={styles.glassCard}>
        <div className={styles.healthSummary}>
          {(health?.database || '').toLowerCase() === 'operational' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <div>
            <p className={styles.metricLabel}>Pending approvals</p>
            <p className={styles.metricValue}>{health?.pendingApprovals ?? 0}</p>
            <p className={styles.statusMessage}>Pending withdrawals: {health?.pendingWithdrawals ?? 0} | Pending refunds: {health?.pendingRefunds ?? 0} | Projects: {health?.totalProjects ?? 0}</p>
          </div>
        </div>
        {message && <p className={styles.statusMessage}>{message}</p>}
      </section>
    </div>
  );
};

const Metric = ({ icon: Icon, label, value, description }) => <article className={styles.glassCard}><Icon size={22} /><p className={styles.metricLabel}>{label}</p><p className={styles.metricValue}>{value}</p>{description && <p className={styles.statusMessage}>{description}</p>}</article>;

export default AdminHealth;
