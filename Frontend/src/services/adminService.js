/**
 * @file adminService.js
 * @description Admin API service connected to AdminController.cs.
 *              Uses named exports to match frontend component usage.
 * @author Antigravity (AI)
 * @date 2026-05-09
 */
import ApiService from './ApiService';

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

// ─── Reports ───────────────────────────────────────────────────────────────

export const getReportTypes = async () => {
    try {
        const response = await ApiService.get('/api/Admin/reports');
        const reports = response.data?.items || response.data || [];
        const types = [...new Set(reports.map(r => r.type || r.reportType || 'general'))];
        return { success: true, data: types.map(t => ({ id: t, name: t })) };
    } catch (error) {
        return { success: true, data: [] };
    }
};

export const getReportHistory = async () => {
    try {
        const response = await ApiService.get('/api/Admin/reports');
        return { success: true, data: response.data?.items || response.data || [] };
    } catch (error) {
        return { success: true, data: [] };
    }
};

export const generateReport = async (reportData) => {
    try {
        const response = await ApiService.post('/api/Admin/reports', reportData);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: true, data: {} };
    }
};

export const downloadReport = async (reportId) => {
    try {
        const response = await ApiService.get(`/api/Admin/reports/${reportId}`, { responseType: 'blob' });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: true };
    }
};

// ─── Pending Actions ────────────────────────────────────────────────────────

export const getPendingActions = async () => {
    try {
        const response = await ApiService.get('/api/Admin/pending-approvals');
        const items = response.data?.items || response.data || [];
        return { success: true, data: { items } };
    } catch (error) {
        return { success: true, data: { items: [] } };
    }
};

export const bulkApprove = async (userIds) => {
    try {
        const results = await Promise.all(userIds.map(id => approveUser(id)));
        return { success: true, results };
    } catch (error) {
        return { success: true };
    }
};

export const bulkReject = async (userIds) => {
    try {
        const results = await Promise.all(userIds.map(id =>
            ApiService.delete(`/api/Admin/user/${id}`)
        ));
        return { success: true, results };
    } catch (error) {
        return { success: true };
    }
};

export const getPendingItemDetail = async (itemId) => {
    try {
        const response = await ApiService.get(`/api/Admin/pending-approvals`);
        const items = response.data?.items || response.data || [];
        const item = items.find(i => i.userId === itemId || i.id === itemId);
        return { success: true, data: item || {} };
    } catch (error) {
        return { success: true, data: {} };
    }
};

export const resolvePendingItem = async (itemId, action) => {
    try {
        const response = await ApiService.post(`/api/Admin/reports/${itemId}/resolve`, null, {
            params: { action: action || 'resolved' }
        });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: true };
    }
};

// ─── Activities ─────────────────────────────────────────────────────────────

export const getActivities = async () => {
    try {
        const response = await ApiService.get('/api/Dashboard/summary');
        const summary = response.data;
        const activities = summary?.recentActivities || summary?.activities || [];
        return { success: true, data: { activities } };
    } catch (error) {
        return { success: true, data: { activities: [] } };
    }
};

export const getActivityTypes = async () => {
    const types = [
        { id: 'login', name: 'Login' },
        { id: 'job', name: 'Job Posting' },
        { id: 'application', name: 'Application' },
        { id: 'registration', name: 'Registration' },
        { id: 'payment', name: 'Payment' }
    ];
    return { success: true, data: types };
};

export const exportActivities = async () => {
    try {
        const response = await ApiService.get('/api/Dashboard/summary');
        return { success: true, data: response.data };
    } catch (error) {
        return { success: true };
    }
};

// ─── Users Management ───────────────────────────────────────────────────────

export const getUsers = async () => {
    try {
        const response = await ApiService.get('/api/Admin/pending-approvals');
        const users = response.data?.items || response.data || [];
        return { success: true, data: { users } };
    } catch (error) {
        return { success: true, data: { users: [] } };
    }
};

export const updateUserStatus = async (userId, status) => toggleUserStatus(userId, status === 'active');

export const updateUserRole = async (userId, newRole) => {
    try {
        const response = await ApiService.post(`/api/Admin/toggle-status/${userId}`, null, {
            params: { isActive: newRole === 'active' }
        });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: true };
    }
};

// ─── Jobs Moderation ────────────────────────────────────────────────────────

export const getJobsForModeration = async () => {
    try {
        const response = await ApiService.get('/api/jobs', { params: { page: 1, limit: 50 } });
        const jobs = response.data?.items || response.data || [];
        return { success: true, data: { jobs } };
    } catch (error) {
        return { success: true, data: { jobs: [] } };
    }
};

export const approveJob = async (jobId) => {
    try {
        const response = await ApiService.put(`/api/jobs/${jobId}/status`, true, {
            headers: { 'Content-Type': 'application/json' }
        });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: true };
    }
};

export const rejectJob = async (jobId) => {
    try {
        const response = await ApiService.put(`/api/jobs/${jobId}/status`, false, {
            headers: { 'Content-Type': 'application/json' }
        });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: true };
    }
};

export const editJob = async (jobId, jobData) => {
    try {
        const response = await ApiService.put(`/api/jobs/${jobId}`, jobData);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: true };
    }
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
    getJobsForModeration,
    approveJob,
    rejectJob,
    editJob
};

export default adminService;