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
import { useTranslation } from 'react-i18next';
import gigService from '../../../../services/gigService';
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
const ClientDashboard = ({ data }) => {
  const { t } = useTranslation(['dashboards', 'common']);
  // Live API data
  const [jobPosts,  setJobPosts]  = useState([]);
  const [apiLoading, setApiLoading] = useState(true);

  // Static / mock-backed data (no API endpoints yet)
  const activities        = data.activities;
  const pendingActions    = data.pendingActions;
  const earningsData      = data.earningsData;
  const performanceMetrics = data.performanceMetrics;

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
      setJobPosts(data.recentJobPosts || []);
    } finally {
      setApiLoading(false);
    }
  }, [data.recentJobPosts]);

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
      title: t('dashboards:client.stats.totalBudgetSaved', 'Total Budget Saved'),
      value: totalSavedValue,
      change: t('dashboards:client.stats.vsInitialEstimates', 'vs. initial estimates'),
      icon: DollarSign,
      trendType: "positive",
      description: t('dashboards:client.stats.costSavings', 'Cost savings across projects'),
    },
    {
      title: t('dashboards:client.stats.onTimeDelivery', 'On-Time Delivery'),
      value: `${onTimeDeliveryValue}%`,
      change: t('dashboards:client.stats.acrossAllProjects', 'across all projects'),
      icon: Calendar,
      trendType: "positive",
      description: t('dashboards:client.stats.onSchedule', 'Projects delivered on schedule'),
    },
    {
      title: t('dashboards:client.stats.completionRate', 'Completion Rate'),
      value: `${performanceMetrics?.projectCompletionRate || 92}%`,
      change: t('dashboards:client.stats.projectSuccessRate', 'project success rate'),
      icon: Target,
      trendType: "positive",
      description: t('dashboards:client.stats.completedProjects', 'Successfully completed projects'),
    },
    {
      title: t('dashboards:client.stats.satisfactionScore', 'Satisfaction Score'),
      value: `${performanceMetrics?.clientSatisfaction || 4.6}/5`,
      change: t('dashboards:client.stats.fromFreelancerFeedback', 'from freelancer feedback'),
      icon: Award,
      trendType: "positive",
      description: t('dashboards:client.stats.avgRating', 'Average rating from talent'),
    },
  ];

  // Event handlers
  const handleActionToggle = (id, completed) => {
    console.log(
      `Action ${id} toggled to ${completed ? "completed" : "pending"}`
    );
  };

  const handleJobClick = (jobId) => {
    console.log(`Job ${jobId} clicked`);
  };

  const handleQuickAction = (action) => {
    console.log(`Quick action: ${action}`);
  };

  return (
    <div className={styles.clientDashboard}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{t('dashboards:client.title', 'Client Dashboard')}</h1>
          <p className={styles.subtitle}>
            {t('dashboards:client.subtitle', 'Manage your projects, talent, and hiring pipeline')}
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => handleQuickAction("create-job")}>
            {t('dashboards:client.postNewJob', 'Post New Job')}
          </Button>
          <Button
            variant="outline"
            icon={Users}
            onClick={() => handleQuickAction("hire-talent")}>
            {t('dashboards:client.hireTalent', 'Hire Talent')}
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
            title={t('dashboards:common.recentActivity.title', 'Recent Activity')}
            subtitle={t('dashboards:client.recentActivity.subtitle', 'Latest project updates and notifications')}
            className={styles.activityCard}
            variant="glass"
            action={
              <Button variant="ghost" size="small">
                {t('common:actions.viewAll', 'View All')} <ArrowUpRight size={14} />
              </Button>
            }>
            <RecentActivity activities={activities} limit={5} />
          </Card>

          {/* Budget Overview */}
          <Card
            title={t('dashboards:client.budgetOverview.title', 'Budget Overview')}
            subtitle={t('dashboards:client.budgetOverview.subtitle', 'Monthly spending • {{pct}}% used', { pct: progressPercentage })}
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
            title={t('dashboards:client.activeJobPosts.title', 'Active Job Posts')}
            subtitle={t('dashboards:client.activeJobPosts.subtitle', '{{count}} open positions', { count: jobPosts.length })}
            className={styles.jobsCard}
            variant="glass"
            action={
              <Button variant="ghost" size="small">
                {t('common:actions.viewAll', 'View All')} <ArrowUpRight size={14} />
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
            title={t('dashboards:common.pendingActions.title', 'Pending Actions')}
            subtitle={t('dashboards:common.pendingActions.subtitle', '{{count}} tasks to complete', { count: pendingActions.length })}
            className={styles.actionsCard}
            variant="glass"
            action={
              <Badge variant="warning">{t('dashboards:common.pendingActions.badge', '{{count}} pending', { count: pendingActions.length })}</Badge>
            }>
            <PendingActions
              actions={pendingActions}
              onActionComplete={handleActionToggle}
            />
          </Card>

          {/* Performance Metrics - Compact View */}
          <Card
            title={t('dashboards:client.kpi.title', 'Key Performance Indicators')}
            subtitle={t('dashboards:client.kpi.subtitle', 'Your project success metrics')}
            className={styles.metricsCard}
            variant="glass">
            <div className={styles.kpiGrid}>
              {performanceMetrics &&
                Object.entries(performanceMetrics).map(([key, value]) => {
                  const kpiConfig = {
                    projectCompletionRate: {
                      label: t('dashboards:client.kpi.completion', 'Completion'),
                      icon: CheckCircle,
                      color: "success",
                    },
                    clientSatisfaction: {
                      label: t('dashboards:client.kpi.satisfaction', 'Satisfaction'),
                      icon: Award,
                      color: "info",
                    },
                    onTimeDelivery: {
                      label: t('dashboards:client.kpi.onTime', 'On-Time'),
                      icon: Clock,
                      color: "success",
                    },
                    budgetAdherence: {
                      label: t('dashboards:client.kpi.budget', 'Budget'),
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
            title={t('dashboards:client.quickActions.title', 'Quick Actions')}
            subtitle={t('dashboards:client.quickActions.subtitle', 'Common tasks & shortcuts')}
            className={styles.quickActionsCard}
            variant="glass">
            <div className={styles.quickActionsList}>
              <button
                className={styles.quickActionItem}
                onClick={() => handleQuickAction("post-job")}>
                <Briefcase size={20} />
                <div className={styles.quickActionContent}>
                  <span className={styles.quickActionTitle}>{t('dashboards:client.quickActions.postJob', 'Post New Job')}</span>
                  <span className={styles.quickActionDesc}>
                    {t('dashboards:client.quickActions.postJobDesc', 'Create a job listing')}
                  </span>
                </div>
              </button>

              <button
                className={styles.quickActionItem}
                onClick={() => handleQuickAction("browse-talent")}>
                <Users size={20} />
                <div className={styles.quickActionContent}>
                  <span className={styles.quickActionTitle}>{t('dashboards:client.quickActions.browseTalent', 'Browse Talent')}</span>
                  <span className={styles.quickActionDesc}>
                    {t('dashboards:client.quickActions.browseTalentDesc', 'Find freelancers')}
                  </span>
                </div>
              </button>

              <button
                className={styles.quickActionItem}
                onClick={() => handleQuickAction("view-reports")}>
                <BarChart3 size={20} />
                <div className={styles.quickActionContent}>
                  <span className={styles.quickActionTitle}>{t('dashboards:client.quickActions.viewReports', 'View Reports')}</span>
                  <span className={styles.quickActionDesc}>
                    {t('dashboards:client.quickActions.viewReportsDesc', 'Analytics & insights')}
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
