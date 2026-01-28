/**
 * @file companyDataService.js
 * @description Data service for Company Dashboard components - Centralized data management
 * @author Sherif Talaat
 * @date 2025-01-22
 *
 * @last-modified-by Sherif Talaat
 * @last-modified-date 2025-01-22
 */

import {
  // Company data from dashboard.config.js
  COMPANY_PROFILE,
  COMPANY_PUBLISHED_JOBS,
  COMPANY_NEW_APPLICANTS,
  COMPANY_PERFORMANCE_ANALYTICS,
  COMPANY_RECENT_ACTIVITY,
  COMPANY_PENDING_ACTIONS,
  
  // Helper functions
  getCompanyStatistics,
  getJobPerformanceSummary,
  
  // Role constants
  ROLES,
  ROLE_METRICS
} from '../../../config/dashboard.config';

/**
 * Get comprehensive company dashboard data
 * @returns {Object} Complete company dashboard data
 */
export const getCompanyDashboardData = () => {
  try {
    const companyData = {
      // Company profile data
      profile: COMPANY_PROFILE,
      
      // Published jobs
      publishedJobs: COMPANY_PUBLISHED_JOBS,
      
      // New applicants
      newApplicants: COMPANY_NEW_APPLICANTS,
      
      // Performance analytics
      performanceAnalytics: COMPANY_PERFORMANCE_ANALYTICS,
      
      // Recent activity
      recentActivity: COMPANY_RECENT_ACTIVITY,
      
      // Pending actions
      pendingActions: COMPANY_PENDING_ACTIONS,
      
      // Additional dashboard metrics
      metrics: ROLE_METRICS[ROLES.COMPANY]?.metrics || [],
      
      // Title and description
      title: ROLE_METRICS[ROLES.COMPANY]?.title || "Company Dashboard",
      description: ROLE_METRICS[ROLES.COMPANY]?.description || "Manage your company's hiring and recruitment"
    };
    
    return {
      success: true,
      data: companyData,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error loading company dashboard data:", error);
    return {
      success: false,
      error: "Failed to load company dashboard data",
      data: null
    };
  }
};

/**
 * Get data for Published Jobs component
 * @param {Object} filters - Optional filters for jobs
 * @returns {Object} Formatted data for PublishedJobs component
 */
export const getPublishedJobsData = (filters = {}) => {
  try {
    const { 
      status = 'all', 
      department = 'all', 
      search = '', 
      page = 1, 
      limit = 10 
    } = filters;
    
    let jobs = [...COMPANY_PUBLISHED_JOBS];
    
    // Apply filters
    if (status !== 'all') {
      jobs = jobs.filter(job => job.status === status);
    }
    
    if (department !== 'all') {
      jobs = jobs.filter(job => job.department === department);
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm) ||
        job.location.toLowerCase().includes(searchTerm)
      );
    }
    
    // Calculate pagination
    const totalJobs = jobs.length;
    const totalPages = Math.ceil(totalJobs / limit);
    const startIndex = (page - 1) * limit;
    const paginatedJobs = jobs.slice(startIndex, startIndex + limit);
    
    // Calculate statistics
    const stats = {
      total: totalJobs,
      active: jobs.filter(job => job.status === 'active').length,
      paused: jobs.filter(job => job.status === 'paused').length,
      closed: jobs.filter(job => job.status === 'closed').length,
      urgent: jobs.filter(job => job.isUrgent).length,
      remote: jobs.filter(job => job.isRemote).length,
      totalApplications: jobs.reduce((sum, job) => sum + (job.stats?.applications || 0), 0),
      totalShortlisted: jobs.reduce((sum, job) => sum + (job.stats?.shortlisted || 0), 0),
      totalHired: jobs.reduce((sum, job) => sum + (job.stats?.hired || 0), 0),
      avgCompletionRate: Math.round(
        jobs.reduce((sum, job) => sum + (job.stats?.completionRate || 0), 0) / jobs.length
      ) || 0
    };
    
    // Get unique departments for filters
    const departments = [...new Set(COMPANY_PUBLISHED_JOBS.map(job => job.department))];
    
    return {
      success: true,
      data: {
        jobs: paginatedJobs,
        stats,
        filters: {
          availableDepartments: departments,
          availableStatuses: ['all', 'active', 'paused', 'closed'],
          currentFilters: filters
        },
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalJobs,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error loading published jobs data:", error);
    return {
      success: false,
      error: "Failed to load published jobs data",
      data: null
    };
  }
};

/**
 * Get data for New Applicants component
 * @param {Object} filters - Optional filters for applicants
 * @returns {Object} Formatted data for NewApplicants component
 */
export const getNewApplicantsData = (filters = {}) => {
  try {
    const { 
      status = 'all', 
      jobId = 'all', 
      search = '', 
      page = 1, 
      limit = 10,
      sortBy = 'newest'
    } = filters;
    
    let applicants = [...COMPANY_NEW_APPLICANTS];
    
    // Apply filters
    if (status !== 'all') {
      applicants = applicants.filter(applicant => applicant.status === status);
    }
    
    if (jobId !== 'all') {
      applicants = applicants.filter(applicant => applicant.jobId === jobId);
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      applicants = applicants.filter(applicant => 
        applicant.applicantName.toLowerCase().includes(searchTerm) ||
        applicant.applicantEmail.toLowerCase().includes(searchTerm) ||
        applicant.jobTitle.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        applicants.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
        break;
      case 'oldest':
        applicants.sort((a, b) => new Date(a.appliedDate) - new Date(b.appliedDate));
        break;
      case 'matchScore':
        applicants.sort((a, b) => b.matchScore - a.matchScore);
        break;
      case 'name':
        applicants.sort((a, b) => a.applicantName.localeCompare(b.applicantName));
        break;
      default:
        break;
    }
    
    // Calculate pagination
    const totalApplicants = applicants.length;
    const totalPages = Math.ceil(totalApplicants / limit);
    const startIndex = (page - 1) * limit;
    const paginatedApplicants = applicants.slice(startIndex, startIndex + limit);
    
    // Calculate statistics
    const stats = {
      total: totalApplicants,
      new: applicants.filter(app => app.status === "new").length,
      reviewed: applicants.filter(app => app.status === "reviewed").length,
      shortlisted: applicants.filter(app => app.status === "shortlisted").length,
      interviewed: applicants.filter(app => app.status === "interviewed").length,
      rejected: applicants.filter(app => app.status === "rejected").length,
      avgMatchScore: Math.round(
        applicants.reduce((sum, app) => sum + app.matchScore, 0) / applicants.length
      ) || 0,
      highMatch: applicants.filter(app => app.matchScore >= 90).length,
      mediumMatch: applicants.filter(app => app.matchScore >= 75 && app.matchScore < 90).length,
      lowMatch: applicants.filter(app => app.matchScore < 75).length
    };
    
    // Get unique jobs for filters
    const jobs = [...new Set(applicants.map(applicant => applicant.jobId))].map(jobId => {
      const job = COMPANY_PUBLISHED_JOBS.find(j => j.id === jobId);
      return job ? { id: job.id, title: job.title } : null;
    }).filter(Boolean);
    
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
            { value: 'rejected', label: 'Rejected' }
          ],
          currentFilters: filters
        },
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalApplicants,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error loading new applicants data:", error);
    return {
      success: false,
      error: "Failed to load applicants data",
      data: null
    };
  }
};

