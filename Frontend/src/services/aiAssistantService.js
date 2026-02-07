/**
 * @file aiAssistantService.js
 * @description AI Assistant services - handles AI-powered features like resume analysis, job matching, and chatbot
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 05-02-2026
**/

import ApiService from './ApiService';
import { aiRecommendations, conversationHistory, resumeAnalysisResult } from '../pages/ai-assistant/config/aiMockData';

const aiAssistantService = {
    // Analyze resume and extract skills
    // Analyze resume and extract skills
    analyzeResume: async (resumeFile) => {
        // MOCK DATA RETURN
        return resumeAnalysisResult;
    },

    // Get job recommendations based on profile
    // Get job recommendations based on profile
    getJobRecommendations: async (profileData) => {
        // MOCK DATA RETURN
        // Return appropriate recommendations based on type (jobs or candidates)
        if (profileData && profileData.type === 'candidates') {
            return aiRecommendations.candidates;
        }
        return aiRecommendations.jobs;
    },

    // Get candidate recommendations for job
    getCandidateRecommendations: async (jobId) => {
        try {
            const response = await ApiService.get(`/api/ai/candidate-recommendations/${jobId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Generate cover letter
    generateCoverLetter: async (jobId, profileData) => {
        try {
            const response = await ApiService.post('/api/ai/generate-cover-letter', { jobId, profileData });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Improve resume text
    improveResumeText: async (text, section) => {
        try {
            const response = await ApiService.post('/api/ai/improve-text', { text, section });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get salary insights
    getSalaryInsights: async (jobTitle, location, experience) => {
        try {
            const response = await ApiService.post('/api/ai/salary-insights', { jobTitle, location, experience });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Chat with AI assistant
    // Chat with AI assistant
    sendChatMessage: async (message, history = []) => {
        // MOCK DATA RETURN
        return {
            id: Date.now(),
            sender: 'ai',
            text: `This is a mock response to: "${message}". I can help you find jobs, analyze candidates, or fix your resume.`,
            timestamp: new Date().toISOString()
        };
    },

    // Get skill gap analysis
    getSkillGapAnalysis: async (currentSkills, targetJob) => {
        try {
            const response = await ApiService.post('/api/ai/skill-gap', { currentSkills, targetJob });
            return response.data;
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
            const response = await ApiService.get(`/api/ai/interview-tips/${jobId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default aiAssistantService;
