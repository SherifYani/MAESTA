import React, { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import DashboardLayout from "../pages/dashboard/layout/DashboardLayout";
import TableSkeleton from "../components/common/Skeleton/TableSkeleton";
import jobService from "../services/jobService";
import dashboardService from "../services/dashboardService";
import exportService from "../services/exportService";

// Data Services
import {
  getNewApplicantsData,
  getPerformanceAnalyticsData,
  updateApplicantStatus,
  bulkApplicantAction,
} from "../pages/dashboard/tabs/company/services/companyDataService";

// Lazy load dashboard components
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const UserManagement = lazy(
  () =>
    import("../pages/dashboard/tabs/admin/components/UserManagement/UserManagement"),
);
const JobManagement = lazy(
  () =>
    import("../pages/dashboard/tabs/admin/components/JobManagement/JobManagement"),
);
const ContentModeration = lazy(
  () =>
    import("../pages/dashboard/tabs/admin/components/ContentModeration/ContentModeration"),
);
const StatisticsDashboard = lazy(
  () =>
    import("../pages/dashboard/tabs/admin/components/Statistics/StatisticsDashboard"),
);
const StaffManagement = lazy(
  () =>
    import("../pages/dashboard/tabs/admin/components/StaffManagement/StaffManagement"),
);
const SubscriptionManagement = lazy(
  () =>
    import("../pages/dashboard/tabs/admin/components/SubscriptionManagement/SubscriptionManagement"),
);
const AdminReports = lazy(
  () => import("../pages/dashboard/tabs/admin/AdminReports"),
);
const AdminPendingActions = lazy(
  () => import("../pages/dashboard/tabs/admin/AdminPendingActions"),
);
const AdminResolveAction = lazy(
  () => import("../pages/dashboard/tabs/admin/AdminResolveAction"),
);
const AdminActivities = lazy(
  () => import("../pages/dashboard/tabs/admin/AdminActivities"),
);
const AdminUsersManagement = lazy(
  () => import("../pages/dashboard/tabs/admin/AdminUsersManagement"),
);
const AdminJobsModeration = lazy(
  () => import("../pages/dashboard/tabs/admin/AdminJobsModeration"),
);

// Lazy load named exports correctly
const RoleBasedProfile = lazy(() =>
  import("../pages/dashboard/RoleBasedRoutes").then((m) => ({
    default: m.RoleBasedProfile,
  })),
);
const RoleBasedEditProfile = lazy(() =>
  import("../pages/dashboard/RoleBasedRoutes").then((m) => ({
    default: m.RoleBasedEditProfile,
  })),
);
const EscrowDashboard = lazy(() =>
  import("../components/payment").then((m) => ({ default: m.EscrowDashboard })),
);

// Data-heavy components needing wrappers
const NewApplicants = lazy(
  () =>
    import("../pages/dashboard/tabs/company/components/NewApplicants/NewApplicants.jsx"),
);
const PerformanceAnalytics = lazy(
  () =>
    import("../pages/dashboard/tabs/company/components/PerformanceAnalytics/PerformanceAnalytics.jsx"),
);
const PublishedJobs = lazy(
  () =>
    import("../pages/dashboard/tabs/company/components/PublishedJobs/PublishedJobs.jsx"),
);
const CompanyExport = lazy(
  () => import("../pages/dashboard/tabs/company/CompanyExport"),
);
const CompanyInterviews = lazy(
  () => import("../pages/dashboard/tabs/company/CompanyInterviews"),
);
const CompanyApplicants = lazy(
  () => import("../pages/dashboard/tabs/company/CompanyApplicants"),
);
const InterviewScheduling = lazy(
  () => import("../pages/dashboard/tabs/company/InterviewScheduling"),
);
const RecommendedJobs = lazy(
  () =>
    import("../pages/dashboard/tabs/jobseeker/components/RecommendedJobs/RecommendedJobs.jsx"),
);
const SavedJobs = lazy(
  () =>
    import("../pages/dashboard/tabs/jobseeker/components/SavedJobs/SavedJobs.jsx"),
);
const DetailedApplications = lazy(
  () =>
    import("../pages/dashboard/tabs/jobseeker/components/DetailedApplications/DetailedApplications.jsx"),
);
const MyInterviewsPage = lazy(() => import("../pages/dashboard/tabs/jobseeker/MyInterviewsPage"));

// Shared Pages (all authenticated roles)
const AccountSettings = lazy(
  () =>
    import("../pages/dashboard/tabs/shared/AccountSettings/AccountSettings.jsx"),
);
const BillingPage = lazy(
  () => import("../pages/dashboard/tabs/shared/BillingPage/BillingPage.jsx"),
);
const HelpSupportPage = lazy(
  () =>
    import("../pages/dashboard/tabs/shared/HelpSupportPage/HelpSupportPage.jsx"),
);

// Additional Pages (Phase 7)
const EarningsPage = lazy(() => import("../pages/dashboard/tabs/freelancer/EarningsPage"));
const TalentPoolPage = lazy(() => import("../pages/dashboard/TalentPoolPage"));

const normalizeCompanyJob = (job) => {
    const id = job.id || job.jobId;
    const isPublished = job.isPublished ?? job.status === 'active' ?? true;
    return {
        ...job,
        id,
        status: isPublished ? 'active' : 'paused',
        department: job.department || 'General',
        postedDate: job.postedDate || job.createdAt,
        expiryDate: job.expiryDate || job.updatedAt || job.createdAt,
        level: job.level || job.experienceLevel,
        type: job.type || job.jobType,
        salary: job.salary || [job.salaryMin, job.salaryMax].filter(Boolean).join(' - ') || 'Not specified',
        stats: {
            applications: job.applicationCount || job.applicationsCount || 0,
            applicants: job.applicationCount || job.applicationsCount || 0,
            shortlisted: job.shortlistedCount || 0,
            hired: job.hiredCount || 0,
            completionRate: job.completionRate || 0,
        },
        actions: {
            canEdit: true,
            canPause: true,
            canDelete: true,
            canViewApplicants: true,
        },
    };
};

const normalizeCompanyApplicant = (applicant) => ({
    ...applicant,
    id: applicant.applicationId || applicant.id,
    applicantName: applicant.applicantName || applicant.name || 'Applicant',
    applicantEmail: applicant.applicantEmail || applicant.email || 'N/A',
    applicantPhone: applicant.applicantPhone || applicant.phone || 'N/A',
    appliedDate: applicant.appliedAt || applicant.appliedDate,
    status: (applicant.status || 'pending').toLowerCase(),
    matchScore: Math.round(applicant.matchScore || 0),
    location: applicant.location || 'N/A',
    resume: { url: applicant.cvUrl || applicant.resumeUrl || '' },
    profile: { url: applicant.applicantId ? `/profiles/jobseeker/${applicant.applicantId}` : '' },
    actions: {
        canShortlist: true,
        canReject: true,
        canScheduleInterview: true,
        canViewResume: Boolean(applicant.cvUrl || applicant.resumeUrl),
        canViewProfile: Boolean(applicant.applicantId),
    },
});

/**
 * Company Dashboard Component Wrappers
 */
const PublishedJobsWithData = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = () => {
    setLoading(true);
    jobService
      .getCompanyJobs()
      .then((res) => setJobs((res?.items || res || []).map(normalizeCompanyJob)))
      .catch((err) => console.error("Failed to load jobs", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadJobs();
  }, []);

  if (loading) return <TableSkeleton rows={10} columns={6} />;

  return (
    <PublishedJobs
      jobs={jobs}
      stats={{
        totalJobs: jobs.length,
        activeJobs: jobs.filter((j) => j.status === "active").length,
        totalViews: 0,
        totalApplicants: 0,
      }}
      filters={{}}
      pagination={{ currentPage: 1, totalPages: 1, totalItems: jobs.length }}
      onCreateJob={() => navigate("/jobs/post")}
      onViewJob={(id) => navigate(`/jobs/${id}`)}
      onEditJob={(id) => navigate(`/jobs/${id}/edit`)}
      onUpdateJobStatus={async (id, isPublished) => {
        await jobService.toggleJobStatus(id, isPublished);
        loadJobs();
      }}
      onDeleteJob={async (id) => {
        await jobService.deleteJob(id);
        loadJobs();
      }}
      onManageApplicants={(id) => navigate(`/dashboard/applicants?jobId=${id}`)}
      onExportData={() => navigate("/dashboard/export?type=jobs")}
    />
  );
};

const NewApplicantsWithData = () => {
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadApplicants = () => {
    setLoading(true);
    jobService
      .getCompanyApplicants()
      .then((res) =>
        setApplicants((res?.items || res || []).map(normalizeCompanyApplicant)),
      )
      .catch((err) => console.error("Failed to load applicants", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadApplicants();
  }, []);

  if (loading) return <TableSkeleton rows={10} columns={6} />;

  const stats = {
    total: applicants.length,
    new: applicants.filter((a) => a.status === "pending" || a.status === "new")
      .length,
    reviewed: applicants.filter((a) => a.status === "reviewed").length,
    shortlisted: applicants.filter((a) => a.status === "shortlisted").length,
    interviewed: applicants.filter((a) => a.status === "interviewed").length,
    rejected: applicants.filter((a) => a.status === "rejected").length,
    avgMatchScore:
      applicants.length > 0 ?
        Math.round(
          applicants.reduce((sum, a) => sum + (a.matchScore || 0), 0) /
            applicants.length,
        )
      : 0,
  };

  const updateStatus = async (id, status) => {
    await jobService.updateApplicationStatus(id, status);
    loadApplicants();
  };

  return (
    <NewApplicants
      applicants={applicants}
      stats={stats}
      filters={{ availableJobs: [], availableStatuses: [] }}
      pagination={{
        currentPage: 1,
        totalPages: 1,
        totalItems: applicants.length,
      }}
      onViewApplicant={(id) => navigate(`/dashboard/applicants?applicantId=${id}`)}
      onShortlist={(id) => updateStatus(id, "shortlisted")}
      onReject={(id) => updateStatus(id, "rejected")}
      onScheduleInterview={(id) => navigate(`/dashboard/interviews/schedule?applicationId=${id}`)}
      onUpdateApplicantStatus={updateStatus}
      onBulkAction={async (action, ids) => {
        if (action === "export")
          return exportService.generateExport("applicants", null, {}, "json");
        await Promise.all(ids.map((id) => updateStatus(id, action)));
      }}
      onExportData={() => navigate("/dashboard/export?type=applicants")}
    />
  );
};

const PerformanceAnalyticsWithData = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await dashboardService.getCompanyAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <TableSkeleton rows={10} columns={6} />;
  if (!analytics) return <div>Error loading analytics</div>;

  return (
    <PerformanceAnalytics
      analyticsData={analytics.monthlyTrends ? analytics : analytics.analytics} // Handle both formats if necessary
      stats={analytics.stats}
      insights={analytics.insights}
      trends={analytics.trends}
      period={analytics.period || "monthly"}
      onPeriodChange={() => {}}
      onExport={() => {}}
      onRefresh={() => window.location.reload()}
    />
  );
};

/**
 * Jobseeker Component Wrappers
 */
const RecommendedJobsWithData = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    jobService
      .getRecommendedJobs()
      .then((res) => setJobs(res?.items || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleJobSave = async (jobId, shouldSave) => {
    setJobs((prev) =>
      prev.map((job) =>
        (job.id || job.jobId) === jobId ? { ...job, isSaved: shouldSave } : job,
      ),
    );

    try {
      if (shouldSave) {
        await jobService.saveJob(jobId);
      } else {
        await jobService.unsaveJob(jobId);
      }
    } catch (err) {
      setJobs((prev) =>
        prev.map((job) =>
          (job.id || job.jobId) === jobId ? { ...job, isSaved: !shouldSave } : job,
        ),
      );
      console.error("Failed to update saved job", err);
    }
  };

  const handleJobApply = (jobId) => {
    navigate(`/jobs/${jobId}/apply`);
  };

  if (loading) return <TableSkeleton rows={5} columns={1} />;

  return (
    <RecommendedJobs
      jobs={jobs}
      onJobSave={handleJobSave}
      onJobApply={handleJobApply}
    />
  );
};

const SavedJobsWithData = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    jobService
      .getSavedJobs()
      .then((res) => setJobs(res?.items || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRemoveJob = async (jobId) => {
    const previousJobs = jobs;
    setJobs((prev) => prev.filter((job) => (job.id || job.jobId) !== jobId));

    try {
      await jobService.unsaveJob(jobId);
    } catch (err) {
      setJobs(previousJobs);
      console.error("Failed to remove saved job", err);
    }
  };

  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleApplyJob = (jobId) => {
    navigate(`/jobs/${jobId}/apply`);
  };

  if (loading) return <TableSkeleton rows={5} columns={1} />;

  return (
    <SavedJobs
      jobs={jobs}
      onRemoveJob={handleRemoveJob}
      onViewJob={handleViewJob}
      onApplyJob={handleApplyJob}
    />
  );
};

const DetailedApplicationsWithData = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobService
      .getMyApplications()
      .then((res) => setApplications(res?.items || res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <TableSkeleton rows={5} columns={1} />;

  return (
    <DetailedApplications
      applications={applications}
      stats={{
        total: applications.length,
        underReview: applications.filter((app) => app.status === "review")
          .length,
        interview: applications.filter((app) => app.status === "interview")
          .length,
        offers: applications.filter((app) => app.status === "offer").length,
        rejected: applications.filter((app) => app.status === "rejected")
          .length,
      }}
      onViewApplication={() => {}}
      onWithdrawApplication={jobService.withdrawApplication}
    />
  );
};

const DashboardRoutes = () => {
  console.log("DashboardRoutes component rendering");
  return (
    <Suspense fallback={<TableSkeleton rows={10} columns={6} />}>
      <Routes>
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<RoleBasedProfile />} />
          <Route path="profile/edit" element={<RoleBasedEditProfile />} />

          {/* Role Overviews / Home Redirects */}
          <Route path="admin" element={<Dashboard />} />
          <Route path="company" element={<Dashboard />} />
          <Route path="jobseeker" element={<Dashboard />} />
          <Route path="client" element={<Dashboard />} />
          <Route path="freelancer" element={<Dashboard />} />

          {/* Company Specific Routes (both flat and prefixed) */}
          <Route
            path="published-jobs"
            element={
              <ProtectedRoute allowedRoles={["employer", "company", "client"]}>
                <PublishedJobsWithData />
              </ProtectedRoute>
            }
          />
          <Route
            path="company/published-jobs"
            element={
              <ProtectedRoute allowedRoles={["employer", "company", "client"]}>
                <PublishedJobsWithData />
              </ProtectedRoute>
            }
          />

          <Route
            path="new-applications"
            element={
              <ProtectedRoute allowedRoles={["employer", "company", "client"]}>
                <NewApplicantsWithData />
              </ProtectedRoute>
            }
          />
          <Route
            path="company/new-applications"
            element={
              <ProtectedRoute allowedRoles={["employer", "company", "client"]}>
                <NewApplicantsWithData />
              </ProtectedRoute>
            }
          />

          <Route
            path="performance-analytics"
            element={
              <ProtectedRoute allowedRoles={["employer", "company", "client"]}>
                <PerformanceAnalyticsWithData />
              </ProtectedRoute>
            }
          />
          <Route
            path="company/performance-analytics"
            element={
              <ProtectedRoute allowedRoles={["employer", "company", "client"]}>
                <PerformanceAnalyticsWithData />
              </ProtectedRoute>
            }
          />

          <Route
            path="export"
            element={
              <ProtectedRoute allowedRoles={["employer", "company", "client"]}>
                <CompanyExport />
              </ProtectedRoute>
            }
          />
          <Route
            path="company/export"
            element={
              <ProtectedRoute allowedRoles={["employer", "company", "client"]}>
                <CompanyExport />
              </ProtectedRoute>
            }
          />

          <Route
            path="interviews"
            element={
              <ProtectedRoute allowedRoles={["company", "employer", "client"]}>
                <CompanyInterviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="company/interviews"
            element={
              <ProtectedRoute allowedRoles={["company", "employer", "client"]}>
                <CompanyInterviews />
              </ProtectedRoute>
            }
          />

          <Route
            path="interviews/schedule"
            element={
              <ProtectedRoute allowedRoles={["company", "employer", "client"]}>
                <InterviewScheduling />
              </ProtectedRoute>
            }
          />
          <Route
            path="company/interviews/schedule"
            element={
              <ProtectedRoute allowedRoles={["company", "employer", "client"]}>
                <InterviewScheduling />
              </ProtectedRoute>
            }
          />

          <Route
            path="applicants"
            element={
              <ProtectedRoute allowedRoles={["company", "employer", "client"]}>
                <CompanyApplicants />
              </ProtectedRoute>
            }
          />
          <Route
            path="company/applicants"
            element={
              <ProtectedRoute allowedRoles={["company", "employer", "client"]}>
                <CompanyApplicants />
              </ProtectedRoute>
            }
          />

          {/* Jobseeker Specific Routes */}
          <Route
            path="recommended-jobs"
            element={
              <ProtectedRoute allowedRoles={["jobseeker", "freelancer"]}>
                <RecommendedJobsWithData />
              </ProtectedRoute>
            }
          />
          <Route
            path="saved-jobs"
            element={
              <ProtectedRoute allowedRoles={["jobseeker", "freelancer"]}>
                <SavedJobsWithData />
              </ProtectedRoute>
            }
          />
          <Route
            path="applications"
            element={
              <ProtectedRoute allowedRoles={["jobseeker", "freelancer"]}>
                <DetailedApplicationsWithData />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-interviews"
            element={
              <ProtectedRoute allowedRoles={["jobseeker", "freelancer"]}>
                <MyInterviewsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="jobseeker/my-interviews"
            element={
              <ProtectedRoute allowedRoles={["jobseeker", "freelancer"]}>
                <MyInterviewsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard Routes (both flat and prefixed) */}
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUsersManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUsersManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="jobs"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <JobManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/jobs"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <JobManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="moderation"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ContentModeration />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/moderation"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ContentModeration />
              </ProtectedRoute>
            }
          />

          <Route
            path="statistics"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <StatisticsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/statistics"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <StatisticsDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="staff"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <StaffManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/staff"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <StaffManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="subscriptions"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <SubscriptionManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/subscriptions"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <SubscriptionManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminReports />
              </ProtectedRoute>
            }
          />

          <Route
            path="activities"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminActivities />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/activities"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminActivities />
              </ProtectedRoute>
            }
          />

          <Route
            path="pending/:actionId"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPendingActions />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/pending/:actionId"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPendingActions />
              </ProtectedRoute>
            }
          />

          <Route
            path="resolve/:actionId"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminResolveAction />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/resolve/:actionId"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminResolveAction />
              </ProtectedRoute>
            }
          />

          <Route
            path="jobs/moderation"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminJobsModeration />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/jobs/moderation"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminJobsModeration />
              </ProtectedRoute>
            }
          />

          {/* Freelancer & Client Specific Routes */}
          <Route path="earnings" element={<ProtectedRoute allowedRoles={["freelancer"]}><EarningsPage /></ProtectedRoute>} />
          <Route path="talent" element={<ProtectedRoute allowedRoles={["client", "company", "employer"]}><TalentPoolPage /></ProtectedRoute>} />

          {/* Shared Routes — accessible to all authenticated roles */}
          <Route path="account" element={<AccountSettings />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="help" element={<HelpSupportPage />} />

          {/* Payment & Escrow Dashboard Routes */}
          <Route path="escrow" element={<EscrowDashboard />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default DashboardRoutes;
