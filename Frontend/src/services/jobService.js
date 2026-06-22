/**
 * @file jobService.js
 * @description Job management services - handles job posting, searching, applications, and bookmarks.
 *              Wired to the real JobMagnet API backend.
 * @author Sherif Talaat
 * @version 2.0.0
 * @date 2026-04-29
 *
 * @last-modified-by Antigravity (AI)
 * @last-modified-date 2026-04-29
 **/

import ApiService from './ApiService';

const jobService = {
    // ==================== Job CRUD Operations ====================

    // Get all jobs with optional filters
    getJobs: async (filters = {}) => {
        const response = await ApiService.get('/api/jobs', { params: filters });
        return response.data;
    },

    // Get single job by ID
    getJobById: async (jobId) => {
        const response = await ApiService.get(`/api/jobs/${jobId}`);
        return response.data;
    },

    // Create new job posting
    createJob: async (jobData) => {
        const response = await ApiService.post('/api/jobs', jobData);
        return response.data;
    },

    // Update job posting
    updateJob: async (jobId, jobData) => {
        const response = await ApiService.put(`/api/jobs/${jobId}`, jobData);
        return response.data;
    },

    // Delete job posting
    deleteJob: async (jobId) => {
        const response = await ApiService.delete(`/api/jobs/${jobId}`);
        return response.data;
    },

    // ==================== Job Search & Discovery ====================

    searchJobs: async (searchParams) => {
        const response = await ApiService.get('/api/jobs', { params: searchParams });
        return response.data;
    },

    // Get recommended jobs for the authenticated jobseeker
    getRecommendedJobs: async () => {
        const response = await ApiService.get('/api/jobs/recommended');
        return response.data;
    },

    // Get similar jobs — uses recommended endpoint
    getSimilarJobs: async (jobId) => {
        try {
            const response = await ApiService.get('/api/jobs/recommended');
            const jobs = response.data?.items || response.data || [];
            return jobs.filter(j => j.id !== jobId).slice(0, 5);
        } catch (error) {
            return [];
        }
    },

    // Get jobs by category
    getJobsByCategory: async (categoryId) => {
        try {
            const response = await ApiService.get('/api/jobs', { params: { categoryId } });
            return response.data?.items || response.data || [];
        } catch (error) {
            return [];
        }
    },

    // ==================== Job Applications ====================

    // Apply to job
    applyToJob: async (jobId, applicationData) => {
        let payload = applicationData;

        if (applicationData instanceof FormData) {
            let cvUrl = '';
            const resume = applicationData.get('resume');

            if (resume) {
                const resumeData = new FormData();
                resumeData.append('file', resume);
                resumeData.append('bucketName', 'resumes');

                const uploadResponse = await ApiService.upload('/api/Files/upload', resumeData);
                cvUrl = uploadResponse.data?.url || uploadResponse.data?.Url || '';
            }

            payload = {
                coverLetter: applicationData.get('coverLetter') || '',
                cvUrl,
            };
        }

        const response = await ApiService.post(`/api/jobs/${jobId}/apply`, payload);
        return response.data;
    },

    // Get my applications (jobseeker)
    getMyApplications: async () => {
        const response = await ApiService.get('/api/jobs/applications/my');
        return response.data;
    },

    // Get applications for a job (company)
    getJobApplications: async (jobId) => {
        const response = await ApiService.get(`/api/jobs/${jobId}/applications`);
        return response.data;
    },

    // Get all applicants for the company's jobs
    getCompanyApplicants: async () => {
        const response = await ApiService.get('/api/jobs/applications/company');
        return response.data;
    },

    updateApplicationStatus: async (applicationId, status) => {
        const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : status;
        const response = await ApiService.put(
            `/api/jobs/applications/${applicationId}/status`,
            JSON.stringify(normalizedStatus),
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    },

    // Withdraw application
    withdrawApplication: async (applicationId) => {
        const response = await ApiService.delete(`/api/jobs/applications/${applicationId}`);
        return response.data;
    },

    // ==================== Saved Jobs / Bookmarks ====================

    // Save/Bookmark job
    saveJob: async (jobId) => {
        const response = await ApiService.post(`/api/jobs/${jobId}/save`);
        return response.data;
    },

    // Unsave job
    unsaveJob: async (jobId) => {
        const response = await ApiService.delete(`/api/jobs/${jobId}/save`);
        return response.data;
    },

    // Get saved jobs
    getSavedJobs: async () => {
        const response = await ApiService.get('/api/jobs/saved');
        return response.data;
    },

    // ==================== Company Job Management ====================

    getCompanyJobs: async (companyId = null) => {
        // Note: backend currently only supports fetching 'my-postings'
        const endpoint = '/api/jobs/my-postings';
        const response = await ApiService.get(endpoint);
        return response.data;
    },

    // Publish/Unpublish job
    toggleJobStatus: async (jobId, isPublished) => {
        // Backend expects [FromBody] bool isPublished (raw bool)
        const response = await ApiService.put(`/api/jobs/${jobId}/status`, isPublished, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
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
            return [];
        }
    },

    // Get job types
    getJobTypes: async () => {
        try {
            const response = await ApiService.get('/api/categories');
            const categories = response.data?.items || response.data || [];
            return categories.filter(c => c.type === 'job' || !c.type);
        } catch (error) {
            return [];
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
