import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from "../components/common/ProtectedRoute";
import DashboardLayout from "../pages/dashboard/layout/DashboardLayout";
import TableSkeleton from "../components/common/Skeleton/TableSkeleton";
import jobService from "../services/jobService";

// Data Services
import {
    getNewApplicantsData,
    getPerformanceAnalyticsData,
    updateApplicantStatus,
    bulkApplicantAction
} from '../pages/dashboard/tabs/company/services/companyDataService';

// Lazy load dashboard components
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const UserManagement = lazy(() => import("../pages/dashboard/tabs/admin/components/UserManagement/UserManagement"));
const JobManagement = lazy(() => import("../pages/dashboard/tabs/admin/components/JobManagement/JobManagement"));
const ContentModeration = lazy(() => import("../pages/dashboard/tabs/admin/components/ContentModeration/ContentModeration"));
const StatisticsDashboard = lazy(() => import("../pages/dashboard/tabs/admin/components/Statistics/StatisticsDashboard"));
const StaffManagement = lazy(() => import("../pages/dashboard/tabs/admin/components/StaffManagement/StaffManagement"));
const SubscriptionManagement = lazy(() => import("../pages/dashboard/tabs/admin/components/SubscriptionManagement/SubscriptionManagement"));
const AdminReports = lazy(() => import("../pages/dashboard/tabs/admin/AdminReports"));
const AdminPendingActions = lazy(() => import("../pages/dashboard/tabs/admin/AdminPendingActions"));
const AdminResolveAction = lazy(() => import("../pages/dashboard/tabs/admin/AdminResolveAction"));
const AdminActivities = lazy(() => import("../pages/dashboard/tabs/admin/AdminActivities"));
const AdminUsersManagement = lazy(() => import("../pages/dashboard/tabs/admin/AdminUsersManagement"));
const AdminJobsModeration = lazy(() => import("../pages/dashboard/tabs/admin/AdminJobsModeration"));

// Lazy load named exports correctly
const RoleBasedProfile = lazy(() => import("../pages/dashboard/RoleBasedRoutes").then(m => ({ default: m.RoleBasedProfile })));
const RoleBasedEditProfile = lazy(() => import("../pages/dashboard/RoleBasedRoutes").then(m => ({ default: m.RoleBasedEditProfile })));
const EscrowDashboard = lazy(() => import("../components/payment").then(m => ({ default: m.EscrowDashboard })));

// Data-heavy components needing wrappers
const NewApplicants = lazy(() => import("../pages/dashboard/tabs/company/components/NewApplicants/NewApplicants.jsx"));
const PerformanceAnalytics = lazy(() => import("../pages/dashboard/tabs/company/components/PerformanceAnalytics/PerformanceAnalytics.jsx"));
const PublishedJobs = lazy(() => import("../pages/dashboard/tabs/company/components/PublishedJobs/PublishedJobs.jsx"));
const CompanyExport = lazy(() => import("../pages/dashboard/tabs/company/CompanyExport"));
const CompanyInterviews = lazy(() => import("../pages/dashboard/tabs/company/CompanyInterviews"));
const CompanyApplicants = lazy(() => import("../pages/dashboard/tabs/company/CompanyApplicants"));
const InterviewScheduling = lazy(() => import("../pages/dashboard/tabs/company/InterviewScheduling"));
const RecommendedJobs = lazy(() => import("../pages/dashboard/tabs/jobseeker/components/RecommendedJobs/RecommendedJobs.jsx"));
const SavedJobs = lazy(() => import("../pages/dashboard/tabs/jobseeker/components/SavedJobs/SavedJobs.jsx"));
const DetailedApplications = lazy(() => import("../pages/dashboard/tabs/jobseeker/components/DetailedApplications/DetailedApplications.jsx"));
/**
 * Company Dashboard Component Wrappers
 */
