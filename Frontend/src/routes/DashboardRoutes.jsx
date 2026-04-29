import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from "../components/common/ProtectedRoute";
import DashboardLayout from "../pages/dashboard/layout/DashboardLayout";
import TableSkeleton from "../components/common/Skeleton/TableSkeleton";

// Data Services
import {
  getPublishedJobsData,
  getNewApplicantsData,
  getPerformanceAnalyticsData,
  updateJobStatus,
  updateApplicantStatus,
  bulkApplicantAction
} from '../pages/dashboard/tabs/company/services/companyDataService';

import {
  JOB_SEEKER_RECOMMENDED_JOBS,
  JOB_SEEKER_APPLICATIONS,
  JOB_SEEKER_SAVED_JOBS
} from '../pages/dashboard/config/dashboard.config';

// Lazy load dashboard components
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const UserManagement = lazy(() => import("../pages/dashboard/tabs/admin/components/UserManagement/UserManagement"));
const JobManagement = lazy(() => import("../pages/dashboard/tabs/admin/components/JobManagement/JobManagement"));
const ContentModeration = lazy(() => import("../pages/dashboard/tabs/admin/components/ContentModeration/ContentModeration"));
const StatisticsDashboard = lazy(() => import("../pages/dashboard/tabs/admin/components/Statistics/StatisticsDashboard"));
const StaffManagement = lazy(() => import("../pages/dashboard/tabs/admin/components/StaffManagement/StaffManagement"));
const SubscriptionManagement = lazy(() => import("../pages/dashboard/tabs/admin/components/SubscriptionManagement/SubscriptionManagement"));

// Lazy load named exports correctly
const RoleBasedProfile = lazy(() => import("../pages/dashboard/RoleBasedRoutes").then(m => ({ default: m.RoleBasedProfile })));
const RoleBasedEditProfile = lazy(() => import("../pages/dashboard/RoleBasedRoutes").then(m => ({ default: m.RoleBasedEditProfile })));
const EscrowDashboard = lazy(() => import("../components/payment").then(m => ({ default: m.EscrowDashboard })));

// Data-heavy components needing wrappers
const NewApplicants = lazy(() => import("../pages/dashboard/tabs/company/components/NewApplicants/NewApplicants.jsx"));
const PerformanceAnalytics = lazy(() => import("../pages/dashboard/tabs/company/components/PerformanceAnalytics/PerformanceAnalytics.jsx"));
const PublishedJobs = lazy(() => import("../pages/dashboard/tabs/company/components/PublishedJobs/PublishedJobs.jsx"));
const RecommendedJobs = lazy(() => import("../pages/dashboard/tabs/jobseeker/components/RecommendedJobs/RecommendedJobs.jsx"));
const SavedJobs = lazy(() => import("../pages/dashboard/tabs/jobseeker/components/SavedJobs/SavedJobs.jsx"));
const DetailedApplications = lazy(() => import("../pages/dashboard/tabs/jobseeker/components/DetailedApplications/DetailedApplications.jsx"));

/**
 * Company Dashboard Component Wrappers
 */
const PublishedJobsWithData = () => {
    const data = getPublishedJobsData();
    if (!data.success) return <div>Error loading jobs</div>;
    return (
        <PublishedJobs
            jobs={data.data.jobs}
            stats={data.data.stats}
            filters={data.data.filters}
            pagination={data.data.pagination}
            onCreateJob={() => {}}
            onViewJob={() => {}}
            onEditJob={() => {}}
            onUpdateJobStatus={updateJobStatus}
            onManageApplicants={() => {}}
            onExportData={() => {}}
        />
    );
};

const NewApplicantsWithData = () => {
    const data = getNewApplicantsData();
    if (!data.success) return <div>Error loading applicants</div>;
    return (
        <NewApplicants
            applicants={data.data.applicants}
            stats={data.data.stats}
            filters={data.data.filters}
            pagination={data.data.pagination}
            onViewApplicant={() => {}}
            onShortlist={updateApplicantStatus}
            onReject={updateApplicantStatus}
            onScheduleInterview={updateApplicantStatus}
            onUpdateApplicantStatus={updateApplicantStatus}
            onBulkAction={bulkApplicantAction}
            onExportData={() => {}}
        />
    );
};

const PerformanceAnalyticsWithData = () => {
    const data = getPerformanceAnalyticsData({ period: 'monthly' });
    if (!data.success) return <div>Error loading analytics</div>;
    return (
        <PerformanceAnalytics
            analyticsData={data.data.analytics}
            stats={data.data.stats}
            insights={data.data.insights}
            trends={data.data.trends}
            period={data.data.period}
            onPeriodChange={() => {}}
            onExport={() => {}}
            onRefresh={() => window.location.reload()}
        />
    );
};

/**
 * Jobseeker Component Wrappers
 */
const RecommendedJobsWithData = () => (
    <RecommendedJobs
        jobs={JOB_SEEKER_RECOMMENDED_JOBS}
        onJobSave={() => {}}
        onJobApply={() => {}}
    />
);

const SavedJobsWithData = () => (
    <SavedJobs
        jobs={JOB_SEEKER_SAVED_JOBS}
        onRemoveJob={() => {}}
        onViewJob={() => {}}
        onApplyJob={() => {}}
    />
);

const DetailedApplicationsWithData = () => (
    <DetailedApplications
        applications={JOB_SEEKER_APPLICATIONS}
        stats={{
            total: JOB_SEEKER_APPLICATIONS.length,
            underReview: JOB_SEEKER_APPLICATIONS.filter(app => app.status === 'review').length,
            interview: JOB_SEEKER_APPLICATIONS.filter(app => app.status === 'interview').length,
            offers: JOB_SEEKER_APPLICATIONS.filter(app => app.status === 'offer').length,
            rejected: JOB_SEEKER_APPLICATIONS.filter(app => app.status === 'rejected').length
        }}
        onViewApplication={() => {}}
        onWithdrawApplication={() => {}}
    />
);

const DashboardRoutes = () => {
    return (
        <Suspense fallback={<TableSkeleton rows={10} columns={6} />}>
            <Routes>
                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="profile" element={<RoleBasedProfile />} />
                    <Route path="profile/edit" element={<RoleBasedEditProfile />} />

                    {/* Company Specific Routes */}
                    <Route path="published-jobs" element={<PublishedJobsWithData />} />
                    <Route path="new-applications" element={<NewApplicantsWithData />} />
                    <Route path="performance-analytics" element={<PerformanceAnalyticsWithData />} />

                    {/* Jobseeker Specific Routes */}
                    <Route path="recommended-jobs" element={<RecommendedJobsWithData />} />
                    <Route path="saved-jobs" element={<SavedJobsWithData />} />
                    <Route path="applications" element={<DetailedApplicationsWithData />} />

                    {/* Admin Dashboard Routes */}
                    <Route path="users" element={<UserManagement />} />
                    <Route path="jobs" element={<JobManagement />} />
                    <Route path="moderation" element={<ContentModeration />} />
                    <Route path="statistics" element={<StatisticsDashboard />} />
                    <Route path="staff" element={<StaffManagement />} />
                    <Route path="subscriptions" element={<SubscriptionManagement />} />
                    
                    {/* Payment & Escrow Dashboard Routes */}
                    <Route path="escrow" element={<EscrowDashboard />} />
                </Route>
            </Routes>
        </Suspense>
    );
};

export default DashboardRoutes;
