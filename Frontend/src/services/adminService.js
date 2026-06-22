/**
 * @file adminService.js
 * @description Admin API service connected to AdminController.cs.
 *              Uses named exports to match frontend component usage.
 * @author Antigravity (AI)
 * @date 2026-05-09
 */
import ApiService from './ApiService';

const toArray = (value) => value?.items || value?.data?.items || value?.data || value || [];

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

export const getRoles = async () => {
    const response = await ApiService.get('/api/Admin/roles');
    return { success: true, data: response.data };
};

export const assignRole = async (userId, roleName) => {
    const response = await ApiService.post(`/api/Admin/users/${userId}/roles/${roleName}`);
    return { success: true, data: response.data };
};

export const removeRole = async (userId, roleName) => {
    const response = await ApiService.delete(`/api/Admin/users/${userId}/roles/${roleName}`);
    return { success: true, data: response.data };
};

export const grantAdmin = async (userId) => {
    const response = await ApiService.post(`/api/Admin/grant-admin/${userId}`);
    return { success: true, data: response.data };
};

export const revokeAdmin = async (userId) => {
    const response = await ApiService.post(`/api/Admin/revoke-admin/${userId}`);
    return { success: true, data: response.data };
};

export const getLogs = async (params = {}) => {
    const response = await ApiService.get('/api/Admin/logs', { params });
    return { success: true, data: response.data };
};

export const getSettings = async (category) => {
    const response = await ApiService.get('/api/Admin/settings', { params: { category } });
    return { success: true, data: response.data };
};

export const upsertSetting = async (payload) => {
    const response = await ApiService.post('/api/Admin/settings', payload);
    return { success: true, data: response.data };
};

export const getFinanceSummary = async () => {
    const response = await ApiService.get('/api/Admin/finance/summary');
    return { success: true, data: response.data };
};

export const getWithdrawals = async (status) => {
    const response = await ApiService.get('/api/Admin/finance/withdrawals', { params: { status } });
    return { success: true, data: response.data };
};

export const getRefunds = async (status) => {
    const response = await ApiService.get('/api/Admin/finance/refunds', { params: { status } });
    return { success: true, data: response.data };
};

export const getSubscriptions = async (status) => {
    const response = await ApiService.get('/api/Admin/finance/subscriptions', { params: { status } });
    return { success: true, data: response.data };
};

export const updateWithdrawalStatus = async (id, status, reason = '') => {
    const response = await ApiService.post(`/api/Admin/finance/withdrawals/${id}/status`, { status, reason });
    return { success: true, data: response.data };
};

export const updateRefundStatus = async (id, status, reason = '') => {
    const response = await ApiService.post(`/api/Admin/finance/refunds/${id}/status`, { status, reason });
    return { success: true, data: response.data };
};

export const moderateContent = async (payload) => {
    const response = await ApiService.post('/api/Admin/moderation/action', payload);
    return { success: true, data: response.data };
};

export const getHealth = async () => {
    const response = await ApiService.get('/api/Admin/health');
    return { success: true, data: response.data };
};

export const getMonthlyAnalytics = async (months = 6) => {
    const response = await ApiService.get('/api/Admin/analytics/monthly', { params: { months } });
    return { success: true, data: response.data };
};

// Reports
export const getReportTypes = async () => {
    return {
        success: true,
        data: [
            { id: 'dashboard', name: 'Dashboard Summary', description: 'Users, jobs, projects, reports, interviews, and revenue.' },
            { id: 'users', name: 'Users Report', description: 'User accounts, status, registration state, and assigned roles.' },
            { id: 'jobs', name: 'Jobs Report', description: 'Job posts, status, applications, reports, and publishers.' },
            { id: 'finance', name: 'Finance Report', description: 'Revenue, withdrawals, refunds, and subscription totals.' },
            { id: 'moderation', name: 'Moderation Report', description: 'Pending reports and moderation queue.' },
            { id: 'health', name: 'System Health', description: 'API, database, user counts, and operational checks.' }
        ]
    };
};

export const getReportHistory = async () => {
    const reports = toArray(await getPendingReports()).map(toReportRow);
    return { success: true, data: reports.slice(0, 10) };
};

