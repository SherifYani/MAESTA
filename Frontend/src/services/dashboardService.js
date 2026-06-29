/**
 * @file dashboardService.js
 * @description Dashboard-specific services connecting to DashboardController.
 *              Uses named exports for consistency.
 * @author Antigravity (AI)
 * @date 2026-05-09
 */

import ApiService from './ApiService';

/**
 * Get general summary for the current user.
 * @returns {Promise<Object>}
 */
export const getSummary = async () => {
    const response = await ApiService.get('/api/Dashboard/summary');
    return response.data;
};

/**
 * Get job seeker specific dashboard data.
 * @returns {Promise<Object>}
 */
export const getJobSeekerDashboard = async () => {
    const response = await ApiService.get('/api/Dashboard/job-seeker');
    return response.data;
};

/**
 * Get company specific dashboard data.
 * @returns {Promise<Object>}
 */
export const getCompanyDashboard = async () => {
    const response = await ApiService.get('/api/Dashboard/company');
    return response.data;
};

/**
 * Get freelancer specific dashboard data.
 * @returns {Promise<Object>}
 */
export const getFreelancerDashboard = async () => {
    const response = await ApiService.get('/api/Dashboard/freelancer');
    return response.data;
};

/**
 * Get client specific dashboard data.
 * @returns {Promise<Object>}
 */
export const getClientDashboard = async () => {
    const response = await ApiService.get('/api/Dashboard/client');
    return response.data;
};

/**
 * Get company analytics data.
 * @param {Object} params - Query parameters
 * @param {string} params.period - Time period (weekly, monthly, quarterly, yearly)
 * @returns {Promise<Object>}
 */
export const getCompanyAnalytics = async (params = {}) => {
    const response = await ApiService.get('/api/Dashboard/company/analytics', { params });
    return response.data;
};

const dashboardService = {
    getSummary,
    getJobSeekerDashboard,
    getCompanyDashboard,
    getCompanyAnalytics,
    getFreelancerDashboard,
    getClientDashboard
};

export default dashboardService;