/**
 * Get data for Performance Analytics component
 * @param {Object} options - Options for analytics data
 * @returns {Object} Formatted data for PerformanceAnalytics component
 */
export const getPerformanceAnalyticsData = (options = {}) => {
  try {
    const { 
      period = 'monthly', 
      startDate = null, 
      endDate = null,
      compareWithPrevious = false
    } = options;
    
    const analytics = COMPANY_PERFORMANCE_ANALYTICS;
    const stats = getCompanyStatistics();
    const jobPerformance = getJobPerformanceSummary();
    
    // Process data based on period
    let processedData = { ...analytics };
    
    if (period === 'weekly') {
      // Convert monthly to weekly data (for demo purposes)
      processedData.monthlyTrends = {
        applications: analytics.monthlyTrends.applications.map(item => ({
          month: `Week of ${item.month}`,
          count: Math.round(item.count / 4)
        })),
        hires: analytics.monthlyTrends.hires.map(item => ({
          month: `Week of ${item.month}`,
          count: Math.max(1, Math.round(item.count / 4))
        })),
        timeToHire: analytics.monthlyTrends.timeToHire.map(item => ({
          month: `Week of ${item.month}`,
          days: Math.round(item.days * 0.9) // Slightly better for weekly view
        }))
      };
    } else if (period === 'quarterly') {
      // Convert monthly to quarterly data
      const quarters = [];
      for (let i = 0; i < analytics.monthlyTrends.applications.length; i += 3) {
        const quarterApplications = analytics.monthlyTrends.applications
          .slice(i, i + 3)
          .reduce((sum, item) => sum + item.count, 0);
        
        const quarterHires = analytics.monthlyTrends.hires
          .slice(i, i + 3)
          .reduce((sum, item) => sum + item.count, 0);
        
        const quarterTimeToHire = analytics.monthlyTrends.timeToHire
          .slice(i, i + 3)
          .reduce((sum, item) => sum + item.days, 0) / 3;
        
        quarters.push({
          quarter: `Q${Math.floor(i/3) + 1} ${analytics.monthlyTrends.applications[i].month.split(' ')[1]}`,
          applications: quarterApplications,
          hires: quarterHires,
          timeToHire: Math.round(quarterTimeToHire)
        });
      }
      
      processedData.monthlyTrends = {
        applications: quarters.map(q => ({ month: q.quarter, count: q.applications })),
        hires: quarters.map(q => ({ month: q.quarter, count: q.hires })),
        timeToHire: quarters.map(q => ({ month: q.quarter, days: q.timeToHire }))
      };
    }
    
    // Generate insights
    const insights = {
      topPerformingJobs: analytics.jobPerformance
        .sort((a, b) => b.applications - a.applications)
        .slice(0, 3)
        .map(job => ({
          title: job.title,
          applications: job.applications,
          hireRate: job.hired > 0 ? Math.round((job.hired / job.applications) * 100) : 0,
          completionRate: job.completionRate
        })),
      
      quickInsights: [
        {
          title: "LinkedIn Drives Most Applications",
          description: `LinkedIn accounts for ${analytics.applicationSources.find(s => s.source === 'LinkedIn')?.percentage || 0}% of all applications`,
          type: "info"
        },
        {
          title: "Engineering Roles Are Most Popular",
          description: "45% of applications are for technical positions",
          type: "success"
        },
        {
          title: "Time to Hire Improving",
          description: `Average time reduced by ${Math.round((analytics.monthlyTrends.timeToHire[0].days - analytics.monthlyTrends.timeToHire[analytics.monthlyTrends.timeToHire.length - 1].days) * 10) / 10} days this quarter`,
          type: "warning"
        }
      ],
      
      recommendations: [
        {
          priority: "high",
          title: "Optimize Job Descriptions for SEO",
          description: "Improve visibility by optimizing job postings for search engines"
        },
        {
          priority: "medium",
          title: "Implement Automated Screening",
          description: "Reduce time-to-hire with automated candidate screening"
        },
        {
          priority: "low",
          title: "Enhance Career Page",
          description: "Improve conversion rates by updating the company career page"
        }
      ]
    };
    
    // Calculate trends
    const trends = {
      applicationTrend: analytics.monthlyTrends.applications[analytics.monthlyTrends.applications.length - 1].count > 
                      analytics.monthlyTrends.applications[0].count ? "up" : "down",
      
      hireTrend: analytics.monthlyTrends.hires[analytics.monthlyTrends.hires.length - 1].count > 
                 analytics.monthlyTrends.hires[0].count ? "up" : "down",
      
      timeTrend: analytics.monthlyTrends.timeToHire[analytics.monthlyTrends.timeToHire.length - 1].days < 
                 analytics.monthlyTrends.timeToHire[0].days ? "improving" : "declining"
    };
    
    return {
      success: true,
      data: {
        analytics: processedData,
        stats: {
          ...stats,
          jobPerformance
        },
        insights,
        trends,
        period,
        lastUpdated: new Date().toISOString(),
        nextReportDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // One week from now
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error loading performance analytics data:", error);
    return {
      success: false,
      error: "Failed to load analytics data",
      data: null
    };
  }
};

/**
 * Get data for Company Summary component
 * @returns {Object} Formatted data for CompanySummary component
 */
export const getCompanySummaryData = () => {
  try {
    const profile = COMPANY_PROFILE;
    
    // Enhance profile with additional calculated data
    const enhancedProfile = {
      ...profile,
      // Add social media platforms
      socialPlatforms: [
        { platform: 'linkedin', url: profile.socialMedia?.linkedin, icon: 'linkedin' },
        { platform: 'twitter', url: profile.socialMedia?.twitter, icon: 'twitter' },
        { platform: 'facebook', url: profile.socialMedia?.facebook, icon: 'facebook' }
      ].filter(social => social.url),
      
      // Add verification badge
      verificationBadge: profile.verification?.verified ? {
        type: profile.verification.verificationBadge || "Gold Employer",
        verifiedSince: profile.verification.verifiedDate,
        level: profile.verification.verificationBadge?.includes('Gold') ? 'gold' : 'silver'
      } : null,
      
      // Add quick stats
      quickStats: [
        { label: 'Employee Count', value: profile.stats?.activeJobs || 0, icon: 'users' },
        { label: 'Annual Revenue', value: profile.stats?.totalJobsPosted || 0, icon: 'dollar' },
        { label: 'Hiring Success', value: `${profile.stats?.hireRate || 0}%`, icon: 'target' },
        { label: 'Retention Rate', value: '94%', icon: 'award' }
      ]
    };
    
    return {
      success: true,
      data: {
        profile: enhancedProfile,
        hiringTeam: profile.hiringTeam || [],
        companyMetrics: profile.stats || {}
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error loading company summary data:", error);
    return {
      success: false,
      error: "Failed to load company summary data",
      data: null
    };
  }
};

/**
 * Mock API call for updating job status
 * @param {string} jobId - ID of the job to update
 * @param {string} status - New status
 * @returns {Object} Result of the update
 */
export const updateJobStatus = async (jobId, status) => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, this would be an API call
    console.log(`Updating job ${jobId} status to ${status}`);
    
    return {
      success: true,
      message: `Job status updated to ${status}`,
      jobId,
      status,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error updating job status:", error);
    return {
      success: false,
      error: "Failed to update job status",
      jobId,
      status
    };
  }
};

/**
 * Mock API call for updating applicant status
 * @param {string} applicantId - ID of the applicant
 * @param {string} status - New status
 * @param {string} notes - Optional notes
 * @returns {Object} Result of the update
 */
export const updateApplicantStatus = async (applicantId, status, notes = '') => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, this would be an API call
    console.log(`Updating applicant ${applicantId} status to ${status}`);
    
    return {
      success: true,
      message: `Applicant status updated to ${status}`,
      applicantId,
      status,
      notes,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error updating applicant status:", error);
    return {
      success: false,
      error: "Failed to update applicant status",
      applicantId,
      status
    };
  }
};

/**
 * Mock API call for bulk applicant actions
 * @param {Array} applicantIds - Array of applicant IDs
 * @param {string} action - Action to perform
 * @param {Object} data - Additional data for the action
 * @returns {Object} Result of the bulk action
 */
export const bulkApplicantAction = async (applicantIds, action, data = {}) => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Performing ${action} for ${applicantIds.length} applicants`);
    
    return {
      success: true,
      message: `${action} completed for ${applicantIds.length} applicants`,
      action,
      count: applicantIds.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error performing bulk action:", error);
    return {
      success: false,
      error: `Failed to perform ${action}`,
      action,
      count: applicantIds.length
    };
  }
};

/**
 * Mock API call for exporting data
 * @param {string} dataType - Type of data to export
 * @param {Object} options - Export options
 * @returns {Object} Export result
 */
export const exportCompanyData = async (dataType, options = {}) => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log(`Exporting ${dataType} data`);
    
    return {
      success: true,
      message: `${dataType} export started`,
      dataType,
      format: options.format || 'csv',
      downloadUrl: `/api/exports/${dataType}-${Date.now()}.${options.format || 'csv'}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error exporting data:", error);
    return {
      success: false,
      error: `Failed to export ${dataType} data`,
      dataType
    };
  }
};

// Export all functions
export default {
  getCompanyDashboardData,
  getPublishedJobsData,
  getNewApplicantsData,
  getPerformanceAnalyticsData,
  getCompanySummaryData,
  updateJobStatus,
  updateApplicantStatus,
  bulkApplicantAction,
  exportCompanyData
};