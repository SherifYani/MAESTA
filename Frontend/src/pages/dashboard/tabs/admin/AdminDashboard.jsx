/**
 * @file AdminDashboard.jsx
 * @description Main Admin Dashboard Container
 * @author Sherif Talaat
 * @date 2026-02-06
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  FileText,
  ShieldAlert,
  CreditCard,
} from 'lucide-react';
import styles from './AdminDashboard.module.css';

import StatsGrid from '../../components/StatsGrid';
import RecentActivity from './components/Overview/RecentActivity';
import PendingActions from './components/Overview/PendingActions';
import SystemHealth from './components/Overview/SystemHealth';
import { adminStats, activitiesData, pendingActions, healthData } from './config/adminMockData';

/**
 * Admin Dashboard Component
 * Manages navigation between sub-sections and displays high-level metrics.
 * @returns {JSX.Element} Rendered component
 */
const AdminDashboard = () => {
  const { t } = useTranslation(['dashboards', 'common']);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const handleExportReport = () => {
    // Navigate to reports page or trigger export functionality
    navigate('/dashboard/admin/reports');
  };

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const adminMetrics = [
    {
      title: t('dashboards:admin.stats.totalUsers', 'Total Users'),
      value: adminStats.totalUsers.toLocaleString(),
      change: adminStats.userGrowth,
      icon: Users,
      trendType: adminStats.userGrowth.includes('+') ? 'up' : 'down',
      description: t('dashboards:admin.stats.registeredUsers', 'Registered users')
    },
    {
      title: t('dashboards:admin.stats.totalRevenue', 'Total Revenue'),
      value: `$${adminStats.totalRevenue.toLocaleString()}`,
      change: adminStats.revenueGrowth,
      icon: CreditCard,
      trendType: adminStats.revenueGrowth.includes('+') ? 'up' : 'down',
      description: t('dashboards:admin.stats.monthlyRevenue', 'Monthly revenue')
    },
    {
      title: t('dashboards:admin.stats.activeJobs', 'Active Jobs'),
      value: adminStats.activeJobs,
      change: "+5", // Mock change
      icon: FileText,
      trendType: "up",
      description: t('dashboards:admin.stats.currentlyActive', 'Currently active')
    },
    {
      title: t('dashboards:admin.stats.pendingModeration', 'Pending Moderation'),
      value: adminStats.pendingModeration,
      change: adminStats.pendingModeration > 10 ? "+5" : "-2",
      icon: ShieldAlert,
      trendType: "down",
      description: t('dashboards:admin.stats.itemsToReview', 'Items to review')
    }
  ];

  return (
    <div className={styles.adminOverview}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{t('dashboards:admin.title', 'Admin Overview')}</h1>
          <p className={styles.subtitle}>{t('dashboards:admin.subtitle', "Welcome back, Admin. Here's what's happening today.")}</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.actionBtn} onClick={handleExportReport}>{t('dashboards:admin.exportReport', 'Export Report')}</button>
        </div>
      </header>

      {isLoading ? (
        <div className={styles.loadingState}>{t('dashboards:common.loading', 'Loading your dashboard...')}</div>
      ) : (
        <div className={styles.dashboardGrid}>
          {/* Section 1: Key Metrics */}
          <StatsGrid metrics={adminMetrics} />

          {/* Section 2: Main Content Layout */}
          <div className={styles.contentLayout}>
            {/* Left Column: Activity & Jobs */}
            <div className={styles.leftColumn}>
              <RecentActivity activities={activitiesData} />
              {/* Placeholder for Recent Jobs or another large widget */}
            </div>

            {/* Right Column: Actions & Health */}
            <div className={styles.rightColumn}>
              <PendingActions actions={pendingActions} />
              <SystemHealth healthData={healthData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
