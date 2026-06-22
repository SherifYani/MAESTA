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
import PendingActions from './components/Overview/PendingActions';
import SystemHealth from './components/Overview/SystemHealth';
import { getAdminStats, getActivitiesData, getPendingActionsData, getHealthData } from './config/adminDataService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminStats, setAdminStats] = useState(null);
  const [activitiesData, setActivitiesData] = useState([]);
  const [pendingActions, setPendingActions] = useState([]);
  const [healthData, setHealthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleExportReport = () => {
    navigate('/dashboard/admin/reports');
  };

  useEffect(() => {
    Promise.all([
      getAdminStats(),
      getActivitiesData(),
      getPendingActionsData(),
      getHealthData()
    ]).then(([stats, activities, pending, health]) => {
      setAdminStats(stats);
      setActivitiesData(activities);
      setPendingActions(pending);
      setHealthData(health);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  if (!adminStats) return null;

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
      change: adminStats.activeJobsChange || "0",
      icon: FileText,
      trendType: adminStats.activeJobsChange?.includes('-') ? "down" : "up",
      description: "Currently active"
    },
    {
      title: "Pending Moderation",
      value: adminStats.pendingModeration,
      change: adminStats.pendingModerationChange || "0",
      icon: ShieldAlert,
      trendType: adminStats.pendingModerationChange?.includes('-') ? "down" : "up",
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
