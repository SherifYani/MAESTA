/**
 * @file aiAssistantService.js
 * @description AI Assistant services — verified against AiController.cs.
 * @author Sherif Talaat
 * @version 2.1.0
 * @date 2026-04-29
 *
 * @last-modified-by Antigravity (AI) — verified against AiController.cs
 * @last-modified-date 2026-04-29
 *
 * REAL ROUTES (AiController [Route("api/[controller]")]):
 *   POST   api/ai/chat                      → body: "prompt" (string)
 *   POST   api/ai/generate-job-description  → body: { title, requirements }
 *   POST   api/ai/analyze-resume            → body: "resumeText" (string)
 *   POST   api/ai/parse-resume              → body: "fileUrl" (string)
 *   POST   api/ai/match-resume-job          → body: { resumeText, jobId }
 *   GET    api/ai/recommend-jobs            → [Authorize]
 **/

import ApiService from './ApiService';

const aiAssistantService = {
    // Analyze resume text and extract skills/insights
    // Backend: POST api/ai/analyze-resume — body is a raw string (resumeText)
    analyzeResume: async (resumeText) => {
        const response = await ApiService.post('/api/ai/analyze-resume',
            JSON.stringify(resumeText),
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    },

    // Parse a resume from a MinIO/cloud file URL
    // Backend: POST api/ai/parse-resume — body is a raw string (fileUrl)
    parseResume: async (fileUrl) => {
        const response = await ApiService.post('/api/ai/parse-resume',
            JSON.stringify(fileUrl),
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    },

    // Get AI job recommendations for the current authenticated user
    // Backend: GET api/ai/recommend-jobs
    getJobRecommendations: async () => {
        const response = await ApiService.get('/api/ai/recommend-jobs');
        return response.data;
    },

    // Match a resume text against a specific job
    // Backend: POST api/ai/match-resume-job — body: { resumeText, jobId }
    matchResumeToJob: async (resumeText, jobId) => {
        const response = await ApiService.post('/api/ai/match-resume-job', { resumeText, jobId });
        return response.data;
    },

    // Get candidate recommendations for job
    getCandidateRecommendations: async (jobId) => {
        try {
            // MOCKED: Not implemented in backend yet.
            console.warn("getCandidateRecommendations is mocked");
            return [];
            // const response = await ApiService.get(`/api/ai/candidate-recommendations/${jobId}`);
            // return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Generate cover letter
    generateCoverLetter: async (jobId, profileData) => {
        try {
            // MOCKED: Not implemented in backend yet.
            console.warn("generateCoverLetter is mocked");
            return { coverLetter: "Dear Hiring Manager, ..." };
            // const response = await ApiService.post('/api/ai/generate-cover-letter', { jobId, profileData });
            // return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Improve resume text
    improveResumeText: async (text, section) => {
        try {
            // MOCKED: Not implemented in backend yet.
            console.warn("improveResumeText is mocked");
            return { improvedText: text };
            // const response = await ApiService.post('/api/ai/improve-text', { text, section });
            // return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get salary insights
    getSalaryInsights: async (jobTitle, location, experience) => {
        try {
            // MOCKED: Not implemented in backend yet.
            console.warn("getSalaryInsights is mocked");
            return { estimatedSalary: "$80,000 - $100,000" };
            // const response = await ApiService.post('/api/ai/salary-insights', { jobTitle, location, experience });
            // return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Send a message to the AI chat assistant
    // Backend: POST api/ai/chat — body is a raw string prompt
    sendChatMessage: async (message, history = []) => {
        const response = await ApiService.post('/api/ai/chat',
            JSON.stringify(message),
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    },

    // Get skill gap analysis
    getSkillGapAnalysis: async (currentSkills, targetJob) => {
        try {
            // MOCKED: Not implemented in backend yet.
            console.warn("getSkillGapAnalysis is mocked");
            return { missingSkills: [] };
            // const response = await ApiService.post('/api/ai/skill-gap', { currentSkills, targetJob });
            // return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Generate job description
    generateJobDescription: async (jobDetails) => {
        try {
            const response = await ApiService.post('/api/ai/generate-job-description', jobDetails);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Interview preparation tips
    getInterviewTips: async (jobId) => {
        try {
            // MOCKED: Not implemented in backend yet.
            console.warn("getInterviewTips is mocked");
            return { tips: [] };
            // const response = await ApiService.get(`/api/ai/interview-tips/${jobId}`);
            // return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default aiAssistantService;
