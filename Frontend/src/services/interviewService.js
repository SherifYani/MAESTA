/**
 * @file interviewService.js
 * @description Interview scheduling API service connected to InterviewsController.cs.
 *              Uses named exports to match frontend component usage.
 * @author Antigravity (AI)
 * @date 2026-05-09
 */
import ApiService from './ApiService';

const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.items)) return value.items;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.interviews)) return value.interviews;
    return [];
};

const normalizeInterview = (interview) => {
    const scheduledAt = interview.scheduledAt || interview.ScheduledAt;
    const scheduledDate = scheduledAt ? new Date(scheduledAt).toISOString().split('T')[0] : '';
    const scheduledTime = scheduledAt ? new Date(scheduledAt).toTimeString().slice(0, 5) : '';

    return {
        ...interview,
        id: interview.interviewId || interview.id,
        applicantName: interview.jobSeekerName || interview.applicantName || 'Applicant',
        jobTitle: interview.title || interview.jobTitle || 'Interview',
        scheduledAt,
        scheduledDate,
        scheduledTime,
        interviewType: interview.meetingLink ? 'video' : interview.location ? 'in-person' : 'phone',
        location: interview.meetingLink || interview.location || '',
        status: (interview.status || 'scheduled').toLowerCase(),
        notes: interview.description || interview.notes || '',
    };
};

const normalizePagedInterviews = (data) => {
    const interviews = toArray(data).map(normalizeInterview);
    return {
        success: true,
        data: {
            interviews,
            pagination: {
                totalPages: data?.totalPages || data?.pagination?.totalPages || 1,
                totalItems: data?.total || data?.totalItems || interviews.length,
            },
        },
    };
};

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
 * @param {Object} data - { jobApplicationId, title, description, scheduledAt, durationMinutes, meetingLink, location }
 */
export const scheduleInterview = async (data) => {
    const response = await ApiService.post('/api/Interviews/schedule', data);
    return { success: true, data: normalizeInterview(response.data) };
};

/**
 * Update interview status.
 * Backend: PUT api/Interviews/{id}/status
 * @param {number} id
 * @param {Object} request - { status, reason }
 */
export const updateStatus = async (id, request) => {
    const response = await ApiService.put(`/api/Interviews/${id}/status`, request);
    return { success: true, data: normalizeInterview(response.data) };
};

/**
 * Reschedule interview.
 * Backend: PUT api/Interviews/{id}/reschedule
 * @param {number} id
 * @param {Object} request - { newScheduledAt, reason }
 */
export const rescheduleInterview = async (id, request) => {
    const response = await ApiService.put(`/api/Interviews/${id}/reschedule`, request);
    return { success: true, data: normalizeInterview(response.data) };
};

/**
 * Delete interview.
 * Backend: DELETE api/Interviews/{id}
 */
export const deleteInterview = async (id) => {
    await ApiService.delete(`/api/Interviews/${id}`);
    return { success: true };
};

export const getCompanyInterviews = async (params = {}) => {
    const data = await getMyInterviews(params.page || 1, params.limit || 20);
    return normalizePagedInterviews(data);
};

export const cancelInterview = async (id, reason) => {
    return updateStatus(id, { status: 'cancelled', reason });
};

export const getApplicant = async (applicantUserId) => {
    const response = await ApiService.get(`/api/JobSeeker/${applicantUserId}`);
    return { success: true, data: response.data };
};

export const getJob = async (jobId) => {
    const response = await ApiService.get(`/api/jobs/${jobId}`);
    return { success: true, data: response.data };
};

export const getAvailableSlots = async () => ({ 
    success: true, 
    data: { 
        slots: [
            { time: "09:00", available: true },
            { time: "10:00", available: true },
            { time: "11:00", available: true },
            { time: "13:00", available: true },
            { time: "14:00", available: true },
            { time: "15:00", available: true }
        ] 
    } 
});

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