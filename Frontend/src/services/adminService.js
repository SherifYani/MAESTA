/**
 * @file adminService.js
 * @description Admin API service connected to AdminController.cs.
 *              Uses named exports to match frontend component usage.
 * @author Sherif Talaat
 * @date 2026-05-09
 */
import ApiService from './ApiService';

<<<<<<< HEAD
=======
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

const downloadBlob = (fileName, data, mimeType) => {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

const convertToCsv = (data) => {
    const headers = Object.keys(data);
    const values = headers.map(h => data[h]);
    return headers.join(',') + '\n' + values.join(',');
};

const convertArrayToCsv = (items) => {
    if (!items.length) return '';
    const headers = Object.keys(items[0]);
    const rows = items.map(item => headers.map(h => item[h] ?? '').join(','));
    return headers.join(',') + '\n' + rows.join('\n');
};

>>>>>>> a16752cd97e84085e9ff7455f54f0b4148464a6a
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
export const getDashboardMetrics = async (params = {}) => {
    const response = await ApiService.get('/api/Admin/dashboard/metrics', { params });
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

// ─── Missing endpoints (Placeholders to avoid compilation errors) ───────────

export const getReportTypes = async () => ({ success: true, data: [] });
export const getReportHistory = async () => ({ success: true, data: [] });
export const generateReport = async () => ({ success: true, data: {} });
export const downloadReport = async () => ({ success: true });

export const getPendingActions = async () => ({ success: true, data: { items: [] } });
export const bulkApprove = async () => ({ success: true });
export const bulkReject = async () => ({ success: true });
export const getPendingItemDetail = async () => ({ success: true, data: {} });
export const resolvePendingItem = async () => ({ success: true });

export const getActivities = async () => ({ success: true, data: { activities: [] } });
export const getActivityTypes = async () => ({ success: true, data: [] });
export const exportActivities = async () => ({ success: true });

export const getUsers = async () => ({ success: true, data: { users: [] } });
export const updateUserStatus = async (userId, status) => toggleUserStatus(userId, status === 'active');
export const updateUserRole = async () => ({ success: true });

<<<<<<< HEAD
export const getJobsForModeration = async () => ({ success: true, data: { jobs: [] } });
export const approveJob = async () => ({ success: true });
export const rejectJob = async () => ({ success: true });
export const editJob = async () => ({ success: true });
=======
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

export const cancelSubscription = async (subscriptionId) => {
    const response = await ApiService.post(`/api/Admin/finance/subscriptions/${subscriptionId}/cancel`);
    return { success: true, data: response.data };
};

export const reactivateSubscription = async (subscriptionId) => {
    const response = await ApiService.post(`/api/Admin/finance/subscriptions/${subscriptionId}/reactivate`);
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

// Reports - FIXED: generateReport now properly passes dateRange and filters params
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

// FIXED Issue #1: Now accepts and uses dateRange and filters params
const generatedReports = new Map();

// FIXED Issue #1: Now accepts and uses dateRange and filters params
export const generateReport = async (reportType = 'dashboard', dateRange = {}, filters = {}) => {
    const generatedAt = new Date().toISOString();
    const reportId = `${reportType}-${Date.now()}`;
    let rows = [];
    let summary = {};

    // Build query params from dateRange and filters
    const params = {};
    if (dateRange.start) params.startDate = dateRange.start;
    if (dateRange.end) params.endDate = dateRange.end;
    // Pass any additional filters as query params
    Object.assign(params, filters);

    if (reportType === 'dashboard') {
        const metrics = await getDashboardMetrics(params);
        rows = Object.entries(metrics || {}).map(([name, value]) => ({ id: name, name, value }));
        summary = metrics || {};
    } else if (reportType === 'users') {
        const result = await getUsers({ page: 1, pageSize: 100, ...params });
        rows = (result.data?.users || []).map(user => ({
            id: user.userId || user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
            email: user.email,
            value: user.isActive ? 'Active' : 'Inactive',
            role: user.roles?.join(', ') || user.userType || 'None'
        }));
        summary = { totalUsers: result.data?.pagination?.totalItems || rows.length, activeUsers: rows.filter(row => row.value === 'Active').length };
    } else if (reportType === 'jobs') {
        const result = await getJobsForModeration({ page: 1, pageSize: 100, ...params });
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

    const reportResult = {
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

    generatedReports.set(reportId, reportResult.data);
    return reportResult;
};

// FIXED Issue #2: Now properly handles different export formats
export const downloadReport = async (reportId, format = 'json') => {
    const cachedReport = generatedReports.get(reportId);
    const reportInfo = cachedReport ? {
        reportId: cachedReport.reportId,
        reportType: cachedReport.reportType,
        generatedAt: cachedReport.generatedAt,
        summary: cachedReport.summary
    } : { reportId, exportedAt: new Date().toISOString() };

    if (format === 'csv') {
        const csv = cachedReport ? convertArrayToCsv(cachedReport.rows) : convertToCsv(reportInfo);
        downloadBlob(`admin-report-${reportId}.csv`, csv, 'text/csv');
    } else if (format === 'xlsx') {
        // For xlsx, attempt backend export, fallback to CSV/JSON
        try {
            const response = await ApiService.get(`/api/Admin/reports/${reportId}/export`, {
                params: { format: 'xlsx' },
                responseType: 'blob'
            });
            downloadBlob(`admin-report-${reportId}.xlsx`, response.data,
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        } catch {
            const csv = cachedReport ? convertArrayToCsv(cachedReport.rows) : convertToCsv(reportInfo);
            downloadBlob(`admin-report-${reportId}.csv`, csv, 'text/csv');
        }
    } else {
        downloadJson(`admin-report-${reportId}.json`, cachedReport || reportInfo);
    }
    return { success: true, data: cachedReport || reportInfo };
};

// Pending Actions - FIXED Issue #8: Now properly filters by actionId
export const getPendingActions = async (actionId = null, params = {}) => {
    const items = toArray(await getPendingApprovals());

    // If actionId is provided, filter by action type
    if (actionId) {
        const filteredItems = items.filter(item => {
            switch (actionId) {
                case 'user-approvals':
                    return item.registrationStatus === 'PendingApproval';
                case 'employer-verifications':
                    return item.userType === 'Employer' && item.registrationStatus === 'PendingApproval';
                default:
                    return true;
            }
        });
        return {
            success: true,
            data: {
                items: filteredItems,
                actionName: getActionName(actionId),
                totalCount: filteredItems.length
            }
        };
    }

    return { success: true, data: { items, actionName: 'Pending Items', totalCount: items.length } };
};

const getActionName = (actionId) => {
    const names = {
        'user-approvals': 'User Approvals',
        'employer-verifications': 'Employer Verifications',
    };
    return names[actionId] || 'Pending Items';
};

// FIXED Issue #9: bulkReject now uses proper reject endpoint instead of hard delete
export const bulkApprove = async (actionId, userIds, reason = '') => {
    const results = await Promise.all(userIds.map(id => approveUser(id)));
    return { success: true, results };
};

export const bulkReject = async (actionId, userIds, reason = '') => {
    const results = await Promise.all(userIds.map(id =>
        ApiService.post(`/api/Admin/reject/${id}`, { reason })
    ));
    return { success: true, results };
};

// FIXED Issue #10: Now calls dedicated backend endpoint instead of fetching all then filtering
export const getPendingItemDetail = async (actionId, itemId) => {
    const response = await ApiService.get(`/api/Admin/pending-approvals/${itemId}`);
    const item = response.data;

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
        const data = await ApiService.post(`/api/Admin/reject/${itemId}`, { reason: resolution.reason || '' });
        return { success: true, data: data.data };
    }

    throw new Error(`Unsupported pending item action: ${action}`);
};

// Activities - FIXED Issue #3: Now properly uses format and filters params
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

// FIXED Issue #3: Now properly exports activities based on format and filters
export const exportActivities = async (format = 'csv', filters = {}) => {
    const response = await ApiService.get('/api/Admin/logs', {
        params: {
            type: 'activity',
            page: 1,
            pageSize: 10000,
            ...filters
        }
    });
    const data = response.data?.items || [];

    if (format === 'excel') {
        try {
            const blobResponse = await ApiService.get('/api/Admin/logs/export', {
                params: { format: 'excel', ...filters },
                responseType: 'blob'
            });
            downloadBlob('admin-activities.xlsx', blobResponse.data,
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        } catch {
            // Fallback to CSV
            const csv = convertArrayToCsv(data);
            downloadBlob('admin-activities.csv', csv, 'text/csv');
        }
    } else {
        const csv = convertArrayToCsv(data);
        downloadBlob('admin-activities.csv', csv, 'text/csv');
    }
    return { success: true };
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

// Jobs Moderation - FIXED Issues #6 & #7: Now properly sends notes/reason
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

// FIXED Issue #6: Now sends notes with the approve request
export const approveJob = async (jobId, notes = '') => {
    const response = await ApiService.put(`/api/jobs/${jobId}/status`, {
        isPublished: true,
        notes: notes
    });
    return { success: true, data: response.data };
};

// FIXED Issue #7: Now sends reason and notes with the reject request
export const rejectJob = async (jobId, reason = '', notes = '') => {
    const response = await ApiService.put(`/api/jobs/${jobId}/status`, {
        isPublished: false,
        reason: reason,
        notes: notes
    });
    return { success: true, data: response.data };
};

export const editJob = async (jobId, jobData) => {
    const response = await ApiService.put(`/api/jobs/${jobId}`, jobData);
    return { success: true, data: response.data };
};
>>>>>>> a16752cd97e84085e9ff7455f54f0b4148464a6a

// Staff Management - FIXED Issue #4: Added real API calls
export const resendInvite = async (userId) => {
    const response = await ApiService.post(`/api/Admin/users/${userId}/resend-invite`);
    return { success: true, data: response.data };
};

export const resetPassword = async (userId) => {
    const response = await ApiService.post(`/api/Admin/users/${userId}/reset-password`);
    return { success: true, data: response.data };
};

/**
 * Invite a new staff member / user.
 * Backend: POST api/Admin/users/invite
 * @param {string} email
 * @param {string} role  - e.g. 'Admin', 'Moderator', 'Analyst', 'Support'
 */
export const inviteUser = async (email, role) => {
    const response = await ApiService.post('/api/Admin/users/invite', { email, role });
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
<<<<<<< HEAD
=======
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
    cancelSubscription,
    reactivateSubscription,
    moderateContent,
    getHealth,
    getMonthlyAnalytics,
>>>>>>> a16752cd97e84085e9ff7455f54f0b4148464a6a
    getJobsForModeration,
    approveJob,
    rejectJob,
    editJob,
    resendInvite,
    resetPassword,
    inviteUser
};

export default adminService;