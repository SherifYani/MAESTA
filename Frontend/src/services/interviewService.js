/**
 * @file interviewService.js
 * @description Interview scheduling API service with mock data.
 * @author Sherif Talaat
 * @version 1.0.0
 * @date 2026-05-04
 */
import ApiService from './ApiService';

const USE_MOCK_DATA = true;

const mockApplicant = (id) => ({
    id,
    userId: `user_${id}`,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    profilePicture: null,
    appliedJobs: [
        { jobId: 'job_1', jobTitle: 'Senior Developer', appliedAt: '2026-05-01T10:00:00Z', status: 'shortlisted' },
    ],
    interviewHistory: [],
});

const mockJob = (jobId) => ({
    id: jobId,
    title: 'Senior Developer',
    company: 'Tech Corp',
    location: 'Remote',
    interviewDuration: 60,
});

const mockAvailableSlots = (date) => ({
    success: true,
    data: {
        date,
        slots: [
            { time: '09:00', available: true },
            { time: '10:00', available: true },
            { time: '11:00', available: false },
            { time: '13:00', available: true },
            { time: '14:00', available: true },
            { time: '15:00', available: false },
        ],
    },
});

export const getApplicant = async (applicantId) => {
    if (USE_MOCK_DATA) return { success: true, data: mockApplicant(applicantId) };
    const response = await ApiService.get(`/api/applicants/${applicantId}`);
    return response.data;
};

export const getJob = async (jobId) => {
    if (USE_MOCK_DATA) return { success: true, data: mockJob(jobId) };
    const response = await ApiService.get(`/api/jobs/${jobId}`);
    return response.data;
};

export const getAvailableSlots = async (date, duration) => {
    if (USE_MOCK_DATA) return mockAvailableSlots(date);
    const response = await ApiService.get('/api/interviews/available-slots', { params: { date, duration } });
    return response.data;
};

export const scheduleInterview = async (data) => {
    if (USE_MOCK_DATA) {
        return {
            success: true,
            data: {
                interviewId: `interview_${Date.now()}`,
                ...data,
                status: 'scheduled',
                createdAt: new Date().toISOString(),
            },
        };
    }
    const response = await ApiService.post('/api/interviews/schedule', data);
    return response.data;
};

export const getCompanyInterviews = async (params) => {
    if (USE_MOCK_DATA) {
        return {
            success: true,
            data: {
                interviews: [
                    {
                        id: 'interview_1',
                        applicantId: 'app_1',
                        applicantName: 'John Doe',
                        jobId: 'job_1',
                        jobTitle: 'Senior Developer',
                        scheduledDate: '2026-05-10',
                        scheduledTime: '10:00',
                        interviewType: 'video',
                        location: 'https://zoom.us/j/123456789',
                        status: 'scheduled',
                        notes: 'Technical interview',
                        createdAt: '2026-05-04T10:00:00Z',
                    },
                ],
                pagination: { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 20 },
            },
        };
    }
    const response = await ApiService.get('/api/company/interviews', { params });
    return response.data;
};

export const getInterviewDetails = async (interviewId) => {
    if (USE_MOCK_DATA) {
        return { success: true, data: {} };
    }
    const response = await ApiService.get(`/api/company/interviews/${interviewId}`);
    return response.data;
};

export const rescheduleInterview = async (interviewId, newDate, newTime, reason) => {
    if (USE_MOCK_DATA) {
        return { success: true, data: { interviewId, scheduledDate: newDate, scheduledTime: newTime, status: 'rescheduled', updatedAt: new Date().toISOString() } };
    }
    const response = await ApiService.put(`/api/company/interviews/${interviewId}/reschedule`, { scheduledDate: newDate, scheduledTime: newTime, reason });
    return response.data;
};

export const cancelInterview = async (interviewId, reason) => {
    if (USE_MOCK_DATA) {
        return { success: true, data: { interviewId, status: 'cancelled', cancelledAt: new Date().toISOString(), reason } };
    }
    const response = await ApiService.put(`/api/company/interviews/${interviewId}/cancel`, { reason });
    return response.data;
};

export const completeInterview = async (interviewId, outcome, notes) => {
    if (USE_MOCK_DATA) {
        return { success: true, data: { interviewId, status: 'completed', outcome, completedAt: new Date().toISOString() } };
    }
    const response = await ApiService.put(`/api/company/interviews/${interviewId}/complete`, { outcome, notes });
    return response.data;
};