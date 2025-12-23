/**
 * @file ClientDashboard.jsx - Enhanced Version (No Nested Cards)
 * @description Improved client dashboard with clean layout and compact data
 * @author Sherif Talaat
 * @version 4.1.0
 * @date 2025-12-21
 */

import StatsGrid from "../../components/StatsGrid";
import RecentActivity from "../../components/RecentActivity";
import PendingActions from "../../components/PendingActions";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import {
  ROLES,
  ROLE_METRICS,
} from "../../config/dashboard.config";
import {
  Plus,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  Briefcase,
  Clock,
  Target,
  Award,
  BarChart3,
  CheckCircle,
  ArrowUpRight,
  MapPin,
} from "lucide-react";
import styles from "./ClientDashboard.module.css";

/**
 * Compact Job Post Card Component
 */
const CompactJobCard = ({ job, onClick }) => (
  <div className={styles.compactJobCard} onClick={() => onClick?.(job.id)}>
    <div className={styles.jobCardHeader}>
      <div className={styles.jobCardTitle}>
        <Briefcase size={16} className={styles.jobCardIcon} />
        <h4>{job.title}</h4>
      </div>
      <Badge
        variant={job.status?.toLowerCase() === "active" ? "active" : "pending"}>
        {job.status}
      </Badge>
    </div>

    <div className={styles.jobCardMeta}>
      <span className={styles.jobMetaItem}>{job.budget}</span>
      <span className={styles.jobMetaItem}>
        <MapPin size={14} />
        {job.location}
      </span>
      <span className={styles.jobMetaItem}>
        <Users size={14} />
        {job.applicants} applicants
      </span>
    </div>
  </div>
);

/**
 * Enhanced ClientDashboard - Clean, No Nested Cards
 */
const ClientDashboard = ({ data }) => {
  // Get all role-specific data from dashboard.config.js
  const activities = data.activities;
  const pendingActions = data.pendingActions;
  const jobPosts = data.recentJobPosts;
  const earningsData = data.earningsData;
  const performanceMetrics = data.performanceMetrics;

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
            className={styles.budgetCard}>
            <div className={styles.budgetContent}>
              <div className={styles.budgetStats}>
                <div className={styles.budgetStat}>
                  <span className={styles.budgetStatLabel}>
                    Spent This Month
                  </span>
                  <span className={styles.budgetStatValue}>{budgetSpent}</span>
                </div>
                <div className={styles.budgetStat}>
                  <span className={styles.budgetStatLabel}>Monthly Budget</span>
                  <span className={styles.budgetStatValue}>
                    {monthlyBudget}
                  </span>
                </div>
              </div>

              <div className={styles.budgetProgress}>
                <div className={styles.budgetProgressHeader}>
                  <span className={styles.budgetProgressLabel}>
                    Budget Usage
                  </span>
                  <span className={styles.budgetProgressValue}>
                    {progressPercentage}%
                  </span>
                </div>
                <div className={styles.budgetProgressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className={styles.budgetInsights}>
                <div className={styles.budgetInsight}>
                  <DollarSign size={16} />
                  <span>
                    Remaining: ${(monthlyValue - spentValue).toLocaleString()}
                  </span>
                </div>
                <div className={styles.budgetInsight}>
                  <TrendingUp size={16} />
                  <span>
                    {earningsData?.changePercentage || "+8.2%"} vs last month
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Compact Job Posts */}
          <Card
            title="Active Job Posts"
            subtitle={`${jobPosts.length} open positions`}
            className={styles.jobsCard}
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
            className={styles.metricsCard}>
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
            className={styles.quickActionsCard}>
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
