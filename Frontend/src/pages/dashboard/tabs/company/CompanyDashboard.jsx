/**
 * @file CompanyDashboard.jsx
 * @description Company dashboard overview page with all components integrated
 * @author Sherif Talaat
 * @version 6.0.0
 * @date 2026-1-27
 */
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import StatsGrid from "../../components/StatsGrid";
import RecentActivity from "../../components/RecentActivity";
import PendingActions from "../../components/PendingActions";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

// Import new company components
import CompanySummary from "./components/CompanySummary/CompanySummary";
import JobMetricsChart from "./components/shared/JobMetricsChart";

// Import lightweight widget versions for dashboard overview
import PerformanceAnalyticsWidget from "./components/PerformanceAnalytics/PerformanceAnalyticsWidget";
import PublishedJobsWidget from "./components/PublishedJobs/PublishedJobsWidget";
import NewApplicantsWidget from "./components/NewApplicants/NewApplicantsWidget";

import {
  ROLES,
  getCompanyDashboardData,
  COMPANY_PROFILE,
  COMPANY_PUBLISHED_JOBS,
  COMPANY_NEW_APPLICANTS,
  COMPANY_PERFORMANCE_ANALYTICS,
  COMPANY_RECENT_ACTIVITY,
  COMPANY_PENDING_ACTIONS,
  getCompanyStatistics,
  getJobPerformanceSummary,
} from "../../config/dashboard.config";
import {
  Plus,
  Users,
  Briefcase,
  Clock,
  Target,
  Award,
  BarChart3,
  CheckCircle,
  ArrowUpRight,
  MapPin,
  Building,
  TrendingUp,
  Eye,
  Calendar,
  FileText,
  UserCheck,
  UserX,
  BarChart,
  Settings,
  Search,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import styles from "./CompanyDashboard.module.css";

const CompanyDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid, list, compact
  const [activeFilter, setActiveFilter] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);

  // Load company dashboard data
  useEffect(() => {
    const loadDashboardData = () => {
      try {
        const data = getCompanyDashboardData(ROLES.COMPANY);
        setDashboardData(data);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        // Fallback to static data
        setDashboardData({
          profile: COMPANY_PROFILE,
          publishedJobs: COMPANY_PUBLISHED_JOBS,
          newApplicants: COMPANY_NEW_APPLICANTS,
          performanceAnalytics: COMPANY_PERFORMANCE_ANALYTICS,
          recentActivity: COMPANY_RECENT_ACTIVITY,
          pendingActions: COMPANY_PENDING_ACTIONS,
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [refreshKey]);

  // Filter jobs based on search and active filter
  const filteredJobs =
    dashboardData?.publishedJobs?.filter((job) => {
      const matchesSearch =
        searchQuery === "" ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        activeFilter === "all" || job.status === activeFilter;

      return matchesSearch && matchesFilter;
    }) || [];

  // Filter applicants
  const filteredApplicants =
    dashboardData?.newApplicants?.filter((applicant) => {
      return (
        searchQuery === "" ||
        applicant.applicantName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        applicant.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }) || [];

  // Calculate quick stats using company data
  const calculateQuickInsights = () => {
    if (!dashboardData) return [];

    const stats = getCompanyStatistics();
    const analytics = dashboardData.performanceAnalytics;

    return [
      {
        title: "Active Jobs",
        value: stats.activeJobs,
        change: `${dashboardData.publishedJobs?.length || 0} total posted`,
        icon: Briefcase,
        trendType: "positive",
        description: "Currently hiring positions",
      },
      {
        title: "Total Applications",
        value: stats.totalApplications,
        change: `${stats.newApplications} new this month`,
        icon: Users,
        trendType: "positive",
        description: "All-time applications",
      },
      {
        title: "Hire Rate",
        value: `${analytics?.overview?.hireRate || 0}%`,
        change: `${analytics?.overview?.totalHires || 0} total hires`,
        icon: Target,
        trendType: "positive",
        description: "Successful hire percentage",
      },
      {
        title: "Avg Time to Hire",
        value: analytics?.overview?.avgTimeToHire || "24 days",
        change: "Improved by 2 days",
        icon: Clock,
        trendType: "positive",
        description: "Average hiring duration",
      },
    ];
  };

  // Event handlers
  const handleViewApplicant = (applicantId) => {
    console.log(`View applicant: ${applicantId}`);
    // Navigate to applicant detail page
    // navigate(`/dashboard/applicants/${applicantId}`);
  };

  const handleScheduleInterview = (applicantId) => {
    console.log(`Schedule interview for: ${applicantId}`);
    // Open interview scheduling modal
  };

  const handleViewJobStats = (jobId) => {
    console.log(`View stats for job: ${jobId}`);
    // Navigate to job analytics page
  };

  const handleEditJob = (jobId) => {
    console.log(`Edit job: ${jobId}`);
    // Navigate to job edit page
  };

  const handleManageApplicants = (jobId) => {
    console.log(`Manage applicants for job: ${jobId}`);
    // Navigate to job applicants page
  };

  const handleViewJob = (jobId) => {
    console.log(`View job details: ${jobId}`);
    // Navigate to job detail page
    // navigate(`/dashboard/jobs/${jobId}`);
  };

  const handleRefreshDashboard = () => {
    setRefreshKey((prev) => prev + 1);
    setLoading(true);
  };

  const handleExportData = (type) => {
    console.log(`Exporting ${type} data...`);
    // Implement export functionality
  };

  // Loading state
  if (loading || !dashboardData) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading company dashboard...</p>
      </div>
    );
  }

  const activeJobs =
    dashboardData.publishedJobs?.filter((job) => job.status === "active") || [];
  const jobPerformance = getJobPerformanceSummary();

  return (
    <div className={styles.companyDashboard}>
      {/* Header Section with Actions */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Company Dashboard</h1>
          <p className={styles.subtitle}>
            Welcome back, {dashboardData.profile.name}! Here's your hiring
            overview.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={handleRefreshDashboard}
            size="medium">
            Refresh
          </Button>
          <Link to="/dashboard/published-jobs?new=true">
            <Button variant="primary" icon={Plus} size="medium">
              Create Job
            </Button>
          </Link>
        </div>
      </header>

      {/* Quick Insights Section */}
      <section className={styles.quickInsightsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Quick Insights</h2>
          <div className={styles.sectionActions}>
            <Button
              variant="ghost"
              size="small"
              onClick={() => handleExportData("stats")}
              icon={Download}>
              Export
            </Button>
          </div>
        </div>
        <StatsGrid metrics={calculateQuickInsights()} />
      </section>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          {/* Company Summary */}
          <div className={styles.widget}>
            <CompanySummary
              profile={dashboardData.profile}
              stats={dashboardData.profile.stats}
            />
          </div>

          {/* New Applicants Widget */}
          <div className={styles.widget}>
            <Card
              title="New Applicants"
              subtitle="Recent applications"
              className={styles.activityCard}
              action={
                <Link to="/dashboard/applicants">
                  <Button variant="ghost" size="small">
                    View All <ArrowUpRight size={14} />
                  </Button>
                </Link>
              }>
              <NewApplicantsWidget
                applicants={filteredApplicants}
                onViewApplicant={handleViewApplicant}
              />
            </Card>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.rightColumn}>
          {/* Published Jobs Widget */}
          <div className={styles.widget}>
            <Card
              title="Active Jobs"
              subtitle="Recent & active postings"
              className={styles.activityCard}
              action={
                <Link to="/dashboard/published-jobs">
                  <Button variant="ghost" size="small">
                    View All <ArrowUpRight size={14} />
                  </Button>
                </Link>
              }>
              <PublishedJobsWidget
                jobs={dashboardData.publishedJobs}
                onViewJob={handleViewJob}
              />
            </Card>
          </div>

          {/* Performance Analytics Widget */}
          <div className={styles.widget}>
            <Card
              title="Performance Metrics"
              subtitle="Key recruitment insights"
              className={styles.activityCard}
              action={
                <Link to="/dashboard/performance-analytics">
                  <Button variant="ghost" size="small">
                    View Details <ArrowUpRight size={14} />
                  </Button>
                </Link>
              }>
              <PerformanceAnalyticsWidget
                analytics={dashboardData.performanceAnalytics}
                onViewDetails={() => console.log('View analytics details')}
              />
            </Card>
          </div>

          {/* Job Metrics Chart */}
          <div className={styles.widget}>
            <Card
              title="Application Trends"
              subtitle="Monthly application volume"
              className={styles.chartCard}>
              <JobMetricsChart
                data={
                  dashboardData.performanceAnalytics.applicationSources?.map(
                    (item) => ({
                      name: item.source,
                      value: item.count,
                    })
                  ) || []
                }
                type="pie"
                height={200}
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Pending Actions Footer */}
      <div className={styles.pendingActionsSection}>
        <Card
          title="Pending Actions"
          subtitle={`${dashboardData.pendingActions.length} HR and management tasks`}
          className={styles.pendingActionsCard}
          action={
            <Badge variant="warning">
              {dashboardData.pendingActions.length} pending
            </Badge>
          }>
          <PendingActions
            actions={dashboardData.pendingActions}
            onActionComplete={(id, completed) => {
              console.log(`Action ${id} completed: ${completed}`);
            }}
          />
        </Card>
      </div>

      {/* Performance Summary Footer */}
      <div className={styles.performanceFooter}>
        <div className={styles.footerStats}>
          <div className={styles.footerStat}>
            <span className={styles.footerStatLabel}>Total Jobs Posted</span>
            <span className={styles.footerStatValue}>
              {dashboardData.profile.stats?.totalJobsPosted || 0}
            </span>
          </div>
          <div className={styles.footerStat}>
            <span className={styles.footerStatLabel}>Open Positions</span>
            <span className={styles.footerStatValue}>
              {dashboardData.profile.stats?.openPositions || 0}
            </span>
          </div>
          <div className={styles.footerStat}>
            <span className={styles.footerStatLabel}>Total Applications</span>
            <span className={styles.footerStatValue}>
              {dashboardData.profile.stats?.totalApplications?.toLocaleString() ||
                0}
            </span>
          </div>
          <div className={styles.footerStat}>
            <span className={styles.footerStatLabel}>Interview Rate</span>
            <span className={styles.footerStatValue}>
              {dashboardData.profile.stats?.interviewRate || 0}%
            </span>
          </div>
          <div className={styles.footerStat}>
            <span className={styles.footerStatLabel}>Success Rate</span>
            <span className={styles.footerStatValue}>
              {dashboardData.profile.stats?.hireRate || 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
