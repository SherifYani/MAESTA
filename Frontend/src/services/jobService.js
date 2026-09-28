/**
 * @file jobService.js
 * @description Job management services - handles job posting, searching, applications, and bookmarks.
 *              Falls back to mock data when the backend is unavailable.
 * @author Sherif Talaat
 * @version 2.1.0
 * @date 2026-04-29
 **/

import ApiService from './ApiService';
import {
    isNetworkError,
    MOCK_JOBS,
    MOCK_JOBS_RESPONSE,
    MOCK_MY_APPLICATIONS,
    MOCK_SAVED_JOBS,
    MOCK_CATEGORIES,
} from './mockData';

const jobService = {
    // ==================== Job CRUD Operations ====================

    // Get all jobs with optional filters
    getJobs: async (filters = {}) => {
        try {
            const response = await ApiService.get('/api/jobs', { params: filters });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[jobService] getJobs — mock fallback');
                return MOCK_JOBS_RESPONSE;
            }
            throw error;
        }
    },

    // Get single job by ID
    getJobById: async (jobId) => {
        try {
            const response = await ApiService.get(`/api/jobs/${jobId}`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[jobService] getJobById — mock fallback');
                return MOCK_JOBS.find(j => j.id === jobId) || MOCK_JOBS[0];
            }
            throw error;
        }
    },

    // Create new job posting
    createJob: async (jobData) => {
        try {
            const response = await ApiService.post('/api/jobs', jobData);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[jobService] createJob — mock fallback');
                return { id: `job-mock-${Date.now()}`, ...jobData, isPublished: false };
            }
            throw error;
        }
    },

    // Update job posting
    updateJob: async (jobId, jobData) => {
        try {
            const response = await ApiService.put(`/api/jobs/${jobId}`, jobData);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[jobService] updateJob — mock fallback');
                return { id: jobId, ...jobData };
            }
            throw error;
        }
    },

    // Delete job posting
    deleteJob: async (jobId) => {
        try {
            const response = await ApiService.delete(`/api/jobs/${jobId}`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[jobService] deleteJob — mock fallback');
                return { message: 'Job deleted (mock).' };
            }
            throw error;
        }
    },

    // ==================== Job Search & Discovery ====================

    searchJobs: async (searchParams) => {
        try {
            const response = await ApiService.get('/api/jobs', { params: searchParams });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[jobService] searchJobs — mock fallback');
                return MOCK_JOBS_RESPONSE;
            }
            throw error;
        }
    },

    // Get recommended jobs for the authenticated jobseeker
    getRecommendedJobs: async () => {
        try {
            const response = await ApiService.get('/api/jobs/recommended');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[jobService] getRecommendedJobs — mock fallback');
                return MOCK_JOBS_RESPONSE;
            }
            throw error;
        }
    },

    // Get similar jobs — uses recommended endpoint
    getSimilarJobs: async (jobId) => {
        try {
            const response = await ApiService.get('/api/jobs/recommended');
            const jobs = response.data?.items || response.data || [];
            return jobs.filter(j => j.id !== jobId).slice(0, 5);
        } catch (error) {
            console.warn('[jobService] getSimilarJobs — mock fallback');
            return MOCK_JOBS.filter(j => j.id !== jobId).slice(0, 5);
        }
    },

    // Get jobs by category
    getJobsByCategory: async (categoryId) => {
        try {
            const response = await ApiService.get('/api/jobs', { params: { categoryId } });
            return response.data?.items || response.data || [];
        } catch (error) {
            console.warn('[jobService] getJobsByCategory — mock fallback');
            return MOCK_JOBS;
        }
    },

    // ==================== Job Applications ====================

    // Apply to job
    applyToJob: async (jobId, applicationData) => {
        try {
            let payload = applicationData;

            if (applicationData instanceof FormData) {
                let cvUrl = '';
                const resume = applicationData.get('resume');

                if (resume) {
                    const resumeData = new FormData();
                    resumeData.append('file', resume);
                    resumeData.append('bucketName', 'resumes');

                    try {
                        const uploadResponse = await ApiService.upload('/api/Files/upload', resumeData);
                        cvUrl = uploadResponse.data?.url || uploadResponse.data?.Url || '';
                    } catch {
                        cvUrl = '';
                    }
                }

                payload = {
                    coverLetter: applicationData.get('coverLetter') || '',
                    cvUrl,
                };
            }

            const response = await ApiService.post(`/api/jobs/${jobId}/apply`, payload);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[jobService] applyToJob — mock fallback');
                return { id: `app-mock-${Date.now()}`, jobId, status: 'pending', appliedAt: new Date().toISOString() };
            }
            throw error;
        }
    },

    // Get my applications (jobseeker)
    getMyApplications: async () => {
        try {
            const response = await ApiService.get('/api/jobs/applications/my');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[jobService] getMyApplications — mock fallback');
                return { items: MOCK_MY_APPLICATIONS, totalItems: MOCK_MY_APPLICATIONS.length };
            }
            throw error;
        }
    },

    // Get applications for a job (company)
    getJobApplications: async (jobId) => {
        try {
            const response = await ApiService.get(`/api/jobs/${jobId}/applications`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[jobService] getJobApplications — mock fallback');
                return { items: [], totalItems: 0 };
            }
            throw error;
        }
    },

    // Get all applicants for the company's jobs
    getCompanyApplicants: async () => {
        try {
            const response = await ApiService.get('/api/jobs/applications/company');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[jobService] getCompanyApplicants — mock fallback');
                return { items: MOCK_MY_APPLICATIONS, totalItems: MOCK_MY_APPLICATIONS.length };
            }
            throw error;
        }
    },

    updateApplicationStatus: async (applicationId, status) => {
        try {
            const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : status;
            const response = await ApiService.put(
                `/api/jobs/applications/${applicationId}/status`,
                JSON.stringify(normalizedStatus),
                { headers: { 'Content-Type': 'application/json' } }
            );
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[jobService] updateApplicationStatus — mock fallback');
                return { id: applicationId, status };
            }
            throw error;
        }
    },

    // Withdraw application
    withdrawApplication: async (applicationId) => {
        try {
            const response = await ApiService.delete(`/api/jobs/applications/${applicationId}`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[jobService] withdrawApplication — mock fallback');
                return { message: 'Application withdrawn (mock).' };
            }
            throw error;
        }
    },

    // ==================== Saved Jobs / Bookmarks ====================

    // Save/Bookmark job
    saveJob: async (jobId) => {
        try {
            const response = await ApiService.post(`/api/jobs/${jobId}/save`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[jobService] saveJob — mock fallback');
                return { message: 'Job saved (mock).' };
            }
            throw error;
        }
    },

    // Unsave job
    unsaveJob: async (jobId) => {
        try {
            const response = await ApiService.delete(`/api/jobs/${jobId}/save`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[jobService] unsaveJob — mock fallback');
                return { message: 'Job unsaved (mock).' };
            }
            throw error;
        }
    },

    // Get saved jobs
    getSavedJobs: async () => {
        try {
            const response = await ApiService.get('/api/jobs/saved');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[jobService] getSavedJobs — mock fallback');
                return { items: MOCK_SAVED_JOBS, totalItems: MOCK_SAVED_JOBS.length };
            }
            throw error;
        }
    },

    // ==================== Company Job Management ====================

    getCompanyJobs: async (companyId = null) => {
        try {
            const endpoint = '/api/jobs/my-postings';
            const response = await ApiService.get(endpoint);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[jobService] getCompanyJobs — mock fallback');
                return { items: MOCK_JOBS.slice(0, 2), totalItems: 2 };
            }
            throw error;
        }
    },

    // Publish/Unpublish job
    toggleJobStatus: async (jobId, isPublished) => {
        try {
            const response = await ApiService.put(`/api/jobs/${jobId}/status`, isPublished, {
                headers: { 'Content-Type': 'application/json' }
            });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[jobService] toggleJobStatus — mock fallback');
                return { id: jobId, isPublished };
            }
            throw error;
        }
    },

    // Get job statistics
    getJobStatistics: async (jobId) => {
        try {
            const [jobRes, appsRes] = await Promise.all([
                ApiService.get(`/api/jobs/${jobId}`),
                ApiService.get(`/api/jobs/${jobId}/applications`)
            ]);
            const job = jobRes.data;
            const applications = appsRes.data?.items || appsRes.data || [];
            return {
                views: job?.views || 0,
                applications: applications?.length || 0,
                active: job?.isPublished ?? true
            };
        } catch (error) {
            console.warn('[jobService] getJobStatistics — mock fallback');
            return { views: 0, applications: 0, active: true };
        }
    },

    // ==================== Categories & Filters ====================

    // Get job categories
    getCategories: async () => {
        try {
            const response = await ApiService.get('/api/categories');
            return response.data?.items || response.data || [];
        } catch (error) {
            console.warn('[jobService] getCategories — mock fallback');
            return MOCK_CATEGORIES;
        }
    },

    // Get job types
    getJobTypes: async () => {
        try {
            const response = await ApiService.get('/api/categories');
            const categories = response.data?.items || response.data || [];
            return categories.filter(c => c.type === 'job' || !c.type);
        } catch (error) {
            console.warn('[jobService] getJobTypes — mock fallback');
            return MOCK_CATEGORIES;
        }
    },

    // Get experience levels
    getExperienceLevels: async () => {
        return [
            { id: 'entry', name: 'Entry Level' },
            { id: 'junior', name: 'Junior' },
            { id: 'mid', name: 'Mid Level' },
            { id: 'senior', name: 'Senior' },
            { id: 'lead', name: 'Lead / Manager' },
            { id: 'executive', name: 'Executive' }
        ];
    },
};

export default jobService;
