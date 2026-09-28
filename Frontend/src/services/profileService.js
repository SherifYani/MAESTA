/**
 * @file profileService.js
 * @description Profile services - handles user profiles for all roles (jobseeker, freelancer, company, client).
 *              Falls back to mock data when the backend is unavailable.
 * @author Sherif Talaat
 * @version 1.1.0
 * @date 05-02-2026
**/

import ApiService from './ApiService';
import { isNetworkError, MOCK_PROFILE, MOCK_SETTINGS } from './mockData';

const profileService = {
    // ==================== General Profile Operations ====================

    // Get current user profile
    getMyProfile: async () => {
        try {
            const response = await ApiService.get('/api/Profile/me');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] getMyProfile — mock fallback');
                return MOCK_PROFILE;
            }
            throw error;
        }
    },

    // Get profile by user ID
    getProfileById: async (userId) => {
        try {
            const response = await ApiService.get(`/api/Profile/${userId}`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] getProfileById — mock fallback');
                return MOCK_PROFILE;
            }
            throw error;
        }
    },

    // Update profile
    updateProfile: async (profileData) => {
        try {
            const response = await ApiService.put('/api/Profile/me', profileData);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] updateProfile — mock fallback');
                return { ...MOCK_PROFILE, ...profileData };
            }
            throw error;
        }
    },

    // Upload profile picture
    uploadProfilePicture: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bucketName', 'avatars');
            const response = await ApiService.post('/api/Files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] uploadProfilePicture — mock fallback');
                return { url: MOCK_PROFILE.avatarUrl };
            }
            throw error;
        }
    },

    // Delete profile picture
    deleteProfilePicture: async (fileName) => {
        try {
            if (!fileName) throw new Error("fileName is required to delete profile picture");
            const response = await ApiService.delete(`/api/Files/avatars/${fileName}`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] deleteProfilePicture — mock fallback');
                return { message: 'Profile picture deleted (mock).' };
            }
            throw error;
        }
    },

    // ==================== Jobseeker Profile ====================

    // Get jobseeker profile
    getJobseekerProfile: async (userId = null) => {
        try {
            const endpoint = userId ? `/api/JobSeeker/${userId}` : '/api/JobSeeker/me';
            const response = await ApiService.get(endpoint);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] getJobseekerProfile — mock fallback');
                return MOCK_PROFILE;
            }
            throw error;
        }
    },

    // Update jobseeker profile
    updateJobseekerProfile: async (profileData) => {
        try {
            const response = await ApiService.put('/api/JobSeeker/me', profileData);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] updateJobseekerProfile — mock fallback');
                return { ...MOCK_PROFILE, ...profileData };
            }
            throw error;
        }
    },

    // Get jobseeker skills
    getJobseekerSkills: async () => {
        try {
            const response = await ApiService.get('/api/JobSeeker/skills');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] getJobseekerSkills — mock fallback');
                return MOCK_PROFILE.skills;
            }
            throw error;
        }
    },

    // Get jobseeker experiences
    getJobseekerExperiences: async () => {
        try {
            const response = await ApiService.get('/api/JobSeeker/experience');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] getJobseekerExperiences — mock fallback');
                return MOCK_PROFILE.experiences;
            }
            throw error;
        }
    },

    // Get jobseeker education
    getJobseekerEducation: async () => {
        try {
            const response = await ApiService.get('/api/JobSeeker/education');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] getJobseekerEducation — mock fallback');
                return MOCK_PROFILE.education;
            }
            throw error;
        }
    },

    uploadResume: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bucketName', 'resumes');
            const response = await ApiService.post('/api/Files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] uploadResume — mock fallback');
                return { url: 'https://example.com/mock-resume.pdf' };
            }
            throw error;
        }
    },

    // Add work experience
    addWorkExperience: async (experienceData) => {
        try {
            const response = await ApiService.post('/api/JobSeeker/experience', experienceData);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] addWorkExperience — mock fallback');
                return { id: `exp-mock-${Date.now()}`, ...experienceData };
            }
            throw error;
        }
    },

    // Update work experience
    updateWorkExperience: async (experienceId, experienceData) => {
        try {
            const response = await ApiService.put(`/api/JobSeeker/experience/${experienceId}`, experienceData);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] updateWorkExperience — mock fallback');
                return { id: experienceId, ...experienceData };
            }
            throw error;
        }
    },

    // Delete work experience
    deleteWorkExperience: async (experienceId) => {
        try {
            const response = await ApiService.delete(`/api/JobSeeker/experience/${experienceId}`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] deleteWorkExperience — mock fallback');
                return { message: 'Experience deleted (mock).' };
            }
            throw error;
        }
    },

    // Add education
    addEducation: async (educationData) => {
        try {
            const response = await ApiService.post('/api/JobSeeker/education', educationData);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] addEducation — mock fallback');
                return { id: `edu-mock-${Date.now()}`, ...educationData };
            }
            throw error;
        }
    },

    // Update education
    updateEducation: async (educationId, educationData) => {
        try {
            const response = await ApiService.put(`/api/JobSeeker/education/${educationId}`, educationData);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] updateEducation — mock fallback');
                return { id: educationId, ...educationData };
            }
            throw error;
        }
    },

    // Delete education
    deleteEducation: async (educationId) => {
        try {
            const response = await ApiService.delete(`/api/JobSeeker/education/${educationId}`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] deleteEducation — mock fallback');
                return { message: 'Education deleted (mock).' };
            }
            throw error;
        }
    },

    // Update skills
    updateSkills: async (skills) => {
        try {
            const response = await ApiService.put('/api/JobSeeker/skills', { skills });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] updateSkills — mock fallback');
                return { skills };
            }
            throw error;
        }
    },

    // ==================== Freelancer Profile ====================

    // Get freelancer profile
    getFreelancerProfile: async (userId = null) => {
        try {
            const endpoint = userId ? `/api/freelancers/${userId}` : '/api/freelancers/me';
            const response = await ApiService.get(endpoint);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] getFreelancerProfile — mock fallback');
                return MOCK_PROFILE;
            }
            throw error;
        }
    },

    // Update freelancer profile
    updateFreelancerProfile: async (profileData) => {
        try {
            const response = await ApiService.put('/api/freelancers/me', profileData);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] updateFreelancerProfile — mock fallback');
                return { ...MOCK_PROFILE, ...profileData };
            }
            throw error;
        }
    },

    // Add portfolio item
    addPortfolioItem: async (portfolioData) => {
        try {
            const response = await ApiService.post('/api/freelancers/portfolio', portfolioData);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] addPortfolioItem — mock fallback');
                return { id: `port-mock-${Date.now()}`, ...portfolioData };
            }
            throw error;
        }
    },

    // Update portfolio item
    updatePortfolioItem: async (portfolioId, portfolioData) => {
        try {
            const response = await ApiService.put(`/api/freelancers/portfolio/${portfolioId}`, portfolioData);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] updatePortfolioItem — mock fallback');
                return { id: portfolioId, ...portfolioData };
            }
            throw error;
        }
    },

    // Delete portfolio item
    deletePortfolioItem: async (portfolioId) => {
        try {
            const response = await ApiService.delete(`/api/freelancers/portfolio/${portfolioId}`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] deletePortfolioItem — mock fallback');
                return { message: 'Portfolio item deleted (mock).' };
            }
            throw error;
        }
    },

    // Update hourly rate
    updateHourlyRate: async (hourlyRate) => {
        try {
            const profile = await profileService.getFreelancerProfile();
            const updatedProfile = { ...profile, hourlyRate };
            const response = await ApiService.put('/api/freelancers/me', updatedProfile);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] updateHourlyRate — mock fallback');
                return { ...MOCK_PROFILE, hourlyRate };
            }
            throw error;
        }
    },

    // ==================== Company Profile ====================

    // Get company profile
    getCompanyProfile: async (companyId = null) => {
        try {
            const endpoint = companyId ? `/api/Companies/${companyId}` : '/api/Companies/me';
            const response = await ApiService.get(endpoint);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] getCompanyProfile — mock fallback');
                return { ...MOCK_PROFILE, companyName: 'Demo Company', industry: 'Technology' };
            }
            throw error;
        }
    },

    // Update company profile
    updateCompanyProfile: async (profileData) => {
        try {
            const response = await ApiService.put('/api/Companies/me', profileData);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] updateCompanyProfile — mock fallback');
                return { ...MOCK_PROFILE, ...profileData };
            }
            throw error;
        }
    },

    // Upload company logo
    uploadCompanyLogo: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bucketName', 'avatars');
            const response = await ApiService.post('/api/Files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] uploadCompanyLogo — mock fallback');
                return { url: MOCK_PROFILE.avatarUrl };
            }
            throw error;
        }
    },

    // Add team member
    addTeamMember: async (memberData) => {
        try {
            const response = await ApiService.post('/api/Companies/team', memberData);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] addTeamMember — mock fallback');
                return { id: `member-mock-${Date.now()}`, ...memberData };
            }
            throw error;
        }
    },

    // Remove team member
    removeTeamMember: async (memberId) => {
        try {
            const response = await ApiService.delete(`/api/Companies/team/${memberId}`);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] removeTeamMember — mock fallback');
                return { message: 'Team member removed (mock).' };
            }
            throw error;
        }
    },

    // ==================== Client Profile ====================

    // Get client profile
    getClientProfile: async (clientId = null) => {
        try {
            if (clientId) throw new Error('Fetching clients by id is not supported by the current backend API.');
            const response = await ApiService.get('/api/clients/me');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] getClientProfile — mock fallback');
                return MOCK_PROFILE;
            }
            throw error;
        }
    },

    // Update client profile
    updateClientProfile: async (profileData) => {
        try {
            const response = await ApiService.put('/api/clients/me', profileData);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] updateClientProfile — mock fallback');
                return { ...MOCK_PROFILE, ...profileData };
            }
            throw error;
        }
    },

    // ==================== Profile Visibility & Settings ====================

    // Update profile visibility — maps to settings endpoint
    updateVisibility: async (isPublic) => {
        try {
            const response = await ApiService.put('/api/Profile/me/settings', { isProfilePublic: isPublic });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] updateVisibility — mock fallback');
                return { isProfilePublic: isPublic };
            }
            throw error;
        }
    },

    // Get user settings
    getUserSettings: async () => {
        try {
            const response = await ApiService.get('/api/Profile/me/settings');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] getUserSettings — mock fallback');
                return MOCK_SETTINGS;
            }
            throw error.response?.data || error.message;
        }
    },

    // Update user settings
    updateUserSettings: async (settings) => {
        try {
            const response = await ApiService.put('/api/Profile/me/settings', settings);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] updateUserSettings — mock fallback');
                return { ...MOCK_SETTINGS, ...settings };
            }
            throw error.response?.data || error.message;
        }
    },

    // Update notification preferences
    updateNotificationPreferences: async (preferences) => {
        try {
            const response = await ApiService.put('/api/Profile/me/settings', preferences);
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] updateNotificationPreferences — mock fallback');
                return { ...MOCK_SETTINGS, ...preferences };
            }
            throw error;
        }
    },

    // Get active account sessions
    getActiveSessions: async () => {
        try {
            const response = await ApiService.get('/api/Profile/sessions');
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] getActiveSessions — mock fallback');
                return [{ id: 'session-1', device: 'Chrome / Windows', current: true, lastActive: new Date().toISOString() }];
            }
            throw error.response?.data || error.message;
        }
    },

    // Delete account
    deleteAccount: async (password) => {
        try {
            const response = await ApiService.delete('/api/Profile/me', { data: { password } });
            return response.data;
        } catch (error) {
            if (isNetworkError(error)) {
                console.warn('[profileService] deleteAccount — mock fallback');
                return { message: 'Account deleted (mock).' };
            }
            throw error;
        }
    }
};

export default profileService;