const PublishedJobsWithData = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        jobService.getCompanyJobs()
            .then(res => setJobs(res?.items || res || []))
            .catch(err => console.error("Failed to load jobs", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <TableSkeleton rows={10} columns={6} />;

    return (
        <PublishedJobs
            jobs={jobs}
            stats={{ totalJobs: jobs.length, activeJobs: jobs.filter(j => j.isPublished).length, totalViews: 0, totalApplicants: 0 }}
            filters={{}}
            pagination={{ currentPage: 1, totalPages: 1, totalItems: jobs.length }}
            onCreateJob={() => { }}
            onViewJob={() => { }}
            onEditJob={() => { }}
            onUpdateJobStatus={jobService.toggleJobStatus}
            onManageApplicants={() => { }}
            onExportData={() => { }}
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
            onViewApplicant={() => { }}
            onShortlist={updateApplicantStatus}
            onReject={updateApplicantStatus}
            onScheduleInterview={updateApplicantStatus}
            onUpdateApplicantStatus={updateApplicantStatus}
            onBulkAction={bulkApplicantAction}
            onExportData={() => { }}
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
            onPeriodChange={() => { }}
            onExport={() => { }}
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

    useEffect(() => {
        jobService.getRecommendedJobs()
            .then(res => setJobs(res?.items || res || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <TableSkeleton rows={5} columns={1} />;

    return (
        <RecommendedJobs
            jobs={jobs}
            onJobSave={jobService.saveJob}
            onJobApply={() => { }}
        />
    );
};

const SavedJobsWithData = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        jobService.getSavedJobs()
            .then(res => setJobs(res?.items || res || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <TableSkeleton rows={5} columns={1} />;

    return (
        <SavedJobs
            jobs={jobs}
            onRemoveJob={jobService.unsaveJob}
            onViewJob={() => { }}
            onApplyJob={() => { }}
        />
    );
};

const DetailedApplicationsWithData = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        jobService.getMyApplications()
            .then(res => setApplications(res?.items || res || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <TableSkeleton rows={5} columns={1} />;

    return (
        <DetailedApplications
            applications={applications}
            stats={{
                total: applications.length,
                underReview: applications.filter(app => app.status === 'review').length,
                interview: applications.filter(app => app.status === 'interview').length,
                offers: applications.filter(app => app.status === 'offer').length,
                rejected: applications.filter(app => app.status === 'rejected').length
            }}
            onViewApplication={() => { }}
            onWithdrawApplication={jobService.withdrawApplication}
        />
    );
};

const DashboardRoutes = () => {
    return (
        <Suspense fallback={<TableSkeleton rows={10} columns={6} />}>
            <Routes>
                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="profile" element={<RoleBasedProfile />} />
                    <Route path="profile/edit" element={<RoleBasedEditProfile />} />

                    {/* Company Specific Routes */}
                    <Route path="published-jobs" element={<ProtectedRoute allowedRoles={['employer', 'company', 'client']}><PublishedJobsWithData /></ProtectedRoute>} />
                    <Route path="applicants" element={<ProtectedRoute allowedRoles={['employer', 'company', 'client']}><NewApplicantsWithData /></ProtectedRoute>} />
                    <Route path="performance-analytics" element={<ProtectedRoute allowedRoles={['employer', 'company', 'client']}><PerformanceAnalyticsWithData /></ProtectedRoute>} />
                    <Route path="export" element={<ProtectedRoute allowedRoles={['employer', 'company', 'client']}><CompanyExport /></ProtectedRoute>} />
                    <Route path="interviews" element={<ProtectedRoute allowedRoles={['company', 'employer', 'client']}><CompanyInterviews /></ProtectedRoute>} />
                    <Route path="interviews/schedule" element={<ProtectedRoute allowedRoles={['company', 'employer', 'client']}><InterviewScheduling /></ProtectedRoute>} />
                    <Route path="applicants" element={<ProtectedRoute allowedRoles={['company', 'employer', 'client']}><CompanyApplicants /></ProtectedRoute>} />
                    
                    {/* Jobseeker Specific Routes */}
                    <Route path="recommended-jobs" element={<ProtectedRoute allowedRoles={['jobseeker', 'freelancer']}><RecommendedJobsWithData /></ProtectedRoute>} />
                    <Route path="saved-jobs" element={<ProtectedRoute allowedRoles={['jobseeker', 'freelancer']}><SavedJobsWithData /></ProtectedRoute>} />
                    <Route path="applications" element={<ProtectedRoute allowedRoles={['jobseeker', 'freelancer']}><DetailedApplicationsWithData /></ProtectedRoute>} />

                    {/* Admin Dashboard Routes */}
                    <Route path="users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersManagement /></ProtectedRoute>} />
                    <Route path="jobs" element={<ProtectedRoute allowedRoles={['admin']}><JobManagement /></ProtectedRoute>} />
                    <Route path="moderation" element={<ProtectedRoute allowedRoles={['admin']}><ContentModeration /></ProtectedRoute>} />
                    <Route path="statistics" element={<ProtectedRoute allowedRoles={['admin']}><StatisticsDashboard /></ProtectedRoute>} />
                    <Route path="staff" element={<ProtectedRoute allowedRoles={['admin']}><StaffManagement /></ProtectedRoute>} />
                    <Route path="subscriptions" element={<ProtectedRoute allowedRoles={['admin']}><SubscriptionManagement /></ProtectedRoute>} />
                    <Route path="reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
                    <Route path="activities" element={<ProtectedRoute allowedRoles={['admin']}><AdminActivities /></ProtectedRoute>} />
                    <Route path="pending/:actionId" element={<ProtectedRoute allowedRoles={['admin']}><AdminPendingActions /></ProtectedRoute>} />
                    <Route path="resolve/:actionId" element={<ProtectedRoute allowedRoles={['admin']}><AdminResolveAction /></ProtectedRoute>} />
                    <Route path="jobs/moderation" element={<ProtectedRoute allowedRoles={['admin']}><AdminJobsModeration /></ProtectedRoute>} />

                    {/* Payment & Escrow Dashboard Routes */}
                    <Route path="escrow" element={<EscrowDashboard />} />
                </Route>
            </Routes>
        </Suspense>
    );
};

export default DashboardRoutes;
