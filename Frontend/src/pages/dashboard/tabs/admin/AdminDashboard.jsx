/**
 * @file AdminDashboard.jsx
 * @description Main Admin Dashboard Container
 * @author Sherif Talaat
 * @date 2026-02-06
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  ShieldAlert,
  CreditCard,
} from 'lucide-react';
import styles from './AdminDashboard.module.css';

import StatsGrid from '../../components/StatsGrid';
import RecentActivity from './components/Overview/RecentActivity';
import PendingActions from '../../components/PendingActions';
import SystemHealth from './components/Overview/SystemHealth';
import adminService from '../../../../services/adminService';

/**
 * Admin Dashboard Component
 * Manages navigation between sub-sections and displays high-level metrics.
 * @returns {JSX.Element} Rendered component
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  const handleExportReport = () => {
    navigate('/dashboard/reports');
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await adminService.getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('[AdminDashboard] Failed to fetch metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const adminMetrics = [
    {
      title: "Total Users",
      value: (metrics?.totalUsers ?? 0).toLocaleString(),
      change: metrics?.userGrowth ?? '+0%',
      icon: Users,
      trendType: (metrics?.userGrowth ?? '').includes('+') ? 'up' : 'down',
      description: "Registered users"
    },
    {
      title: "Total Revenue",
      value: `$${(metrics?.totalRevenue ?? 0).toLocaleString()}`,
      change: metrics?.revenueGrowth ?? '+0%',
      icon: CreditCard,
      trendType: (metrics?.revenueGrowth ?? '').includes('+') ? 'up' : 'down',
      description: "Monthly revenue"
    },
    {
      title: "Active Jobs",
      value: metrics?.activeJobs ?? 0,
      change: "+0",
      icon: FileText,
      trendType: "up",
      description: "Currently active"
    },
    {
      title: "Pending Moderation",
      value: metrics?.pendingModeration ?? 0,
      change: (metrics?.pendingModeration ?? 0) > 10 ? "+5" : "-2",
      icon: ShieldAlert,
      trendType: "down",
      description: "Items to review"
    }
  ];

  return (
    <div className={styles.adminOverview}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Admin Overview</h1>
          <p className={styles.subtitle}>Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className={styles.headerActions}>
          {/* Add actions if needed */}
          <button className={styles.actionBtn} onClick={handleExportReport}>Export Report</button>
        </div>
      </header>

      {isLoading ? (
        <div className={styles.loadingState}>Loading dashboard data...</div>
      ) : (
        <div className={styles.dashboardGrid}>
          {/* Section 1: Key Metrics */}
          <StatsGrid metrics={adminMetrics} />

          {/* Section 2: Main Content Layout */}
          <div className={styles.contentLayout}>
            {/* Left Column: Activity & Jobs */}
            <div className={styles.leftColumn}>
              <RecentActivity activities={metrics?.recentActivity || []} />
              {/* Placeholder for Recent Jobs or another large widget */}
            </div>

            {/* Right Column: Actions & Health */}
            <div className={styles.rightColumn}>
              <PendingActions
                mode="admin"
                actions={metrics?.pendingActions || []}
              />
              <SystemHealth healthData={metrics?.systemHealth || {}} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
