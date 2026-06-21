/**
 * @file aiAssistantService.js
 * @description AI Assistant API service connected to AiController.cs.
 *              Uses named exports for consistency.
 * @author Antigravity (AI)
 * @date 2026-05-09
 */
import ApiService from './ApiService';
import jobService from './jobService';

/**
 * General chat with AI assistant.
 * Backend: POST api/Ai/chat
 */
export const chat = async (prompt) => {
    const response = await ApiService.post('/api/Ai/chat', JSON.stringify(prompt), {
        headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
};

/**
 * Generate job description.
 * Backend: POST api/Ai/generate-job-description
 */
export const generateJobDescription = async (title, requirements) => {
    const response = await ApiService.post('/api/Ai/generate-job-description', { title, requirements });
    return response.data;
};

/**
 * Analyze resume text.
 * Backend: POST api/Ai/analyze-resume
 */
export const analyzeResume = async (resumeText) => {
    const response = await ApiService.post('/api/Ai/analyze-resume', JSON.stringify(resumeText), {
        headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
};

/**
 * Parse resume from file URL.
 * Backend: POST api/Ai/parse-resume
 */
export const parseResume = async (fileUrl) => {
    const response = await ApiService.post('/api/Ai/parse-resume', JSON.stringify(fileUrl), {
        headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
};

/**
 * Match resume against a job.
 * Backend: POST api/Ai/match-resume-job
 */
export const matchResumeWithJob = async (resumeText, jobId) => {
    const response = await ApiService.post('/api/Ai/match-resume-job', { resumeText, jobId });
    return response.data;
};

/**
 * Recommend jobs for the current user.
 * Backend: GET api/Ai/recommend-jobs
 */
export const recommendJobs = async () => {
    const response = await ApiService.get('/api/Ai/recommend-jobs');
    return response.data;
};

export const getJobRecommendations = async ({ query = '', type = 'jobs', filters = {} } = {}) => {
    if (type !== 'jobs') {
        throw new Error('Candidate smart search is not supported by the current AI API.');
    }

    const response = await jobService.searchJobs({
        keyword: query,
        location: filters.location || undefined,
        experienceLevel: filters.experienceLevel || undefined,
        page: 1,
        limit: 20,
    });

    const jobs = response?.jobs || response?.items || response || [];
    return jobs.map((job) => ({
        id: job.jobId || job.id,
        title: job.title,
        company: job.companyName || job.company || 'Company',
        location: job.location || 'Remote',
        salary: job.salaryMin || job.salaryMax
            ? `${job.salaryMin || 0} - ${job.salaryMax || ''} ${job.currency || ''}`.trim()
            : 'Not specified',
        skills: job.skills || job.tags || [],
        posted: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '',
        matchScore: Math.round(job.matchScore || 0),
    }));
};

const aiAssistantService = {
    chat,
    generateJobDescription,
    analyzeResume,
    parseResume,
    matchResumeWithJob,
    recommendJobs,
    getJobRecommendations
};

export default aiAssistantService;
