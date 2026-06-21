/**
 * @file companyDataService.js
 * @description Data service for Company Dashboard components - Centralized data management
 * @author Sherif Talaat
 * @date 2025-01-22
 *
 * @last-modified-by Antigravity (AI)
 * @last-modified-date 2026-06-21
 *
 * NOTE: Centralized data manager for company dashboard views.
 * Connects directly to backend via profileService, jobService, and dashboardService.
 */

import jobService from '../../../../../services/jobService';
import dashboardService from '../../../../../services/dashboardService';
import profileService from '../../../../../services/profileService';
import { ROLES, ROLE_METRICS } from '../../../config/dashboard.config';

// ─────────────────────────────────────────────────────────────────────────────
// API Integration functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get comprehensive company dashboard data
 * @returns {Object} Complete company dashboard data
 */
export const getCompanyDashboardData = async () => {
  try {
    const data = await dashboardService.getCompanyDashboard();
    const companyData = {
      profile: null,
      publishedJobs: [],
      newApplicants: [],
      performanceAnalytics: null,
      recentActivity: [],
      pendingActions: [],
      metrics: [
        { id: "activeJobs", label: "Active Jobs", value: data?.activeJobsCount?.toString() || "0", change: "+0", trend: "up", color: "var(--color-accent-pink)", details: "", progress: 0, targetValue: "0" },
        { id: "totalSpent", label: "Total Spent", value: "$0", change: "+0%", trend: "up", color: "var(--color-accent-green)", details: "This month", progress: 0, targetValue: "0" },
        { id: "activeContracts", label: "Active Contracts", value: "0", change: "+0", trend: "up", color: "var(--color-accent-blue)", details: "", progress: 0, targetValue: "0" },
        { id: "avgRating", label: "Avg Rating", value: "0.0", change: "0", trend: "neutral", color: "var(--color-accent-yellow)", details: "", progress: 0, targetValue: "5.0" },
      ],
      title: ROLE_METRICS[ROLES.COMPANY]?.title || "Company Dashboard",
      description: ROLE_METRICS[ROLES.COMPANY]?.description || "Manage your company's hiring and recruitment"
    };

    return {
      success: true,
      data: companyData,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error loading company dashboard data:', error);
    return { success: false, error: 'Failed to load company dashboard data', data: null };
  }
};

/**
 * Get data for Published Jobs component
 * @param {Object} filters - Optional filters for jobs
 * @returns {Object} Formatted data for PublishedJobs component
 */
export const getPublishedJobsData = async (filters = {}) => {
  try {
    const { status = 'all', department = 'all', search = '', page = 1, limit = 10 } = filters;

    const res = await jobService.getCompanyJobs();
    let jobs = Array.isArray(res) ? res : (res?.items || res?.data || []);

    // Apply filters
    if (status !== 'all') {
      const isPublishedTarget = status === 'active';
      jobs = jobs.filter(job => job.isPublished === isPublishedTarget);
    }
    
    if (department !== 'all') {
      jobs = jobs.filter(job => (job.category || job.department) === department);
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      jobs = jobs.filter(job => 
        (job.title || '').toLowerCase().includes(searchTerm) ||
        (job.description || '').toLowerCase().includes(searchTerm) ||
        (job.location || '').toLowerCase().includes(searchTerm)
      );
    }

    // Calculate pagination
    const totalJobs = jobs.length;
    const totalPages = Math.ceil(totalJobs / limit);
    const startIndex = (page - 1) * limit;
    const paginatedJobs = jobs.slice(startIndex, startIndex + limit);

    const stats = {
      total: totalJobs,
      active: jobs.filter(job => job.isPublished).length,
      paused: jobs.filter(job => !job.isPublished && !job.isClosed).length,
      closed: jobs.filter(job => job.isClosed).length,
      urgent: jobs.filter(job => job.isUrgent).length,
      remote: jobs.filter(job => job.isRemote).length,
      totalApplications: 0,
      totalShortlisted: 0,
      totalHired: 0,
      avgCompletionRate: 0,
    };

    const departments = [...new Set(jobs.map(job => job.category || job.department).filter(Boolean))];

    return {
      success: true,
      data: {
        jobs: paginatedJobs,
        stats,
        filters: {
          availableDepartments: departments,
          availableStatuses: ['all', 'active', 'paused', 'closed'],
          currentFilters: filters,
        },
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalJobs,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error loading published jobs data:', error);
    return { success: false, error: 'Failed to load published jobs data', data: null };
  }
};

/**
 * Get data for New Applicants component
 * @param {Object} filters - Optional filters for applicants
 * @returns {Object} Formatted data for NewApplicants component
 */
export const getNewApplicantsData = async (filters = {}) => {
  try {
    const {
      status = 'all',
      jobId = 'all',
      search = '',
      page = 1,
      limit = 10,
      sortBy = 'newest',
    } = filters;

    const res = await jobService.getCompanyApplicants();
    let applicants = Array.isArray(res) ? res : (res?.items || res?.data || []);

    // Apply filters
    if (status !== 'all') {
      applicants = applicants.filter(applicant => applicant.status?.toLowerCase() === status.toLowerCase());
    }
    
    if (jobId !== 'all') {
      applicants = applicants.filter(applicant => applicant.jobId === jobId || applicant.job?.jobId === jobId);
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      applicants = applicants.filter(applicant => 
        (applicant.applicantName || applicant.firstName || '').toLowerCase().includes(searchTerm) ||
        (applicant.applicantEmail || '').toLowerCase().includes(searchTerm) ||
        (applicant.jobTitle || applicant.job?.title || '').toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        applicants.sort((a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0));
        break;
      case 'oldest':
        applicants.sort((a, b) => new Date(a.appliedAt || 0) - new Date(b.appliedAt || 0));
        break;
      case 'matchScore':
        applicants.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        break;
      case 'name':
        applicants.sort((a, b) => (a.applicantName || '').localeCompare(b.applicantName || ''));
        break;
      default:
        break;
    }

    const totalApplicants = applicants.length;
    const totalPages = Math.ceil(totalApplicants / limit);
    const startIndex = (page - 1) * limit;
    const paginatedApplicants = applicants.slice(startIndex, startIndex + limit);

    const stats = {
      total: totalApplicants,
      new: applicants.filter(app => app.status?.toLowerCase() === "new" || app.status?.toLowerCase() === "pending").length,
      reviewed: applicants.filter(app => app.status?.toLowerCase() === "reviewed").length,
      shortlisted: applicants.filter(app => app.status?.toLowerCase() === "shortlisted").length,
      interviewed: applicants.filter(app => app.status?.toLowerCase() === "interviewed").length,
      rejected: applicants.filter(app => app.status?.toLowerCase() === "rejected").length,
      avgMatchScore: Math.round(applicants.reduce((sum, app) => sum + (app.matchScore || 0), 0) / applicants.length) || 0,
      highMatch: applicants.filter(app => (app.matchScore || 0) >= 90).length,
      mediumMatch: applicants.filter(app => (app.matchScore || 0) >= 75 && (app.matchScore || 0) < 90).length,
      lowMatch: applicants.filter(app => (app.matchScore || 0) < 75).length,
    };

    const jobs = [...new Set(applicants.map(app => app.jobId || app.job?.jobId).filter(Boolean))].map(id => {
      const match = applicants.find(app => (app.jobId || app.job?.jobId) === id);
      return { id, title: match?.jobTitle || match?.job?.title || `Job ${id}` };
    });

    return {
      success: true,
      data: {
        applicants: paginatedApplicants,
        stats,
        filters: {
          availableJobs: jobs,
          availableStatuses: [
            { value: 'all', label: 'All Status' },
            { value: 'new', label: 'New' },
            { value: 'reviewed', label: 'Reviewed' },
            { value: 'shortlisted', label: 'Shortlisted' },
            { value: 'interviewed', label: 'Interviewed' },
            { value: 'rejected', label: 'Rejected' },
          ],
          currentFilters: filters,
        },
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalApplicants,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error loading new applicants data:', error);
    return { success: false, error: 'Failed to load applicants data', data: null };
  }
};

/**
 * Get data for Performance Analytics component
 * @param {Object} options - Options for analytics data
 * @returns {Object} Formatted data for PerformanceAnalytics component
 */
export const getPerformanceAnalyticsData = async (options = {}) => {
  try {
    const { period = 'monthly' } = options;
    const analytics = await dashboardService.getCompanyAnalytics();
    
    return {
      success: true,
      data: {
        analytics: analytics,
        stats: analytics?.overview || {},
        insights: { 
          topPerformingJobs: analytics?.jobPerformance || [], 
          quickInsights: [], 
          recommendations: [] 
        },
        trends: { applicationTrend: 'neutral', hireTrend: 'neutral', timeTrend: 'neutral' },
        period,
        lastUpdated: new Date().toISOString(),
        nextReportDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error loading performance analytics data:', error);
    return { success: false, error: 'Failed to load analytics data', data: null };
  }
};

/**
 * Get data for Company Summary component
 * @returns {Object} Formatted data for CompanySummary component
 */
export const getCompanySummaryData = async () => {
  try {
    const profile = await profileService.getCompanyProfile();
    return {
      success: true,
      data: {
        profile: profile,
        hiringTeam: [],
        companyMetrics: profile?.stats || {},
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error loading company summary data:', error);
    return { success: false, error: 'Failed to load company summary data', data: null };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Async API actions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update job status
 * @param {string} jobId - ID of the job to update
 * @param {string} status - New status
 * @returns {Object} Result of the update
 */
export const updateJobStatus = async (jobId, status) => {
  try {
    const isPublished = status === 'active';
    await jobService.toggleJobStatus(jobId, isPublished);
    return {
      success: true,
      message: `Job status updated to ${status}`,
      jobId,
      status,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error updating job status:', error);
    return { success: false, error: 'Failed to update job status', jobId, status };
  }
};

/**
 * Update applicant status
 * @param {string} applicantId - ID of the applicant
 * @param {string} status - New status
 * @param {string} notes - Optional notes
 * @returns {Object} Result of the update
 */
export const updateApplicantStatus = async (applicantId, status, notes = '') => {
  try {
    await jobService.updateApplicationStatus(applicantId, status);
    return {
      success: true,
      message: `Applicant status updated to ${status}`,
      applicantId,
      status,
      notes,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error updating applicant status:', error);
    return { success: false, error: 'Failed to update applicant status', applicantId, status };
  }
};

/**
 * Bulk applicant actions
 * @param {Array} applicantIds - Array of applicant IDs
 * @param {string} action - Action to perform
 * @param {Object} data - Additional data for the action
 * @returns {Object} Result of the bulk action
 */
export const bulkApplicantAction = async (applicantIds, action, data = {}) => {
  try {
    const promises = applicantIds.map(id => jobService.updateApplicationStatus(id, action));
    await Promise.all(promises);
    return {
      success: true,
      message: `${action} completed for ${applicantIds.length} applicants`,
      action,
      count: applicantIds.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error performing bulk action:', error);
    return { success: false, error: `Failed to perform ${action}`, action, count: applicantIds.length };
  }
};

/**
 * Export company data
 * @param {string} dataType - Type of data to export
 * @param {Object} options - Export options
 * @returns {Object} Export result
 */
export const exportCompanyData = async (dataType, options = {}) => {
  try {
    // Basic export stub calling mock/placeholder endpoints if needed
    console.log(`Exporting ${dataType} data`);
    return {
      success: true,
      message: `${dataType} export started`,
      dataType,
      format: options.format || 'csv',
      downloadUrl: `/api/exports/${dataType}-${Date.now()}.${options.format || 'csv'}`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error exporting data:', error);
    return { success: false, error: `Failed to export ${dataType} data`, dataType };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Default export
// ─────────────────────────────────────────────────────────────────────────────

const companyDataService = {
  getCompanyDashboardData,
  getPublishedJobsData,
  getNewApplicantsData,
  getPerformanceAnalyticsData,
  getCompanySummaryData,
  updateJobStatus,
  updateApplicantStatus,
  bulkApplicantAction,
  exportCompanyData,
};

export default companyDataService;