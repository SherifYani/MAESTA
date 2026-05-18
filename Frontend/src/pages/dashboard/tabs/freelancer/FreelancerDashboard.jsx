/**
 * @file FreelancerDashboard.jsx - Enhanced Version
 * @description Freelancer-specific dashboard with metrics, activities, and job posts
 * @author Sherif Talaat
 * @version 5.0.0
 * @date 2026-01-29
 *
 * @last-modified-by Antigravity (AI)
 * @last-modified-date 2026-05-01
 * @changes
 * - Phase 1: jobPosts (proposals) now fetched from real gigService API
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
import EarningsOverviewWidget from "./components/EarningsOverviewWidget";

import {
  Plus,
  TrendingUp,
  Award,
  Zap,
  DollarSign,
  Briefcase,
  Clock,
  Target,
  BarChart3,
  CheckCircle,
  ArrowUpRight,
  MapPin,
  Users,
} from "lucide-react";
import styles from "./FreelancerDashboard.module.css";

/**
 * Enhanced FreelancerDashboard
 */
const FreelancerDashboard = ({ data }) => {
  const { t } = useTranslation(['dashboards', 'common']);
  // Live API data
  const [jobPosts,    setJobPosts]    = useState([]);
  const [apiLoading,  setApiLoading]  = useState(true);

  // Static / mock-backed data (no API endpoints yet)
  const activities        = data.activities;
  const pendingActions    = data.pendingActions;
  const earningsData      = data.earningsData;
  const performanceMetrics = data.performanceMetrics;
  const skillAnalysis     = data.skillAnalysis;

  // ── Fetch proposals on mount ──────────────────────────────────────
  const fetchProposals = useCallback(async () => {
    try {
      const raw = await gigService.getMyProposals();
      const items = Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? []);
      // Normalise proposal/gig shape to what CompactJobCard expects
      setJobPosts(items.map(p => ({
        ...p,
        id:       p.id        || p.proposalId || p.gigId,
        title:    p.gigTitle  || p.title      || 'Untitled Gig',
        company:  p.clientName || p.company   || 'Client',
        location: p.location  || 'Remote',
        status:   p.status    || 'pending',
        type:     p.type      || 'Freelance',
      })));
    } catch (err) {
      console.error('[FreelancerDashboard] Failed to fetch proposals:', err);
      setJobPosts(data.recentJobPosts || []);
    } finally {
      setApiLoading(false);
    }
  }, [data.recentJobPosts]);

  useEffect(() => { fetchProposals(); }, [fetchProposals]);

  // Calculate earnings metrics
  const currentMonthEarnings =
    earningsData?.monthlyData?.[earningsData.monthlyData.length - 1]
      ?.earnings || 3850;
  const projectedTotal = earningsData?.totalEarnings || "$9,200";

  // Calculate progress for earnings
  const monthlyTarget = 5000; // Example monthly target
  const earningsProgress = Math.min(
    100,
    Math.round((currentMonthEarnings / monthlyTarget) * 100)
  );

  // Calculate quick stats
  const clientSatisfaction = performanceMetrics?.clientSatisfaction || 4.8;

  // Quick Insights Metrics for StatsGrid
  const quickInsightsMetrics = [
    {
      title: t('dashboards:freelancer.stats.monthlyEarnings', 'Monthly Earnings'),
      value: `$${currentMonthEarnings.toLocaleString()}`,
      change: t('dashboards:freelancer.stats.vsLastMonth', 'vs. last month'),
      icon: DollarSign,
      trendType: "positive",
      description: t('dashboards:freelancer.stats.currentMonthEarnings', 'Current month earnings'),
    },
    {
      title: t('dashboards:freelancer.stats.clientSatisfaction', 'Client Satisfaction'),
      value: `${clientSatisfaction}/5`,
      change: t('dashboards:freelancer.stats.fromClientReviews', 'from client reviews'),
      icon: Award,
      trendType: "positive",
      description: t('dashboards:freelancer.stats.avgClientRating', 'Average client rating'),
    },
    {
      title: t('dashboards:freelancer.stats.onTimeDelivery', 'On-Time Delivery'),
      value: `${performanceMetrics?.onTimeDelivery || 96}%`,
      change: t('dashboards:freelancer.stats.completionRate', 'project completion rate'),
      icon: Clock,
      trendType: "positive",
      description: t('dashboards:freelancer.stats.deliveredOnTime', 'Projects delivered on time'),
    },
    {
      title: t('dashboards:freelancer.stats.repeatClients', 'Repeat Clients'),
      value: `${performanceMetrics?.repeatClients || 8}`,
      change: t('dashboards:freelancer.stats.loyalClientCount', 'loyal client count'),
      icon: Users,
      trendType: "positive",
      description: t('dashboards:freelancer.stats.returningClients', 'Returning clients'),
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
    <div className={styles.freelancerDashboard}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{t('dashboards:freelancer.title', 'Freelancer Dashboard')}</h1>
          <p className={styles.subtitle}>
            {t('dashboards:freelancer.subtitle', 'Track your projects, earnings, and find new opportunities')}
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => handleQuickAction("create-proposal")}>
            {t('dashboards:freelancer.newProposal', 'New Proposal')}
          </Button>
          <Button
            variant="outline"
            icon={Zap}
            onClick={() => handleQuickAction("quick-apply")}>
            {t('dashboards:freelancer.quickApply', 'Quick Apply')}
          </Button>
        </div>
      </header>

      {/* Quick Insights Section using StatsGrid */}
      <section className={styles.quickInsightsSection}>
        <StatsGrid metrics={quickInsightsMetrics} />
      </section>

      {/* Main Content Grid - 2 Column Layout */}
      <div className={styles.contentGrid}>
        {/* Left Column - Activities, Pending Actions & Profile */}
        <div className={styles.leftColumn}>
          {/* Recent Activity with Card Wrapper */}
          <Card
            title={t('dashboards:common.recentActivity.title', 'Recent Activity')}
            subtitle={t('dashboards:freelancer.recentActivity.subtitle', 'Your latest updates and notifications')}
            className={styles.activityCard}
            variant="glass"
            action={
              <Button variant="ghost" size="small">
                {t('common:actions.viewAll', 'View All')} <ArrowUpRight size={14} />
              </Button>
            }>
            <RecentActivity activities={activities} limit={5} />
          </Card>

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

          {/* Profile Completeness - Compact View */}
          <Card
            title={t('dashboards:freelancer.profileCompleteness.title', 'Profile Completeness')}
            subtitle={t('dashboards:freelancer.profileCompleteness.subtitle', 'Improve your profile visibility')}
            className={styles.profileCard}
            variant="glass">
            <div className={styles.profileContent}>
              <div className={styles.profileProgress}>
                <div
                  className={styles.progressCircle}
                  style={{
                    "--progress-percentage": `${skillAnalysis?.matchPercentage || 85
                      }%`,
                  }}>
                  <span className={styles.progressText}>
                    {skillAnalysis?.matchPercentage || 85}%
                  </span>
                </div>
              </div>
              <div className={styles.profileTips}>
                <div className={styles.kpiGrid}>
                  {skillAnalysis?.recommendations ? (
                    skillAnalysis.recommendations
                      .slice(0, 3)
                      .map((tip, index) => (
                        <div key={index} className={styles.kpiItem}>
                          <div className={styles.kpiIconWrapper}>
                            <CheckCircle size={20} />
                          </div>
                          <div className={styles.kpiContent}>
                            <span className={styles.kpiLabel}>
                               {t('dashboards:freelancer.profileCompleteness.tipLabel', 'Tip {{n}}', { n: index + 1 })}
                            </span>
                            <span className={styles.kpiValueSmall}>{tip}</span>
                          </div>
                        </div>
                      ))
                  ) : (
                    <>
                      <div className={styles.kpiItem}>
                        <div className={styles.kpiIconWrapper}>
                          <CheckCircle size={20} />
                        </div>
                        <div className={styles.kpiContent}>
                          <span className={styles.kpiLabel}>{t('dashboards:freelancer.profileCompleteness.tipLabel', 'Tip {{n}}', { n: 1 })}</span>
                          <span className={styles.kpiValueSmall}>
                            {t('dashboards:freelancer.profileCompleteness.tip1', 'Add portfolio projects')}
                          </span>
                        </div>
                      </div>
                      <div className={styles.kpiItem}>
                        <div className={styles.kpiIconWrapper}>
                          <CheckCircle size={20} />
                        </div>
                        <div className={styles.kpiContent}>
                          <span className={styles.kpiLabel}>{t('dashboards:freelancer.profileCompleteness.tipLabel', 'Tip {{n}}', { n: 2 })}</span>
                          <span className={styles.kpiValueSmall}>
                            {t('dashboards:freelancer.profileCompleteness.tip2', 'Complete skill assessments')}
                          </span>
                        </div>
                      </div>
                      <div className={styles.kpiItem}>
                        <div className={styles.kpiIconWrapper}>
                          <CheckCircle size={20} />
                        </div>
                        <div className={styles.kpiContent}>
                          <span className={styles.kpiLabel}>{t('dashboards:freelancer.profileCompleteness.tipLabel', 'Tip {{n}}', { n: 3 })}</span>
                          <span className={styles.kpiValueSmall}>
                            {t('dashboards:freelancer.profileCompleteness.tip3', 'Request client reviews')}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Jobs, Earnings & Performance */}
        <div className={styles.rightColumn}>
          {/* Compact Job Posts */}
          <Card
            title={t('dashboards:freelancer.recommendedJobs.title', 'Recommended Jobs')}
            subtitle={t('dashboards:freelancer.recommendedJobs.subtitle', '{{count}} matches based on your profile', { count: jobPosts.length })}
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

          {/* Earnings Overview - Compact View */}
          <Card
            title={t('dashboards:freelancer.earningsOverview.title', 'Earnings Overview')}
            subtitle={t('dashboards:freelancer.earningsOverview.subtitle', 'Monthly target: ${{target}}', { target: monthlyTarget.toLocaleString() })}
            className={styles.earningsCard}
            variant="glass">
            <EarningsOverviewWidget
              monthlyTarget={monthlyTarget}
              currentMonthEarnings={currentMonthEarnings}
              projectedTotal={projectedTotal}
              earningsProgress={earningsProgress}
              earningsData={earningsData}
            />
          </Card>

          {/* Performance Metrics - Compact View */}
          <Card
            title={t('dashboards:freelancer.performanceMetrics.title', 'Performance Metrics')}
            subtitle={t('dashboards:freelancer.performanceMetrics.subtitle', 'Your freelancer success indicators')}
            className={styles.metricsCard}
            variant="glass">
            <div className={styles.kpiGrid}>
              {performanceMetrics &&
                Object.entries(performanceMetrics).map(([key, value]) => {
                  const metricConfig = {
                    projectCompletionRate: {
                      label: t('dashboards:freelancer.metrics.completion', 'Completion'),
                      icon: CheckCircle,
                      color: "success",
                    },
                    clientSatisfaction: {
                      label: t('dashboards:freelancer.metrics.satisfaction', 'Satisfaction'),
                      icon: Award,
                      color: "success",
                    },
                    onTimeDelivery: {
                      label: t('dashboards:freelancer.metrics.onTime', 'On-Time'),
                      icon: Clock,
                      color: "success",
                    },
                    repeatClients: {
                      label: t('dashboards:freelancer.metrics.repeat', 'Repeat'),
                      icon: Users,
                      color: "warning",
                    },
                    proposalAcceptance: {
                      label: t('dashboards:freelancer.metrics.proposals', 'Proposals'),
                      icon: Target,
                      color: "success",
                    },
                  };

                  const config = metricConfig[key];
                  if (!config) return null;

                  const displayValue =
                    key === "clientSatisfaction"
                      ? `${value.toFixed(1)}/5`
                      : `${value}${key === "repeatClients" ? "" : "%"}`;

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
            title={t('dashboards:freelancer.quickActions.title', 'Quick Actions')}
            subtitle={t('dashboards:freelancer.quickActions.subtitle', 'Common freelancer tasks')}
            className={styles.quickActionsCard}
            variant="glass">
            <div className={styles.quickActionsList}>
              <button
                className={styles.quickActionItem}
                onClick={() => handleQuickAction("post-proposal")}>
                <Briefcase size={20} />
                <div className={styles.quickActionContent}>
                  <span className={styles.quickActionTitle}>{t('dashboards:freelancer.quickActions.newProposal', 'New Proposal')}</span>
                  <span className={styles.quickActionDesc}>
                    {t('dashboards:freelancer.quickActions.newProposalDesc', 'Submit a proposal')}
                  </span>
                </div>
              </button>

              <button
                className={styles.quickActionItem}
                onClick={() => handleQuickAction("update-profile")}>
                <Users size={20} />
                <div className={styles.quickActionContent}>
                  <span className={styles.quickActionTitle}>
                    {t('dashboards:freelancer.quickActions.updateProfile', 'Update Profile')}
                  </span>
                  <span className={styles.quickActionDesc}>
                    {t('dashboards:freelancer.quickActions.updateProfileDesc', 'Enhance your profile')}
                  </span>
                </div>
              </button>

              <button
                className={styles.quickActionItem}
                onClick={() => handleQuickAction("view-insights")}>
                <BarChart3 size={20} />
                <div className={styles.quickActionContent}>
                  <span className={styles.quickActionTitle}>{t('dashboards:freelancer.quickActions.viewInsights', 'View Insights')}</span>
                  <span className={styles.quickActionDesc}>
                    {t('dashboards:freelancer.quickActions.viewInsightsDesc', 'Analytics & trends')}
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

export default FreelancerDashboard;
