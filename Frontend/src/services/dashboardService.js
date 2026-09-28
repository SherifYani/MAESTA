/**
 * @file dashboardService.js
 * @description Dashboard-specific services connecting to DashboardController.
 *              Falls back to mock data when the backend is unavailable.
 * @author Antigravity (AI)
 * @date 2026-05-09
 */

import ApiService from './ApiService';
import {
    isNetworkError,
    MOCK_DASHBOARD_SUMMARY,
    MOCK_MY_APPLICATIONS,
    MOCK_JOBS,
    MOCK_GIGS,
    MOCK_CONTRACTS,
    MOCK_PROPOSALS,
} from './mockData';

/**
 * Get general summary for the current user.
 * @returns {Promise<Object>}
 */
export const getSummary = async () => {
    try {
        const response = await ApiService.get('/api/Dashboard/summary');
        return response.data;
    } catch (error) {
        if (isNetworkError(error)) {
            console.warn('[dashboardService] getSummary — mock fallback');
            return MOCK_DASHBOARD_SUMMARY;
        }
        throw error;
    }
};

/**
 * Get job seeker specific dashboard data.
 * @returns {Promise<Object>}
 */
export const getJobSeekerDashboard = async () => {
    try {
        const response = await ApiService.get('/api/Dashboard/job-seeker');
        return response.data;
    } catch (error) {
        if (isNetworkError(error)) {
            console.warn('[dashboardService] getJobSeekerDashboard — mock fallback');
            return {
                summary: MOCK_DASHBOARD_SUMMARY,
                recentApplications: MOCK_MY_APPLICATIONS,
                recommendedJobs: MOCK_JOBS.slice(0, 3),
            };
        }
        throw error;
    }
};

/**
 * Get company specific dashboard data.
 * @returns {Promise<Object>}
 */
export const getCompanyDashboard = async () => {
    try {
        const response = await ApiService.get('/api/Dashboard/company');
        return response.data;
    } catch (error) {
        if (isNetworkError(error)) {
            console.warn('[dashboardService] getCompanyDashboard — mock fallback');
            return {
                summary: MOCK_DASHBOARD_SUMMARY,
                recentJobs: MOCK_JOBS.slice(0, 3),
                recentApplicants: MOCK_MY_APPLICATIONS,
            };
        }
        throw error;
    }
};

/**
 * Get freelancer specific dashboard data.
 * @returns {Promise<Object>}
 */
export const getFreelancerDashboard = async () => {
    try {
        const response = await ApiService.get('/api/Dashboard/freelancer');
        return response.data;
    } catch (error) {
        if (isNetworkError(error)) {
            console.warn('[dashboardService] getFreelancerDashboard — mock fallback');
            return {
                summary: MOCK_DASHBOARD_SUMMARY,
                activeContracts: MOCK_CONTRACTS,
                recentProposals: MOCK_PROPOSALS,
            };
        }
        throw error;
    }
};

/**
 * Get client specific dashboard data.
 * @returns {Promise<Object>}
 */
export const getClientDashboard = async () => {
    try {
        const response = await ApiService.get('/api/Dashboard/client');
        return response.data;
    } catch (error) {
        if (isNetworkError(error)) {
            console.warn('[dashboardService] getClientDashboard — mock fallback');
            return {
                summary: MOCK_DASHBOARD_SUMMARY,
                activeGigs: MOCK_GIGS.slice(0, 2),
                activeContracts: MOCK_CONTRACTS,
            };
        }
        throw error;
    }
};

/**
 * Get company analytics data.
 * @returns {Promise<Object>}
 */
export const getCompanyAnalytics = async () => {
    try {
        const response = await ApiService.get('/api/Dashboard/company/analytics');
        return response.data;
    } catch (error) {
        if (isNetworkError(error)) {
            console.warn('[dashboardService] getCompanyAnalytics — mock fallback');
            return {
                totalJobs: MOCK_JOBS.length,
                totalApplications: MOCK_MY_APPLICATIONS.length,
                views: 1240,
                hireRate: 0.12,
            };
        }
        throw error;
    }
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
