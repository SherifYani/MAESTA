/**
 * @file ClientDashboard.jsx - Enhanced Version
 * @description Improved client dashboard with clean layout and compact data
 * @author Sherif Talaat
 * @version 6.0.0
 * @date 2026-01-29
 *
 * @last-modified-by Antigravity (AI)
 * @last-modified-date 2026-05-01
 * @changes
 * - Phase 1: jobPosts (gigs) now fetched from real gigService API
 */

import React, { useState, useEffect, useCallback } from 'react';
import gigService from '../../../../services/gigService';
import dashboardService from '../../../../services/dashboardService';
import StatsGrid from "../../components/StatsGrid";
import RecentActivity from "../../components/RecentActivity";
import PendingActions from "../../components/PendingActions";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import CompactJobCard from "../../components/shared/CompactJobCard";
import BudgetOverviewWidget from "./components/BudgetOverviewWidget";

import {
  ROLES,
  ROLE_METRICS,
} from "../../config/dashboard.config";
import {
  Plus,
  Users,
  DollarSign,
  Calendar,
  Target,
  Award,
  BarChart3,
  CheckCircle,
  ArrowUpRight,
  Briefcase,
  Clock,
} from "lucide-react";
import styles from "./ClientDashboard.module.css";

/**
 * Enhanced ClientDashboard - Clean, No Nested Cards
 */
