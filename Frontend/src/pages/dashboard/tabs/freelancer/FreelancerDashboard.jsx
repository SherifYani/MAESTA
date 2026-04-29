/**
 * @file FreelancerDashboard.jsx - Enhanced Version
 * @description Freelancer-specific dashboard with metrics, activities, and job posts
 * @author Sherif Talaat
 * @version 4.0.0
 * @date 2026-01-29
 */

import React from 'react';
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
  // Get all role-specific data from dashboard.config.js
  const activities = data.activities;
  const pendingActions = data.pendingActions;
  const jobPosts = data.recentJobPosts;
  const earningsData = data.earningsData;
  const performanceMetrics = data.performanceMetrics;
  const skillAnalysis = data.skillAnalysis;

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
      title: "Monthly Earnings",
      value: `$${currentMonthEarnings.toLocaleString()}`,
      change: "vs. last month",
      icon: DollarSign,
      trendType: "positive",
      description: "Current month earnings",
    },
    {
      title: "Client Satisfaction",
      value: `${clientSatisfaction}/5`,
      change: "from client reviews",
      icon: Award,
      trendType: "positive",
      description: "Average client rating",
    },
    {
      title: "On-Time Delivery",
      value: `${performanceMetrics?.onTimeDelivery || 96}%`,
      change: "project completion rate",
      icon: Clock,
      trendType: "positive",
      description: "Projects delivered on time",
    },
    {
      title: "Repeat Clients",
      value: `${performanceMetrics?.repeatClients || 8}`,
      change: "loyal client count",
      icon: Users,
      trendType: "positive",
      description: "Returning clients",
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
          <h1 className={styles.title}>Freelancer Dashboard</h1>
          <p className={styles.subtitle}>
            Track your projects, earnings, and find new opportunities
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => handleQuickAction("create-proposal")}>
            New Proposal
          </Button>
          <Button
            variant="outline"
            icon={Zap}
            onClick={() => handleQuickAction("quick-apply")}>
            Quick Apply
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
            title="Recent Activity"
            subtitle="Your latest updates and notifications"
            className={styles.activityCard}
            variant="glass"
            action={
              <Button variant="ghost" size="small">
                View All <ArrowUpRight size={14} />
              </Button>
            }>
            <RecentActivity activities={activities} limit={5} />
          </Card>

          {/* Pending Actions with Card Wrapper */}
          <Card
            title="Pending Actions"
            subtitle={`${pendingActions.length} tasks requiring your attention`}
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

          {/* Profile Completeness - Compact View */}
          <Card
            title="Profile Completeness"
            subtitle="Improve your profile visibility"
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
                              Tip {index + 1}
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
                          <span className={styles.kpiLabel}>Tip 1</span>
                          <span className={styles.kpiValueSmall}>
                            Add portfolio projects
                          </span>
                        </div>
                      </div>
                      <div className={styles.kpiItem}>
                        <div className={styles.kpiIconWrapper}>
                          <CheckCircle size={20} />
                        </div>
                        <div className={styles.kpiContent}>
                          <span className={styles.kpiLabel}>Tip 2</span>
                          <span className={styles.kpiValueSmall}>
                            Complete skill assessments
                          </span>
                        </div>
                      </div>
                      <div className={styles.kpiItem}>
                        <div className={styles.kpiIconWrapper}>
                          <CheckCircle size={20} />
                        </div>
                        <div className={styles.kpiContent}>
                          <span className={styles.kpiLabel}>Tip 3</span>
                          <span className={styles.kpiValueSmall}>
                            Request client reviews
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
            title="Recommended Jobs"
            subtitle={`${jobPosts.length} matches based on your profile`}
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

          {/* Earnings Overview - Compact View */}
          <Card
            title="Earnings Overview"
            subtitle={`Monthly target: $${monthlyTarget.toLocaleString()}`}
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
            title="Performance Metrics"
            subtitle="Your freelancer success indicators"
            className={styles.metricsCard}
            variant="glass">
            <div className={styles.kpiGrid}>
              {performanceMetrics &&
                Object.entries(performanceMetrics).map(([key, value]) => {
                  const metricConfig = {
                    projectCompletionRate: {
                      label: "Completion",
                      icon: CheckCircle,
                      color: "success",
                    },
                    clientSatisfaction: {
                      label: "Satisfaction",
                      icon: Award,
                      color: "success",
                    },
                    onTimeDelivery: {
                      label: "On-Time",
                      icon: Clock,
                      color: "success",
                    },
                    repeatClients: {
                      label: "Repeat",
                      icon: Users,
                      color: "warning",
                    },
                    proposalAcceptance: {
                      label: "Proposals",
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
            title="Quick Actions"
            subtitle="Common freelancer tasks"
            className={styles.quickActionsCard}
            variant="glass">
            <div className={styles.quickActionsList}>
              <button
                className={styles.quickActionItem}
                onClick={() => handleQuickAction("post-proposal")}>
                <Briefcase size={20} />
                <div className={styles.quickActionContent}>
                  <span className={styles.quickActionTitle}>New Proposal</span>
                  <span className={styles.quickActionDesc}>
                    Submit a proposal
                  </span>
                </div>
              </button>

              <button
                className={styles.quickActionItem}
                onClick={() => handleQuickAction("update-profile")}>
                <Users size={20} />
                <div className={styles.quickActionContent}>
                  <span className={styles.quickActionTitle}>
                    Update Profile
                  </span>
                  <span className={styles.quickActionDesc}>
                    Enhance your profile
                  </span>
                </div>
              </button>

              <button
                className={styles.quickActionItem}
                onClick={() => handleQuickAction("view-insights")}>
                <BarChart3 size={20} />
                <div className={styles.quickActionContent}>
                  <span className={styles.quickActionTitle}>View Insights</span>
                  <span className={styles.quickActionDesc}>
                    Analytics & trends
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
