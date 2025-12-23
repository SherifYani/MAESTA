/**
 * @file CompanyDashboard.jsx - Enhanced Version
 * @description Company-specific dashboard with metrics, activities, and job posts - Similar to ClientDashboard
 * @author Sherif Talaat
 * @version 3.0.0
 * @date 2025-12-19
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-12-21
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
  SAMPLE_ACTIVITIES,
  SAMPLE_PENDING_ACTIONS,
  SAMPLE_JOB_POSTS,
  TEAM_DATA,
  PERFORMANCE_METRICS,
} from "../../config/dashboard.config";
import {
  Plus,
  Users,
  DollarSign,
  Briefcase,
  Clock,
  Target,
  Award,
  BarChart3,
  CheckCircle,
  ArrowUpRight,
  MapPin,
  Users as UsersIcon,
  Target as TargetIcon,
} from "lucide-react";
import styles from "./CompanyDashboard.module.css";

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
      <span className={styles.jobMetaItem}>
        {job.budget}
      </span>
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
 * Enhanced CompanyDashboard - Similar to ClientDashboard
 */
const CompanyDashboard = ({ data }) => {
  // Get all role-specific data from dashboard.config.js
  
  const activities = data.activities;
  const pendingActions = data.pendingActions;
  const jobPosts = data.recentJobPosts;
  const teamData = data.teamData;
  const performanceMetrics = data.performanceMetrics;

  // Calculate quick stats
  const totalEmployees = teamData?.totalMembers || 42;
  const annualRevenue =
    ROLE_METRICS[ROLES.COMPANY]?.metrics?.[1]?.value || "$2.1M";
  const hiringSuccessRate = performanceMetrics?.hiringSuccessRate || "92%";
  const employeeRetention = performanceMetrics?.employeeRetention || "94%";

  // Quick Insights Metrics for StatsGrid
  const quickInsightsMetrics = [
    {
      title: "Total Employees",
      value: totalEmployees,
      change: "across all departments",
      icon: UsersIcon,
      trendType: "positive",
      description: "Current team size",
    },
    {
      title: "Annual Revenue",
      value: annualRevenue,
      change: "year-over-year growth",
      icon: DollarSign,
      trendType: "positive",
      description: "Total company revenue",
    },
    {
      title: "Hiring Success",
      value: hiringSuccessRate,
      change: "rate of successful hires",
      icon: TargetIcon,
      trendType: "positive",
      description: "Successful hire rate",
    },
    {
      title: "Employee Retention",
      value: `${employeeRetention}%`,
      change: "year-over-year retention",
      icon: Award,
      trendType: "positive",
      description: "Employee retention rate",
    },
  ];

  // Calculate team distribution data
  const teamDistributionData = teamData?.departments || [
    { name: "Engineering", count: 19 },
    { name: "Sales", count: 10 },
    { name: "Marketing", count: 6 },
    { name: "Operations", count: 7 },
  ];

  // Calculate total for percentages
  const totalCount = teamDistributionData.reduce(
    (sum, dept) => sum + dept.count,
    0
  );

  // Hiring timeline data
  const hiringTimelineData = [
    { label: "Tech Roles", value: "21 days" },
    { label: "Sales", value: "14 days" },
    { label: "Marketing", value: "18 days" },
    { label: "Management", value: "28 days" },
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
    <div className={styles.companyDashboard}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Company Dashboard</h1>
          <p className={styles.subtitle}>
            Manage your team, hiring pipeline, and business growth
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => handleQuickAction("create-job")}>
            Create Job Post
          </Button>
          <Button
            variant="outline"
            icon={Users}
            onClick={() => handleQuickAction("manage-team")}>
            Team Management
          </Button>
        </div>
      </header>

      {/* Quick Insights Section using StatsGrid */}
      <section className={styles.quickInsightsSection}>
        <StatsGrid metrics={quickInsightsMetrics} />
      </section>

      {/* Main Content Grid - 2 Column Layout */}
      <div className={styles.contentGrid}>
        {/* Left Column - Activities, Pending Actions & Team Distribution */}
        <div className={styles.leftColumn}>
          {/* Recent Activity with Card Wrapper */}
          <Card
            title="Recent Activity"
            subtitle="Team updates and company notifications"
            className={styles.activityCard}
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
            subtitle={`${pendingActions.length} HR and management tasks`}
            className={styles.actionsCard}
            action={
              <Badge variant="warning">{pendingActions.length} pending</Badge>
            }>
            <PendingActions
              actions={pendingActions}
              onActionComplete={handleActionToggle}
            />
          </Card>

          {/* Team Distribution - Compact View */}
          <Card
            title="Team Distribution"
            subtitle="Department-wise employee count"
            className={styles.teamCard}>
            <div className={styles.teamContent}>
              {teamDistributionData.map((dept, index) => {
                const percentage = Math.round((dept.count / totalCount) * 100);

                return (
                  <div key={index} className={styles.teamDepartment}>
                    <div className={styles.departmentHeader}>
                      <span className={styles.departmentLabel}>
                        {dept.name}
                      </span>
                      <span className={styles.departmentCount}>
                        {dept.count} ({percentage}%)
                      </span>
                    </div>
                    <div className={styles.departmentBar}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column - Jobs, Hiring Timeline & Performance */}
        <div className={styles.rightColumn}>
          {/* Compact Job Posts */}
          <Card
            title="Active Job Posts"
            subtitle={`${jobPosts.length} current hiring opportunities`}
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

          {/* Hiring Timeline - Compact View */}
          <Card
            title="Hiring Timeline"
            subtitle="Average time to hire by department"
            className={styles.timelineCard}>
            <div className={styles.kpiGrid}>
              {hiringTimelineData.map((item, index) => (
                <div key={index} className={styles.kpiItem}>
                  <div className={styles.kpiIconWrapper}>
                    <Clock size={20} />
                  </div>
                  <div className={styles.kpiContent}>
                    <span className={styles.kpiLabel}>{item.label}</span>
                    <span className={styles.kpiValue}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Performance Metrics - Compact View */}
          <Card
            title="Performance Metrics"
            subtitle="Key company performance indicators"
            className={styles.metricsCard}>
            <div className={styles.kpiGrid}>
              {performanceMetrics &&
                Object.entries(performanceMetrics).map(([key, value]) => {
                  const metricConfig = {
                    hiringSuccessRate: {
                      label: "Hiring Success",
                      icon: CheckCircle,
                      color: "success",
                    },
                    employeeRetention: {
                      label: "Retention",
                      icon: Award,
                      color: "success",
                    },
                    projectCompletionRate: {
                      label: "Projects",
                      icon: Target,
                      color: "warning",
                    },
                    onTimeDelivery: {
                      label: "On-Time",
                      icon: Clock,
                      color: "success",
                    },
                  };

                  const config = metricConfig[key];
                  if (!config) return null;

                  const displayValue = `${value}${
                    key === "hiringSuccessRate" ||
                    key === "employeeRetention" ||
                    key === "projectCompletionRate" ||
                    key === "onTimeDelivery"
                      ? "%"
                      : ""
                  }`;

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
            subtitle="Common company management tasks"
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
                    Find candidates
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

export default CompanyDashboard;
