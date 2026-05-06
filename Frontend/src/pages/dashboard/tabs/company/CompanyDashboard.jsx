/**
 * @file CompanyDashboard.jsx
 * @description Company dashboard overview page with all components integrated
 * @author Sherif Talaat
 * @version 7.0.0
 * @date 2026-01-27
 *
 * @last-modified-by Antigravity (AI)
 * @last-modified-date 2026-05-01
 * @changes
 * - Phase 1: publishedJobs and newApplicants now fetched from real API
 * - Profile, analytics, pendingActions retain mock fallback (no API yet)
 */
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import jobService from '../../../../services/jobService';
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
  Mail,
} from "lucide-react";
import styles from "./CompanyDashboard.module.css";

const CompanyDashboard = () => {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [activeFilter, setActiveFilter] = useState("all");

  // Live API data
  const [publishedJobs,  setPublishedJobs]  = useState([]);
  const [newApplicants,  setNewApplicants]  = useState([]);

  // Mock-backed data (no API endpoints yet)
  const mockSnapshot = getCompanyDashboardData(ROLES.COMPANY);
  const [dashboardData] = useState(() => ({
    profile:              COMPANY_PROFILE,
    performanceAnalytics: COMPANY_PERFORMANCE_ANALYTICS,
    recentActivity:       COMPANY_RECENT_ACTIVITY,
    pendingActions:       COMPANY_PENDING_ACTIONS,
  }));

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsResult, applicantsResult] = await Promise.allSettled([
        jobService.getCompanyJobs(),
        // Fetch applications for all company jobs by getting all applications
        jobService.getCompanyJobs().then(async (jobs) => {
          const raw = Array.isArray(jobs) ? jobs : (jobs?.items ?? jobs?.data ?? []);
          // Get applications for the first 3 active jobs (overview only)
          const activeJobs = raw.filter(j => j.status === 'active' || !j.status).slice(0, 3);
          const appPromises = activeJobs.map(j => jobService.getJobApplications(j.id || j.jobId));
          const results = await Promise.allSettled(appPromises);
          return results
            .filter(r => r.status === 'fulfilled')
            .flatMap(r => Array.isArray(r.value) ? r.value : (r.value?.items ?? r.value?.data ?? []));
        }),
      ]);

      if (jobsResult.status === 'fulfilled') {
        const raw = jobsResult.value;
        const items = Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? []);
        setPublishedJobs(items);
      } else {
        // Fall back to mock jobs
        setPublishedJobs(COMPANY_PUBLISHED_JOBS);
      }

      if (applicantsResult.status === 'fulfilled') {
        setNewApplicants(applicantsResult.value);
      } else {
        setNewApplicants(COMPANY_NEW_APPLICANTS);
      }
    } catch (err) {
      console.error('[CompanyDashboard] Unexpected fetch error:', err);
      setPublishedJobs(COMPANY_PUBLISHED_JOBS);
      setNewApplicants(COMPANY_NEW_APPLICANTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter jobs based on search and active filter
  const filteredJobs = publishedJobs.filter((job) => {
    const matchesSearch =
      searchQuery === "" ||
      (job.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.location || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = activeFilter === "all" || job.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Filter applicants
  const filteredApplicants = newApplicants.filter((applicant) => {
    return (
      searchQuery === "" ||
      (applicant.applicantName || applicant.firstName || '')
        .toLowerCase().includes(searchQuery.toLowerCase()) ||
      (applicant.jobTitle || applicant.job?.title || '')
        .toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Calculate quick stats — blend live data with mock analytics
  const calculateQuickInsights = () => {
    const stats     = getCompanyStatistics();
    const analytics = dashboardData.performanceAnalytics;
    const activeCount = publishedJobs.filter(j => j.status === 'active' || !j.status).length;

    return [
      {
        title: "Active Jobs",
        value: activeCount || stats.activeJobs,
        change: `${publishedJobs.length || 0} total posted`,
        icon: Briefcase,
        trendType: "positive",
        description: "Currently hiring positions",
      },
      {
        title: "Total Applications",
        value: newApplicants.length || stats.totalApplications,
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
  const handleViewApplicant  = (id)    => navigate(`/dashboard/applicants/${id}`);
  const handleViewJob        = (id)    => navigate(`/jobs/${id}`);
  const handleEditJob        = (id)    => navigate(`/dashboard/published-jobs/${id}/edit`);
  const handleManageApplicants = (id)  => navigate(`/dashboard/applicants?jobId=${id}`);
  const handleScheduleInterview = (id) => navigate(`/dashboard/interviews/schedule?applicantId=${id}`);
  const handleRefreshDashboard  = ()   => fetchData();
  const handleExportData        = (type) => navigate(`/dashboard/export?type=${type}`);

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

      {/* Main Content - Single Column Layout */}
      <div className={styles.contentGrid}>
        {/* Row 1: Company Summary (Full Width) */}
        <div className={styles.fullWidthRow}>
          <div className={styles.widget}>
            <CompanySummary
              profile={dashboardData.profile}
              stats={dashboardData.profile.stats}
            />
          </div>
        </div>

        {/* Row 2: New Applicants Widget (Full Width) */}
        <div className={styles.fullWidthRow}>
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

        {/* Row 3: Published Jobs + About Company (Two Columns) */}
        <div className={styles.twoColumnRow}>
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
                jobs={publishedJobs}
                onViewJob={handleViewJob}
              />
            </Card>
          </div>

          <div className={styles.widget}>
            <Card
              title="About Company"
              subtitle="Company information"
              className={styles.activityCard}>
              <div className={styles.aboutCompanyContent}>
                <p className={styles.companyDescription}>
                  {dashboardData.profile?.description}
                </p>
                <div className={styles.companyDetails}>
                  <div className={styles.detailItem}>
                    <Building size={16} />
                    <span>{dashboardData.profile?.industry}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <MapPin size={16} />
                    <span>{dashboardData.profile?.location}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <Users size={16} />
                    <span>{dashboardData.profile?.size}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Row 4: Hiring Team + Quick Stats (Two Columns) */}
        <div className={styles.twoColumnRow}>
          <div className={styles.widget}>
            <Card
              title="Hiring Team"
              subtitle="Primary contacts for recruitment"
              className={styles.activityCard}>
              <div className={styles.teamList}>
                {dashboardData.profile?.hiringTeam?.slice(0, 3).map((member) => (
                  <div key={member.id} className={styles.teamMember}>
                    <div className={styles.memberAvatar}>
                      {member.name.charAt(0)}
                    </div>
                    <div className={styles.memberInfo}>
                      <span className={styles.memberName}>{member.name}</span>
                      <span className={styles.memberRole}>{member.role}</span>
                    </div>
                    <a
                      href={`mailto:${member.email}`}
                      className={styles.memberEmail}>
                      <Mail size={14} />
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className={styles.widget}>
            <Card
              title="Quick Stats"
              subtitle="Key performance metrics"
              className={styles.activityCard}>
              <div className={styles.statsList}>
                <div className={styles.statItem}>
                  <span className={styles.statKey}>Total Jobs Posted</span>
                  <span className={styles.statValue}>
                    {publishedJobs.length || dashboardData.profile?.stats?.totalJobsPosted || 0}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statKey}>Open Positions</span>
                  <span className={styles.statValue}>
                    {publishedJobs.filter(j => j.status === 'active' || !j.status).length || dashboardData.profile?.stats?.openPositions || 0}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statKey}>Interview Rate</span>
                  <span className={styles.statValue}>
                    {dashboardData.profile?.stats?.interviewRate || 0}%
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statKey}>Total Hires</span>
                  <Badge variant="success">
                    {dashboardData.profile?.stats?.hireRate || 0}% success
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Pending Actions Footer */}
      <div className={styles.pendingActionsSection}>
        <Card
          title="Pending Actions"
          subtitle={`${dashboardData.pendingActions?.length || 0} HR and management tasks`}
          className={styles.pendingActionsCard}
          action={
            <Badge variant="warning">
              {dashboardData.pendingActions?.length || 0} pending
            </Badge>
          }>
          <PendingActions
            actions={dashboardData.pendingActions || []}
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
              {publishedJobs.length || dashboardData.profile?.stats?.totalJobsPosted || 0}
            </span>
          </div>
          <div className={styles.footerStat}>
            <span className={styles.footerStatLabel}>Open Positions</span>
            <span className={styles.footerStatValue}>
              {publishedJobs.filter(j => j.status === 'active' || !j.status).length || dashboardData.profile?.stats?.openPositions || 0}
            </span>
          </div>
          <div className={styles.footerStat}>
            <span className={styles.footerStatLabel}>Total Applications</span>
            <span className={styles.footerStatValue}>
              {newApplicants.length || dashboardData.profile?.stats?.totalApplications?.toLocaleString() || 0}
            </span>
          </div>
          <div className={styles.footerStat}>
            <span className={styles.footerStatLabel}>Interview Rate</span>
            <span className={styles.footerStatValue}>
              {dashboardData.profile?.stats?.interviewRate || 0}%
            </span>
          </div>
          <div className={styles.footerStat}>
            <span className={styles.footerStatLabel}>Success Rate</span>
            <span className={styles.footerStatValue}>
              {dashboardData.profile?.stats?.hireRate || 0}%
            </span>
          </div>
        </div>
      </div>
    </div >
  );
};

export default CompanyDashboard;
