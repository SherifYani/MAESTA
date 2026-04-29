/**
 * @file AdminDashboard.jsx
 * @description Main Admin Dashboard Container
 * @author Sherif Talaat
 * @date 2026-02-06
 */

import React, { useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const adminMetrics = [
    {
      title: "Total Users",
      value: adminStats.totalUsers.toLocaleString(),
      change: adminStats.userGrowth,
      icon: Users,
      trendType: adminStats.userGrowth.includes('+') ? 'up' : 'down',
      description: "Registered users"
    },
    {
      title: "Total Revenue",
      value: `$${adminStats.totalRevenue.toLocaleString()}`,
      change: adminStats.revenueGrowth,
      icon: CreditCard,
      trendType: adminStats.revenueGrowth.includes('+') ? 'up' : 'down',
      description: "Monthly revenue"
    },
    {
      title: "Active Jobs",
      value: adminStats.activeJobs,
      change: "+5", // Mock change
      icon: FileText,
      trendType: "up",
      description: "Currently active"
    },
    {
      title: "Pending Moderation",
      value: adminStats.pendingModeration,
      change: adminStats.pendingModeration > 10 ? "+5" : "-2",
      icon: ShieldAlert,
      trendType: "down", // Assuming fewer is better or neutral
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
          <button className={styles.actionBtn}>Export Report</button>
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
