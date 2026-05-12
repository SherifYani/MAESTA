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
// Mock data retained only for categories/types/levels until backend provides those endpoints
import { jobCategories, jobTypes, experienceLevels } from '../pages/jobs/config/jobsMockData';

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

    // Get similar jobs
    getSimilarJobs: async (jobId) => {
        // MOCKED: Not implemented in backend yet.
        console.warn("getSimilarJobs is mocked");
        return [];
        // const response = await ApiService.get(`/api/jobs/${jobId}/similar`);
        // return response.data;
    },

    // Get jobs by category
    getJobsByCategory: async (categoryId) => {
        // MOCKED: Not implemented in backend yet.
        console.warn("getJobsByCategory is mocked");
        return [];
        // const response = await ApiService.get(`/api/jobs/category/${categoryId}`);
        // return response.data;
    },

    // ==================== Job Applications ====================

    // Apply to job
    applyToJob: async (jobId, applicationData) => {
        const response = await ApiService.post(`/api/jobs/${jobId}/apply`, applicationData);
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
        const response = await ApiService.put(`/api/jobs/applications/${applicationId}/status`, { status });
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
        // MOCKED: Not implemented in backend yet.
        console.warn("getJobStatistics is mocked");
        return { views: 0, applications: 0, active: true };
        // const response = await ApiService.get(`/api/jobs/${jobId}/statistics`);
        // return response.data;
    },

    // ==================== Categories & Filters ====================

    // Get job categories
    // Get job categories
    getCategories: async () => {
        return jobCategories;
    },

    // Get job types
    // Get job types
    getJobTypes: async () => {
        return jobTypes;
    },

    // Get experience levels
    // Get experience levels
    getExperienceLevels: async () => {
        return experienceLevels;
    },
};

export default jobService;
