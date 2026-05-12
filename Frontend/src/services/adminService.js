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

export const getJobsForModeration = async () => ({ success: true, data: { jobs: [] } });
export const approveJob = async () => ({ success: true });
export const rejectJob = async () => ({ success: true });
export const editJob = async () => ({ success: true });

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