const ClientDashboard = () => {
  // Live API data
  const [jobPosts,   setJobPosts]   = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [dashData,   setDashData]   = useState(null);

  // Safe defaults — populated from API once loaded
  const activities         = dashData?.activities          || [];
  const pendingActions     = dashData?.pendingActions      || [];
  const earningsData       = dashData?.earningsData        || null;
  const performanceMetrics = dashData?.performanceMetrics  || null;

  // ── Fetch client dashboard data on mount ──────────────────────────
  const fetchDashboardData = useCallback(async () => {
    try {
      const raw = await dashboardService.getClientDashboard();
      setDashData(raw);
    } catch (err) {
      console.error('[ClientDashboard] Failed to fetch dashboard data:', err);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  // ── Fetch client gigs on mount ───────────────────────────────────
  const fetchGigs = useCallback(async () => {
    try {
      const raw = await gigService.getMyGigs();
      const items = Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? []);
      // Normalise gig shape to what CompactJobCard expects
      setJobPosts(items.map(g => ({
        ...g,
        id:       g.id        || g.gigId,
        title:    g.title     || g.gigTitle || 'Untitled Gig',
        company:  g.company   || g.clientName || 'My Gig',
        location: g.location  || g.gigLocation || 'Remote',
        status:   g.status    || 'active',
        type:     g.type      || g.projectType || 'Freelance',
      })));
    } catch (err) {
      console.error('[ClientDashboard] Failed to fetch gigs:', err);
      // Fall back to static mock data
      setJobPosts([]);
    } finally {
      setApiLoading(false);
    }
  }, []);

  useEffect(() => { fetchGigs(); }, [fetchGigs]);

  // Calculate budget data
  const budgetSpent = earningsData?.totalSpent || "$42,580";
  const monthlyBudget =
    ROLE_METRICS[ROLES.CLIENT]?.metrics?.[1]?.targetValue || "$50,000";

  const spentValue = parseFloat(budgetSpent.replace(/[^0-9.]/g, ""));
  const monthlyValue = parseFloat(monthlyBudget.replace(/[^0-9.]/g, ""));
  const progressPercentage =
    monthlyValue > 0
      ? Math.min(100, Math.round((spentValue / monthlyValue) * 100))
      : 0;

  const totalSavedValue = performanceMetrics?.budgetAdherence
    ? `${Math.round(
      (performanceMetrics.budgetAdherence / 100) * monthlyValue
    ).toLocaleString()}`
    : "$47,000";

  const onTimeDeliveryValue = performanceMetrics?.onTimeDelivery || "88";

  // Quick Insights Metrics for StatsGrid
  const quickInsightsMetrics = [
    {
      title: "Total Budget Saved",
      value: totalSavedValue,
      change: "vs. initial estimates",
      icon: DollarSign,
      trendType: "positive",
      description: "Cost savings across projects",
    },
    {
      title: "On-Time Delivery",
      value: `${onTimeDeliveryValue}%`,
      change: "across all projects",
      icon: Calendar,
      trendType: "positive",
      description: "Projects delivered on schedule",
    },
    {
      title: "Completion Rate",
      value: `${performanceMetrics?.projectCompletionRate || 92}%`,
      change: "project success rate",
      icon: Target,
      trendType: "positive",
      description: "Successfully completed projects",
    },
    {
      title: "Satisfaction Score",
      value: `${performanceMetrics?.clientSatisfaction || 4.6}/5`,
      change: "from freelancer feedback",
      icon: Award,
      trendType: "positive",
      description: "Average rating from talent",
    },
  ];

  // Event handlers
  const handleActionToggle = (id, completed) => {
    window.alert(
      `Action ${id} toggled to ${completed ? "completed" : "pending"} - Backend integration pending.`
    );
  };

  const handleJobClick = (jobId) => {
    window.alert(`Job ${jobId} clicked - Backend integration pending.`);
  };

  const handleQuickAction = (action) => {
    window.alert(`Quick action: ${action} - Backend integration pending.`);
  };

  return (
    <div className={styles.clientDashboard}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Client Dashboard</h1>
          <p className={styles.subtitle}>
            Manage your projects, talent, and hiring pipeline
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => handleQuickAction("create-job")}>
            Post New Job
          </Button>
          <Button
            variant="outline"
            icon={Users}
            onClick={() => handleQuickAction("hire-talent")}>
            Hire Talent
          </Button>
        </div>
      </header>

      {/* Quick Insights Section using StatsGrid */}
      <section className={styles.quickInsightsSection}>
        <StatsGrid metrics={quickInsightsMetrics} />
      </section>

      {/* Main Content Grid - 2 Column Layout */}
      <div className={styles.contentGrid}>
        {/* Left Column - Activities, Budget, & Jobs */}
        <div className={styles.leftColumn}>
          {/* Recent Activity with Card Wrapper */}
          <Card
            title="Recent Activity"
            subtitle="Latest project updates and notifications"
            className={styles.activityCard}
            variant="glass"
            action={
              <Button variant="ghost" size="small">
                View All <ArrowUpRight size={14} />
              </Button>
            }>
            <RecentActivity activities={activities} limit={5} />
          </Card>

          {/* Budget Overview */}
          <Card
            title="Budget Overview"
            subtitle={`Monthly spending • ${progressPercentage}% used`}
            className={styles.budgetCard}
            variant="glass">
            <BudgetOverviewWidget
              budgetSpent={budgetSpent}
              monthlyBudget={monthlyBudget}
              monthlyValue={monthlyValue}
              spentValue={spentValue}
              progressPercentage={progressPercentage}
              earningsData={earningsData}
            />
          </Card>

          {/* Compact Job Posts */}
          <Card
            title="Active Job Posts"
            subtitle={`${jobPosts.length} open positions`}
            className={styles.jobsCard}
            variant="glass"
            action={
              <Button variant="ghost" size="small">
                View All <ArrowUpRight size={14} />
              </Button>
            }>
            <div className={styles.compactJobsList}>
              {jobPosts.slice(0, 4).map((job) => (
                <CompactJobCard
                  key={job.id}
                  job={job}
                  onClick={handleJobClick}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Actions, Performance, & Quick Actions */}
        <div className={styles.rightColumn}>
          {/* Pending Actions with Card Wrapper */}
          <Card
            title="Pending Actions"
            subtitle={`${pendingActions.length} tasks need your attention`}
            className={styles.actionsCard}
            variant="glass"
            action={
              <Badge variant="warning">{pendingActions.length} pending</Badge>
            }>
            <PendingActions
              actions={pendingActions}
              onActionComplete={handleActionToggle}
            />
          </Card>

          {/* Performance Metrics - Compact View */}
          <Card
            title="Key Performance Indicators"
            subtitle="Your project success metrics"
            className={styles.metricsCard}
            variant="glass">
            <div className={styles.kpiGrid}>
              {performanceMetrics &&
                Object.entries(performanceMetrics).map(([key, value]) => {
                  const kpiConfig = {
                    projectCompletionRate: {
                      label: "Completion",
                      icon: CheckCircle,
                      color: "success",
                    },
                    clientSatisfaction: {
                      label: "Satisfaction",
                      icon: Award,
                      color: "info",
                    },
                    onTimeDelivery: {
                      label: "On-Time",
                      icon: Clock,
                      color: "success",
                    },
                    budgetAdherence: {
                      label: "Budget",
                      icon: Target,
                      color: "warning",
                    },
                  };

                  const config = kpiConfig[key];
                  if (!config) return null;

                  const displayValue =
                    key === "clientSatisfaction"
                      ? `${value.toFixed(1)}/5`
                      : `${value}%`;

                  const Icon = config.icon;

                  return (
                    <div key={key} className={styles.kpiItem}>
                      <div className={styles.kpiIconWrapper}>
                        <Icon size={20} />
                      </div>
                      <div className={styles.kpiContent}>
                        <span className={styles.kpiLabel}>{config.label}</span>
                        <span className={styles.kpiValue}>{displayValue}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>

          {/* Quick Actions Panel */}
          <Card
            title="Quick Actions"
            subtitle="Common tasks & shortcuts"
            className={styles.quickActionsCard}
            variant="glass">
            <div className={styles.quickActionsList}>
              <button
                className={styles.quickActionItem}
                onClick={() => handleQuickAction("post-job")}>
                <Briefcase size={20} />
                <div className={styles.quickActionContent}>
                  <span className={styles.quickActionTitle}>Post New Job</span>
                  <span className={styles.quickActionDesc}>
                    Create a job listing
                  </span>
                </div>
              </button>

              <button
                className={styles.quickActionItem}
                onClick={() => handleQuickAction("browse-talent")}>
                <Users size={20} />
                <div className={styles.quickActionContent}>
                  <span className={styles.quickActionTitle}>Browse Talent</span>
                  <span className={styles.quickActionDesc}>
                    Find freelancers
                  </span>
                </div>
              </button>

              <button
                className={styles.quickActionItem}
                onClick={() => handleQuickAction("view-reports")}>
                <BarChart3 size={20} />
                <div className={styles.quickActionContent}>
                  <span className={styles.quickActionTitle}>View Reports</span>
                  <span className={styles.quickActionDesc}>
                    Analytics & insights
                  </span>
                </div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
