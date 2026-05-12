/**
 * @file interviewService.js
 * @description Interview scheduling API service connected to InterviewsController.cs.
 *              Uses named exports to match frontend component usage.
 * @author Antigravity (AI)
 * @date 2026-05-09
 */
import ApiService from './ApiService';

/**
 * Get my interviews (paginated).
 * Backend: GET api/Interviews
 */
export const getMyInterviews = async (page = 1, limit = 20) => {
    const response = await ApiService.get('/api/Interviews', { params: { page, limit } });
    return response.data;
};

/**
 * Get interview by ID.
 * Backend: GET api/Interviews/{id}
 */
export const getInterviewById = async (id) => {
    const response = await ApiService.get(`/api/Interviews/${id}`);
    return response.data;
};

/**
 * Schedule a new interview.
 * Backend: POST api/Interviews/schedule
 * @param {Object} data - { applicationId, scheduledAt, location, notes, interviewType }
 */
export const scheduleInterview = async (data) => {
    const response = await ApiService.post('/api/Interviews/schedule', data);
    return response.data;
};

/**
 * Update interview status.
 * Backend: PUT api/Interviews/{id}/status
 * @param {number} id
 * @param {Object} request - { status, notes }
 */
export const updateStatus = async (id, request) => {
    const response = await ApiService.put(`/api/Interviews/${id}/status`, request);
    return response.data;
};

/**
 * Reschedule interview.
 * Backend: PUT api/Interviews/{id}/reschedule
 * @param {number} id
 * @param {Object} request - { newScheduledAt, reason }
 */
export const rescheduleInterview = async (id, request) => {
    const response = await ApiService.put(`/api/Interviews/${id}/reschedule`, request);
    return response.data;
};

/**
 * Delete interview.
 * Backend: DELETE api/Interviews/{id}
 */
export const deleteInterview = async (id) => {
    const response = await ApiService.delete(`/api/Interviews/${id}`);
    return response.data;
};

// ─── Aliases & Missing endpoints (Placeholders to avoid compilation errors) ───

export const getCompanyInterviews = async (params) => getMyInterviews(params?.page, params?.limit);

export const cancelInterview = async (id, reason) => {
    return updateStatus(id, { status: 'cancelled', notes: reason });
};

export const getApplicant = async (applicantId) => {
    const response = await ApiService.get(`/api/JobSeeker/${applicantId}`);
    return response.data;
};

export const getJob = async (jobId) => {
    const response = await ApiService.get(`/api/jobs/${jobId}`);
    return response.data;
};

export const getAvailableSlots = async () => ({ success: true, data: { slots: [] } });

const interviewService = {
    getMyInterviews,
    getInterviewById,
    scheduleInterview,
    updateStatus,
    rescheduleInterview,
    deleteInterview,
    getCompanyInterviews,
    cancelInterview,
    getApplicant,
    getJob,
    getAvailableSlots
};

export default interviewService;