/**
 * @file adminService.js
 * @description Admin API service with mock data support.
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-05-04
 */
import ApiService from './ApiService';

const USE_MOCK_DATA = true; 

// Mock data functions
const mockReportsTypes = {
    success: true,
    data: [
        { id: 'user_statistics', name: 'User Statistics', description: 'User registration, activity, and engagement metrics', icon: 'users' },
        { id: 'revenue_report', name: 'Revenue Report', description: 'Platform revenue and payment analytics', icon: 'dollar-sign' },
        { id: 'job_analytics', name: 'Job Analytics', description: 'Job posting performance and application metrics', icon: 'briefcase' },
        { id: 'moderation_report', name: 'Moderation Report', description: 'Content moderation and flagged items', icon: 'shield' },
    ],
};

const generateMockReport = (reportType, dateRange, filters) => {
    return {
        success: true,
        data: {
            reportId: `rep_${Date.now()}`,
            reportType,
            generatedAt: new Date().toISOString(),
            summary: {
                totalUsers: 1520,
                newRegistrations: Math.floor(Math.random() * 200),
                activeUsers: 980,
                growthRate: '+8.5%',
            },
            data: Array(10).fill().map((_, i) => ({
                id: i + 1,
                name: `Item ${i + 1}`,
                value: Math.floor(Math.random() * 1000),
            })),
        },
    };
};

const mockPendingActions = {
    success: true,
    data: {
        actionId: 'pending_users',
        actionName: 'Pending User Approvals',
        totalCount: 25,
        items: [
            { id: 'user_1', type: 'user_registration', title: 'John Doe', email: 'john@example.com', submittedAt: '2026-05-03T10:00:00Z', status: 'pending', priority: 'high', details: { registrationDate: '2026-05-03', profileCompleteness: 85, verificationStatus: 'pending' } },
            { id: 'user_2', type: 'user_registration', title: 'Jane Smith', email: 'jane@example.com', submittedAt: '2026-05-02T14:30:00Z', status: 'pending', priority: 'medium', details: { registrationDate: '2026-05-02', profileCompleteness: 45, verificationStatus: 'pending' } },
            // more mock items...
        ],
    },
};

