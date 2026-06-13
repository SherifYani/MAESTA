import jobService from '../../../../../services/jobService';
import dashboardService from '../../../../../services/dashboardService';
import profileService from '../../../../../services/profileService';

export const getCompanyDashboardData = async () => {
  try {
    const [dashboardData, jobsData] = await Promise.all([
      dashboardService.getCompanyDashboard(),
      jobService.getCompanyJobs()
    ]);
    const jobs = jobsData?.items || jobsData || [];
    return {
      success: true,
      data: {
        profile: dashboardData?.profile || dashboardData || {},
        publishedJobs: jobs,
        newApplicants: dashboardData?.recentApplicants || [],
        performanceAnalytics: dashboardData?.analytics || {},
        recentActivity: dashboardData?.recentActivity || [],
        pendingActions: dashboardData?.pendingActions || [],
        metrics: [],
        title: "Company Dashboard",
        description: "Manage your company's hiring and recruitment"
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return { success: false, error: "Failed to load company dashboard data", data: null };
  }
};

export const getPublishedJobsData = async (filters = {}) => {
  try {
    const response = await jobService.getCompanyJobs();
    const jobs = response?.items || response || [];
    const { status = 'all', search = '', page = 1, limit = 10 } = filters;

    let filtered = [...jobs];
    if (status !== 'all') filtered = filtered.filter(j => j.status === status);
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(j =>
        (j.title || '').toLowerCase().includes(term) ||
        (j.description || '').toLowerCase().includes(term)
      );
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    const stats = {
      total: totalItems,
      active: filtered.filter(j => j.isPublished).length,
      paused: filtered.filter(j => j.status === 'paused').length,
      closed: filtered.filter(j => j.status === 'closed').length,
      totalApplications: filtered.reduce((s, j) => s + (j.applicationCount || 0), 0),
    };

    return {
      success: true,
      data: {
        jobs: paginated,
        stats,
        filters: {
          availableStatuses: ['all', 'active', 'paused', 'closed'],
          currentFilters: filters
        },
        pagination: { currentPage: page, totalPages, totalItems, itemsPerPage: limit }
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return { success: false, error: "Failed to load published jobs data", data: null };
  }
};

export const getNewApplicantsData = async (filters = {}) => {
  try {
    const response = await jobService.getCompanyApplicants();
    const applicants = response?.items || response || [];
    const { status = 'all', search = '', page = 1, limit = 10 } = filters;

    let filtered = [...applicants];
    if (status !== 'all') filtered = filtered.filter(a => a.status === status);
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(a =>
        (a.name || a.applicantName || '').toLowerCase().includes(term) ||
        (a.email || a.applicantEmail || '').toLowerCase().includes(term)
      );
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    const stats = {
      total: totalItems,
      new: filtered.filter(a => a.status === 'new' || a.status === 'pending').length,
      reviewed: filtered.filter(a => a.status === 'reviewed').length,
      shortlisted: filtered.filter(a => a.status === 'shortlisted').length,
      interviewed: filtered.filter(a => a.status === 'interviewed').length,
      rejected: filtered.filter(a => a.status === 'rejected').length,
      avgMatchScore: filtered.length > 0
        ? Math.round(filtered.reduce((s, a) => s + (a.matchScore || 0), 0) / filtered.length)
        : 0
    };

    return {
      success: true,
      data: {
        applicants: paginated,
        stats,
        filters: {
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
        pagination: { currentPage: page, totalPages, totalItems, itemsPerPage: limit }
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return { success: false, error: "Failed to load applicants data", data: null };
  }
};

export const getPerformanceAnalyticsData = async (options = {}) => {
  try {
    const { period = 'monthly' } = options;
    const analytics = await dashboardService.getCompanyAnalytics();
    return {
      success: true,
      data: {
        analytics: analytics?.monthlyTrends ? analytics : { monthlyTrends: analytics },
        stats: analytics?.stats || {},
        insights: analytics?.insights || [],
        trends: analytics?.trends || {},
        period,
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return { success: false, error: "Failed to load analytics data", data: null };
  }
};

export const getCompanySummaryData = async () => {
  try {
    const profile = await profileService.getCompanyProfile();
    return {
      success: true,
      data: { profile: profile || {}, hiringTeam: profile?.team || [], companyMetrics: {} },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return { success: false, error: "Failed to load company summary data", data: null };
  }
};

export const updateJobStatus = async (jobId, status) => {
  try {
    const isPublished = status === 'active' || status === 'published';
    const data = await jobService.toggleJobStatus(jobId, isPublished);
    return { success: true, message: `Job status updated to ${status}`, jobId, status, data, timestamp: new Date().toISOString() };
  } catch (error) {
    return { success: false, error: "Failed to update job status", jobId, status };
  }
};

export const updateApplicantStatus = async (applicantId, status, notes = '') => {
  try {
    const data = await jobService.updateApplicationStatus(applicantId, status);
    return { success: true, message: `Applicant status updated to ${status}`, applicantId, status, notes, data, timestamp: new Date().toISOString() };
  } catch (error) {
    return { success: false, error: "Failed to update applicant status", applicantId, status };
  }
};

export const bulkApplicantAction = async (applicantIds, action, data = {}) => {
  try {
    const results = await Promise.all(
      applicantIds.map(id => jobService.updateApplicationStatus(id, action))
    );
    return { success: true, message: `${action} completed for ${applicantIds.length} applicants`, action, count: applicantIds.length, results, timestamp: new Date().toISOString() };
  } catch (error) {
    return { success: false, error: `Failed to perform ${action}`, action, count: applicantIds.length };
  }
};

export const exportCompanyData = async (dataType, options = {}) => {
  try {
    const response = await jobService.getCompanyJobs();
    return { success: true, message: `${dataType} export completed`, dataType, format: options.format || 'csv', data: response, timestamp: new Date().toISOString() };
  } catch (error) {
    return { success: false, error: `Failed to export ${dataType} data`, dataType };
  }
};

const companyDataService = {
  getCompanyDashboardData, getPublishedJobsData, getNewApplicantsData,
  getPerformanceAnalyticsData, getCompanySummaryData,
  updateJobStatus, updateApplicantStatus, bulkApplicantAction, exportCompanyData
};

export default companyDataService;
