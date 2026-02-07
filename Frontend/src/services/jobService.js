/**
 * @file jobService.js
 * @description Job management services - handles job posting, searching, applications, and bookmarks
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 05-02-2026
**/

import ApiService from './ApiService';
import { jobsData, jobCategories, jobTypes, experienceLevels } from '../pages/jobs/config/jobsMockData';

const jobService = {
    // ==================== Job CRUD Operations ====================

    // Get all jobs with filters
    // Get all jobs with filters
    getJobs: async (filters = {}) => {
        // MOCK DATA RETURN
        return {
            jobs: jobsData,
            total: jobsData.length,
            page: 1,
            totalPages: 1
        };
    },

    // Get single job by ID
    // Get single job by ID
    getJobById: async (jobId) => {
        // MOCK DATA RETURN
        const job = jobsData.find(j => j._id === jobId || j.id === jobId) || jobsData[0];
        return job;
    },

    // Create new job posting
    createJob: async (jobData) => {
        try {
            const response = await ApiService.post('/api/jobs', jobData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update job posting
    updateJob: async (jobId, jobData) => {
        try {
            const response = await ApiService.put(`/api/jobs/${jobId}`, jobData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete job posting
    deleteJob: async (jobId) => {
        try {
            const response = await ApiService.delete(`/api/jobs/${jobId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Job Search & Discovery ====================

    // Search jobs
    // Search jobs
    // Search jobs
    searchJobs: async (searchParams) => {
        // MOCK DATA RETURN WITH CLIENT-SIDE FILTERING
        let filteredJobs = [...jobsData];
        const {
            keyword,
            location,
            jobType,
            experienceLevel,
            skills,
            salaryRange,
            datePosted,
            page = 1,
            limit = 10
        } = searchParams;

        // Helper to parse salary string into average monthly/yearly number for rough comparison
        const parseSalary = (salaryStr) => {
            if (!salaryStr) return 0;
            // Extract numbers
            const numbers = salaryStr.match(/\d+(?:,\d+)?/g);
            if (!numbers || numbers.length === 0) return 0;

            // Convert to clean numbers (remove commas)
            const cleanNumbers = numbers.map(n => parseInt(n.replace(/,/g, ''), 10));

            // Calculate average
            const avg = cleanNumbers.reduce((a, b) => a + b, 0) / cleanNumbers.length;

            // Adjust for currency (very rough approximation if needed, but assuming same currency for filter)
            // or just use raw numbers. The Mock data has mixed currencies but filters usually assume one.
            // For this demo, we'll just check if the range overlaps.
            return { min: Math.min(...cleanNumbers), max: Math.max(...cleanNumbers) };
        };

        if (keyword) {
            const lowerKeyword = keyword.toLowerCase();
            filteredJobs = filteredJobs.filter(job =>
                job.title.toLowerCase().includes(lowerKeyword) ||
                job.description.toLowerCase().includes(lowerKeyword) ||
                job.company.name.toLowerCase().includes(lowerKeyword) ||
                job.skills.some(skill => skill.toLowerCase().includes(lowerKeyword))
            );
        }

        if (location) {
            const lowerLocation = location.toLowerCase();
            filteredJobs = filteredJobs.filter(job =>
                job.location.toLowerCase().includes(lowerLocation) ||
                job.company.location.toLowerCase().includes(lowerLocation)
            );
        }

        if (jobType) {
            // Normalize: "Full Time" -> "full-time"
            const normalize = str => str.toLowerCase().replace(/ /g, '-').replace('full-time', 'full-time');
            // Mock data uses "Full-time", Filter uses "Full Time"
            filteredJobs = filteredJobs.filter(job =>
                normalize(job.type) === normalize(jobType)
            );
        }

        if (experienceLevel) {
            filteredJobs = filteredJobs.filter(job =>
                job.experienceLevel.toLowerCase().includes(experienceLevel.toLowerCase().split(' ')[0])
            );
        }

        if (skills && skills.length > 0) {
            filteredJobs = filteredJobs.filter(job =>
                skills.every(filterSkill =>
                    job.skills.some(jobSkill => jobSkill.toLowerCase() === filterSkill.toLowerCase())
                )
            );
        }

        if (datePosted && datePosted !== 'all') {
            const now = new Date();
            const jobDate = new Date();

            filteredJobs = filteredJobs.filter(job => {
                const posted = new Date(job.postedDate);
                const diffTime = Math.abs(now - posted);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (datePosted === 'today') return diffDays <= 1;
                if (datePosted === 'week') return diffDays <= 7;
                if (datePosted === 'month') return diffDays <= 30;
                return true;
            });
        }

        if (salaryRange && (salaryRange.min || salaryRange.max)) {
            filteredJobs = filteredJobs.filter(job => {
                const jobSalary = parseSalary(job.salary);
                const minFilter = parseInt(salaryRange.min) || 0;
                const maxFilter = parseInt(salaryRange.max) || Infinity;

                // Check for overlap
                return jobSalary.max >= minFilter && jobSalary.min <= maxFilter;
            });
        }

        // Pagination
        const total = filteredJobs.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const paginatedJobs = filteredJobs.slice(startIndex, startIndex + limit);

        return {
            data: {
                jobs: paginatedJobs,
                total,
                totalPages
            }
        };
    },

    // Get recommended jobs for jobseeker
    // Get recommended jobs for jobseeker
    getRecommendedJobs: async () => {
        return jobsData.slice(0, 3);
    },

    // Get similar jobs
    getSimilarJobs: async (jobId) => {
        try {
            const response = await ApiService.get(`/api/jobs/${jobId}/similar`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get jobs by category
    getJobsByCategory: async (categoryId) => {
        try {
            const response = await ApiService.get(`/api/jobs/category/${categoryId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Job Applications ====================

    // Apply to job
    applyToJob: async (jobId, applicationData) => {
        try {
            const response = await ApiService.post(`/api/jobs/${jobId}/apply`, applicationData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get my applications (jobseeker)
    getMyApplications: async () => {
        try {
            const response = await ApiService.get('/api/jobs/applications/my');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get applications for a job (company)
    getJobApplications: async (jobId) => {
        try {
            const response = await ApiService.get(`/api/jobs/${jobId}/applications`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update application status
    updateApplicationStatus: async (applicationId, status) => {
        try {
            const response = await ApiService.put(`/api/applications/${applicationId}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Withdraw application
    withdrawApplication: async (applicationId) => {
        try {
            const response = await ApiService.delete(`/api/applications/${applicationId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Saved Jobs / Bookmarks ====================

    // Save/Bookmark job
    saveJob: async (jobId) => {
        try {
            const response = await ApiService.post(`/api/jobs/${jobId}/save`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Unsave job
    unsaveJob: async (jobId) => {
        try {
            const response = await ApiService.delete(`/api/jobs/${jobId}/save`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get saved jobs
    getSavedJobs: async () => {
        try {
            const response = await ApiService.get('/api/jobs/saved');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // ==================== Company Job Management ====================

    // Get company's posted jobs
    getCompanyJobs: async (companyId = null) => {
        try {
            const endpoint = companyId
                ? `/api/companies/${companyId}/jobs`
                : '/api/jobs/my-postings';
            const response = await ApiService.get(endpoint);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Publish/Unpublish job
    toggleJobStatus: async (jobId, isPublished) => {
        try {
            const response = await ApiService.put(`/api/jobs/${jobId}/status`, { isPublished });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get job statistics
    getJobStatistics: async (jobId) => {
        try {
            const response = await ApiService.get(`/api/jobs/${jobId}/statistics`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
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
