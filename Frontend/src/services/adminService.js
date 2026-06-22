/**
 * @file adminService.js
 * @description Admin API service connected to AdminController.cs.
 *              Uses named exports to match frontend component usage.
 * @author Antigravity (AI)
 * @date 2026-05-09
 */
import ApiService from './ApiService';

const toArray = (value) => value?.items || value?.data?.items || value?.data || value || [];

const getStatus = (value) => {
    if (value?.status) return String(value.status).toLowerCase();
    return value?.isPublished ? 'active' : 'inactive';
};

const toAdminJobRow = (job) => ({
    ...job,
    id: job.jobId || job.id,
    title: job.title || job.jobTitle || 'Untitled',
    description: job.description || '',
    company: job.companyName || job.company || 'Unknown',
    postedBy: job.postedByName || job.postedBy || 'Unknown',
    type: job.jobType || job.type || 'Unspecified',
    location: job.location || '-',
    salary: job.salary || [job.salaryMin, job.salaryMax].filter(Boolean).join(' - ') || '-',
    status: getStatus(job),
    applications: job.applicationsCount || job.applications || 0,
    reports: job.reportsCount || job.reports || 0,
    postedAt: job.createdAt || job.postedAt || job.postedDate || null,
    postedDate: job.createdAt || job.postedDate || null
});

const toAdminApplicationRow = (application) => ({
    ...application,
    id: application.applicationId || application.id,
    applicationId: application.applicationId || application.id,
    jobId: application.jobId,
    jobTitle: application.jobTitle || application.job?.title || 'Untitled',
    applicantId: application.applicantId || application.jobSeekerId,
    applicantName: application.applicantName || application.applicant || 'Unknown',
    status: application.status || 'Pending',
    appliedAt: application.appliedAt || application.createdAt || null,
    cvUrl: application.cvUrl || application.resumeUrl || application.CVUrl || ''
});

const toReportRow = (report) => ({
    ...report,
    id: report.reportId || report.id,
    reportId: report.reportId || report.id,
    reportType: report.entityType || report.type || report.reportType || 'general',
    generatedAt: report.createdAt || report.generatedAt,
    status: report.status || 'Pending',
    name: report.reason || report.entityType || 'Report',
    value: report.status || 'Pending'
});

