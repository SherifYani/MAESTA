/**
 * @file aiAssistantService.js
 * @description AI Assistant API service connected to MAESTA chatbot Flask API and .NET AI endpoints.
 *              Uses named exports for consistency.
 * @author Antigravity (AI)
 * @date 2026-05-09
 */
import ApiService from './ApiService';
import jobService from './jobService';

const getChatbotApiUrl = () => (
    localStorage.getItem('maesta_chatbot_api_url')
    || process.env.REACT_APP_CHATBOT_API_URL
    || 'http://localhost:5000'
).replace(/\/$/, '');

const getChatbotApiKey = () => (
    localStorage.getItem('maesta_chatbot_api_key')
    || process.env.REACT_APP_CHATBOT_API_KEY
    || ''
);

const cleanAssistantText = (text = '') => text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/^[\s\S]*?<\/think>/i, '')
    .replace(/^[\s\S]*?<\/thinking>/i, '')
    .replace(/<\/?think(?:ing)?>/gi, '')
    .trim();

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

export const sendChatMessage = async (question, sessionId, options = {}) => {
    const apiKey = getChatbotApiKey();
    if (!apiKey) {
        throw new Error('Chatbot API key is missing. Set REACT_APP_CHATBOT_API_KEY or maesta_chatbot_api_key.');
    }

    const response = await fetch(`${getChatbotApiUrl()}/api/v1/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey,
        },
        body: JSON.stringify({
            question,
            session_id: sessionId,
            use_rag: options.useRag ?? true,
        }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || data.error || 'Chatbot request failed');
    }

    const answer = cleanAssistantText(data.answer || '');

    return {
        answer,
        response: answer,
        conversationId: data.session_id || sessionId,
        sourceType: data.source_type,
        sources: data.sources || [],
        ragEnabled: data.rag_enabled,
        fromDocuments: data.from_documents,
        note: data.note,
    };
};

export const getChatbotHealth = async () => {
    const response = await fetch(`${getChatbotApiUrl()}/api/v1/health`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || 'Chatbot health check failed');
    return data;
};

/**
 * Generate job description.
 * Backend: POST api/Ai/generate-job-description
 */
export const generateJobDescription = async (title, requirements = '') => {
    const response = await ApiService.post('/api/Ai/generate-job-description', { title, requirements });
    return response.data;
};

/**
 * Analyze resume text.
 * Backend: POST api/Ai/analyze-resume
 */
export const analyzeResume = async (resumeText) => {
    const text = typeof resumeText === 'string' ? resumeText : JSON.stringify(resumeText);
    const response = await ApiService.post('/api/Ai/analyze-resume', JSON.stringify(text), {
        headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
};

export const improveText = async (text, tone = 'professional') => {
    const response = await chat(`Improve this text in a ${tone} tone:\n\n${text}`);
    return { improvedText: response.response || response };
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
    improveText,
    parseResume,
    matchResumeWithJob,
    recommendJobs,
    getJobRecommendations,
    sendChatMessage,
    getChatbotHealth
};

export default aiAssistantService;