export const generateReport = async (reportType = 'dashboard') => {
    const generatedAt = new Date().toISOString();
    const reportId = `${reportType}-${Date.now()}`;
    let rows = [];
    let summary = {};

    if (reportType === 'dashboard') {
        const metrics = await getDashboardMetrics();
        rows = Object.entries(metrics || {}).map(([name, value]) => ({ id: name, name, value }));
        summary = metrics || {};
    } else if (reportType === 'users') {
        const result = await getUsers({ page: 1, pageSize: 100 });
        rows = (result.data?.users || []).map(user => ({
            id: user.userId || user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
            email: user.email,
            value: user.isActive ? 'Active' : 'Inactive',
            role: user.roles?.join(', ') || user.userType || 'None'
        }));
        summary = { totalUsers: result.data?.pagination?.totalItems || rows.length, activeUsers: rows.filter(row => row.value === 'Active').length };
    } else if (reportType === 'jobs') {
        const result = await getJobsForModeration({ page: 1, pageSize: 100 });
        rows = (result.data?.jobs || []).map(job => ({
            id: job.jobId || job.id,
            name: job.title,
            value: job.isDeleted ? 'Deleted' : job.isActive ? 'Active' : 'Inactive',
            company: job.companyName || job.postedByEmail || 'Unknown',
            applications: job.applicationsCount || 0,
            reports: job.reportsCount || 0
        }));
        summary = { totalJobs: result.data?.pagination?.totalItems || rows.length, activeJobs: rows.filter(row => row.value === 'Active').length };
    } else if (reportType === 'finance') {
        const result = await getFinanceSummary();
        summary = result.data || {};
        rows = Object.entries(summary).map(([name, value]) => ({ id: name, name, value }));
    } else if (reportType === 'health') {
        const result = await getHealth();
        summary = result.data || {};
        rows = Object.entries(summary).map(([name, value]) => ({ id: name, name, value: typeof value === 'object' ? JSON.stringify(value) : value }));
    } else {
        rows = toArray(await getPendingReports()).map(toReportRow);
        summary = { pendingReports: rows.length };
    }

    return {
        success: true,
        data: {
            reportId,
            reportType,
            generatedAt,
            summary,
            rows,
            data: rows
        }
    };
};

export const downloadReport = async (reportId, format = 'json') => {
    const report = { reportId, exportedAt: new Date().toISOString() };
    downloadJson(`admin-report-${reportId}.json`, report);
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
export const getActivities = async (params = {}) => {
    const response = await ApiService.get('/api/Admin/logs', {
        params: {
            type: params.type || 'activity',
            level: params.level,
            page: params.page || 1,
            pageSize: params.pageSize || params.limit || 50
        }
    });
    const data = response.data || {};
    const activities = (data.items || []).map((activity) => ({
        ...activity,
        id: activity.id || activity.activityId,
        user: activity.userName || activity.userEmail || (activity.userId ? `User #${activity.userId}` : 'System'),
        action: activity.action || activity.levelOrAction || 'Activity',
        details: activity.details || activity.message || activity.metadata || '',
        timestamp: activity.timestamp || activity.createdAt,
        time: activity.time || activity.createdAt,
    }));

    return {
        success: true,
        data: {
            activities,
            pagination: {
                totalPages: data.totalPages || 1,
                totalItems: data.totalItems || 0,
                page: data.page || 1,
                pageSize: data.pageSize || 50
            }
        }
    };
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
export const getUsers = async (params = {}) => {
    const response = await ApiService.get('/api/Admin/users', {
        params: {
            search: params.search,
            userType: params.userType || params.role,
            status: params.status,
            page: params.page || 1,
            pageSize: params.pageSize || params.limit || 20
        }
    });
    const data = response.data || {};
    return {
        success: true,
        data: {
            users: data.items || [],
            pagination: {
                totalPages: data.totalPages || 1,
                totalItems: data.totalItems || 0,
                page: data.page || 1,
                pageSize: data.pageSize || 20
            }
        }
    };
};

export const updateUserStatus = async (userId, status) => {
    const isActive = status === 'active' || status === true;
    const data = await toggleUserStatus(userId, isActive);
    return { success: true, data };
};

export const updateUserRole = async (userId, roleName) => {
    const normalized = normalizeRoleName(roleName);
    if (normalized === 'Admin') return grantAdmin(userId);
    return assignRole(userId, normalized);
};

const normalizeRoleName = (roleName = '') => {
    const normalized = roleName.trim().toLowerCase();
    const roleMap = {
        admin: 'Admin',
        employer: 'Employer',
        company: 'Employer',
        jobseeker: 'JobSeeker',
        job_seeker: 'JobSeeker',
        freelancer: 'Freelancer',
        client: 'Client'
    };
    return roleMap[normalized] || roleName;
};

// Jobs Moderation
export const getJobsForModeration = async (params = {}) => {
    const response = await ApiService.get('/api/Admin/jobs', {
        params: {
            search: params.search,
            status: params.status,
            page: params.page || 1,
            pageSize: params.pageSize || params.limit || 50
        }
    });
    const data = response.data || {};
    return {
        success: true,
        data: {
            jobs: data.items || [],
            pagination: {
                totalPages: data.totalPages || 1,
                totalItems: data.totalItems || 0,
                page: data.page || 1,
                pageSize: data.pageSize || 50
            }
        }
    };
};

export const approveJob = async (jobId) => {
    const response = await ApiService.put(`/api/jobs/${jobId}/status`, true, {
        headers: { 'Content-Type': 'application/json' }
    });
    return { success: true, data: response.data };
};

export const rejectJob = async (jobId) => {
    const response = await ApiService.put(`/api/jobs/${jobId}/status`, false, {
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
    getRoles,
    assignRole,
    removeRole,
    grantAdmin,
    revokeAdmin,
    getLogs,
    getSettings,
    upsertSetting,
    getFinanceSummary,
    getWithdrawals,
    getRefunds,
    getSubscriptions,
    updateWithdrawalStatus,
    updateRefundStatus,
    moderateContent,
    getHealth,
    getMonthlyAnalytics,
    getJobsForModeration,
    approveJob,
    rejectJob,
    editJob
};

export default adminService;