const downloadJson = (fileName, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

/**
 * Get pending user approvals.
 * Backend: GET api/Admin/pending-approvals
 */
export const getPendingApprovals = async () => {
    const response = await ApiService.get('/api/Admin/pending-approvals');
    return response.data;
};

/**
 * Approve a user.
 * Backend: POST api/Admin/approve/{userId}
 */
export const approveUser = async (userId) => {
    const response = await ApiService.post(`/api/Admin/approve/${userId}`);
    return response.data;
};

/**
 * Toggle user status (Active/Inactive).
 * Backend: POST api/Admin/toggle-status/{userId}?isActive=bool
 */
export const toggleUserStatus = async (userId, isActive) => {
    const response = await ApiService.post(`/api/Admin/toggle-status/${userId}`, null, {
        params: { isActive }
    });
    return response.data;
};

/**
 * Delete a user.
 * Backend: DELETE api/Admin/user/{userId}
 */
export const deleteUser = async (userId) => {
    const response = await ApiService.delete(`/api/Admin/user/${userId}`);
    return response.data;
};

/**
 * Get admin dashboard metrics.
 * Backend: GET api/Admin/dashboard/metrics
 */
export const getDashboardMetrics = async () => {
    const response = await ApiService.get('/api/Admin/dashboard/metrics');
    return response.data;
};

export const getAdminJobs = async () => {
    const response = await ApiService.get('/api/Admin/jobs');
    return toArray(response).map(toAdminJobRow);
};

export const getAdminApplications = async () => {
    const response = await ApiService.get('/api/Admin/applications');
    return toArray(response).map(toAdminApplicationRow);
};

/**
 * Get pending reports.
 * Backend: GET api/Admin/reports
 */
export const getPendingReports = async () => {
    const response = await ApiService.get('/api/Admin/reports');
    return response.data;
};

/**
 * Resolve a report.
 * Backend: POST api/Admin/reports/{id}/resolve?action=string
 */
export const resolveReport = async (reportId, action) => {
    const response = await ApiService.post(`/api/Admin/reports/${reportId}/resolve`, null, {
        params: { action }
    });
    return response.data;
};

// Reports
export const getReportTypes = async () => {
    const reports = toArray(await getPendingReports());
    const types = [...new Set(reports.map(r => r.entityType || r.type || r.reportType || 'general'))];
    return {
        success: true,
        data: types.length > 0
            ? types.map(t => ({ id: t, name: t, description: `${t} reports currently pending review` }))
            : [{ id: 'dashboard', name: 'Dashboard', description: 'Current admin dashboard metrics' }]
    };
};

export const getReportHistory = async () => {
    const reports = toArray(await getPendingReports()).map(toReportRow);
    return { success: true, data: reports };
};

export const generateReport = async (reportType = 'dashboard') => {
    if (reportType === 'dashboard') {
        const metrics = await getDashboardMetrics();
        return {
            success: true,
            data: {
                reportId: `dashboard-${Date.now()}`,
                reportType,
                generatedAt: new Date().toISOString(),
                rows: Object.entries(metrics || {}).map(([name, value]) => ({ id: name, name, value }))
            }
        };
    }

    const reports = toArray(await getPendingReports())
        .filter(r => (r.entityType || r.type || r.reportType || 'general') === reportType)
        .map(toReportRow);

    return {
        success: true,
        data: {
            reportId: `${reportType}-${Date.now()}`,
            reportType,
            generatedAt: new Date().toISOString(),
            rows: reports
        }
    };
};

export const downloadReport = async (reportId, format = 'json') => {
    const reports = toArray(await getPendingReports()).map(toReportRow);
    const report = reports.find(r => String(r.reportId) === String(reportId)) || { reportId, reports };
    downloadJson(`admin-report-${reportId}.${format === 'json' ? 'json' : 'json'}`, report);
    return { success: true, data: report };
};

// Pending Actions
export const getPendingActions = async () => {
    const items = toArray(await getPendingApprovals());
    return { success: true, data: { items } };
};

export const bulkApprove = async (userIds) => {
    const results = await Promise.all(userIds.map(id => approveUser(id)));
    return { success: true, results };
};

export const bulkReject = async (userIds) => {
    const results = await Promise.all(userIds.map(id => deleteUser(id)));
    return { success: true, results };
};

export const getPendingItemDetail = async (actionId, itemId) => {
    const items = toArray(await getPendingApprovals());
    const item = items.find(i => String(i.userId || i.id) === String(itemId));
    if (!item) return { success: false, data: null };

    return {
        success: true,
        data: {
            ...item,
            id: item.userId || item.id,
            title: `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.email,
            email: item.email,
            status: item.registrationStatus || 'PendingApproval',
            submittedAt: item.createdAt,
            priority: 'medium'
        }
    };
};

export const resolvePendingItem = async (actionId, itemId, resolution = {}) => {
    const action = typeof resolution === 'string' ? resolution : resolution.action;
    if (action === 'approve' || action === 'approved') {
        const data = await approveUser(itemId);
        return { success: true, data };
    }

    if (action === 'reject' || action === 'rejected') {
        const data = await deleteUser(itemId);
        return { success: true, data };
    }

    throw new Error(`Unsupported pending item action: ${action}`);
};

// Activities
export const getActivities = async () => {
    const response = await ApiService.get('/api/Dashboard/summary');
    const summary = response.data;
    const activities = summary?.recentActivities || summary?.activities || [];
    return { success: true, data: { activities } };
};

export const getActivityTypes = async () => ({
    success: true,
    data: [
        { id: 'login', name: 'Login' },
        { id: 'job', name: 'Job Posting' },
        { id: 'application', name: 'Application' },
        { id: 'registration', name: 'Registration' },
        { id: 'payment', name: 'Payment' }
    ]
});

export const exportActivities = async () => {
    const response = await ApiService.get('/api/Dashboard/summary');
    downloadJson('admin-activities.json', response.data);
    return { success: true, data: response.data };
};

// Users Management
export const getUsers = async () => {
    const users = toArray(await getPendingApprovals());
    return { success: true, data: { users } };
};

export const updateUserStatus = async (userId, status) => {
    const isActive = status === 'active' || status === true;
    const data = await toggleUserStatus(userId, isActive);
    return { success: true, data };
};

export const updateUserRole = async () => {
    throw new Error('Changing user roles is not supported by the current Admin API.');
};

// Jobs Moderation
export const getJobsForModeration = async (params = {}) => {
    const jobs = await getAdminJobs();
    const searchTerm = params.search?.toLowerCase();
    const status = params.status && params.status !== 'all' ? params.status.toLowerCase() : null;
    const filteredJobs = jobs.filter(job => {
        const matchesStatus = !status || job.status === status;
        const matchesSearch = !searchTerm
            || job.title.toLowerCase().includes(searchTerm)
            || job.company.toLowerCase().includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    const page = params.page || 1;
    const limit = params.limit || filteredJobs.length || 1;
    const start = (page - 1) * limit;

    return {
        success: true,
        data: {
            jobs: filteredJobs.slice(start, start + limit),
            pagination: {
                totalItems: filteredJobs.length,
                totalPages: Math.max(1, Math.ceil(filteredJobs.length / limit)),
                page,
                limit
            }
        }
    };
};

export const approveJob = async (jobId) => {
    const response = await ApiService.put(`/api/Admin/jobs/${jobId}/status`, true, {
        headers: { 'Content-Type': 'application/json' }
    });
    return { success: true, data: response.data };
};

export const rejectJob = async (jobId) => {
    const response = await ApiService.put(`/api/Admin/jobs/${jobId}/status`, false, {
        headers: { 'Content-Type': 'application/json' }
    });
    return { success: true, data: response.data };
};

export const editJob = async (jobId, jobData) => {
    const response = await ApiService.put(`/api/jobs/${jobId}`, jobData);
    return { success: true, data: response.data };
};

const adminService = {
    getPendingApprovals,
    approveUser,
    toggleUserStatus,
    deleteUser,
    getDashboardMetrics,
    getAdminJobs,
    getAdminApplications,
    getPendingReports,
    resolveReport,
    getReportTypes,
    getReportHistory,
    generateReport,
    downloadReport,
    getPendingActions,
    bulkApprove,
    bulkReject,
    getPendingItemDetail,
    resolvePendingItem,
    getActivities,
    getActivityTypes,
    exportActivities,
    getUsers,
    updateUserStatus,
    updateUserRole,
    getJobsForModeration,
    approveJob,
    rejectJob,
    editJob
};

export default adminService;