const mockActivities = {
    success: true,
    data: {
        activities: [
            { id: 'act_1', type: 'user_signup', user: 'John Doe', userId: 'user_1', action: 'registered a new account', timestamp: '2026-05-04T09:00:00Z', ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0...', details: { registrationMethod: 'email' } },
        ],
        pagination: { currentPage: 1, totalPages: 5, totalItems: 100, itemsPerPage: 20 },
    },
};

const mockUsers = {
    success: true,
    data: {
        users: [
            { id: 'user_1', name: 'John Doe', email: 'john@example.com', role: 'jobseeker', status: 'active', createdAt: '2026-01-15T10:00:00Z', lastLogin: '2026-05-04T09:00:00Z', profileCompleteness: 85 },
            { id: 'user_2', name: 'Jane Smith', email: 'jane@example.com', role: 'company', status: 'suspended', createdAt: '2026-02-20T11:00:00Z', lastLogin: '2026-04-30T14:00:00Z', profileCompleteness: 100 },
        ],
        pagination: { currentPage: 1, totalPages: 10, totalItems: 200, itemsPerPage: 20 },
    },
};

const mockJobsModeration = {
    success: true,
    data: {
        jobs: [
            { id: 'job_1', title: 'Senior Developer', company: 'Tech Corp', postedBy: 'user_2', postedAt: '2026-05-03T10:00:00Z', status: 'pending', flagReason: null, description: 'We are looking for...', location: 'Remote', salary: '$80,000 - $120,000' },
        ],
        pagination: { currentPage: 1, totalPages: 5, totalItems: 50, itemsPerPage: 20 },
    },
};

export const getReportTypes = async () => {
    if (USE_MOCK_DATA) return mockReportsTypes;
    const response = await ApiService.get('/api/admin/reports/types');
    return response.data;
};

export const generateReport = async (reportType, dateRange, filters) => {
    if (USE_MOCK_DATA) return generateMockReport(reportType, dateRange, filters);
    const response = await ApiService.post('/api/admin/reports/generate', { reportType, dateRange, filters });
    return response.data;
};

export const downloadReport = async (reportId, format) => {
    if (USE_MOCK_DATA) {
        window.open(`/mock-download/${reportId}.${format}`, '_blank');
        return { success: true };
    }
    const response = await ApiService.get(`/api/admin/reports/${reportId}/download`, { params: { format }, responseType: 'blob' });
    return response.data;
};

export const getReportHistory = async () => {
    if (USE_MOCK_DATA) return { success: true, data: [] };
    const response = await ApiService.get('/api/admin/reports/history');
    return response.data;
};

export const getPendingActions = async (actionId, params = {}) => {
    if (USE_MOCK_DATA) return mockPendingActions;
    const response = await ApiService.get(`/api/admin/pending/${actionId}`, { params });
    return response.data;
};

export const bulkApprove = async (actionId, itemIds, reason) => {
    if (USE_MOCK_DATA) return { success: true, data: { approvedCount: itemIds.length, failedCount: 0 } };
    const response = await ApiService.post(`/api/admin/pending/${actionId}/bulk-approve`, { itemIds, reason });
    return response.data;
};

export const bulkReject = async (actionId, itemIds, reason) => {
    if (USE_MOCK_DATA) return { success: true, data: { rejectedCount: itemIds.length, failedCount: 0 } };
    const response = await ApiService.post(`/api/admin/pending/${actionId}/bulk-reject`, { itemIds, reason });
    return response.data;
};

export const getPendingItemDetail = async (actionId, itemId) => {
    if (USE_MOCK_DATA) {
        const item = mockPendingActions.data.items.find(i => i.id === itemId);
        return { success: true, data: item };
    }
    const response = await ApiService.get(`/api/admin/pending/${actionId}/item/${itemId}`);
    return response.data;
};

export const resolvePendingItem = async (actionId, itemId, resolution) => {
    if (USE_MOCK_DATA) return { success: true, data: { itemId, status: resolution.action, resolvedAt: new Date().toISOString(), resolvedBy: 'admin@maesta.com' } };
    const response = await ApiService.post(`/api/admin/pending/${actionId}/item/${itemId}/resolve`, resolution);
    return response.data;
};

export const getActivities = async (params) => {
    if (USE_MOCK_DATA) return mockActivities;
    const response = await ApiService.get('/api/admin/activities', { params });
    return response.data;
};

export const getActivityTypes = async () => {
  if (USE_MOCK_DATA) {
    return {
      success: true,
      data: [
        { id: 'user_signup', name: 'User Sign Up' },
        { id: 'user_login', name: 'User Login' },
        { id: 'job_post', name: 'Job Posted' },
        { id: 'job_application', name: 'Job Application' },
        { id: 'payment', name: 'Payment' },
        { id: 'report', name: 'Content Report' },
        { id: 'moderation', name: 'Moderation Action' },
      ],
    };
  }
  const response = await ApiService.get('/api/admin/activities/types');
  return response.data;
};

export const exportActivities = async (format, filters) => {
  if (USE_MOCK_DATA) {
    window.open(`/mock-activities-export.${format}`, '_blank');
    return { success: true };
  }
  const response = await ApiService.get('/api/admin/activities/export', {
    params: { format, filters: JSON.stringify(filters) },
    responseType: 'blob',
  });
  return response.data;
};

export const getUsers = async (params) => {
    if (USE_MOCK_DATA) return mockUsers;
    const response = await ApiService.get('/api/admin/users', { params });
    return response.data;
};

export const getUserDetails = async (userId) => {
    if (USE_MOCK_DATA) return { success: true, data: mockUsers.data.users.find(u => u.id === userId) };
    const response = await ApiService.get(`/api/admin/users/${userId}`);
    return response.data;
};

export const updateUserStatus = async (userId, status, reason) => {
    if (USE_MOCK_DATA) return { success: true, data: { userId, status, updatedAt: new Date().toISOString() } };
    const response = await ApiService.put(`/api/admin/users/${userId}/status`, { status, reason });
    return response.data;
};

export const updateUserRole = async (userId, role) => {
    if (USE_MOCK_DATA) return { success: true, data: { userId, role, updatedAt: new Date().toISOString() } };
    const response = await ApiService.put(`/api/admin/users/${userId}/role`, { role });
    return response.data;
};

export const getJobsForModeration = async (params) => {
    if (USE_MOCK_DATA) return mockJobsModeration;
    const response = await ApiService.get('/api/admin/jobs/moderation', { params });
    return response.data;
};

export const getJobDetailsForModeration = async (jobId) => {
    if (USE_MOCK_DATA) return { success: true, data: mockJobsModeration.data.jobs.find(j => j.id === jobId) };
    const response = await ApiService.get(`/api/admin/jobs/moderation/${jobId}`);
    return response.data;
};

export const approveJob = async (jobId, notes) => {
    if (USE_MOCK_DATA) return { success: true, data: { jobId, status: 'approved', approvedAt: new Date().toISOString(), approvedBy: 'admin@maesta.com' } };
    const response = await ApiService.post(`/api/admin/jobs/moderation/${jobId}/approve`, { notes });
    return response.data;
};

export const rejectJob = async (jobId, reason, notes) => {
    if (USE_MOCK_DATA) return { success: true, data: { jobId, status: 'rejected', rejectedAt: new Date().toISOString(), rejectedBy: 'admin@maesta.com' } };
    const response = await ApiService.post(`/api/admin/jobs/moderation/${jobId}/reject`, { reason, notes });
    return response.data;
};

export const editJob = async (jobId, updates) => {
    if (USE_MOCK_DATA) return { success: true, data: { jobId, updatedAt: new Date().toISOString() } };
    const response = await ApiService.put(`/api/admin/jobs/moderation/${jobId}/edit`, updates);
    return response.data;
};