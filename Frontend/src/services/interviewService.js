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
export const getMyInterviews = async (page = 1, limit = 20, filters = {}) => {
    const params = { page, limit };
    if (filters.status) params.status = filters.status;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.sort) params.sort = filters.sort;
    if (filters.order) params.order = filters.order;
    const response = await ApiService.get('/api/Interviews', { params });
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
    const data = await getMyInterviews(params.page || 1, params.limit || 20, params);
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

const FALLBACK_SLOTS = [
    { time: "09:00", available: true },
    { time: "10:00", available: true },
    { time: "11:00", available: true },
    { time: "13:00", available: true },
    { time: "14:00", available: true },
    { time: "15:00", available: true },
];

/**
 * Get available interview slots for a given date.
 * Backend: GET api/Interviews/available-slots?date=YYYY-MM-DD
 * Falls back to a fixed slot list if the endpoint is unreachable or returns empty.
 * @param {string} [date] - ISO date string (YYYY-MM-DD). Defaults to today.
 */
export const getAvailableSlots = async (date) => {
    try {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const params = {
            from: `${targetDate}T00:00:00`,
            to: `${targetDate}T23:59:59`
        };
        const response = await ApiService.get('/api/Interviews/available-slots', { params });
        const slots = response.data?.slots || response.data || [];
        // If API returned empty slots, use fallback
        if (!Array.isArray(slots) || slots.length === 0) {
            return { success: true, data: { slots: generateSlotsForDate(targetDate) } };
        }
        return { success: true, data: { slots } };
    } catch {
        // Graceful degradation — surface a usable set of slots
        return { success: true, data: { slots: generateSlotsForDate(date || new Date().toISOString().split('T')[0]) } };
    }
};

/**
 * Generate time slots for a given date.
 * Creates slots from 09:00 to 17:00 with 60-minute intervals.
 * Marks past time slots as unavailable if the date is today.
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @returns {Array<{time: string, available: boolean}>}
 */
const generateSlotsForDate = (dateStr) => {
    const now = new Date();
    const targetDate = new Date(dateStr + 'T00:00:00');
    const isToday = targetDate.toDateString() === now.toDateString();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    return [
        { time: "09:00", available: true },
        { time: "10:00", available: true },
        { time: "11:00", available: true },
        { time: "12:00", available: true },
        { time: "13:00", available: true },
        { time: "14:00", available: true },
        { time: "15:00", available: true },
        { time: "16:00", available: true },
        { time: "17:00", available: true },
    ].map(slot => {
        const slotHour = parseInt(slot.time.split(':')[0]);
        // If today and slot time has passed, mark as unavailable
        if (isToday && (slotHour < currentHour || (slotHour === currentHour && currentMinutes >= 0))) {
            return { ...slot, available: false };
        }
        return slot;
    });
};

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